import { describe, expect, it } from "vitest";
import { MOCK_PLAYLISTS, MOCK_VIDEOS } from "../constants/mock-data";

describe("visual content contract", () => {
  it("keeps every visual item explicitly marked as mock", () => {
    expect(MOCK_VIDEOS.length).toBeGreaterThan(0);
    expect(MOCK_PLAYLISTS.length).toBeGreaterThan(0);
    expect(MOCK_VIDEOS.every((item) => item.isMock === true)).toBe(true);
    expect(MOCK_PLAYLISTS.every((item) => item.isMock === true)).toBe(true);
  });

  it("uses stable local ids for UI navigation until YouTube is connected", () => {
    expect(new Set(MOCK_VIDEOS.map((item) => item.id)).size).toBe(MOCK_VIDEOS.length);
    expect(new Set(MOCK_PLAYLISTS.map((item) => item.id)).size).toBe(MOCK_PLAYLISTS.length);
    expect(MOCK_VIDEOS.every((item) => item.id.startsWith("mock-"))).toBe(true);
    expect(MOCK_PLAYLISTS.every((item) => item.id.startsWith("mock-"))).toBe(true);
  });
});
