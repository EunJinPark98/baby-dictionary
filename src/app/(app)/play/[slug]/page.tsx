import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { SampleBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/notice";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { ACTIVITY_CATEGORIES, formatMonthRange } from "@/lib/labels";
import { getActivities, getActivityBySlug, getSourcesFor } from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const activities = await getActivities();
  return activities.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/play/[slug]">) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) return {};
  return pageMetadata({
    title: `${activity.title} — ${formatMonthRange(activity.min_month, activity.max_month)} 아기 놀이`,
    description: activity.description || `${formatMonthRange(activity.min_month, activity.max_month)} 아기와 함께하는 ${activity.title} 놀이 방법과 주의사항.`,
    path: `/play/${activity.slug}`,
    type: "article",
  });
}

export default async function ActivityDetailPage({ params }: PageProps<"/play/[slug]">) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) notFound();
  const sources = await getSourcesFor("activity", [activity.id]);

  return (
    <article>
      <PageHeader
        back={{ href: "/play", label: "놀이" }}
        title={
          <span>
            <span aria-hidden>{activity.emoji}</span> {activity.title}
          </span>
        }
        description={activity.description}
        action={<FavoriteButton contentType="activity" contentId={activity.id} loginNext={`/play/${activity.slug}`} />}
      />
      <SampleBadge show={activity.is_sample} />

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <InfoTile label="추천 시기" value={formatMonthRange(activity.min_month, activity.max_month)} />
        <InfoTile label="예상 시간" value={activity.duration_minutes ? `${activity.duration_minutes}분` : "자유롭게"} />
        <div className="col-span-2 rounded-2xl border border-line bg-white px-4 py-3">
          <dt className="text-[13px] font-semibold text-ink-faint">발달 영역</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {activity.categories.map((category) => (
              <span key={category} className="rounded-full bg-lavender-50 px-2.5 py-1 text-sm font-semibold text-lavender-700">
                {ACTIVITY_CATEGORIES[category].emoji} {ACTIVITY_CATEGORIES[category].label}
              </span>
            ))}
          </dd>
        </div>
        <div className="col-span-2 rounded-2xl border border-line bg-white px-4 py-3">
          <dt className="text-[13px] font-semibold text-ink-faint">준비물</dt>
          <dd className="mt-0.5 text-[16px] font-semibold text-ink">{activity.materials || "없음"}</dd>
        </div>
      </dl>

      {activity.steps.length > 0 ? (
        <>
          <SectionTitle>방법</SectionTitle>
          <Card>
            <ol className="space-y-3">
              {activity.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-[16px] leading-relaxed text-ink">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-lavender-100 text-sm font-bold text-lavender-700">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </>
      ) : null}

      {activity.cautions.length > 0 ? (
        <>
          <SectionTitle>주의사항</SectionTitle>
          <div className="space-y-2">
            {activity.cautions.map((caution) => (
              <Callout key={caution} emoji="⚠️" tone="blush">
                {caution}
              </Callout>
            ))}
          </div>
        </>
      ) : null}

      <p className="mt-6 text-[13px] leading-relaxed text-ink-faint">
        아기가 흥미를 보이지 않거나 피곤해하면 쉬어도 괜찮아요. 놀이는 발달을 평가하는 도구가 아니에요.
      </p>
      <SourceFooter sources={sources} reviewedDates={[activity.reviewed_at]} hasSample={activity.is_sample} />
    </article>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3">
      <dt className="text-[13px] font-semibold text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-[16px] font-bold text-ink">{value}</dd>
    </div>
  );
}
