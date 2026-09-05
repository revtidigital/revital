import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db";
import {
  categorize,
  computeTotal,
  dedupeAttempts,
  type PlayAttempt,
  type UserRecord,
} from "@/lib/storage";
import { checkRateLimit, getClientIp, requireAdminToken } from "./security";
import { formatUaeDate } from "@/lib/uaeDate";

const MAX_GAME_SCORE = 1500;
const MAX_PLAY_ATTEMPTS_STORED = 500;

const gameScoresSchema = z.object({
  reflex: z.number().nullable(),
  memory: z.number().nullable(),
  balance: z.number().nullable(),
});

/** Clamp a client-submitted score to the range the game client can actually produce. */
function clampScores(s: z.infer<typeof gameScoresSchema>): z.infer<typeof gameScoresSchema> {
  const clamp = (v: number | null) =>
    v === null ? null : Math.max(0, Math.min(MAX_GAME_SCORE, Math.round(v)));
  return { reflex: clamp(s.reflex), memory: clamp(s.memory), balance: clamp(s.balance) };
}

const userRecordSchema = z.object({
  userId: z.string(),
  contact: z.string().min(1),
  email: z.string().nullish(),
  name: z.string().nullish(),
  address: z.string().nullish(),
  participantType: z.enum(["Participant", "Doctor", "Pharmacist"]).nullish(),
  scores: gameScoresSchema,
  total: z.number(),
  category: z.string(),
  consent: z.boolean(),
  createdAt: z.string(),
  consentAcceptedAt: z.string().nullish(),
  playDates: z.array(z.string()).optional(),
  playAttempts: z
    .array(
      z.object({
        playedAt: z.string(),
        date: z.string(),
        scores: gameScoresSchema,
        total: z.number(),
        category: z.string(),
      }),
    )
    .optional(),
  referredBy: z.string().nullish(),
  referCount: z.number().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  winnerLockDates: z.array(z.string()).optional(),
});

const contactSchema = z.object({ contact: z.string().min(1) });
const userIdSchema = z.object({ userId: z.string().min(1) });

// The signup form's placeholder/example shows "+971501234567" — reject it server-side
// too (defense in depth beyond the client-side check) so no score can ever be saved
// against this dummy number, even via a direct API call.
const DUMMY_EXAMPLE_PHONE = "+971501234567";

// ── save / upsert ──────────────────────────────────────────────────────────────
// Scores/total are never trusted from the client: every score is clamped to the
// range the game UI can actually produce, and `total` is always recomputed
// server-side from the (clamped) scores. This prevents a scripted call from
// forging a top leaderboard position or triggering the automated winner email.
export const saveUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => userRecordSchema.parse(data))
  .handler(async ({ data }) => {
    await checkRateLimit(`save-user:${getClientIp()}`, 60, 60);

    if (data.contact.toLowerCase() === DUMMY_EXAMPLE_PHONE) {
      throw new Error("This number is a placeholder example and cannot be used to save a score.");
    }

    const db = await getDb();
    const clampedScores = clampScores(data.scores);
    const recomputedTotal = computeTotal(clampedScores);
    const normalized = {
      ...data,
      contact: data.contact.toLowerCase(),
      email: data.email ?? undefined,
      name: data.name ?? undefined,
      address: data.address ?? undefined,
      participantType: data.participantType ?? undefined,
      referredBy: data.referredBy?.trim().toUpperCase(),
      consentAcceptedAt: data.consentAcceptedAt ?? undefined,
      scores: clampedScores,
      total: recomputedTotal,
      category: categorize(recomputedTotal).label,
      // `date` is never trusted from the client: it's recomputed from `playedAt`
      // (a real UTC instant) in Asia/Dubai time, so an attempt played at e.g.
      // 00:16 UAE time is bucketed into today, not into UTC's still-yesterday.
      playAttempts: (data.playAttempts ?? []).map((a) => {
        const scores = clampScores(a.scores);
        const total = computeTotal(scores);
        return { ...a, date: formatUaeDate(new Date(a.playedAt)), scores, total, category: categorize(total).label };
      }),
      // Server-set from the request, never client-trusted — overwritten on every save
      // so it always reflects the most recent IP this user saved from.
      lastIp: getClientIp(),
    };

    // Check if this is a brand-new referral for this user (to avoid double-counting)
    const existing = await db
      .collection<UserRecord>("users")
      .findOne({ contact: normalized.contact });

    // consentAcceptedAt is server-set and never client-trusted: once a user has
    // accepted, the timestamp is locked to that first acceptance forever.
    const consentAcceptedAt =
      existing?.consentAcceptedAt ?? (normalized.consent ? new Date().toISOString() : undefined);

    const firstTimeReferral =
      normalized.referredBy && normalized.referredBy !== normalized.userId && !existing?.referredBy;

    // Merge playDates / playAttempts deterministically so repeated saves do not duplicate attempts.
    const mergedPlayDates = [
      ...new Set([...(existing?.playDates ?? []), ...(normalized.playDates ?? [])]),
    ];
    const dedupedAttempts = dedupeAttempts([
      ...((existing?.playAttempts ?? []) as PlayAttempt[]),
      ...((normalized.playAttempts ?? []) as PlayAttempt[]),
    ]);
    // Cap stored history so a scripted play-loop can't grow a document without bound.
    const mergedAttempts = dedupedAttempts
      .slice()
      .sort((a, b) => a.playedAt.localeCompare(b.playedAt))
      .slice(-MAX_PLAY_ATTEMPTS_STORED);
    const bestAttempt = mergedAttempts.reduce<PlayAttempt | null>(
      (best, curr) => (!best || curr.total > best.total ? curr : best),
      null,
    );

    await db.collection<UserRecord>("users").updateOne(
      { contact: normalized.contact },
      {
        $set: {
          ...normalized,
          ...(consentAcceptedAt ? { consentAcceptedAt } : {}),
          playDates: mergedPlayDates,
          playAttempts: mergedAttempts,
          scores: bestAttempt?.scores ?? normalized.scores,
          total: bestAttempt?.total ?? normalized.total,
          category: bestAttempt?.category ?? normalized.category,
        },
      },
      { upsert: true },
    );

    // Increment referrer's referCount on first referral only
    if (firstTimeReferral) {
      await db
        .collection<UserRecord>("users")
        .updateOne({ userId: normalized.referredBy! }, { $inc: { referCount: 1 } });
    }

    return { ok: true };
  });

// ── get by contact ─────────────────────────────────────────────────────────────
// NOTE: this app's "login" is just a phone number with no OTP/possession check, so
// this lookup is reachable by anyone who can guess a phone number. Rate-limiting
// makes bulk enumeration impractical; it does not make this a real auth boundary.
// Closing that gap fully would require reintroducing phone verification, which is
// a deliberate product decision, not something to change silently here.
export const getUserByContactFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    await checkRateLimit(`lookup:${getClientIp()}`, 30, 60);
    const db = await getDb();
    const user = await db
      .collection<UserRecord & { _id: unknown }>("users")
      .findOne({ contact: data.contact.toLowerCase() });
    if (!user) return null;
    const { _id: _unused, ...rest } = user;
    return rest as UserRecord;
  });

// ── get by userId ─────────────────────────────────────────────────────────────
export const getUserByIdFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => userIdSchema.parse(data))
  .handler(async ({ data }) => {
    await checkRateLimit(`lookup:${getClientIp()}`, 30, 60);
    const db = await getDb();
    const user = await db
      .collection<UserRecord & { _id: unknown }>("users")
      .findOne({ userId: data.userId });
    if (!user) return null;
    const { _id: _unused, ...rest } = user;
    return rest as UserRecord;
  });

// ── save profile picture ─────────────────────────────────────────────────────
// Stored as a data URL. Only image/* MIME types are accepted, and the raw
// (pre-base64) size is capped at 5 MB — enforced here again server-side since
// the client-side check can be bypassed by a direct API call.
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
// Base64 encoding inflates size by ~4/3; add headroom for the "data:...;base64," prefix.
const MAX_AVATAR_DATA_URL_LENGTH = Math.ceil((MAX_AVATAR_BYTES * 4) / 3) + 100;

const saveAvatarSchema = z.object({
  userId: z.string().min(1),
  avatarUrl: z.string().refine((v) => /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(v), {
    message: "Only image files are allowed.",
  }),
});

export const saveAvatarFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => saveAvatarSchema.parse(data))
  .handler(async ({ data }) => {
    await checkRateLimit(`save-avatar:${getClientIp()}`, 10, 300);
    if (data.avatarUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
      throw new Error("Image is too large. Please choose a file under 5 MB.");
    }
    const db = await getDb();
    await db
      .collection<UserRecord>("users")
      .updateOne({ userId: data.userId }, { $set: { avatarUrl: data.avatarUrl } });
    return { ok: true };
  });

// ── referral info (referrer name + referral count) ─────────────────────────────
// Used by the profile page, which only needs one name and a count — not the
// entire user collection.
export const getReferralInfoFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => userIdSchema.parse(data))
  .handler(async ({ data }) => {
    await checkRateLimit(`lookup:${getClientIp()}`, 30, 60);
    const db = await getDb();
    const collection = db.collection<UserRecord & { _id: unknown }>("users");

    const [user, referralCount] = await Promise.all([
      collection.findOne({ userId: data.userId }, { projection: { referredBy: 1 } }),
      collection.countDocuments({ referredBy: data.userId }),
    ]);

    let referrerName = "";
    if (user?.referredBy) {
      const referrer = await collection.findOne(
        { userId: user.referredBy },
        { projection: { name: 1, contact: 1 } },
      );
      referrerName = referrer?.name || maskContact(referrer?.contact ?? "") || "";
    }

    return { referrerName, referralCount };
  });

// ── profanity check (server-side proxy) ─────────────────────────────────────────
// Proxies to PurgoMalum from the server rather than the browser, so a user's
// name is never sent to a third-party service directly from their client.
export const checkProfanityFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ text: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const trimmed = data.text.trim();
    if (!trimmed) return { flagged: false };
    try {
      const res = await fetch(
        `https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) return { flagged: false };
      const body = (await res.text()).trim().toLowerCase();
      return { flagged: body === "true" };
    } catch {
      // Fail open — never block a legitimate user if the third-party service is unreachable.
      return { flagged: false };
    }
  });

// ── reCAPTCHA verification ────────────────────────────────────────────────────
export const verifyCaptchaFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const db = await getDb();
    const settings = await db.collection("platform_settings").findOne({ _key: "main" });
    const secret = (settings as Record<string, unknown> | null)?.recaptchaSecret as
      | string
      | undefined;

    // If reCAPTCHA is not configured, pass through.
    if (!secret) return { ok: true, skipped: true };
    // Empty token means the script hasn't loaded yet — pass through rather than block user.
    if (!data.token) return { ok: true, skipped: true };

    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: data.token }).toString(),
    });
    const json = (await res.json()) as {
      success: boolean;
      score?: number;
      "error-codes"?: string[];
    };
    // v3: also require a human-like score (≥ 0.5). v2 doesn't include a score.
    const scoreOk = json.score === undefined || json.score >= 0.5;
    return { ok: json.success && scoreOk };
  });

// ── get all (public-safe fields only — used by leaderboard/referrals) ──────────
// Deliberately strips email/address/playAttempts and masks contact so this
// public, unauthenticated RPC can't be used to scrape PII. Admin screens must
// use getAllUsersAdminFn instead.
const maskContact = (c: string) => {
  if (c.includes("@")) {
    const [a, b] = c.split("@");
    return a.slice(0, 2) + "•••@" + b;
  }
  if (c.length > 4) return c.slice(0, 3) + "•••" + c.slice(-2);
  return c;
};

export const getAllUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDb();
  const docs = await db
    .collection<UserRecord & { _id: unknown }>("users")
    .find({})
    .sort({ total: -1 })
    .limit(5000)
    .toArray();
  return docs.map(
    ({
      _id: _unused,
      email: _email,
      address: _address,
      playAttempts: _playAttempts,
      contact,
      ...rest
    }) =>
      ({
        ...rest,
        contact: maskContact(contact),
      }) as UserRecord,
  );
});

// ── get all (admin only, full record incl. email/address/playAttempts) ────────
const adminAuthSchema = z.object({ token: z.string() });
export const getAllUsersAdminFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => adminAuthSchema.parse(data))
  .handler(async ({ data }) => {
    requireAdminToken(data.token);
    const db = await getDb();
    const docs = await db
      .collection<UserRecord & { _id: unknown }>("users")
      .find({})
      .sort({ total: -1 })
      .limit(5000)
      .toArray();
    return docs.map(({ _id: _unused, ...rest }) => rest as UserRecord);
  });
