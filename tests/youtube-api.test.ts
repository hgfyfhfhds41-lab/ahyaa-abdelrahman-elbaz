import "../scripts/load-env.js";
import { describe, expect, it } from "vitest";

const CHANNEL_ID = "UCZJdmjp4Mt-wU7miDGMEOuA";

describe("YouTube API credential", () => {
  it("reads the verified official channel", async () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const expoApiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
    expect(apiKey, "YOUTUBE_API_KEY must be provided").toBeTruthy();
    expect(expoApiKey, "EXPO_PUBLIC_YOUTUBE_API_KEY mapping must be provided").toBeTruthy();

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

    const { youtube } = await import("../lib/youtube");
    const channel = await youtube.fetchChannel();
    expect(channel.id).toBe(CHANNEL_ID);
    expect(channel.title).toBeTruthy();
    expect(channel.thumbnailUrl).toBeTruthy();
    const videos = await youtube.fetchVideos();
    const playlists = await youtube.fetchPlaylists();
    console.info(`[YouTube test] channel=1 videos=${videos.length} playlists=${playlists.length}`);
    expect(videos.every(video => video.id && video.thumbnailUrl)).toBe(true);
    expect(playlists.every(playlist => playlist.id && playlist.title)).toBe(true);
  }, 30_000);
});
