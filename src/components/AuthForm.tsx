import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import {
  categorize,
  computeTotal,
  findUserByContact,
  findUserByContactRemote,
  generateUserId,
  getPersistedUtmParams,
  getCurrentScores,
  PARTICIPANT_TYPES,
  saveUser,
  saveUserRemote,
  type ParticipantType,
} from "@/lib/storage";
import {
  trackEvent,
  trackConversion,
  setMetaAdvancedMatching,
  setTiktokAdvancedMatching,
} from "@/lib/analytics";
import { executeRecaptcha, loadRecaptcha } from "@/lib/recaptcha";
import { containsProfanity } from "@/lib/profanity";

export function AuthForm({
  mode: initialMode,
  redirect,
  phone,
}: {
  mode: "login" | "signup";
  redirect?: string;
  phone?: string;
}) {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [contact, setContact] = useState(() => (phone ?? "").replace(/[^\d]/g, "").slice(0, 9));
  const [referredBy, setReferredBy] = useState("");
  const [participantType, setParticipantType] = useState<ParticipantType | "">("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameFlagged, setNameFlagged] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [notRegistered, setNotRegistered] = useState(false);
  const [alreadyRegisteredInSignup, setAlreadyRegisteredInSignup] = useState(false);

  const switchMode = (targetMode: "login" | "signup") => {
    setMode(targetMode);
    setErr("");
    setNotRegistered(false);
    setAlreadyRegisteredInSignup(false);
    nav({
      to: targetMode === "signup" ? "/auth/signup" : "/auth/login",
      search: (prev: any) => (typeof prev === "object" ? prev : {}),
      replace: true,
    });
  };

  const canSubmitSignup =
    !!name.trim() &&
    NAME_REGEX.test(name.trim()) &&
    !nameFlagged &&
    !checkingName &&
    isValidUaePhone(contact) &&
    !!participantType &&
    (!referredBy.trim() || REFERRAL_SUFFIX_REGEX.test(referredBy.trim())) &&
    consent;
  const canSubmitLogin = isValidUaePhone(contact);
  const canSubmit = mode === "login" ? canSubmitLogin : canSubmitSignup;

  useEffect(() => {
    trackEvent("form_view", { form: "auth", page_url: window.location.href, mode });
  }, [mode]);

  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed || !NAME_REGEX.test(trimmed)) {
      setNameFlagged(false);
      setCheckingName(false);
      return;
    }
    setCheckingName(true);
    const timer = window.setTimeout(async () => {
      const flagged = await containsProfanity(trimmed);
      setNameFlagged(flagged);
      setCheckingName(false);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [name]);

  useEffect(() => {
    loadRecaptcha();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get("ref")?.trim();
    const storedRef = window.localStorage.getItem("revital_referral_code")?.trim();
    const normalizedRef = (refFromUrl || storedRef || "").toUpperCase();
    if (!normalizedRef) return;
    window.localStorage.setItem(
      "revital_referral_code",
      normalizedRef.startsWith("RVT-") ? normalizedRef : `RVT-${normalizedRef}`,
    );
    setReferredBy(stripReferralPrefix(normalizedRef));
    // A referral link implies signup intent.
    switchMode("signup");
    trackEvent("referral_prefilled", { form: "auth", referral_code: normalizedRef });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  // While in signup mode, warn early if the number is already registered.
  useEffect(() => {
    if (mode !== "signup") {
      setAlreadyRegisteredInSignup(false);
      return;
    }
    const normalizedContact = normalizeUaePhone(contact);
    const isCandidate = /^\+9715\d{8}$/.test(normalizedContact);
    if (!isCandidate) {
      setAlreadyRegisteredInSignup(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      // Existence check only — must NOT log the user in as a side effect.
      const user =
        (await findUserByContactRemote(normalizedContact, { sync: false })) ??
        findUserByContact(normalizedContact);
      setAlreadyRegisteredInSignup(!!user);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [mode, contact]);

  const formStarted = useRef(false);
  const handleFormStart = () => {
    if (formStarted.current) return;
    formStarted.current = true;
    trackEvent("form_start", { form: "auth", mode });
  };

  const goToProfile = async () => {
    try {
      await nav({ to: "/profile" });
    } catch (e) {
      console.warn("Router navigation failed, falling back to hard redirect", e);
      if (typeof window !== "undefined") window.location.assign("/profile");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setNotRegistered(false);
    trackEvent("form_submit_attempt", { form: "auth_login" });

    if (!isValidUaePhone(contact)) {
      setErr("Please enter a valid UAE mobile number (e.g. +971501234567)");
      trackEvent("form_validation_error", { form: "auth", reason: "invalid_phone" });
      return;
    }
    if (isDummyExamplePhone(contact)) {
      setErr("This number is just an example — please enter your own mobile number.");
      trackEvent("form_validation_error", { form: "auth", reason: "dummy_example_phone" });
      return;
    }

    setLoading(true);
    try {
      const normalizedContact = normalizeUaePhone(contact.trim());
      const user =
        (await findUserByContactRemote(normalizedContact)) ?? findUserByContact(normalizedContact);

      if (!user) {
        setNotRegistered(true);
        setErr("You are not registered with this number. Please sign up first.");
        trackEvent("login_failed_not_registered", { form: "auth" });
        setLoading(false);
        return;
      }

      saveUser(user);
      trackEvent("login_success", { form: "auth" });
      if (redirect && redirect.startsWith("/")) {
        try {
          await nav({ to: redirect });
        } catch (e) {
          console.warn("Router navigation failed, falling back to hard redirect", e);
          if (typeof window !== "undefined") window.location.assign(redirect);
        }
        return;
      }
      await goToProfile();
    } catch (e) {
      console.warn("Login failed", e);
      setErr("Could not log in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    trackEvent("form_submit_attempt", { form: "auth_signup" });

    if (alreadyRegisteredInSignup) {
      setErr("This number is already registered. Please login to view your score.");
      return;
    }
    if (!name.trim() || !NAME_REGEX.test(name.trim())) {
      setErr("Please enter your full name (letters only)");
      trackEvent("form_validation_error", { form: "auth", reason: "invalid_name" });
      return;
    }
    if (await containsProfanity(name.trim())) {
      setNameFlagged(true);
      setErr("Please enter an appropriate name.");
      trackEvent("form_validation_error", { form: "auth", reason: "name_flagged" });
      return;
    }
    if (!isValidUaePhone(contact)) {
      setErr("Enter a valid UAE mobile number");
      trackEvent("form_validation_error", { form: "auth", reason: "invalid_phone" });
      return;
    }
    if (isDummyExamplePhone(contact)) {
      setErr("This number is just an example — please enter your own mobile number.");
      trackEvent("form_validation_error", { form: "auth", reason: "dummy_example_phone" });
      return;
    }
    if (!participantType) {
      setErr("Please select who you are");
      trackEvent("form_validation_error", { form: "auth", reason: "missing_participant_type" });
      return;
    }
    if (referredBy.trim() && !REFERRAL_SUFFIX_REGEX.test(referredBy.trim())) {
      setErr("Enter a valid referral code (e.g. A1B2C3D4E5)");
      trackEvent("form_validation_error", { form: "auth", reason: "invalid_referral_code" });
      return;
    }
    if (!consent) {
      setErr("Please accept the consent to continue");
      trackEvent("form_validation_error", { form: "auth", reason: "consent_not_accepted" });
      return;
    }

    setLoading(true);
    try {
      const token = await executeRecaptcha("save_score");
      if (token) {
        const { verifyCaptchaFn } = await import("@/server/userFns");
        const result = await verifyCaptchaFn({ data: { token } });
        if (!result.ok) {
          setErr("Security check failed. Please refresh and try again.");
          trackEvent("recaptcha_failed", { form: "auth" });
          setLoading(false);
          return;
        }
      }
    } catch {
      // Best-effort — never block the user if reCAPTCHA errors.
    }

    const scores = getCurrentScores();
    const total = computeTotal(scores);
    const cat = categorize(total);
    const normalizedContact = normalizeUaePhone(contact.trim());

    // Double-check right before creating in case the number registered moments ago.
    // Existence check only — must NOT log the user in as a side effect.
    const doubleCheckUser =
      (await findUserByContactRemote(normalizedContact, { sync: false })) ??
      findUserByContact(normalizedContact);
    if (doubleCheckUser) {
      setAlreadyRegisteredInSignup(true);
      setErr("This number is already registered. Please login to view your score.");
      setLoading(false);
      return;
    }

    const payload = {
      ...getPersistedUtmParams(),
      userId: generateUserId(),
      contact: normalizedContact,
      name: name.trim(),
      email: undefined,
      address: undefined,
      participantType: participantType || undefined,
      scores,
      total,
      category: cat.label,
      consent: true,
      createdAt: new Date().toISOString(),
      referredBy: referredBy.trim() ? `RVT-${referredBy.trim().toUpperCase()}` : undefined,
      referCount: 0,
    };
    try {
      await saveUserRemote(payload);
      void setMetaAdvancedMatching(payload.contact, payload.email);
      void setTiktokAdvancedMatching(payload.contact, payload.email);
      void trackConversion(
        "score_saved",
        { source: "auth_page", is_new_user: true },
        { phone: payload.contact, email: payload.email },
      );
      await goToProfile();
    } catch (e) {
      console.warn("Save encountered an issue", e);
      trackEvent("save_failed", { form: "auth" });
      // Keep local login state as a last resort so the user can still reach their profile.
      saveUser(payload);
      await goToProfile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-md mx-auto px-4 py-8">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-black">
            {mode === "login" ? (
              <>Welcome <span className="text-gradient-energy">Back</span></>
            ) : (
              <>Sign Up &amp; <span className="text-gradient-energy">Join</span></>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "login"
              ? "Enter your registered mobile number to log in"
              : "Register to save your scores and win prizes"}
          </p>
        </motion.div>

        <div className="mt-6 flex bg-muted/40 p-1 rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              mode === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              mode === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="mt-6 bg-gradient-card border border-border rounded-3xl p-6 shadow-card">
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    UAE Mobile Number
                  </label>
                  <div className="mt-2 flex items-center rounded-2xl border border-border bg-background/60 px-3 focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-sm font-semibold text-muted-foreground">+971</span>
                    <input
                      autoFocus
                      value={contact}
                      onChange={(e) => setContact(e.target.value.replace(/[^\d]/g, "").slice(0, 9))}
                      onFocus={handleFormStart}
                      inputMode="numeric"
                      placeholder="50 123 4567"
                      className="w-full border-0 bg-transparent px-2 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Enter a UAE mobile number (e.g. +971501234567).
                  </p>
                </div>
                {notRegistered && (
                  <p className="text-sm text-muted-foreground">
                    Not registered yet?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="underline text-foreground font-semibold"
                    >
                      Sign up
                    </button>
                  </p>
                )}
                {err && <p className="text-sm text-destructive">{err}</p>}
                <button
                  disabled={loading || !canSubmit}
                  className="w-full py-3 rounded-full bg-gradient-energy text-energy-foreground font-bold shadow-button hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Login"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSignupSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^A-Za-z\s'.-]/g, ""))}
                    onFocus={handleFormStart}
                    onBlur={() => name.trim() && trackEvent("form_field_completed", { form: "auth", field: "name" })}
                    placeholder="Your name"
                    className={`mt-2 w-full bg-background/60 border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                      nameFlagged ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"
                    }`}
                  />
                  {nameFlagged && (
                    <p className="mt-1.5 text-[11px] text-destructive">
                      Please enter an appropriate name.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    UAE Mobile Number
                  </label>
                  <div className="mt-2 flex items-center rounded-2xl border border-border bg-background/60 px-3 focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-sm font-semibold text-muted-foreground">+971</span>
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value.replace(/[^\d]/g, "").slice(0, 9))}
                      onFocus={handleFormStart}
                      onBlur={() =>
                        isValidUaePhone(contact) &&
                        trackEvent("form_field_completed", { form: "auth", field: "phone" })
                      }
                      inputMode="numeric"
                      placeholder="50 123 4567"
                      className="w-full border-0 bg-transparent px-2 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Enter a UAE mobile number (e.g. +971501234567).
                  </p>
                  {alreadyRegisteredInSignup && (
                    <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                      This number is already registered.{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="underline font-semibold"
                      >
                        Go to Login
                      </button>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    You are a
                  </label>
                  <select
                    value={participantType}
                    onChange={(e) => {
                      setParticipantType(e.target.value as ParticipantType);
                      trackEvent("form_field_completed", {
                        form: "auth",
                        field: "participant_type",
                        value: e.target.value,
                      });
                    }}
                    className="mt-2 w-full bg-background/60 border border-border rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    {PARTICIPANT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Referred by{" "}
                    <span className="text-muted-foreground/60 normal-case font-normal">
                      (optional)
                    </span>
                  </label>
                  <div className="mt-2 flex items-center rounded-2xl border border-border bg-background/60 px-3 focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-sm font-semibold text-muted-foreground">RVT-</span>
                    <input
                      value={referredBy}
                      onChange={(e) =>
                        setReferredBy(
                          e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
                        )
                      }
                      placeholder="A1B2C3D4E5"
                      className="w-full border-0 bg-transparent px-2 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Enter your friend's User ID who referred you — they'll get more chances to win! 🏆
                  </p>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) trackEvent("consent_checked", { form: "auth" });
                    }}
                    className="mt-1 accent-[oklch(0.72_0.19_50)]"
                  />
                  <span className="text-xs text-muted-foreground">
                    I agree to be contacted via phone about Revital campaigns, and accept the{" "}
                    <Link to="/rules" target="_blank" className="underline hover:text-foreground">
                      Rules
                    </Link>
                    ,{" "}
                    <Link to="/terms" target="_blank" className="underline hover:text-foreground">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" target="_blank" className="underline hover:text-foreground">
                      Privacy Policy
                    </Link>{" "}
                    (UAE compliant).
                  </span>
                </label>
                {err && <p className="text-sm text-destructive">{err}</p>}
                <button
                  disabled={loading || !canSubmit}
                  className="w-full py-3 rounded-full bg-gradient-energy text-energy-foreground font-bold shadow-button hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Sign Up"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => {
            trackEvent("cta_click", { cta_label: "back", form: "auth" });
            window.history.back();
          }}
          className="mt-4 block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </main>
    </div>
  );
}

const normalizeUaePhone = (value: string): string => {
  const raw = value.replace(/[^\d+]/g, "");
  if (raw.startsWith("+971")) return `+971${raw.slice(4).replace(/\D/g, "")}`;
  if (raw.startsWith("00971")) return `+971${raw.slice(5).replace(/\D/g, "")}`;
  if (raw.startsWith("971")) return `+971${raw.slice(3).replace(/\D/g, "")}`;
  if (raw.startsWith("0")) return `+971${raw.slice(1).replace(/\D/g, "")}`;
  if (raw.startsWith("5")) return `+971${raw.replace(/\D/g, "")}`;
  return `+971${raw.replace(/\D/g, "")}`;
};
const isValidUaePhone = (value: string): boolean => {
  const normalized = normalizeUaePhone(value);
  return /^(?:\+971|00971|0)?5\d{8}$/.test(normalized);
};
// The form placeholder/example shows "+971501234567" — block real submissions
// with that exact dummy number so no score ever gets saved to it.
const DUMMY_EXAMPLE_PHONE = "+971501234567";
const isDummyExamplePhone = (value: string): boolean =>
  normalizeUaePhone(value) === DUMMY_EXAMPLE_PHONE;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]*$/;
// referredBy state holds just the 10-char suffix — the "RVT-" prefix is fixed in the UI.
const REFERRAL_SUFFIX_REGEX = /^[A-Z0-9]{10}$/;
const stripReferralPrefix = (value: string): string =>
  value.trim().toUpperCase().replace(/^RVT-/, "");
