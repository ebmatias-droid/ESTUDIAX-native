import { getRequest } from "@tanstack/react-start/server";
import { bindings } from "./bindings.server";

const WINDOW_SECONDS = 60;
const HOUR_SECONDS = 60 * 60;
const DAY_SECONDS = 24 * 60 * 60;
let callsSinceCleanup = 0;

export class RateLimitExceededError extends Error {
  constructor() { super("Demasiadas solicitudes. Espera un momento antes de volver a intentarlo."); this.name = "RateLimitExceededError"; }
}

/** Persistent per-IP throttling using D1; only a keyed digest of the IP is stored. */
export async function enforcePersistentRateLimit(scope: string, perMinute: number, perHour: number) {
  const request = getRequest();
  // This header is set by Cloudflare at the edge. Never trust X-Forwarded-For from clients.
  const ip = request.headers.get("cf-connecting-ip") || "unknown-client";
  const env = bindings() as Record<string, unknown>;
  const db = env.DB as { prepare: (sql: string) => { bind: (...values: unknown[]) => { first: <T>() => Promise<T | null>; run: () => Promise<unknown> } } } | undefined;
  const secret = typeof env.TURNSTILE_SECRET_KEY === "string" ? env.TURNSTILE_SECRET_KEY.trim() : "";
  if (!db || !secret) throw new Error("El control de solicitudes no está disponible.");

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`estudiax-rate-limit-v1:${scope}:${ip}`)));
  const keyHash = Array.from(digest, byte => byte.toString(16).padStart(2, "0")).join("");
  const now = Math.floor(Date.now() / 1000);
  const minuteBucket = Math.floor(now / WINDOW_SECONDS);
  const hourBucket = Math.floor(now / HOUR_SECONDS);

  const result = await db.prepare(`
    INSERT INTO api_rate_limits (key_hash, minute_bucket, minute_count, hour_bucket, hour_count, updated_at)
    VALUES (?, ?, 1, ?, 1, ?)
    ON CONFLICT(key_hash) DO UPDATE SET
      minute_count = CASE WHEN api_rate_limits.minute_bucket = excluded.minute_bucket THEN api_rate_limits.minute_count + 1 ELSE 1 END,
      minute_bucket = excluded.minute_bucket,
      hour_count = CASE WHEN api_rate_limits.hour_bucket = excluded.hour_bucket THEN api_rate_limits.hour_count + 1 ELSE 1 END,
      hour_bucket = excluded.hour_bucket,
      updated_at = excluded.updated_at
    WHERE (CASE WHEN api_rate_limits.minute_bucket = excluded.minute_bucket THEN api_rate_limits.minute_count ELSE 0 END) < ?
      AND (CASE WHEN api_rate_limits.hour_bucket = excluded.hour_bucket THEN api_rate_limits.hour_count ELSE 0 END) < ?
    RETURNING minute_count, hour_count
  `).bind(keyHash, minuteBucket, hourBucket, now, perMinute, perHour).first<{ minute_count: number; hour_count: number }>();

  callsSinceCleanup++;
  if (callsSinceCleanup >= 100) {
    callsSinceCleanup = 0;
    await db.prepare("DELETE FROM api_rate_limits WHERE updated_at < ?").bind(now - DAY_SECONDS).run();
  }
  if (!result) throw new RateLimitExceededError();
}
