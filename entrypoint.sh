#!/bin/sh
set -e

echo "🚀 Starting App Initialization..."

php artisan config:clear
php artisan cache:clear

echo "🗄️ Running Database Migrations..."
sleep 5
php artisan migrate --force --no-interaction

echo "🌱 Seeding database..."
php artisan db:seed --class=SyriaRegionsSeeder --force --no-interaction || true

echo "✅ App is ready!"

exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
