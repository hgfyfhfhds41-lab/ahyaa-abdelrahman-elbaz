import { OFFICIAL_CHANNEL_ID } from "./youtube";

type SecureStoreApi = {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
};

function secureStore(): SecureStoreApi {
  return require("expo-secure-store") as SecureStoreApi;
}

export const YOUTUBE_READONLY_SCOPE = "https://www.googleapis.com/auth/youtube.readonly";
export const YOUTUBE_ACCESS_TOKEN_KEY = "youtube-oauth-access-token";
const SUBSCRIPTIONS_ENDPOINT = "https://www.googleapis.com/youtube/v3/subscriptions";

type SubscriptionItem = {
  snippet?: { resourceId?: { channelId?: string } };
};

type SubscriptionPayload = {
  items?: SubscriptionItem[];
  error?: { message?: string; errors?: Array<{ reason?: string }> };
};

export type SubscriptionCheckResult =
  | { status: "subscribed"; channelId: string }
  | { status: "not-subscribed"; channelId: string }
  | { status: "oauth-required"; message: string }
  | { status: "token-expired"; message: string }
  | { status: "error"; message: string };

export async function saveYouTubeAccessToken(accessToken: string): Promise<void> {
  if (!accessToken.trim()) throw new Error("رمز YouTube غير صالح.");
  await secureStore().setItemAsync(YOUTUBE_ACCESS_TOKEN_KEY, accessToken);
}

export async function getYouTubeAccessToken(): Promise<string | null> {
  return secureStore().getItemAsync(YOUTUBE_ACCESS_TOKEN_KEY);
}

export async function clearYouTubeAccessToken(): Promise<void> {
  await secureStore().deleteItemAsync(YOUTUBE_ACCESS_TOKEN_KEY);
}

export async function checkYouTubeSubscription(
  accessToken: string | null | undefined,
  fetcher: typeof fetch = fetch,
): Promise<SubscriptionCheckResult> {
  if (!accessToken?.trim()) {
    return {
      status: "oauth-required",
      message: "يلزم تفويض YouTube من حساب Google للتحقق من الاشتراك.",
    };
  }

  const url = new URL(SUBSCRIPTIONS_ENDPOINT);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("mine", "true");
  url.searchParams.set("forChannelId", OFFICIAL_CHANNEL_ID);
  url.searchParams.set("maxResults", "50");

  try {
    const response = await fetcher(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    let payload: SubscriptionPayload = {};
    try {
      payload = (await response.json()) as SubscriptionPayload;
    } catch {
      payload = {};
    }

    if (response.status === 401) {
      return { status: "token-expired", message: "انتهت صلاحية تفويض YouTube. يلزم تسجيل التفويض مرة أخرى." };
    }
    if (response.status === 403) {
      return { status: "error", message: "رفض YouTube الطلب؛ تأكد من منح صلاحية قراءة الاشتراكات." };
    }
    if (!response.ok) {
      const reason = payload.error?.errors?.[0]?.reason;
      return { status: "error", message: reason ? `تعذر التحقق من الاشتراك (${reason}).` : "تعذر التحقق من الاشتراك من YouTube." };
    }

    const subscribed = (payload.items ?? []).some(
      (item) => item.snippet?.resourceId?.channelId === OFFICIAL_CHANNEL_ID,
    );
    return subscribed
      ? { status: "subscribed", channelId: OFFICIAL_CHANNEL_ID }
      : { status: "not-subscribed", channelId: OFFICIAL_CHANNEL_ID };
  } catch {
    return { status: "error", message: "تعذر الاتصال بـYouTube. تحقق من الإنترنت وحاول مرة أخرى." };
  }
}
