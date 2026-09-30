import { selectBaby } from "@/lib/actions/baby";
import type { BabyRow } from "@/lib/supabase/database.types";

/** 여러 아기를 등록한 경우 전환 칩 (서버 액션 폼, JS 없이도 동작) */
export function BabySwitcher({ babies, selectedId }: { babies: BabyRow[]; selectedId: string }) {
  if (babies.length < 2) return null;
  return (
    <nav aria-label="아기 선택" className="-mx-4 mb-4 overflow-x-auto px-4">
      <ul className="flex gap-2">
        {babies.map((baby) => {
          const selected = baby.id === selectedId;
          return (
            <li key={baby.id}>
              <form action={selectBaby.bind(null, baby.id)}>
                <button
                  type="submit"
                  aria-pressed={selected}
                  className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-sm font-semibold ${selected ? "border-gold-400 bg-gold-100 text-gold-700" : "border-line bg-surface text-ink-soft"}`}
                >
                  ✦ {baby.name}
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
