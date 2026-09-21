import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SignupGate } from "@/components/SignupGate";
import { getCurrentScores, isLoggedIn } from "@/lib/storage";
import { loadRecaptcha } from "@/lib/recaptcha";

export function SaveScoreGate({ mode: initialMode }: { mode: "login" | "signup" }) {
  const nav = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [mode, setModeState] = useState<"login" | "signup">(initialMode);

  const setMode = (targetMode: "login" | "signup") => {
    setModeState(targetMode);
    nav({
      to: targetMode === "login" ? "/save-score/login" : "/save-score/signup",
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
