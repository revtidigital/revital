import { Link, useRouterState } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics";

export function Footer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.toLowerCase().startsWith("/admin")) return null;

  return (
    <footer className="mt-16 border-t border-[var(--garnet)]/10 bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm md:flex-row md:gap-4 md:py-8">
        <p className="text-center font-medium text-garnet/70">
          © {new Date().getFullYear()} Revital Energy Challenge. All rights reserved.
        </p>
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
        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:text-base">
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
        </nav>
      </div>
    </footer>
  );
}
