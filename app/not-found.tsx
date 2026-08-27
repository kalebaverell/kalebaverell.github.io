import Link from "next/link";

/** 404 in the site's voice (Personality Pass 6). Static export builds this
 *  into 404.html, which GitHub Pages serves for unknown routes. */
export default function NotFound() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "90px 22px 110px", textAlign: "center" }}>
      <p className="eyebrow" style={{ justifyContent: "center" }}>404</p>
      <h1 style={{ fontSize: "clamp(30px, 5vw, 40px)" }}>This trail isn&apos;t marked.</h1>
      <p className="muted" style={{ maxWidth: 430, margin: "10px auto 26px" }}>
        The page you&apos;re after moved or never existed. Your dashboard will get you re-oriented.
      </p>
      <Link className="btn gold" href="/dashboard"><i className="ti ti-layout-dashboard" aria-hidden="true" /> Back to your gameplan</Link>
    </div>
  );
}
