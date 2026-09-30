import { LinkCard } from "@/components/ui/card";
import { ACTIVITY_CATEGORIES, formatMonthRange } from "@/lib/labels";
import type { ActivityRow } from "@/lib/supabase/database.types";

export function ActivityCard({ activity }: { activity: ActivityRow }) {
  return (
    <LinkCard href={`/play/${activity.slug}`} className="flex h-full gap-3.5 p-4">
      <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blush-50 text-3xl">
        {activity.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-snug text-ink">{activity.title}</span>
        <span className="mt-0.5 block text-[13px] text-ink-soft">
          {formatMonthRange(activity.min_month, activity.max_month)}
          {activity.duration_minutes ? ` · ${activity.duration_minutes}분` : ""}
        </span>
        <span className="mt-1.5 flex flex-wrap gap-1">
          {activity.categories.map((category) => (
            <span key={category} className="rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-semibold text-gold-700">
              {ACTIVITY_CATEGORIES[category].emoji} {ACTIVITY_CATEGORIES[category].label}
            </span>
          ))}
        </span>
      </span>
    </LinkCard>
  );
}
