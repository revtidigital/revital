import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy URL: /auth and /auth?mode=signup used to render both login and
// signup here. Kept as a redirect so old links/bookmarks keep working.
export const Route = createFileRoute("/auth")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { mode?: "login" | "signup"; redirect?: string; phone?: string } => ({
    mode: search.mode === "signup" ? "signup" : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: search.mode === "signup" ? "/auth/signup" : "/auth/login",
      search: { redirect: search.redirect, phone: search.phone },
      replace: true,
    });
  },
});
