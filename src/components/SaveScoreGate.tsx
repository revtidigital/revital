import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SignupGate } from "@/components/SignupGate";
import { getCurrentScores, isLoggedIn } from "@/lib/storage";
import { loadRecaptcha } from "@/lib/recaptcha";

export function SaveScoreGate({ mode: initialMode }: { mode: "login" | "signup" }) {
  const nav = useNavigate();
  const [mode, setModeState] = useState<"login" | "signup">(initialMode);
  // Computed synchronously (not via useEffect) so a route change between
  // /save-score/login and /save-score/signup doesn't remount this component
  // into a blank frame before the check resolves — avoids a flash/glitch
  // when switching tabs.
  const [scores] = useState(() => getCurrentScores());
  const [loggedIn] = useState(() => isLoggedIn());
  const missingScores = scores.reflex === null || scores.memory === null || scores.balance === null;
  const showForm = !missingScores && !loggedIn;

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
    if (missingScores) {
      nav({ to: "/challenges" });
      return;
    }
    if (loggedIn) {
      nav({ to: "/result" });
      return;
    }
  }, [nav, missingScores, loggedIn]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showForm && (
        <SignupGate mode={mode} onModeChange={setMode} onSuccess={() => nav({ to: "/result" })} />
      )}
    </div>
  );
}
