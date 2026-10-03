import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Badge, SampleBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/notice";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { getSiteUrl } from "@/lib/env";
import { formatMonthRange } from "@/lib/labels";
import { getRecipeBySlug, getRecipes, getSourcesFor } from "@/lib/queries/content";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  // 빌드 시 콘텐츠를 못 불러와도 배포는 계속되게 한다 (페이지는 요청 시점에 생성됨).
  const recipes = await getRecipes().catch((error: unknown) => {
    console.error("[build] getRecipes failed; pages will be generated on demand.", error);
    return [];
  });
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/food/recipes/[slug]">) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return {};
  return pageMetadata({
    title: `${recipe.title} — ${formatMonthRange(recipe.min_month, recipe.max_month)} 이유식 레시피`,
    description: `${recipe.description} 재료: ${recipe.ingredients.map((i) => i.food?.name).filter(Boolean).join(", ")}.`,
    path: `/food/recipes/${recipe.slug}`,
    type: "article",
  });
}

export default async function RecipeDetailPage({ params }: PageProps<"/food/recipes/[slug]">) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();
  const sources = await getSourcesFor("recipe", [recipe.id]);
  const allergens = recipe.ingredients.filter((i) => i.food?.is_common_allergen);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    url: `${getSiteUrl()}/food/recipes/${recipe.slug}`,
    recipeCategory: "이유식",
    recipeYield: recipe.servings || undefined,
    totalTime: recipe.cook_minutes ? `PT${recipe.cook_minutes}M` : undefined,
    recipeIngredient: [
      ...recipe.ingredients.map((i) => `${i.food?.name ?? ""} ${i.amount}`.trim()),
      ...recipe.extra_ingredients,
    ],
    recipeInstructions: recipe.steps.map((text) => ({ "@type": "HowToStep", text })),
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        // JSON-LD 는 서버에서 만든 신뢰 가능한 데이터. '<' 를 이스케이프해 스크립트 삽입을 막는다.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHeader
        back={{ href: "/food/recipes", label: "레시피" }}
        icon={recipe.emoji}
        title={`${recipe.title}`}
        description={recipe.description}
        action={<FavoriteButton contentType="recipe" contentId={recipe.id} />}
      />
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="star">추천 {formatMonthRange(recipe.min_month, recipe.max_month)}</Badge>
        {recipe.cook_minutes ? <Badge tone="gray">약 {recipe.cook_minutes}분</Badge> : null}
        <SampleBadge show={recipe.is_sample} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <dt className="text-[13px] font-semibold text-ink-faint">분량</dt>
          <dd className="mt-0.5 font-bold text-ink">{recipe.servings || "-"}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <dt className="text-[13px] font-semibold text-ink-faint">질감</dt>
          <dd className="mt-0.5 font-bold text-ink">{recipe.texture || "-"}</dd>
        </div>
      </dl>

      <SectionTitle>재료</SectionTitle>
      <Card>
        <ul className="divide-y divide-line">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.food_id} className="flex min-h-12 items-center justify-between gap-3 py-2">
              {ingredient.food ? (
                <Link href={`/food/ingredients/${ingredient.food.slug}`} className="font-semibold text-ink underline decoration-gold-200 underline-offset-4">
                  {ingredient.food.emoji} {ingredient.food.name}
                  {ingredient.is_optional ? <span className="ml-1 text-[13px] font-normal text-ink-faint">(선택)</span> : null}
                </Link>
              ) : (
                <span>재료</span>
              )}
              <span className="shrink-0 text-ink-soft">{ingredient.amount}</span>
            </li>
          ))}
          {recipe.extra_ingredients.map((extra) => (
            <li key={extra} className="flex min-h-12 items-center py-2 text-ink-soft">
              {extra}
            </li>
          ))}
        </ul>
      </Card>

      {recipe.steps.length > 0 ? (
        <>
          <SectionTitle>만드는 방법</SectionTitle>
          <Card>
            <ol className="space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-[16px] leading-relaxed text-ink">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-star-100 text-sm font-bold text-star-700">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </>
      ) : null}

      {recipe.allergy_note || allergens.length > 0 ? (
        <>
          <SectionTitle>알레르기 주의</SectionTitle>
          <Callout emoji="⚠️" tone="blush">
            {allergens.length > 0 ? (
              <p className="font-semibold">알레르기 유발 가능 재료: {allergens.map((a) => a.food?.name).join(", ")}</p>
            ) : null}
            {recipe.allergy_note ? <p className="mt-0.5">{recipe.allergy_note}</p> : null}
            <p className="mt-0.5">처음 먹는 재료는 한 가지씩, 오전에 소량으로 시작하고 아기의 반응을 살펴보세요.</p>
          </Callout>
        </>
      ) : null}

      <SourceFooter sources={sources} reviewedDates={[recipe.reviewed_at]} hasSample={recipe.is_sample} />
    </article>
  );
}
