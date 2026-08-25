import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { DESIGN } from "@/constants/design-system";
import { MOCK_PLAYLISTS } from "@/constants/mock-data";
import { MockPill, PlaylistCard, ScreenHeader } from "@/components/ui/design-components";

export default function PlaylistsScreen() { return <ScreenContainer edges={["top", "left", "right"]} className="px-4" containerClassName="bg-background"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}><ScreenHeader title="قوائم التشغيل" eyebrow="منهج مرتب" onSearch={() => router.push("/(tabs)/search")} onNotifications={() => {}} /><View style={styles.banner}><Text style={styles.bannerTitle}>تعلّم بالترتيب</Text><Text style={styles.bannerText}>أبواب الأحياء مجمّعة في مسارات واضحة لتسهيل المراجعة.</Text><MockPill /></View><View style={styles.grid}>{MOCK_PLAYLISTS.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}</View></ScrollView></ScreenContainer>; }
const styles = StyleSheet.create({ content: { paddingTop: 10, paddingBottom: 25 }, banner: { padding: 16, borderRadius: 19, backgroundColor: DESIGN.colors.primarySoft, marginBottom: 20, alignItems: "flex-end", gap: 6 }, bannerTitle: { color: DESIGN.colors.text, fontSize: 18, fontWeight: "900" }, bannerText: { color: DESIGN.colors.textMuted, fontSize: 13, textAlign: "right", lineHeight: 21 }, grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 } });
