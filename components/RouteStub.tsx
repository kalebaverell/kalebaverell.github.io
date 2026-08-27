/** A short stretch of the homepage's marching route (Personality Pass 4) -
 *  the same march/pulse keyframes the hero already ships, carried inside to
 *  the working pages. Purely decorative. */
export default function RouteStub() {
  return (
    <svg className="route-svg route-stub" viewBox="0 0 560 44" aria-hidden="true">
      <path className="march" d="M6 30 C 120 6, 230 42, 340 20 S 500 24, 554 12" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      <circle cx="6" cy="30" r="4.5" fill="var(--primary)" />
      <circle className="pulse" cx="340" cy="20" r="5.5" fill="var(--accent)" />
      <circle cx="554" cy="12" r="4.5" fill="var(--border)" />
    </svg>
  );
}
