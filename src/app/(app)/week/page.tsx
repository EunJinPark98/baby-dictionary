import Link from "next/link";
import { SampleBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Callout, Disclaimer } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { EmptyState } from "@/components/ui/states";
import { pickWeeklyGuide } from "@/lib/content/select";
import { getBabyContext } from "@/lib/queries/baby";
import { getSourcesFor, getWeeklyGuides } from "@/lib/queries/content";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("이번 주 우리 아기");

const MAX_WEEK = 60;

const SECTIONS = [
  { key: "development", emoji: "🧠", label: "이번 주 발달", tone: "lavender" },
  { key: "play", emoji: "🎈", label: "추천 놀이", tone: "blush" },
  { key: "food_tip", emoji: "🥣", label: "이유식 TIP", tone: "star" },
  { key: "life_tip", emoji: "🦷", label: "생활 TIP", tone: "mint" },
  { key: "safety_tip", emoji: "⚠️", label: "안전 TIP", tone: "sky" },
] as const;

export default async function WeekPage({ searchParams }: PageProps<"/week">) {
  const { baby, age } = await getBabyContext();
  const params = await searchParams;
  const requested = Number.parseInt(typeof params.w === "string" ? params.w : "", 10);
  const week = Number.isInteger(requested) && requested >= 0 && requested <= MAX_WEEK ? requested : age.weeks;
  const isCurrentWeek = week === age.weeks;

  const guides = await getWeeklyGuides();
  const picked = pickWeeklyGuide(guides, week);
  const sources = picked ? await getSourcesFor("weekly_guide", [picked.guide.id]) : [];

  return (
    <div>
      <PageHeader
        back={{ href: "/today", label: "오늘" }}
        eyebrow={isCurrentWeek ? `${baby.name}의 이번 주` : "다른 주 살펴보기"}
        title={`생후 ${week}주`}
        description={isCurrentWeek ? "매주 새로운 정보가 준비돼요. 다음 주에 또 만나요!" : undefined}
      />

      <nav aria-label="주차 이동" className="mb-5 grid grid-cols-3 gap-2">
        <WeekLink week={week - 1} label="‹ 지난주" disabled={week <= 0} />
        <WeekLink week={age.weeks} label="이번 주" disabled={isCurrentWeek} />
        <WeekLink week={week + 1} label="다음 주 ›" disabled={week >= MAX_WEEK} />
      </nav>

      {!picked ? (
        <EmptyState emoji="📅" title="주차별 가이드를 준비하고 있어요" />
      ) : (
        <div className="space-y-3">
          <Card tone="white">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-ink">{picked.guide.title}</h2>
              <SampleBadge show={picked.guide.is_sample} />
            </div>
            {!picked.isExact ? (
              <p className="mt-1 text-[13px] text-ink-faint">생후 {picked.guide.week}주 가이드를 함께 보여드려요.</p>
            ) : null}
          </Card>
          {SECTIONS.map((section) => {
            const text = picked.guide[section.key];
            if (!text) return null;
            return (
              <Card key={section.key} tone={section.tone} as="section">
                <h3 className="flex items-center gap-2 text-sm font-bold text-ink-soft">
                  <span aria-hidden className="text-lg">
                    {section.emoji}
                  </span>
                  {section.label}
                </h3>
                <p className="mt-1.5 text-[16px] leading-relaxed text-ink">{text}</p>
              </Card>
            );
          })}
          {isCurrentWeek ? (
            <Callout emoji="🗓️" tone="lavender">
              다음 주({age.weeks + 1}주)에는 새로운 이야기가 기다리고 있어요.
            </Callout>
          ) : null}
        </div>
      )}

      <Disclaimer className="mt-6" />
      <SourceFooter
        sources={sources}
        reviewedDates={picked ? [picked.guide.reviewed_at] : []}
        hasSample={picked?.guide.is_sample ?? false}
      />
    </div>
  );
}

function WeekLink({ week, label, disabled }: { week: number; label: string; disabled: boolean }) {
  const className =
    "flex min-h-12 items-center justify-center rounded-2xl border text-sm font-semibold";
  if (disabled) {
    return (
      <span aria-disabled className={`${className} border-line bg-line/40 text-ink-faint`}>
        {label}
      </span>
    );
  }
  return (
    <Link href={`/week?w=${week}`} className={`${className} border-line bg-white text-lavender-700 hover:bg-lavender-50`}>
      {label}
    </Link>
  );
}
