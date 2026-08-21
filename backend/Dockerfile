FROM php:8.3-fpm-alpine

# Install system dependencies & PostgreSQL extensions
RUN apk add --no-cache nginx postgresql-dev libpq-dev git unzip curl icu-dev libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql intl zip bcmath opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 80

CMD php artisan config:cache && php artisan route:cache && php-fpm -D && nginx -g "daemon off;"
