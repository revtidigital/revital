declare global {
  interface Window {
    __rcSiteKey?: string;
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Loads the reCAPTCHA v3 script (and its always-visible corner badge) only on
 * pages that actually submit a form through it — do not call this from the
 * root layout, or the badge shows up on every page including admin.
 */
export function loadRecaptcha(): void {
  if (typeof document === "undefined" || document.getElementById("_recaptcha")) return;
  (async () => {
    try {
      const { getPlatformSettingsFn } = await import("@/server/adminFns");
      const s = await getPlatformSettingsFn();
      if (!s.recaptchaSite || document.getElementById("_recaptcha")) return;
      const rcScript = document.createElement("script");
      rcScript.id = "_recaptcha";
      rcScript.async = true;
      rcScript.src = `https://www.google.com/recaptcha/api.js?render=${s.recaptchaSite}`;
      document.head.appendChild(rcScript);
      window.__rcSiteKey = s.recaptchaSite;
    } catch {
      // Best-effort — executeRecaptcha() already treats a missing script as optional.
    }
  })();
}

/**
 * Executes reCAPTCHA v3 and returns a token.
 * Returns an empty string silently when reCAPTCHA is not configured or not yet loaded,
 * so the caller can treat verification as optional.
 */
export function executeRecaptcha(action: string): Promise<string> {
  return new Promise((resolve) => {
    const { grecaptcha, __rcSiteKey } = window;
    if (!grecaptcha || !__rcSiteKey) {
      resolve("");
      return;
    }
    grecaptcha.ready(async () => {
      try {
        const token = await grecaptcha.execute(__rcSiteKey, { action });
        resolve(token);
      } catch {
        resolve("");
      }
    });
  });
}
