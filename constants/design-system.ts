export const DESIGN = {
  colors: {
    background: "#061719",
    backgroundRaised: "#091E20",
    surface: "#112729",
    surfaceStrong: "#172F31",
    surfaceMuted: "#0D2022",
    primary: "#18C5B9",
    primaryDeep: "#0D716D",
    primarySoft: "#164A4A",
    accent: "#F1BB51",
    text: "#F4F8F7",
    textMuted: "#8BA5A2",
    textDim: "#58716E",
    border: "#1D3A3C",
    danger: "#E55F64",
    white: "#FFFFFF",
  },
  radius: { sm: 10, md: 16, lg: 22, xl: 28 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, section: 28 },
} as const;

export type ThumbnailTone = "teal" | "plum" | "ocean" | "forest";
