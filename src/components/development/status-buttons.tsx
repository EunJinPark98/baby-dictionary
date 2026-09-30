"use client";

import { useOptimistic, useTransition } from "react";
import { setDevelopmentStatus } from "@/lib/actions/records";
import { DEVELOPMENT_STATUSES, DEVELOPMENT_STATUS_ORDER } from "@/lib/labels";
import type { DevelopmentStatus } from "@/lib/supabase/database.types";

const selectedStyles: Record<DevelopmentStatus, string> = {
  doing: "border-star-400 bg-star-100 text-ink",
  not_yet: "border-lavender-300 bg-lavender-50 text-lavender-700",
  unsure: "border-sky-100 bg-sky-50 text-sky-600",
};

/**
 * 하고 있어요 / 아직이에요 / 잘 모르겠어요 — 큰 버튼 3개.
 * 같은 버튼을 다시 누르면 기록이 지워진다. 평가/점수는 표시하지 않는다.
 */
export function DevelopmentStatusButtons({
  babyId,
  itemId,
  itemTitle,
  status,
}: {
  babyId: string;
  itemId: string;
  itemTitle: string;
  status: DevelopmentStatus | null;
}) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [isPending, startTransition] = useTransition();

  function choose(next: DevelopmentStatus) {
    const value = optimisticStatus === next ? null : next;
    startTransition(async () => {
      setOptimisticStatus(value);
      await setDevelopmentStatus(babyId, itemId, value);
    });
  }

  return (
    <div role="group" aria-label={`${itemTitle} 기록`} className="grid grid-cols-3 gap-2" aria-busy={isPending}>
      {DEVELOPMENT_STATUS_ORDER.map((key) => {
        const selected = optimisticStatus === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => choose(key)}
            aria-pressed={selected}
            className={`flex min-h-12 flex-col items-center justify-center rounded-2xl border px-1 py-1.5 text-[13px] font-semibold leading-tight transition-colors ${selected ? selectedStyles[key] : "border-line bg-white text-ink-soft hover:bg-lavender-50"}`}
          >
            <span aria-hidden>{DEVELOPMENT_STATUSES[key].emoji}</span>
            {DEVELOPMENT_STATUSES[key].label}
          </button>
        );
      })}
    </div>
  );
}
