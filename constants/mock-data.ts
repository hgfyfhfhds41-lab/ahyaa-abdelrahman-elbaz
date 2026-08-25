/** Mock records were removed in phase two; these empty exports preserve legacy imports without fabricated content. */
export type ThumbnailTone = "teal" | "plum" | "ocean" | "forest";
export type MockVideo = { id: string; title: string; subtitle: string; duration: string; views: string; published: string; tone: ThumbnailTone; progress: number };
export type MockPlaylist = { id: string; title: string; count: string; tone: ThumbnailTone; icon: string };
export const MOCK_VIDEOS: MockVideo[] = [];
export const MOCK_PLAYLISTS: MockPlaylist[] = [];
