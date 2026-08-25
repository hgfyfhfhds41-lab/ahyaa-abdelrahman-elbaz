import type { ThumbnailTone } from "./design-system";

export type MockVideo = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  views: string;
  published: string;
  tone: ThumbnailTone;
  progress: number;
  label: string;
  isMock: true;
};

export type MockPlaylist = {
  id: string;
  title: string;
  count: string;
  tone: ThumbnailTone;
  icon: string;
  isMock: true;
};

/** Visual-only content. Replace this collection with official YouTube responses later. */
export const MOCK_VIDEOS: MockVideo[] = [
  { id: "mock-lecture-2027", title: "المحاضرة التأسيسية", subtitle: "ثانوية عامة 2027", duration: "36:45", views: "125 ألف مشاهدة", published: "منذ يومين", tone: "teal", progress: 0.68, label: "تجريبي", isMock: true },
  { id: "mock-cell-structure", title: "الدرس الأول", subtitle: "التركيب الخلوي", duration: "42:18", views: "98 ألف مشاهدة", published: "منذ 5 أيام", tone: "forest", progress: 0.28, label: "تجريبي", isMock: true },
  { id: "mock-transport", title: "الدرس الثاني", subtitle: "النقل عبر الغشاء", duration: "39:27", views: "83 ألف مشاهدة", published: "منذ أسبوع", tone: "ocean", progress: 0, label: "تجريبي", isMock: true },
];

export const MOCK_PLAYLISTS: MockPlaylist[] = [
  { id: "mock-life-cell", title: "الباب الأول\nخلية الحياة", count: "12 فيديو", tone: "forest", icon: "◉", isMock: true },
  { id: "mock-heredity", title: "الباب الثاني\nالوراثة", count: "18 فيديو", tone: "plum", icon: "⟿", isMock: true },
  { id: "mock-regulation", title: "الباب الثالث\nالتنظيم", count: "15 فيديو", tone: "ocean", icon: "♧", isMock: true },
  { id: "mock-diversity", title: "الباب الرابع\nالتنوع", count: "9 فيديو", tone: "teal", icon: "◌", isMock: true },
];
