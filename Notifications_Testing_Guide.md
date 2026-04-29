# دليل اختبار نظام الإشعارات - AlMiftah

## نظرة عامة

هذا المستند يشرح كيفية اختبار نظام الإشعارات باستخدام Postman collection.

---

## 1. استيراد Collection

1. افتح Postman
2. اضغط على **Import**
3. اختر الملف: `Notifications_API_Postman_Collection.json`

---

## 2. إعداد المتغيرات

### Collection Variables:
- `baseUrl`: `http://localhost:8000/api`
- `token`: (سيتم تعيينه تلقائياً بعد تسجيل الدخول)

---

## 3. خطوات الاختبار

### الخطوة 1: تسجيل الدخول (للحصول على Token)

```
POST {{baseUrl}}/auth/login
Body (JSON):
{
    "email": "admin@almiftah.com",
    "password": "your_password"
}
```

**ملاحظة:** سيتم حفظ الـ token تلقائياً في المتغيرات.

---

### الخطوة 2: حفظ FCM Token

```
POST {{baseUrl}}/fcm/token
Body (JSON):
{
    "token": "fcm_device_token_here",
    "device_type": "android"
}
```

---

### الخطوة 3: عرض الإشعارات

```
GET {{baseUrl}}/notifications?per_page=20
```

**الاستجابة المتوقعة:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "type": "property_approved",
            "title": "تم قبول عقارك",
            "body": "تم قبول عقار 'شقة في المزة' ونشره على الموقع.",
            "is_read": false,
            "related_id": 1,
            "related_type": "property",
            "created_at": "منذ ساعتين"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 20,
        "total": 1
    }
}
```

---

### الخطوة 4: عدد الإشعارات غير المقروءة

```
GET {{baseUrl}}/notifications/unread-count
```

---

## 4. سيناريوهات اختبار الأحداث

### 4.1 اختبار: إنشاء عقار جديد

**الشرط:** تسجيل الدخول كمستخدم owner

```bash
POST {{baseUrl}}/properties
Body (JSON):
{
    "title": "شقة فاخرة",
    "description": "شقة 3 غرف نوم",
    "price": 50000000,
    "type": "sale",
    "property_type": "apartment",
    "area": 150,
    "region_id": 1,
    "location": "المزة"
}
```

**النتيجة المتوقعة:**
- ✅ إنشاء العقار بنجاح
- ✅ إشعار للإدارة بوجود عقار جديد بانتظار الموافقة

---

### 4.2 اختبار: موافقة العقار

**الشرط:** تسجيل الدخول كـ admin

```bash
POST {{baseUrl}}/admin/properties/1/approve
```

**النتيجة المتوقعة:**
- ✅ تحديث حالة العقار إلى `active`
- ✅ إشعار لصاحب العقار: "تم قبول عقارك"

**للتحقق:**
```bash
# كـ owner - تحقق من الإشعارات
GET {{baseUrl}}/notifications
```

---

### 4.3 اختبار: رفض العقار

**الشرط:** تسجيل الدخول كـ admin

```bash
POST {{baseUrl}}/admin/properties/1/reject
Body (JSON):
{
    "reason": "المعلومات غير كاملة"
}
```

**النتيجة المتوقعة:**
- ✅ تحديث حالة العقار إلى `rejected`
- ✅ إشعار لصاحب العقار مع سبب الرفض

---

### 4.4 اختبار: إرسال طلب تواصل

**الشرط:** تسجيل الدخول كمستخدم

```bash
POST {{baseUrl}}/contact
Body (JSON):
{
    "property_id": 1,
    "name": "محمد أحمد",
    "phone": "+963944123456",
    "message": "أريد معرفة المزيد"
}
```

**النتيجة المتوقعة:**
- ✅ إنشاء طلب التواصل
- ✅ إشعار للإدارة بوجود طلب جديد

**للتحقق كـ admin:**
```bash
GET {{baseUrl}}/notifications
```

---

### 4.5 اختبار: قبول طلب التواصل

**الشرط:** تسجيل الدخول كـ admin

```bash
POST {{baseUrl}}/admin/contact-requests/1/approve
```

**النتيجة المتوقعة:**
- ✅ تحديث حالة الطلب إلى `approved`
- ✅ إشعار للمستخدم بمعلومات المالك

---

### 4.6 اختبار: تحديد العقار كمباع

**الشرط:** تسجيل الدخول كـ owner للعقار

```bash
POST {{baseUrl}}/properties/1/sold
```

**النتيجة المتوقعة:**
- ✅ تحديث حالة العقار إلى `sold`
- ✅ إشعار لصاحب العقار

---

### 4.7 اختبار: تحديد العقار كمؤجر

**الشرط:** تسجيل الدخول كـ owner للعقار

```bash
POST {{baseUrl}}/properties/1/rented
```

**النتيجة المتوقعة:**
- ✅ تحديث حالة العقار إلى `rented`
- ✅ إشعار لصاحب العقار

---

### 4.8 اختبار: حظر مستخدم

**الشرط:** تسجيل الدخول كـ admin

```bash
POST {{baseUrl}}/admin/users/2/ban
Body (JSON):
{
    "reason": "انتهاك شروط الاستخدام"
}
```

**النتيجة المتوقعة:**
- ✅ تحديث حالة المستخدم إلى محظور
- ✅ إشعار للمستخدم بحظر حسابه

---

### 4.9 اختبار: إلغاء الحظر

**الشرط:** تسجيل الدخول كـ admin

```bash
POST {{baseUrl}}/admin/users/2/unban
```

**النتيجة المتوقعة:**
- ✅ تحديث حالة المستخدم
- ✅ إشعار للمستخدم بإلغاء الحظر

---

### 4.10 اختبار: إرسال إشعار يدوي (Admin)

```bash
POST {{baseUrl}}/admin/send-notification
Body (JSON):
{
    "user_id": 1,
    "title": "إعلان مهم",
    "body": "صيانة مجدولة يوم الجمعة"
}
```

---

## 5. اختبار Push Notifications (FCM)

### 5.1 حفظ Token
```bash
POST {{baseUrl}}/fcm/token
{
    "token": "your_fcm_token",
    "device_type": "android"
}
```

### 5.2 حذف Token
```bash
DELETE {{baseUrl}}/fcm/token
{
    "token": "your_fcm_token"
}
```

---

## 6. التحقق من الإشعارات

### 6.1 عرض الإشعارات
```bash
GET {{baseUrl}}/notifications
```

### 6.2 عدد غير المقروءة
```bash
GET {{baseUrl}}/notifications/unread-count
```

### 6.3 تحديد كمقروء
```bash
POST {{baseUrl}}/notifications/1/read
```

### 6.4 تحديد الكل كمقروء
```bash
POST {{baseUrl}}/notifications/read-all
```

### 6.5 حذف إشعار واحد
```bash
DELETE {{baseUrl}}/notifications/1
```

### 6.6 حذف كل الإشعارات
```bash
DELETE {{baseUrl}}/notifications
```

---

## 7. جدول أنواع الإشعارات

| النوع | العنوان | المستلم | الحدث |
|-------|---------|---------|-------|
| `property_approved` | تم قبول عقارك | Owner | موافقة العقار |
| `property_rejected` | تم رفض عقارك | Owner | رفض العقار |
| `property_sold` | تم بيع عقارك | Owner | تحديد كمباع |
| `property_rented` | تم تأجير عقارك | Owner | تحديد كمؤجر |
| `new_contact_request` | طلب تواصل جديد | Admin | طلب تواصل جديد |
| `contact_request_approved` | تم قبول طلب التواصل | User | قبول الطلب |
| `contact_request_rejected` | تم رفض طلب التواصل | User | رفض الطلب |
| `account_verified` | تم التحقق من حسابك | User | التحقق من الحساب |
| `account_banned` | تم حظر حسابك | User | حظر الحساب |
| `account_unbanned` | تم إلغاء حظر حسابك | User | إلغاء الحظر |

---

## 8. حل المشاكل

### المشكلة: Token غير موجود
**الحل:** تأكد من تسجيل الدخول أولاً

### المشكلة: 401 Unauthorized
**الحل:** تأكد من إضافة Bearer token في الـ Authorization

### المشكلة: إشعارات Push لا تعمل
**الحل:** 
1. تأكد من وجود `firebase-credentials.json`
2. تحقق من صحة FCM token
3. تحقق من إعدادات Firebase في `.env`

### المشكلة: إشعار غير موجود (404)
**الحل:** تأكد من ID الإشعار الصحيح

---

## 9. ملاحظات

- جميع الإشعارات تُحفظ في قاعدة البيانات
- Push notifications تحتاج إعداد Firebase
- الحد الأقصى للرسالة هو 1000 حرف
