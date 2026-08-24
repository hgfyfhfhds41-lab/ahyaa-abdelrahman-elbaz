import { Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { OFFICIAL_CHANNEL_HANDLE, OFFICIAL_CHANNEL_URL } from "@/lib/youtube";
import { useColors } from "@/hooks/use-colors";

export default function SettingsScreen() {
  const colors = useColors();
  return <ScreenContainer className="px-5" containerClassName="bg-background"><View style={styles.content}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, opacity: pressed ? 0.65 : 1 }]}><MaterialIcons name="arrow-forward" size={22} color={colors.foreground} /></Pressable><Text style={[styles.title, { color: colors.foreground }]}>إعدادات المصدر</Text></View>
    <View style={[styles.info, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}><MaterialIcons name="verified-user" size={23} color={colors.primary} /><Text style={[styles.infoText, { color: colors.foreground }]}>سيتم استخدام القناة الرسمية فقط. لا تُخزّن بيانات الفيديو داخل التطبيق.</Text></View>
    <Text style={[styles.label, { color: colors.foreground }]}>Channel Handle</Text><View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}><TextInput value={OFFICIAL_CHANNEL_HANDLE} editable={false} style={[styles.inputText, { color: colors.foreground }]} textAlign="left" /></View>
    <Text style={[styles.label, { color: colors.foreground }]}>Channel ID</Text><View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}><TextInput placeholder="يُضاف بعد التحقق الرسمي" placeholderTextColor={colors.muted} editable={false} style={[styles.inputText, { color: colors.muted }]} textAlign="left" /></View>
    <Text style={[styles.note, { color: colors.muted }]}>لا يتم اختراع Channel ID. قبل تشغيل API سنحتاج إلى Channel ID الحقيقي ومفتاح YouTube Data API v3، ويُحفظ المفتاح في متغير بيئة سري وليس داخل الكود.</Text>
    <Pressable onPress={() => Linking.openURL(OFFICIAL_CHANNEL_URL)} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}><Text style={styles.buttonText}>فتح القناة الرسمية للتحقق</Text><MaterialIcons name="open-in-new" size={18} color="#FFF" /></Pressable>
  </View></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { paddingTop: 12, gap: 14 }, header: { flexDirection: "row-reverse", alignItems: "center", gap: 12, marginBottom: 10 }, back: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }, title: { flex: 1, textAlign: "right", fontSize: 23, fontWeight: "800" }, info: { flexDirection: "row-reverse", alignItems: "center", gap: 10, borderWidth: 1, padding: 15, borderRadius: 18 }, infoText: { flex: 1, textAlign: "right", fontSize: 13, lineHeight: 21 }, label: { textAlign: "right", fontSize: 14, fontWeight: "700", marginTop: 8 }, input: { borderWidth: 1, borderRadius: 14, minHeight: 50, justifyContent: "center", paddingHorizontal: 14 }, inputText: { fontSize: 15 }, note: { textAlign: "right", fontSize: 13, lineHeight: 22 }, button: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 10 }, buttonText: { color: "#FFF", fontSize: 14, fontWeight: "800" } });
