// Facts for the public verification record (/verification). Everything is
// computed from the data files the app runs on, so the record cannot drift
// from the product; the history (runs, corrections, open items) lives in
// data/verificationLog.json, where every entry cites its repo report or commit.
// Pure module, no React: safe to import from a server component.
import logJson from "@/data/verificationLog.json";
import fundingJson from "@/data/funding.json";
import { STATE_BENEFITS, BENEFITS, CAREERS, CAREERS_VERIFIED } from "@/lib/data";
import { METROS } from "@/lib/relocate";
import { FAMILY_GROUPS } from "@/lib/family";
import { COMPONENTS, RESERVE_BENEFITS, STATE_EDUCATION, RESERVES_VERIFIED } from "@/lib/reserves";
import { FUNDING_VERIFIED } from "@/lib/funding";

export type DatasetKey = "state" | "federal" | "careers" | "relocation" | "family" | "funding" | "reserves";

export interface VerificationRun { id: string; date: string; title: string; covers: DatasetKey[]; summary: string[]; report: string }
export interface Correction { date: string; dataset: string; where: string; item: string; was: string; now: string; source?: string; report: string }
export interface OpenItem { since: string; dataset: string; where: string; item: string; detail: string; report: string }

export const VERIFICATION_LOG = logJson as unknown as {
  owner: string;
  contact: string;
  datasets: Record<string, { label: string; sources?: string; cadence?: string }>;
  runs: VerificationRun[];
  corrections: Correction[];
  open: OpenItem[];
};

export const datasetLabel = (key: string): string => VERIFICATION_LOG.datasets[key]?.label ?? key;

const isUrl = (u: unknown): u is string => typeof u === "string" && /^https?:\/\//.test(u);
const hostOf = (u: string): string => {
  try { return new URL(u).hostname.toLowerCase(); } catch { return ""; }
};
export const onGovOrMil = (u: string): boolean => /\.(gov|mil)$/.test(hostOf(u));

/** A dataset is only as fresh as its least recently checked record. */
function oldest(dates: (string | null | undefined)[]): string | null {
  const d = dates.filter((x): x is string => !!x).sort();
  return d[0] ?? null;
}

/** Latest logged run that re-verified a dataset - used only where the data file carries no date. */
function lastRunFor(key: DatasetKey): string | null {
  const d = VERIFICATION_LOG.runs.filter((r) => r.covers.includes(key)).map((r) => r.date).sort();
  return d.length ? d[d.length - 1] : null;
}

export interface DatasetFacts {
  key: DatasetKey;
  label: string;
  scope: string;
  sources: string;
  cadence: string;
  urls: string[];
  gov: number;
  lastVerified: string | null;
  note?: string;
}

function facts(key: DatasetKey, scope: string, links: unknown[], lastVerified: string | null, note?: string): DatasetFacts {
  const meta = VERIFICATION_LOG.datasets[key];
  const urls = Array.from(new Set(links.filter(isUrl).map((u) => u.trim())));
  return {
    key, scope, urls, lastVerified, note,
    label: meta?.label ?? key,
    sources: meta?.sources ?? "",
    cadence: meta?.cadence ?? "",
    gov: urls.filter(onGovOrMil).length,
  };
}

export function datasetFacts(): DatasetFacts[] {
  const states = STATE_BENEFITS.states;
  const programs = states.reduce((n, s) => n + s.programs.length, 0);
  const metros = METROS.map((m: any) => m.official).filter(Boolean) as any[];
  const carried = Array.from(new Set(metros.filter((o) => /carried forward/i.test(o.fmr2br?.note || "")).map((o) => o.fmr2br.year)));
  const editions = Array.from(new Set(CAREERS.map((c) => /\((May \d{4}) median/.exec(c.paySample || "")?.[1]).filter(Boolean)));
  const family = FAMILY_GROUPS.flatMap((g) => g.entries);
  const familyDated = family.filter((e) => e.verified).length;
  const funding = (fundingJson as unknown as { programs: { source?: string }[] }).programs;
  const federalReserve = [...COMPONENTS, ...RESERVE_BENEFITS] as { source?: string }[];
  const stateGuard = STATE_EDUCATION as { source?: string }[];

  return [
    facts("state", `${programs} programs in ${states.filter((s) => s.code !== "DC").length} states + D.C.`,
      states.flatMap((s) => [s.agency.url, ...s.programs.map((p) => p.source)]),
      STATE_BENEFITS.lastVerified),
    facts("federal", `${BENEFITS.filter((b: any) => b.id !== "state-benefits").length} core federal categories, plus a state-benefits overview`,
      BENEFITS.flatMap((b: any) => [b.official?.url, ...(b.sources || [])]),
      oldest(BENEFITS.map((b: any) => b.lastVerified))),
    facts("careers", `${CAREERS.length} career paths`,
      CAREERS.flatMap((c) => [c.blsUrl, c.onetUrl, ...(c.sources || [])]),
      CAREERS_VERIFIED ?? lastRunFor("careers"),
      editions.length ? `Pay figures are BLS ${editions.join(", ")} medians.` : undefined),
    facts("relocation", `${metros.length} metros`,
      metros.flatMap((o) => [o.rpp?.source, o.fmr2br?.source, o.unemployment?.source, o.vamc?.source, o.vamc?.url]),
      oldest(metros.map((o) => o.gathered)),
      carried.length ? `HUD rents (${carried.join(", ")}) were carried forward, not re-checked, in the last refresh.` : undefined),
    facts("family", `${family.length} family resources`,
      family.map((e) => e.url),
      oldest(family.map((e) => e.verified)),
      familyDated < family.length ? `${familyDated} of ${family.length} entries carry dated program facts; the rest link to official program pages.` : undefined),
    facts("funding", `${funding.length} funding programs`, funding.map((p) => p.source), FUNDING_VERIFIED || null),
    facts("reserves", `${federalReserve.length} federal items and ${stateGuard.length} state Guard education programs`,
      [...federalReserve, ...stateGuard].map((p) => p.source), RESERVES_VERIFIED || null),
  ];
}

export function sourceTotals(sets: DatasetFacts[]): { urls: number; gov: number; pct: number } {
  const all = new Set(sets.flatMap((d) => d.urls));
  const gov = Array.from(all).filter(onGovOrMil).length;
  return { urls: all.size, gov, pct: all.size ? Math.round((100 * gov) / all.size) : 0 };
}

/** "2026-10-01" -> "Oct 1, 2026"; "2026-07" -> "Jul 2026". Noon UTC keeps the day steady at build time. */
export function fmtVerified(iso: string | null | undefined): string {
  if (!iso) return "Not dated";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }
  if (/^\d{4}-\d{2}$/.test(iso)) {
    return new Date(`${iso}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }
  return iso;
}

// Output on 2026-10-02 (after the Oct 2 re-verification): state Oct 1, 2026; federal
// Oct 1, 2026; careers Oct 1, 2026 (CAREERS_VERIFIED; BLS "May 2025" medians); relocation
// Oct 1, 2026 (HUD FY2026 carried forward); family Oct 2, 2026 (5 of 15 dated); funding
// Oct 2, 2026 and reserves Oct 2, 2026 (both full dates since the Oct 2 re-check). Link
// counts move with each refresh, so the page computes them and this comment does not.
