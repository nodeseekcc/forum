#!/bin/bash
# 设置第一个用户为管理员

# 数据库配置（从 config.yaml 读取或使用默认值）
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="paopao"
DB_PASS="paopao"
DB_NAME="paopao"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== 设置第一个用户为管理员 ===${NC}"

# 检查 MySQL 是否可用
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}错误: 未找到 mysql 命令${NC}"
    echo "请安装 MySQL 客户端或确保 MySQL 在 PATH 中"
    exit 1
fi

# 执行 SQL
echo -e "${YELLOW}正在更新第一个用户的权限...${NC}"

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
-- 查询第一个用户
SELECT id, username, nickname, is_admin 
FROM p_user 
WHERE is_del = 0 
ORDER BY id ASC 
LIMIT 1;

-- 设置为管理员
UPDATE p_user 
SET is_admin = 1, 
    modified_on = UNIX_TIMESTAMP() 
WHERE id = (
    SELECT id FROM (
        SELECT id FROM p_user 
        WHERE is_del = 0 
        ORDER BY id ASC 
        LIMIT 1
    ) AS tmp
);

-- 显示更新后的结果
SELECT id, username, nickname, is_admin, 
       CASE WHEN is_admin = 1 THEN '是' ELSE '否' END AS '是否管理员'
FROM p_user 
WHERE is_del = 0 
ORDER BY id ASC 
LIMIT 1;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 成功设置第一个用户为管理员！${NC}"
else
    echo -e "${RED}✗ 设置失败，请检查数据库连接和配置${NC}"
    exit 1
fi
