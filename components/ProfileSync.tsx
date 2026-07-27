"use client";
// Bridges the local store and the account backend:
//  - on login, load the saved plan (or, if none yet, push the current local plan up)
//  - while signed in, debounce-save state changes to Supabase
// Renders nothing. Inert when Supabase isn't configured.
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

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

  // Load-on-login (once per user).
  useEffect(() => {
    if (!supabase || !user || !ready) return;
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    canSave.current = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("profile")
        .eq("id", user.id)
        .maybeSingle();
      const remote = data?.profile as Record<string, unknown> | null | undefined;
      if (remote && Object.keys(remote).length > 0) {
        hydrateRemote(remote as any); // returning user → restore their saved plan
      } else {
        // first time on this account → keep any plan they built before signing up
        await supabase.from("profiles").update({ profile: s, updated_at: new Date().toISOString() }).eq("id", user.id);
      }
      canSave.current = true;
    })();
  }, [user, ready, s, hydrateRemote]);

  // Reset the guard on logout.
  useEffect(() => {
    if (!user) { loadedFor.current = null; canSave.current = false; }
  }, [user]);

  // Debounced save while signed in.
  useEffect(() => {
    if (!supabase || !user || !ready || !canSave.current) return;
    const t = setTimeout(() => {
      supabase!
        .from("profiles")
        .update({ profile: s, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }, 1200);
    return () => clearTimeout(t);
  }, [s, user, ready]);

  return null;
}
