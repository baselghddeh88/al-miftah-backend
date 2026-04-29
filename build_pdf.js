import fs from 'fs';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>توثيق API - لوحة تحكم الأدمن (شركة المفتاح)</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background: #f8f9fa; color: #333; padding: 0; margin: 0; font-size: 14px; line-height: 1.6; }
        .cover { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; }
        .cover h1 { font-size: 3em; margin-bottom: 20px; }
        .cover p { font-size: 1.5em; opacity: 0.9; }
        .page-break { page-break-before: always; }
        .container { padding: 40px; background: white; margin: 20px auto; max-width: 900px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 8px; }
        h1, h2, h3 { color: #2c3e50; margin-bottom: 15px; }
        h2 { border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-top: 30px; }
        h3 { margin-top: 25px; color: #764ba2; font-size: 1.2em; display: flex; align-items: center; gap: 10px; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85em; color: white; font-weight: bold; margin-left: 10px; display: inline-block; direction: ltr; }
        .badge.get { background: #61affe; }
        .badge.post { background: #49cc90; }
        .badge.put { background: #fca130; }
        .badge.delete { background: #f93e3e; }
        .endpoint-url { font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 4px; color: #d63384; direction: ltr; display: inline-block; font-size: 1.1em; }
        .desc { margin-bottom: 15px; font-size: 1.05em; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9em; }
        th, td { border: 1px solid #dee2e6; padding: 10px; text-align: right; }
        th { background-color: #f1f3f5; font-weight: bold; color: #495057; }
        .code-block { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 0.85em; overflow-x: auto; direction: ltr; text-align: left; white-space: pre-wrap; margin-bottom: 20px; }
        .alert { padding: 15px; border-radius: 6px; margin-bottom: 20px; border-right: 4px solid; }
        .alert-info { background: #e0f7fa; border-color: #17a2b8; color: #0c5460; }
        .alert-warning { background: #fff3cd; border-color: #ffc107; color: #856404; }
        ul { margin-right: 25px; margin-bottom: 15px; }
        li { margin-bottom: 5px; }
        .toc-link { text-decoration: none; color: #667eea; display: block; margin-bottom: 10px; font-size: 1.1em; font-weight: 500; }
        .toc-link:hover { text-decoration: underline; }
        @media print {
            body { background: white; }
            .container { box-shadow: none; margin: 0; max-width: 100%; padding: 0; }
            .page-break { page-break-before: always; }
            .avoid-break { page-break-inside: avoid; }
        }
    </style>
</head>
<body>

    <!-- Cover Page -->
    <div class="cover">
        <h1>توثيق واجهات برمجة التطبيقات (API)</h1>
        <p>لوحة تحكم إدارة النظام (الأدمن والداشبورد) - شركة المفتاح</p>
        <p style="margin-top: 30px; font-size: 1.2em;">النسخة الشاملة | مبني على المسارات الفعلية</p>
    </div>

    <!-- Table of Contents -->
    <div class="container page-break">
        <h2>فهرس المحتويات</h2>
        <a href="#intro" class="toc-link">1. مقدمة ومعلومات عامة (المصادقة والاستجابة القياسية)</a>
        <a href="#users" class="toc-link">2. إدارة المستخدمين (Users Management)</a>
        <a href="#properties" class="toc-link">3. إدارة العقارات (Properties Management)</a>
        <a href="#contacts" class="toc-link">4. إدارة طلبات التواصل (Contact Requests)</a>
        <a href="#regions" class="toc-link">5. إدارة المناطق (Regions Management)</a>
        <a href="#dashboard" class="toc-link">6. الإحصائيات والداشبورد (Statistics & Dashboard)</a>
        <a href="#errors" class="toc-link">7. ملحق: الأخطاء الشائعة وحالات الرفض</a>
    </div>

    <!-- 1. Introduction -->
    <div class="container page-break" id="intro">
        <h2>1. مقدمة ومعلومات عامة</h2>
        
        <div class="desc">
            هذا الملف يحتوي على التوثيق الشامل لجميع الواجهات البرمجية (APIs) الخاصة بلوحة التحكم (Dashboard) والتي يمكن للأدمن فقط استدعاءها. أي واجهة هنا تتطلب صلاحيات ومصادقة محددة.
        </div>

        <h3>المصادقة والتفويض (Authentication & Authorization)</h3>
        <div class="alert alert-warning">
            <strong>جميع واجهات هذا الدليل محمية.</strong> تتطلب:
            <ul>
                <li>توكن (Bearer Token) من نوع Sanctum في الـ Header للطلب المتصل بحساب مسجل دخول.</li>
                <li>أن يكون المستخدم صاحب التوكن يملك الدور <code>admin</code> (متحقق منه عبر AdminController constructor و Gates).</li>
            </ul>
        </div>
        <p><strong>استخراج التوكن:</strong> استخدم واجهة تسجيل الدخول كالمعتاد <code>POST /api/auth/login</code> للوصول إلى توكن الأدمن وإرساله كالتالي: <code>Authorization: Bearer {token}</code></p>

        <h3>الاستجابة القياسية (Standard Response)</h3>
        <p>النظام يستخدم نظام <code>ApiResponseTrait</code> لتوحيد شكل الردود (JSON) كالتالي:</p>
        <div class="code-block">{
  "success": true,           // هل تمت العملية بنجاح؟ (boolean)
  "data": { ... },           // بيانات الاستجابة (object/array/null)
  "message": "رسالة توضيحية" // الرسالة (string)
}</div>
    </div>

    <!-- 2. Users Management -->
    <div class="container page-break" id="users">
        <h2>2. إدارة المستخدمين (Users Management)</h2>
        <p class="desc">تتيح هذه الواجهات للأدمن عرض المستخدمين، التحكم بحالتهم (تفعيل/حظر)، وتوثيق الحسابات.</p>

        <!-- 2.1 Get Users -->
        <div class="avoid-break">
            <h3><span class="badge get">GET</span> <span class="endpoint-url">/api/admin/users</span> عرض جميع المستخدمين</h3>
            <p class="desc">يُستخدم لسرد جميع المستخدمين في النظام مع دعم التقسيم للصفحات (Pagination) والفلاتر المختلفة. تستخدم في صفحة "إدارة المستخدمين" بالداشبورد.</p>
            <table>
                <tr><th>المعلمة (Query)</th><th>النوع</th><th>الوصف</th></tr>
                <tr><td>search</td><td>String</td><td>بحث بالاسم، الإيميل، أو الهاتف</td></tr>
                <tr><td>role</td><td>String</td><td>فلتر بالدور (user, owner, admin)</td></tr>
                <tr><td>is_verified</td><td>Boolean</td><td>فلتر بحالة التوثيق (true/false)</td></tr>
                <tr><td>is_banned</td><td>Boolean</td><td>فلتر بالمحظورين (true/false)</td></tr>
                <tr><td>is_active</td><td>Boolean</td><td>فلتر بالنشطين (true/false)</td></tr>
            </table>
            <strong>استجابة ناجحة (200):</strong>
            <div class="code-block">{
  "success": true,
  "data": {
    "data": [ { "id": 1, "name": "أحمد", "role": "owner", "is_active": true, ... } ],
    "current_page": 1,
    "last_page": 5, ...
  },
  "message": "Operation successful"
}</div>
        </div>

        <!-- 2.2 Create User -->
        <div class="avoid-break">
            <h3><span class="badge post">POST</span> <span class="endpoint-url">/api/admin/users/create</span> إضافة أدمن/مستخدم من الداشبورد</h3>
            <p class="desc">إنشاء حساب جديد بشكل مباشر (مثل إنشاء حسابات لأدمن إضافيين أومالك عقارات).</p>
            <table>
                <tr><th>الحقل (Body)</th><th>الوصف</th></tr>
                <tr><td>name, email, phone, password, role</td><td>البيانات الأساسية للمستخدم (role يمكن أن يكون admin).</td></tr>
            </table>
        </div>

        <!-- 2.3 Verify User -->
        <div class="avoid-break">
            <h3><span class="badge post">POST</span> <span class="endpoint-url">/api/admin/users/{id}/verify</span> توثيق حساب مستخدم يدويًا</h3>
            <p class="desc">لتوثيق إيميل/حساب المستخدم يدويًا من قبل الإدارة (في حال عدم وصول رابط التوثيق).</p>
            <p><strong>الأخطاء المحتملة:</strong> 404 (مستخدم غير موجود)، 400 (المستخدم موثق مسبقاً).</p>
        </div>

        <!-- 2.4 Ban / Unban -->
        <div class="avoid-break">
            <h3><span class="badge post">POST</span> <span class="endpoint-url">/api/admin/users/{id}/ban</span> حظر مستخدم</h3>
            <h3><span class="badge post">POST</span> <span class="endpoint-url">/api/admin/users/{id}/unban</span> إلغاء حظر</h3>
            <p class="desc">لحظر مستخدم من الدخول للنظام (سيتم منعه من الدخول)، أو إلغاء حظره.</p>
            <table>
                <tr><th>الحقل (Body - للحظر فقط)</th><th>النوع</th><th>الوصف</th></tr>
                <tr><td>reason</td><td>String</td><td>(اختياري) سبب الحظر، بحد أقصى 1000 حرف.</td></tr>
            </table>
        </div>

        <!-- 2.5 Toggle Active -->
        <div class="avoid-break">
            <h3><span class="badge post">POST</span> <span class="endpoint-url">/api/admin/users/{id}/toggle-active</span> تفعيل/إلغاء تفعيل حساب</h3>
            <p class="desc">للتحكم في تفعيل الحسابات (خاصة لحسابات المكاتب العقارية "owners" التي تتطلب اعتمادات).</p>
            <div class="alert alert-info">
                <strong>آثار جانبية:</strong> إذا كان المستخدم من نوع <code>owner</code> وتم تفعيل حسابه، سيقوم النظام تلقائيًا بإرسال <strong>إشعار Firebase</strong> له يُعلمه بتفعيل الحساب وأنه قادر على إضافة عقارات.
            </div>
        </div>
    </div>

    <!-- 3. Properties Management -->
    <div class="container page-break" id="properties">
        <h2>3. إدارة العقارات (Properties Management)</h2>
        <p class="desc">تتيح هذه الواجهات للأدمن عرض كافة العقارات المُضافة من قبل المكاتب، ومراجعتها (موافقة أو رفض).</p>

        <!-- 3.1 Get Properties -->
        <div class="avoid-break">
            <h3><span class="badge get">GET</span> <span class="endpoint-url">/api/admin/properties</span> قائمة العقارات الشاملة</h3>
            <p class="desc">يُستخدم لعرض وتصفية العقارات في قائمة الموافقة/الرفض.</p>
            <table>
                <tr><th>المعلمة (Query)</th><th>النوع</th><th>الوصف</th></tr>
                <tr><td>status</td><td>String</td><td>فلتر بحالة العقار (pending, active, rejected, sold, rented). الأهم هو <code>pending</code> לעرض العقارات المعلقة.</td></tr>
                <tr><td>type</td><td>String</td><td>نوع العقار (apartment, villa, ...).</td></tr>
                <tr><td>region_id</td><td>Integer</td><td>فلتر بالمنطقة.</td></tr>
                <tr><td>search</td><td>String</td><td>كلمة بحثية في العنوان أو الوصف.</td></tr>
            </table>
        </div>

        <!-- 3.2 Approve / Reject Property -->
        <div class="avoid-break">
            <h3><span class="badge post">POST</span> <span class="endpoint-url">/api/admin/properties/{id}/approve</span> الموافقة على عقار</h3>
            <h3><span class="badge post">POST</span> <span class="endpoint-url">/api/admin/properties/{id}/reject</span> رفض عقار</h3>
            <p class="desc">لإنهاء عملية المراجعة وتحويل العقار من <code>pending</code> إلى <code>active</code> أو <code>rejected</code>.</p>
            
            <table>
                <tr><th>الحقل (Body - للرفض فقط)</th><th>النوع</th><th>الوصف</th></tr>
                <tr><td>reason</td><td>String</td><td>(مطلوب للرفض، كحد أقصى 1000 حرف) سبب الرفض لتوضيحه للمالك.</td></tr>
            </table>

            <div class="alert alert-info">
                <strong>آثار جانبية (إشعارات):</strong>
                <ul>
                    <li>عند <strong>الموافقة</strong>: يُرسل إشعار Firebase لمالك العقار (تمت الموافقة).</li>
                    <li>عند <strong>الرفض</strong>: يُرسل إشعار Firebase للمالك يتضمن الرسالة و <code>reason</code> المدخل.</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- 4. Contact Requests -->
    <div class="container page-break" id="contacts">
        <h2>4. إدارة طلبات التواصل (Contact Requests)</h2>
        <p class="desc">طلبات التواصل هي الطلبات التي يرسلها المستخدمون العاديون لأصحاب العقارات، والتي قد تمر عبر مراجعة الأدمن أولًا (إشراف).</p>

        <!-- 4.1 Get Contact Requests -->
        <div class="avoid-break">
            <h3><span class="badge get">GET</span> <span class="endpoint-url">/api/admin/contact-requests</span> عرض طلبات التواصل</h3>
            <p class="desc">يعرض كل طلبات التواصل بين المستخدمين لغرض التدقيق.</p>
            <table>
                 <tr><th>المعلمة (Query)</th><th>النوع</th><th>الوصف</th></tr>
                 <tr><td>status</td><td>String</td><td>فلترة بحالة الطلب (pending, approved, rejected).</td></tr>
            </table>
        </div>

        <!-- 4.2 Approve / Reject Contact -->
        <div class="avoid-break">
            <h3><span class="badge post">POST</span> <span class="endpoint-url">/api/admin/contact-requests/{id}/approve</span> موافقة على طلب التواصل</h3>
            <h3><span class="badge post">POST</span> <span class="endpoint-url">/api/admin/contact-requests/{id}/reject</span> رفض طلب التواصل</h3>
            <p class="desc">تغيير حالة الطلب من معلق إلى موافق عليه أو مرفوض. (يمكن رفض الطلب في حال كان مزعجاً Spam مثلاً).</p>
            
            <table>
                <tr><th>الحقل (Body - للرفض فقط)</th><th>النوع</th><th>الوصف</th></tr>
                <tr><td>reason</td><td>String</td><td>(مطلوب للرفض) يوضع سبب الرفض.</td></tr>
            </table>

            <div class="alert alert-info">
                <strong>آثار جانبية (إشعارات):</strong>
                <ul>
                    <li>عند <strong>الموافقة</strong>: يتم إرسال إشعار للمستخدم (صاحب الطلب) يخبره بالموافقة مع <strong>إرفاق رقم هاتف المكتب (المالك)</strong> للتواصل.</li>
                    <li>عند <strong>الرفض</strong>: يتم إرسال إشعار للمستخدم يفيد برفض الطلب مع السبب.</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- 5. Regions -->
    <div class="container page-break" id="regions">
        <h2>5. إدارة المناطق (Regions Management)</h2>
        <p class="desc">للتحكم بهيكل الدولة، المحافظات، المدن، والأحياء (Tree Structure).</p>

        <div class="avoid-break">
            <h3><span class="badge put">PUT</span> <span class="endpoint-url">/api/admin/regions/{id}</span> تعديل بيانات منطقة</h3>
            <h3><span class="badge delete">DELETE</span> <span class="endpoint-url">/api/admin/regions/{id}</span> حذف منطقة</h3>
            <p class="desc">تعديل اسم المنطقة أو حذفها بالكامل (مع مراعاة القيود في قاعدة البيانات عند وجود عقارات مرتبطة).</p>
            <table>
                <tr><th>الحقل (Body - للتعديل)</th><th>النوع</th><th>الوصف</th></tr>
                <tr><td>name</td><td>String</td><td>اسم المنطقة الجديد.</td></tr>
                <tr><td>type</td><td>String</td><td>ينحصر بين country, governorate, city, neighborhood.</td></tr>
                <tr><td>parent_id</td><td>Integer</td><td>(اختياري) المنطقة الأب.</td></tr>
            </table>
        </div>
    </div>

    <!-- 6. Dashboard & Statistics -->
    <div class="container page-break" id="dashboard">
        <h2>6. الإحصائيات والداشبورد (Statistics & Dashboard)</h2>
        <p class="desc">واجهات العرض البصري (Charts & Summaries) التي تغذي الصفحة الرئيسية في الداشبورد للرؤية الشاملة.</p>

        <div class="avoid-break">
            <h3><span class="badge get">GET</span> <span class="endpoint-url">/api/admin/statistics</span> الخلاصة الرقمية (Counters)</h3>
            <p class="desc">إرجاع عدادات شاملة سريعة تُعرض في القوائم العلوية.</p>
            <div class="code-block">{
  "success": true,
  "data": {
    "users": { "total": 50, "owners": 10, "unverified": 5, "banned": 2 },
    "properties": { "total": 100, "today": 5, "active": 75, "pending": 10, "rented": 5, "sold": 10, "rejected": 0 },
    "contact_requests": { "total": 40, "pending": 8 }
  }
}</div>
        </div>

        <div class="avoid-break">
            <h3><span class="badge get">GET</span> <span class="endpoint-url">/api/admin/dashboard/recent-activities</span> آخر الأنشطة</h3>
            <p class="desc">إرجاع أحدث المدخلات للمراقبة (آخر المستخدمين تسجيلاً، آخر العقارات المضافة، آخر طلبات التواصل).</p>
            <p><strong>Query:</strong> <code>limit</code> (افتراضي 10).</p>
        </div>

        <div class="avoid-break">
            <h3><span class="badge get">GET</span> <span class="endpoint-url">/api/admin/dashboard/chart-data</span> بيانات الرسوم البيانية (Chart)</h3>
            <p class="desc">تستخدم لتغذية Line Charts ببيانات زمنية لعمليات التسجيل ونشر العقارات.</p>
        </div>

        <div class="avoid-break">
            <h3><span class="badge get">GET</span> <span class="endpoint-url">/api/admin/dashboard/properties-by-region</span> العقارات حسب المناطق (Pie/Bar Chart)</h3>
            <p class="desc">توضح توزع العقارات ديموغرافياً.</p>
        </div>

        <div class="avoid-break">
            <h3><span class="badge get">GET</span> <span class="endpoint-url">/api/admin/dashboard/properties-summary</span> الملخص التجميعي مع الفترات</h3>
            <p class="desc">ينشئ ملخصات مفصلة يمكن تحديد فترتها الزمنية للتقارير.</p>
            <p><strong>Query Parameters:</strong> <code>from_date</code> (تاريخ من)، <code>to_date</code> (تاريخ إلى)، <code>type</code> (نوع الفلترة: all, sold, rented).</p>
        </div>
        
        <div class="avoid-break">
            <h3><span class="badge get">GET</span> <span class="endpoint-url">/api/admin/dashboard/users-registration</span> تسجيلات المستخدمين (فترات)</h3>
            <p class="desc">تحليل نمو المستخدمين حسب النطاق الزمني.</p>
            <p><strong>Query Parameters:</strong> <code>period</code> (يومي daily, أسبوعي weekly, عام all), بالإضافة لتواريخ <code>from_date</code> و <code>to_date</code>.</p>
        </div>

    </div>

    <!-- 7. Errors -->
    <div class="container page-break" id="errors">
        <h2>7. الأخطاء الشائعة وحالات الرفض (Common Errors)</h2>
        <p class="desc">هذه الرموز القياسية يجب أن يقوم مطور الويب (Frontend) بالتعامل معها بنوافذ تحذيرية مناسبة.</p>
        
        <table>
            <tr><th>كود الخطأ (HTTP Status)</th><th>سبب الحدوث (السياق في الداشبورد)</th><th>الإجراء المقترح على الواجهة</th></tr>
            <tr><td><strong>401 Unauthorized</strong></td><td>الـ Token غير مرسل، أو انتهت صلاحيته.</td><td>إعادة التوجيه لصفحة تسجيل الدخول ومسح الـ Token المخزن محلياً.</td></tr>
            <tr><td><strong>403 Forbidden</strong></td><td>المستخدم يملك Token صالح، لكن دوره ليس <code>admin</code> (أو منعه نظام الـ Gate).</td><td>عرض رسالة "لا تملك صلاحيات إدارة النظام".</td></tr>
            <tr><td><strong>404 Not Found</strong></td><td>المعرّف <code>{id}</code> غير صحيح لعقار، مستخدم، منطقة، أو طلب تواصل.</td><td>عرض "العنصر غير موجود" وعدم الاستمرار بالطلب.</td></tr>
            <tr><td><strong>400 Bad Request</strong></td><td>القيام بعملية غير منطقية (مثل توثيق مستخدم تم توثيقه مسبقاً، أو قبول طلب تمت معالجته بالفعل).</td><td>عرض الرسالة المرجعة من الـ Backend بالنص (مثال: "المستخدم موثق مسبقاً").</td></tr>
            <tr><td><strong>422 Unprocessable Entity</strong></td><td>نقص في المتطلبات. (مثلاً الضغط على 'رفض' دون إدخال سبب <code>reason</code>).</td><td>عرض رسالة تحت الحقل المفقود أو تنبيه: "يجب تعبئة سبب الرفض".</td></tr>
        </table>
        
        <div class="alert alert-info" style="margin-top: 30px;">
            <strong>نصيحة تقنية مهمة:</strong> في حال كان هناك أي استجابة ناجحة تتضمن تعديلاً (Approve/Reject)، يجب على صفحة الداشبورد إعادة جلب (Refetch) قائمة الانتظار، أو إزالة العنصر من المصفوفة محلياً (Optimistic UI Update) لتجنب استدعاء نفس الـ ID مرتين.
        </div>
    </div>

</body>
</html>
`;

async function generatePDF() {
    console.log('Generating Admin_Dashboard_API_AR.pdf...');

    // Launch puppeteer
    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();
    
    // Output HTML to PDF correctly formatted.
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Emulate print CSS to ensure styling works properly
    await page.emulateMediaType('print');
    
    const outputPath = join(__dirname, 'Admin_Dashboard_API_AR.pdf');
    
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            bottom: '20mm',
            right: '15mm',
            left: '15mm'
        }
    });

    await browser.close();
    console.log('PDF generated successfully at:', outputPath);
}

generatePDF().catch(console.error);
