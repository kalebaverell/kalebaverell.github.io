"use client";
// Email unsubscribe landing. Emails link here, not to the edge function, for
// two reasons: Supabase rewrites HTML from functions to text/plain (v1 showed
// raw markup), and mail scanners open every link in an email, so a GET that
// unsubscribes can fire without the reader clicking. Here nothing changes
// until the button is pressed. The token is a random capability, not personal
// data; it is dropped from the address bar on load, and the page counter only
// ever sees the path (components/Analytics.tsx counts usePathname()).
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseUrl } from "@/lib/supabase";
import { Wrap, Eyebrow } from "@/components/ui";

export default function UnsubscribePage() {
  const [token, setToken] = useState<string | null>(null); // null = not read yet
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") || "";
    setToken(/^[0-9a-f-]{36}$/i.test(t) ? t : "");
    history.replaceState(null, "", window.location.pathname);
  }, []);

  const stop = async () => {
    if (!token || !supabaseUrl) return;
    setState("working");
    try {
      const r = await fetch(`${supabaseUrl}/functions/v1/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = r.ok ? await r.json() : null;
      setState(j?.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <Wrap narrow>
      <Eyebrow>Email check-ins</Eyebrow>
      {state === "done" ? (
        <>
          <h1 style={{ marginTop: 0 }}>You&apos;re unsubscribed</h1>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            No more check-in emails. Nothing else changes - your plan stays yours, exactly as it was. You
            can turn check-ins back on anytime from your profile page.
          </p>
        </>
      ) : token === "" || state === "error" ? (
        <>
          <h1 style={{ marginTop: 0 }}>That link didn&apos;t work</h1>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            This unsubscribe link is incomplete or no longer valid. If you&apos;re still getting emails,
            reply to one or email <a href="mailto:kaleb@vetpathusa.com">kaleb@vetpathusa.com</a>, and a
            person will take care of it.
          </p>
        </>
      ) : (
        <>
          <h1 style={{ marginTop: 0 }}>Stop check-in emails?</h1>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            This turns off timeline check-ins and data re-verification notes. Your account and your plan
            stay exactly as they are.
          </p>
          <button className="btn" onClick={stop} disabled={token === null || state === "working"}>
            <i className="ti ti-mail" aria-hidden="true" /> {state === "working" ? "Turning them off…" : "Stop check-in emails"}
          </button>
        </>
      )}
      <p style={{ marginTop: 30 }}>
        <Link className="btn ghost" href="/"><i className="ti ti-arrow-left" aria-hidden="true" /> Back to VetPath</Link>
      </p>
    </Wrap>
  );
}
