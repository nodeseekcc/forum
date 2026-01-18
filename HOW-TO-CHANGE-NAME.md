# 修改网站名称指南

## 主要需要修改的文件

### 1. 前端页面标题
**文件**: `web/index.html`
```html
<title>话题</title>  <!-- 改成你的网站名称 -->
```

### 2. 前端配置文件 (如果存在)
**文件**: `web/.env` 或 `web/.env.local`
```bash
VITE_APP_TITLE=你的网站名称
```

### 3. 后端配置
**文件**: `config.yaml`
```yaml
JWT:
  Issuer: your-api-name  # 改成你的API名称
```

### 4. Manifest 文件 (PWA应用名称)
**文件**: `web/public/manifest.json`
```json
{
  "name": "你的网站名称",
  "short_name": "简称"
}
```

## 🔧 快速修改步骤

### 方式1: 手动修改（推荐）

```bash
# 1. 修改前端标题
vim web/index.html
# 找到 <title>话题</title> 改成你想要的名称

# 2. 如果有 manifest.json，也修改它
vim web/public/manifest.json

# 3. 重新编译和部署
make build TAGS='embed migration'
./deploy-quick.sh
```

### 方式2: 使用 sed 命令批量替换

```bash
# 替换前端标题
sed -i 's/<title>话题<\/title>/<title>你的网站名称<\/title>/' web/index.html

# 重新编译和部署
make build TAGS='embed migration'
./deploy-quick.sh
```

## 📋 其他可能需要修改的地方

### Logo 图标
- `web/public/logo.png` - 网站Logo
- `web/public/favicon.ico` - 浏览器图标

### 数据库配置 (如果要改数据库名)
**文件**: `config.yaml`
```yaml
MySQL:
  DBName: your_db_name  # 数据库名称
```

### 日志路径
**文件**: `config.yaml`
```yaml
LoggerFile:
  SavePath: custom/data/your-app-name/logs
```

## ⚠️ 注意事项

1. **修改前备份**：修改前最好备份原文件
2. **重新编译**：修改前端文件后需要重新编译：`make build TAGS='embed migration'`
3. **重新部署**：编译完成后运行：`./deploy-quick.sh`
4. **清除缓存**：浏览器可能需要强制刷新（Ctrl+F5）才能看到新名称

## 🚀 完整修改流程示例

假设要把"话题"改成"我的论坛"：

```bash
# 1. 修改前端标题
sed -i 's/<title>话题<\/title>/<title>我的论坛<\/title>/' web/index.html

# 2. 修改 manifest（如果文件存在）
# 手动编辑或用 jq 工具修改 web/public/manifest.json

# 3. 重新编译前端和后端
make build TAGS='embed migration'

# 4. 部署到服务器
./deploy-quick.sh

# 5. 在浏览器中访问并强制刷新
# Ctrl + F5 或 Cmd + Shift + R
```

完成！🎉
