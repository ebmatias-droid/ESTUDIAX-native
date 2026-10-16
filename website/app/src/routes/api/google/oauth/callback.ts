import { createFileRoute } from "@tanstack/react-router";
import {
  cookieValue, encryptTokens, googleEnv, jsonError, makeCookie, missingGoogleConfig,
  redirectResponse, sha256, USER_COOKIE, decryptTokens,
} from "../../../../lib/google-oauth.server";

type GoogleTokenResponse = {
  access_token?: string; refresh_token?: string; expires_in?: number; token_type?: string;
  scope?: string; id_token?: string; error?: string; error_description?: string;
};
type GoogleProfile = { sub?: string; email?: string; email_verified?: boolean };

export const Route = createFileRoute("/api/google/oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.origin !== "https://estudiax.higgsfield.app") return jsonError("Origen OAuth no permitido.", 403);
        const home = new URL("/", "https://estudiax.higgsfield.app");
        const fail = (reason: string) => {
          home.searchParams.set("google_drive", "error");
          home.searchParams.set("reason", reason);
          return redirectResponse(home.toString());
        };
        if (url.searchParams.has("error")) return fail("consent_denied");
        const code = url.searchParams.get("code") || "";
        const state = url.searchParams.get("state") || "";
        const userId = cookieValue(request, USER_COOKIE);
        if (!code || !state || !/^[A-Za-z0-9_-]{40,50}$/.test(userId)) return fail("invalid_callback");
        const config = googleEnv();
        const missing = missingGoogleConfig(config);
        if (missing.length) return jsonError(`Falta configurar: ${missing.join(", ")}.`, 503);
        const now = Math.floor(Date.now() / 1000);
        const stateHash = await sha256(state);
        const attempt = await config.db!.prepare("SELECT user_id, code_verifier, expires_at FROM google_oauth_states WHERE state_hash = ?")
          .bind(stateHash).first<{ user_id: string; code_verifier: string; expires_at: number }>();
        await config.db!.prepare("DELETE FROM google_oauth_states WHERE state_hash = ?").bind(stateHash).run();
        if (!attempt || attempt.user_id !== userId || attempt.expires_at < now) return fail("state_mismatch");

        const callback = `${url.origin}/api/google/oauth/callback`;
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: callback,
            grant_type: "authorization_code",
            code_verifier: attempt.code_verifier,
          }),
        });
        const tokens = await tokenResponse.json().catch(() => ({})) as GoogleTokenResponse;
        if (!tokenResponse.ok || !tokens.access_token) return fail("token_exchange_failed");
        const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const profile = await profileResponse.json().catch(() => ({})) as GoogleProfile;
        if (!profileResponse.ok || !profile.sub) return fail("profile_lookup_failed");
        const old = await config.db!.prepare("SELECT encrypted_tokens FROM google_drive_connections WHERE user_id = ?")
          .bind(userId).first<{ encrypted_tokens: string }>();
        let refreshToken = tokens.refresh_token;
        if (!refreshToken && old?.encrypted_tokens) {
          // Google may omit refresh_token on subsequent grants; preserve the existing one.
          try {
            const oldTokens = await decryptTokens(config.encryptionKey, old.encrypted_tokens);
            refreshToken = oldTokens.refresh_token;
          } catch { /* An invalid old ciphertext must not prevent a fresh grant. */ }
        }
        if (!refreshToken) return fail("missing_refresh_token");
        const encrypted = await encryptTokens(config.encryptionKey, { ...tokens, refresh_token: refreshToken });
        const scopes = tokens.scope || "";
        if (!scopes.split(/\s+/).includes("https://www.googleapis.com/auth/drive.file")) return fail("drive_scope_missing");
        await config.db!.prepare(`INSERT INTO google_drive_connections
          (user_id, google_sub, email, encrypted_tokens, granted_scope, token_expires_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET google_sub=excluded.google_sub, email=excluded.email,
          encrypted_tokens=excluded.encrypted_tokens, granted_scope=excluded.granted_scope,
          token_expires_at=excluded.token_expires_at, updated_at=excluded.updated_at`)
          .bind(userId, profile.sub, profile.email || null, encrypted, scopes, now + (tokens.expires_in || 3600), old ? now : now, now).run();
        home.searchParams.set("google_drive", "connected");
        return redirectResponse(home.toString());
      },
    },
  },
});
