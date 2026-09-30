import { LinkCard } from "@/components/ui/card";
import { formatMonthRange } from "@/lib/labels";
import type { RecipeWithIngredients } from "@/lib/queries/content";

export function RecipeCard({ recipe, note }: { recipe: RecipeWithIngredients; note?: string }) {
  return (
    <LinkCard href={`/food/recipes/${recipe.slug}`} className="flex h-full gap-3.5 p-4">
      <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-star-50 text-3xl">
        {recipe.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-snug text-ink">{recipe.title}</span>
        <span className="mt-0.5 block text-[13px] text-ink-soft">
          {formatMonthRange(recipe.min_month, recipe.max_month)}
          {recipe.texture ? ` · ${recipe.texture}` : ""}
        </span>
        <span className="mt-1 block truncate text-[13px] text-ink-faint">
          {recipe.ingredients.map((i) => `${i.food?.emoji ?? ""}${i.food?.name ?? ""}`).join(" · ")}
        </span>
        {note ? <span className="mt-1.5 block text-[13px] font-semibold text-lavender-700">{note}</span> : null}
      </span>
    </LinkCard>
  );
}
