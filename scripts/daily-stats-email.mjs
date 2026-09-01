#!/usr/bin/env node
// Standalone cron script — emails a daily new-vs-returning player count to the team.
// Runs independently of the app; reuses the same Mongo connection and raw-SMTP
// send pattern as lock-winners.mjs (no nodemailer dependency needed).
import { MongoClient } from "mongodb";
import tls from "node:tls";

// ── Config ───────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongo:27017/rev-challenge-hub";
const GMAIL_FROM_EMAIL = process.env.GMAIL_FROM_EMAIL || "revitalenergyuae@gmail.com";
const GMAIL_APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
const GMAIL_SMTP_HOST = "smtp.gmail.com";
const GMAIL_SMTP_PORT = 465;
const SMTP_TIMEOUT_MS = 20_000;

const RECIPIENTS = [
  "chirayu.khandelwal@revtidigital.com",
  "himanshu@revtidigital.com",
  "revitalenergyuae@gmail.com",
];

if (!GMAIL_FROM_EMAIL || !GMAIL_APP_PASSWORD) {
  console.error("Missing Gmail SMTP credentials. Set GMAIL_FROM_EMAIL and GMAIL_APP_PASSWORD.");
  process.exit(1);
}

// ── Date helpers ─────────────────────────────────────────────────────────────
const formatUaeDate = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(d);

// ── SMTP (same raw-socket sender as lock-winners.mjs) ───────────────────────
const sanitizeMailHeader = (v) => v.replace(/[\r\n]+/g, " ").trim();
const dotStuff = (v) => v.replace(/^\./gm, "..");

function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    };
    const onError = (err) => {
      cleanup();
      reject(err);
    };
    const onTimeout = () => {
      cleanup();
      reject(new Error("Timed out waiting for SMTP response."));
    };
    const onData = (chunk) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const finalLine = [...lines].reverse().find((line) => /^\d{3}\s/.test(line));
      if (!finalLine) return;
      cleanup();
      resolve({ code: Number(finalLine.slice(0, 3)), text: buffer });
    };
    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });
}

async function expectSmtp(socket, expectedCodes, command) {
  if (command) socket.write(`${command}\r\n`);
  const response = await readSmtpResponse(socket);
  if (!expectedCodes.includes(response.code)) {
    throw new Error(`SMTP command failed (${response.code}): ${response.text.trim()}`);
  }
  return response;
}

async function sendViaGmailSmtp(to, subject, body) {
  const socket = tls.connect({
    host: GMAIL_SMTP_HOST,
    port: GMAIL_SMTP_PORT,
    servername: GMAIL_SMTP_HOST,
  });
  socket.setTimeout(SMTP_TIMEOUT_MS);

  try {
    await new Promise((resolve, reject) => {
      socket.once("secureConnect", resolve);
      socket.once("error", reject);
    });

    await expectSmtp(socket, [220]);
    await expectSmtp(socket, [250], "EHLO revital.local");
    await expectSmtp(socket, [334], "AUTH LOGIN");
    await expectSmtp(socket, [334], Buffer.from(GMAIL_FROM_EMAIL).toString("base64"));
    await expectSmtp(socket, [235], Buffer.from(GMAIL_APP_PASSWORD).toString("base64"));
    await expectSmtp(socket, [250], `MAIL FROM:<${GMAIL_FROM_EMAIL}>`);
    await expectSmtp(socket, [250, 251], `RCPT TO:<${to}>`);
    await expectSmtp(socket, [354], "DATA");

    const safeSubject = sanitizeMailHeader(subject);
    const safeFrom = sanitizeMailHeader(GMAIL_FROM_EMAIL);
    const safeTo = sanitizeMailHeader(to);
    const safeBody = dotStuff(body);

    socket.write(
      `Subject: ${safeSubject}\r\nFrom: ${safeFrom}\r\nTo: ${safeTo}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${safeBody}\r\n.\r\n`,
    );

    await expectSmtp(socket, [250]);
    await expectSmtp(socket, [221], "QUIT");
  } finally {
    socket.end();
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

    const today = formatUaeDate(new Date());
    console.log(`[daily-stats-email] Date: ${today}`);

    const users = await db.collection("users").find({}).toArray();

    const newUsersToday = users.filter((u) => formatUaeDate(new Date(u.createdAt)) === today);
    const returningUsersToday = users.filter(
      (u) =>
        formatUaeDate(new Date(u.createdAt)) !== today &&
        (u.playAttempts ?? []).some((a) => a.date === today),
    );

    const newCount = newUsersToday.length;
    const returningCount = returningUsersToday.length;
    const totalPlayedToday = newUsersToday.filter((u) =>
      (u.playAttempts ?? []).some((a) => a.date === today),
    ).length;

    const now = new Date();
    const timeLabel = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dubai",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);

    const subject = `Revital Daily Stats — ${today} (${timeLabel} UAE)`;
    const text = `Revital Energy Challenge — Daily Stats

Date: ${today}
Time: ${timeLabel} UAE

New users today (signed up): ${newCount}
Of those, played today: ${totalPlayedToday}

Old users who played again today: ${returningCount}

Total users in system: ${users.length}
`;

    console.log(`[daily-stats-email] New: ${newCount}, Returning: ${returningCount}`);

    await Promise.all(RECIPIENTS.map((email) => sendViaGmailSmtp(email, subject, text)));

    console.log(`[daily-stats-email] Email sent to: ${RECIPIENTS.join(", ")}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("[daily-stats-email] Fatal error:", err);
  process.exit(1);
});
