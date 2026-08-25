import { describe, expect, it } from "vitest";
import { getStartupState } from "../lib/startup";

describe("startup state", () => {
  it("keeps a visible loading state while authentication is pending", () => {
    expect(getStartupState({ loading: true, timedOut: false, hasUser: false, isPublicRoute: false })).toBe("loading");
  });

  it("fails open to a retry state after the startup timeout", () => {
    expect(getStartupState({ loading: true, timedOut: true, hasUser: false, isPublicRoute: false })).toBe("timeout");
  });

  it("allows public login and callback routes after initialization", () => {
    expect(getStartupState({ loading: false, timedOut: false, hasUser: false, isPublicRoute: true })).toBe("ready");
  });

  it("marks an unauthenticated protected route for redirect", () => {
    expect(getStartupState({ loading: false, timedOut: false, hasUser: false, isPublicRoute: false })).toBe("redirect");
  });

  it("renders authenticated content after initialization", () => {
    expect(getStartupState({ loading: false, timedOut: false, hasUser: true, isPublicRoute: false })).toBe("ready");
  });
});
