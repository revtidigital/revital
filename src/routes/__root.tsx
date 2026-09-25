import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import revitalLogo from "@/assets/revital-logo.webp?url";
import heroWordmarkUrl from "@/assets/revital-hero-wordmark.webp?url";

const socialShareOgImage = `https://revital.revtilabs.com${heroWordmarkUrl}`;
import { CookieConsent } from "@/components/CookieConsent";
import { ReferralPopup } from "@/components/ReferralPopup";
import { Footer } from "@/components/Footer";
import { ComingSoonPage } from "@/components/ComingSoonPage";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-black text-gradient-energy">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-energy px-6 py-3 text-sm font-semibold text-energy-foreground shadow-button hover:scale-105 transition-transform"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  loader: async () => {
    try {
      const { getPlatformSettingsFn } = await import("@/server/adminFns");
      const settings = await getPlatformSettingsFn();
      return {
        comingSoonEnabled: settings.comingSoonEnabled,
        comingSoonStartAt: settings.comingSoonStartAt,
        comingSoonEndAt: settings.comingSoonEndAt,
        comingSoonMessage: settings.comingSoonMessage,
        ga4: settings.ga4,
        metaPixel: settings.metaPixel,
        tiktokPixel: settings.tiktokPixel,
        clarity: settings.clarity,
      };
    } catch {
      // Never let a settings-fetch failure take the whole site down.
      return {
        comingSoonEnabled: false,
        comingSoonStartAt: "",
        comingSoonEndAt: "",
        comingSoonMessage: "",
        ga4: "",
        metaPixel: "",
        tiktokPixel: "",
        clarity: "",
      };
    }
  },
  head: ({ loaderData, match }) => {
    const isAdminRoute = match.pathname.toLowerCase().startsWith("/admin");
    const scripts: Array<{ id: string; children?: string; src?: string; async?: boolean }> = [];
    if (!isAdminRoute && loaderData) {
      const { ga4, metaPixel, tiktokPixel, clarity } = loaderData;
      if (ga4) {
        scripts.push({ id: "_ga4", src: `https://www.googletagmanager.com/gtag/js?id=${ga4}`, async: true });
        scripts.push({
          id: "_ga4_inline",
          children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`,
        });
      }
      if (metaPixel) {
        scripts.push({
          id: "_fbpixel",
          children: `window.__metaPixelId=${JSON.stringify(metaPixel)};!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixel}');fbq('track','PageView');`,
        });
      }
      if (tiktokPixel) {
        scripts.push({
          id: "_ttpixel",
          children: `window.__tiktokPixelId=${JSON.stringify(tiktokPixel)};!function (w, d, t) {\n  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};\n  ttq.load('${tiktokPixel}');\n  ttq.page();\n}(window, document, 'ttq');`,
        });
      }
      if (clarity) {
        scripts.push({
          id: "_clarity",
          children: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${clarity}");`,
        });
      }
    }
    return {
      scripts,
      meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#F37421" },
      { title: "Revital Energy Challenge — Are You Ready?" },
      {
        name: "description",
        content:
          "Take the Revital Energy Challenge. Play 3 fast games, score your energy, and climb the daily leaderboard.",
      },
      { property: "og:title", content: "Revital Energy Challenge — Are You Ready?" },
      {
        property: "og:description",
        content:
          "Take the Revital Energy Challenge. Play 3 fast games, score your energy, and climb the daily leaderboard.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://revital-energy-challenge.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Revital Energy Challenge — Are You Ready?" },
      {
        name: "twitter:description",
        content:
          "Take the Revital Energy Challenge. Play 3 fast games, score your energy, and climb the daily leaderboard.",
      },
      { property: "og:image", content: socialShareOgImage },
      { property: "og:image:alt", content: "Revital Energy Challenge logo" },
      { name: "twitter:image", content: socialShareOgImage },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: revitalLogo, type: "image/png" },
      { rel: "apple-touch-icon", href: revitalLogo },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://accounts.google.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800;900&family=Pacifico&display=swap",
      },
    ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = pathname.toLowerCase().startsWith("/admin");
  const { comingSoonEnabled, comingSoonStartAt, comingSoonEndAt, comingSoonMessage } =
    Route.useLoaderData();
  const comingSoonActive =
    !isAdminRoute &&
    comingSoonEnabled &&
    !!comingSoonEndAt &&
    Date.now() < new Date(comingSoonEndAt).getTime() &&
    (!comingSoonStartAt || Date.now() >= new Date(comingSoonStartAt).getTime());

  // If Coming Soon is enabled but scheduled to start later, poll and reload
  // once the start time passes, so it flips on automatically with no manual
  // toggle or page refresh needed (mirrors ComingSoonPage's own end-time poll).
  useEffect(() => {
    if (comingSoonActive || !comingSoonEnabled || !comingSoonStartAt) return;
    const startTime = new Date(comingSoonStartAt).getTime();
    if (Number.isNaN(startTime) || Date.now() >= startTime) return;
    const interval = setInterval(() => {
      if (Date.now() >= startTime) {
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [comingSoonActive, comingSoonEnabled, comingSoonStartAt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as typeof window & {
      fbq?: (...args: unknown[]) => void;
      gtag?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };
    const fbq = w.fbq;
    if (typeof fbq === "function") {
      fbq("track", "PageView");
    }

    // Keep GA4 page views in sync for SPA navigations.
    if (typeof w.gtag === "function") {
      w.gtag("event", "page_view", {
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    } else if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({
        event: "page_view",
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    }
  }, [pathname]);

  useEffect(() => {
    // Persist referral code from URL so it can be auto-filled later in the signup popup
    // even after route changes during gameplay.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const referralCode = params.get("ref")?.trim();
      if (referralCode) {
        window.localStorage.setItem("revital_referral_code", referralCode.toUpperCase());
      }

      const utmPayload = {
        utmSource: params.get("utm_source")?.trim() || "",
        utmMedium: params.get("utm_medium")?.trim() || "",
        utmCampaign: params.get("utm_campaign")?.trim() || "",
        utmTerm: params.get("utm_term")?.trim() || "",
        utmContent: params.get("utm_content")?.trim() || "",
      };
      const hasUtm = Object.values(utmPayload).some(Boolean);
      if (hasUtm) {
        window.localStorage.setItem("revital_utm_params", JSON.stringify(utmPayload));
      }
    }

    // Tracking scripts (GA4/Meta/TikTok/Clarity) are now rendered server-side via the
    // route's head() scripts, so any HTML-only crawler (pixel verification tools, view-source)
    // sees them immediately instead of waiting on a client fetch. As a resiliency fallback,
    // load GA4 from the build-time env var if the DB-configured one wasn't rendered (e.g. the
    // settings fetch failed during SSR).
    if (!isAdminRoute) {
      const ga4FromEnv = (import.meta.env.VITE_GA4_ID as string | undefined)?.trim() || "";
      if (ga4FromEnv && !document.getElementById("_ga4")) {
        const gScript = document.createElement("script");
        gScript.id = "_ga4";
        gScript.async = true;
        gScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4FromEnv}`;
        document.head.appendChild(gScript);
        const gInline = document.createElement("script");
        gInline.id = "_ga4_inline";
        gInline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4FromEnv}');`;
        document.head.appendChild(gInline);
      }
    }
  }, [isAdminRoute]);

  if (comingSoonActive) {
    return (
      <>
        <ComingSoonPage endAt={comingSoonEndAt} message={comingSoonMessage} />
        <CookieConsent />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CookieConsent />}
      {!isAdminRoute && <ReferralPopup />}
    </div>
  );
}
