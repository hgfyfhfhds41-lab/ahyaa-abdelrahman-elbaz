# بناء Android من داخل GitHub Actions

## ما تم تجهيزه

يحتوي المستودع على Workflow باسم `Build Android APK` في `.github/workflows/build-android.yml`. عند تشغيله يدويًا من تبويب Actions أو عند دفع commit إلى فرع `main`، يقوم GitHub بتثبيت Node وpnpm وJava 17 وAndroid SDK، ثم يثبت الاعتماديات، يتحقق من TypeScript، ينشئ مشروع Android من Expo، ويبني Debug APK ويرفعه كـArtifact باسم `ahyaa-abdelrahman-elbaz-debug-apk`.

## إعداد YouTube API Key

من GitHub افتح المستودع ثم Settings → Secrets and variables → Actions → New repository secret. أنشئ Secret بالاسم الدقيق:

```text
YOUTUBE_API_KEY
```

ضع قيمة مفتاح YouTube Data API v3 في خانة القيمة فقط. لا تضعه في أي ملف، ولا في README، ولا في commit، ولا داخل إعدادات Expo العامة. الـWorkflow يمرر السر إلى `app.config.ts` عبر متغير البيئة وقت البناء، ويحتفظ به خارج المستودع.

## تشغيل البناء

افتح تبويب Actions، اختر `Build Android APK`، اضغط Run workflow، ثم اختر فرع `main` واضغط التشغيل. بعد انتهاء المهمة افتحها، ثم نزّل Artifact المسمى `ahyaa-abdelrahman-elbaz-debug-apk`. فك الضغط وثبّت `app-debug.apk` على جهاز Android مع السماح بالتثبيت من هذا المصدر عند الحاجة.

## ملاحظات التوقيع

هذا Workflow ينتج Debug APK قابلًا للتجربة، وليس Release APK موقّعًا للنشر على Google Play. للنشر يلزم إعداد keystore إصدار حقيقي وتخزينه في GitHub Secrets أو استخدام خدمة توقيع آمنة، مع عدم رفع ملف keystore إلى GitHub. لا تخمّن SHA-1؛ يجب استخدام بصمة شهادة التوقيع الفعلية.

## حدود الاختبار

نجاح Workflow يعني أن البناء تم على خادم GitHub، لكنه لا يضمن تطابق المعاينة Web أو عمل WebView وOAuth في كل جهاز. يجب اختبار APK فعليًا على Android، خصوصًا جلب القناة والفيديوهات، تشغيل الفيديو، ملء الشاشة، تسجيل الدخول، وحالات انقطاع الشبكة.

## الأمان

لا يحتوي المستودع على API Key أو Client Secret أو Access Token أو keystore. لا ترسل هذه القيم في Issues أو Pull Requests أو لقطات الشاشة. إذا تسرب أي مفتاح، ألغِه من مزوده وأنشئ بديلًا من خلال قناة الأسرار الآمنة.
