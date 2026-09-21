import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/auth_/signup")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string; phone?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  component: AuthSignupRoute,
});

function AuthSignupRoute() {
  const search = Route.useSearch();
  return <AuthForm mode="signup" redirect={search.redirect} phone={search.phone} />;
}
