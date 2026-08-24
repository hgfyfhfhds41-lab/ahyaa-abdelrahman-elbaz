export const OFFICIAL_CHANNEL_HANDLE = "@mr.abdelrahmanelbaz";
export const OFFICIAL_CHANNEL_URL = "https://youtube.com/@mr.abdelrahmanelbaz";

export type YouTubeChannel = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  url: string;
};

export type YouTubePlaylist = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  itemCount?: number;
};

export type YouTubeSourceSettings = {
  channelHandle: string;
  channelId: string;
  apiKeyConfigured: boolean;
};

export type YouTubeHomeData = {
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
  playlists: YouTubePlaylist[];
};

/**
 * API boundary for the official YouTube integration.
 * It intentionally returns no fallback or fabricated content when not configured.
 */
export class YouTubeIntegration {
  constructor(private readonly settings: YouTubeSourceSettings) {}

  isConfigured() {
    return Boolean(this.settings.channelId && this.settings.apiKeyConfigured);
  }

  async fetchHomeData(): Promise<YouTubeHomeData> {
    if (!this.isConfigured()) {
      throw new Error("YOUTUBE_SOURCE_NOT_CONFIGURED");
    }

    throw new Error("YOUTUBE_API_CLIENT_PENDING");
  }
}

export function createYouTubeIntegration(
  settings: Partial<YouTubeSourceSettings> = {},
) {
  return new YouTubeIntegration({
    channelHandle: settings.channelHandle ?? OFFICIAL_CHANNEL_HANDLE,
    channelId: settings.channelId ?? "",
    apiKeyConfigured: settings.apiKeyConfigured ?? false,
  });
}
