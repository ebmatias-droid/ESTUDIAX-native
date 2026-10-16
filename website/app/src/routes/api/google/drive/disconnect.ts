import { createFileRoute } from "@tanstack/react-router";
import { cookieValue, googleEnv, jsonError, USER_COOKIE } from "../../../../lib/google-oauth.server";
import { hasValidTurnstileSession } from "../../../../lib/api/turnstile-session.server";
import { enforcePersistentRateLimit, RateLimitExceededError } from "../../../../lib/security-rate-limit.server";

export const Route = createFileRoute("/api/google/drive/disconnect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("Origin");
        const url = new URL(request.url);
        if (!origin || origin !== url.origin || url.protocol !== "https:") return jsonError("Origen no permitido.", 403);
        if (!(await hasValidTurnstileSession())) return jsonError("Completa la verificación de seguridad antes de desconectar Google Drive.", 403);
        try { await enforcePersistentRateLimit("drive-disconnect", 5, 20); } catch (error) {
          if (error instanceof RateLimitExceededError) return jsonError("Demasiadas solicitudes. Espera antes de volver a intentarlo.", 429);
          return jsonError("El control de seguridad no está disponible temporalmente.", 503);
        }
        const config = googleEnv();
        if (!config.db) return jsonError("La base de datos D1 no está disponible.", 503);
        const userId = cookieValue(request, USER_COOKIE);
        if (!/^[A-Za-z0-9_-]{40,50}$/.test(userId)) return Response.json({ ok: true });
        await config.db.prepare("DELETE FROM google_drive_connections WHERE user_id = ?").bind(userId).run();
        return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
