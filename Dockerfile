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
RUN Render sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 把專案程式碼放進去
WORKDIR /var/www/html
COPY . .

# 安裝 Composer 並執行
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# 執行 NPM 安裝與打包前端 (這能解決 Vite 找不到檔案的問題)
RUN npm install
RUN npm run build

# 設定資料夾權限
RUN chown -R www-data:www-data storage bootstrap/cache

# 暴露 80 埠
EXPOSE 80