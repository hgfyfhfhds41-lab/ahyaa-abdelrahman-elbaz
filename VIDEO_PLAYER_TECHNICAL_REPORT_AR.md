# التقرير الفني لمشغل فيديو YouTube

**المشروع:** أحياء مع عبدالرحمن الباز  
**النطاق:** وصف النسخة الحالية في المشروع، دون تعديل الكود  
**تاريخ التقرير:** 26 أغسطس 2026

## الخلاصة التنفيذية

المشروع لا يستخدم `react-native-youtube-iframe`. المكتبة الأصلية المستخدمة على Android هي `react-native-webview` بالإصدار المعلن في `package.json` وهو `^14.0.1`. داخل الـWebView تُحمَّل **YouTube IFrame Player API** الرسمية من `https://www.youtube.com/iframe_api`، ثم تُنشأ كائنات `YT.Player` باستخدام Video ID حقيقي. أما Web Preview فتستخدم عنصر HTML `iframe` مباشرًا إلى عنوان `https://www.youtube.com/embed/{VIDEO_ID}`. هذا فصل مقصود بين مسار Android الأصلي ومسار المعاينة Web.

> **تمييز مهم:** مفتاح `YOUTUBE_API_KEY` مطلوب لجلب بيانات القناة والفيديوهات وقوائم التشغيل من YouTube Data API v3. المفتاح لا يشغّل الفيديو بحد ذاته؛ تشغيل الفيديو يعتمد على YouTube embed/IFrame وVideo ID وسياسة قابلية التضمين الخاصة بالفيديو.

## 1. المكتبات والإصدارات

| الوظيفة | المكتبة أو الطريقة | الإصدار/الحالة الحالية |
|---|---|---|
| تشغيل Android | `react-native-webview` | `^14.0.1` في `package.json` |
| واجهة التشغيل الرسمية | YouTube IFrame Player API | تُحمّل من YouTube داخل صفحة HTML في WebView |
| تشغيل Web Preview | عنصر HTML `iframe` بعنوان `/embed/VIDEO_ID` | ليس `react-native-webview` |
| قفل اتجاه الشاشة | `expo-screen-orientation` | `~9.0.9` |
| شريط التنقل Android | `expo-navigation-bar` | `~5.0.10` |
| إطار التطبيق | Expo SDK 54 / React Native 0.81 | بحسب `package.json` |

لا توجد في النسخة الحالية مكتبة `react-native-youtube-iframe`. المكوّن يعتمد على `WebView` مباشرة في Android، مع جسر رسائل `postMessage` من صفحة المشغل إلى React Native.

## 2. طريقة تشغيل الفيديو وتمرير Video ID

تصل الشاشة إلى Video ID من مسار Expo Router. في `app/video/[id].tsx` تتم قراءة المعامل هكذا:

```tsx
const { id } = useLocalSearchParams<{ id: string }>();
```

بعد ذلك تُجلب الفيديوهات الحقيقية من `youtube.fetchVideos()`، ويُبحث عن الفيديو الذي يساوي `id`. لا يُسمح بإنشاء المشغل إلا إذا كانت خاصية `embeddable` القادمة من YouTube تساوي `true`:

```tsx
const found = items.find((item) => item.id === id);
if (!found) {
  setError("الفيديو غير متاح حاليًا.");
  setState("unavailable");
  return;
}
setVideo(found);
setState(found.embeddable ? "ready" : "not-embeddable");
```

### الكود الكامل لمسار Android/WebView

هذا هو الكود الفعلي الموجود حاليًا للمكوّن والصفحة، مع الحفاظ على النصوص العربية كما هي في المشروع:

```tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { DESIGN } from "@/constants/design-system";
import { youtube, type YouTubePlaylistItem, type YouTubeVideo } from "@/lib/youtube";

const playerHtml = (id: string) => `<!doctype html><html><body style="margin:0;background:#061719"><div id="player"></div><script>var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';document.head.appendChild(tag);var player;function send(s){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({state:s}))}function onYouTubeIframeAPIReady(){player=new YT.Player('player',{width:'100%',height:'100%',videoId:'${id}',playerVars:{playsinline:1,controls:1,rel:0,modestbranding:1},events:{onReady:function(){send('ready')},onStateChange:function(e){send(e.data===1?'playing':e.data===2?'paused':e.data===3?'buffering':e.data===0?'ended':'ready')},onError:function(){send('error')}}})}function toggleFullscreen(){var iframe=player&&player.getIframe&&player.getIframe();if(document.fullscreenElement&&document.exitFullscreen){document.exitFullscreen();return}if(iframe&&iframe.requestFullscreen){iframe.requestFullscreen();send('fullscreen-enter')}}document.addEventListener('fullscreenchange',function(){send(document.fullscreenElement?'fullscreen-enter':'fullscreen-exit')});</script></body></html>`;

function WebYouTubePlayer({ videoId }: { videoId: string }) {
  return React.createElement("iframe", {
    title: "مشغل فيديو YouTube",
    src: `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?enablejsapi=1&playsinline=1&controls=1&rel=0&modestbranding=1`,
    style: { width: "100%", height: "100%", border: 0, backgroundColor: "#000" },
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    allowFullScreen: true,
  });
}

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [playlist, setPlaylist] = useState<YouTubePlaylistItem[]>([]);
  const [error, setError] = useState("");
  const [state, setState] = useState("loading");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const webViewRef = useRef<React.ComponentRef<typeof WebView>>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setState("loading");
    setError("");
    void youtube.fetchVideos().then(async (items) => {
      if (!active) return;
      const found = items.find((item) => item.id === id);
      if (!found) {
        setError("الفيديو غير متاح حاليًا.");
        setState("unavailable");
        return;
      }
      setVideo(found);
      setState(found.embeddable ? "ready" : "not-embeddable");
      const context = await youtube.findVideoPlaylistContext(found.id);
      if (active) setPlaylist(context?.items ?? []);
    }).catch((reason: unknown) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : "تعذر تحميل الفيديو حاليًا.");
      setState("error");
    });
    return () => { active = false; };
  }, [id]);

  const html = useMemo(() => (video?.embeddable ? playerHtml(video.id) : ""), [video]);

  const setFullscreenUi = async (enabled: boolean) => {
    if (Platform.OS !== "android") return;
    try {
      if (enabled) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        await NavigationBar.setVisibilityAsync("hidden");
      } else {
        await NavigationBar.setVisibilityAsync("visible");
        await NavigationBar.setBehaviorAsync("inset-swipe");
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
      setIsFullscreen(enabled);
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    return () => {
      if (Platform.OS === "android") {
        void NavigationBar.setVisibilityAsync("visible");
        void NavigationBar.setBehaviorAsync("inset-swipe");
        void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (Platform.OS !== "android") return;
    if (isFullscreen) {
      webViewRef.current?.injectJavaScript("if(document.fullscreenElement&&document.exitFullscreen){document.exitFullscreen();} true;");
      void setFullscreenUi(false);
      return;
    }
    webViewRef.current?.injectJavaScript("if(typeof toggleFullscreen==='function'){toggleFullscreen();} true;");
    void setFullscreenUi(true);
  };

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const nextState = JSON.parse(event.nativeEvent.data).state as string;
      if (nextState === "fullscreen-enter") {
        void setFullscreenUi(true);
        return;
      }
      if (nextState === "fullscreen-exit") {
        void setFullscreenUi(false);
        return;
      }
      setState(nextState);
    } catch {
      setState("error");
    }
  };

  const statusLabels: Record<string, string> = {
    loading: "جارٍ التحميل",
    ready: "جاهز",
    playing: "يعمل",
    paused: "متوقف مؤقتًا",
    buffering: "جارٍ التخزين المؤقت",
    error: "خطأ في التشغيل",
    unavailable: "الفيديو غير متاح",
    "not-embeddable": "غير قابل للتضمين",
    ended: "انتهى",
  };
  const description = video?.description ?? "";
  const previousIndex = playlist.findIndex((item) => item.videoId === video?.id) - 1;
  const nextIndex = playlist.findIndex((item) => item.videoId === video?.id) + 1;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.icon} accessibilityLabel="رجوع">
            <MaterialIcons name="arrow-forward" size={23} color={DESIGN.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>تفاصيل الفيديو</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!video ? (
          <View style={styles.messageCard}>
            <MaterialIcons name={state === "error" ? "error-outline" : "info-outline"} size={34} color={DESIGN.colors.primary} />
            <Text style={styles.state}>{state === "loading" ? "جارٍ تحميل الفيديو…" : error || "الفيديو غير متاح حاليًا"}</Text>
          </View>
        ) : (
          <>
            <View style={styles.player}>
              {Platform.OS === "web" ? (
                video.embeddable ? <WebYouTubePlayer videoId={video.id} /> : (
                  <View style={styles.blocked}>
                    <MaterialIcons name="block" size={34} color={DESIGN.colors.danger} />
                    <Text style={styles.blockedText}>هذا الفيديو غير قابل للتضمين، ولا يمكن تشغيله داخل التطبيق.</Text>
                  </View>
                )
              ) : video.embeddable ? (
                <View style={isFullscreen ? styles.fullscreenPlayer : styles.playerInner}>
                  <WebView ref={webViewRef} source={{ html }} onMessage={onMessage} javaScriptEnabled allowsInlineMediaPlayback allowsFullscreenVideo mediaPlaybackRequiresUserAction originWhitelist={["*"]} style={styles.webView} />
                  <Pressable onPress={toggleFullscreen} style={styles.fullscreenButton} accessibilityLabel={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}>
                    <MaterialIcons name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={22} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.blocked}>
                  <MaterialIcons name="block" size={34} color={DESIGN.colors.danger} />
                  <Text style={styles.blockedText}>هذا الفيديو غير قابل للتضمين، ولا يمكن تشغيله داخل التطبيق.</Text>
                </View>
              )}
            </View>

            <Text style={styles.status}>الحالة: {statusLabels[state] ?? "جارٍ التحميل"}</Text>
            <Image source={{ uri: video.thumbnailUrl }} style={styles.image} accessibilityLabel="الصورة المصغرة للفيديو" />
            <Text style={styles.title}>{video.title}</Text>
            <Text style={styles.date}>{new Date(video.publishedAt).toLocaleDateString("ar-EG")} · {video.duration ?? "—"} · {video.views ?? 0} مشاهدة</Text>

            {description ? (
              <Pressable onPress={() => setDescriptionOpen((open) => !open)} style={styles.descriptionCard}>
                <View style={styles.descriptionHeader}>
                  <Text style={styles.descriptionLabel}>الوصف</Text>
                  <MaterialIcons name={descriptionOpen ? "expand-less" : "expand-more"} size={22} color={DESIGN.colors.primary} />
                </View>
                {descriptionOpen ? <Text style={styles.description}>{description}</Text> : <Text numberOfLines={2} style={styles.description}>{description}</Text>}
              </Pressable>
            ) : null}

            {playlist.length > 0 ? (
              <>
                <Text style={styles.nextTitle}>فيديوهات القائمة</Text>
                <View style={styles.navigationRow}>
                  <Pressable disabled={previousIndex < 0} onPress={() => router.push({ pathname: "/video/[id]", params: { id: playlist[previousIndex]?.videoId } })} style={[styles.navButton, previousIndex < 0 && styles.disabled]}>
                    <MaterialIcons name="skip-previous" size={20} color={DESIGN.colors.text} />
                    <Text style={styles.navText}>السابق</Text>
                  </Pressable>
                  <Pressable disabled={nextIndex >= playlist.length} onPress={() => router.push({ pathname: "/video/[id]", params: { id: playlist[nextIndex]?.videoId } })} style={[styles.navButton, nextIndex >= playlist.length && styles.disabled]}>
                    <Text style={styles.navText}>التالي</Text>
                    <MaterialIcons name="skip-next" size={20} color={DESIGN.colors.text} />
                  </Pressable>
                </View>
                {playlist.map((item, index) => (
                  <Pressable key={item.id} onPress={() => router.push({ pathname: "/video/[id]", params: { id: item.videoId } })} style={[styles.nextRow, item.videoId === video.id && styles.current]}>
                    <Text style={styles.nextPosition}>{index + 1}</Text>
                    <Image source={{ uri: item.thumbnailUrl }} style={styles.nextThumb} />
                    <Text numberOfLines={2} style={styles.nextText}>{item.title}</Text>
                  </Pressable>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingBottom: 30 },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: DESIGN.colors.surface, alignItems: "center", justifyContent: "center" },
  headerSpacer: { width: 42 },
  headerTitle: { color: DESIGN.colors.text, fontSize: 21, fontWeight: "900" },
  player: { width: "100%", height: 220, borderRadius: 20, overflow: "hidden", backgroundColor: "#000" },
  playerInner: { flex: 1, backgroundColor: "#000" },
  fullscreenPlayer: { ...StyleSheet.absoluteFillObject, zIndex: 20, backgroundColor: "#000" },
  webView: { flex: 1, backgroundColor: "#000" },
  fullscreenButton: { position: "absolute", right: 12, bottom: 12, width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center" },
  blocked: { flex: 1, alignItems: "center", justifyContent: "center", padding: 25 },
  blockedText: { color: DESIGN.colors.text, textAlign: "center", marginTop: 10, lineHeight: 22 },
  messageCard: { minHeight: 180, borderRadius: 20, backgroundColor: DESIGN.colors.surface, alignItems: "center", justifyContent: "center", padding: 24 },
  state: { color: DESIGN.colors.textMuted, textAlign: "center", paddingTop: 12, lineHeight: 24 },
  status: { color: DESIGN.colors.primary, textAlign: "right", marginTop: 10 },
  image: { width: "100%", height: 190, borderRadius: 18, marginTop: 17 },
  title: { color: DESIGN.colors.text, fontSize: 21, fontWeight: "900", textAlign: "right", marginTop: 16, lineHeight: 29 },
  date: { color: DESIGN.colors.textMuted, textAlign: "right", marginTop: 7 },
  descriptionCard: { backgroundColor: DESIGN.colors.surface, borderRadius: 16, padding: 14, marginTop: 18 },
  descriptionHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  descriptionLabel: { color: DESIGN.colors.text, fontWeight: "900", fontSize: 16 },
  description: { color: DESIGN.colors.textMuted, fontSize: 14, lineHeight: 23, textAlign: "right", marginTop: 10 },
  nextTitle: { color: DESIGN.colors.text, fontSize: 19, fontWeight: "900", textAlign: "right", marginTop: 24, marginBottom: 10 },
  navigationRow: { flexDirection: "row-reverse", justifyContent: "space-between", gap: 10, marginBottom: 8 },
  navButton: { flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: DESIGN.colors.surface, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 },
  navText: { color: DESIGN.colors.text, fontWeight: "800" },
  disabled: { opacity: 0.4 },
  nextRow: { flexDirection: "row-reverse", alignItems: "center", gap: 9, padding: 8, borderRadius: 14, backgroundColor: DESIGN.colors.surface, marginBottom: 8 },
  current: { borderWidth: 1, borderColor: DESIGN.colors.primary },
  nextPosition: { color: DESIGN.colors.primary, fontWeight: "900", width: 20, textAlign: "center" },
  nextThumb: { width: 92, height: 58, borderRadius: 9 },
  nextText: { flex: 1, color: DESIGN.colors.text, fontSize: 13, fontWeight: "700", textAlign: "right" },
});
```

### تمرير Video ID من البطاقة إلى الشاشة

بطاقة الفيديو في الشاشة الرئيسية تمرر المعرف الحقيقي إلى المسار:

```tsx
<Pressable
  key={video.id}
  onPress={() =>
    router.push({
      pathname: "/video/[id]",
      params: { id: video.id },
    })
  }
>
  {/* الصورة والعنوان الحقيقيان */}
</Pressable>
```

إذن قيمة `videoId` لا تُنشأ محليًا ولا تُستبدل بمعرف تجريبي؛ مصدرها `item.id` من استجابة YouTube Data API.

## 3. جلب القناة والفيديوهات وقوائم التشغيل

المشروع يستخدم **YouTube Data API v3** عبر طلبات HTTPS مباشرة من التطبيق، لا خدمة بديلة. يستخدم Channel ID الثابت التالي:

```ts
export const OFFICIAL_CHANNEL_ID = "UCZJdmjp4Mt-wU7miDGMEOuA";
```

مسار الجلب كالتالي:

| البيانات | الطلب الرسمي | الاستخدام |
|---|---|---|
| القناة | `channels` مع `part=snippet,statistics,contentDetails` و`id=CHANNEL_ID` | الاسم، الصورة، الوصف، الإحصاءات، ومعرف Uploads Playlist |
| فيديوهات القناة | `playlistItems` على Uploads Playlist ثم `videos` بدفعات ID | المعرف، العنوان، الصورة، الوصف، التاريخ، المدة، الإحصاءات، `status.embeddable` |
| قوائم التشغيل | `playlists` مع `channelId=CHANNEL_ID` | العنوان، الصورة، الوصف، وعدد العناصر |
| عناصر قائمة تشغيل | `playlistItems` مع `playlistId` | الترتيب الحقيقي، Video ID، العنوان والصورة |

يستخدم العميل Pagination عبر `nextPageToken` في الدالة `collect`. كما يقسم قائمة Video IDs إلى دفعات لا تتجاوز 50 معرفًا عند طلب `videos`.

### وظيفة طلب API باختصار

```ts
async function request<T>(resource: string, params: Record<string, string>) {
  assertConfigured();
  const url = new URL(`${API_BASE}/${resource}`);
  Object.entries({ ...params, key: API_KEY }).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const headers: Record<string, string> = {};
    if (RUNTIME_CONFIG.identity.packageName)
      headers["X-Android-Package"] = RUNTIME_CONFIG.identity.packageName;
    if (RUNTIME_CONFIG.identity.certSha1)
      headers["X-Android-Cert"] = RUNTIME_CONFIG.identity.certSha1;

    const response = await fetch(url, { signal: controller.signal, headers });
    const payload = await response.json() as T;
    if (!response.ok) throw new Error(/* رسالة عربية حسب الخطأ */);
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}
```

### هل API Key للتشغيل أم للجلب؟

المفتاح يستخدم لطلبات **YouTube Data API v3** فقط، أي للجلب والقراءة العامة. لا يُمرر إلى `YT.Player` ولا إلى عنوان embed بغرض تشغيل الفيديو. تشغيل الفيديو يمرر Video ID إلى IFrame Player API. وبما أن التطبيق يتصل مباشرة من العميل، فإن مفتاح Data API سيظهر تقنيًا داخل حزمة التطبيق بعد البناء؛ لذلك يجب تقييده في Google Cloud باسم حزمة Android وبصمة SHA-1، وتقييده إلى YouTube Data API v3. لا ينبغي اعتباره سرًا قابلًا للإخفاء داخل APK.

## 4. Player Parameters وHeaders وأخطاء 152/153

### إعدادات IFrame الموجودة فعليًا

في مسار Android، تُستخدم هذه `playerVars`:

```js
playerVars: {
  playsinline: 1,
  controls: 1,
  rel: 0,
  modestbranding: 1,
}
```

وفي Web Preview، يستخدم عنوان embed:

```text
https://www.youtube.com/embed/VIDEO_ID?enablejsapi=1&playsinline=1&controls=1&rel=0&modestbranding=1
```

وتُسمح خصائص الوسائط التالية في iframe Web:

```text
accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share
```

### ما الذي لم يُستخدم؟

من المهم تصحيح أي انطباع سابق: الكود الحالي **لا يضع Header مخصصًا باسم `Origin` أو `Referer`** لمشغل الفيديو، ولا يزوّر هذه الرؤوس، ولا يستخدم Proxy أو مسارًا لتجاوز YouTube. كذلك `originWhitelist={["*"]}` هي خاصية سماح للتنقل داخل WebView وليست تعيينًا لقيمة HTTP Origin أو Referer.

رؤوس `X-Android-Package` و`X-Android-Cert` تظهر فقط في طلبات Data API عندما تتوفر هوية Android من `Expo extra`. هذه الرؤوس تساعد في تقييد مفتاح Google API، لكنها ليست إعدادات لتشغيل IFrame، ولا تعالج قيود فيديو غير قابل للتضمين.

### العلاقة مع الخطأين 152 و153

لا يوجد في المشروع كود خاص يتعهد بإزالة الخطأ 152 أو 153. المشغل يستخدم المسار الرسمي، ويفحص `status.embeddable` قبل محاولة التشغيل، ويترك عناصر YouTube الإلزامية كما هي. إذا منع YouTube التشغيل بسبب سياسة الفيديو أو إعداد embed أو بيئة WebView، يعرض التطبيق حالة خطأ ولا يفتح YouTube خارجيًا تلقائيًا.

حسب توثيق YouTube، يجب استخدام صيغة embed وIFrame API الرسمية وإعدادات player parameters المسموح بها [1] [2]. لا يجوز اعتبار إضافة `Referer` مصطنع أو تغيير `Origin` حلًا رسميًا. نجاح Data API لا يساوي بالضرورة نجاح تشغيل كل فيديو؛ فخاصية `embeddable` مستقلة عن جلب metadata.

## 5. ملء الشاشة والتدوير

### دخول ملء الشاشة

عند الضغط على الزر الذي يضيفه التطبيق فوق WebView في Android، ينفذ الكود الآتي منطقيًا:

```tsx
await ScreenOrientation.lockAsync(
  ScreenOrientation.OrientationLock.LANDSCAPE,
);
await NavigationBar.setBehaviorAsync("overlay-swipe");
await NavigationBar.setVisibilityAsync("hidden");
setIsFullscreen(true);
```

وفي صفحة HTML يحاول المشغل الرسمي طلب ملء الشاشة من iframe نفسه:

```js
function toggleFullscreen() {
  var iframe = player && player.getIframe && player.getIframe();
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen();
    return;
  }
  if (iframe && iframe.requestFullscreen) {
    iframe.requestFullscreen();
    send('fullscreen-enter');
  }
}
```

ثم تُرسل أحداث `fullscreenchange` عبر `window.ReactNativeWebView.postMessage`، وتستقبلها React Native في `onMessage` لتحديث الحالة.

### الخروج والعودة إلى Portrait

عند الخروج، يظهر شريط النظام ويُعاد السلوك العادي، ثم يُقفل الاتجاه إلى Portrait:

```tsx
await NavigationBar.setVisibilityAsync("visible");
await NavigationBar.setBehaviorAsync("inset-swipe");
await ScreenOrientation.lockAsync(
  ScreenOrientation.OrientationLock.PORTRAIT_UP,
);
setIsFullscreen(false);
```

كما ينفذ `useEffect` عملية تنظيف عند مغادرة شاشة الفيديو لضمان إعادة شريط النظام والاتجاه العمودي حتى لو غادر المستخدم الشاشة أثناء الوضع الأفقي.

### حدود الاختبار

المعاينة Web لا تستخدم `react-native-webview`، بل تستخدم iframe HTML، لذلك لا يمكنها إثبات سلوك WebView أو التدوير Android. التحقق النهائي من ملء الشاشة، Landscape/Portrait، Play/Pause، Buffering، وسياسات WebView يحتاج APK أو Development Build مثبتًا على جهاز Android فعلي.

## 6. نقاط أمان وتشغيل مهمة

لا يوجد API Key أو Client Secret في هذا التقرير. المفتاح يُقرأ من runtime configuration/Expo Secret ولا ينبغي وضع قيمته في GitHub أو داخل ملفات المصدر. مع الاتصال المباشر من التطبيق، يجب اعتبار Data API key قابلًا للاستخراج من APK وتقييده بقوة في Google Cloud.

كما أن التطبيق يعرض واجهته قبل اكتمال طلب YouTube، ويستخدم مهلة 15 ثانية ومعالجة رسائل عربية لحالات عدم إعداد المفتاح، رفض الطلب، انتهاء المهلة، فشل الشبكة، تجاوز الحصة، وعدم قابلية التضمين. لذلك فإن عدم ظهور البيانات في معاينة معينة قد يعني أن المعاينة لم تحصل على Secret وقت تشغيل Metro، أو أن الصفحة القديمة ما زالت مخزنة، أو أن الطلب رُفض بسبب قيود المفتاح؛ لا يكفي وجود Secret في GitHub لإثبات وصوله إلى Expo Preview.

## المراجع

[1]: https://developers.google.com/youtube/iframe_api_reference "YouTube IFrame Player API Reference"

[2]: https://developers.google.com/youtube/player_parameters "YouTube Embedded Players and Player Parameters"

[3]: https://developers.google.com/youtube/v3/docs/channels "YouTube Data API — Channels"

[4]: https://developers.google.com/youtube/v3/docs/playlistItems/list "YouTube Data API — PlaylistItems: list"

[5]: https://developers.google.com/youtube/v3/docs/videos "YouTube Data API — Videos"

[6]: https://developers.google.com/youtube/v3/docs/playlists/list "YouTube Data API — Playlists: list"

[7]: https://docs.expo.dev/versions/latest/sdk/screen-orientation/ "Expo ScreenOrientation"

[8]: https://docs.expo.dev/versions/latest/sdk/navigation-bar/ "Expo NavigationBar"
