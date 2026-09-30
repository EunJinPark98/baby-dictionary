"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toggleFoodTried } from "@/lib/actions/records";
import { FOOD_CATEGORIES, FOOD_PREFERENCES, type LabelInfo } from "@/lib/labels";
import type { FoodCategory, FoodPreference } from "@/lib/supabase/database.types";

export interface TriedFoodItem {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  category: FoodCategory;
  tried: boolean;
  preference: FoodPreference | null;
}

/**
 * 먹어본 재료 타일. 타일을 누르면 "먹어봤어요"가 토글되고(오늘 날짜로 기록),
 * "자세히" 로 처음 먹은 날·반응·메모를 기록한다. 작은 체크박스 대신 큰 타일을 사용한다.
 */
export function TriedFoodGrid({ babyId, foods, categories }: { babyId: string; foods: TriedFoodItem[]; categories: FoodCategory[] }) {
  const [optimisticFoods, updateFood] = useOptimistic(foods, (state, change: { id: string; tried: boolean }) =>
    state.map((f) => (f.id === change.id ? { ...f, tried: change.tried, preference: change.tried ? f.preference : null } : f)),
  );
  const [, startTransition] = useTransition();
  const triedCount = optimisticFoods.filter((f) => f.tried).length;

  function toggle(food: TriedFoodItem) {
    const tried = !food.tried;
    startTransition(async () => {
      updateFood({ id: food.id, tried });
      await toggleFoodTried(babyId, food.id, tried);
    });
  }

  return (
    <div>
      <p className="mb-4 rounded-2xl bg-star-50 px-4 py-3 text-[15px] font-semibold text-ink" aria-live="polite">
        ⭐ 지금까지 <strong className="text-lavender-700">{triedCount}가지</strong> 재료를 경험했어요
      </p>
      {categories.map((category) => {
        const list = optimisticFoods.filter((f) => f.category === category);
        const info: LabelInfo = FOOD_CATEGORIES[category];
        return (
          <section key={category} className="mb-6" aria-labelledby={`tried-${category}`}>
            <h2 id={`tried-${category}`} className="mb-2 text-base font-bold text-ink">
              {info.emoji} {info.label}
            </h2>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {list.map((food) => (
                <li key={food.id} className={`overflow-hidden rounded-2xl border ${food.tried ? "border-star-300 bg-star-50" : "border-line bg-white"}`}>
                  <button
                    type="button"
                    onClick={() => toggle(food)}
                    aria-pressed={food.tried}
                    className="flex min-h-14 w-full items-center gap-2 px-3 py-2 text-left"
                  >
                    <span
                      aria-hidden
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${food.tried ? "border-star-400 bg-star-400 text-white" : "border-line text-transparent"}`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-bold text-ink">
                        {food.emoji} {food.name}
                      </span>
                      {food.tried && food.preference ? (
                        <span className="text-[12px] text-ink-soft">
                          {FOOD_PREFERENCES[food.preference].emoji} {FOOD_PREFERENCES[food.preference].label}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <Link
                    href={`/food/tried/${food.slug}`}
                    className="flex min-h-10 items-center justify-center border-t border-line/70 text-[13px] font-semibold text-lavender-700"
                  >
                    {food.tried ? "기록 보기·수정" : "자세히 기록"}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
