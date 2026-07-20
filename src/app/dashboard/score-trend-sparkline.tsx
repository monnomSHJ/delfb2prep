type ScorePoint = {
  label: string;
  pct: number;
};

const WIDTH = 200;
const HEIGHT = 40;
const PAD_X = 4;
const PAD_Y = 6;

export function ScoreTrendSparkline({ points }: { points: ScorePoint[] }) {
  if (points.length < 2) return null;

  const stepX = (WIDTH - PAD_X * 2) / (points.length - 1);
  const coords = points.map((p, i) => ({
    x: PAD_X + i * stepX,
    y: HEIGHT - PAD_Y - (p.pct / 100) * (HEIGHT - PAD_Y * 2),
    label: p.label,
  }));

  const fullPath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`)
    .join(" ");
  const last = coords[coords.length - 1];
  const secondLast = coords[coords.length - 2];
  const lastSegment = `M${secondLast.x},${secondLast.y} L${last.x},${last.y}`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="mt-3 h-10 w-full"
      role="img"
      aria-label={`최근 작문 점수 추이, 최신 점수 ${last.label}`}
    >
      <line
        x1={PAD_X}
        y1={HEIGHT - PAD_Y}
        x2={WIDTH - PAD_X}
        y2={HEIGHT - PAD_Y}
        stroke="var(--color-ink-200)"
        strokeWidth={1}
      />
      <path
        d={fullPath}
        fill="none"
        stroke="var(--color-ink-300)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={lastSegment}
        fill="none"
        stroke="var(--color-plum-600)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {coords.slice(0, -1).map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={2.5} fill="var(--color-ink-300)">
          <title>{c.label}</title>
        </circle>
      ))}
      <circle
        cx={last.x}
        cy={last.y}
        r={4}
        fill="var(--color-plum-600)"
        stroke="var(--color-ink-50)"
        strokeWidth={2}
      >
        <title>{last.label}</title>
      </circle>
    </svg>
  );
}
