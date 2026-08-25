import { describe, expect, it } from "vitest";

const CHANNEL_ID = "UCZJdmjp4Mt-wU7miDGMEOuA";

describe("YouTube API credential", () => {
  it("reads the verified official channel", async () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    expect(apiKey, "YOUTUBE_API_KEY must be provided").toBeTruthy();

    const url = new URL("https://www.googleapis.com/youtube/v3/channels");
    url.searchParams.set("part", "snippet,statistics");
    url.searchParams.set("id", CHANNEL_ID);
    url.searchParams.set("key", apiKey as string);

    const response = await fetch(url);
    const payload = await response.json() as {
      items?: Array<{ id?: string; snippet?: { customUrl?: string } }>;
      error?: { message?: string };
    };

    expect(response.ok, payload.error?.message ?? "YouTube API request failed").toBe(true);
    expect(payload.items?.[0]?.id).toBe(CHANNEL_ID);
    expect(payload.items?.[0]?.snippet?.customUrl).toBe("@mr.abdelrahmanelbaz");
  }, 15_000);
});
