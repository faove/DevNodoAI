#!/bin/sh
set -e

cd /var/www/html

if [ ! -d vendor ]; then
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

mkdir -p \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  storage/app/public \
  bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache || true
chmod -R ug+rwx storage bootstrap/cache || true

if [ -z "${APP_KEY}" ] || [ "${APP_KEY}" = "" ]; then
  echo "APP_KEY is empty. Generating a temporary key..."
  php artisan key:generate --force --no-interaction || true
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  echo "Running database migrations..."
  php artisan migrate --force --no-interaction
fi

if [ "${CACHE_CONFIG:-false}" = "true" ]; then
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  php artisan event:cache || true
fi

exec "$@"
