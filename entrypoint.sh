#!/bin/sh
set -e

echo "🚀 Starting App Initialization..."

# تنظيف الكاش
php artisan config:clear
php artisan cache:clear

echo "📂 Running Database Migrations..."
# الانتظار قليلاً للتأكد من أن قاعدة البيانات جاهزة
sleep 5
php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction
echo "✅ App is ready!"

# تشغيل سيرفر لارافيل بدلاً من Apache
exec php artisan serve --host=0.0.0.0 --port=8000
