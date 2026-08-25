export type StartupState = "loading" | "timeout" | "redirect" | "ready";

export function getStartupState({
  loading,
  timedOut,
  hasUser,
  isPublicRoute,
}: {
  loading: boolean;
  timedOut: boolean;
  hasUser: boolean;
  isPublicRoute: boolean;
}): StartupState {
  if (loading && !timedOut) return "loading";
  if (loading && timedOut) return "timeout";
  if (!hasUser && !isPublicRoute) return "redirect";
  return "ready";
}
