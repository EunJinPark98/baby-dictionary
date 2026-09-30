import Link from "next/link";

/** 0~12개월 가로 스크롤 선택 칩 (현재 월령 표시) */
export function MonthTabs({
  basePath,
  selected,
  current,
  max = 12,
  param = "m",
}: {
  basePath: string;
  selected: number;
  current: number | null;
  max?: number;
  param?: string;
}) {
  return (
    <nav aria-label="월령 선택" className="-mx-4 mb-5 overflow-x-auto px-4 pb-1">
      <ul className="flex gap-2">
        {Array.from({ length: max + 1 }, (_, month) => {
          const isSelected = month === selected;
          const isCurrent = month === current;
          return (
            <li key={month}>
              <Link
                href={`${basePath}?${param}=${month}`}
                scroll={false}
                aria-current={isSelected ? "page" : undefined}
                className={`flex min-h-11 min-w-14 flex-col items-center justify-center whitespace-nowrap rounded-2xl border px-3 text-sm font-semibold ${isSelected ? "border-lavender-400 bg-lavender-600 text-white" : "border-line bg-white text-ink-soft"}`}
              >
                {month}개월
                {isCurrent ? <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-lavender-600"}`}>⭐ 지금</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function parseMonthParam(value: string | string[] | undefined, fallback: number, max = 12): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const month = raw === undefined ? Number.NaN : Number.parseInt(raw, 10);
  if (!Number.isInteger(month) || month < 0 || month > max) return Math.min(Math.max(fallback, 0), max);
  return month;
}
