import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { RecipeCard } from "@/components/food/recipe-card";
import { Badge, SampleBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/notice";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { FOOD_CATEGORIES } from "@/lib/labels";
import { getFoodBySlug, getFoods, getRecipesUsingFood, getSourcesFor } from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const foods = await getFoods();
  return foods.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/food/ingredients/[slug]">) {
  const { slug } = await params;
  const food = await getFoodBySlug(slug);
  if (!food) return {};
  const when = food.recommended_from_month !== null ? `${food.recommended_from_month}개월 전후부터 참고` : "";
  return pageMetadata({
    title: `이유식 ${food.name} — 시기·영양·조리법`,
    description: `${food.name} 이유식 ${when}. 영양 정보, 조리 방법, 함께 먹기 좋은 재료, 관련 레시피와 알레르기 주의사항.`.replace(/\s+/g, " "),
    path: `/food/ingredients/${food.slug}`,
    type: "article",
  });
}

export default async function IngredientDetailPage({ params }: PageProps<"/food/ingredients/[slug]">) {
  const { slug } = await params;
  const food = await getFoodBySlug(slug);
  if (!food) notFound();

  const [foods, recipes, sources] = await Promise.all([
    getFoods(),
    getRecipesUsingFood(food.id),
    getSourcesFor("food", [food.id]),
  ]);
  const pairings = food.pairings
    .map((pairSlug) => foods.find((f) => f.slug === pairSlug))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <article>
      <PageHeader
        back={{ href: "/food/ingredients", label: "재료 도감" }}
        title={
          <span>
            <span aria-hidden>{food.emoji}</span> {food.name}
          </span>
        }
        description={food.description}
        action={<FavoriteButton contentType="food" contentId={food.id} loginNext={`/food/ingredients/${food.slug}`} />}
      />
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="lavender">
          {FOOD_CATEGORIES[food.category].emoji} {FOOD_CATEGORIES[food.category].label}
        </Badge>
        {food.is_common_allergen ? <Badge tone="blush">알레르기 유발 가능 식품</Badge> : null}
        <SampleBadge show={food.is_sample} />
      </div>

      <dl className="mt-4 space-y-3">
        <InfoRow emoji="🗓️" label="권장/참고 시기" value={food.recommended_from_month !== null ? `${food.recommended_from_month}개월 전후부터 (참고용)` : "소아청소년과와 상담해 보세요"} />
        {food.nutrition ? <InfoRow emoji="🌱" label="영양 정보" value={food.nutrition} /> : null}
        {food.preparation ? <InfoRow emoji="🍳" label="조리 방법" value={food.preparation} /> : null}
      </dl>

      {food.allergy_note ? (
        <div className="mt-4">
          <Callout emoji="⚠️" tone="blush">
            <p className="font-semibold">알레르기 관련 주의사항</p>
            <p className="mt-0.5">{food.allergy_note}</p>
          </Callout>
        </div>
      ) : null}

      {pairings.length > 0 ? (
        <>
          <SectionTitle>함께 먹기 좋은 재료</SectionTitle>
          <ul className="flex flex-wrap gap-2">
            {pairings.map((pair) => (
              <li key={pair.id}>
                <Link
                  href={`/food/ingredients/${pair.slug}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-[15px] font-semibold text-ink"
                >
                  {pair.emoji} {pair.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <SectionTitle>관련 레시피</SectionTitle>
      {recipes.length === 0 ? (
        <p className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-ink-soft">아직 등록된 레시피가 없어요.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      )}

      <Link href={`/food/tried/${food.slug}`} className={buttonClass("secondary", "lg", "mt-6 w-full")}>
        ✅ 우리 아기 먹어본 기록 남기기
      </Link>

      <SourceFooter sources={sources} reviewedDates={[food.reviewed_at]} hasSample={food.is_sample} />
    </article>
  );
}

function InfoRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <Card className="p-4">
      <dt className="text-[13px] font-semibold text-ink-faint">
        <span aria-hidden>{emoji}</span> {label}
      </dt>
      <dd className="mt-1 text-[16px] leading-relaxed text-ink">{value}</dd>
    </Card>
  );
}
