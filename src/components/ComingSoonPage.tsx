import { useEffect, useState } from "react";
import heroWordmarkUrl from "@/assets/revital-hero-wordmark.webp?url";
import { Footer } from "@/components/Footer";

function getRemaining(endAt: string) {
  const diff = new Date(endAt).getTime() - Date.now();
  const clamped = Math.max(0, diff);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return { diff, days, hours, minutes, seconds };
}

/**
 * Full-site gate shown while comingSoonEnabled is on. Polls every second and
 * reloads once the target time passes, so the real site appears automatically
 * with no manual toggle needed.
 */
export function ComingSoonPage({ endAt }: { endAt: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getRemaining(endAt);
      setRemaining(next);
      if (next.diff <= 0) {
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Minutes", value: remaining.minutes },
    { label: "Seconds", value: remaining.seconds },
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 text-center">
        <img src={heroWordmarkUrl} alt="Revital Energy Challenge" className="w-36 md:w-48 mb-2" />
        <h1 className="text-2xl md:text-4xl font-black text-gradient-energy leading-[1.3] pb-1 mb-2">
          Revealing Soon
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mb-4 max-w-md">
          The Revital Energy Challenge is almost here. Get ready to play, score, and climb the
          leaderboard.
        </p>
        <div className="flex items-center gap-2 md:gap-4">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex flex-col items-center bg-gradient-card border border-border rounded-2xl px-3 py-2 md:px-5 md:py-3 shadow-card min-w-[56px] md:min-w-[76px]"
            >
              <span className="text-xl md:text-3xl font-black text-gradient-energy tabular-nums">
                {String(u.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] md:text-xs uppercase tracking-wider text-muted-foreground mt-1">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Footer hideLegalLinks />
    </div>
  );
}
