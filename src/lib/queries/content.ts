import "server-only";

import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import type {
  ActivityRow,
  ContentSourceRow,
  ContentType,
  DevelopmentItemRow,
  FeedingStageRow,
  FoodRow,
  JourneyStopRow,
  RecipeIngredientRow,
  RecipeRow,
  SafetyGuideRow,
  VaccineRow,
  WeeklyGuideRow,
} from "@/lib/supabase/database.types";

/**
 * 공용 콘텐츠 조회 (읽기 전용, RLS: 게시된 항목만).
 *
 * 콘텐츠 양이 많지 않으므로 목록을 한 번에 가져와 lib/content/select.ts 의 순수 함수로 걸러낸다.
 * 이렇게 하면 월령 매칭 규칙이 SQL 과 TS 에 중복되지 않고, 테스트도 쉽다.
 * Supabase 미설정 시 빈 배열/null 을 반환한다.
 */

export class ContentQueryError extends Error {
  constructor(table: string, cause: unknown) {
    super(`콘텐츠를 불러오지 못했어요 (${table}).`, { cause });
    this.name = "ContentQueryError";
  }
}

function fail(table: string, error: unknown): never {
  throw new ContentQueryError(table, error);
}

export const getDevelopmentItems = cache(async (): Promise<DevelopmentItemRow[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("development_items")
    .select("*")
    .order("min_month")
    .order("sort_order");
  if (error) fail("development_items", error);
  return data;
});

export const getJourneyStops = cache(async (): Promise<JourneyStopRow[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("journey_stops").select("*").order("sort_order");
  if (error) fail("journey_stops", error);
  return data;
});

export const getWeeklyGuides = cache(async (): Promise<WeeklyGuideRow[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("weekly_guides").select("*").order("week");
  if (error) fail("weekly_guides", error);
  return data;
});

export const getFeedingStages = cache(async (): Promise<FeedingStageRow[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("feeding_stages").select("*").order("sort_order");
  if (error) fail("feeding_stages", error);
  return data;
});

export const getFoods = cache(async (): Promise<FoodRow[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("foods").select("*").order("sort_order");
  if (error) fail("foods", error);
  return data;
});

export const getFoodBySlug = cache(async (slug: string): Promise<FoodRow | null> => {
  const foods = await getFoods();
  return foods.find((f) => f.slug === slug) ?? null;
});

export type RecipeIngredientWithFood = Pick<RecipeIngredientRow, "food_id" | "amount" | "is_optional" | "sort_order"> & {
  food: Pick<FoodRow, "id" | "slug" | "name" | "emoji" | "is_common_allergen" | "is_pantry_staple"> | null;
};

export type RecipeWithIngredients = RecipeRow & { ingredients: RecipeIngredientWithFood[] };

export const getRecipes = cache(async (): Promise<RecipeWithIngredients[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "*, ingredients:recipe_ingredients(food_id, amount, is_optional, sort_order, food:foods(id, slug, name, emoji, is_common_allergen, is_pantry_staple))",
    )
    .order("sort_order");
  if (error) fail("recipes", error);
  return data.map((recipe) => ({
    ...recipe,
    ingredients: [...recipe.ingredients].sort((a, b) => a.sort_order - b.sort_order),
  }));
});

export const getRecipeBySlug = cache(async (slug: string): Promise<RecipeWithIngredients | null> => {
  const recipes = await getRecipes();
  return recipes.find((r) => r.slug === slug) ?? null;
});

export async function getRecipesUsingFood(foodId: string): Promise<RecipeWithIngredients[]> {
  const recipes = await getRecipes();
  return recipes.filter((r) => r.ingredients.some((i) => i.food_id === foodId));
}

export const getActivities = cache(async (): Promise<ActivityRow[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("activities").select("*").order("min_month").order("sort_order");
  if (error) fail("activities", error);
  return data;
});

export const getActivityBySlug = cache(async (slug: string): Promise<ActivityRow | null> => {
  const activities = await getActivities();
  return activities.find((a) => a.slug === slug) ?? null;
});

/** 활성화된 예방접종 일정 */
export const getVaccines = cache(async (): Promise<VaccineRow[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("vaccines")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) fail("vaccines", error);
  return data;
});

export const getSafetyGuides = cache(async (): Promise<SafetyGuideRow[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("safety_guides").select("*").order("sort_order");
  if (error) fail("safety_guides", error);
  return data;
});

/**
 * 콘텐츠 id 목록에 연결된 출처 (중복 제거).
 */
export async function getSourcesFor(contentType: ContentType, contentIds: readonly string[]): Promise<ContentSourceRow[]> {
  const supabase = getPublicClient();
  if (!supabase || contentIds.length === 0) return [];
  const { data, error } = await supabase
    .from("content_source_relations")
    .select("source:content_sources(*)")
    .eq("content_type", contentType)
    .in("content_id", [...new Set(contentIds)]);
  if (error) fail("content_source_relations", error);

  const unique = new Map<string, ContentSourceRow>();
  for (const row of data) {
    if (row.source) unique.set(row.source.id, row.source);
  }
  return [...unique.values()];
}

export interface SourceRef {
  type: ContentType;
  ids: readonly string[];
}

/** 여러 콘텐츠 종류의 출처를 한 번에 모은다 (화면 하단 "정보 출처") */
export async function getSourcesForMany(refs: readonly SourceRef[]): Promise<ContentSourceRow[]> {
  const lists = await Promise.all(refs.map((ref) => getSourcesFor(ref.type, ref.ids)));
  const unique = new Map<string, ContentSourceRow>();
  lists.flat().forEach((s) => unique.set(s.id, s));
  return [...unique.values()];
}
