/**
 * 이유식 냉장고: 가진 재료로 만들 수 있는 레시피 찾기 (순수 함수, AI 미사용).
 *
 * - 필수 재료(is_optional=false)가 모두 있으면 "지금 만들 수 있어요"
 * - 필수 재료가 maxMissing 개 이하로 부족하면 "조금만 더 있으면"
 * - 선택 재료는 매칭 판단에 쓰지 않고, 가진 선택 재료 수로 정렬 가중치만 준다.
 */
export interface MatchableIngredient {
  food_id: string;
  is_optional: boolean;
}

export interface MatchableRecipe {
  id: string;
  ingredients: readonly MatchableIngredient[];
}

export interface RecipeMatch<R extends MatchableRecipe> {
  recipe: R;
  /** 부족한 필수 재료의 food_id */
  missing: string[];
  /** 가진 재료 중 레시피에 쓰이는 재료 수 (필수+선택) */
  usedCount: number;
}

export interface RecipeMatchResult<R extends MatchableRecipe> {
  ready: RecipeMatch<R>[];
  almost: RecipeMatch<R>[];
}

export function matchRecipes<R extends MatchableRecipe>(
  recipes: readonly R[],
  availableFoodIds: Iterable<string>,
  options: { maxMissing?: number } = {},
): RecipeMatchResult<R> {
  const maxMissing = options.maxMissing ?? 1;
  const available = new Set(availableFoodIds);
  const ready: RecipeMatch<R>[] = [];
  const almost: RecipeMatch<R>[] = [];

  for (const recipe of recipes) {
    const required = recipe.ingredients.filter((i) => !i.is_optional);
    if (required.length === 0) continue;

    const missing = required.filter((i) => !available.has(i.food_id)).map((i) => i.food_id);
    const usedCount = recipe.ingredients.filter((i) => available.has(i.food_id)).length;
    // 가진 재료를 하나도 쓰지 않는 레시피는 추천하지 않는다.
    if (usedCount === 0) continue;

    const match = { recipe, missing, usedCount };
    if (missing.length === 0) ready.push(match);
    else if (missing.length <= maxMissing) almost.push(match);
  }

  const byUsefulness = (a: RecipeMatch<R>, b: RecipeMatch<R>) =>
    a.missing.length - b.missing.length || b.usedCount - a.usedCount;

  return { ready: ready.sort(byUsefulness), almost: almost.sort(byUsefulness) };
}
