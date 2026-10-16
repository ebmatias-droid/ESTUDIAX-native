import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../../lib/bindings.server";
import { enforcePersistentRateLimit, RateLimitExceededError } from "../../../lib/security-rate-limit.server";

let reportsSinceCleanup = 0;

export const Route = createFileRoute("/api/security/csp-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        if (url.protocol !== "https:" || url.origin !== "https://estudiax.higgsfield.app") return new Response(null, { status: 403 });
        const contentLength = Number(request.headers.get("content-length") || 0);
        if (contentLength > 16_384) return new Response(null, { status: 413 });
        try { await enforcePersistentRateLimit("csp-report", 20, 200); }
        catch (error) {
          if (error instanceof RateLimitExceededError) return new Response(null, { status: 429 });
          // Reporting is telemetry only; a limiter outage must not affect site availability.
          return new Response(null, { status: 204 });
        }
        let raw = "";
        try {
          if (!request.body) return new Response(null, { status: 400 });
          const reader = request.body.getReader();
          const chunks: Uint8Array[] = [];
          let total = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > 16_384) { await reader.cancel(); return new Response(null, { status: 413 }); }
            chunks.push(value);
          }
          const bytes = new Uint8Array(total);
          let offset = 0;
          for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
          raw = new TextDecoder().decode(bytes);
        } catch { return new Response(null, { status: 400 }); }
        let body: unknown;
        try { body = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }
        const root = body && typeof body === "object" ? body as Record<string, unknown> : {};
        const report = (root["csp-report"] && typeof root["csp-report"] === "object" ? root["csp-report"] : root) as Record<string, unknown>;
        const rawDirective = typeof report["violated-directive"] === "string" ? report["violated-directive"] : typeof report["effectiveDirective"] === "string" ? report["effectiveDirective"] : "unknown";
        const directive = rawDirective.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "unknown";
        const rawBlocked = typeof report["blocked-uri"] === "string" ? report["blocked-uri"] : typeof report["blockedURL"] === "string" ? report["blockedURL"] : "unknown";
        const blockedClass = rawBlocked === "inline" || rawBlocked === "eval" || rawBlocked === "data" ? rawBlocked : rawBlocked === "self" ? "self" : /^https?:\/\//i.test(rawBlocked) ? "external" : "unknown";
        // Reports are untrusted client telemetry: sanitize them and never let them trigger lockdown.
        console.warn("ESTUDIAX CSP report", { directive, blockedClass });
        const env = bindings() as { DB?: { prepare: (sql: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown> } } } };
        if (env.DB) {
          const now = Math.floor(Date.now() / 1000);
          try {
            await env.DB.prepare("INSERT INTO security_events (event_type, detail_code, created_at) VALUES (?, ?, ?)").bind("csp-violation", `${directive}:${blockedClass}`.slice(0, 100), now).run();
            reportsSinceCleanup++;
            if (reportsSinceCleanup >= 100) {
              reportsSinceCleanup = 0;
              await env.DB.prepare("DELETE FROM security_events WHERE created_at < ?").bind(now - 7 * 24 * 60 * 60).run();
            }
          } catch { /* Telemetry storage must not affect application availability. */ }
        }
        return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
