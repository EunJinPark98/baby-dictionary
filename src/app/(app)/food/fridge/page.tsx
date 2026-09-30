import { Fridge } from "@/components/food/fridge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { getOptionalBabyContext } from "@/lib/queries/baby";
import { getFoods, getRecipes } from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "이유식 냉장고 — 있는 재료로 이유식 찾기",
  description: "냉장고에 있는 재료를 고르면 지금 만들 수 있는 이유식 레시피를 찾아드려요.",
  path: "/food/fridge",
});

export default async function FridgePage() {
  const [context, foods, recipes] = await Promise.all([getOptionalBabyContext(), getFoods(), getRecipes()]);

  return (
    <div>
      <PageHeader
        back={{ href: "/food", label: "이유식" }}
        title="🧊 이유식 냉장고"
        description="가지고 있는 재료로 오늘 만들 수 있는 이유식을 찾아보세요."
      />
      {foods.length === 0 || recipes.length === 0 ? (
        <EmptyState emoji="🧊" title="재료와 레시피 정보를 준비하고 있어요" />
      ) : (
        <Fridge
          month={context?.age.months ?? null}
          foods={foods.map((f) => ({ id: f.id, name: f.name, emoji: f.emoji, category: f.category, is_pantry_staple: f.is_pantry_staple }))}
          recipes={recipes.map((r) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            emoji: r.emoji,
            min_month: r.min_month,
            max_month: r.max_month,
            ingredients: r.ingredients.map((i) => ({ food_id: i.food_id, is_optional: i.is_optional })),
          }))}
        />
      )}
    </div>
  );
}
