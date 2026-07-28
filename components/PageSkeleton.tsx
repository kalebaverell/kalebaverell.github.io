// Shaped loading placeholders for the client routes.
//
// Every page here reads saved answers from localStorage before it can render,
// so on a cold open there is a short gap. Showing the page's actual shape
// during that gap means content lands in place instead of shoving the layout
// around, which is what made the old bare "Loading" line feel like jank.
//
// Variants approximate a page family's rhythm, not its exact markup. The goal
// is that nothing jumps, not that the placeholder is pixel-identical.
import { Wrap } from "@/components/ui";

/** One grey block. Width/height are the only things that vary. */
function Bar({ w = "100%", h = 14, mt = 0, r }: { w?: string | number; h?: number; mt?: number; r?: number }) {
  return <div className="sk" style={{ width: w, height: h, marginTop: mt, borderRadius: r }} />;
}

function CardBlock({ lines = 3, title = "60%" }: { lines?: number; title?: string }) {
  return (
    <div className="sk-card">
      <Bar w={title} h={18} />
      {Array.from({ length: lines }).map((_, i) => (
        <Bar key={i} w={i === lines - 1 ? "72%" : "100%"} h={12} mt={i === 0 ? 16 : 9} />
      ))}
    </div>
  );
}

export type SkeletonKind = "dashboard" | "cards" | "narrow" | "print";

export default function PageSkeleton({
  kind = "cards",
  label = "Loading",
}: {
  kind?: SkeletonKind;
  label?: string;
}) {
  // aria-busy + a polite status line: assistive tech announces the wait once,
  // and the decorative blocks stay out of the accessibility tree entirely.
  const frame = (children: React.ReactNode, narrow = false) => (
    <Wrap narrow={narrow}>
      <div role="status" aria-busy="true">
        <span className="sr-only">{label}</span>
        <div aria-hidden="true">{children}</div>
      </div>
    </Wrap>
  );

  if (kind === "print") {
    return (
      <div className="print-doc">
        <div role="status" aria-busy="true">
          <span className="sr-only">{label}</span>
          <div aria-hidden="true">
            <Bar w="42%" h={26} />
            <Bar w="60%" h={13} mt={12} />
            <div style={{ marginTop: 26, display: "grid", gap: 18 }}>
              <CardBlock lines={3} title="34%" />
              <CardBlock lines={4} title="46%" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "narrow") {
    return frame(
      <>
        <Bar w="52%" h={28} />
        <Bar w="86%" h={14} mt={14} />
        <div style={{ marginTop: 22 }}>
          <CardBlock lines={4} title="40%" />
        </div>
      </>,
      true
    );
  }

  if (kind === "dashboard") {
    return frame(
      <>
        {/* Navy hero band. Heights are tuned so the real header, whose title wraps
            to two lines on a phone, lands close to where this sat. */}
        <div className="sk-card sk-dark">
          <Bar w={150} h={26} r={99} />
          <Bar w="72%" h={28} mt={16} />
          <Bar w="52%" h={28} mt={8} />
          <Bar w="88%" h={13} mt={14} />
          <Bar w="64%" h={13} mt={8} />
        </div>
        {/* Destination strip */}
        <div className="sk-card" style={{ marginTop: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <Bar w={52} h={52} r={11} />
          <div style={{ flex: 1 }}>
            <Bar w="30%" h={11} />
            <Bar w="55%" h={20} mt={8} />
            <Bar w="80%" h={12} mt={8} />
          </div>
        </div>
        <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
          <CardBlock lines={4} title="38%" />
          <CardBlock lines={2} title="46%" />
        </div>
        {/* 30 / 60 / 90 columns */}
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", marginTop: 22 }}>
          <CardBlock lines={3} title="70%" />
          <CardBlock lines={3} title="70%" />
          <CardBlock lines={3} title="70%" />
        </div>
      </>
    );
  }

  // "cards": section head then a stack. Covers reserves, relocate, plan,
  // family, network, profile, resume, updates, pathfinder, timeline.
  return frame(
    <>
      <Bar w={120} h={12} r={99} />
      <Bar w="58%" h={30} mt={14} />
      <Bar w="78%" h={14} mt={12} />
      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        <CardBlock lines={3} title="44%" />
        <CardBlock lines={4} title="52%" />
        <CardBlock lines={2} title="36%" />
      </div>
    </>
  );
}
