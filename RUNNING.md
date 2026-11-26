# طريقة تشغيل الواجهة

## المتطلبات

- Git.
- Node.js 20.19 أو أحدث (أو 22.12 أو أحدث).
- pnpm.
- تشغيل خادم MechanicShop API محليًا، أو معرفة عنوان API متاح.

## التشغيل على Windows PowerShell

استنسخ مستودع الواجهة وافتح مجلده:

```powershell
git clone https://github.com/ahmedadel977/MechanicShop-Frontend.git
cd MechanicShop-Frontend
```

أنشئ ملف الإعدادات المحلي من المثال:

```powershell
Copy-Item .env.example .env.local
```

يستخدم Vite افتراضيًا وكيلًا محليًا إلى `http://localhost:5106`، وهو عنوان HTTP الموجود في إعداد تشغيل API الحالي. هذا يمرر طلبات الواجهة عبر نفس الأصل ويتجنب إعداد CORS للتطوير. إذا كان API يعمل على عنوان آخر، عدّل `VITE_API_PROXY_TARGET` في `.env.local`، مثل:

```dotenv
VITE_API_PROXY_TARGET=http://localhost:5106
```

شغّل API في نافذة PowerShell ثانية من نسخة الباك إند:

```powershell
dotnet run --project src/MechanicShop.Api --launch-profile http
```

ثم ثبّت حزم الواجهة وشغّل خادم التطوير:

```powershell
pnpm install
pnpm dev
```

افتح العنوان الذي يظهر في الطرفية، وغالبًا `http://localhost:5173`، وسجّل الدخول بحساب موجود في API.

إذا أوقف pnpm سكربت بناء `esbuild` برسالة `Ignored build scripts`، اعتمد الحزمة عند الطلب باستخدام:

```powershell
pnpm approve-builds
```

اختر `esbuild` ثم أعد `pnpm install`.

## إعدادات الاتصال

- في التطوير يمرر Vite `/api` و`/identity` و`/health` و`/hubs` إلى `VITE_API_PROXY_TARGET`.
- في النشر، اضبط `VITE_API_URL` إذا كان المتصفح يستطيع الوصول مباشرة إلى API؛ حينها يجب أن يسمح الخادم بأصل الواجهة في CORS.
- لا ترفع `.env.local` أو تضع كلمات مرور/أسرارًا فيه. الملف مخصص لإعداد جهازك.
- يمكن إيقاف خادم التطوير بـ `Ctrl+C`.

## أوامر إضافية

```powershell
pnpm build
pnpm test
```

صفحات أوامر الشغل والفروع ولوحة المؤشرات تتصل بالـAPI. الصفحات التي لا يدعم الخادم بياناتها أو مساراتها تعرض تنبيهًا بدل بيانات تجريبية.

