import type { ReactNode } from "react";
import { Badge, SampleBadge } from "@/components/ui/badge";
import { DEVELOPMENT_DOMAINS, formatMonthRange } from "@/lib/labels";
import type { DevelopmentItemRow } from "@/lib/supabase/database.types";

/** 발달 항목 카드 (공개 가이드/개인 체크 공용). children 에 기록 버튼을 넣는다. */
export function DevelopmentItemCard({ item, children }: { item: DevelopmentItemRow; children?: ReactNode }) {
  const domain = DEVELOPMENT_DOMAINS[item.domain];
  return (
    <article className="rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="lavender">
          <span aria-hidden>{domain.emoji}</span> {domain.label}
        </Badge>
        <Badge tone="gray">{formatMonthRange(item.min_month, item.max_month)}에 관찰될 수 있어요</Badge>
        <SampleBadge show={item.is_sample} />
      </div>
      <h3 className="mt-2.5 text-[16px] font-bold leading-snug text-ink">{item.title}</h3>
      {item.description ? <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.description}</p> : null}
      {item.parent_activities.length > 0 ? (
        <details className="group mt-2">
          <summary className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-lavender-700">
            부모가 해줄 수 있는 것 <span aria-hidden className="transition-transform group-open:rotate-90">›</span>
          </summary>
          <ul className="mt-1 space-y-1.5 rounded-2xl bg-lavender-50 p-3 text-sm leading-relaxed text-ink">
            {item.parent_activities.map((activity) => (
              <li key={activity} className="flex gap-2">
                <span aria-hidden>🤲</span>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </article>
  );
}
