# Cloudflare Turnstile 集成说明

## 1. 获取 Turnstile 密钥

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账号
3. 点击左侧菜单的 "Turnstile"
4. 点击 "Add Site" 创建新的站点
5. 填写域名（如：nodeseek.com 或 119.8.35.122）
6. 选择 Widget Mode（推荐 "Managed"）
7. 获取：
   - **Site Key** (公开密钥，用于前端)
   - **Secret Key** (私密密钥，用于后端验证)

## 2. 配置后端

编辑服务器上的 `config.yaml`，添加 Turnstile 配置：

```yaml
Turnstile:
  SiteKey: "你的_SITE_KEY"        # 从 Cloudflare 获取
  SecretKey: "你的_SECRET_KEY"    # 从 Cloudflare 获取
  Enabled: true                   # 启用 Turnstile 验证
```

## 3. 配置前端

编辑 `web/src/components/auth.vue`，将第 30 行和第 43 行的 `'YOUR_SITE_KEY'` 替换为你的实际 Site Key：

```typescript
sitekey: '你的_SITE_KEY',  // 替换这里
```

## 4. 编译和部署

```bash
# 进入前端目录
cd web
yarn build

# 返回项目根目录
cd ..

# 编译后端（包含嵌入的前端）
make build TAGS='embed migration'

# 部署到服务器
./deploy-quick.sh
```

## 5. 测试验证

1. 访问网站并点击登录/注册
2. 应该能看到 Cloudflare Turnstile 验证组件
3. 完成验证后才能提交登录/注册表单

## 注意事项

- 如果 `Enabled: false` 或未配置 Turnstile，系统会自动跳过验证（向后兼容）
- Site Key 是公开的，会暴露在前端代码中，这是正常的
- Secret Key 必须保密，只能在服务器端的 config.yaml 中使用
- 测试环境可以使用 Cloudflare 提供的测试密钥

## 测试密钥（仅用于开发测试）

Cloudflare 提供了测试密钥，可以在开发环境使用：

- **Site Key**: `1x00000000000000000000AA`
- **Secret Key**: `1x0000000000000000000000000000000AA`

这些测试密钥总是返回成功验证。
