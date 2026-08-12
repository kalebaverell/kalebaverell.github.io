"use client";
// Bridges the local store and the account backend:
//  - on login, load the saved plan (or, if none yet, push the current local plan up)
//  - while signed in, debounce-save state changes to Supabase
// Renders nothing. Inert when Supabase isn't configured.
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { readFirstTouch } from "@/lib/firstTouch";

export default function ProfileSync() {
  const { user } = useAuth();
  const { s, ready, hydrateRemote, ensureProfile } = useStore();
  const loadedFor = useRef<string | null>(null);
  const canSave = useRef(false);

  // A signed-in user already gave us their name + email at sign-up - fill the profile from the
  // account so the onboarding "create profile" gate never re-asks. Only runs when none is set.
  useEffect(() => {
    if (!user || !ready || s.profile) return;
    const meta = (user.user_metadata || {}) as Record<string, unknown>;
    const name = (typeof meta.full_name === "string" && meta.full_name) || user.email?.split("@")[0] || "Veteran";
    ensureProfile(name, user.email || "");
  }, [user, ready, s.profile, ensureProfile]);

  // Load-on-login (once per user). The rule that keeps this from ever losing
  // work: whichever side actually HAS a plan wins. A remote blob that exists
  // but holds no gameplan and no answers is just the empty shell written at
  // first sign-in, and it must never overwrite a local state with real data
  // in it. That exact clobber wiped a user's plan on 2026-08-04.
  useEffect(() => {
    if (!supabase || !user || !ready) return;
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    canSave.current = false;
    const local = s;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("profile,first_touch")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        // Write-once attribution: if this account has no first-touch record
        // yet and this device captured one (lib/firstTouch.ts), attach it.
        // Best-effort - a failure here must never block the plan sync below.
        if (data && data.first_touch == null) {
          const ft = readFirstTouch();
          if (ft) {
            try {
              await supabase.from("profiles").update({ first_touch: ft }).eq("id", user.id);
            } catch { /* attribution is never worth a failed sync */ }
          }
        }
        const remote = data?.profile as Record<string, any> | null | undefined;
        const hasPlan = (p: Record<string, any> | null | undefined) =>
          !!p && (p.gameplan != null || Object.keys(p.answers ?? {}).length > 0);
        if (hasPlan(remote)) {
          hydrateRemote(remote as any); // returning user → restore their saved plan
        } else if (hasPlan(local)) {
          // plan built before signing in (or remote is only the empty shell) → push local up
          const { error: upErr } = await supabase
            .from("profiles")
            .update({ profile: local, updated_at: new Date().toISOString() })
            .eq("id", user.id);
          if (upErr) throw upErr;
        }
        // neither side has a plan: nothing worth writing in either direction
      } catch (e) {
        console.warn("VetPath profile sync: load-on-login failed", e);
      } finally {
        canSave.current = true;
      }
    })();
  }, [user, ready, s, hydrateRemote]);

  // Reset the guard on logout.
  useEffect(() => {
    if (!user) { loadedFor.current = null; canSave.current = false; }
  }, [user]);

  // Debounced save while signed in. The builder MUST be awaited: supabase-js
  // queries are lazy thenables, and an un-awaited chain never sends a request.
  // That exact mistake made every save here a silent no-op until 2026-08-04.
  useEffect(() => {
    if (!supabase || !user || !ready || !canSave.current) return;
    const t = setTimeout(async () => {
      try {
        const { error } = await supabase!
          .from("profiles")
          .update({ profile: s, updated_at: new Date().toISOString() })
          .eq("id", user.id);
        if (error) throw error;
      } catch (e) {
        console.warn("VetPath profile sync: save failed", e);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [s, user, ready]);

  return null;
}
