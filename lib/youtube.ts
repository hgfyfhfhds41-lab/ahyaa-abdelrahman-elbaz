export const OFFICIAL_CHANNEL_HANDLE = "@mr.abdelrahmanelbaz";
export const OFFICIAL_CHANNEL_ID = "UCZJdmjp4Mt-wU7miDGMEOuA";
export const OFFICIAL_CHANNEL_URL = "https://youtube.com/@mr.abdelrahmanelbaz";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY ?? process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ?? "";

type ApiList<T> = { items?: T[]; nextPageToken?: string; error?: { message?: string } };
export type YouTubeChannel = { id: string; title: string; description: string; thumbnailUrl?: string; subscriberCount?: number; videoCount?: number; viewCount?: number };
export type YouTubeVideo = { id: string; title: string; description: string; thumbnailUrl: string; publishedAt: string; duration?: string; views?: number; likes?: number; comments?: number; embeddable: boolean; url: string };
export type YouTubePlaylist = { id: string; title: string; description: string; thumbnailUrl?: string; itemCount?: number };
export type YouTubePlaylistItem = { id: string; videoId: string; title: string; description: string; thumbnailUrl: string; position: number; publishedAt: string };
export type YouTubeHomeData = { channel: YouTubeChannel; videos: YouTubeVideo[]; playlists: YouTubePlaylist[] };
export type YouTubeSourceSettings = { channelHandle: string; channelId: string; apiKeyConfigured: boolean };

function assertConfigured() { if (!API_KEY) throw new Error("YOUTUBE_API_KEY_NOT_CONFIGURED"); }
async function request<T>(resource: string, params: Record<string, string>) {
  assertConfigured();
  const url = new URL(`${API_BASE}/${resource}`);
  Object.entries({ ...params, key: API_KEY }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url);
  const payload = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message ?? `YOUTUBE_API_${response.status}`);
  return payload;
}

async function collect<T>(resource: string, params: Record<string, string>, map: (item: any) => T) {
  const result: T[] = []; let pageToken = "";
  do { const payload = await request<ApiList<any>>(resource, { ...params, ...(pageToken ? { pageToken } : {}) }); result.push(...(payload.items ?? []).map(map)); pageToken = payload.nextPageToken ?? ""; } while (pageToken);
  return result;
}

export class YouTubeIntegration {
  constructor(private readonly settings: YouTubeSourceSettings = { channelHandle: OFFICIAL_CHANNEL_HANDLE, channelId: OFFICIAL_CHANNEL_ID, apiKeyConfigured: Boolean(API_KEY) }) {}
  isConfigured() { return Boolean(this.settings.channelId && API_KEY); }
  async fetchChannel(): Promise<YouTubeChannel> {
    const p = await request<ApiList<any>>("channels", { part: "snippet,statistics", id: this.settings.channelId });
    const item = p.items?.[0]; if (!item) throw new Error("YOUTUBE_CHANNEL_NOT_FOUND");
    return { id: item.id, title: item.snippet.title, description: item.snippet.description, thumbnailUrl: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url, subscriberCount: Number(item.statistics?.subscriberCount), videoCount: Number(item.statistics?.videoCount), viewCount: Number(item.statistics?.viewCount) };
  }
  async fetchVideos(): Promise<YouTubeVideo[]> {
    const ids = await collect("search", { part: "snippet", channelId: this.settings.channelId, type: "video", order: "date", maxResults: "50" }, (item) => item.id.videoId as string);
    if (!ids.length) return [];
    const p = await request<ApiList<any>>("videos", { part: "snippet,contentDetails,statistics,status", id: ids.join(",") });
    return (p.items ?? []).sort((a,b) => Date.parse(b.snippet.publishedAt) - Date.parse(a.snippet.publishedAt)).map(item => ({ id: item.id, title: item.snippet.title, description: item.snippet.description, thumbnailUrl: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url, publishedAt: item.snippet.publishedAt, duration: item.contentDetails?.duration, views: Number(item.statistics?.viewCount), likes: Number(item.statistics?.likeCount), comments: Number(item.statistics?.commentCount), embeddable: Boolean(item.status?.embeddable), url: `https://www.youtube.com/watch?v=${item.id}` }));
  }
  async fetchPlaylists(): Promise<YouTubePlaylist[]> { return collect("playlists", { part: "snippet,contentDetails", channelId: this.settings.channelId, maxResults: "50" }, item => ({ id: item.id, title: item.snippet.title, description: item.snippet.description, thumbnailUrl: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url, itemCount: item.contentDetails?.itemCount })); }
  async fetchPlaylistItems(playlistId: string): Promise<YouTubePlaylistItem[]> { return collect("playlistItems", { part: "snippet,contentDetails", playlistId, maxResults: "50" }, item => ({ id: item.id, videoId: item.contentDetails.videoId, title: item.snippet.title, description: item.snippet.description, thumbnailUrl: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url, position: item.snippet.position, publishedAt: item.snippet.publishedAt })); }
  async fetchHomeData(): Promise<YouTubeHomeData> { const [channel, videos, playlists] = await Promise.all([this.fetchChannel(), this.fetchVideos(), this.fetchPlaylists()]); return { channel, videos, playlists }; }
}
export const youtube = new YouTubeIntegration();
export function createYouTubeIntegration(settings: Partial<YouTubeSourceSettings> = {}) { return new YouTubeIntegration({ channelHandle: settings.channelHandle ?? OFFICIAL_CHANNEL_HANDLE, channelId: settings.channelId ?? OFFICIAL_CHANNEL_ID, apiKeyConfigured: Boolean(API_KEY) }); }
