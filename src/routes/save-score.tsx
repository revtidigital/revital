import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SignupGate } from "@/components/SignupGate";
import { getCurrentScores, isLoggedIn } from "@/lib/storage";
import { loadRecaptcha } from "@/lib/recaptcha";

export const Route = createFileRoute("/save-score")({
  component: SaveScore,
});

function SaveScore() {
  const nav = useNavigate();
  const [showForm, setShowForm] = useState(false);

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
      {showForm && <SignupGate onSuccess={() => nav({ to: "/result" })} />}
    </div>
  );
}
