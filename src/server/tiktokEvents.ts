import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/start-server-core";
import { createHash } from "node:crypto";
import { z } from "zod";
import { getClientIp } from "./security";

const TIKTOK_EVENTS_API_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

const inputSchema = z.object({
  pixelId: z.string().min(1),
  event: z.string().min(1),
  eventId: z.string().min(1),
  pageUrl: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * Server-side companion to the browser Pixel SDK. Sends the same event (matched
 * by eventId, so TikTok dedupes the two) via the Events API, which still lands
 * even if the visitor has an ad blocker or the browser pixel fails to fire.
 */
export const sendTiktokEventFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
    if (!accessToken) return { ok: false };

    const headers = getRequestHeaders();
    const userAgent = headers.get("user-agent") ?? undefined;
    const ip = getClientIp();

    const user: Record<string, string> = {};
    const normalizedEmail = data.email?.trim().toLowerCase();
    if (normalizedEmail) user.email = sha256Hex(normalizedEmail);
    const digitsPhone = data.phone?.replace(/\D/g, "");
    if (digitsPhone) user.phone = sha256Hex(digitsPhone);
    if (userAgent) user.user_agent = userAgent;
    if (ip && ip !== "unknown") user.ip = ip;

    try {
      const res = await fetch(TIKTOK_EVENTS_API_URL, {
        method: "POST",
        headers: { "Access-Token": accessToken, "Content-Type": "application/json" },
        body: JSON.stringify({
          event_source: "web",
          event_source_id: data.pixelId,
          data: [
            {
              event: data.event,
              event_id: data.eventId,
              page: { url: data.pageUrl },
              user,
            },
          ],
        }),
      });
      return { ok: res.ok };
    } catch {
      // Events API is best-effort — the browser pixel is the primary path.
      return { ok: false };
    }
  });
