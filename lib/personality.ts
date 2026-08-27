// The voice, codified (Personality Pass, approved 2026-08-27): a steady
// squadmate - direct, dry warmth, no hype, no pity. Affirmations rotate on
// check-off; the greeting follows the clock. Un-checking says nothing and the
// away state says nothing - encourage, never shame.

export const AFFIRMATIONS = [
  "That's one.",
  "Squared away.",
  "Forward is forward.",
  "Steady counts.",
  "One less thing carrying you.",
];

let cursor = Math.floor(Math.random() * AFFIRMATIONS.length);

/** Next line in the rotation - random entry point, then sequential, so a
 *  burst of check-offs never repeats itself. */
export function nextAffirmation(): string {
  cursor = (cursor + 1) % AFFIRMATIONS.length;
  return AFFIRMATIONS[cursor];
}

/** Time-of-day greeting for the dashboard header. Subs make no numeric
 *  claims - anything data-backed (the return streak) is layered on by the
 *  caller only when the ledger actually supports it. */
export function greetingFor(name: string, now: Date = new Date()): { line: string; sub: string } {
  const h = now.getHours();
  const n = name ? `, ${name}` : "";
  if (h < 12) return { line: `Morning${n}.`, sub: "The plan is staged. One thing is enough." };
  if (h < 17) return { line: `Afternoon${n}.`, sub: "The plan kept your place." };
  return { line: `Evening check-in${n}?`, sub: "Ten quiet minutes counts double." };
}
