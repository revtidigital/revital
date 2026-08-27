/**
 * Real-time profanity check. Routed through our own server (checkProfanityFn),
 * which proxies to PurgoMalum — the name is never sent to the third-party
 * service directly from the browser.
 */
export async function containsProfanity(text: string): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;
  try {
    const { checkProfanityFn } = await import("@/server/userFns");
    const { flagged } = await checkProfanityFn({ data: { text: trimmed } });
    return flagged;
  } catch {
    // Fail open — never block a legitimate user if the check is unreachable.
    return false;
  }
}
