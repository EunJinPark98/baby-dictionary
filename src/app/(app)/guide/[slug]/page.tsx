import Link from "next/link";
import { notFound } from "next/navigation";
import { DevelopmentItemCard } from "@/components/development/development-item-card";
import { ActivityCard } from "@/components/play/activity-card";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Disclaimer } from "@/components/ui/notice";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { EmptyState } from "@/components/ui/states";
import { pickForMonth, selectForMonth } from "@/lib/content/select";
import { GUIDE_MAX_MONTH, guideMonths, guideSlug, parseGuideSlug } from "@/lib/guide";
import { DEVELOPMENT_DOMAINS, DEVELOPMENT_DOMAIN_ORDER } from "@/lib/labels";
import {
  getActivities,
  getDevelopmentItems,
  getFeedingStages,
  getSafetyGuides,
  getSourcesForMany,
} from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return guideMonths().map((month) => ({ slug: guideSlug(month) }));
}

export async function generateMetadata({ params }: PageProps<"/guide/[slug]">) {
  const { slug } = await params;
  const month = parseGuideSlug(slug);
  if (month === null) return {};
  return pageMetadata({
    title: `${month}개월 아기 발달·놀이·이유식 가이드`,
    description: `생후 ${month}개월 아기에게 관찰될 수 있는 발달 모습과 추천 놀이, 이유식, 안전 정보를 정리했어요. 아기마다 발달 속도에는 차이가 있어요.`,
    path: `/guide/${slug}`,
    type: "article",
  });
}

export default async function MonthGuidePage({ params }: PageProps<"/guide/[slug]">) {
  const { slug } = await params;
  const month = parseGuideSlug(slug);
  if (month === null) notFound();

  const [developmentItems, activities, feedingStages, safetyGuides] = await Promise.all([
    getDevelopmentItems(),
    getActivities(),
    getFeedingStages(),
    getSafetyGuides(),
  ]);
  const development = selectForMonth(developmentItems, month);
  const activitiesNow = selectForMonth(activities, month).slice(0, 4);
  const feeding = pickForMonth(feedingStages, month);
  const safety = selectForMonth(safetyGuides, month);
  const sources = await getSourcesForMany([
    { type: "development_item", ids: development.map((i) => i.id) },
    { type: "activity", ids: activitiesNow.map((i) => i.id) },
    { type: "feeding_stage", ids: feeding ? [feeding.id] : [] },
    { type: "safety_guide", ids: safety.map((i) => i.id) },
  ]);
  const shown = [...development, ...activitiesNow, ...(feeding ? [feeding] : []), ...safety];

  return (
    <div>
      <PageHeader
        back={{ href: "/guide", label: "월령별 가이드" }}
        eyebrow="이번 달 가이드"
        title={`${month}개월 아기 성장 가이드`}
        description="이 시기에 관찰될 수 있는 모습과 함께 해볼 수 있는 것들이에요."
      />
      <Disclaimer className="mb-2" />

      <SectionTitle>🧠 발달</SectionTitle>
      {development.length === 0 ? (
        <EmptyState title="이 달의 발달 정보를 준비하고 있어요" />
      ) : (
        DEVELOPMENT_DOMAIN_ORDER.map((domain) => {
          const items = development.filter((i) => i.domain === domain);
          if (items.length === 0) return null;
          return (
            <div key={domain} className="mb-4">
              <h3 className="mb-2 text-sm font-bold text-ink-soft">
                {DEVELOPMENT_DOMAINS[domain].emoji} {DEVELOPMENT_DOMAINS[domain].label}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id}>
                    <DevelopmentItemCard item={item} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}

      {activitiesNow.length > 0 ? (
        <>
          <SectionTitle>🎈 추천 놀이</SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2">
            {activitiesNow.map((activity) => (
              <li key={activity.id}>
                <ActivityCard activity={activity} />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {feeding ? (
        <>
          <SectionTitle>🥣 이유식</SectionTitle>
          <Card tone="star">
            <p className="font-bold text-ink">{feeding.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{feeding.summary}</p>
            <Link href="/food" className={buttonClass("secondary", "sm", "mt-3")}>
              이유식 가이드 보기
            </Link>
          </Card>
        </>
      ) : null}

      {safety.length > 0 ? (
        <>
          <SectionTitle>⚠️ 안전</SectionTitle>
          <ul className="space-y-2">
            {safety.map((guide) => (
              <li key={guide.id} className="rounded-2xl border border-line bg-white px-4 py-3">
                <p className="font-semibold text-ink">
                  {guide.emoji} {guide.title}
                </p>
                <p className="mt-0.5 text-sm text-ink-soft">{guide.summary}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <nav aria-label="다른 월령" className="mt-8 grid grid-cols-2 gap-2">
        {month > 0 ? (
          <Link href={`/guide/${guideSlug(month - 1)}`} className={buttonClass("secondary", "md")}>
            ‹ {month - 1}개월
          </Link>
        ) : (
          <span />
        )}
        {month < GUIDE_MAX_MONTH ? (
          <Link href={`/guide/${guideSlug(month + 1)}`} className={buttonClass("secondary", "md")}>
            {month + 1}개월 ›
          </Link>
        ) : null}
      </nav>

      <SourceFooter
        sources={sources}
        reviewedDates={shown.map((c) => c.reviewed_at)}
        hasSample={shown.some((c) => c.is_sample)}
      />
    </div>
  );
}
