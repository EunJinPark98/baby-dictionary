"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { matchRecipes } from "@/lib/food/match";
import { FOOD_CATEGORIES, FOOD_CATEGORY_ORDER, formatMonthRange } from "@/lib/labels";
import type { FoodCategory } from "@/lib/supabase/database.types";

export interface FridgeFood {
  id: string;
  name: string;
  emoji: string;
  category: FoodCategory;
  is_pantry_staple: boolean;
}

export interface FridgeRecipe {
  id: string;
  slug: string;
  title: string;
  emoji: string;
  min_month: number;
  max_month: number;
  ingredients: { food_id: string; is_optional: boolean }[];
}

const STORAGE_KEY = "bsm:fridge:v1";

function loadSaved(): { selected: string[]; assumeStaples: boolean } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "selected" in parsed &&
      Array.isArray(parsed.selected) &&
      "assumeStaples" in parsed &&
      typeof parsed.assumeStaples === "boolean"
    ) {
      return { selected: parsed.selected.filter((v): v is string => typeof v === "string"), assumeStaples: parsed.assumeStaples };
    }
  } catch {
    // 저장소 접근 불가(사생활 보호 모드 등) → 기본값 사용
  }
  return null;
}

/**
 * 이유식 냉장고: 가진 재료를 고르면 DB 레시피-재료 관계로 만들 수 있는 레시피를 찾는다 (AI 미사용).
 * 선택 상태는 이 기기의 브라우저에만 저장된다.
 */
export function Fridge({ foods, recipes, month }: { foods: FridgeFood[]; recipes: FridgeRecipe[]; month: number | null }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assumeStaples, setAssumeStaples] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // localStorage 는 브라우저에서만 읽을 수 있어 하이드레이션 이후 한 번만 복원한다 (외부 저장소 동기화).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setSelected(new Set(saved.selected));
      setAssumeStaples(saved.assumeStaples);
    }
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ selected: [...selected], assumeStaples }));
    } catch {
      // 저장 실패는 무시 (기능에는 영향 없음)
    }
  }, [selected, assumeStaples, loaded]);

  const staples = useMemo(() => foods.filter((f) => f.is_pantry_staple), [foods]);
  const choosable = foods.filter((f) => !(assumeStaples && f.is_pantry_staple));
  const foodById = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods]);

  const available = useMemo(() => {
    const ids = new Set(selected);
    if (assumeStaples) staples.forEach((f) => ids.add(f.id));
    return ids;
  }, [selected, assumeStaples, staples]);

  const result = useMemo(() => {
    const userPicked = new Set(selected);
    const matched = matchRecipes(recipes, available);
    // 기본 재료만으로 만드는 레시피(예: 쌀미음)는 사용자가 고른 재료가 있을 때만 의미가 있다.
    const usesPicked = (recipe: FridgeRecipe) => recipe.ingredients.some((i) => userPicked.has(i.food_id));
    const byMonth = (recipe: FridgeRecipe) => month === null || (recipe.min_month <= month + 1 && month <= recipe.max_month + 2);
    return {
      ready: matched.ready.filter((m) => usesPicked(m.recipe)).sort((a, b) => Number(byMonth(b.recipe)) - Number(byMonth(a.recipe))),
      almost: matched.almost.filter((m) => usesPicked(m.recipe)),
      byMonth,
    };
  }, [recipes, available, selected, month]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {staples.length > 0 ? (
        <label className="mb-4 flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4">
          <span className="text-[15px] font-semibold text-ink">
            기본 재료({staples.map((s) => s.name).join(", ")})는 있어요
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={assumeStaples}
            onChange={(e) => setAssumeStaples(e.target.checked)}
            className="size-6 accent-lavender-600"
          />
        </label>
      ) : null}

      <h2 className="mb-2 text-base font-bold text-ink">냉장고에 있는 재료를 골라주세요</h2>
      <div className="space-y-4">
        {FOOD_CATEGORY_ORDER.map((category) => {
          const list = choosable.filter((f) => f.category === category);
          if (list.length === 0) return null;
          return (
            <fieldset key={category}>
              <legend className="mb-1.5 text-sm font-semibold text-ink-soft">
                {FOOD_CATEGORIES[category].emoji} {FOOD_CATEGORIES[category].label}
              </legend>
              <div className="flex flex-wrap gap-2">
                {list.map((food) => {
                  const on = selected.has(food.id);
                  return (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => toggle(food.id)}
                      aria-pressed={on}
                      className={`inline-flex min-h-11 items-center gap-1 rounded-full border px-3.5 text-[15px] font-semibold transition-colors ${on ? "border-lavender-400 bg-lavender-100 text-lavender-700" : "border-line bg-white text-ink-soft"}`}
                    >
                      {food.emoji} {food.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      <section aria-live="polite" className="mt-8">
        <h2 className="text-lg font-bold text-ink">오늘 만들 수 있어요</h2>
        {selected.size === 0 ? (
          <p className="mt-2 rounded-2xl bg-white/70 px-4 py-4 text-sm text-ink-soft">재료를 고르면 만들 수 있는 이유식을 찾아드려요.</p>
        ) : result.ready.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-white/70 px-4 py-4 text-sm text-ink-soft">고른 재료만으로 만들 수 있는 레시피가 아직 없어요.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {result.ready.map(({ recipe }) => (
              <li key={recipe.id}>
                <RecipeLink recipe={recipe} note={result.byMonth(recipe) ? null : "월령 참고 범위와 차이가 있어요"} />
              </li>
            ))}
          </ul>
        )}

        {result.almost.length > 0 ? (
          <>
            <h2 className="mt-6 text-base font-bold text-ink">재료 하나만 더 있으면</h2>
            <ul className="mt-2 space-y-2">
              {result.almost.map(({ recipe, missing }) => (
                <li key={recipe.id}>
                  <RecipeLink
                    recipe={recipe}
                    note={`필요: ${missing.map((id) => `${foodById.get(id)?.emoji ?? ""}${foodById.get(id)?.name ?? ""}`).join(", ")}`}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {selected.size > 0 ? (
        <button type="button" onClick={() => setSelected(new Set())} className="mt-6 min-h-11 text-sm font-semibold text-ink-soft underline underline-offset-2">
          선택 모두 지우기
        </button>
      ) : null}
    </div>
  );
}

function RecipeLink({ recipe, note }: { recipe: FridgeRecipe; note: string | null }) {
  return (
    <Link
      href={`/food/recipes/${recipe.slug}`}
      className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-[var(--shadow-soft)]"
    >
      <span aria-hidden className="text-2xl">
        {recipe.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-ink">{recipe.title}</span>
        <span className="block text-[13px] text-ink-soft">
          {formatMonthRange(recipe.min_month, recipe.max_month)}
          {note ? ` · ${note}` : ""}
        </span>
      </span>
      <span aria-hidden className="text-ink-faint">
        ›
      </span>
    </Link>
  );
}
