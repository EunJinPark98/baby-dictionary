import { RecipeCard } from "@/components/food/recipe-card";
import { MonthTabs, parseMonthParam } from "@/components/ui/month-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { selectForMonth } from "@/lib/content/select";
import { getOptionalBabyContext } from "@/lib/queries/baby";
import { getRecipes } from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "월령별 이유식 레시피",
  description: "쌀미음부터 진밥까지, 월령에 맞는 이유식 레시피와 재료, 분량, 만드는 방법.",
  path: "/food/recipes",
});

export default async function RecipesPage({ searchParams }: PageProps<"/food/recipes">) {
  const [params, context, recipes] = await Promise.all([searchParams, getOptionalBabyContext(), getRecipes()]);
  const currentMonth = context ? Math.min(context.age.months, 12) : null;
  const month = parseMonthParam(params.m, currentMonth ?? 6);
  const list = selectForMonth(recipes, month);

  return (
    <div>
      <PageHeader back={{ href: "/food", label: "이유식" }} title="이유식 레시피" description="월령을 선택하면 그 시기에 참고할 만한 레시피를 보여드려요." />
      <MonthTabs basePath="/food/recipes" selected={month} current={currentMonth} />
      {list.length === 0 ? (
        <EmptyState emoji="🥣" title={`${month}개월에 맞는 레시피가 아직 없어요`} description="다른 월령을 선택해 보세요." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
