import { motion } from "framer-motion";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface GameSummary {
  emoji: string;
  title: string;
  description: string;
}

const GAMES: GameSummary[] = [
  { emoji: "⚡", title: "Reflex Test", description: "Test your reaction speed." },
  { emoji: "🧠", title: "Memory Game", description: "Test your memory and accuracy." },
  { emoji: "🎯", title: "Balance Game", description: "Test your focus and control." },
];

interface GamesOverviewOverlayProps {
  onPlayNow: () => void;
}

export function GamesOverviewOverlay({ onPlayNow }: GamesOverviewOverlayProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-md px-4 overscroll-contain touch-none"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="w-full max-w-md bg-gradient-card border border-border rounded-3xl p-6 text-center shadow-card"
      >
        <h2 className="text-xl md:text-2xl font-black text-gradient-energy">
          Here's what you'll be playing today
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {GAMES.map((game) => (
            <div
              key={game.title}
              className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-background/40 px-2 py-3 text-center"
            >
              <span className="text-2xl">{game.emoji}</span>
              <p className="font-bold text-xs">{game.title}</p>
              <p className="text-[10px] text-muted-foreground">{game.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Go through the instructions before playing each game.
        </p>

        <button
          onClick={() => {
            trackEvent("cta_click", { cta_label: "games_overview_play_now" });
            onPlayNow();
          }}
          className="mt-4 w-full py-4 rounded-full bg-gradient-energy text-energy-foreground font-bold shadow-button hover:scale-105 active:scale-95 transition-transform"
        >
          ▶ Play Now
        </button>
      </motion.div>
    </motion.div>
  );
}
