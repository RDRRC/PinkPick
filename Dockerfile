# 使用 PHP 8.2 + Apache 作為基礎
FROM php:8.2-apache

# 安裝系統依賴、PHP 擴充、以及 Node.js (Vite 必備)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    zip \
    unzip \
    git \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo_pgsql bcmath gd

# 啟動 Apache Rewrite 模組
RUN a2enmod rewrite

# 設定 Apache 的 Document Root
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 把專案程式碼放進去
WORKDIR /var/www/html
COPY . .

# 安裝 Composer 並執行
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# 執行 NPM 安裝與打包前端
RUN npm install
RUN npm run build

# 建立圖片捷徑
RUN php artisan storage:link

# 設定資料夾權限
RUN chown -R www-data:www-data storage bootstrap/cache

# 暴露 80 埠
EXPOSE 80

# 👇 🌟 核心修正：覆寫啟動指令 (CMD)
# 邏輯：容器啟動時，先強制跑 Migration，跑完之後再正式啟動 Apache 伺服器 (apache2-foreground)
CMD ["sh", "-c", "php artisan migrate --force && apache2-foreground"]