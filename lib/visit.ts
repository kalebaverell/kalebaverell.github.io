// Return-visit ledger: one row per signed-in user per local calendar day
// (UTC days before Oct 2026). Recurring-usage evidence comes from counting
// these rows - return rates are computed, never asserted. A localStorage guard
// keeps it to one write attempt per browser per day; the table's primary key
// makes any repeat a no-op anyway. Only page loads and real sign-ins call this
// (lib/auth.tsx), never background token refreshes.
import { supabase } from "./supabase";

const GUARD = "vp_visit_stamp";

export function stampVisit(userId: string): void {
  if (typeof window === "undefined" || !supabase) return;
  // The person's own calendar day. A UTC day ends in the early evening across
  // the continental US (7 pm Central in summer), so one evening session used to
  // log two "days" and read as a return visit.
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const mark = `${userId}:${today}`;
  try {
    if (localStorage.getItem(GUARD) === mark) return;
  } catch {
    /* storage blocked - the upsert below is still safe */
  }
  supabase
    .from("visit_days")
    .upsert({ user_id: userId, day: today }, { onConflict: "user_id,day", ignoreDuplicates: true })
    .then(({ error }) => {
      if (!error) {
        try { localStorage.setItem(GUARD, mark); } catch { /* fine */ }
      }
    });
}
