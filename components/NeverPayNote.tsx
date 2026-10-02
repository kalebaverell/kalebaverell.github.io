// "Never pay for claims help" - one component so the plan, the benefits library
// and the printout say exactly the same thing (copy and links: lib/handoff.ts).
// Screen: the existing warn Callout (ti-alert-triangle, in the icon subset).
// Print: the existing print-box; globals.css:586 prints each link's URL after it.
import { Callout } from "@/components/ui";
import { HANDOFF_LINKS, NEVER_PAY } from "@/lib/handoff";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function NeverPayNote({ print = false }: { print?: boolean }) {
  const body = (
    <>
      <strong>{NEVER_PAY.title}</strong> {NEVER_PAY.body}{" "}
      <a href={HANDOFF_LINKS.vaFindRep.href} {...ext}>Check anyone in VA&apos;s accredited search</a>
      {" "}and{" "}
      <a href={HANDOFF_LINKS.report.href} {...ext}>report a claims predator to VSAFE (833-38V-SAFE)</a>.
      {" "}(<a href={HANDOFF_LINKS.usc5901.href} {...ext}>38 U.S.C. 5901</a>, <a href={HANDOFF_LINKS.usc5904.href} {...ext}>5904</a>)
    </>
  );
  if (print) return <div className="print-box" style={{ fontSize: 13 }}>{body}</div>;
  return <Callout kind="warn">{body}</Callout>;
}
