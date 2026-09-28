#!/usr/bin/env node
// Standalone cron script — runs hourly. Sends the "keep playing" reminder
// (Brevo template) to every user whose signup is at least 48 hours old, has
// an email on file, and has never received this email before. Marks them
// sent so they're never emailed again by this job. Mirrors the
// standalone-script + OS-cron pattern used by lock-winners.mjs /
// daily-stats-email.mjs (no in-app scheduler, per the race-condition lesson
// already learned on this app — see winner_mail_log claim-before-send fix).
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongo:27017/revital";
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_TEMPLATE_ID = 326;
const DELAY_HOURS = 48;
// Safety cap only — not a design batch size. Prevents one run from sending
// an unbounded number of emails if the job is ever down for a long stretch
// and a large backlog crosses the 48h mark all at once.
const MAX_PER_RUN = 200;

// Pass --test=someone@example.com to send exactly one real Brevo send to
// that address (using the first eligible candidate's name, or "there" if
// none exist) WITHOUT touching the database — no claim, no
// welcomeEmailSentAt write, no batch limit bypassed. Safe to run repeatedly.
const testArg = process.argv.find((a) => a.startsWith("--test="));
const TEST_EMAIL = testArg ? testArg.slice("--test=".length).trim() : null;

if (!BREVO_API_KEY) {
  console.error("Missing Brevo API key. Set BREVO_API_KEY.");
  process.exit(1);
}

// ── Date helpers ─────────────────────────────────────────────────────────────
const formatUaeDate = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(d);

// ── Brevo ─────────────────────────────────────────────────────────────────────
async function sendBrevoTemplateEmail(to, firstName) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      to: [{ email: to, name: firstName || undefined }],
      templateId: BREVO_TEMPLATE_ID,
      params: { FIRSTNAME: firstName || "there" },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo send failed for ${to}: ${res.status} ${text}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const client = new MongoClient(MONGODB_URI, {
    connectTimeoutMS: 10_000,
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    await client.connect();
    const db = client.db("revital");
    const users = db.collection("users");

    if (TEST_EMAIL) {
      const sample = await users.findOne(
        { email: { $exists: true, $nin: [null, ""] } },
        { sort: { createdAt: -1 } },
      );
      const firstName = String(sample?.name || "").trim().split(/\s+/)[0] || "";
      await sendBrevoTemplateEmail(TEST_EMAIL, firstName);
      console.log(`[welcome-email] TEST send complete to ${TEST_EMAIL} (no DB write).`);
      return;
    }

    const cutoff = new Date(Date.now() - DELAY_HOURS * 60 * 60 * 1000).toISOString();

    const candidates = await users
      .find({
        email: { $exists: true, $nin: [null, ""] },
        createdAt: { $lte: cutoff },
        welcomeEmailSentAt: { $exists: false },
      })
      .sort({ createdAt: 1 })
      .limit(MAX_PER_RUN)
      .toArray();

    console.log(`[welcome-email] Found ${candidates.length} candidate(s) with signup <= ${cutoff}.`);

    for (const user of candidates) {
      const email = String(user.email).trim();
      const firstName = String(user.name || "").trim().split(/\s+/)[0] || "";

      // Atomic claim-before-send: only proceed if we're the one who flips
      // welcomeEmailSentAt from unset to set. Prevents double-sends across
      // the 2 Docker replicas / concurrent cron runs, same pattern as the
      // winner_mail_log fix in lock-winners.mjs history.
      const claim = await users.findOneAndUpdate(
        { _id: user._id, welcomeEmailSentAt: { $exists: false } },
        { $set: { welcomeEmailSentAt: new Date() } },
      );
      if (!claim) {
        console.log(`[welcome-email] Skipped ${email} — already claimed by another run.`);
        continue;
      }

      try {
        await sendBrevoTemplateEmail(email, firstName);
        console.log(`[welcome-email] Sent to ${email} (userId=${user.userId || user._id})`);
      } catch (err) {
        // Revert the claim so this user is retried on the next run.
        await users.updateOne({ _id: user._id }, { $unset: { welcomeEmailSentAt: "" } });
        console.error(`[welcome-email] Failed for ${email}, claim reverted:`, err.message);
      }
    }
  } finally {
    await client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("[welcome-email] Fatal error:", err);
    process.exit(1);
  });
}
