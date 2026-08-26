/** Real-time profanity check via PurgoMalum (https://www.purgomalum.com), client-side, CORS-enabled. */
export async function containsProfanity(text: string): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;
  try {
    const res = await fetch(
      `https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(trimmed)}`,
    );
    if (!res.ok) return false;
    const body = (await res.text()).trim().toLowerCase();
    return body === "true";
  } catch {
    // Fail open — never block a legitimate user if the third-party service is unreachable.
    return false;
  }
}
