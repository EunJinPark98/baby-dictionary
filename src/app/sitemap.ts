import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { guideMonths, guideSlug } from "@/lib/guide";
import { getActivities, getFoods, getRecipes } from "@/lib/queries/content";

export const revalidate = 3600;

/** 공개 콘텐츠만 포함한다. 개인 아기 페이지는 포함하지 않는다. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [foods, recipes, activities] = await Promise.all([
    getFoods().catch(() => []),
    getRecipes().catch(() => []),
    getActivities().catch(() => []),
  ]);

  const staticPaths = ["/", "/guide", "/food", "/food/ingredients", "/food/recipes", "/food/fridge", "/play", "/safety"];

  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...guideMonths().map((month) => ({ url: `${base}/guide/${guideSlug(month)}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...foods.map((food) => ({ url: `${base}/food/ingredients/${food.slug}`, lastModified: food.updated_at, priority: 0.6 })),
    ...recipes.map((recipe) => ({ url: `${base}/food/recipes/${recipe.slug}`, lastModified: recipe.updated_at, priority: 0.6 })),
    ...activities.map((activity) => ({ url: `${base}/play/${activity.slug}`, lastModified: activity.updated_at, priority: 0.6 })),
  ];
}
