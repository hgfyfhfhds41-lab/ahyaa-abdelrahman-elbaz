import { describe, expect, it } from "vitest";
import { OFFICIAL_CHANNEL_ID } from "../lib/youtube";
import { checkYouTubeSubscription } from "../lib/youtube-subscription";

const response = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("YouTube subscription verification", () => {
  it("returns subscribed when the official channel is in the authorized user's subscriptions", async () => {
    const result = await checkYouTubeSubscription("oauth-token", async () => response(200, {
      items: [{ snippet: { resourceId: { channelId: OFFICIAL_CHANNEL_ID } } }],
    }));
    expect(result).toEqual({ status: "subscribed", channelId: OFFICIAL_CHANNEL_ID });
  });

  it("returns not-subscribed when the official channel is absent", async () => {
    const result = await checkYouTubeSubscription("oauth-token", async () => response(200, {
      items: [{ snippet: { resourceId: { channelId: "another-channel" } } }],
    }));
    expect(result).toEqual({ status: "not-subscribed", channelId: OFFICIAL_CHANNEL_ID });
  });

  it("reports that YouTube OAuth is required when no access token exists", async () => {
    const result = await checkYouTubeSubscription(null, async () => response(200, {}));
    expect(result.status).toBe("oauth-required");
  });

  it("reports expired authorization on HTTP 401", async () => {
    const result = await checkYouTubeSubscription("expired-token", async () => response(401, {}));
    expect(result.status).toBe("token-expired");
  });

  it("reports permission failure on HTTP 403", async () => {
    const result = await checkYouTubeSubscription("oauth-token", async () => response(403, {}));
    expect(result.status).toBe("error");
  });

  it("reports network failure without throwing", async () => {
    const result = await checkYouTubeSubscription("oauth-token", async () => {
      throw new Error("offline");
    });
    expect(result).toEqual({ status: "error", message: "تعذر الاتصال بـYouTube. تحقق من الإنترنت وحاول مرة أخرى." });
  });
});
