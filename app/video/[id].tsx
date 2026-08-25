import React, { useEffect, useMemo, useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { DESIGN } from "@/constants/design-system";
import { youtube, type YouTubePlaylistItem, type YouTubeVideo } from "@/lib/youtube";

const playerHtml = (id: string) => `<!doctype html><html><body style="margin:0;background:#061719"><div id="player"></div><script>var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';document.head.appendChild(tag);var player;function send(s){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({state:s}))}function onYouTubeIframeAPIReady(){player=new YT.Player('player',{width:'100%',height:'100%',videoId:'${id}',playerVars:{playsinline:1,controls:1,rel:0,modestbranding:1},events:{onReady:function(){send('ready')},onStateChange:function(e){send(e.data===1?'playing':e.data===2?'paused':e.data===3?'buffering':e.data===0?'ended':'ready')},onError:function(){send('error')}}})}</script></body></html>`;

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
  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const nextState = JSON.parse(event.nativeEvent.data).state as string;
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
                <WebView source={{ html }} onMessage={onMessage} javaScriptEnabled allowsInlineMediaPlayback mediaPlaybackRequiresUserAction originWhitelist={["*"]} />
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
