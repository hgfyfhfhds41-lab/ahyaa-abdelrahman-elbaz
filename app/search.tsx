import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function SearchScreen() {
  const colors = useColors();
  return <ScreenContainer className="px-5" containerClassName="bg-background"><View style={styles.content}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={22} color={colors.foreground} /></Pressable><Text style={[styles.title, { color: colors.foreground }]}>البحث في القناة</Text></View>
    <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={21} color={colors.muted} /><TextInput placeholder="ابحث عن درس أو موضوع" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground }]} textAlign="right" /></View>
    <View style={styles.empty}><View style={[styles.icon, { backgroundColor: `${colors.primary}15` }]}><MaterialIcons name="manage-search" size={30} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>البحث جاهز</Text><Text style={[styles.emptyText, { color: colors.muted }]}>ستظهر النتائج الحقيقية من YouTube بعد إعداد الاتصال الرسمي بالمصدر.</Text></View>
  </View></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { paddingTop: 12, gap: 16 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 12 }, back: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }, title: { flex: 1, textAlign: "right", fontSize: 23, fontWeight: "800" }, searchBox: { minHeight: 52, borderRadius: 15, borderWidth: 1, flexDirection: "row-reverse", alignItems: "center", gap: 9, paddingHorizontal: 14 }, input: { flex: 1, fontSize: 15 }, empty: { alignItems: "center", paddingTop: 74, gap: 10 }, icon: { width: 64, height: 64, borderRadius: 21, alignItems: "center", justifyContent: "center", marginBottom: 5 }, emptyTitle: { fontSize: 18, fontWeight: "800" }, emptyText: { textAlign: "center", fontSize: 14, lineHeight: 22, maxWidth: 300 } });
