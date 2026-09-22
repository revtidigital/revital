import { useEffect, useState, type FormEvent } from "react";
import heroWordmarkUrl from "@/assets/revital-hero-wordmark.webp?url";
import { Footer } from "@/components/Footer";
import { saveComingSoonEmailFn } from "@/server/adminFns";

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
const DEFAULT_MESSAGE =
  "The Revital Energy Challenge is almost here. Get ready to play, score, and climb the leaderboard.";

export function ComingSoonPage({ endAt, message }: { endAt: string; message?: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endAt));
  const [email, setEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  const handleNotify = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || notifyStatus === "submitting") return;
    setNotifyStatus("submitting");
    try {
      await saveComingSoonEmailFn({ data: { email: email.trim() } });
      setNotifyStatus("done");
    } catch {
      setNotifyStatus("error");
    }
  };

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

  // First line of the message becomes the heading (defaults to "Revealing
  // Soon" when no custom message is set); any remaining lines render below
  // as the body paragraph, blank lines and all.
  const fullMessage = message?.trim() ? message : `Revealing Soon\n\n${DEFAULT_MESSAGE}`;
  const [heading, ...restLines] = fullMessage.split("\n");
  const rest = restLines.join("\n").trim();

  return (
    <div className="h-[100dvh] grid grid-rows-[minmax(0,1fr)_auto] bg-background overflow-hidden overscroll-none">
      <div className="min-h-0 overflow-y-auto flex flex-col items-center justify-center px-4 py-2 text-center">
        <img src={heroWordmarkUrl} alt="Revital Energy Challenge" className="w-28 md:w-48 mb-1.5" />
        <h1 className="text-xl md:text-4xl font-black text-gradient-energy leading-[1.3] pb-1 mb-1.5">
          {heading}
        </h1>
        {rest && (
          <p className="text-[11px] md:text-sm text-muted-foreground mb-2 max-w-md whitespace-pre-line">
            {rest}
          </p>
        )}
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
        {notifyStatus === "done" ? (
          <p className="mt-4 text-xs md:text-sm text-muted-foreground">
            Thanks! We'll notify you when we're live.
          </p>
        ) : (
          <form
            onSubmit={handleNotify}
            className="mt-4 flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs sm:max-w-sm"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full sm:flex-1 bg-background/60 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={notifyStatus === "submitting"}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-gradient-energy px-4 py-2 text-sm font-semibold text-energy-foreground shadow-button hover:scale-105 transition-transform disabled:opacity-60 disabled:hover:scale-100"
            >
              {notifyStatus === "submitting" ? "Sending..." : "Get Notified"}
            </button>
          </form>
        )}
        {notifyStatus === "error" && (
          <p className="mt-1 text-[11px] text-destructive">Something went wrong. Please try again.</p>
        )}
      </div>
      <Footer hideLegalLinks />
    </div>
  );
}
