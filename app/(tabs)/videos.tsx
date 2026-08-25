import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { DESIGN } from "@/constants/design-system";
import { MOCK_VIDEOS } from "@/constants/mock-data";
import { MockPill, ScreenHeader, VideoCard } from "@/components/ui/design-components";

export default function VideosScreen() { return <ScreenContainer edges={["top", "left", "right"]} className="px-4" containerClassName="bg-background"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}><ScreenHeader title="الفيديوهات" eyebrow="مكتبة الدروس" onSearch={() => router.push("/(tabs)/search")} onNotifications={() => {}} /><View style={styles.intro}><View style={styles.introCopy}><Text style={styles.introTitle}>كل دروس الأحياء</Text><Text style={styles.introText}>تصفح الدروس التجريبية بنفس تجربة المحتوى النهائي.</Text></View><MockPill /></View>{MOCK_VIDEOS.map((video) => <VideoCard key={video.id} video={video} />)}</ScrollView></ScreenContainer>; }
const styles = StyleSheet.create({ content: { paddingTop: 10, paddingBottom: 25 }, intro: { backgroundColor: DESIGN.colors.primarySoft, borderRadius: 18, padding: 15, marginBottom: 16, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }, introCopy: { alignItems: "flex-end", flex: 1 }, introTitle: { color: DESIGN.colors.text, fontSize: 17, fontWeight: "900", textAlign: "right" }, introText: { color: DESIGN.colors.textMuted, fontSize: 12, marginTop: 4, textAlign: "right" } });
