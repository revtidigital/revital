import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { GenericAvatar } from "@/components/GenericAvatar";
import {
  dedupeAttempts,
  findUserByContactRemote,
  getReferralInfoRemote,
  getUser,
  saveUser,
  saveUserRemote,
  resetScores,
  type UserRecord,
} from "@/lib/storage";
import { containsProfanity } from "@/lib/profanity";
import { trackEvent } from "@/lib/analytics";

/** Center-crop + downscale an uploaded image to a small square JPEG data URL before it's sent to the server. */
function resizeImageToSquareJpeg(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };
    img.src = objectUrl;
  });
}

export const Route = createFileRoute("/profile")({
  component: Profile,
});

const SCORE_TIERS = [
  { tier: "S", label: "Peak Performer", threshold: "1,200 – 1,500 Points" },
  { tier: "A", label: "High Energy", threshold: "900 – 1,199 Points" },
  { tier: "B", label: "Charged Up", threshold: "600 – 899 Points" },
  { tier: "C", label: "Warming Up", threshold: "300 – 599 Points" },
  { tier: "D", label: "Recharge Needed", threshold: "0 – 299 Points" },
] as const;

function formatAttemptTime(playedAt: string): string {
  const playedDate = new Date(playedAt);
  if (Number.isNaN(playedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dubai",
  }).format(playedDate);
}

function Profile() {
  const nav = useNavigate();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [referrerName, setReferrerName] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [globalScore, setGlobalScore] = useState<number | null>(null);
  const [nameFlagged, setNameFlagged] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed) {
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
    const u = getUser();
    if (!u) {
      nav({ to: "/auth" });
      return;
    }
    setUser(u);
    setName(u.name || "");
    setEmail(u.email || "");
    setAddress(u.address || "");

    const loadReferralData = async () => {
      try {
        const latestUser = await findUserByContactRemote(u.contact);
        const currentUser = latestUser ?? u;
        setUser(currentUser);
        setName(currentUser.name || "");
        setEmail(currentUser.email || "");
        setAddress(currentUser.address || "");

        const { referrerName: fetchedReferrerName, referralCount: fetchedReferralCount } =
          await getReferralInfoRemote(currentUser.userId);
        setReferrerName(fetchedReferrerName);
        setReferralCount(fetchedReferralCount);
      } catch {
        setReferrerName("");
        setReferralCount(0);
      }
    };
    loadReferralData();

    const loadGlobalRank = async () => {
      try {
        const { getUserRankFn } = await import("@/server/adminFns");
        const result = await getUserRankFn({ data: { userId: u.userId } });
        setGlobalRank(result.rank);
        setGlobalScore(result.score);
      } catch {
        setGlobalRank(null);
        setGlobalScore(null);
      }
    };
    loadGlobalRank();
  }, [nav]);

  const safeUser = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      scores: {
        reflex: user.scores?.reflex ?? null,
        memory: user.scores?.memory ?? null,
        balance: user.scores?.balance ?? null,
      },
    };
  }, [user]);

  const attempts = useMemo(() => {
    if (!safeUser) return [];
    const historic = dedupeAttempts([...(safeUser.playAttempts ?? [])]);
    if (historic.length > 0) {
      return [...historic].sort((a, b) => b.playedAt.localeCompare(a.playedAt));
    }
    return [];
  }, [safeUser]);

  if (!safeUser) return null;

  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${encodeURIComponent(safeUser.userId)}`
      : `/?ref=${encodeURIComponent(safeUser.userId)}`;
  const hasSavedEmail = Boolean(safeUser.email?.trim());
  const hasCompletedRun =
    safeUser.scores.reflex !== null &&
    safeUser.scores.memory !== null &&
    safeUser.scores.balance !== null;
  const hasPlayedBefore = Boolean((safeUser.playAttempts?.length ?? 0) > 0 || hasCompletedRun);
  const finalPercentDisplay = hasPlayedBefore ? `${safeUser.total}` : "—";
  const tierDisplay = hasPlayedBefore ? safeUser.category : "Not started";
  const eligibleDisplay = hasPlayedBefore ? "✓" : "Not yet";
  const currentScoreTier = hasPlayedBefore
    ? SCORE_TIERS.find((tier) => tier.label === safeUser.category)?.tier
    : null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim() && (await containsProfanity(name.trim()))) {
      setNameFlagged(true);
      setError("Please enter an appropriate name.");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!hasSavedEmail && normalizedEmail && !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    const emailToPersist = hasSavedEmail ? safeUser.email : normalizedEmail || undefined;
    const updated = {
      ...safeUser,
      name: name.trim(),
      email: emailToPersist,
      address: address.trim(),
    };
    try {
      await saveUserRemote(updated);
      const latest = await findUserByContactRemote(updated.contact);
      setUser(latest ?? updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Could not save profile right now. Please try again.");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    setAvatarError("");
    setAvatarUploading(true);
    try {
      const dataUrl = await resizeImageToSquareJpeg(file, 320);
      const { saveAvatarFn } = await import("@/server/userFns");
      await saveAvatarFn({ data: { userId: safeUser.userId, avatarUrl: dataUrl } });
      const updated = { ...safeUser, avatarUrl: dataUrl };
      saveUser(updated);
      setUser(updated);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setAvatarError(
        `Could not upload photo right now. (${err instanceof Error ? err.message : String(err)})`,
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const copyToClipboard = async (value: string): Promise<boolean> => {
    const fallbackCopy = () => {
      const helper = document.createElement("textarea");
      helper.value = value;
      helper.setAttribute("readonly", "true");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      helper.style.pointerEvents = "none";
      document.body.appendChild(helper);
      helper.focus();
      helper.select();
      const copiedWithFallback = document.execCommand("copy");
      document.body.removeChild(helper);
      return copiedWithFallback;
    };

    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    return fallbackCopy();
  };

  const copyReferralUrl = async () => {
    trackEvent("cta_click", { cta_label: "copy_referral_url" });
    try {
      const success = await copyToClipboard(referralUrl);
      if (!success) throw new Error("Copy failed");
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  const copyUserId = async () => {
    trackEvent("cta_click", { cta_label: "copy_user_id" });
    try {
      const success = await copyToClipboard(safeUser.userId);
      if (!success) throw new Error("Copy failed");
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 1500);
    } catch {
      setCopiedUserId(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8">
        <div className="sticky top-20 z-30 mb-4 rounded-2xl border border-border bg-background/85 p-2 shadow-sm backdrop-blur">
          <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
            <a
              href="#your-score-section"
              className="rounded-xl px-3 py-2 text-center font-semibold text-garnet hover:bg-[var(--marigold)]/30 transition-colors"
            >
              Your Score
            </a>
            <a
              href="#profile-section"
              className="rounded-xl px-3 py-2 text-center font-semibold text-garnet hover:bg-[var(--marigold)]/30 transition-colors"
            >
              Profile
            </a>
            <a
              href="#datewise-section"
              className="rounded-xl px-3 py-2 text-center font-semibold text-garnet hover:bg-[var(--marigold)]/30 transition-colors"
            >
              Date-wise Score
            </a>
          </div>
        </div>
        <motion.div
          id="your-score-section"
          className="scroll-mt-28"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-card border border-border rounded-3xl p-6 shadow-card text-center">
            <div className="text-5xl">{hasPlayedBefore ? "🏆" : "⚡"}</div>
            <h1 className="mt-3 text-2xl md:text-3xl font-black">
              {hasPlayedBefore ? "You're In!" : "You are yet to play"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {hasPlayedBefore
                ? "Your score is saved. You're now in the prize draw."
                : "Play your first challenge to unlock your score band and start climbing the leaderboard."}
            </p>

            {!hasPlayedBefore && (
              <div className="mt-4">
                <Link
                  to="/play/reflex"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-energy text-white font-bold shadow-button hover:scale-105 active:scale-95 transition-transform"
                >
                  Play Now →
                </Link>
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="Best Score" value={finalPercentDisplay} />
              <Stat label="Tier" value={tierDisplay} />
              <Stat label="Eligible" value={eligibleDisplay} />
            </div>

            {hasPlayedBefore && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="Global Rank" value={globalRank !== null ? `#${globalRank}` : "—"} />
                <Stat label="Global Score" value={globalScore !== null ? `${globalScore}` : "—"} />
              </div>
            )}

            <div className="mt-4 bg-background/40 rounded-2xl p-4 text-left">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Score Bands
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your current tier is highlighted after you complete all games.
                  </p>
                </div>
                <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-bold text-muted-foreground">
                  {hasPlayedBefore ? "Current" : "Locked"}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {SCORE_TIERS.map((scoreTier) => {
                  const isCurrent = currentScoreTier === scoreTier.tier;

                  return (
                    <div
                      key={scoreTier.tier}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors ${
                        isCurrent
                          ? "border-accent bg-accent/15 shadow-[0_6px_18px_rgba(243,116,33,0.16)]"
                          : "border-border/60 bg-background/35"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                          isCurrent
                            ? "bg-gradient-energy text-energy-foreground"
                            : "bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {scoreTier.tier}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">
                          {scoreTier.tier} / {scoreTier.label}: {scoreTier.threshold}
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="rounded-full bg-accent/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                          You
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {!hasPlayedBefore && (
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  Locked — play all three challenges to reveal where you currently stand.
                </p>
              )}
            </div>

            <div className="mt-4 bg-background/40 rounded-2xl p-4 text-left space-y-2">
              <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground shrink-0">
                  User ID
                </span>
                <button
                  type="button"
                  onClick={copyUserId}
                  className="w-full text-left sm:text-right text-sm font-semibold font-mono break-all hover:text-primary transition-colors"
                  title="Copy User ID"
                >
                  {copiedUserId ? "Copied!" : safeUser.userId}
                </button>
              </div>
              <Row label="Mobile" value={safeUser.contact} />
              {safeUser.email && <Row label="Email" value={safeUser.email} />}
              {safeUser.name && <Row label="Name" value={safeUser.name} />}
              {safeUser.referredBy && (
                <Row label="Referred By ID" value={safeUser.referredBy} mono />
              )}
              {safeUser.referredBy && <Row label="Referrer Name" value={referrerName || "—"} />}
            </div>

            <div className="mt-4 bg-background/40 rounded-2xl p-4 text-left">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Your Referral URL
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                For each referral you will get 100 points.
              </p>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <input
                  readOnly
                  value={referralUrl}
                  className="flex-1 min-w-0 bg-background/60 border border-border rounded-xl px-3 py-2 text-[11px] font-mono break-all"
                />
                <button
                  type="button"
                  onClick={copyReferralUrl}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted/40 transition-colors"
                >
                  {copied ? "Copied!" : copyError ? "Copy failed" : "Copy URL"}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Total successful referrals: <span className="font-bold">{referralCount}</span>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.form
          id="profile-section"
          className="mt-6 bg-gradient-card border border-border rounded-3xl p-6 shadow-card space-y-4 scroll-mt-28"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={save}
        >
          <h2 className="font-black text-lg">
            Complete your profile{" "}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </h2>

          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden border-2 border-[var(--garnet)]/15 bg-background/40">
              {safeUser.avatarUrl ? (
                <img
                  src={safeUser.avatarUrl}
                  alt={`${safeUser.name || "Your"} profile picture`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <GenericAvatar className="h-full w-full" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/60 text-sm font-bold cursor-pointer hover:bg-[var(--marigold)]/20 transition-colors">
                {avatarUploading ? "Uploading…" : safeUser.avatarUrl ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={avatarUploading}
                  onChange={handleAvatarChange}
                />
              </label>
              {avatarError && <p className="mt-1.5 text-[11px] text-destructive">{avatarError}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-2 w-full bg-background/60 border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 ${
                nameFlagged
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-ring"
              }`}
            />
            {nameFlagged && (
              <p className="mt-1.5 text-[11px] text-destructive">
                Please enter an appropriate name.
              </p>
            )}
          </div>
          {!hasSavedEmail && (
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Gmail / Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="mt-2 w-full bg-background/60 border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Address (for prize delivery)
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="mt-2 w-full bg-background/60 border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            disabled={nameFlagged || checkingName}
            className="w-full py-3 rounded-full bg-gradient-energy text-energy-foreground font-bold shadow-button hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {saved ? "✓ Saved!" : "Save Profile"}
          </button>
        </motion.form>

        <motion.div
          id="datewise-section"
          className="mt-6 bg-gradient-card border border-border rounded-3xl p-6 shadow-card scroll-mt-28"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-black text-lg">Date-wise Score History</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Your saved attempts grouped by play date and final score.
          </p>
          <div className="mt-4 max-h-80 overflow-auto rounded-2xl border border-border/50">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="sticky top-0 bg-card/95 text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border backdrop-blur">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Time (UAE)</th>
                  <th className="py-2 pr-3">Final Score</th>
                  <th className="py-2 pr-3">Category</th>
                </tr>
              </thead>
              <tbody>
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-xs text-muted-foreground">
                      No attempts yet. Play all three games to see your score history.
                    </td>
                  </tr>
                ) : (
                  attempts.map((attempt, idx) => (
                    <tr key={`${attempt.playedAt}-${idx}`} className="border-b border-border/40">
                      <td className="py-2 pr-3">{attempt.date}</td>
                      <td className="py-2 pr-3 text-muted-foreground text-xs">
                        {formatAttemptTime(attempt.playedAt)}
                      </td>
                      <td className="py-2 pr-3 font-bold text-gradient-energy">{attempt.total}</td>
                      <td className="py-2 pr-3">{attempt.category}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              trackEvent("cta_click", {
                cta_label: hasPlayedBefore ? "play_again" : "play",
                source: "profile",
              });
              resetScores();
              nav({ to: "/challenges" });
            }}
            className="flex-1 text-center py-3 rounded-full bg-card border border-border font-semibold hover:bg-muted/50 transition-colors"
          >
            {hasPlayedBefore ? "Play Again" : "Play"}
          </button>
          <Link
            to="/"
            onClick={() => trackEvent("nav_click", { nav_label: "home", source: "profile" })}
            className="flex-1 text-center py-3 rounded-full bg-card border border-border font-semibold hover:bg-muted/50 transition-colors"
          >
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/40 rounded-2xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-black text-gradient-energy">{value}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground shrink-0">
        {label}
      </span>
      <span
        className={`w-full text-sm font-semibold sm:text-right ${mono ? "font-mono break-all" : "break-words"}`}
      >
        {value}
      </span>
    </div>
  );
}
