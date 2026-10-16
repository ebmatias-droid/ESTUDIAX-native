import { createFileRoute } from "@tanstack/react-router";
import { cookieValue, decryptTokens, encryptTokens, googleEnv, jsonError, USER_COOKIE } from "../../../../lib/google-oauth.server";
import { hasValidTurnstileSession } from "../../../../lib/api/turnstile-session.server";
import { enforcePersistentRateLimit, RateLimitExceededError } from "../../../../lib/security-rate-limit.server";

type StoredTokens = { access_token?: string; refresh_token?: string; expires_in?: number; token_type?: string; scope?: string };
type DriveFile = { id?: string; name?: string; webViewLink?: string };
const noStore = { "Cache-Control": "no-store" };
export const Route = createFileRoute("/api/google/drive/status")({
  server: { handlers: {
    GET: async ({ request }) => {
      const config = googleEnv();
      if (!config.db) return jsonError("La base de datos D1 no está disponible.", 503);
      const userId = cookieValue(request, USER_COOKIE);
      if (!/^[A-Za-z0-9_-]{40,50}$/.test(userId)) return Response.json({ connected: false }, { headers: noStore });
      const row = await config.db.prepare("SELECT email, granted_scope, token_expires_at, updated_at FROM google_drive_connections WHERE user_id = ?")
        .bind(userId).first<{ email: string | null; granted_scope: string; token_expires_at: number | null; updated_at: number }>();
      return Response.json(row ? { connected: true, email: row.email, scopes: row.granted_scope, tokenExpiresAt: row.token_expires_at, connectedAt: row.updated_at } : { connected: false }, { headers: noStore });
    },
    POST: async ({ request }) => {
      const url = new URL(request.url);
      if (request.headers.get("Origin") !== url.origin || url.protocol !== "https:") return jsonError("Origen no permitido.", 403);
      if (!(await hasValidTurnstileSession())) return jsonError("Completa la verificación de seguridad antes de guardar un respaldo.", 403);
      try { await enforcePersistentRateLimit("drive-backup", 3, 20); } catch (error) {
        if (error instanceof RateLimitExceededError) return jsonError("Demasiadas solicitudes de respaldo. Espera antes de volver a intentarlo.", 429);
        return jsonError("El control de seguridad no está disponible temporalmente.", 503);
      }
      const config = googleEnv();
      if (!config.db || !config.clientId || !config.clientSecret || !config.encryptionKey) return jsonError("La integración de Google Drive no está configurada por completo.", 503);
      const userId = cookieValue(request, USER_COOKIE);
      if (!/^[A-Za-z0-9_-]{40,50}$/.test(userId)) return jsonError("Sesión de ESTUDIAX no válida. Recarga la página y vuelve a conectar Google Drive.", 401);
      const row = await config.db.prepare("SELECT encrypted_tokens, granted_scope, token_expires_at FROM google_drive_connections WHERE user_id = ?").bind(userId).first<{encrypted_tokens:string;granted_scope:string;token_expires_at:number|null}>();
      if (!row) return jsonError("Primero conecta tu cuenta de Google Drive.", 401);
      if (!row.granted_scope.split(/\s+/).includes("https://www.googleapis.com/auth/drive.file")) return jsonError("La autorización no incluye permiso para archivos de ESTUDIAX. Desconecta y vuelve a conectar Google Drive.", 403);
      const contentLength = Number(request.headers.get("content-length") || 0);
      if (contentLength > 8_500_000) return jsonError("El archivo supera el límite de 8 MB.", 413);
      let body: { content?: unknown };
      try {
        if (!request.body) return jsonError("Solicitud vacía.", 400);
        const reader = request.body.getReader();
        const chunks: Uint8Array[] = [];
        let total = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          total += value.byteLength;
          if (total > 8_500_000) {
            await reader.cancel();
            return jsonError("El archivo supera el límite de 8 MB.", 413);
          }
          chunks.push(value);
        }
        const bytes = new Uint8Array(total);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
        body = JSON.parse(new TextDecoder().decode(bytes)) as { content?: unknown };
      } catch { return jsonError("Solicitud JSON no válida.", 400); }
      if (typeof body.content !== "string" || body.content.length < 20 || body.content.length > 8_000_000) return jsonError("El archivo cifrado no es válido o supera el límite de 8 MB.",400);
      try {
        const backup = JSON.parse(body.content) as {format?:string;version?:number;cipher?:string;data?:string};
        if (backup.format !== "estudiax-encrypted-backup" || backup.version !== 1 || backup.cipher !== "AES-256-GCM" || typeof backup.data !== "string") return jsonError("Solo se aceptan respaldos ESTUDIAX cifrados.",400);
      } catch { return jsonError("El archivo cifrado no tiene un formato válido.",400); }
      let tokens: StoredTokens = await decryptTokens(config.encryptionKey, row.encrypted_tokens);
      const now = Math.floor(Date.now()/1000);
      if (!tokens.access_token || !tokens.refresh_token) return jsonError("La autorización de Google caducó. Desconecta y vuelve a conectar Drive.",401);
      if (!row.token_expires_at || row.token_expires_at <= now + 90) {
        const refreshedResponse = await fetch("https://oauth2.googleapis.com/token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({client_id:config.clientId,client_secret:config.clientSecret,refresh_token:tokens.refresh_token,grant_type:"refresh_token"}) });
        const refreshed = await refreshedResponse.json().catch(()=>({})) as StoredTokens & {error?:string};
        if (!refreshedResponse.ok || !refreshed.access_token) return jsonError("No se pudo renovar la autorización de Google. Desconecta y vuelve a conectar Drive.",401);
        tokens = {...tokens,...refreshed,refresh_token:tokens.refresh_token};
        await config.db.prepare("UPDATE google_drive_connections SET encrypted_tokens=?, token_expires_at=?, updated_at=? WHERE user_id=?").bind(await encryptTokens(config.encryptionKey,tokens),now+(refreshed.expires_in||3600),now,userId).run();
      }
      const auth = {Authorization:`Bearer ${tokens.access_token}`};
      const listUrl = new URL("https://www.googleapis.com/drive/v3/files");
      listUrl.searchParams.set("q", "name = 'estudiax-backup.estudiax' and trashed = false");
      listUrl.searchParams.set("spaces","drive"); listUrl.searchParams.set("pageSize","10"); listUrl.searchParams.set("fields","files(id,name,webViewLink)");
      const listed = await fetch(listUrl.toString(),{headers:auth});
      const listing = await listed.json().catch(()=>({})) as {files?:DriveFile[]};
      if (!listed.ok) return jsonError("Google Drive no pudo consultar los archivos de ESTUDIAX.",502);
      const existing = listing.files?.[0];
      const boundary = `estudiax_${crypto.randomUUID().replace(/-/g,"")}`;
      const metadata = JSON.stringify({name:"estudiax-backup.estudiax",mimeType:"application/json",description:"Copia de seguridad ESTUDIAX cifrada en el dispositivo del usuario."});
      const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body.content}\r\n--${boundary}--`;
      const endpoint = existing?.id ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existing.id)}?uploadType=multipart&fields=id,name,webViewLink` : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink";
      const uploaded = await fetch(endpoint,{method:existing?.id?"PATCH":"POST",headers:{...auth,"Content-Type":`multipart/related; boundary=${boundary}`},body:multipart});
      const result = await uploaded.json().catch(()=>({})) as DriveFile & {error?:{message?:string}};
      if (!uploaded.ok || !result.id) return jsonError("Google Drive rechazó el respaldo. Revisa la conexión y vuelve a intentarlo.",502);
      return Response.json({ok:true,name:result.name||"estudiax-backup.estudiax",url:result.webViewLink||null,updated:now},{headers:noStore});
    },
  } },
});
