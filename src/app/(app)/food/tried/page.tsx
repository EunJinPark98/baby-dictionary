import { TriedFoodGrid } from "@/components/food/tried-food-grid";
import { Disclaimer } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { withPossessive } from "@/lib/korean";
import { FOOD_CATEGORY_ORDER } from "@/lib/labels";
import { getBabyContext } from "@/lib/queries/baby";
import { getFoods } from "@/lib/queries/content";
import { getFoodRecords } from "@/lib/queries/records";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("먹어본 재료");

export default async function TriedFoodsPage() {
  const { baby } = await getBabyContext();
  const [foods, records] = await Promise.all([getFoods(), getFoodRecords(baby.id)]);
  const recordByFood = new Map(records.map((r) => [r.food_id, r]));
  const categories = FOOD_CATEGORY_ORDER.filter((c) => foods.some((f) => f.category === c));

  return (
    <div>
      <PageHeader
        back={{ href: "/food", label: "이유식" }}
        eyebrow={withPossessive(baby.name)}
        title="먹어본 재료"
        description="재료를 누르면 오늘 날짜로 기록돼요. 처음 먹은 날, 반응, 메모는 '자세히 기록'에서 남길 수 있어요."
      />
      {foods.length === 0 ? (
        <EmptyState emoji="🥕" title="재료 정보를 준비하고 있어요" />
      ) : (
        <TriedFoodGrid
          babyId={baby.id}
          categories={categories}
          foods={foods.map((f) => ({
            id: f.id,
            slug: f.slug,
            name: f.name,
            emoji: f.emoji,
            category: f.category,
            tried: recordByFood.has(f.id),
            preference: recordByFood.get(f.id)?.preference ?? null,
          }))}
        />
      )}
      <Disclaimer className="mt-2">
        반응 기록은 부모의 관찰 메모예요. 서비스는 이를 의료적으로 해석하지 않아요. 걱정되는 반응이 있다면 소아청소년과와 상담하세요.
      </Disclaimer>
    </div>
  );
}
