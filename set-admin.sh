#!/bin/bash
# 在远程服务器上设置第一个用户为管理员

SERVER="root@119.8.35.122"
SERVER_PWD="Acbd1324!@#35!@@"

export SSHPASS="${SERVER_PWD}"

echo "=== 在服务器上设置第一个用户为管理员 ==="

sshpass -e ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /opt/forum

# 数据库配置
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="paopao"
DB_PASS="paopao"
DB_NAME="paopao"

# 使用 Docker 容器中的 MySQL 客户端
MYSQL_CMD="docker exec -i forum-db-1 mysql -h127.0.0.1 -P3306 -u${DB_USER} -p${DB_PASS} ${DB_NAME}"

echo ">>> 查询第一个用户..."
$MYSQL_CMD -t <<EOF
SELECT id, username, nickname, is_admin, 
       CASE WHEN is_admin = 1 THEN '是' ELSE '否' END AS '是否管理员'
FROM p_user 
WHERE is_del = 0 
ORDER BY id ASC 
LIMIT 1;
EOF

echo ""
echo ">>> 设置为管理员..."
$MYSQL_CMD <<EOF
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
EOF

if [ $? -eq 0 ]; then
    echo "✓ 成功！"
    echo ""
    echo ">>> 更新后的用户信息："
    $MYSQL_CMD -t <<EOF
SELECT id, username, nickname, is_admin, 
       CASE WHEN is_admin = 1 THEN '是' ELSE '否' END AS '是否管理员'
FROM p_user 
WHERE is_del = 0 
ORDER BY id ASC 
LIMIT 1;
EOF
else
    echo "✗ 设置失败"
    exit 1
fi

ENDSSH

echo ""
echo "=== 完成 ==="
