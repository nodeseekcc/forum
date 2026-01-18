// Copyright 2022 ROC. All rights reserved.
// Use of this source code is governed by a MIT style
// license that can be found in the LICENSE file.

//go:build !(slim && embed)
// +build !slim !embed

package statick

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rocboss/paopao-ce/web"
)

// RegisterWebStatick register web static assets route
func RegisterWebStatick(e *gin.Engine) {
	// Serve specific static files
	fs := web.NewFileSystem()
	staticHandler := http.FileServer(fs)
	
	// Serve static assets
	e.GET("/assets/*filepath", func(c *gin.Context) {
		staticHandler.ServeHTTP(c.Writer, c.Request)
	})
	
	// Serve specific files
	specificFiles := []string{"/favicon.ico", "/logo.png", "/sw.js", "/manifest.json"}
	for _, path := range specificFiles {
		e.GET(path, func(c *gin.Context) {
			staticHandler.ServeHTTP(c.Writer, c.Request)
		})
		e.HEAD(path, func(c *gin.Context) {
			staticHandler.ServeHTTP(c.Writer, c.Request)
		})
	}
	
	// Serve index.html for all other routes (SPA fallback)
	e.NoRoute(func(c *gin.Context) {
		// Check if it's an API request
		if len(c.Request.URL.Path) >= 4 && c.Request.URL.Path[:4] == "/v1/" {
			c.JSON(http.StatusNotFound, gin.H{
				"code": 404,
				"msg":  "API Not Found",
			})
			return
		}
		
		// Serve index.html for SPA routes
		c.Request.URL.Path = "/"
		staticHandler.ServeHTTP(c.Writer, c.Request)
	})
}
