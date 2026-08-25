
# مصدر طريقة التشغيل الرسمية

اعتمدت المرحلة الثالثة على توثيق Google الرسمي: صفحة https://developers.google.com/youtube/android توضّح أن YouTube IFrame Player API يتيح دمج تشغيل الفيديو داخل تطبيقات Android والتحكم به، وأنه يحمّل ويشغّل فيديوهات وقوائم YouTube. كما أن https://developers.google.com/youtube/iframe_api_reference هو المرجع الرسمي لواجهة IFrame Player API. لا يستخدم التطبيق رابط فتح خارجيًا كحل بديل، ولا يعيد استضافة الفيديو.

## سبب فشل المحتوى في الإصلاح الحرج

كان `YOUTUBE_API_KEY` موجودًا، لكن متغير `EXPO_PUBLIC_YOUTUBE_API_KEY` كان موجودًا بقيمة مختلفة وقديمة، وكان محمّل البيئة لا يستبدله بسبب شرط يمنع الكتابة فوق متغير Expo موجود. لذلك كانت نسخة التطبيق ترسل مفتاحًا مختلفًا عن السر الصحيح. تم إصلاح الأولوية بحيث يُمرّر `YOUTUBE_API_KEY` إلى `EXPO_PUBLIC_YOUTUBE_API_KEY` عند وجوده، ثم إعادة تشغيل Expo. كما تم تغيير مصدر فيديوهات القناة من `search` إلى `channels.contentDetails.relatedPlaylists.uploads` ثم `playlistItems`، وتقسيم طلبات `videos` إلى دفعات لا تتجاوز 50 معرفًا.
