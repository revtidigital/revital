import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { getUser } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";

const SNOOZE_KEY = "revital_referral_popup_snoozed_until";
const COOKIE_CONSENT_KEY = "revital.cookieConsent";

// Time to wait after cookie popup exit animation before showing referral popup
const AFTER_COOKIE_DELAY_MS = 700;

function isSnoozed(): boolean {
  try {
    const val = localStorage.getItem(SNOOZE_KEY);
    if (!val) return false;
    return Date.now() < parseInt(val, 10);
  } catch {
    return false;
  }
}

function snooze24h(): void {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
  } catch {}
}

/** True once user has accepted OR declined cookies (key is set to any value) */
function hasCookieDecision(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) !== null;
  } catch {
    return false;
  }
}

export function ReferralPopup() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Exclude admin routes
    if (pathname.toLowerCase().startsWith("/admin")) return;
    if (isSnoozed()) return;

    // Direct listener for standard DOM custom event
    const handleDismissed = () => {
      if (isSnoozed()) return;
      setTimeout(() => {
        if (!isSnoozed()) {
          setShow(true);
        }
      }, AFTER_COOKIE_DELAY_MS);
    };

    window.addEventListener("cookie_consent_dismissed", handleDismissed);

    // Initial decision check on mount:
    // If cookie was ALREADY decided BEFORE opening this tab/page, check if user hasn't seen referral popup
    // BUT if cookie is NOT decided yet (banner is currently visible), poll for the click!
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    if (!hasCookieDecision()) {
      // Cookie banner is showing. Check every 100ms for user clicking Accept or Decline
      pollTimer = setInterval(() => {
        if (hasCookieDecision()) {
          if (pollTimer) clearInterval(pollTimer);
          handleDismissed();
        }
      }, 100);
    }

    // Also wrap localStorage.setItem in window to capture same-window setItem calls instantly
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = function (key: string, value: string) {
      originalSetItem.apply(this, [key, value]);
      if (key === COOKIE_CONSENT_KEY) {
        if (pollTimer) clearInterval(pollTimer);
        handleDismissed();
      }
    };

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener("cookie_consent_dismissed", handleDismissed);
      window.localStorage.setItem = originalSetItem;
    };
  }, [pathname]);

  const handleNotNow = () => {
    snooze24h();
    setShow(false);
    trackEvent("referral_popup_snoozed");
  };

  const handleReferNow = () => {
    setShow(false);
    trackEvent("referral_popup_refer_now");
    const user = getUser();
    if (user) {
      nav({ to: "/profile", hash: "referral-url-section", search: { scroll: "referral" } });
    } else {
      nav({ to: "/auth", search: { mode: "signup", redirect: "referral" } });
    }
  };

  if (pathname.toLowerCase().startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 22 }}
          className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:max-w-md z-50"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl shrink-0">🤝</span>
              <div>
                <p className="text-sm font-bold text-foreground">Refer & Earn Bonus Points!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Earn 100 bonus points for every successful referral. No limit!
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleReferNow}
                className="flex-1 py-2 rounded-full bg-gradient-energy text-energy-foreground font-semibold text-sm shadow-button active:scale-95 transition-transform"
              >
                Refer Now
              </button>
              <button
                onClick={handleNotNow}
                title="Snooze for 24 hours"
                className="px-3.5 py-2 rounded-full bg-muted text-muted-foreground font-medium text-xs sm:text-sm hover:text-foreground transition-colors whitespace-nowrap"
              >
                Not Now
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/70 text-right mt-2">
              Choosing &apos;Not Now&apos; snoozes this for 24 hours
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
