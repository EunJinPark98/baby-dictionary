import { addMonths, compareIsoDate, diffInDays, type IsoDate } from "@/lib/date/date-only";

/**
 * 아기 월령 계산 엔진.
 *
 * 이 모듈이 월령 계산의 유일한 출처다. 화면·쿼리·콘텐츠 선택은 모두 `getBabyAge()` 결과를 사용한다.
 *
 * 규칙
 *  - 생후 일수: 출생일 = 0일. (예: 2026-01-01 생 → 2026-09-22 는 생후 264일)
 *  - 생후 주수: floor(생후 일수 / 7)
 *  - 개월 수: 출생일에 N개월을 더한 날짜가 오늘 이하인 최대 N (달력 기준, 말일 보정)
 *  - 표시용 월령: "8개월 21일"
 *  - 첫돌까지 남은 일수: 출생일 + 12개월 - 오늘
 */
export interface BabyAge {
  birthDate: IsoDate;
  today: IsoDate;
  /** 출생일 이전(예정일 등)인 경우 true. 이 경우 나머지 값은 0 */
  isBeforeBirth: boolean;
  days: number;
  weeks: number;
  /** 주 단위 나머지 일수 (예: 38주 3일의 3) */
  weekRemainderDays: number;
  months: number;
  /** 개월 단위 나머지 일수 (예: 8개월 21일의 21) */
  monthRemainderDays: number;
  /** 콘텐츠 매칭/성장지도 위치용 소수 월령 (예: 8.7) */
  fractionalMonths: number;
  firstBirthday: IsoDate;
  daysUntilFirstBirthday: number;
  hasFirstBirthdayPassed: boolean;
  isFirstBirthday: boolean;
}

export function getBabyAge(birthDate: IsoDate, today: IsoDate): BabyAge {
  const firstBirthday = addMonths(birthDate, 12);
  const daysUntilFirstBirthday = diffInDays(today, firstBirthday);
  const base = {
    birthDate,
    today,
    firstBirthday,
    daysUntilFirstBirthday,
    hasFirstBirthdayPassed: daysUntilFirstBirthday < 0,
    isFirstBirthday: daysUntilFirstBirthday === 0,
  };

  if (compareIsoDate(today, birthDate) < 0) {
    return {
      ...base,
      isBeforeBirth: true,
      days: 0,
      weeks: 0,
      weekRemainderDays: 0,
      months: 0,
      monthRemainderDays: 0,
      fractionalMonths: 0,
    };
  }

  const days = diffInDays(birthDate, today);
  const { months, remainderDays, fraction } = monthsBetween(birthDate, today);

  return {
    ...base,
    isBeforeBirth: false,
    days,
    weeks: Math.floor(days / 7),
    weekRemainderDays: days % 7,
    months,
    monthRemainderDays: remainderDays,
    fractionalMonths: months + fraction,
  };
}

function monthsBetween(from: IsoDate, to: IsoDate) {
  // 대략값에서 출발해 보정한다 (루프는 최대 1~2회).
  let months = Math.max(0, Math.floor(diffInDays(from, to) / 30.4375) - 1);
  while (compareIsoDate(addMonths(from, months + 1), to) <= 0) months += 1;
  while (months > 0 && compareIsoDate(addMonths(from, months), to) > 0) months -= 1;

  const monthStart = addMonths(from, months);
  const nextMonthStart = addMonths(from, months + 1);
  const remainderDays = diffInDays(monthStart, to);
  const monthLength = diffInDays(monthStart, nextMonthStart);
  return { months, remainderDays, fraction: remainderDays / monthLength };
}

/** "8개월 21일", "0개월 5일", "12개월" */
export function formatAgeLabel(age: Pick<BabyAge, "months" | "monthRemainderDays">): string {
  if (age.monthRemainderDays === 0) return `${age.months}개월`;
  return `${age.months}개월 ${age.monthRemainderDays}일`;
}

/** "38주 3일" */
export function formatWeekLabel(age: Pick<BabyAge, "weeks" | "weekRemainderDays">): string {
  if (age.weekRemainderDays === 0) return `${age.weeks}주`;
  return `${age.weeks}주 ${age.weekRemainderDays}일`;
}

/** "⭐ 8개월 성장 여행 중" 에 쓰이는 문구 (별 제외) */
export function formatJourneyLabel(age: BabyAge): string {
  if (age.isBeforeBirth) return "곧 만날 작은 별";
  if (age.isFirstBirthday) return "오늘은 첫돌이에요!";
  if (age.hasFirstBirthdayPassed) return "첫 번째 성장 여행 완주";
  if (age.months === 0) return "첫 달 성장 여행 중";
  return `${age.months}개월 성장 여행 중`;
}

/** 첫돌 카운트다운 문구 */
export function formatFirstBirthdayCountdown(age: BabyAge): string {
  if (age.isFirstBirthday) return "오늘이 첫돌이에요 🎂";
  if (age.hasFirstBirthdayPassed) return "첫돌을 지났어요 🎂";
  return `첫돌까지 ${age.daysUntilFirstBirthday}일`;
}
