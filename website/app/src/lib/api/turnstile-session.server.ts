import { getCookie } from "@tanstack/react-start/server";
import { bindings } from "../bindings.server";

export const TURNSTILE_SESSION_COOKIE = "__Host-estudiax-verified";
export const TURNSTILE_SESSION_SECONDS = 4 * 60 * 60;

function getSigningSecret() {
  const env = bindings() as Record<string, unknown>;
  return typeof env.TURNSTILE_SECRET_KEY === "string" ? env.TURNSTILE_SECRET_KEY.trim() : "";
}

async function signatureFor(expiry: string, secret: string) {
  // Domain-separate the application session-signing key from the Turnstile API secret.
  const derived = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`estudiax-turnstile-session-signing-v1:${secret}`));
  const key = await crypto.subtle.importKey(
    "raw",
    derived,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`estudiax-turnstile-v1:${expiry}`)));
  return Array.from(signature, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function issueTurnstileSession() {
  const secret = getSigningSecret();
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not configured");
  const expiry = String(Math.floor(Date.now() / 1000) + TURNSTILE_SESSION_SECONDS);
  return `${expiry}.${await signatureFor(expiry, secret)}`;
}

export async function hasValidTurnstileSession() {
  const secret = getSigningSecret();
  if (!secret) return false;
  const value = getCookie(TURNSTILE_SESSION_COOKIE);
  if (!value) return false;
  const separator = value.indexOf(".");
  if (separator < 1) return false;
  const expiry = value.slice(0, separator);
  const suppliedSignature = value.slice(separator + 1);
  if (!/^\d{10}$/.test(expiry) || !/^[a-f0-9]{64}$/.test(suppliedSignature)) return false;
  const now = Math.floor(Date.now() / 1000);
  const expirySeconds = Number(expiry);
  if (expirySeconds <= now || expirySeconds > now + TURNSTILE_SESSION_SECONDS + 60) return false;
  const expectedSignature = await signatureFor(expiry, secret);
  if (expectedSignature.length !== suppliedSignature.length) return false;
  let difference = 0;
  for (let i = 0; i < expectedSignature.length; i++) difference |= expectedSignature.charCodeAt(i) ^ suppliedSignature.charCodeAt(i);
  return difference === 0;
}
