import Link from "next/link";
import { RecipeCard } from "@/components/food/recipe-card";
import { SampleBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, LinkCard } from "@/components/ui/card";
import { Callout, Disclaimer } from "@/components/ui/notice";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { EmptyState } from "@/components/ui/states";
import { pickForMonth, selectForMonth } from "@/lib/content/select";
import { withSubject } from "@/lib/korean";
import { formatMonthRange } from "@/lib/labels";
import { getOptionalBabyContext } from "@/lib/queries/baby";
import { getFeedingStages, getRecipes, getSourcesFor } from "@/lib/queries/content";
import { getFoodRecords } from "@/lib/queries/records";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "월령별 이유식 가이드",
  description: "초기·중기·후기·완료기 이유식 단계, 재료 도감, 레시피, 먹어본 재료 기록과 냉장고 재료로 만들 수 있는 이유식 찾기.",
  path: "/food",
});

const MENU = [
  { href: "/food/ingredients", emoji: "📖", title: "재료 도감", description: "재료별 시기·조리법·주의사항" },
  { href: "/food/recipes", emoji: "🥣", title: "이유식 레시피", description: "월령별 레시피 모음" },
  { href: "/food/fridge", emoji: "🧊", title: "이유식 냉장고", description: "있는 재료로 만들 수 있는 메뉴" },
  { href: "/food/tried", emoji: "✅", title: "먹어본 재료", description: "처음 먹은 날·반응 기록" },
] as const;

export default async function FoodPage() {
  const [context, stages, recipes] = await Promise.all([getOptionalBabyContext(), getFeedingStages(), getRecipes()]);
  const month = context?.age.months ?? null;
  const stage = month !== null ? pickForMonth(stages, month) : null;
  const recipesNow = month !== null ? selectForMonth(recipes, month).slice(0, 4) : [];
  const triedCount = context ? (await getFoodRecords(context.baby.id)).length : null;
  const sources = await getSourcesFor(
    "feeding_stage",
    stages.map((s) => s.id),
  );

  return (
    <div>
      <PageHeader
        eyebrow={context ? `${context.baby.name} · ${context.age.months}개월` : "이유식"}
        title={context ? "지금 우리 아기 이유식" : "월령별 이유식 가이드"}
        description="이유식 단계와 시기는 참고용이에요. 아기의 준비 신호와 소아청소년과 상담을 함께 고려해 주세요."
      />

      {triedCount !== null ? (
        <LinkCard href="/food/tried" tone="star" className="mb-4 flex items-center justify-between gap-3">
          <span className="text-[15px] font-semibold text-ink">
            ✦ 지금까지 <strong className="text-gold-700">{triedCount}가지</strong> 재료를 경험했어요
          </span>
          <span aria-hidden className="text-ink-faint">
            ›
          </span>
        </LinkCard>
      ) : null}

      {stage ? (
        <Card tone="lavender" as="section">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gold-700">현재 참고 단계</span>
            <SampleBadge show={stage.is_sample} />
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-ink">{stage.title}</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{stage.summary}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-surface px-3 py-2.5">
              <dt className="text-[12px] font-semibold text-ink-faint">질감</dt>
              <dd className="font-semibold text-ink">{stage.texture || "-"}</dd>
            </div>
            <div className="rounded-2xl bg-surface px-3 py-2.5">
              <dt className="text-[12px] font-semibold text-ink-faint">횟수</dt>
              <dd className="font-semibold text-ink">{stage.frequency || "-"}</dd>
            </div>
          </dl>
          {stage.tips.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-ink">
              {stage.tips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span aria-hidden>🥄</span>
                  {tip}
                </li>
              ))}
            </ul>
          ) : null}
          {stage.cautions.length > 0 ? (
            <div className="mt-3 space-y-2">
              {stage.cautions.map((caution) => (
                <Callout key={caution} emoji="⚠️" tone="blush">
                  {caution}
                </Callout>
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}

      <ul className="mt-4 grid grid-cols-2 gap-3">
        {MENU.map((item) => (
          <li key={item.href}>
            <LinkCard href={item.href} className="h-full p-4">
              <span aria-hidden className="text-2xl">
                {item.emoji}
              </span>
              <span className="mt-1 block font-bold text-ink">{item.title}</span>
              <span className="text-[13px] text-ink-soft">{item.description}</span>
            </LinkCard>
          </li>
        ))}
      </ul>

      {recipesNow.length > 0 && context ? (
        <>
          <SectionTitle
            action={
              <Link href="/food/recipes" className="min-h-11 content-center text-sm font-semibold text-gold-700">
                전체 ›
              </Link>
            }
          >
            {withSubject(context.baby.name)} 먹어볼 만한 레시피
          </SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2">
            {recipesNow.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <SectionTitle>이유식 단계 한눈에 보기</SectionTitle>
      {stages.length === 0 ? (
        <EmptyState emoji="🥣" title="이유식 단계 정보를 준비하고 있어요" />
      ) : (
        <ol className="space-y-2">
          {stages.map((s) => (
            <li
              key={s.id}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${s.id === stage?.id ? "border-gold-300 bg-gold-50" : "border-line bg-surface"}`}
            >
              <span className="w-20 shrink-0 text-sm font-bold text-gold-700">{formatMonthRange(s.min_month, s.max_month)}</span>
              <span className="min-w-0">
                <span className="block font-semibold text-ink">{s.title}</span>
                <span className="block text-[13px] text-ink-soft">{s.texture}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {!context ? (
        <div className="mt-6">
          <Link href="/onboarding" className={buttonClass("primary", "lg", "w-full")}>
            ✦ 우리 아기 맞춤 이유식 보기
          </Link>
        </div>
      ) : null}

      <Disclaimer className="mt-6">
        이유식 시작 시기와 진행 속도는 아기마다 달라요. 알레르기가 걱정되거나 이상 반응이 있다면 소아청소년과와 상담하세요.
      </Disclaimer>
      <SourceFooter
        sources={sources}
        reviewedDates={stages.map((s) => s.reviewed_at)}
        hasSample={stages.some((s) => s.is_sample)}
      />
    </div>
  );
}
