// Weekly focus rotation: one real corner of the site per ISO week, chosen
// deterministically so every visitor sees the same focus all week and a new
// one next week - a reason to come back on a 7-day rhythm with zero backend.
// Every entry points at an existing page and describes only what that page
// actually does. Nothing here is seasonal, invented, or time-sensitive.

export interface WeeklyFocus {
  title: string;
  blurb: string;
  href: string;
  icon: string;
  cta: string;
}

const FOCUS: WeeklyFocus[] = [
  { title: "Re-check your fit", blurb: "The career test takes 10 questions and re-ranks your paths - answers drift as you learn, and the test moves with you.", href: "/pathfinder", icon: "ti-compass", cta: "Take it again" },
  { title: "One benefit, verified", blurb: "Pick one benefit category this week and open its official source - knowing where to verify beats hoping you qualify.", href: "/benefits", icon: "ti-award", cta: "Open benefits" },
  { title: "Stress-test your landing spot", blurb: "Compare two metros side by side - VA care, cost of living, jobs - with official data behind every column.", href: "/relocate", icon: "ti-home", cta: "Compare metros" },
  { title: "Walk your timeline", blurb: "Seven phases, real deadlines, and a \"you are here\" marker - five minutes here keeps the next window from sneaking up.", href: "/timeline", icon: "ti-timeline", cta: "See the timeline" },
  { title: "Anything drift?", blurb: "Rating, household, state, job - feed one change in and watch the plan re-route before and after, then apply it.", href: "/updates", icon: "ti-refresh", cta: "Run an update" },
  { title: "Bring the household in", blurb: "The checkpoints your family should see - coverage bridges, school moves, the conversations worth having early.", href: "/family", icon: "ti-users", cta: "Open family view" },
  { title: "One conversation this week", blurb: "Most veteran hires come through people. The networking hub lists free programs that pair you with your industry.", href: "/network", icon: "ti-users-group", cta: "Find your people" },
  { title: "Run your resume past the scanner", blurb: "Recruiter-style feedback on translation, keywords, and structure - paste it in, fix what it flags.", href: "/resume", icon: "ti-file-text", cta: "Scan it" },
  { title: "The business idea, structured", blurb: "From idea to plan with veteran entrepreneurship programs behind it - worth a look even if it stays a someday.", href: "/goals", icon: "ti-building-store", cta: "Explore it" },
  { title: "Knock out one action", blurb: "Your action plan holds the shortlist. One checked box this week - even a ten-minute one - is how the whole thing moves.", href: "/plan", icon: "ti-checkbox", cta: "Open the plan" },
  { title: "Look in the mirror", blurb: "Your shape, your milestones, your notes, your next real dates - the page that reflects what you've told us and done.", href: "/profile", icon: "ti-user-circle", cta: "See your Mirror" },
  { title: "Put it on paper", blurb: "Print your gameplan and stick it somewhere you'll see it - plans on the fridge get done more than plans in a tab.", href: "/print", icon: "ti-printer", cta: "Print it" },
];

/** ISO 8601 week number - stable across timezones for our purposes. */
function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7);
}

/** This week's focus. Year is salted in so the annual sequence shifts. */
export function currentFocus(now: Date = new Date()): WeeklyFocus {
  return FOCUS[(now.getFullYear() + isoWeek(now)) % FOCUS.length];
}
