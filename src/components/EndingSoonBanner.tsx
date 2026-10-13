import { useEffect, useState } from "react";

function getRemaining(endAt: string) {
  const diff = new Date(endAt).getTime() - Date.now();
  const clamped = Math.max(0, diff);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return { diff, days, hours, minutes, seconds };
}

const DEFAULT_HEADING = "THE REVITAL ENERGY CHALLENGE ENDS IN";
const DEFAULT_SUBHEADING = "YOUR LAST CHANCE TO CLAIM THE GRAND PRIZE";
const DEFAULT_MESSAGE =
  "Time is running out! Make your final move, build your Grand Score, and compete for a place among our 3 Grand Winners.";

/**
 * Non-blocking countdown banner shown on the home page while endingSoonEnabled is on.
 * Unlike ComingSoonPage this never gates the site — it just hides itself once endAt passes.
 */
export function EndingSoonBanner({
  endAt,
  heading,
  subheading,
  message,
}: {
  endAt: string;
  heading?: string;
  subheading?: string;
  message?: string;
}) {
  const [remaining, setRemaining] = useState(() => getRemaining(endAt));
  const [expired, setExpired] = useState(() => getRemaining(endAt).diff <= 0);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getRemaining(endAt);
      setRemaining(next);
      if (next.diff <= 0) {
        setExpired(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  if (expired) return null;

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Minutes", value: remaining.minutes },
    { label: "Seconds", value: remaining.seconds },
  ];

  return (
    <div className="mx-auto mt-8 md:mt-10 max-[900px]:mt-6 mb-8 md:mb-10 max-[900px]:mb-6 max-w-3xl rounded-3xl border-2 border-[var(--garnet)]/15 bg-gradient-to-br from-[var(--garnet)]/10 via-white/90 to-[var(--tiger)]/10 px-5 py-9 md:px-7 md:py-12 backdrop-blur shadow-card text-center">
      <h2 className="text-xl md:text-3xl font-black text-garnet leading-tight">
        {heading?.trim() ? heading : DEFAULT_HEADING}
      </h2>

      <div className="mt-4 flex items-center justify-center gap-2 md:gap-4">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex flex-col items-center bg-white/90 border border-[var(--garnet)]/15 rounded-2xl px-3 py-2 md:px-5 md:py-3 shadow-card min-w-[62px] md:min-w-[76px]"
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

      <p className="mt-4 text-sm md:text-base font-bold text-gradient-energy uppercase tracking-wide">
        {subheading?.trim() ? subheading : DEFAULT_SUBHEADING}
      </p>
      <p className="mt-2 text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto">
        {message?.trim() ? message : DEFAULT_MESSAGE}
      </p>
    </div>
  );
}
