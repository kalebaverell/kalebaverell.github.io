/** Faint topographic contour texture (Personality Pass 7) - reads as texture
 *  at a glance, as terrain on the second look. Inherits currentColor so the
 *  same lines work on dark bands (white) and light cards (primary). The
 *  parent must be position:relative with overflow hidden. */
export default function Topo({ opacity = 0.1, color }: { opacity?: number; color?: string }) {
  return (
    <svg
      className="topo-lines"
      viewBox="0 0 600 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity, ...(color ? { color } : null) }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <path d="M-20 40 C 90 10, 180 70, 300 44 S 520 10, 640 46" />
        <path d="M-20 78 C 100 46, 200 108, 320 80 S 530 48, 640 84" />
        <path d="M-20 118 C 90 88, 210 148, 330 118 S 540 86, 640 122" />
        <path d="M-20 158 C 100 128, 220 188, 340 156 S 540 126, 640 162" />
        <path d="M-20 198 C 110 168, 230 228, 350 196 S 550 166, 640 202" />
        <path d="M60 20 C 120 60, 110 120, 70 170" />
        <path d="M420 10 C 470 70, 460 140, 410 205" />
      </g>
    </svg>
  );
}
