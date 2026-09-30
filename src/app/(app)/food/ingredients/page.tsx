import Link from "next/link";
import { FoodTile } from "@/components/food/food-tile";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { FOOD_CATEGORIES, FOOD_CATEGORY_ORDER } from "@/lib/labels";
import { getFoods } from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "이유식 재료 도감",
  description: "곡류, 채소, 과일, 육류, 생선, 달걀, 콩/두부, 유제품 — 이유식 재료별 참고 시기, 영양, 조리 방법과 알레르기 주의사항.",
  path: "/food/ingredients",
});

export default async function IngredientsPage() {
  const foods = await getFoods();
  const categories = FOOD_CATEGORY_ORDER.filter((c) => foods.some((f) => f.category === c));

  return (
    <div>
      <PageHeader back={{ href: "/food", label: "이유식" }} title="재료 도감" description="재료를 누르면 시기, 조리 방법, 관련 레시피를 볼 수 있어요." />

      {foods.length === 0 ? (
        <EmptyState emoji="📖" title="재료 정보를 준비하고 있어요" />
      ) : (
        <>
          <nav aria-label="재료 분류" className="-mx-4 overflow-x-auto px-4">
            <ul className="flex gap-2">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    href={`#${category}`}
                    className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink-soft"
                  >
                    {FOOD_CATEGORIES[category].emoji} {FOOD_CATEGORIES[category].label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {categories.map((category) => (
            <section key={category} aria-labelledby={category} className="scroll-mt-20">
              <SectionTitle id={category}>
                {FOOD_CATEGORIES[category].emoji} {FOOD_CATEGORIES[category].label}
              </SectionTitle>
              <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {foods
                  .filter((f) => f.category === category)
                  .map((food) => (
                    <li key={food.id}>
                      <FoodTile food={food} />
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
