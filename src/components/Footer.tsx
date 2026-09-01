import { Link, useRouterState } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics";

export function Footer({ hideLegalLinks = false }: { hideLegalLinks?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.toLowerCase().startsWith("/admin")) return null;

  return (
    <footer
      className={`border-t border-[var(--garnet)]/10 bg-white/60 shrink-0 ${hideLegalLinks ? "mt-2" : "mt-16"}`}
    >
      <div
        className={
          hideLegalLinks
            ? "mx-auto flex w-full max-w-6xl flex-col items-center gap-1 px-3 py-1.5 text-[10px] sm:px-4 sm:py-2 sm:text-xs md:grid md:grid-cols-3"
            : "mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm md:flex-row md:gap-4 md:py-8"
        }
      >
        <p
          className={`font-medium text-garnet/70 ${hideLegalLinks ? "text-center md:text-left md:justify-self-start" : "text-center"}`}
        >
          © {new Date().getFullYear()} Revital Energy Challenge. All rights reserved.
        </p>
        <div
          className={`flex items-center ${hideLegalLinks ? "gap-2 justify-center md:gap-3 md:justify-self-center" : "gap-3"}`}
        >
          <a
            href="https://www.instagram.com/revital.uae"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click", { platform: "instagram", source: "footer" })}
            aria-label="Follow us on Instagram"
            className="inline-flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-7 md:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ig-footer-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FEDA75" />
                  <stop offset="25%" stopColor="#FA7E1E" />
                  <stop offset="50%" stopColor="#D62976" />
                  <stop offset="75%" stopColor="#962FBF" />
                  <stop offset="100%" stopColor="#4F5BD5" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-footer-gradient)" />
              <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" stroke="white" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3.2" stroke="white" strokeWidth="1.6" />
              <circle cx="16.2" cy="7.8" r="1" fill="white" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61554371357928"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click", { platform: "facebook", source: "footer" })}
            aria-label="Follow us on Facebook"
            className="inline-flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-7 md:h-7" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="#1877F2" />
              <path
                d="M15.5 8.5h-1.4c-.4 0-.6.2-.6.6v1.2h2l-.3 2h-1.7V17h-2.2v-4.7H9.5v-2h1.8V9c0-1.6.9-2.5 2.5-2.5h1.7v2Z"
                fill="white"
              />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@RevitalUAE"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click", { platform: "youtube", source: "footer" })}
            aria-label="Subscribe to us on YouTube"
            className="inline-flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-7 md:h-7" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="#FF0000" />
              <path d="M9.5 8.6 15.8 12l-6.3 3.4V8.6Z" fill="white" />
            </svg>
          </a>
        </div>
        <nav
          className={`flex flex-wrap items-center gap-x-3 gap-y-1 md:text-base ${
            hideLegalLinks ? "justify-center md:justify-end md:justify-self-end" : "justify-center"
          }`}
        >
          {!hideLegalLinks && (
            <>
              <Link
                to="/rules"
                onClick={() => trackEvent("nav_click", { nav_label: "rules", source: "footer" })}
                className="font-semibold text-garnet/80 transition-colors hover:text-[var(--tiger)]"
              >
                Rules
              </Link>
              <span className="text-garnet/30">•</span>
              <Link
                to="/privacy"
                onClick={() => trackEvent("nav_click", { nav_label: "privacy", source: "footer" })}
                className="font-semibold text-garnet/80 transition-colors hover:text-[var(--tiger)]"
              >
                Privacy Policy
              </Link>
              <span className="text-garnet/30">•</span>
              <Link
                to="/terms"
                onClick={() => trackEvent("nav_click", { nav_label: "terms", source: "footer" })}
                className="font-semibold text-garnet/80 transition-colors hover:text-[var(--tiger)]"
              >
                Terms & Conditions
              </Link>
            </>
          )}
          {!hideLegalLinks && <span className="text-garnet/30">•</span>}
          <a
            href="mailto:revitalenergyuae@gmail.com"
            onClick={() => trackEvent("nav_click", { nav_label: "support", source: "footer" })}
            className="font-semibold text-garnet/80 transition-colors hover:text-[var(--tiger)]"
          >
            Support
          </a>
        </nav>
      </div>
    </footer>
  );
}
