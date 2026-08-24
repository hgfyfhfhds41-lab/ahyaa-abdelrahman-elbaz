import { useCallback, useState } from "react";
import { Image, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { OFFICIAL_CHANNEL_HANDLE, OFFICIAL_CHANNEL_URL } from "@/lib/youtube";
import { useColors } from "@/hooks/use-colors";

function SectionEmpty({ title, icon, action, onPress }: { title: string; icon: keyof typeof MaterialIcons.glyphMap; action: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}16` }]}><MaterialIcons name={icon} size={23} color={colors.primary} /></View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: colors.muted }]}>سيظهر المحتوى الحقيقي من القناة هنا بعد إعداد مصدر YouTube الرسمي.</Text>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.outlineButton, { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}>
        <Text style={[styles.outlineButtonText, { color: colors.primary }]}>{action}</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 650); }, []);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View><Text style={[styles.eyebrow, { color: colors.primary }]}>مساحة المذاكرة</Text><Text style={[styles.title, { color: colors.foreground }]}>أحياء مع عبدالرحمن الباز</Text></View>
          <View style={styles.topActions}>
            <Pressable accessibilityLabel="بحث" onPress={() => router.push("/search")} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="search" size={22} color={colors.foreground} /></Pressable>
            <Pressable accessibilityLabel="الإعدادات" onPress={() => router.push("/settings")} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="tune" size={22} color={colors.foreground} /></Pressable>
          </View>
        </View>

        <View style={[styles.channelCard, { backgroundColor: colors.primary }]}>
          <View style={styles.channelTop}><Image source={require("@/assets/images/icon.png")} style={styles.channelImage} /><View style={styles.channelCopy}><Text style={styles.channelName}>الأستاذ عبدالرحمن الباز</Text><Text style={styles.channelHandle}>{OFFICIAL_CHANNEL_HANDLE}</Text></View><MaterialIcons name="verified" size={21} color="#F2B84B" /></View>
          <Text style={styles.channelDescription}>محتوى تعليمي هادئ ومركّز يساعد طلاب الثانوية العامة على فهم الأحياء خطوة بخطوة.</Text>
          <Pressable onPress={() => Linking.openURL(OFFICIAL_CHANNEL_URL)} style={({ pressed }) => [styles.channelLink, { opacity: pressed ? 0.7 : 1 }]}><Text style={styles.channelLinkText}>زيارة القناة الرسمية</Text><MaterialIcons name="open-in-new" size={16} color="#FFFFFF" /></Pressable>
        </View>

        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>أحدث الفيديوهات</Text><Text style={[styles.sectionHint, { color: colors.muted }]}>من الأحدث إلى الأقدم</Text></View>
        <SectionEmpty title="لا توجد فيديوهات محمّلة بعد" icon="play-circle-outline" action="إعداد مصدر YouTube" onPress={() => router.push("/settings")} />
        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>قوائم التشغيل</Text></View>
        <SectionEmpty title="قوائم التشغيل ستظهر هنا" icon="playlist-play" action="تعرف على المصدر" onPress={() => Linking.openURL(OFFICIAL_CHANNEL_URL)} />
        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>المنهج</Text></View>
        <View style={[styles.curriculumCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.curriculumIcon, { backgroundColor: "#F2B84B" }]}><MaterialIcons name="biotech" size={24} color="#15302E" /></View><View style={styles.curriculumCopy}><Text style={[styles.curriculumTitle, { color: colors.foreground }]}>رحلة فهم الأحياء</Text><Text style={[styles.curriculumText, { color: colors.muted }]}>سيُنظّم المحتوى تلقائيًا من قوائم القناة عند تفعيل التكامل الرسمي.</Text></View></View>
        <Text style={[styles.footer, { color: colors.muted }]}>المحتوى مصدره القناة الرسمية على YouTube</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingTop: 12, paddingBottom: 34, gap: 18 }, topBar: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }, topActions: { flexDirection: "row", gap: 8 }, eyebrow: { fontSize: 13, fontWeight: "700", textAlign: "right", marginBottom: 4 }, title: { fontSize: 22, lineHeight: 29, fontWeight: "800", textAlign: "right" }, iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }, channelCard: { borderRadius: 24, padding: 20, gap: 14 }, channelTop: { flexDirection: "row-reverse", alignItems: "center", gap: 11 }, channelImage: { width: 54, height: 54, borderRadius: 16 }, channelCopy: { flex: 1, alignItems: "flex-end" }, channelName: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", textAlign: "right" }, channelHandle: { color: "#C7E7E3", fontSize: 13, marginTop: 3 }, channelDescription: { color: "#E5F5F2", fontSize: 14, lineHeight: 23, textAlign: "right" }, channelLink: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "#07534F", paddingVertical: 11, borderRadius: 13 }, channelLinkText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" }, sectionHeader: { flexDirection: "row-reverse", alignItems: "baseline", justifyContent: "space-between", marginTop: 2 }, sectionTitle: { fontSize: 19, fontWeight: "800", textAlign: "right" }, sectionHint: { fontSize: 12 }, emptyCard: { borderRadius: 20, borderWidth: 1, padding: 18, alignItems: "center", gap: 9 }, emptyIcon: { width: 47, height: 47, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 2 }, emptyTitle: { fontSize: 16, fontWeight: "800" }, emptyText: { fontSize: 13, lineHeight: 21, textAlign: "center" }, outlineButton: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9, marginTop: 3 }, outlineButtonText: { fontSize: 13, fontWeight: "700" }, curriculumCard: { flexDirection: "row-reverse", alignItems: "center", gap: 13, borderRadius: 20, borderWidth: 1, padding: 16 }, curriculumIcon: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" }, curriculumCopy: { flex: 1, alignItems: "flex-end" }, curriculumTitle: { fontSize: 16, fontWeight: "800", textAlign: "right" }, curriculumText: { fontSize: 13, lineHeight: 20, textAlign: "right", marginTop: 4 }, footer: { textAlign: "center", fontSize: 12, marginTop: 4 }, });
