"use client";
// Authentication context built on Supabase Auth. Supabase manages password
// hashing and session persistence server-side — we never store a raw password.
// When Supabase isn't configured, this provider is inert and the app stays local-only.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "./supabase";

interface SignUpOpts { fullName: string; marketingOptIn: boolean; }

interface AuthValue {
  enabled: boolean;
  ready: boolean;
  user: User | null;
  session: Session | null;
  authOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  signUp: (email: string, password: string, opts: SignUpOpts) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const Ctx = createContext<AuthValue | null>(null);

/** Make sure the user's profile row exists and carries their identity + consent. */
async function upsertIdentity(user: User) {
  if (!supabase) return;
  const meta = (user.user_metadata || {}) as Record<string, any>;
  const optIn = Boolean(meta.marketing_opt_in);
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: meta.full_name ?? null,
      marketing_opt_in: optIn,
      marketing_opt_in_at: optIn ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabaseEnabled);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) upsertIdentity(sess.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const signUp = useCallback(async (email: string, password: string, opts: SignUpOpts) => {
    if (!supabase) return { error: "Accounts aren't enabled in this environment." };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: opts.fullName.trim(), marketing_opt_in: opts.marketingOptIn } },
    });
    if (error) return { error: error.message };
    if (data.user) await upsertIdentity(data.user);
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Accounts aren't enabled in this environment." };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? error.message : null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  // Best-effort self-service data deletion: wipe the profile row (RLS-scoped to
  // the user) and sign out. Full auth-user deletion requires a privileged call;
  // the privacy page tells users they can email us to fully purge the login too.
  const deleteAccount = useCallback(async () => {
    if (!supabase || !user) return { error: "Not signed in." };
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    if (error) return { error: error.message };
    await supabase.auth.signOut();
    return { error: null };
  }, [user]);

  return (
    <Ctx.Provider value={{ enabled: supabaseEnabled, ready, user, session, authOpen, openAuth, closeAuth, signUp, signIn, signOut, deleteAccount }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
