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

يتصل الفرونت مباشرة بالباك إند عبر HTTPS على `https://localhost:7169`. أصول Vite المحلية على المنفذين 5173 و5174 مضافة إلى CORS. جهّز شهادة التطوير قبل أول تشغيل:

```powershell
dotnet dev-certs https --trust
```

شغّل API في نافذة PowerShell ثانية من نسخة الباك إند:

```powershell
dotnet run --project src/MechanicShop.Api --launch-profile https
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

- يرسل المتصفح طلبات API مباشرة إلى `https://localhost:7169`، ويستخدم SignalR بروكسي Vite إلى عنوان HTTPS نفسه.
- أصول التطوير المسموح بها في الباك إند هي `http://localhost` و`https://localhost` على المنفذين 5173 و5174.
- عند تغيير عنوان API، حدّث `VITE_API_URL` و`VITE_API_PROXY_TARGET` في `.env.local`، وأضف أصل الواجهة الدقيق إلى `AppSettings:AllowedOrigins`.
- لا ترفع `.env.local` أو تضع كلمات مرور/أسرارًا فيه. الملف مخصص لإعداد جهازك.
- يمكن إيقاف خادم التطوير بـ `Ctrl+C`.

## أوامر إضافية

```powershell
pnpm build
pnpm test
```

صفحات أوامر الشغل والفروع ولوحة المؤشرات تتصل بالـAPI. الصفحات التي لا يدعم الخادم بياناتها أو مساراتها تعرض تنبيهًا بدل بيانات تجريبية.

