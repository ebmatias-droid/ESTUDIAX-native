import { createFileRoute } from "@tanstack/react-router";
import {
  cookieValue, googleEnv, jsonError, makeCookie, missingGoogleConfig, oauthScopes,
  pkceChallenge, randomToken, redirectResponse, sha256, stateTtlSeconds, USER_COOKIE,
} from "../../../../lib/google-oauth.server";
import { hasValidTurnstileSession } from "../../../../lib/api/turnstile-session.server";
import { enforcePersistentRateLimit, RateLimitExceededError } from "../../../../lib/security-rate-limit.server";

export const Route = createFileRoute("/api/google/oauth/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.origin !== "https://estudiax.higgsfield.app") return jsonError("Origen no permitido.", 403);
        if (!(await hasValidTurnstileSession())) return jsonError("Completa la verificación de seguridad antes de conectar Google Drive.", 403);
        try { await enforcePersistentRateLimit("google-oauth-start", 5, 15); } catch (error) {
          if (error instanceof RateLimitExceededError) return jsonError("Demasiados intentos de conexión. Espera antes de volver a intentarlo.", 429);
          return jsonError("El control de seguridad no está disponible temporalmente.", 503);
        }
        const config = googleEnv();
        const missing = missingGoogleConfig(config);
        if (missing.length) return jsonError(`Falta configurar: ${missing.join(", ")}.`, 503);
        if (url.protocol !== "https:") return jsonError("OAuth requiere HTTPS.", 400);
        const existingUser = cookieValue(request, USER_COOKIE);
        const userId = /^[A-Za-z0-9_-]{40,50}$/.test(existingUser) ? existingUser : randomToken();
        const state = randomToken();
        const verifier = randomToken(48);
        const now = Math.floor(Date.now() / 1000);
        const stateHash = await sha256(state);
        await config.db!.prepare("DELETE FROM google_oauth_states WHERE expires_at < ?").bind(now).run();
        await config.db!.prepare("INSERT INTO google_oauth_states (state_hash, user_id, code_verifier, created_at, expires_at) VALUES (?, ?, ?, ?, ?)")
          .bind(stateHash, userId, verifier, now, now + stateTtlSeconds()).run();
        const callback = `${url.origin}/api/google/oauth/callback`;
        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authUrl.search = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: callback,
          response_type: "code",
          scope: oauthScopes(),
          state,
          code_challenge: await pkceChallenge(verifier),
          code_challenge_method: "S256",
          access_type: "offline",
          prompt: "consent",
          include_granted_scopes: "true",
        }).toString();
        const headers = new Headers();
        headers.append("Set-Cookie", makeCookie(USER_COOKIE, userId, 60 * 60 * 24 * 365));
        return redirectResponse(authUrl.toString(), headers);
      },
    },
  },
});
