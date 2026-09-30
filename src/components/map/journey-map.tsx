import Link from "next/link";
import { Star } from "@/components/ui/star";
import type { JourneyPosition, JourneyStopState } from "@/lib/content/select";
import { formatDotDate } from "@/lib/date/date-only";
import { withTopic } from "@/lib/korean";
import type { JourneyStopRow } from "@/lib/supabase/database.types";

interface JourneyMapProps {
  babyName: string;
  ageLabel: string;
  position: JourneyPosition<JourneyStopRow>;
  /** journey_stop_id → 기록한 날짜 */
  discovered: Map<string, string>;
  photoUrl?: string | null;
}

function formatTypicalRange(stop: JourneyStopRow): string {
  const from = Number(stop.typical_from_month);
  const to = Number(stop.typical_to_month);
  if (stop.kind === "start") return "태어난 날";
  if (from === to) return `${from}개월`;
  return `흔히 ${from}~${to}개월 사이`;
}

const nodeStyles: Record<JourneyStopState, string> = {
  passed: "bg-white border-lavender-200",
  now: "bg-lavender-100 border-lavender-400 ring-4 ring-lavender-100",
  upcoming: "bg-white border-dashed border-lavender-200",
};

/**
 * 성장지도 타임라인.
 * 시기는 "흔히 관찰되는 범위"로만 표현하고, 지나간 정거장을 "놓쳤다"고 표현하지 않는다.
 */
export function JourneyMap({ babyName, ageLabel, position, discovered, photoUrl }: JourneyMapProps) {
  const items: Array<{ type: "stop"; index: number } | { type: "marker" }> = [];
  if (position.markerAfterIndex < 0) items.push({ type: "marker" });
  position.stops.forEach((_, index) => {
    items.push({ type: "stop", index });
    if (index === position.markerAfterIndex) items.push({ type: "marker" });
  });

  return (
    <ol className="relative ml-1 space-y-3 border-l-[3px] border-dotted border-lavender-200 pl-6" aria-label="성장지도">
      {items.map((item) => {
        if (item.type === "marker") {
          return (
            <li key="marker" className="relative" aria-current="step">
              <span className="absolute -left-[2.35rem] top-1/2 flex size-9 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-star-300 text-lg shadow-md">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 짧은 만료의 비공개 signed URL
                  <img src={photoUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span aria-hidden>👶</span>
                )}
              </span>
              <div className="rounded-2xl bg-star-300 px-4 py-3 font-bold text-ink shadow-[var(--shadow-soft)]">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-5 animate-twinkle" /> 지금 {withTopic(babyName)} 여기 있어요
                </span>
                <span className="block text-sm font-semibold text-ink/70">{ageLabel}</span>
              </div>
            </li>
          );
        }

        const { stop, state } = position.stops[item.index];
        const discoveredOn = discovered.get(stop.id) ?? null;
        return (
          <li key={stop.id} className="relative">
            <span
              className={`absolute -left-[2.2rem] top-5 flex size-8 items-center justify-center rounded-full border-2 text-base ${nodeStyles[state]}`}
              aria-hidden
            >
              {discoveredOn ? <Star className="size-5" /> : stop.emoji}
            </span>
            <details
              className={`group rounded-[var(--radius-card)] border bg-white shadow-[var(--shadow-soft)] ${state === "now" ? "border-lavender-300" : "border-line"} ${state === "upcoming" && !discoveredOn ? "opacity-90" : ""}`}
            >
              <summary className="flex min-h-16 items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[16px] font-bold text-ink">
                      {stop.emoji} {stop.title}
                    </span>
                    {state === "now" ? (
                      <span className="rounded-full bg-lavender-100 px-2 py-0.5 text-[11px] font-bold text-lavender-700">지금 시기</span>
                    ) : null}
                    {discoveredOn ? (
                      <span className="rounded-full bg-star-100 px-2 py-0.5 text-[11px] font-bold text-star-700">
                        ⭐ {formatDotDate(discoveredOn)} 발견
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink-faint">{formatTypicalRange(stop)}</span>
                </span>
                <span aria-hidden className="text-ink-faint transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>
              <div className="space-y-3 border-t border-line px-4 py-4 text-[15px] leading-relaxed text-ink-soft">
                {stop.summary ? <p className="font-semibold text-ink">{stop.summary}</p> : null}
                {stop.description ? <p>{stop.description}</p> : null}
                {stop.tips.length > 0 ? (
                  <ul className="space-y-1.5">
                    {stop.tips.map((tip) => (
                      <li key={tip} className="flex gap-2">
                        <span aria-hidden>🌟</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {stop.kind !== "start" ? (
                  <Link
                    href={`/baby/milestones?stop=${stop.slug}`}
                    className="inline-flex min-h-11 items-center rounded-2xl bg-lavender-50 px-4 text-sm font-semibold text-lavender-700"
                  >
                    {discoveredOn ? "기록 보기" : "⭐ 이 순간 기록하기"}
                  </Link>
                ) : null}
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
