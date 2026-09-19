import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SignupGate } from "@/components/SignupGate";
import { getCurrentScores, isLoggedIn } from "@/lib/storage";
import { loadRecaptcha } from "@/lib/recaptcha";

export const Route = createFileRoute("/save-score")({
  validateSearch: (search: Record<string, unknown>): { mode?: "login" | "signup" } => ({
    mode: search.mode === "login" ? "login" : undefined,
  }),
  component: SaveScore,
});

function SaveScore() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const [showForm, setShowForm] = useState(false);
  const mode = search.mode === "login" ? "login" : "signup";

  const setMode = (targetMode: "login" | "signup") => {
    nav({
      to: "/save-score",
      search: (prev: any) => ({
        ...(typeof prev === "object" ? prev : {}),
        mode: targetMode === "login" ? "login" : undefined,
      }),
      replace: true,
    });
  };

  useEffect(() => {
    loadRecaptcha();
  }, []);

  useEffect(() => {
    const s = getCurrentScores();
    if (s.reflex === null || s.memory === null || s.balance === null) {
      nav({ to: "/challenges" });
      return;
    }
    if (isLoggedIn()) {
      nav({ to: "/result" });
      return;
    }
    setShowForm(true);
  }, [nav]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showForm && (
        <SignupGate mode={mode} onModeChange={setMode} onSuccess={() => nav({ to: "/result" })} />
      )}
    </div>
  );
}
