import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { DESIGN } from "@/constants/design-system";
import { startOAuthLogin } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";

export default function LoginScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string }>();
  const { isAuthenticated, loading, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "success") {
      void refresh();
    }
  }, [status, refresh]);

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace("/(tabs)");
  }, [loading, isAuthenticated, router]);

  const handleLogin = async () => {
    try {
      setBusy(true);
      setMessage("");
      const result = await startOAuthLogin();
      if (result === "cancelled") setMessage("تم إلغاء تسجيل الدخول. يمكنك المحاولة مرة أخرى.");
    } catch {
      setMessage("تعذر بدء تسجيل الدخول. تحقق من الاتصال بالإنترنت ثم حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" containerClassName="bg-background">
      <View style={styles.content}>
        <View style={styles.logo}><MaterialIcons name="science" size={42} color={DESIGN.colors.primary} /></View>
        <Text style={styles.title}>أحياء مع عبدالرحمن الباز</Text>
        <Text style={styles.subtitle}>سجّل الدخول بحساب Google للوصول إلى تجربتك التعليمية.</Text>
        <Pressable onPress={handleLogin} disabled={busy} style={({ pressed }) => [styles.button, pressed && styles.pressed, busy && styles.disabled]}>
          {busy ? <ActivityIndicator color={DESIGN.colors.background} /> : <MaterialIcons name="account-circle" size={23} color={DESIGN.colors.background} />}
          <Text style={styles.buttonText}>{busy ? "جارٍ فتح تسجيل الدخول…" : "تسجيل الدخول باستخدام Google"}</Text>
        </Pressable>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Text style={styles.note}>لن يتم تخزين كلمة مرور داخل التطبيق. تتم المصادقة عبر Google والبوابة الرسمية للجلسات.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 12 },
  logo: { width: 86, height: 86, borderRadius: 28, backgroundColor: DESIGN.colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 22 },
  title: { color: DESIGN.colors.text, fontSize: 24, fontWeight: "900", textAlign: "center" },
  subtitle: { color: DESIGN.colors.textMuted, fontSize: 14, lineHeight: 23, textAlign: "center", marginTop: 10, maxWidth: 320 },
  button: { minHeight: 52, borderRadius: 16, backgroundColor: DESIGN.colors.primary, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 18, marginTop: 28, width: "100%" },
  buttonText: { color: DESIGN.colors.background, fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.6 },
  message: { color: DESIGN.colors.danger, textAlign: "center", lineHeight: 21, marginTop: 14 },
  note: { color: DESIGN.colors.textDim, fontSize: 11, lineHeight: 18, textAlign: "center", marginTop: 26 },
});
