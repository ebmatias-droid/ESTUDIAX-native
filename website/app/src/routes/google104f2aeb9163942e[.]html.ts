import { createFileRoute } from "@tanstack/react-router";

// Google Search Console verification endpoint. Keep the body exactly as issued
// by Google; this public endpoint intentionally does not require Turnstile.
export const Route = createFileRoute("/google104f2aeb9163942e.html")({
  server: {
    handlers: {
      GET: async () => new Response("google-site-verification: google104f2aeb9163942e.html", {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "X-Robots-Tag": "noindex",
        },
      }),
      HEAD: async () => new Response(null, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "X-Robots-Tag": "noindex",
        },
      }),
    },
  },
});
