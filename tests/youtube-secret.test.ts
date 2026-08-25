import { describe, expect, it } from "vitest";

const CHANNEL_ID = "UCZJdmjp4Mt-wU7miDGMEOuA";

describe("YouTube API secret", () => {
  it("authenticates a lightweight official channel request without exposing the key", async () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    expect(apiKey, "YOUTUBE_API_KEY must be configured securely").toBeTruthy();
    expect(apiKey).not.toContain("TO_BE_REPLACED");
    expect(apiKey).not.toBe("YOUTUBE_API_KEY");

    const url = new URL("https://www.googleapis.com/youtube/v3/channels");
    url.searchParams.set("part", "id");
    url.searchParams.set("id", CHANNEL_ID);
    url.searchParams.set("key", apiKey as string);

    const response = await fetch(url);
    const payload = await response.json() as {
      items?: Array<{ id?: string }>;
      error?: { message?: string };
    };

    expect(response.ok, payload.error?.message ?? "YouTube API request failed").toBe(true);
    expect(payload.items?.[0]?.id).toBe(CHANNEL_ID);
  }, 15_000);
});
