import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { DESIGN } from "@/constants/design-system";
import { youtube, OFFICIAL_CHANNEL_HANDLE, type YouTubeChannel, type YouTubeVideo, type YouTubePlaylist } from "@/lib/youtube";

const formatDate = (value: string) => new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" }).format(new Date(value));
const formatCount = (value?: number) => value == null || Number.isNaN(value) ? "—" : new Intl.NumberFormat("ar-EG", { notation: "compact" }).format(value);

type ResultError = { ok: false; error: unknown };

type ResultValue<T> = { ok: true; value: T } | ResultError;

export default function HomeScreen() {
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [channelError, setChannelError] = useState("");
  const [contentError, setContentError] = useState("");

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setChannelError(""); setContentError("");
    const channelResult: ResultValue<YouTubeChannel> = await youtube.fetchChannel().then(value => ({ ok: true as const, value })).catch(error => ({ ok: false as const, error }));
    if (channelResult.ok) setChannel(channelResult.value);
    else setChannelError(channelResult.error instanceof Error ? channelResult.error.message : "تعذر تحميل بيانات القناة حاليًا");
    const results = await Promise.allSettled([youtube.fetchVideos(), youtube.fetchPlaylists()]);
    const videoResult = results[0]; const playlistResult = results[1];
    if (videoResult.status === "fulfilled") setVideos(videoResult.value); else setContentError(videoResult.reason instanceof Error ? videoResult.reason.message : "تعذر تحميل الفيديوهات حاليًا");
    if (playlistResult.status === "fulfilled") setPlaylists(playlistResult.value); else setContentError(previous => previous || (playlistResult.reason instanceof Error ? playlistResult.reason.message : "تعذر تحميل قوائم التشغيل حاليًا"));
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="px-4" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={DESIGN.colors.primary} />} contentContainerStyle={styles.content}>
        <View style={styles.topBar}><View style={styles.actions}><Pressable accessibilityLabel="الإشعارات" onPress={() => Alert.alert("الإشعارات", "لا توجد إشعارات جديدة.")} style={styles.topIcon}><MaterialIcons name="notifications-none" size={25} color={DESIGN.colors.text} /></Pressable><Pressable accessibilityLabel="البحث" onPress={() => router.push("/(tabs)/search")} style={styles.topIcon}><MaterialIcons name="search" size={27} color={DESIGN.colors.text} /></Pressable></View><View style={styles.greeting}><Text style={styles.hello}>مرحبًا بك</Text><Text style={styles.appTitle}>أحياء مع الباز</Text></View></View>
        <View style={styles.hero}>{channel ? <><View style={styles.heroTop}>{channel.thumbnailUrl ? <Image source={{ uri: channel.thumbnailUrl }} style={styles.avatar} /> : <View style={styles.avatarFallback}><MaterialIcons name="school" size={30} color={DESIGN.colors.primary} /></View>}<View style={styles.heroIdentity}><Text style={styles.heroName}>{channel.title}</Text><Text style={styles.heroHandle}>{OFFICIAL_CHANNEL_HANDLE}</Text></View></View><Text style={styles.heroCopy}>رحلتك في الأحياء تبدأ من هنا</Text><Text style={styles.heroSub}>{formatCount(channel.subscriberCount)} مشترك · {formatCount(channel.videoCount)} فيديو</Text></> : <><MaterialIcons name="cloud-off" size={30} color={DESIGN.colors.primary} /><Text style={styles.heroError}>{loading ? "جارٍ تحميل بيانات القناة…" : channelError || "تعذر تحميل بيانات القناة حاليًا"}</Text></>}</View>
        {loading && !channel ? <Status title="جارٍ تحميل محتوى القناة" body="يتم جلب البيانات الحقيقية من YouTube مباشرة." /> : <>
          <Section title="أحدث الفيديوهات" onPress={() => router.push("/(tabs)/videos")} />
          {videos.length > 0 ? videos.slice(0, 5).map(video => <Pressable key={video.id} onPress={() => router.push({ pathname: "/video/[id]", params: { id: video.id } })} style={styles.video}><Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} /><View style={styles.meta}><Text numberOfLines={2} style={styles.title}>{video.title}</Text><Text style={styles.sub}>{formatDate(video.publishedAt)} · {formatCount(video.views)} مشاهدة</Text></View></Pressable>) : <Status title="لم يتم جلب فيديوهات" body={contentError || "لا توجد فيديوهات عامة متاحة من القناة حاليًا."} action="إعادة المحاولة" onPress={() => void load()} />}
          <Section title="قوائم التشغيل" onPress={() => router.push("/(tabs)/playlists")} />
          {playlists.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlists}>{playlists.slice(0, 8).map(item => <Pressable key={item.id} onPress={() => router.push({ pathname: "/playlist/[id]", params: { id: item.id } })} style={styles.playlist}>{item.thumbnailUrl ? <Image source={{ uri: item.thumbnailUrl }} style={StyleSheet.absoluteFill} /> : null}<View style={styles.overlay} /><Text numberOfLines={2} style={styles.playlistTitle}>{item.title}</Text><Text style={styles.playlistCount}>{item.itemCount ?? "—"} فيديو</Text></Pressable>)}</ScrollView> : <Status title="لم يتم جلب قوائم التشغيل" body={contentError || "لا توجد قوائم تشغيل عامة متاحة حاليًا."} action="إعادة المحاولة" onPress={() => void load()} />}
        </>}
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, onPress }: { title: string; onPress: () => void }) { return <View style={styles.section}><Pressable onPress={onPress}><Text style={styles.action}>عرض الكل</Text></Pressable><Text style={styles.sectionTitle}>{title}</Text></View>; }
function Status({ title, body, action, onPress }: { title: string; body: string; action?: string; onPress?: () => void }) { return <View style={styles.status}><MaterialIcons name="info-outline" size={30} color={DESIGN.colors.primary} /><Text style={styles.statusTitle}>{title}</Text><Text style={styles.statusBody}>{body}</Text>{action && onPress ? <Pressable onPress={onPress} style={styles.button}><Text style={styles.buttonText}>{action}</Text></Pressable> : null}</View>; }

const styles = StyleSheet.create({ content: { paddingTop: 10, paddingBottom: 30 }, topBar: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }, actions: { flexDirection: "row", gap: 9 }, topIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: DESIGN.colors.surface, alignItems: "center", justifyContent: "center" }, greeting: { alignItems: "flex-end" }, hello: { color: DESIGN.colors.textMuted, fontSize: 13 }, appTitle: { color: DESIGN.colors.text, fontSize: 23, fontWeight: "900" }, hero: { borderRadius: 25, backgroundColor: DESIGN.colors.surface, borderWidth: 1, borderColor: DESIGN.colors.border, padding: 18, marginBottom: 15, alignItems: "flex-end" }, heroTop: { width: "100%", flexDirection: "row-reverse", alignItems: "center", gap: 12 }, avatar: { width: 76, height: 76, borderRadius: 38 }, avatarFallback: { width: 76, height: 76, borderRadius: 38, backgroundColor: DESIGN.colors.primarySoft, alignItems: "center", justifyContent: "center" }, heroIdentity: { flex: 1, alignItems: "flex-end" }, heroName: { color: DESIGN.colors.text, fontSize: 18, fontWeight: "900", textAlign: "right" }, heroHandle: { color: DESIGN.colors.primary, fontSize: 13, marginTop: 4 }, heroCopy: { color: DESIGN.colors.text, fontSize: 20, fontWeight: "900", textAlign: "right", marginTop: 17 }, heroSub: { color: DESIGN.colors.textMuted, fontSize: 13, textAlign: "right", marginTop: 5 }, heroError: { color: DESIGN.colors.textMuted, fontSize: 14, textAlign: "right", marginTop: 10 }, section: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 7, marginBottom: 12 }, sectionTitle: { color: DESIGN.colors.text, fontSize: 21, fontWeight: "800" }, action: { color: DESIGN.colors.primary, fontSize: 14 }, video: { flexDirection: "row", gap: 12, padding: 9, borderRadius: 18, backgroundColor: DESIGN.colors.surface, borderWidth: 1, borderColor: DESIGN.colors.border, minHeight: 110, marginBottom: 11 }, thumb: { width: 146, height: 92, borderRadius: 13, backgroundColor: DESIGN.colors.border }, meta: { flex: 1, alignItems: "flex-end", justifyContent: "center" }, title: { color: DESIGN.colors.text, fontSize: 15, lineHeight: 20, fontWeight: "800", textAlign: "right" }, sub: { color: DESIGN.colors.textMuted, fontSize: 11, marginTop: 8 }, playlists: { flexDirection: "row-reverse", gap: 10 }, playlist: { width: 155, height: 164, borderRadius: 18, overflow: "hidden", padding: 14, justifyContent: "flex-end", position: "relative", backgroundColor: DESIGN.colors.surface }, overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#073b3b99" }, playlistTitle: { color: DESIGN.colors.white, fontSize: 17, fontWeight: "900", textAlign: "right", zIndex: 2 }, playlistCount: { color: "#D0EFEB", fontSize: 12, marginTop: 5, zIndex: 2 }, status: { paddingVertical: 34, paddingHorizontal: 24, alignItems: "center", borderRadius: 20, backgroundColor: DESIGN.colors.surface, borderWidth: 1, borderColor: DESIGN.colors.border, marginBottom: 15 }, statusTitle: { color: DESIGN.colors.text, fontSize: 17, fontWeight: "800", textAlign: "center", marginTop: 12 }, statusBody: { color: DESIGN.colors.textMuted, fontSize: 13, lineHeight: 21, textAlign: "center", marginTop: 6 }, button: { backgroundColor: DESIGN.colors.primary, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 18, marginTop: 15 }, buttonText: { color: DESIGN.colors.background, fontWeight: "900" } });
