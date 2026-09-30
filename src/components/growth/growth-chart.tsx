import { formatDotDate } from "@/lib/date/date-only";
import { niceDomain, scaleLinear, type GrowthPoint } from "@/lib/growth/chart";

const WIDTH = 340;
const HEIGHT = 220;
const PAD = { top: 16, right: 44, bottom: 30, left: 38 };

/**
 * 성장 기록 추이 (단일 계열 SVG 라인 차트, 서버 렌더링).
 * - 2px 선, 링이 있는 8px 이상 점, 1px 옅은 격자, 끝값 직접 라벨
 * - 점에 마우스를 올리거나 키보드로 포커스하면 값/날짜 툴팁 (CSS만 사용)
 * - 값 목록은 차트 아래 기록 표가 대신한다 (표 보기)
 */
export function GrowthChart({ points, unit, label }: { points: GrowthPoint[]; unit: string; label: string }) {
  const yDomain = niceDomain(
    points.map((p) => p.value),
    4,
    unit === "kg" ? 1 : 4,
  );
  const maxAge = Math.max(12, Math.ceil(Math.max(0, ...points.map((p) => p.ageMonths))));
  const x = scaleLinear([0, maxAge], [PAD.left, WIDTH - PAD.right]);
  const y = scaleLinear([yDomain.min, yDomain.max], [HEIGHT - PAD.bottom, PAD.top]);
  const xTicks = Array.from({ length: Math.floor(maxAge / 3) + 1 }, (_, i) => i * 3);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.ageMonths).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const last = points.at(-1);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`${label} 기록 추이 그래프. 기록 ${points.length}개${last ? `, 최근 ${last.value}${unit}` : ""}`}
      >
        {/* 격자 + y축 눈금 */}
        {yDomain.ticks.map((tick) => (
          <g key={`y${tick}`}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={PAD.left - 6} y={y(tick)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--color-ink-faint)">
              {tick}
            </text>
          </g>
        ))}
        {/* x축 (개월) */}
        {xTicks.map((tick) => (
          <text key={`x${tick}`} x={x(tick)} y={HEIGHT - PAD.bottom + 16} textAnchor="middle" fontSize={10} fill="var(--color-ink-faint)">
            {tick}개월
          </text>
        ))}
        <text x={PAD.left - 6} y={PAD.top - 6} textAnchor="end" fontSize={10} fill="var(--color-ink-faint)">
          {unit}
        </text>

        {points.length > 1 ? (
          <path d={path} fill="none" stroke="var(--color-lavender-600)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        ) : null}

        {points.map((p) => {
          const cx = x(p.ageMonths);
          const cy = y(p.value);
          const tipX = Math.min(Math.max(cx, PAD.left + 44), WIDTH - 44);
          const tipAbove = cy > PAD.top + 44;
          return (
            <g key={p.date} className="group outline-none" tabIndex={0} aria-label={`${formatDotDate(p.date)} ${p.value}${unit}`}>
              {/* 마크보다 큰 투명 히트 영역 */}
              <circle cx={cx} cy={cy} r={14} fill="transparent" />
              <circle cx={cx} cy={cy} r={4.5} fill="var(--color-lavender-600)" stroke="#fff" strokeWidth={2} />
              <g className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                <rect x={tipX - 42} y={tipAbove ? cy - 46 : cy + 12} width={84} height={34} rx={8} fill="var(--color-ink)" />
                <text x={tipX} y={tipAbove ? cy - 32 : cy + 26} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
                  {p.value}
                  {unit}
                </text>
                <text x={tipX} y={tipAbove ? cy - 19 : cy + 39} textAnchor="middle" fontSize={9} fill="#e6e3ee">
                  {formatDotDate(p.date)}
                </text>
              </g>
            </g>
          );
        })}

        {last ? (
          <text x={x(last.ageMonths) + 8} y={y(last.value)} dominantBaseline="middle" fontSize={11} fontWeight={700} fill="var(--color-ink)">
            {last.value}
            {unit}
          </text>
        ) : null}
      </svg>
      <figcaption className="mt-1 text-center text-[12px] text-ink-faint">가로: 생후 개월 · 세로: {label}({unit}) · 점을 누르면 값이 보여요</figcaption>
    </figure>
  );
}
