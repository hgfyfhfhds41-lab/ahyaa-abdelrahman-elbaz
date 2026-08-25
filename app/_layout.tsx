import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };
const AUTH_BOOT_TIMEOUT_MS = 8000;
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  anchor: "(tabs)",
};

function StartupState({ timedOut, onRetry }: { timedOut: boolean; onRetry: () => void }) {
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#061719", padding: 24 }}>
    {timedOut ? <>
      <Text style={{ color: "#ECEDEE", fontSize: 18, fontWeight: "700", textAlign: "center" }}>تعذر تهيئة التطبيق</Text>
      <Text style={{ color: "#9BA1A6", fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 10 }}>لم تكتمل تهيئة الجلسة في الوقت المتوقع. يمكنك إعادة المحاولة.</Text>
      <Pressable onPress={onRetry} style={({ pressed }) => ({ backgroundColor: "#19c3bb", borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13, marginTop: 22, opacity: pressed ? 0.8 : 1 })}><Text style={{ color: "#061719", fontWeight: "700" }}>إعادة المحاولة</Text></Pressable>
    </> : <><ActivityIndicator color="#19c3bb" size="large" /><Text style={{ color: "#9BA1A6", marginTop: 16 }}>جارٍ تجهيز التطبيق...</Text></>}
  </View>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = pathname === "/login" || pathname.startsWith("/oauth/callback");
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      void SplashScreen.hideAsync().catch(() => undefined);
      return;
    }
    const timeout = setTimeout(() => {
      setTimedOut(true);
      void SplashScreen.hideAsync().catch(() => undefined);
    }, AUTH_BOOT_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicRoute) router.replace("/login");
    if (user && pathname === "/login") router.replace("/(tabs)");
  }, [user, loading, pathname, isPublicRoute, router]);

  if (loading && !timedOut) return <StartupState timedOut={false} onRetry={() => undefined} />;
  if (loading && timedOut) return <StartupState timedOut onRetry={() => { setTimedOut(false); void refresh(); }} />;
  if (!user && !isPublicRoute) return <StartupState timedOut onRetry={() => { setTimedOut(false); void refresh(); }} />;
  return <>{children}</>;
}

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthGate>
          {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
          {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
          {/* in order for ios apps tab switching to work properly, use presentation: "fullScreenModal" for login page, whenever you decide to use presentation: "modal*/}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="oauth/callback" />
            <Stack.Screen name="login" options={{ presentation: "fullScreenModal" }} />
          </Stack>
            </AuthGate>
          </AuthProvider>
          <StatusBar style="light" />
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
