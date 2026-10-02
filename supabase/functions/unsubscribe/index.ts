// One-click unsubscribe, v2. Email links now land on vetpathusa.com/unsubscribe/
// (a real page). Functions can't serve HTML - the platform rewrites it to
// text/plain, which is how v1's confirmation showed raw markup. GET only
// redirects to that page, so mail scanners that pre-open links change nothing;
// the page's button POSTs here. The per-user random token IS the capability.
// Flips both email preferences off and clears marketing_opt_in, so the link stops
// every non-account email (check-ins, verification notes, and any product news
// keyed on the signup opt-in). Nothing else changes.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE = "https://vetpathusa.com";
const ORIGINS = new Set([SITE, "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]);
const TOKEN = /^[0-9a-f-]{36}$/i;

function cors(req: Request): Record<string, string> {
  const o = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.has(o) ? o : SITE,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const c = cors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: c });
  if (req.method === "GET") {
    // Links in emails sent before v2 still point here: hand them to the page.
    const t = new URL(req.url).searchParams.get("token") || "";
    const dest = TOKEN.test(t) ? `${SITE}/unsubscribe/?token=${t}` : `${SITE}/unsubscribe/`;
    return new Response(null, { status: 303, headers: { Location: dest } });
  }
  if (req.method !== "POST") return Response.json({ ok: false }, { status: 405, headers: c });
  let token = "";
  try { token = String(((await req.json()) as { token?: unknown }).token || ""); } catch { /* bad body */ }
  if (!TOKEN.test(token)) return Response.json({ ok: false }, { headers: c });
  const res = await fetch(`${URL_}/rest/v1/profiles?unsub_token=eq.${token}&select=id`, {
    method: "PATCH",
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ prefs: { tminus: false, verification: false }, marketing_opt_in: false }),
  });
  const rows = res.ok ? await res.json() : [];
  return Response.json({ ok: Array.isArray(rows) && rows.length > 0 }, { headers: c });
});
