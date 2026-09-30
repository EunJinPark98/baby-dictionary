import { formatDotDate } from "@/lib/date/date-only";
import type { ContentSourceRow } from "@/lib/supabase/database.types";

interface SourceFooterProps {
  sources: readonly ContentSourceRow[];
  /** 화면에 표시된 콘텐츠들의 reviewed_at 값 */
  reviewedDates?: ReadonlyArray<string | null>;
  /** 샘플(검토 전) 콘텐츠가 섞여 있으면 true */
  hasSample?: boolean;
}

/**
 * 화면 하단 "정보 출처 / 최종 검토일".
 * 최종 검토일은 표시된 콘텐츠 중 가장 최근 검토일이며, 하나라도 미검토면 그 사실을 함께 알린다.
 */
export function SourceFooter({ sources, reviewedDates = [], hasSample = false }: SourceFooterProps) {
  const reviewed = reviewedDates.filter((d): d is string => Boolean(d)).sort();
  const latestReview = reviewed.at(-1) ?? null;
  const hasUnreviewed = reviewedDates.some((d) => !d);

  return (
    <footer className="mt-10 rounded-2xl border border-line bg-white/70 px-4 py-4 text-[13px] leading-relaxed text-ink-soft">
      <p className="font-bold text-ink">정보 출처</p>
      {sources.length > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {sources.map((source) => (
            <li key={source.id}>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-lavender-200 underline-offset-2 hover:text-lavender-700">
                  {source.organization} · {source.title}
                </a>
              ) : (
                <span>
                  {source.organization} · {source.title}
                </span>
              )}
              {source.published_at ? <span className="text-ink-faint"> ({formatDotDate(source.published_at)})</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1">등록된 출처가 없어요.</p>
      )}
      <p className="mt-3 font-bold text-ink">최종 검토일</p>
      <p className="mt-0.5">
        {latestReview ? formatDotDate(latestReview) : "전문가 검토 전"}
        {latestReview && hasUnreviewed ? " (일부 항목 검토 전)" : null}
      </p>
      {hasSample ? (
        <p className="mt-2 text-ink-faint">
          이 화면에는 서비스 동작 확인용 샘플 콘텐츠가 포함되어 있어요. 실제 육아 판단에는 공식 기관 자료와 전문가 상담을 활용해 주세요.
        </p>
      ) : null}
    </footer>
  );
}
