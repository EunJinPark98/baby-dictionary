import Link from "next/link";
import type { FoodRow } from "@/lib/supabase/database.types";

/** 재료 도감 타일 */
export function FoodTile({ food }: { food: Pick<FoodRow, "slug" | "name" | "emoji" | "recommended_from_month" | "is_common_allergen"> }) {
  return (
    <Link
      href={`/food/ingredients/${food.slug}`}
      className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-surface p-3 text-center shadow-[var(--shadow-soft)] active:scale-[0.98]"
    >
      <span aria-hidden className="text-3xl">
        {food.emoji}
      </span>
      <span className="text-[15px] font-bold text-ink">{food.name}</span>
      <span className="text-[11px] text-ink-faint">
        {food.recommended_from_month !== null ? `${food.recommended_from_month}개월~` : ""}
        {food.is_common_allergen ? " · 알레르기 주의" : ""}
      </span>
    </Link>
  );
}
