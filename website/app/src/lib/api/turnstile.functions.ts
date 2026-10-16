import { createServerFn } from "@tanstack/react-start";
import { getRequest, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { bindings } from "../bindings.server";
import { issueTurnstileSession, TURNSTILE_SESSION_COOKIE, TURNSTILE_SESSION_SECONDS } from "./turnstile-session.server";
import { enforcePersistentRateLimit, RateLimitExceededError } from "../security-rate-limit.server";

const ALLOWED_HOSTNAMES = new Set(["estudiax.higgsfield.app"]);

export const verifyTurnstile = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().min(1).max(2048) }))
  .handler(async ({ data }) => {
    const origin = getRequest().headers.get("origin");
    const host = getRequest().headers.get("host");
    if (!origin || !host) return { ok: false, message: "Origen de solicitud no permitido." };
    try {
      if (new URL(origin).host !== host) return { ok: false, message: "Origen de solicitud no permitido." };
    } catch {
      return { ok: false, message: "Origen de solicitud no permitido." };
    }
    try { await enforcePersistentRateLimit("turnstile-verify", 10, 50); } catch (error) {
      if (error instanceof RateLimitExceededError) return { ok: false, message: "Demasiados intentos de verificación. Espera un momento y vuelve a intentarlo." };
      return { ok: false, message: "El control de seguridad no está disponible temporalmente." };
    }
    const env = bindings() as Record<string, unknown>;
    const secret = typeof env.TURNSTILE_SECRET_KEY === "string" ? env.TURNSTILE_SECRET_KEY : "";
    if (!secret) {
      return { ok: false, message: "Falta configurar TURNSTILE_SECRET_KEY en los secretos del servidor." };
    }

    const request = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: data.token,
      }),
    });
    if (!request.ok) return { ok: false, message: "No se pudo contactar con la verificación de Cloudflare. Inténtalo de nuevo." };

    const result = (await request.json().catch(() => null)) as
      | { success?: boolean; hostname?: string; "error-codes"?: string[] }
      | null;
    if (!result?.success || !result.hostname || !ALLOWED_HOSTNAMES.has(result.hostname)) {
      return { ok: false, message: "La verificación no fue válida. Inténtalo de nuevo." };
    }
    const session = await issueTurnstileSession();
    setCookie(TURNSTILE_SESSION_COOKIE, session, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: TURNSTILE_SESSION_SECONDS,
    });
    return { ok: true, message: "Verificación completada." };
  });
