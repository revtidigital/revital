#!/usr/bin/env node
// Standalone cron script (STAGING ONLY) — sends a Brevo transactional "keep playing"
// email to up to BATCH_SIZE users who have never received it before, then marks
// them as sent so they're never emailed by this script again.
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "hello@revitaluae.com";
const SENDER_NAME = "Revital UAE";
const SUBJECT = "⚡ Don’t lose your spot on the Revital Energy Challenge Leaderboard!";
const BATCH_SIZE = 15;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI.");
  process.exit(1);
}
if (!BREVO_API_KEY) {
  console.error("Missing BREVO_API_KEY.");
  process.exit(1);
}

const PLAY_URL =
  "https://revitaluae.com/?utm_source=newsletter&utm_medium=email&utm_campaign=revital_energy_challenge&utm_content=participants";
const INSTAGRAM_URL =
  "https://www.instagram.com/revital.uae?utm_source=newsletter&utm_medium=email&utm_campaign=revital_energy_challenge&utm_content=participants";

function buildHtml(firstName) {
  const name = (firstName || "").trim() || "there";
  return `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222;line-height:1.6;max-width:600px;margin:0 auto;">
  <p>Hi ${name},</p>
  <p>Every day is a new chance to climb higher.</p>
  <p>The <a href="${PLAY_URL}"><strong>Revital Energy Challenge</strong></a> leaderboard updates daily, and your next game could be the one that moves you closer to the top.</p>
  <p><strong>Here's your reminder to keep playing:</strong></p>
  <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
  <p>&#127918; <strong>Play Daily. Stay on Top.</strong><br />
  Your best score of the day counts towards the Daily Leaderboard. The more consistently you play, the better your chances of staying ahead.</p>
  <p>&#128101; <strong>Refer Friends. Earn More.</strong><br />
  Every successful referral gives you 100 points on the Grand Leaderboard. The best part? Referrals are unlimited, so every friend you invite can help boost your Grand Score.</p>
  <p>&#127942; <strong>Win Exciting Daily Prizes</strong><br />
  A Daily Winner is selected every day based on the highest Daily Energy Score. Your next game could make you today's winner.</p>
  <p><strong>Ready to climb the leaderboard?</strong><br />
  &#128073; <a href="${PLAY_URL}"><strong>PLAY THE REVITAL ENERGY CHALLENGE NOW</strong></a></p>
  <p>Stay connected with us on Instagram <a href="${INSTAGRAM_URL}"><strong>@revital.uae</strong></a> for daily winner announcements, leaderboard updates, and exciting campaign surprises.</p>
  <p>See you at the top!</p>
  <p>Team Revital</p>
</div>`;
}

async function sendBrevoEmail(to, firstName) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to, name: firstName || undefined }],
      subject: SUBJECT,
      htmlContent: buildHtml(firstName),
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo send failed for ${to}: ${res.status} ${text}`);
  }
}

async function main() {
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  try {
    const db = client.db("revital");
    const users = db.collection("users");

    const candidates = await users
      .find({
        email: { $exists: true, $ne: null, $ne: "" },
        welcomeEmailSentAt: { $exists: false },
      })
      .sort({ createdAt: 1 })
      .limit(BATCH_SIZE)
      .toArray();

    console.log(`Found ${candidates.length} candidate(s) for this run.`);

    for (const user of candidates) {
      const email = String(user.email).trim();
      const firstName = String(user.name || "").trim().split(/\s+/)[0] || "";
      try {
        await sendBrevoEmail(email, firstName);
        await users.updateOne({ _id: user._id }, { $set: { welcomeEmailSentAt: new Date() } });
        console.log(`Sent to ${email} (userId=${user.userId || user._id})`);
      } catch (err) {
        console.error(`Failed for ${email}:`, err.message);
      }
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
