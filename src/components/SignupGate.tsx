import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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
import { executeRecaptcha } from "@/lib/recaptcha";
import { containsProfanity } from "@/lib/profanity";

interface SignupGateProps {
  onSuccess: () => void;
  mode?: "login" | "signup";
  onModeChange?: (mode: "login" | "signup") => void;
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

export function SignupGate({ onSuccess, mode = "signup", onModeChange }: SignupGateProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [participantType, setParticipantType] = useState<ParticipantType | "">("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameFlagged, setNameFlagged] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [loginContact, setLoginContact] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [notRegistered, setNotRegistered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [canScrollMore, setCanScrollMore] = useState(false);
  const switchMode = (targetMode: "login" | "signup") => {
    setLoginErr("");
    setNotRegistered(false);
    onModeChange?.(targetMode);
  };
  const existingUser = useMemo(
    () => (contact.trim() ? findUserByContact(normalizeUaePhone(contact.trim())) : null),
    [contact],
  );
  const [existingRemoteUser, setExistingRemoteUser] =
    useState<Awaited<ReturnType<typeof findUserByContactRemote>>>(null);
  const isNewUser = !existingUser && !existingRemoteUser;
  const canSubmit =
    isValidUaePhone(contact) &&
    (isNewUser
      ? !!name.trim() &&
        NAME_REGEX.test(name.trim()) &&
        !nameFlagged &&
        !checkingName &&
        !!participantType &&
        consent
      : true) &&
    (!referredBy.trim() || REFERRAL_SUFFIX_REGEX.test(referredBy.trim()));

  // Returning users already accepted the T&C on a prior signup — don't ask again.
  useEffect(() => {
    if (existingUser || existingRemoteUser) setConsent(true);
  }, [existingUser, existingRemoteUser]);

  useEffect(() => {
    trackEvent("form_view", { form: "signup_gate", page_url: window.location.href });
  }, []);

  const prevExisting = useRef(false);
  useEffect(() => {
    const found = !!(existingUser || existingRemoteUser);
    if (found && !prevExisting.current) {
      trackEvent("existing_user_detected", { form: "signup_gate" });
    }
    prevExisting.current = found;
  }, [existingUser, existingRemoteUser]);

  const formStarted = useRef(false);
  const handleFormStart = () => {
    if (formStarted.current) return;
    formStarted.current = true;
    trackEvent("form_start", { form: "signup_gate" });
  };

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
    if (typeof window === "undefined") return;

    const refFromUrl = new URLSearchParams(window.location.search).get("ref")?.trim();
    const persistedRef = window.localStorage.getItem("revital_referral_code")?.trim();
    const referralCode = (refFromUrl || persistedRef || "").toUpperCase();
    if (referralCode) {
      setReferredBy(stripReferralPrefix(referralCode));
      window.localStorage.setItem(
        "revital_referral_code",
        referralCode.startsWith("RVT-") ? referralCode : `RVT-${referralCode}`,
      );
      trackEvent("referral_prefilled", { form: "signup_gate", referral_code: referralCode });
    }
  }, []);

  useEffect(() => {
    const normalizedContact = normalizeUaePhone(contact);
    const isCandidate = /^\+9715\d{8}$/.test(normalizedContact);
    if (!isCandidate) {
      setExistingRemoteUser(null);
      return;
    }
    const timer = window.setTimeout(async () => {
      // Existence check only — must NOT log the user in as a side effect of typing.
      const user = await findUserByContactRemote(normalizedContact, { sync: false });
      setExistingRemoteUser(user);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [contact]);

  // Number already registered while on Sign Up — switch to the Login tab so the right form
  // shows. This only swaps which tab/form is displayed; it does NOT log the user in — that
  // still requires an explicit click of the Login button. A manual switch back to Sign Up
  // (via the tab) for the same number won't be auto-bounced again.
  const autoSwitchedContact = useRef<string | null>(null);
  const lastContact = useRef(contact);
  useEffect(() => {
    // The number itself changed (not just a mode toggle) — this is a fresh entry, so
    // forget any prior auto-switch decision for whatever number used to be here.
    if (lastContact.current !== contact) {
      autoSwitchedContact.current = null;
      lastContact.current = contact;
    }
    if (mode !== "signup") return;
    if (!isValidUaePhone(contact)) return;
    if (!(existingUser || existingRemoteUser)) return;
    if (autoSwitchedContact.current === contact) return;
    autoSwitchedContact.current = contact;
    trackEvent("existing_user_auto_switched_to_login", { form: "signup_gate" });
    setLoginContact(contact);
    switchMode("login");
  }, [mode, existingUser, existingRemoteUser, contact]);

  const completeSignup = async (contactValue: string, displayName: string, referrer?: string) => {
    const scores = getCurrentScores();
    const total = computeTotal(scores);
    const cat = categorize(total);
    const existing = findUserByContact(contactValue.trim());
    const normalizedReferrer = existing?.referredBy || referrer?.trim().toUpperCase();
    try {
      const payload = {
        ...getPersistedUtmParams(),
        userId: existing?.userId ?? generateUserId(),
        contact: contactValue.trim(),
        name: displayName.trim() || existing?.name,
        address: existing?.address,
        participantType: existing?.participantType ?? (participantType || undefined),
        scores,
        total,
        category: cat.label,
        consent: true,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        referredBy: normalizedReferrer,
        referCount: existing?.referCount ?? 0,
      };
      // Persist local auth state immediately so Header updates to the account icon right away.
      saveUser(payload);
      await saveUserRemote(payload);
      void setMetaAdvancedMatching(payload.contact, existing?.email);
      void setTiktokAdvancedMatching(payload.contact, existing?.email);
      void trackConversion(
        "signup_complete",
        { is_new_user: !existing, total: payload.total, category: payload.category },
        { phone: payload.contact, email: existing?.email },
      );
      onSuccess();
    } catch {
      setErr("Failed to save your score. Please try again.");
      trackEvent("save_failed", { form: "signup_gate" });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    trackEvent("form_submit_attempt", { form: "signup_gate" });
    if (!isValidUaePhone(contact)) {
      trackEvent("form_validation_error", { form: "signup_gate", reason: "invalid_phone" });
      return setErr("Enter a valid UAE mobile number");
    }
    if (isDummyExamplePhone(contact)) {
      trackEvent("form_validation_error", { form: "signup_gate", reason: "dummy_example_phone" });
      return setErr("This number is just an example — please enter your own mobile number.");
    }
    // Number already belongs to a member — send them to Login instead of re-enrolling.
    // Re-check directly here (existence only, no login side effect) instead of trusting only
    // the debounced background lookup, which may not have resolved yet by submit time.
    const normalizedContact = normalizeUaePhone(contact);
    const knownUser =
      existingUser ||
      existingRemoteUser ||
      (await findUserByContactRemote(normalizedContact, { sync: false }));
    if (knownUser) {
      setLoginContact(contact);
      switchMode("login");
      trackEvent("existing_user_redirected_to_login", { form: "signup_gate" });
      return;
    }
    if (!name.trim() || !NAME_REGEX.test(name.trim())) {
      trackEvent("form_validation_error", { form: "signup_gate", reason: "invalid_name" });
      return setErr("Please enter your full name (letters only)");
    }
    if (await containsProfanity(name.trim())) {
      setNameFlagged(true);
      trackEvent("form_validation_error", { form: "signup_gate", reason: "name_flagged" });
      return setErr("Please enter an appropriate name.");
    }
    if (isNewUser && !participantType) {
      trackEvent("form_validation_error", {
        form: "signup_gate",
        reason: "missing_participant_type",
      });
      return setErr("Please select who you are");
    }
    if (referredBy.trim() && !REFERRAL_SUFFIX_REGEX.test(referredBy.trim())) {
      trackEvent("form_validation_error", { form: "signup_gate", reason: "invalid_referral_code" });
      return setErr("Enter a valid referral code (e.g. A1B2C3D4E5)");
    }
    if (isNewUser && !consent) {
      trackEvent("form_validation_error", { form: "signup_gate", reason: "consent_not_accepted" });
      return setErr("Please accept the consent to continue");
    }
    setLoading(true);
    try {
      const token = await executeRecaptcha("save_score");
      if (token) {
        const { verifyCaptchaFn } = await import("@/server/userFns");
        const result = await verifyCaptchaFn({ data: { token } });
        if (!result.ok) {
          setErr("Security check failed. Please refresh and try again.");
          trackEvent("recaptcha_failed", { form: "signup_gate" });
          setLoading(false);
          return;
        }
      }
    } catch {
      // Best-effort — never block the user if reCAPTCHA errors.
    }
    trackEvent("signup_started", { source: "result_gate" });
    await completeSignup(
      normalizeUaePhone(contact),
      name,
      referredBy.trim() ? `RVT-${referredBy.trim()}` : undefined,
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    setNotRegistered(false);
    trackEvent("form_submit_attempt", { form: "signup_gate_login" });

    if (!isValidUaePhone(loginContact)) {
      trackEvent("form_validation_error", { form: "signup_gate_login", reason: "invalid_phone" });
      setLoginErr("Please enter a valid UAE mobile number (e.g. +971501234567)");
      return;
    }
    if (isDummyExamplePhone(loginContact)) {
      trackEvent("form_validation_error", {
        form: "signup_gate_login",
        reason: "dummy_example_phone",
      });
      setLoginErr("This number is just an example — please enter your own mobile number.");
      return;
    }

    setLoginLoading(true);
    try {
      const normalizedContact = normalizeUaePhone(loginContact.trim());
      const user =
        (await findUserByContactRemote(normalizedContact)) ?? findUserByContact(normalizedContact);

      if (!user) {
        setNotRegistered(true);
        setLoginErr("You are not registered with this number. Please sign up first.");
        trackEvent("login_failed_not_registered", { form: "signup_gate_login" });
        setLoginLoading(false);
        return;
      }

      saveUser(user);
      trackEvent("login_success", { form: "signup_gate_login" });
      onSuccess();
    } catch (e) {
      console.warn("Login failed", e);
      setLoginErr("Could not log in right now. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const checkScroll = () => {
      setCanScrollMore(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
    };
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      observer.disconnect();
    };
  }, [mode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md px-4 overflow-y-auto py-8 overscroll-contain"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-md"
      >
        <div
          ref={cardRef}
          className="bg-gradient-card border border-border rounded-3xl p-6 shadow-card max-h-[85vh] overflow-y-auto scrollbar-hide"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <h2 className="text-2xl md:text-3xl font-black text-gradient-energy">
              Unlock Your Score
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your details to reveal your Energy Score and qualify for the global prize.
            </p>
          </div>

          <div className="mt-4 flex bg-muted/40 p-1 rounded-2xl border border-border">
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
          </div>

          {mode === "login" ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleLoginSubmit}
              className="mt-5 space-y-3"
            >
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  UAE Mobile Number
                </label>
                <div className="mt-1.5 flex items-center rounded-2xl border border-border bg-background/60 px-3 focus-within:ring-2 focus-within:ring-ring">
                  <span className="text-sm font-semibold text-muted-foreground">+971</span>
                  <input
                    autoFocus
                    value={loginContact}
                    onChange={(e) =>
                      setLoginContact(e.target.value.replace(/[^\d]/g, "").slice(0, 9))
                    }
                    onFocus={handleFormStart}
                    inputMode="numeric"
                    placeholder="50 123 4567"
                    className="w-full border-0 bg-transparent px-2 py-3 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Enter your registered UAE mobile number (e.g. +971501234567).
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
              {loginErr && <p className="text-sm text-destructive">{loginErr}</p>}
              <button
                disabled={loginLoading || !isValidUaePhone(loginContact)}
                className="w-full py-3 rounded-full bg-gradient-energy text-energy-foreground font-bold shadow-button hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {loginLoading ? "Loading..." : "Login"}
              </button>
            </motion.form>
          ) : (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="mt-5 space-y-3"
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
                  onBlur={() =>
                    name.trim() &&
                    trackEvent("form_field_completed", { form: "signup_gate", field: "name" })
                  }
                  placeholder="Your name"
                  className={`mt-1.5 w-full bg-background/60 border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 ${
                    nameFlagged
                      ? "border-destructive focus:ring-destructive"
                      : "border-border focus:ring-ring"
                  }`}
                />
                {nameFlagged && (
                  <p className="mt-1 text-[11px] text-destructive">
                    Please enter an appropriate name.
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  UAE Mobile Number
                </label>
                <div className="mt-1.5 flex items-center rounded-2xl border border-border bg-background/60 px-3 focus-within:ring-2 focus-within:ring-ring">
                  <span className="text-sm font-semibold text-muted-foreground">+971</span>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value.replace(/[^\d]/g, "").slice(0, 9))}
                    onFocus={handleFormStart}
                    onBlur={() =>
                      isValidUaePhone(contact) &&
                      trackEvent("form_field_completed", { form: "signup_gate", field: "phone" })
                    }
                    inputMode="numeric"
                    placeholder="50 123 4567"
                    className="w-full border-0 bg-transparent px-2 py-3 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Enter a UAE mobile number (e.g. +971501234567). We'll send a one-time code.
                </p>
                {(existingUser || existingRemoteUser) && (
                  <p className="mt-1 text-[11px] text-accent">
                    Existing account detected. Referral code is locked for returning users.
                  </p>
                )}
              </div>
              {isNewUser && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    You are a
                  </label>
                  <select
                    value={participantType}
                    onChange={(e) => {
                      setParticipantType(e.target.value as ParticipantType);
                      trackEvent("form_field_completed", {
                        form: "signup_gate",
                        field: "participant_type",
                        value: e.target.value,
                      });
                    }}
                    className="mt-1.5 w-full bg-background/60 border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
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
              )}
              {isNewUser && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Referred by{" "}
                    <span className="text-muted-foreground/60 normal-case font-normal">
                      (optional)
                    </span>
                  </label>
                  <div className="mt-1.5 flex items-center rounded-2xl border border-border bg-background/60 px-3 focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-sm font-semibold text-muted-foreground">RVT-</span>
                    <input
                      value={referredBy}
                      onChange={(e) =>
                        setReferredBy(
                          e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 10),
                        )
                      }
                      placeholder="A1B2C3D4E5"
                      className="w-full border-0 bg-transparent px-2 py-3 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Enter your friend's User ID who referred you — they'll get more chances to win!
                    🏆
                  </p>
                </div>
              )}
              {isNewUser && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) trackEvent("consent_checked", { form: "signup_gate" });
                    }}
                    className="mt-1 accent-[oklch(0.72_0.19_50)]"
                  />
                  <span className="text-xs text-muted-foreground">
                    I agree to be contacted by Revital about campaigns & rewards by phone, and
                    accept the{" "}
                    <a
                      href="/rules"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Rules
                    </a>
                    ,{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>{" "}
                    (UAE compliant).
                  </span>
                </label>
              )}
              {err && <p className="text-sm text-destructive">{err}</p>}
              <button
                disabled={loading || !canSubmit}
                className="w-full py-3 rounded-full bg-gradient-energy text-energy-foreground font-bold shadow-button hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save & Reveal Score →"}
              </button>
            </motion.form>
          )}
        </div>
        {canScrollMore && (
          <motion.button
            type="button"
            aria-label="Scroll down"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 6, 0] }}
            transition={{ y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
            onClick={() =>
              cardRef.current?.scrollBy({
                top: cardRef.current.clientHeight * 0.7,
                behavior: "smooth",
              })
            }
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-energy shadow-button cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-energy-foreground"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
