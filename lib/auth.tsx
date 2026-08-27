"use client";
// Authentication context built on Supabase Auth. Supabase manages password
// hashing and session persistence server-side - we never store a raw password.
// When Supabase isn't configured, this provider is inert and the app stays local-only.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseEnabled, supabaseUrl, supabaseAnonKey } from "./supabase";
import { stampVisit } from "./visit";

/** Social sign-in providers we support. Supabase calls Microsoft "azure".
 *  Apple is deliberately not here: Sign in with Apple requires a paid Apple
 *  Developer account ($99/yr), and this project stays on free infrastructure.
 *  Order is the render order, so Google leads: it is the account most veterans
 *  already have. */
export type OAuthProvider = "google" | "azure";

export const PROVIDER_META: Record<OAuthProvider, { label: string; icon: string }> = {
  google: { label: "Google", icon: "ti-brand-google" },
  azure: { label: "Microsoft", icon: "ti-brand-windows" },
};

/** Single source of truth for which providers the UI will look for. */
export const SUPPORTED_PROVIDERS: OAuthProvider[] = ["google", "azure"];

interface SignUpOpts { fullName: string; marketingOptIn: boolean; }

/** Which form the auth modal should open on. */
export type AuthMode = "signin" | "signup" | "reset";

/** Minimum password length. This MUST match the Supabase project's
 *  Authentication > Sign In / Providers > Email > "Minimum password length"
 *  setting. If the two drift apart, the browser either accepts a password the
 *  server will reject, or blocks one the server would allow. Server is currently 8. */
export const MIN_PASSWORD_LENGTH = 8;

/** Every auth error a user sees goes through here: technical GoTrue messages
 *  become plain, actionable sentences, and anything unexpected (a raw "{}",
 *  an empty string, a 500 body) becomes a calm fallback instead of gibberish.
 *  Born from a real incident: a server-side failure once rendered as "{}". */
export function friendlyAuthError(raw: unknown): string {
  const msg = typeof raw === "string" ? raw : "";
  if (/invalid login credentials/i.test(msg)) return "That email and password don't match. Try again, or use “Forgot your password?” below.";
  if (/already registered|already exists/i.test(msg)) return "This email already has an account - sign in instead.";
  if (/email not confirmed/i.test(msg)) return "Almost there - confirm your email first. Check your inbox for the link we sent.";
  if (/rate limit|too many/i.test(msg)) return "Too many tries in a row. Give it a minute, then try again.";
  if (/password should|weak password|at least/i.test(msg)) return `Use a stronger password - at least ${MIN_PASSWORD_LENGTH} characters with letters and numbers.`;
  if (/invalid email|unable to validate email/i.test(msg)) return "That email address doesn't look right - check it and try again.";
  // A real message we don't recognize: pass it through as long as it reads like a sentence.
  if (msg && msg.length > 8 && !/[{}\[\]]/.test(msg)) return msg;
  return "Something went wrong on our end - your account is fine. Give it a moment and try again.";
}

interface AuthValue {
  enabled: boolean;
  ready: boolean;
  user: User | null;
  session: Session | null;
  authOpen: boolean;
  /** Which form to show when the modal opens. Defaults to signup. */
  authMode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  /** `needsConfirmation` is true when the project requires email verification: the
   *  account exists but there is no session yet, so the caller must say so rather
   *  than pretending the user is signed in. */
  signUp: (email: string, password: string, opts: SignUpOpts) => Promise<{ error: string | null; needsConfirmation: boolean; existingAccount: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Providers actually enabled on the project. Buttons render only for these, so
   *  a provider that has not been configured yet never shows a dead button. */
  oauthProviders: OAuthProvider[];
  signInWithProvider: (p: OAuthProvider) => Promise<{ error: string | null }>;
  /** An error handed back in the URL fragment by Supabase, e.g. an expired
   *  confirmation link. Surfaced so the user gets an explanation, not a blank form. */
  authError: string | null;
  clearAuthError: () => void;
  /** Email a recovery link. Always reports success so the form can't be used to
   *  probe which addresses have accounts. */
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  /** Set a new password for the session established by a recovery link. */
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

/** Where Supabase sends someone after they click the recovery link. Must be in the
 *  project's Redirect URLs allowlist or Supabase refuses to send them there. */
export const RESET_PATH = "/reset/";

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
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [oauthProviders, setOauthProviders] = useState<OAuthProvider[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  // Ask the project which providers are switched on, so buttons appear as each one
  // is configured and never before. Failure is silent: worst case, email only.
  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    let cancelled = false;
    fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseAnonKey } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j?.external) return;
        setOauthProviders(SUPPORTED_PROVIDERS.filter((p) => j.external[p]));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Supabase reports link failures in the URL fragment. Read it once, translate it
  // into something a person can act on, then strip it so a refresh looks clean.
  useEffect(() => {
    // Failures arrive in the fragment (email links) or the query string (OAuth
    // redirects, e.g. an expired state after a slow Google sign-in). Check both,
    // or an OAuth failure strands the user on the homepage with no explanation.
    const hash = window.location.hash;
    const query = window.location.search;
    const source = hash && hash.includes("error") ? hash.replace(/^#/, "") : query && query.includes("error") ? query.replace(/^\?/, "") : null;
    if (!source) return;
    const p = new URLSearchParams(source);
    const code = p.get("error_code");
    const desc = p.get("error_description")?.replace(/\+/g, " ");
    if (!code && !desc) return;
    setAuthError(
      code === "otp_expired"
        ? "That link has already been used or has expired. Company email filters often open links automatically to scan them, which can use up a one-time link before you get to it. Send yourself a new one and it will work."
        : code === "bad_oauth_state"
        ? "That sign-in took too long and timed out. Please click the sign-in button and try again - it only stays valid for a few minutes."
        : desc || "That sign-in did not work. Please try again."
    );
    // Strip the error params so a refresh does not re-show a stale failure, and
    // open the sign-in modal so the message is actually seen: OAuth failures land
    // on the homepage, which renders no error of its own.
    history.replaceState(null, "", window.location.pathname);
    setAuthMode("signin");
    setAuthOpen(true);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setReady(true);
      // Return-visit ledger: fire-and-forget, self-deduping per day.
      if (data.session?.user) stampVisit(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) { upsertIdentity(sess.user); stampVisit(sess.user.id); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const openAuth = useCallback((mode?: AuthMode) => {
    // Guard: this is easy to hand straight to onClick, where the argument is a
    // MouseEvent rather than a mode. Anything unrecognised falls back to signup.
    const valid = mode === "signin" || mode === "signup" || mode === "reset";
    setAuthMode(valid ? mode : "signup");
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const signUp = useCallback(async (email: string, password: string, opts: SignUpOpts) => {
    if (!supabase) return { error: "Accounts aren't enabled in this environment.", needsConfirmation: false, existingAccount: false };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: opts.fullName.trim(), marketing_opt_in: opts.marketingOptIn },
        // Where the confirmation link drops them once they verify.
        emailRedirectTo: `${window.location.origin}/onboarding/`,
      },
    });
    if (error) {
      const existing = /already registered|already exists/i.test(error.message || "");
      return { error: friendlyAuthError(error.message), needsConfirmation: false, existingAccount: existing };
    }
    // No session means the project requires email confirmation. Writing the profile
    // row would fail anyway, since RLS has no auth.uid() to match yet: it gets
    // written by onAuthStateChange the moment they confirm and sign in.
    if (data.session && data.user) await upsertIdentity(data.user);
    return { error: null, needsConfirmation: !data.session, existingAccount: false };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Accounts aren't enabled in this environment." };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? friendlyAuthError(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  // Social sign-in. Redirects away to the provider and back, so there is no
  // success path to handle here: onAuthStateChange picks it up on return.
  const signInWithProvider = useCallback(async (p: OAuthProvider) => {
    if (!supabase) return { error: "Accounts aren't enabled in this environment." };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: p,
      options: { redirectTo: `${window.location.origin}/onboarding/` },
    });
    return { error: error ? friendlyAuthError(error.message) : null };
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!supabase) return { error: "Accounts aren't enabled in this environment." };
    // Deliberately swallow "user not found" style errors: telling a stranger whether
    // an address has an account here would leak who is using a veterans' benefits site.
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${RESET_PATH}`,
    });
    return { error: null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) return { error: "Accounts aren't enabled in this environment." };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? friendlyAuthError(error.message) : null };
  }, []);

  // Best-effort self-service data deletion: wipe the profile row (RLS-scoped to
  // the user) and sign out. Full auth-user deletion requires a privileged call;
  // the privacy page tells users they can email us to fully purge the login too.
  const deleteAccount = useCallback(async () => {
    if (!supabase || !user) return { error: "Not signed in." };
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    if (error) return { error: friendlyAuthError(error.message) };
    await supabase.auth.signOut();
    return { error: null };
  }, [user]);

  return (
    <Ctx.Provider value={{ enabled: supabaseEnabled, ready, user, session, authOpen, authMode, openAuth, closeAuth, signUp, signIn, signOut, oauthProviders, signInWithProvider, authError, clearAuthError, requestPasswordReset, updatePassword, deleteAccount }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
