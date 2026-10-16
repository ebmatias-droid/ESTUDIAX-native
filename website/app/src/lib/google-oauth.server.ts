import type { D1Database } from "@cloudflare/workers-types";
import { bindings } from "./bindings.server";

export const USER_COOKIE = "__Host-estudiax-user";
export const OAUTH_CALLBACK_PATH = "/api/google/oauth/callback";
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const OAUTH_SCOPES = ["openid", "email", "profile", DRIVE_SCOPE].join(" ");
const STATE_TTL_SECONDS = 600;

type ServerEnv = Record<string, unknown> & { DB?: D1Database };
export function googleEnv() {
  const env = bindings() as ServerEnv;
  return {
    db: env.DB,
    clientId: typeof env.GOOGLE_CLIENT_ID === "string" ? env.GOOGLE_CLIENT_ID.trim() : "",
    clientSecret: typeof env.GOOGLE_CLIENT_SECRET === "string" ? env.GOOGLE_CLIENT_SECRET.trim() : "",
    encryptionKey: typeof env.GOOGLE_TOKEN_ENCRYPTION_KEY === "string" ? env.GOOGLE_TOKEN_ENCRYPTION_KEY.trim() : "",
  };
}
export function missingGoogleConfig(config: ReturnType<typeof googleEnv>) {
  const missing = [
    !config.db && "D1 database binding (DB)",
    !config.clientId && "GOOGLE_CLIENT_ID",
    !config.clientSecret && "GOOGLE_CLIENT_SECRET",
    !config.encryptionKey && "GOOGLE_TOKEN_ENCRYPTION_KEY",
  ].filter(Boolean);
  return missing as string[];
}
export function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("Cookie") || "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return "";
}
export function makeCookie(name: string, value: string, maxAge: number) {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
export function randomToken(bytes = 32) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return base64url(data);
}
export function base64url(data: Uint8Array) {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
export async function sha256(value: string) {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}
export async function pkceChallenge(verifier: string) {
  return sha256(verifier);
}
export function oauthScopes() { return OAUTH_SCOPES; }
export function stateTtlSeconds() { return STATE_TTL_SECONDS; }

async function encryptionKey(secret: string) {
  let raw: Uint8Array;
  try {
    const normalized = secret.replace(/-/g, "+").replace(/_/g, "/");
    raw = Uint8Array.from(atob(normalized + "=".repeat((4 - normalized.length % 4) % 4)), c => c.charCodeAt(0));
  } catch {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY debe ser una clave base64 de 32 bytes.");
  }
  if (raw.byteLength !== 32) throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY debe ser una clave base64 de 32 bytes.");
  return crypto.subtle.importKey("raw", raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
export async function encryptTokens(secret: string, value: unknown) {
  const key = await encryptionKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const clear = new TextEncoder().encode(JSON.stringify(value));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv.buffer as ArrayBuffer }, key, clear.buffer.slice(clear.byteOffset, clear.byteOffset + clear.byteLength) as ArrayBuffer);
  return `${base64url(iv)}.${base64url(new Uint8Array(encrypted))}`;
}
export async function decryptTokens(secret: string, value: string) {
  const [ivPart, dataPart] = value.split(".");
  if (!ivPart || !dataPart) throw new Error("Formato de tokens cifrados no válido.");
  const decode = (input: string) => {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    return Uint8Array.from(atob(normalized + "=".repeat((4 - normalized.length % 4) % 4)), c => c.charCodeAt(0));
  };
  const key = await encryptionKey(secret);
  const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decode(ivPart).buffer as ArrayBuffer }, key, decode(dataPart).buffer as ArrayBuffer);
  return JSON.parse(new TextDecoder().decode(clear)) as { access_token?: string; refresh_token?: string; token_type?: string; expires_in?: number; scope?: string };
}
export function jsonError(message: string, status = 500) {
  return Response.json({ ok: false, error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
export function redirectResponse(url: string, headers?: HeadersInit) {
  return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "no-store", ...Object.fromEntries(new Headers(headers).entries()) } });
}
