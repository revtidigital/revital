type GtagFn = (...args: unknown[]) => void;
type FbqFn = (method: string, event: string, params?: object) => void;
type ClarityFn = (method: string, key: string, value?: string) => void;
interface TtqObject {
  track: (event: string, params?: object) => void;
  identify: (userData: object) => void;
}

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
    fbq?: FbqFn;
    clarity?: ClarityFn;
    ttq?: TtqObject;
    __metaPixelId?: string;
    __tiktokPixelId?: string;
  }
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Re-inits the Meta Pixel with hashed Advanced Matching data so Lead events
// downstream can be matched to a real person in Ads Manager. Must only ever
// send SHA-256 hashes to fbq, never raw PII.
export async function setMetaAdvancedMatching(phone?: string, email?: string): Promise<void> {
  if (typeof window === "undefined" || typeof window.fbq !== "function" || !window.__metaPixelId) {
    return;
  }
  try {
    const userData: Record<string, string> = {};
    const digits = phone?.replace(/\D/g, "");
    if (digits) userData.ph = await sha256Hex(digits);
    const normalizedEmail = email?.trim().toLowerCase();
    if (normalizedEmail) userData.em = await sha256Hex(normalizedEmail);
    if (Object.keys(userData).length > 0) {
      window.fbq("init", window.__metaPixelId, userData);
    }
  } catch {
    // Advanced Matching is best-effort — never block the calling flow.
  }
}

// Sends hashed phone/email to TikTok Pixel via ttq.identify so events can be
// matched to a real person for postback, mirroring Meta's Advanced Matching.
// Must only ever send SHA-256 hashes to ttq, never raw PII.
export async function setTiktokAdvancedMatching(phone?: string, email?: string): Promise<void> {
  if (
    typeof window === "undefined" ||
    typeof window.ttq?.identify !== "function" ||
    !window.__tiktokPixelId
  ) {
    return;
  }
  try {
    const userData: Record<string, string> = {};
    const digits = phone?.replace(/\D/g, "");
    if (digits) userData.phone_number = await sha256Hex(digits);
    const normalizedEmail = email?.trim().toLowerCase();
    if (normalizedEmail) userData.email = await sha256Hex(normalizedEmail);
    if (Object.keys(userData).length > 0) {
      window.ttq.identify(userData);
    }
  } catch {
    // Advanced Matching is best-effort — never block the calling flow.
  }
}

// Maps our internal event names to Meta Pixel standard events for better
// conversion optimisation in Meta Ads Manager.
const META_STANDARD: Record<string, string> = {
  signup_complete: "Lead",
  score_saved: "Lead",
  score_revealed: "ViewContent",
  coming_soon_notify: "Lead",
};

// Maps our internal event names to TikTok Pixel standard events for better
// conversion optimisation in TikTok Ads Manager.
const TIKTOK_STANDARD: Record<string, string> = {
  signup_complete: "CompleteRegistration",
  score_saved: "SubmitForm",
  score_revealed: "ViewContent",
  coming_soon_notify: "SubmitForm",
};

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  // ── GA4 ───────────────────────────────────────────────────────────────────
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params ?? {});
  } else if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...params });
  }

  // ── Meta Pixel ────────────────────────────────────────────────────────────
  if (typeof window.fbq === "function") {
    const standard = META_STANDARD[name];
    if (standard) {
      window.fbq("track", standard, params ?? {});
    } else {
      window.fbq("trackCustom", name, params ?? {});
    }
  }

  // ── TikTok Pixel ──────────────────────────────────────────────────────────
  if (typeof window.ttq?.track === "function") {
    const standard = TIKTOK_STANDARD[name];
    if (standard) {
      window.ttq.track(standard, params ?? {});
    } else {
      window.ttq.track(name, params ?? {});
    }
  }

  // ── Microsoft Clarity ─────────────────────────────────────────────────────
  if (typeof window.clarity === "function") {
    window.clarity("event", name);
    // Tag scalar params so they appear as filterable properties in Clarity.
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
          window.clarity("set", k, String(v));
        }
      }
    }
  }
}
