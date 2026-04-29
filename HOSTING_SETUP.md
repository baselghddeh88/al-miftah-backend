# دليل إعداد Queue على الاستضافة - AlMiftah

## ما تم تعديله

### 1. Jobs جديدة
- `app/Jobs/SendNotificationJob.php` - إرسال الإشعارات عبر Queue
- `app/Jobs/SendEmailJob.php` - إرسال الإيميلات عبر Queue

### 2. خدمات معدلة
- `app/Services/NotificationService.php` - يستخدم Queue الآن

### 3. Controller معدل
- `app/Http/Controllers/AuthController.php` - إرسال الإيميلات عبر Queue

---

## خطوات الإعداد على الاستضافة

### الخطوة 1: تحديث ملف .env

```env
QUEUE_CONNECTION=database
```

### الخطوة 2: إنشاء جداول Queue

```bash
php artisan queue:table
php artisan migrate
```

### الخطوة 3: إعداد Supervisor

#### أ) نسخ ملف الإعداد
```bash
sudo cp almiftah-queue.conf /etc/supervisor/conf.d/
```

#### ب) تعديل المسار في الملف
افتح الملف وعدّل المسار:
```ini
command=php /path/to/your/site/artisan queue:work
```

#### ج) تشغيل Supervisor
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start almiftah-queue:*
```

### الخطوة 4: التحقق

```bash
# معرفة حالة الـ workers
sudo supervisorctl status

# يجب أن تظهر:
# almiftah-queue:almiftah-queue_00   RUNNING
# almiftah-queue:almiftah-queue_01   RUNNING
# almiftah-queue:almiftah-queue_02   RUNNING
# almiftah-queue:almiftah-queue_03   RUNNING
```

---

## أوامر مهمة

```bash
# إعادة تشغيل Workers (بعد أي تحديث في الكود)
sudo supervisorctl restart almiftah-queue:*

# عرض سجلات Queue
tail -f storage/logs/queue-worker.log

# عرض عدد Jobs في الانتظار
php artisan queue:monitor

# إعادة تنفيذ Jobs الفاشلة
php artisan queue:retry all
```

---

## حل المشاكل

### المشكلة: Workers لا يبدأون
```bash
# تحقق من الصلاحيات
sudo chown -R www-data:www-data storage/logs
sudo chmod -R 775 storage
```

### المشكلة: Jobs بطيئة
```bash
# زيادة عدد Workers
# عدّل numprocs في الملف من 4 إلى 8
```

---

## ملخص سريع

```bash
# 1. تحديث .env
QUEUE_CONNECTION=database

# 2. تشغيل migrations
php artisan queue:table
php artisan migrate

# 3. إعداد Supervisor
sudo cp almiftah-queue.conf /etc/supervisor/conf.d/
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start almiftah-queue:*
```
