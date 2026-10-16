type SecurityDb = {
  prepare: (sql: string) => {
    bind: (...values: unknown[]) => {
      first: <T>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
  };
};
type FirewallEnv = {
  DB?: SecurityDb;
  TURNSTILE_SECRET_KEY?: string;
  ESTUDIAX_EMERGENCY_LOCKDOWN?: string;
};

const BLOCK_SECONDS = 30 * 60;
const SIGNAL_WINDOW_SECONDS = 10 * 60;
const SIGNAL_THRESHOLD = 3;
let cleanupCounter = 0;

function emergencyPage(reason: "manual" | "blocked" | "probe", status = 503) {
  const message = reason === "manual"
    ? "ESTUDIAX está temporalmente fuera de servicio mientras se realiza una revisión de seguridad."
    : reason === "blocked"
      ? "El acceso desde esta conexión se ha bloqueado temporalmente tras detectar actividad potencialmente maliciosa."
      : "La solicitud fue bloqueada porque coincide con un patrón común de sondeo o ataque. No se ejecutó el contenido enviado.";
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ESTUDIAX · Control de daños</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#0b0b0e;color:#f9fafb;font:16px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.card{max-width:640px;width:100%;text-align:center}.brand{font-size:13px;letter-spacing:.16em;color:#a1a1aa;font-weight:750}.cross{width:min(48vw,210px);height:min(48vw,210px);margin:24px auto;display:block}.cross circle{fill:#210b0d;stroke:#7f1d1d;stroke-width:3}.cross path{stroke:#ef4444;stroke-width:17;stroke-linecap:round}h1{font-size:clamp(25px,5vw,38px);line-height:1.1;margin:0 0 16px;color:#fca5a5}p{color:#d4d4d8;margin:0 auto 14px;max-width:52ch}.note{margin-top:24px;padding:16px;border:1px solid #3f3f46;border-radius:14px;color:#a1a1aa;font-size:13px}a{color:#fca5a5}</style></head><body><main class="card"><div class="brand">ESTUDIAX · CONTROL DE DAÑOS</div><svg class="cross" viewBox="0 0 180 180" role="img" aria-label="X roja: acceso bloqueado"><circle cx="90" cy="90" r="76"/><path d="M54 54 126 126M126 54 54 126"/></svg><h1>ACCESO BLOQUEADO</h1><p>${message}</p><p>Si sospechas que tu dispositivo está comprometido, consulta con el antivirus que tienes instalado y revisa sus alertas antes de volver a intentarlo.</p><div class="note">Este bloqueo protege el servicio. No confirma que tu dispositivo tenga un virus ni sustituye el análisis de tu antivirus.</div></main></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
}

function isStaticAsset(pathname: string) {
  return /\.(?:avif|css|gif|ico|jpe?g|js|map|mjs|png|svg|webmanifest|webp|woff2?)$/i.test(pathname);
}

function suspiciousPath(pathname: string, method: string): "secret-file-probe" | "path-traversal" | "script-exploit-probe" | null {
  if (["TRACE", "CONNECT", "TRACK"].includes(method.toUpperCase())) return "script-exploit-probe";
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch { return "path-traversal"; }
  const normalized = decoded.toLowerCase().replace(/\\/g, "/");
  if (/(^|\/)(?:\.env(?:\.[^/]*)?|\.git(?:\/.*)?|id_rsa|wp-config\.php|config\.php\.bak)(?:\/|$)/i.test(normalized)) return "secret-file-probe";
  if (normalized.includes("../") || normalized.includes("%00") || normalized.includes("\0")) return "path-traversal";
  if (/(^|\/)(?:wp-admin|wp-login\.php|phpmyadmin|vendor\/phpunit|cgi-bin|actuator\/env|server-status)(\/|$)/i.test(normalized)) return "script-exploit-probe";
  return null;
}

async function hashIp(ip: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`estudiax-firewall-ip-v1:${ip}`)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

/** App-layer defense in depth. Cloudflare's edge WAF is still required for volumetric DDoS. */
export async function inspectRequestForThreat(request: Request, rawEnv: unknown): Promise<Response | null> {
  const env = (rawEnv && typeof rawEnv === "object" ? rawEnv : {}) as FirewallEnv;
  if (env.ESTUDIAX_EMERGENCY_LOCKDOWN?.trim().toLowerCase() === "true") {
    if (new URL(request.url).pathname.startsWith("/api/")) {
      return Response.json({ error: "ESTUDIAX está temporalmente en modo de emergencia." }, { status: 503, headers: { "cache-control": "no-store", "retry-after": "300" } });
    }
    return emergencyPage("manual", 503);
  }

  const url = new URL(request.url);
  if (isStaticAsset(url.pathname)) return null;
  const ip = request.headers.get("cf-connecting-ip");
  const secret = typeof env.TURNSTILE_SECRET_KEY === "string" ? env.TURNSTILE_SECRET_KEY.trim() : "";
  const db = env.DB;
  let ipHash = "";

  // Only consult persistent blocks when both the trusted edge IP and signing secret exist.
  if (db && secret && ip) {
    try {
      ipHash = await hashIp(ip, secret);
      const activeBlock = await db.prepare("SELECT expires_at FROM security_ip_blocks WHERE ip_hash = ? AND expires_at > ?")
        .bind(ipHash, Math.floor(Date.now() / 1000)).first<{ expires_at: number }>();
      if (activeBlock) return emergencyPage("blocked", 403);
    } catch (error) {
      // Fail open for ordinary traffic if the security store is unavailable.
      console.error("ESTUDIAX firewall store unavailable", error instanceof Error ? error.name : "unknown");
    }
  }

  const signal = suspiciousPath(url.pathname, request.method);
  if (!signal) return null;
  console.warn("ESTUDIAX firewall blocked suspicious request", signal);

  if (db && secret && ip && ipHash) {
    const now = Math.floor(Date.now() / 1000);
    const bucket = Math.floor(now / SIGNAL_WINDOW_SECONDS);
    try {
      const row = await db.prepare(`
        INSERT INTO security_signals (ip_hash, window_bucket, signal_count, last_signal, updated_at)
        VALUES (?, ?, 1, ?, ?)
        ON CONFLICT(ip_hash) DO UPDATE SET
          signal_count = CASE WHEN security_signals.window_bucket = excluded.window_bucket THEN security_signals.signal_count + 1 ELSE 1 END,
          window_bucket = excluded.window_bucket,
          last_signal = excluded.last_signal,
          updated_at = excluded.updated_at
        RETURNING signal_count
      `).bind(ipHash, bucket, signal, now).first<{ signal_count: number }>();
      if ((row?.signal_count ?? 0) >= SIGNAL_THRESHOLD) {
        await db.prepare(`INSERT INTO security_ip_blocks (ip_hash, reason_code, expires_at, created_at)
          VALUES (?, 'repeated-high-confidence-probes', ?, ?)
          ON CONFLICT(ip_hash) DO UPDATE SET reason_code = excluded.reason_code, expires_at = excluded.expires_at, created_at = excluded.created_at`)
          .bind(ipHash, now + BLOCK_SECONDS, now).run();
        return emergencyPage("blocked", 403);
      }
      cleanupCounter++;
      if (cleanupCounter >= 100) {
        cleanupCounter = 0;
        await db.prepare("DELETE FROM security_ip_blocks WHERE expires_at <= ?").bind(now).run();
        await db.prepare("DELETE FROM security_signals WHERE updated_at < ?").bind(now - 24 * 60 * 60).run();
      }
    } catch (error) {
      console.error("ESTUDIAX firewall signal persistence failed", error instanceof Error ? error.name : "unknown");
    }
  }
  return emergencyPage("probe", 403);
}
