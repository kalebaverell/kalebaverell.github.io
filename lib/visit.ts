// Return-visit ledger: one row per signed-in user per UTC day. Recurring-usage
// evidence comes from counting these rows - return rates are computed, never
// asserted. A localStorage guard keeps it to one write attempt per browser per
// day; the table's primary key makes any repeat a no-op anyway.
import { supabase } from "./supabase";

const GUARD = "vp_visit_stamp";

export function stampVisit(userId: string): void {
  if (typeof window === "undefined" || !supabase) return;
  const today = new Date().toISOString().slice(0, 10);
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
