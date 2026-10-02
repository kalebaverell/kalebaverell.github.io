// VetPath self-serve account deletion (Oct 2026).
// Called from the profile page via supabase.functions.invoke, so the request
// carries the signed-in user's JWT; verify_jwt is ON, so the platform rejects
// anything else before this code runs. The caller is resolved from that JWT,
// never from the request body - a user can only ever delete themselves.
//   1. feedback rows: deleted explicitly. Until migration
//      20261002140000_feedback_user_fk_and_insert_check.sql is applied they
//      have no foreign key to auth.users, so nothing would cascade them; after
//      it, the cascade covers them too and this delete is belt-and-braces.
//   2. the auth user: ON DELETE CASCADE removes profiles, journal_entries,
//      visit_days and email_log with it (pg_constraint, checked 2026-10-02).
//   3. proof: re-count every user table for this id; anything left is an
//      error, never a silent success.
// A new table holding a user id needs ON DELETE CASCADE to auth.users or an
// explicit delete here - and a row in CHECK either way.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const H = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json" };

const SITE = "https://vetpathusa.com";
const ORIGINS = new Set([SITE, "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]);
const CHECK: [string, string][] = [
  ["profiles", "id"],
  ["journal_entries", "user_id"],
  ["visit_days", "user_id"],
  ["email_log", "user_id"],
  ["feedback", "user_id"],
];

function cors(req: Request): Record<string, string> {
  const o = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.has(o) ? o : SITE,
    // Exactly the headers supabase-js sends (its own /cors export, v2.110).
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const c = cors(req);
  const reply = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: c });
  if (req.method === "OPTIONS") return new Response("ok", { headers: c });
  if (req.method !== "POST") return reply({ error: "method_not_allowed" }, 405);

  // Who is asking - from their own token.
  const who = await fetch(`${URL_}/auth/v1/user`, {
    headers: { apikey: ANON, Authorization: req.headers.get("Authorization") || "" },
  });
  if (!who.ok) return reply({ error: "not_signed_in" }, 401);
  const uid = String(((await who.json()) as { id?: unknown }).id || "");
  if (!/^[0-9a-f-]{36}$/i.test(uid)) return reply({ error: "not_signed_in" }, 401);

  // 1. Feedback notes linked to this account (explicit, whether or not the FK cascade exists).
  const fb = await fetch(`${URL_}/rest/v1/feedback?user_id=eq.${uid}`, {
    method: "DELETE",
    headers: { ...H, Prefer: "return=minimal" },
  });
  if (!fb.ok) return reply({ error: "feedback_delete_failed" }, 500);

  // 2. The login itself (same endpoint auth-js admin.deleteUser calls).
  const del = await fetch(`${URL_}/auth/v1/admin/users/${uid}`, {
    method: "DELETE",
    headers: H,
    body: JSON.stringify({ should_soft_delete: false }),
  });
  if (!del.ok) return reply({ error: "login_delete_failed" }, 500);

  // 3. Prove it: nothing left under this id anywhere.
  const left: string[] = [];
  for (const [table, col] of CHECK) {
    const r = await fetch(`${URL_}/rest/v1/${table}?${col}=eq.${uid}&select=${col}`, {
      method: "HEAD",
      headers: { ...H, Prefer: "count=exact" },
    });
    const total = Number((r.headers.get("content-range") || "").split("/")[1]);
    if (!r.ok || !Number.isFinite(total) || total > 0) left.push(table);
  }
  if (left.length) {
    console.error("delete-account: rows left in", left.join(",")); // table names only, no ids
    return reply({ error: "leftovers" }, 500);
  }
  return reply({ deleted: true });
});
