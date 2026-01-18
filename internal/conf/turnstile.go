// Copyright 2025 ROC. All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

package conf

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type TurnstileVerifyRequest struct {
	Secret   string `json:"secret"`
	Response string `json:"response"`
	RemoteIP string `json:"remoteip,omitempty"`
}

type TurnstileVerifyResponse struct {
	Success     bool     `json:"success"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
	ErrorCodes  []string `json:"error-codes,omitempty"`
	Action      string   `json:"action,omitempty"`
	CData       string   `json:"cdata,omitempty"`
}

// VerifyTurnstile verifies the Turnstile token with Cloudflare
func VerifyTurnstile(token string, remoteIP string) (bool, error) {
	if TurnstileSetting == nil || !TurnstileSetting.Enabled {
		// If Turnstile is not configured or disabled, allow the request
		return true, nil
	}

	if token == "" {
		return false, fmt.Errorf("turnstile token is required")
	}

	reqBody := TurnstileVerifyRequest{
		Secret:   TurnstileSetting.SecretKey,
		Response: token,
		RemoteIP: remoteIP,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return false, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := http.Post(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return false, fmt.Errorf("failed to send verification request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, fmt.Errorf("failed to read response body: %w", err)
	}

	var verifyResp TurnstileVerifyResponse
	if err := json.Unmarshal(body, &verifyResp); err != nil {
		return false, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !verifyResp.Success {
		return false, fmt.Errorf("turnstile verification failed: %v", verifyResp.ErrorCodes)
	}

	return true, nil
}
