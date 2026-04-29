# 1. استخدام صورة Laravel Sail لأنها تحتوي على كل الإضافات مسبقاً
FROM laravelsail/php82-composer:latest

# 2. تثبيت الإضافات الضرورية فقط (لضمان عمل الـ Database)
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev \
    default-mysql-client \
    && docker-php-ext-install pdo_mysql gd zip

# 3. تحديد مجلد العمل
WORKDIR /var/www/html

# 4. نسخ ملفات composer أولاً (لتسريع الـ Build)
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --no-autoloader --prefer-dist

# 5. نسخ بقية ملفات المشروع
COPY . .

# 6. إعطاء الصلاحيات للمجلدات المهمة
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# 7. تحديث الـ Autoloader
RUN composer dump-autoload --optimize

# 8. إعداد الـ Entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# 9. تشغيل التطبيق على بورت 8000 (بورت Laravel الافتراضي)
EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
