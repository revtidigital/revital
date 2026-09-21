import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL: /save-score and /save-score?mode=login used to render both
// signup and login here. Kept as a redirect so old links/bookmarks keep working.
export const Route = createFileRoute("/save-score")({
  validateSearch: (search: Record<string, unknown>): { mode?: "login" | "signup" } => ({
    mode: search.mode === "login" ? "login" : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/save-score/$mode",
      params: { mode: search.mode === "login" ? "login" : "signup" },
      replace: true,
    });
  },
});
