import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { serve } from "srvx/node";
import { readFile } from "node:fs/promises";
import { join, extname, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import cron from "node-cron";

const __dirname = dirname(fileURLToPath(import.meta.url));
// server.js lives at dist/server/server.js; client assets are at dist/client/
const clientDir = resolve(join(__dirname, "../client"));

const MIME: Record<string, string> = {
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const ssrHandler = createStartHandler(defaultStreamHandler);

const port = Number(process.env.PORT) || 3000;

/**
 * Baseline security headers applied to every response. Deliberately does NOT set
 * a Content-Security-Policy: the site loads GA4, Meta Pixel, Microsoft Clarity,
 * Google Sign-In, and reCAPTCHA from third-party origins, and a CSP tight enough
 * to matter would need to be authored and visually verified against all of those
 * integrations rather than guessed at blind.
 */
function applySecurityHeaders(headers: Headers): void {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
}

function getCacheControl(pathname: string): string {
  // Vite emits fingerprinted files like `/assets/index-abc123.js`.
  // These are safe to cache for a long time.
  const isFingerprintedAsset = /\/assets\/.+-[a-z0-9]{8,}\./i.test(pathname);
  if (isFingerprintedAsset) {
    return "public, max-age=31536000, immutable";
  }

  // Non-fingerprinted files (e.g. /favicon.ico) should revalidate frequently.
  return "public, max-age=0, must-revalidate";
}

/**
 * TanStack Start server functions (createServerFn) can only run inside an active
 * request — calling the exported function directly from plain Node code (e.g. a
 * cron callback) throws "No Start context found in AsyncLocalStorage", because the
 * framework's per-request context (via runWithStartContext) is only set up while
 * handling a real HTTP request to the function's `/_serverFn/<id>` URL. So instead
 * of importing and calling the handler directly, we make a real self-loopback HTTP
 * request to our own server, exactly like the browser client does: encode the
 * payload with `seroval` (the wire format `handleServerAction` expects — plain
 * `JSON.stringify` is rejected with a seroval parse error) and set an `Origin`
 * header matching our own origin so the framework's same-origin CSRF check passes
 * (a request with no Origin/Referer/Sec-Fetch-Site header is rejected with 403).
 */
async function callServerFn<T>(
  fn: { url: string } & ((opts: { data: unknown }) => Promise<T>),
  data: unknown,
): Promise<T> {
  const { toJSONAsync } = await import("seroval");
  const body = JSON.stringify(await toJSONAsync({ data }, { plugins: [] }));
  const origin = `http://localhost:${port}`;
  const res = await fetch(`${origin}${fn.url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "x-tsr-serverFn": "true",
    },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Server fn ${fn.url} failed (${res.status}): ${text}`);
  }
  // Response is seroval-encoded too; only care about surfacing errors here,
  // so a lightweight extraction of the serialized `result`/`error` is enough.
  const parsed = JSON.parse(text);
  const errorNode = parsed?.p?.v?.[1];
  if (errorNode && errorNode.c === "$TSR/Error") {
    throw new Error(errorNode.s?.message?.s ?? "Server fn returned an error");
  }
  return parsed;
}

// Auto-lock today's top winner + email admins every night at 23:59 Asia/Dubai (UAE) time.
// Runs in every pm2/cluster worker and every Docker replica, but runDailyWinnerLock()
// claims the day's lockDate atomically in Mongo before sending, so only one worker
// across the whole fleet actually sends the email — the rest see `alreadySent: true`.
cron.schedule(
  "59 23 * * *",
  async () => {
    try {
      const { lockDailyTopTenAndNotifyFn } = await import("./server/adminFns");
      const { issueAdminToken } = await import("./server/security");
      await callServerFn(lockDailyTopTenAndNotifyFn, { token: issueAdminToken() });
    } catch (err) {
      console.error("[cron] lockDailyTopTenAndNotifyFn failed:", err);
    }
  },
  { timezone: "Asia/Dubai" },
);

serve({
  fetch: async (req: Request) => {
    const { pathname } = new URL(req.url);

    if (pathname === "/healthz") {
      return new Response("ok", { status: 200, headers: { "Cache-Control": "no-store" } });
    }

    // Try static file serving from `dist/client` first.
    const resolvedPath = resolve(join(clientDir, pathname.slice(1)));
    const rel = relative(clientDir, resolvedPath);
    const isInsideClientDir = rel && !rel.startsWith("..") && !rel.includes("..\\");

    if (isInsideClientDir) {
      try {
        const data = await readFile(resolvedPath);
        const ext = extname(resolvedPath).toLowerCase();
        const headers = new Headers({
          "Content-Type": MIME[ext] ?? "application/octet-stream",
          "Cache-Control": getCacheControl(pathname),
        });
        applySecurityHeaders(headers);
        return new Response(data, { headers });
      } catch {
        // file not found — fall through to SSR (will 404 via router)
      }
    }

    const response = await ssrHandler(req);

    // Avoid stale HTML/SSR payloads after deploys.
    const headers = new Headers(response.headers);
    if (!headers.has("Cache-Control")) {
      headers.set("Cache-Control", "no-store");
    }
    applySecurityHeaders(headers);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
  port,
});
