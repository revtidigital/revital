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

  // The page's own container height alone isn't enough to stop scrolling on
  // mobile — the document/body itself must also be locked, or a small mismatch
  // between 100vh/100dvh (mobile browser toolbar show/hide) lets it scroll.
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Minutes", value: remaining.minutes },
    { label: "Seconds", value: remaining.seconds },
  ];

  return (
    <div className="h-[100dvh] grid grid-rows-[minmax(0,1fr)_auto] bg-background overflow-hidden overscroll-none">
      <div className="min-h-0 overflow-y-auto flex flex-col items-center justify-center px-4 py-2 text-center">
        <img src={heroWordmarkUrl} alt="Revital Energy Challenge" className="w-28 md:w-48 mb-1.5" />
        <h1 className="text-xl md:text-4xl font-black text-gradient-energy leading-[1.3] pb-1 mb-1.5">
          Revealing Soon
        </h1>
        <p className="text-[11px] md:text-sm text-muted-foreground mb-2 max-w-md">
          The Revital Energy Challenge is almost here. Get ready to play, score, and climb the
          leaderboard.
        </p>
        <div className="flex items-center gap-2 md:gap-4">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex flex-col items-center bg-gradient-card border border-border rounded-2xl px-3 py-2 md:px-5 md:py-3 shadow-card min-w-[62px] md:min-w-[76px]"
            >
              <span className="text-2xl md:text-3xl font-black text-gradient-energy tabular-nums">
                {String(u.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] md:text-xs uppercase tracking-wider text-muted-foreground mt-0.5">
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
