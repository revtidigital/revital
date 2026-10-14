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

/**
 * Non-blocking countdown banner shown on the home page while endingSoonEnabled is on.
 * Unlike ComingSoonPage this never gates the site — it just hides itself once endAt passes.
 */
export function EndingSoonBanner({
  endAt,
  heading,
  subheading,
}: {
  endAt: string;
  heading?: string;
  subheading?: string;
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
    { label: "Hours", value: remaining.hours },
    { label: "Minutes", value: remaining.minutes },
    { label: "Seconds", value: remaining.seconds },
  ];

  return (
    <div className="mx-auto mt-6 md:mt-8 max-[900px]:mt-5 mb-6 md:mb-8 max-[900px]:mb-5 max-w-xl rounded-2xl border-2 border-[var(--garnet)]/15 bg-gradient-to-br from-[var(--garnet)]/10 via-white/90 to-[var(--tiger)]/10 px-4 py-5 md:px-5 md:py-6 backdrop-blur shadow-card text-center">
      <h2 className="text-base md:text-xl font-black text-garnet leading-tight">
        {heading?.trim() ? heading : DEFAULT_HEADING}
      </h2>

      <div className="mt-3 flex items-center justify-center gap-1.5 md:gap-2.5">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex flex-col items-center bg-white/90 border border-[var(--garnet)]/15 rounded-xl px-2 py-1.5 md:px-3 md:py-2 shadow-card min-w-[48px] md:min-w-[58px]"
          >
            <span className="text-lg md:text-xl font-black text-gradient-energy tabular-nums">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {u.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs md:text-sm font-bold text-gradient-energy uppercase tracking-wide">
        {subheading?.trim() ? subheading : DEFAULT_SUBHEADING}
      </p>
    </div>
  );
}
