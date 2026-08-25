# تقرير تجهيز YouTube OAuth الفعلي

## نطاق التنفيذ

تم تنفيذ هذه المرحلة فقط دون إضافة شاشة الاشتراك الإجباري، ودون Build أو APK أو استخدام Expo/EAS Build. لم يتغير التصميم، أو Channel ID، أو مصدر بيانات القناة والفيديوهات، ولم تُضف بيانات وهمية أو أسرار إلى الكود أو GitHub.

## 1. OAuth الحالي

تسجيل الدخول الموجود حاليًا هو **Manus OAuth**. في Android يفتح مسار `/app-auth`، ثم يستقبل callback التطبيق كودًا مؤقتًا، ويستبدله الخادم ببيانات المستخدم ويُرجع `app_session_id` وبيانات الحساب. هذا الرمز يعرّف جلسة التطبيق فقط؛ ليس Google access token ولا YouTube access token، ولا يمنح صلاحية `subscriptions.list`.

لم أحذف مسار تسجيل الدخول الحالي ولم أستخدم جلسة Manus كبديل غير صحيح. بناءً على البنية الحالية، نحتاج إلى **Google OAuth مستقل أو توسيعًا صريحًا لمزود OAuth الحالي** ليطلب نطاق YouTube ويعيد تفويض YouTube مناسبًا. لا يمكن استخراج YouTube token من `app_session_id`.

## 2. ما تم تجهيزه في الكود

تم تثبيت تعريف النطاق الأقل المطلوب للقراءة فقط:

```text
https://www.googleapis.com/auth/youtube.readonly
```

تم تجهيز طبقة `lib/youtube-subscription.ts` التي:

- تستدعي endpoint الرسمي `subscriptions.list` باستخدام `mine=true` و`forChannelId` للقناة الحالية.
- لا تعمل إلا عند تمرير YouTube access token حقيقي.
- تستخدم `Authorization: Bearer` ولا تستخدم API Key لفحص اشتراك المستخدم.
- تخزن YouTube token، إذا أصبح متاحًا لاحقًا، عبر `expo-secure-store` بدل تضمينه في الكود.
- تعيد حالات واضحة: `subscribed`، `not-subscribed`، `oauth-required`، `token-expired`، و`error`.
- لا تنفذ شاشة الاشتراك الإجباري أو أي اشتراك تلقائي.

القناة المستخدمة بقيت كما هي: `UCZJdmjp4Mt-wU7miDGMEOuA`.

## 3. اسم حزمة Android وSHA-1

| البند | النتيجة |
|---|---|
| اسم حزمة Android الفعلي | `com.app.ahyaaabdelrahmanelbaz` |
| scheme الحالي | مشتق من إعداد التطبيق الحالي، وليس قيمة SHA-1 |
| مشروع Android أصلي داخل المستودع | غير موجود؛ المشروع Expo Managed |
| keystore أو APK/AAB محلي يمكن استخراج الشهادة منه | غير موجود في البيئة |
| SHA-1 | **غير متوفر**؛ لم يتم تخمينه أو اختراع قيمة له |

توضح Google أن SHA-1 يجب أن يكون لشهادة التوقيع الفعلية. إذا كان التطبيق يستخدم Play App Signing، يؤخذ من Google Play Console ضمن Release → Setup → App Integrity؛ أما البناء الموقّع ذاتيًا فيحتاج شهادة الإصدار الفعلية أو تقرير `signingReport`.[1]

## 4. هل أصبح YouTube Access Token متاحًا؟

**لا.** لا يعيد OAuth الحالي هذا الرمز، ولم توجد Google Android Client ID أو استجابة OAuth تتضمن YouTube authorization code/access token داخل المشروع. لذلك لم أدّعِ أن الرمز أصبح متاحًا، ولم أضع Client Secret أو token في التطبيق.

## 5. هل نجح `subscriptions.list` فعليًا؟

**لم ينجح كطلب حقيقي لحساب مستخدم مفوض**؛ لا يوجد YouTube access token ولا تفويض `youtube.readonly` متاح في البيئة. طبقة الطلب جاهزة، واختبارات الوحدة تستخدم استجابات حتمية لاختبار parsing والحالات فقط، وليست دليلًا على اشتراك أي مستخدم حقيقي.

وثائق YouTube تحدد أن `mine=true` يتطلب طلبًا مفوضًا، وأن `subscriptions.list` يمكنه إرجاع اشتراكات الحساب المصادق عليه. كما أن OAuth يحدد النطاقات التي يسمح بها المستخدم للتطبيق عند الوصول إلى بياناته الخاصة.[2] [3]

## 6. هل يستطيع التطبيق معرفة حالة الاشتراك فعليًا الآن؟

**ليس بعد.** يستطيع التطبيق معرفة الحالة فقط بعد إتمام المتطلبات الخارجية التالية:

| المطلوب | الحالة |
|---|---|
| Google Cloud Project وتفعيل YouTube Data API v3 | مطلوب التحقق خارجيًا |
| Google OAuth Client Android | غير موجود في ملفات المشروع الحالية |
| اسم الحزمة | معروف: `com.app.ahyaaabdelrahmanelbaz` |
| SHA-1 لشهادة البناء النهائي | مطلوب من مصدر التوقيع الفعلي؛ غير متوفر هنا |
| نطاق `youtube.readonly` | معرف في طبقة التحقق، لكنه غير مربوط بمسار OAuth الحالي |
| redirect URI/deep link مسجل لدى المزود | يحتاج إعداد Google OAuth Client فعلي |
| YouTube access token | غير متاح حاليًا |
| فحص اشتراك حقيقي | غير منفذ حتى يصبح token متاحًا |

## 7. الاختبارات

تم تشغيل `TypeScript` و`Vitest` و`Lint` و`Expo config` دون Build. نجحت TypeScript وLint وفحص Expo config. نجحت اختبارات Vitest: **9 اختبارات ناجحة، واختبار logout موجود مسبقًا ما زال skipped**. وتشمل الاختبارات الجديدة حالات المشترك، غير المشترك، OAuth المطلوب، انتهاء التوكن، رفض الصلاحية، وفشل الشبكة.

لم يتم اختبار Google OAuth الفعلي أو `subscriptions.list` بحساب مستخدم حقيقي، لأن ذلك يتطلب Client ID وSHA-1 وتفويضًا حقيقيًا غير متاحين في البيئة. لم يتم تنفيذ Build أو APK.

## 8. الخطوة الخارجية المطلوبة

يلزم استخراج SHA-1 من شهادة البناء التي سيستخدمها التطبيق فعلًا، وليس من قيمة تخمينية. إذا كان البناء عبر Play App Signing، يجب أخذ بصمة **App signing key certificate** من Google Play Console؛ وإذا كان عبر keystore مستقل، يجب استخراج بصمة شهادة الإصدار من ذلك keystore. بعد توفر SHA-1، يلزم إنشاء أو تزويد Google OAuth Android Client ID للحزمة المذكورة، وتسجيل redirect scheme، وتفعيل نطاق YouTube للقراءة في مسار التفويض.

بعد اكتمال هذه الإعدادات فقط يمكن ربط callback الرسمي بإصدار YouTube access token آمن، ثم اختبار `subscriptions.list` فعليًا. لا يلزم Client Secret داخل تطبيق Android؛ وأي تبادل يحتاج سرًا يجب أن يتم في جهة آمنة خارج التطبيق وفق إعداد المزود.[4]

> **الحالة النهائية:** طبقة التحقق البرمجية جاهزة ومختبرة، لكن إعداد Google OAuth الفعلي وYouTube access token وفحص اشتراك حقيقي غير جاهزين بعد بسبب غياب Google Android Client ID وSHA-1 وتفويض YouTube من OAuth الحالي. توقفت هنا حسب التعليمات، دون شاشة اشتراك أو Build.

## المراجع

[1]: https://developers.google.com/android/guides/client-auth "Google Client Authentication and SHA-1"
[2]: https://developers.google.com/youtube/v3/docs/subscriptions/list "YouTube Data API — Subscriptions: list"
[3]: https://developers.google.com/youtube/v3/guides/authentication "YouTube Data API — OAuth 2.0 Authorization"
[4]: https://docs.expo.dev/guides/authentication/ "Expo Authentication with OAuth or OpenID providers"
