# وِرشة | واجهة إدارة الورش

واجهة React عربية باتجاه RTL للاتصال بواجهة MechanicShop ASP.NET Core API. هذا المشروع داخل مجلد مستقل وبمستودع Git خاص به، ولا يغيّر ملفات الخادم.

## التقنية

React وTypeScript وVite وReact Router وTailwind CSS وTanStack Query وAxios وReact Hook Form وZod وLucide وRecharts.

## التشغيل المحلي

يتطلب Node.js 20.19+ أو 22.12+ ومدير حزم pnpm.

```powershell
cd frontend
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

الخادم المحلي الحالي يستمع على `http://localhost:5106` وفق `src/MechanicShop.Api/Properties/launchSettings.json`. حدّث `VITE_API_URL` في `.env.local` عند استخدام عنوان آخر. إعداد CORS في الخادم يجب أن يسمح بعنوان Vite المحلي.

## الوظائف المتصلة حاليًا

- تسجيل الدخول عبر `POST /identity/token/generate` والتحقق من المستخدم عبر `GET /identity/current-user/claims`.
- تجديد زوج الرموز من `POST /identity/token/refresh-token`، والخروج عبر `POST /identity/logout`.
- ملخص اليوم من `GET /api/v1.0/dashboard/stats?date=YYYY-MM-DD`.
- قائمة الفروع المسموح بها من `GET /api/v1.0/branches`.
- قائمة أوامر الشغل المرقمة من `GET /api/v1.0/workorders`.
- واجهة RTL عربية وتجاوب مع الشاشات الصغيرة، ورسائل تحميل وخطأ وفراغ.

## صلاحيات وقيود الخادم

الخادم هو مصدر الصلاحيات النهائي. تعرض الواجهة الصفحات المدعومة فقط، وتستخدم بيانات الحساب التي يرجعها الخادم. لا توجد واجهات API مستقلة للتقارير التاريخية أو سجل النشاط، ولا توجد قائمة فواتير مستقلة؛ لذلك لا تعرض هذه الصفحات أرقامًا أو بيانات تمثيلية. إدارة العملاء والمركبات والموظفين والمهام والفواتير ما زالت بحاجة إلى توصيل بقية عمليات الخادم قبل اعتبارها منجزة. اختيار/تغيير الفرع الافتراضي له واجهة API، لكن اختيار سياق الفرع وتصفية النتائج لم يتم استكمالهما هنا.

## البناء والتحقق

```powershell
pnpm build
pnpm test
```

لم يكتمل تثبيت الحزم أو البناء في بيئة الإنشاء الحالية؛ pnpm يواجه منع `EPERM` عند حل مسار مجلد المشروع. يلزم إعادة تشغيل التثبيت والبناء في بيئة Node/pnpm لديها وصول للمجلد.

