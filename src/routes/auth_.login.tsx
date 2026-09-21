import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/auth_/login")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string; phone?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  component: AuthLoginRoute,
});

function AuthLoginRoute() {
  const search = Route.useSearch();
  return <AuthForm mode="login" redirect={search.redirect} phone={search.phone} />;
}
