# AlMiftah API Documentation
# توثيق واجهة برمجة التطبيقات - المفتاح

## نظرة عامة

هذا المستند يحتوي على توثيق شامل لجميع نقاط النهاية (endpoints) في نظام AlMiftah للعقارات.

**الإصدار:** 1.0.0  
**آخر تحديث:** 2024

---

##.Base URL
```
http://localhost:8000/api
```

---

## المصادقة (Authentication)

النظام يستخدم **Bearer Token** للمصادقة. يجب إضافة الـ token في ترويسة كل طلب محمي:

```
Authorization: Bearer {token}
```

---

## 1. المصادقة (Authentication)

### 1.1 تسجيل مستخدم جديد
```
POST /auth/register
```

**الطلب:**
```json
{
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "+963944123456",
    "password": "Password123",
    "password_confirmation": "Password123",
    "role": "owner"
}
```

| الحقل | النوع | مطلوب | الوصف |
|-------|------|--------|-------|
| name | string | نعم | اسم المستخدم |
| email | email | نعم | البريد الإلكتروني |
| phone | string | نعم | رقم الهاتف السوري |
| password | string | نعم | كلمة المرور (8+ حروف، أحرف وأرقام) |
| password_confirmation | string | نعم | تأكيد كلمة المرور |
| role | string | لا | user, owner, admin |

**الاستجابة:**
```json
{
    "success": true,
    "message": "تم التسجيل بنجاح",
    "token": "1|abc123...",
    "user": {
        "id": 1,
        "name": "أحمد محمد",
        "email": "ahmed@example.com",
        "role": "owner"
    }
}
```

---

### 1.2 تسجيل الدخول
```
POST /auth/login
```

**الطلب:**
```json
{
    "email": "admin@almiftah.com",
    "password": "password"
}
```

**الاستجابة:**
```json
{
    "success": true,
    "token": "2|xyz789...",
    "user": {
        "id": 1,
        "name": "مدير النظام",
        "email": "admin@almiftah.com",
        "role": "admin",
        "is_verified": true
    }
}
```

---

### 1.3 الحصول على بيانات المستخدم الحالي
```
GET /auth/me
```

**الاستجابة:**
```json
{
    "success": true,
    "user": {
        "id": 1,
        "name": "أحمد محمد",
        "email": "ahmed@example.com",
        "phone": "+963944123456",
        "role": "owner",
        "is_verified": true,
        "is_banned": false,
        "created_at": "2024-01-15T10:30:00Z"
    }
}
```

---

### 1.4 تسجيل الخروج
```
POST /auth/logout
```

---

### 1.5 تغيير كلمة المرور
```
POST /auth/change-password
```

**الطلب:**
```json
{
    "current_password": "old_password",
    "password": "NewPassword123",
    "password_confirmation": "NewPassword123"
}
```

---

### 1.6 التحقق من البريد الإلكتروني
```
POST /auth/verify-email
```

**الطلب:**
```json
{
    "email": "user@example.com",
    "token": "verification_token"
}
```

---

### 1.7 إرسال رابط التحقق
```
POST /auth/send-verification-email
```

**الطلب:**
```json
{
    "email": "user@example.com"
}
```

---

## 2. المناطق (Regions)

### 2.1 عرض كل المناطق
```
GET /regions
```

**الاستجابة:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "دمشق",
            "type": "governorate",
            "children": [...]
        }
    ]
}
```

---

### 2.2 شجرة المناطق
```
GET /regions/tree
```

---

### 2.3 أنواع المناطق
```
GET /regions/types/list
```

**الاستجابة:**
```json
{
    "success": true,
    "data": ["governorate", "city", "area", "neighborhood", "street"]
}
```

---

### 2.4 المناطق الرئيسية
```
GET /regions/root/list
```

---

### 2.5 منطقة محددة
```
GET /regions/{id}
```

---

### 2.6 أبناء منطقة محددة
```
GET /regions/{id}/children
```

---

## 3. العقارات (Properties)

### 3.1 عرض العقارات
```
GET /properties
```

**المعاملات (Query Parameters):**
| المعامل | النوع | الوصف |
|---------|------|-------|
| per_page | int | عدد النتائج لكل صفحة |
| type | string | sale, rent |
| property_type | string | apartment, villa, house, land, shop, office, warehouse, building |
| region_id | int | معرف المنطقة |
| min_price | int | الحد الأدنى للسعر |
| max_price | int | الحد الأقصى للسعر |
| min_area | int | الحد الأدنى للمساحة |
| max_area | int | الحد الأقصى للمساحة |
| status | string | active, pending, sold, rented |
| sort_by | string | created_at, price, area |
| sort_order | string | asc, desc |

---

### 3.2 البحث
```
GET /properties/search
```

**المعاملات:**
| المعامل | الوصف |
|---------|-------|
| search | نص البحث (في العنوان والوصف) |
| type | نوع العقار |
| min_price | الحد الأدنى للسعر |
| max_price | الحد الأقصى للسعر |

---

### 3.3 البحث المتقدم
```
GET /properties/advanced-search
```

**المعاملات:**
| المعامل | الوصف |
|---------|-------|
| type | نوع العقار (sale/rent) |
| property_type | نوع العقار |
| region_ids | معرفات المناطق (مفصولة بفواصل) |
| governorate_id | معرف المحافظة |
| min_price | الحد الأدنى للسعر |
| max_price | الحد الأقصى للسعر |
| min_area | الحد الأدنى للمساحة |
| max_area | الحد الأقصى للمساحة |

---

### 3.4 عقار محدد
```
GET /properties/{id}
```

---

### 3.5 عقاراتي
```
GET /properties/my-properties
```
**مطلوب:** تسجيل الدخول

---

### 3.6 إنشاء عقار
```
POST /properties
```
**مطلوب:** تسجيل الدخول (دور: owner أو admin)

**الطلب:**
```json
{
    "title": "شقة فاخرة 3 غرف",
    "description": "شقة جديدة طابق رابع، جديدة لم تسكن",
    "price": 50000000,
    "type": "sale",
    "property_type": "apartment",
    "area": 150,
    "region_id": 1,
    "location": "المزة - دمشق",
    "latitude": 33.5138,
    "longitude": 36.2765
}
```

| الحقل | النوع | الوصف |
|-------|------|-------|
| title | string | عنوان العقار (255 حرف كحد أقصى) |
| description | string | وصف العقار (5000 حرف كحد أقصى) |
| price | numeric | السعر (أكبر من صفر) |
| type | string | sale أو rent |
| property_type | string | نوع العقار |
| area | numeric | المساحة (بالمتر المربع) |
| region_id | int | معرف المنطقة |
| location | string | الموقع النصي |
| latitude | float | خط العرض (اختياري) |
| longitude | float | خط الطول (اختياري) |

---

### 3.7 تحديث عقار
```
PUT /properties/{id}
```
**مطلوب:** تسجيل الدخول (صاحب العقار أو admin)

---

### 3.8 حذف عقار
```
DELETE /properties/{id}
```
**مطلوب:** تسجيل الدخول (صاحب العقار أو admin)

---

### 3.9 حذف صورة عقار
```
DELETE /properties/{id}/images/{imageId}
```

---

### 3.10 تحديد كمؤجر
```
POST /properties/{id}/rented
```
**مطلوب:** تسجيل الدخول (صاحب العقار)

---

### 3.11 تحديد كمباع
```
POST /properties/{id}/sold
```
**مطلوب:** تسجيل الدخول (صاحب العقار)

---

## 4. طلبات التواصل (Contact Requests)

### 4.1 إرسال طلب تواصل
```
POST /contact
```
**مطلوب:** تسجيل الدخول

**الطلب:**
```json
{
    "property_id": 1,
    "name": "محمد أحمد",
    "phone": "+963944123456",
    "message": "أريد معرفة المزيد عن هذا العقار"
}
```

| الحقل | النوع | الوصف |
|-------|------|-------|
| property_id | int | معرف العقار |
| name | string | اسم مقدم الطلب |
| phone | string | رقم الهاتف |
| message | string | الرسالة (1000 حرف كحد أقصى) |

---

### 4.2 طلباتي المرسلة
```
GET /contact/my-requests
```
**مطلوب:** تسجيل الدخول

---

### 4.3 الطلبات المستلمة
```
GET /contact/my-received
```
**مطلوب:** تسجيل الدخول (للأصحاب العقارات)

---

### 4.4 حالة الطلب لعقار معين
```
GET /contact/status/{propertyId}
```
**مطلوب:** تسجيل الدخول

---

## 5. الإشعارات (Notifications)

### 5.1 عرض الإشعارات
```
GET /notifications
```

**الاستجابة:**
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

### 5.2 عدد الإشعارات غير المقروءة
```
GET /notifications/unread-count
```

---

### 5.3 تحديد كمقروء
```
POST /notifications/{id}/read
```

---

### 5.4 تحديد الكل كمقروء
```
POST /notifications/read-all
```

---

### 5.5 حذف إشعار
```
DELETE /notifications/{id}
```

---

### 5.6 حذف كل الإشعارات
```
DELETE /notifications
```

---

## 6. FCM Tokens (Push Notifications)

### 6.1 حفظ Token
```
POST /fcm/token
```
**مطلوب:** تسجيل الدخول

**الطلب:**
```json
{
    "token": "fcm_device_token_here",
    "device_type": "android"
}
```

| الحقل | الوصف |
|-------|-------|
| token | FCM token من الجهاز |
| device_type | android, ios, web |

---

### 6.2 حذف Token
```
DELETE /fcm/token
```

**الطلب:**
```json
{
    "token": "fcm_device_token_here"
}
```

---

## 7. إدارة المستخدمين (Admin)

### 7.1 عرض كل المستخدمين
```
GET /admin/users
```

**المعاملات:**
| المعامل | الوصف |
|---------|-------|
| per_page | عدد النتائج |
| search | البحث بالاسم/البريد/الهاتف |
| role | فلترة حسب الدور |
| is_verified | true/false |
| is_banned | true/false |
| is_active | true/false |
| sort_by | created_at, name |
| sort_order | asc, desc |

---

### 7.2 إنشاء مستخدم
```
POST /admin/users/create
```

**الطلب:**
```json
{
    "name": "مستخدم جديد",
    "email": "newuser@example.com",
    "phone": "+963944654321",
    "password": "Password123",
    "role": "owner"
}
```

---

### 7.3 المستخدمين غير المفعلين
```
GET /admin/users/unverified
```

---

### 7.4 تفعيل مستخدم
```
POST /admin/users/{id}/verify
```

---

### 7.5 حظر مستخدم
```
POST /admin/users/{id}/ban
```

**الطلب:**
```json
{
    "reason": "انتهاك شروط الاستخدام"
}
```

---

### 7.6 إلغاء الحظر
```
POST /admin/users/{id}/unban
```

---

### 7.7 تبديل حالة التفعيل
```
POST /admin/users/{id}/toggle-active
```

---

## 8. إدارة العقارات (Admin)

### 8.1 عرض كل العقارات
```
GET /admin/properties
```

**المعاملات:**
| المعامل | الوصف |
|---------|-------|
| per_page | عدد النتائج |
| type | sale, rent |
| property_type | نوع العقار |
| region_id | معرف المنطقة |
| status | pending, active, rejected, sold, rented |
| owner_id | معرف المالك |
| search | البحث |

---

### 8.2 قبول عقار
```
POST /admin/properties/{id}/approve
```

---

### 8.3 رفض عقار
```
POST /admin/properties/{id}/reject
```

**الطلب:**
```json
{
    "reason": "المعلومات غير مكتملة"
}
```

---

## 9. إدارة طلبات التواصل (Admin)

### 9.1 عرض كل الطلبات
```
GET /admin/contact-requests
```

**المعاملات:**
| المعامل | الوصف |
|---------|-------|
| status | pending, approved, rejected |

---

### 9.2 قبول طلب
```
POST /admin/contact-requests/{id}/approve
```

---

### 9.3 رفض طلب
```
POST /admin/contact-requests/{id}/reject
```

**الطلب:**
```json
{
    "reason": "طلب غير مناسب"
}
```

---

## 10. لوحة التحكم (Admin Dashboard)

### 10.1 الإحصائيات
```
GET /admin/statistics
```

**الاستجابة:**
```json
{
    "success": true,
    "data": {
        "users": {
            "total": 150,
            "owners": 30,
            "unverified": 10,
            "banned": 2
        },
        "properties": {
            "total": 500,
            "today": 5,
            "active": 350,
            "rented": 50,
            "sold": 30,
            "pending": 60,
            "rejected": 10
        },
        "contact_requests": {
            "total": 200,
            "pending": 25
        }
    }
}
```

---

### 10.2 النشاطات الأخيرة
```
GET /admin/dashboard/recent-activities
```

---

### 10.3 بيانات الرسوم البيانية
```
GET /admin/dashboard/chart-data
```

---

### 10.4 العقارات حسب المنطقة
```
GET /admin/dashboard/properties-by-region
```

---

### 10.5 العقارات حسب النوع
```
GET /admin/dashboard/properties-by-type
```

---

### 10.6 ملخص العقارات
```
GET /admin/dashboard/properties-summary
```

**المعاملات:**
| المعامل | الوصف |
|---------|-------|
| type | all, sold, rented |
| from_date | تاريخ البداية |
| to_date | تاريخ النهاية |

---

### 10.7 تسجيلات المستخدمين
```
GET /admin/dashboard/users-registration
```

**المعاملات:**
| المعامل | الوصف |
|---------|-------|
| period | all, month, week |
| from_date | تاريخ البداية |
| to_date | تاريخ النهاية |

---

### 10.8 المناطق الأكثر نشاطاً
```
GET /admin/dashboard/top-active-regions
```

**المعاملات:**
| المعامل | الوصف |
|---------|-------|
| limit | عدد النتائج |

---

## 11. إرسال إشعار (Admin)

### 11.1 إرسال إشعار لمستخدم
```
POST /admin/send-notification
```

**الطلب:**
```json
{
    "user_id": 1,
    "title": "إعلان مهم",
    "body": "صيانة مجدولة يوم الجمعة",
    "extra": {
        "type": "announcement"
    }
}
```

---

## 12. إدارة المناطق (Admin)

### 12.1 إنشاء منطقة
```
POST /admin/regions
```

**الطلب:**
```json
{
    "name": "دمشق",
    "type": "governorate",
    "parent_id": null
}
```

---

### 12.2 تحديث منطقة
```
PUT /admin/regions/{id}
```

---

### 12.3 حذف منطقة
```
DELETE /admin/regions/{id}
```

---

## أنواع الإشعارات

| النوع | العنوان | المستلم |
|-------|---------|---------|
| property_approved | تم قبول عقارك | Owner |
| property_rejected | تم رفض عقارك | Owner |
| property_sold | تم بيع عقارك | Owner |
| property_rented | تم تأجير عقارك | Owner |
| new_contact_request | طلب تواصل جديد | Admin |
| contact_request_approved | تم قبول طلب التواصل | User |
| contact_request_rejected | تم رفض طلب التواصل | User |
| account_verified | تم التحقق من حسابك | User |
| account_banned | تم حظر حسابك | User |
| account_unbanned | تم إلغاء حظر حسابك | User |

---

## رموز الاستجابة

| الرمز | الوصف |
|-------|-------|
| 200 | نجاح |
| 201 | تم الإنشاء |
| 400 | طلب سيء |
| 401 | غير مصرح |
| 403 | ممنوع |
| 404 | غير موجود |
| 422 | خطأ في التحقق |
| 429 | تجاوز الحد المسموح |
| 500 | خطأ في الخادم |

---

## حدود الاستخدام (Rate Limiting)

| Endpoint | الحد |
|----------|------|
| /auth/login | 5 محاولات / 5 دقائق |
| /auth/register | 3 محاولات / 10 دقائق |
| API العام | 60 طلب / دقيقة |

---

## رسائل الخطأ

```json
{
    "success": false,
    "message": "رسالة الخطأ",
    "errors": {
        "field": ["خطأ التحقق"]
    }
}
```
