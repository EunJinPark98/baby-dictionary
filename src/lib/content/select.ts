/**
 * 월령/주수에 맞는 콘텐츠 선택 로직 (순수 함수).
 *
 * 개인화 흐름: 생년월일 → getBabyAge() → 이 모듈의 선택 함수 → 화면
 */

export interface MonthRanged {
  min_month: number;
  max_month: number;
  sort_order?: number;
}

function bySortOrder<T extends { sort_order?: number }>(a: T, b: T): number {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0);
}

/** 현재 월령이 [min_month, max_month] 범위에 들어가는 항목 */
export function selectForMonth<T extends MonthRanged>(items: readonly T[], month: number): T[] {
  return items.filter((item) => item.min_month <= month && month <= item.max_month).sort(bySortOrder);
}

/**
 * 곧 관찰될 수 있는 항목: 현재 월령 이후 `lookaheadMonths` 이내에 시작하는 항목
 */
export function selectUpcoming<T extends MonthRanged>(items: readonly T[], month: number, lookaheadMonths = 2): T[] {
  return items
    .filter((item) => item.min_month > month && item.min_month <= month + lookaheadMonths)
    .sort((a, b) => a.min_month - b.min_month || bySortOrder(a, b));
}

/**
 * 범위에 맞는 항목이 있으면 그것을, 없으면 현재 월령보다 이전에 시작한 항목 중 가장 가까운 것을 고른다.
 * (예: 이유식 단계는 겹치지 않게 관리되지만 빈 구간이 생겨도 화면이 비지 않도록)
 */
export function pickForMonth<T extends MonthRanged>(items: readonly T[], month: number): T | null {
  const inRange = selectForMonth(items, month);
  if (inRange.length > 0) return inRange[0];
  const earlier = items.filter((item) => item.min_month <= month).sort((a, b) => b.max_month - a.max_month);
  if (earlier.length > 0) return earlier[0];
  const later = [...items].sort((a, b) => a.min_month - b.min_month);
  return later[0] ?? null;
}

/**
 * 주차 가이드 선택: 정확히 일치하는 주차 → 없으면 가장 가까운 이전 주차 → 없으면 가장 이른 주차.
 * 반환값의 `isExact` 로 "이번 주 전용" 콘텐츠인지 구분할 수 있다.
 */
export function pickWeeklyGuide<T extends { week: number }>(
  guides: readonly T[],
  week: number,
): { guide: T; isExact: boolean } | null {
  if (guides.length === 0) return null;
  const sorted = [...guides].sort((a, b) => a.week - b.week);
  const exact = sorted.find((g) => g.week === week);
  if (exact) return { guide: exact, isExact: true };
  const previous = sorted.filter((g) => g.week < week).at(-1);
  return { guide: previous ?? sorted[0], isExact: false };
}

/** 문자열 → 32bit 해시 (FNV-1a). 날짜별로 안정적인 순환 선택에 사용 */
export function stableHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * "오늘의 놀이"처럼 하루 동안은 고정되고 날마다 바뀌는 항목 선택.
 * seed 에 아기 id 를 섞으면 형제마다 다른 추천을 받을 수 있다.
 */
export function pickDaily<T>(items: readonly T[], dateKey: string, seed = ""): T | null {
  if (items.length === 0) return null;
  return items[stableHash(`${seed}:${dateKey}`) % items.length];
}

// ---------------------------------------------------------------------------
// 성장지도
// ---------------------------------------------------------------------------
export interface JourneyStopLike {
  id: string;
  typical_from_month: number;
  typical_to_month: number;
  sort_order: number;
}

export type JourneyStopState = "passed" | "now" | "upcoming";

export interface JourneyPosition<T extends JourneyStopLike> {
  stops: Array<{ stop: T; state: JourneyStopState }>;
  /** "지금 여기" 표시를 이 index 의 정거장 뒤에 둔다. -1 이면 맨 앞 */
  markerAfterIndex: number;
}

/**
 * 아기의 소수 월령으로 성장지도에서의 위치를 구한다.
 *
 *  - now:      흔히 관찰되는 범위 안 (from ≤ 월령 ≤ to)
 *  - passed:   범위가 이미 지난 정거장 (to < 월령)
 *  - upcoming: 아직 범위 전 (월령 < from)
 *
 * "passed" 는 "해야 했다"는 의미가 아니라 지도상 지나온 구간이라는 뜻이다.
 * 화면 문구는 개인차를 강조하는 표현을 사용한다.
 */
export function locateOnJourney<T extends JourneyStopLike>(stops: readonly T[], ageMonths: number): JourneyPosition<T> {
  const ordered = [...stops].sort(
    (a, b) => a.sort_order - b.sort_order || a.typical_from_month - b.typical_from_month,
  );
  const withState = ordered.map((stop) => {
    let state: JourneyStopState;
    if (ageMonths < stop.typical_from_month) state = "upcoming";
    else if (ageMonths > stop.typical_to_month) state = "passed";
    else state = "now";
    return { stop, state };
  });

  let markerAfterIndex = -1;
  withState.forEach(({ stop }, index) => {
    if (stop.typical_from_month <= ageMonths) markerAfterIndex = index;
  });

  return { stops: withState, markerAfterIndex };
}
