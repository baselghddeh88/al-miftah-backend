#!/bin/sh
set -e

echo "🚀 Starting App Initialization..."

php artisan config:clear
php artisan cache:clear

echo "🗄️ Running Database Migrations..."
sleep 5
php artisan migrate --force --no-interaction

echo "✅ App is ready!"

exec php artisan serve --host=0.0.0.0 --port=8000
