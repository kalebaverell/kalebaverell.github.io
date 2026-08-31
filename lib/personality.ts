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

/** Journal prompts. The notes card shipped as an empty textarea and drew zero
 *  entries in its first week - blank boxes get ignored, specific questions get
 *  answers. Rotates weekly so a returning veteran meets a different question
 *  rather than the same wall. Every one is answerable in a sentence, and none
 *  of them ask about anything VetPath can't help with. */
const JOURNAL_PROMPTS = [
  "What's the one thing about getting out that you keep putting off?",
  "What would make the next 30 days feel like a win?",
  "What's a question you wish someone would just answer straight?",
  "Who do you still need to talk to, and about what?",
  "What are you actually good at that your resume doesn't say?",
  "What's changed since you last looked at this plan?",
  "What do you want your first year out to look like?",
];

/** This week's prompt - same for the whole week, new one next week. */
export function journalPrompt(now: Date = new Date()): string {
  const day = Math.floor(now.getTime() / 86400000);
  return JOURNAL_PROMPTS[Math.floor(day / 7) % JOURNAL_PROMPTS.length];
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
