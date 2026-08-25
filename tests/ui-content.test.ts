import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("real YouTube content boundary", () => {
  it("does not contain fabricated video or playlist records", () => {
    const source = readFileSync(resolve(process.cwd(), "constants/mock-data.ts"), "utf8");
    expect(source).not.toMatch(/mock-(lecture|cell|transport|life-cell|heredity|regulation|diversity)/);
    expect(source).not.toContain("125 ألف مشاهدة");
    expect(source).not.toContain("12 فيديو");
  });

  it("keeps the verified channel ID in the API boundary", async () => {
    const youtube = await import("../lib/youtube");
    expect(youtube.OFFICIAL_CHANNEL_ID).toBe("UCZJdmjp4Mt-wU7miDGMEOuA");
  });
});
