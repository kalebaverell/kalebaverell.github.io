// VetPath resume scanner — deterministic, client-side analysis (SAMPLE logic, no upload).
// Tailors feedback toward a chosen career path's keywords. A coaching aid, not an ATS oracle.
import type { Career } from "./types";

export interface ResumeIssue {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface ResumeResult {
  score: number; // 0–100 demo estimate
  words: number;
  strengths: string[];
  issues: ResumeIssue[];
  jargonFound: { term: string; plain: string }[];
  keywordsHit: string[];
  keywordsMissing: string[];
  nextSteps: string[];
}

const JARGON: [string, string][] = [
  ["NCOIC", "supervisor / team lead"],
  ["OIC", "officer in charge → department lead"],
  ["squad leader", "team leader (led a team of X)"],
  ["platoon sergeant", "operations supervisor (40+ people)"],
  ["first sergeant", "senior operations manager"],
  ["MOS", "military occupation → job title"],
  ["TDY", "temporary assignment / business travel"],
  ["PCS", "relocation"],
  ["OPORD", "operations plan"],
  ["FTX", "field training exercise → large-scale training event"],
  ["battle buddy", "teammate"],
  ["PT ", "physical training"],
  ["CO ", "commanding officer → executive leadership"],
  ["XO", "executive officer → deputy director"],
  ["S1", "personnel/HR department"],
  ["S2", "intelligence/analysis department"],
  ["S3", "operations department"],
  ["S4", "logistics department"],
  ["mission", "project / objective (fine in moderation)"],
  ["troops", "team members / personnel"],
  ["subordinates", "direct reports"],
  ["chow hall", "dining facility"],
  ["downrange", "deployed overseas"],
  ["hooah", "(remove)"],
];

const WEAK_PHRASES = ["responsible for", "duties included", "worked on", "helped with", "assisted with", "tasked with"];
const ACTION_VERBS = ["led", "managed", "built", "operated", "trained", "coordinated", "maintained", "supervised", "improved", "reduced", "executed", "delivered", "launched", "designed", "implemented", "streamlined", "negotiated", "directed", "planned", "achieved"];

export function analyzeResume(text: string, career?: Career): ResumeResult {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean).length;
  const lines = clean.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  const strengths: string[] = [];
  const issues: ResumeIssue[] = [];
  let score = 100;

  // Length
  if (words < 150) { score -= 15; issues.push({ severity: "high", title: "Too short", detail: `Only ~${words} words. Aim for 350–650 — enough to show impact on one page.` }); }
  else if (words > 900) { score -= 8; issues.push({ severity: "medium", title: "Running long", detail: `~${words} words. Civilian resumes get ~30 seconds — tighten to 1 page (2 max for senior roles).` }); }
  else strengths.push("Good length for a civilian one-pager.");

  // Contact info
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(clean);
  const hasPhone = /(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/.test(clean);
  if (!hasEmail || !hasPhone) { score -= 8; issues.push({ severity: "high", title: "Missing contact info", detail: `Recruiters can't reach you: ${!hasEmail ? "no email" : ""}${!hasEmail && !hasPhone ? " and " : ""}${!hasPhone ? "no phone number" : ""} detected.` }); }
  else strengths.push("Contact info present.");

  // Sections
  const sections = ["experience", "education", "skills"].filter((s) => lower.includes(s));
  if (sections.length < 2) { score -= 8; issues.push({ severity: "medium", title: "Add clear sections", detail: "Recruiters and ATS software scan for Experience / Education / Skills headers — make them explicit." }); }
  else strengths.push("Clear section structure detected.");

  // Quantification
  const numberish = (clean.match(/\d[\d,.]*\s*(%|percent|people|personnel|soldiers|members|vehicles|\$|k\b|million)?/gi) || []).length;
  if (numberish < 4) { score -= 12; issues.push({ severity: "high", title: "Not enough numbers", detail: "Quantify: team size, budget, equipment value, readiness %, incidents reduced. \"Led 12-person team; maintained $3.2M of equipment at 98% readiness\" beats any adjective." }); }
  else strengths.push("You quantify your impact — recruiters trust numbers.");

  // Weak phrases
  const weakFound = WEAK_PHRASES.filter((p) => lower.includes(p));
  if (weakFound.length) { score -= 5 * Math.min(weakFound.length, 3); issues.push({ severity: "medium", title: "Passive phrasing", detail: `Replace ${weakFound.map((w) => `"${w}"`).join(", ")} with strong verbs: Led, Built, Reduced, Delivered.` }); }

  // Action verbs
  const verbHits = ACTION_VERBS.filter((v) => lower.includes(v)).length;
  if (verbHits >= 5) strengths.push("Strong action verbs throughout.");
  else { score -= 6; issues.push({ severity: "medium", title: "Weak verb power", detail: "Start bullets with verbs like Led, Managed, Improved, Reduced, Trained, Delivered." }); }

  // First person
  if (/\b(i|my|me)\b/i.test(clean.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, ""))) {
    score -= 4; issues.push({ severity: "low", title: "Drop first person", detail: "Resumes skip \"I/my\" — start lines directly with the verb." });
  }

  // Jargon & acronyms (word-boundary match so e.g. "OIC" doesn't fire inside "NCOIC")
  const jargonFound = JARGON.filter(([t]) => {
    const esc = t.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i").test(lower);
  }).map(([term, plain]) => ({ term: term.trim(), plain }));
  if (jargonFound.length > 2) { score -= 8; issues.push({ severity: "high", title: "Translate military language", detail: "A civilian recruiter may not know these terms — swap in the plain-English versions below." }); }
  else if (jargonFound.length) { score -= 3; issues.push({ severity: "low", title: "A little jargon slipped in", detail: "Swap the flagged terms below for their civilian versions." }); }
  else strengths.push("Reads clean of military jargon.");
  const acronyms = (clean.match(/\b[A-Z]{2,5}\b/g) || []).filter((a2) => !["USA", "GPA", "CEO", "CDL", "EMT", "IT", "PM", "RN", "AWS", "FAA", "EPA", "PMP", "SQL"].includes(a2));
  if (acronyms.length > 12) { score -= 5; issues.push({ severity: "medium", title: "Acronym overload", detail: `${acronyms.length} unexplained acronyms. Spell out or cut anything a civilian hiring manager wouldn't know.` }); }

  // Career keyword tailoring
  let keywordsHit: string[] = [];
  let keywordsMissing: string[] = [];
  if (career) {
    keywordsHit = career.keywords.filter((k) => lower.includes(k.toLowerCase()));
    keywordsMissing = career.keywords.filter((k) => !lower.includes(k.toLowerCase()));
    if (keywordsHit.length >= Math.ceil(career.keywords.length / 2)) strengths.push(`Speaks ${career.label} language (${keywordsHit.length}/${career.keywords.length} key terms).`);
    else { score -= 10; issues.push({ severity: "high", title: `Tailor it to ${career.label}`, detail: "ATS filters and recruiters match against role keywords — work the missing terms below into real accomplishments (never keyword-stuff)." }); }
  }

  // Bullet density
  const longLines = lines.filter((l) => l.split(/\s+/).length > 35).length;
  if (longLines > 2) { score -= 4; issues.push({ severity: "low", title: "Bullets running long", detail: "Keep bullets to 1–2 lines; one accomplishment each." }); }

  const nextSteps = [
    "Have a DOL VETS rep or American Job Center review it free.",
    "Run your MOS through O*NET's military crosswalk for civilian titles and keywords.",
    career?.skillbridge ? "Ask about SkillBridge internships in this field if you're still in service." : "Get a mock interview through ACP or Veterati (free mentors).",
    "Save versions per job application — tailor the top third every time.",
  ];

  return {
    score: Math.max(20, Math.min(98, Math.round(score))),
    words,
    strengths,
    issues,
    jargonFound,
    keywordsHit,
    keywordsMissing,
    nextSteps,
  };
}
