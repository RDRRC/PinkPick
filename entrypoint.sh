#!/bin/sh

# 1. 執行資料庫遷移
echo "正在執行資料庫遷移..."
php artisan migrate --force

# 2. 執行原本 Docker 映像檔該做的事 (啟動 Apache)
echo "正在啟動網頁伺服器..."
exec apache2-foreground