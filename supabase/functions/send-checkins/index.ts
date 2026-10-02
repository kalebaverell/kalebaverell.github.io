// VetPath Return Loop - check-in sender (Phase 3).
// Invoked weekly by pg_cron. Idempotent: the email_log unique constraint means a
// (user, kind, period) can only ever send once, so repeated or stray invocations
// are harmless. Key delivery: RESEND_API_KEY env var if set, else the Supabase
// Vault secret of the same name (service-role-only getter). Dormant until one
// of those holds a real key. Tone contract: encourage, never shame.
// v3: site links carry utm_source/utm_campaign so email-driven return visits
// are attributable in GoatCounter (its default campaign params cover these).
// v4 (Oct 2026): Oct 1 refresh figures (50 states + D.C., not 51); SkillBridge and
// Tuition Assistance links moved. Update VERIFIED in the same sitting as every refresh.
// v5 (Oct 2026): the Unsubscribe link lands on the vetpathusa.com/unsubscribe/ page
// (unsubscribe v2), the verification email links the public /verification record,
// and the p3 BDD line starts with a free accredited representative. Deploy only
// after /unsubscribe/ and /verification/ are live on the site.
// Source of truth: supabase/functions/send-checkins/index.ts in the repo.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM = Deno.env.get("RESEND_FROM") || "VetPath <plans@vetpathusa.com>";
const SITE = "https://vetpathusa.com";
// Real, repo-cited figures - update alongside the quarterly data re-verification.
// Mirrors data/verificationLog.json's latest run - update in the same sitting as each refresh.
const VERIFIED = { states: "all 50 states and D.C.", programs: "264 state benefit programs", label: "October 2026" };

const H = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json" };

const utm = (path: string, campaign: string) => `${SITE}${path}?utm_source=vetpath-email&utm_campaign=${campaign}`;

async function resolveKey(): Promise<{ key: string; source: string }> {
  const env = Deno.env.get("RESEND_API_KEY") || "";
  if (env) return { key: env, source: "env" };
  try {
    const r = await fetch(`${URL_}/rest/v1/rpc/get_resend_key`, { method: "POST", headers: H, body: "{}" });
    if (r.ok) {
      const v = (await r.json()) as string | null;
      if (v && v.startsWith("re_")) return { key: v, source: "vault" };
    }
  } catch { /* fall through to dormant */ }
  return { key: "", source: "none" };
}

interface Row {
  id: string; email: string | null; full_name: string | null;
  prefs: { tminus?: boolean; verification?: boolean } | null;
  unsub_token: string; created_at: string; profile: any;
}

function monthsToEas(eas: string, now = new Date()): number | null {
  if (!/^\d{4}-\d{2}$/.test(eas)) return null;
  const [y, mo] = eas.split("-").map(Number);
  if (mo < 1 || mo > 12) return null;
  return (new Date(y, mo - 1, 15).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

type Item = { t: string; url: string };
const PHASES: Record<string, { key: string; label: string; items: Item[] }> = {
  runway: { key: "runway", label: "the long runway", items: [
    { t: "The Post-9/11 GI Bill transfer to a spouse or child can only be elected while you're still serving - the earlier the conversation, the more options stay open.", url: "https://www.va.gov/education/transfer-post-9-11-gi-bill-benefits/" },
    { t: "Tuition Assistance works while you serve - chip away at the credential before the GI Bill ever comes out.", url: "https://www.militaryonesource.mil/education-employment/for-service-members/money-for-higher-education/" },
  ]},
  approach: { key: "approach", label: "the approach (1-2 years out)", items: [
    { t: "Get familiar with the Transition Assistance Program now - scheduling it early beats squeezing it in.", url: "https://www.dodtap.mil/" },
    { t: "Keep collecting your medical record - every documented visit matters later.", url: "https://milconnect.dmdc.osd.mil/" },
  ]},
  p1: { key: "p1", label: "early planning (T-12 to T-9)", items: [
    { t: "Create your VA.gov account - nearly every benefit starts there.", url: "https://www.va.gov/" },
    { t: "Connect with an accredited VSO - their help is free, always.", url: "https://www.va.gov/get-help-from-accredited-representative/find-rep/" },
  ]},
  p2: { key: "p2", label: "TAP & research (T-9 to T-6)", items: [
    { t: "Complete the Transition Assistance Program.", url: "https://www.dodtap.mil/" },
    { t: "If SkillBridge interests you, raise it with your command now - it needs approval lead time.", url: "https://www.skillbridge.mil/" },
  ]},
  p3: { key: "p3", label: "applications (T-6 to T-3)", items: [
    { t: "Filing a disability claim? Talk to a free accredited representative first - the Benefits Delivery at Discharge window is 180 to 90 days before separation.", url: "https://www.va.gov/disability/how-to-file-claim/when-to-file/pre-discharge-claim/" },
    { t: "Line up your next address - housing and BAH end at separation.", url: "https://www.va.gov/housing-assistance/" },
  ]},
  p4: { key: "p4", label: "final out (T-3 to separation)", items: [
    { t: "Safeguard your DD-214 and full records the day you get them.", url: "https://milconnect.dmdc.osd.mil/" },
    { t: "Know your SGLI-to-VGLI life insurance window before it starts counting.", url: "https://www.va.gov/life-insurance/" },
  ]},
  p5: { key: "p5", label: "landing (first 6 months out)", items: [
    { t: "Apply for VA health care and pick a facility near home.", url: "https://www.va.gov/health-care/" },
    { t: "An Intent to File preserves your claim's effective date while you build it properly.", url: "https://www.va.gov/resources/your-intent-to-file-a-va-claim/" },
  ]},
};

function phaseFor(m: number): string | null {
  if (m > 24) return "runway";
  if (m > 12) return "approach";
  if (m > 9) return "p1";
  if (m > 6) return "p2";
  if (m > 3) return "p3";
  if (m > 0) return "p4";
  if (m > -6) return "p5";
  return null;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function shell(name: string, bodyHtml: string, unsub: string, campaign: string): string {
  return `<div style=\"font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2A362C\">\n  <div style=\"background:#073D30;color:#FBFAF7;padding:18px 24px;border-radius:12px 12px 0 0;font-size:18px\">VetPath</div>\n  <div style=\"border:1px solid #E6DFD1;border-top:none;border-radius:0 0 12px 12px;padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6\">\n    <p style=\"margin:0 0 12px\">${name ? esc(name) + "," : "Hey,"}</p>\n    ${bodyHtml}\n    <p style=\"margin:18px 0 0\"><a href=\"${utm("/dashboard/", campaign)}\" style=\"color:#0F6E56;font-weight:bold\">Open your gameplan &rarr;</a></p>\n  </div>\n  <p style=\"font-family:Arial,sans-serif;font-size:12px;color:#6E7A6F;padding:14px 6px\">You're getting this because you opted in at vetpathusa.com. Reply anytime - a person reads it. VetPath is a planning tool, not the VA. Verify every benefit at its official source.<br><a href=\"${unsub}\" style=\"color:#6E7A6F\">Unsubscribe</a></p>\n</div>`;
}

function itemsHtml(items: Item[]): string {
  return `<ul style=\"margin:12px 0;padding-left:20px\">${items.map((i) => `<li style=\"margin-bottom:10px\">${esc(i.t)} <a href=\"${i.url}\" style=\"color:#0F6E56\">Official source</a></li>`).join("")}</ul>`;
}

Deno.serve(async (req: Request) => {
  const { key: RESEND, source: keySource } = await resolveKey();
  const dry = !RESEND;
  const res = await fetch(`${URL_}/rest/v1/profiles?select=id,email,full_name,prefs,unsub_token,created_at,profile`, { headers: H });
  if (!res.ok) return Response.json({ error: "profiles query failed" }, { status: 500 });
  const rows: Row[] = await res.json();
  const now = new Date();
  const quarter = `${now.getFullYear()}Q${Math.floor(now.getMonth() / 3) + 1}`;
  let candidates = 0, sent = 0, skipped = 0, errors = 0;

  for (const r of rows) {
    if (!r.email) continue;
    const prefs = r.prefs || {};
    // v5: the site page reads the token and POSTs it to the unsubscribe function
    // on a button press, so a mail scanner pre-opening the link changes nothing.
    const unsub = `${SITE}/unsubscribe/?token=${r.unsub_token}`;
    const name = (r.full_name || "").split(" ")[0];
    let kind = "", period = "", subject = "", html = "";

    const eas = r.profile?.answers?.easDate as string | undefined;
    const m = eas ? monthsToEas(eas) : null;
    if (prefs.tminus && m != null) {
      const ph = phaseFor(m);
      if (ph) {
        kind = "tminus"; period = ph;
        const p = PHASES[ph];
        subject = `You just entered ${p.label} - two things matter this stretch`;
        html = shell(name, `<p style=\"margin:0 0 4px\">By the date you gave, you're in <strong>${esc(p.label)}</strong>. Two things carry this stretch:</p>${itemsHtml(p.items)}`, unsub, "tminus");
      }
    } else if (prefs.tminus) {
      const days = Math.floor((now.getTime() - new Date(r.created_at).getTime()) / 86400000);
      const doneCount = r.profile?.statuses ? Object.values(r.profile.statuses).filter((s) => s === "done").length : 0;
      const w = days >= 90 ? `wq${Math.floor(days / 90)}` : days >= 60 ? "w60" : days >= 30 ? "w30" : "";
      if (w) {
        kind = "window"; period = w;
        subject = doneCount > 0 ? `${doneCount} action${doneCount === 1 ? "" : "s"} down - a quick check-in` : "A quick check-in on your gameplan";
        const lead = doneCount > 0
          ? `<p style=\"margin:0\">You've checked off <strong>${doneCount} action${doneCount === 1 ? "" : "s"}</strong> so far - steady counts.</p>`
          : `<p style=\"margin:0\">Your gameplan is sitting ready. One small action this week - even ten minutes - is how the whole thing moves.</p>`;
        html = shell(name, `${lead}<p style=\"margin:12px 0 0\">And if anything changed - rating, family, state, job - <a href=\"${utm("/updates/", "window")}\" style=\"color:#0F6E56\">your plan re-routes in about a minute</a>.</p>`, unsub, "window");
      }
    }

    if (!kind && prefs.verification) {
      kind = "verification"; period = quarter;
      subject = "Your plan's numbers were re-checked";
      html = shell(name, `<p style=\"margin:0\">Quiet update: VetPath re-verifies its data against official sources on a quarterly rhythm - ${VERIFIED.states} and ${VERIFIED.programs}, each linked to the agency that runs it. Your state's data was last verified <strong>${VERIFIED.label}</strong>.</p><p style=\"margin:12px 0 0\"><a href=\"${utm("/verification/", "verification")}\" style=\"color:#0F6E56\">See what we checked and every fix we made</a>.</p><p style=\"margin:12px 0 0\">Nothing you need to do - this note exists so you never have to wonder whether the plan under you is current.</p>`, unsub, "verification");
    }

    if (!kind) { skipped++; continue; }
    candidates++;
    if (dry) continue;

    // Log first (unique constraint = the send lock), send second, unlock on failure.
    const log = await fetch(`${URL_}/rest/v1/email_log`, { method: "POST", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify({ user_id: r.id, kind, period_key: period }) });
    if (log.status === 409) { skipped++; continue; }
    if (!log.ok) { errors++; continue; }
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [r.email], reply_to: "kaleb@vetpathusa.com", subject, html }),
    });
    if (send.ok) { sent++; }
    else {
      errors++;
      await fetch(`${URL_}/rest/v1/email_log?user_id=eq.${r.id}&kind=eq.${kind}&period_key=eq.${period}`, { method: "DELETE", headers: H });
    }
  }

  return Response.json({ configured: !dry, keySource, users: rows.length, candidates, sent, skipped, errors });
});
