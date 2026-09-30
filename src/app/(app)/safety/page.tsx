import { SampleBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Disclaimer } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { EmptyState } from "@/components/ui/states";
import { formatMonthRange } from "@/lib/labels";
import { getSafetyGuides, getSourcesFor } from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "월령별 아기 안전 체크리스트",
  description: "뒤집기, 기기, 잡고 서기, 걷기 등 움직임이 늘어나는 시기별로 집안 안전을 점검해 보세요.",
  path: "/safety",
});

export default async function SafetyPage() {
  const guides = await getSafetyGuides();
  const sorted = [...guides].sort((a, b) => a.min_month - b.min_month || a.sort_order - b.sort_order);
  const sources = await getSourcesFor(
    "safety_guide",
    sorted.map((g) => g.id),
  );

  return (
    <div>
      <PageHeader
        back={{ href: "/today", label: "오늘" }}
        eyebrow="건강·안전"
        title="시기별 안전 체크"
        description="아기의 움직임이 달라질 때마다 집안의 위험 요소도 달라져요."
      />
      {sorted.length === 0 ? (
        <EmptyState emoji="🛡️" title="안전 정보를 준비하고 있어요" />
      ) : (
        <ul className="space-y-3">
          {sorted.map((guide) => (
            <li key={guide.id}>
              <Card as="article">
                <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-lavender-700">
                  {guide.trigger_label ? <span>{guide.trigger_label}</span> : null}
                  <span className="text-ink-faint">{formatMonthRange(guide.min_month, guide.max_month)}</span>
                  <SampleBadge show={guide.is_sample} />
                </div>
                <h2 className="mt-1 text-lg font-bold text-ink">
                  {guide.emoji} {guide.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{guide.summary}</p>
                {guide.checklist.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 rounded-2xl bg-sky-50 p-3 text-[15px] leading-relaxed text-ink">
                    {guide.checklist.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span aria-hidden>✔️</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Disclaimer className="mt-6">응급 상황이 의심되면 즉시 119 또는 가까운 응급실에 연락하세요. 이 페이지는 일반적인 예방 정보만 제공해요.</Disclaimer>
      <SourceFooter
        sources={sources}
        reviewedDates={sorted.map((g) => g.reviewed_at)}
        hasSample={sorted.some((g) => g.is_sample)}
      />
    </div>
  );
}
