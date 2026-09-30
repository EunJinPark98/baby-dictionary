/**
 * 날짜 전용(시간 없는) 유틸리티.
 *
 * 아기 월령 계산은 "달력 날짜" 기준이어야 하므로 모든 계산을 'YYYY-MM-DD' 문자열과
 * UTC 자정 기준 타임스탬프로 처리한다. 서버(UTC)와 브라우저(KST)의 시간대 차이로
 * 하루가 어긋나는 문제를 피하기 위함이다.
 */

/** 'YYYY-MM-DD' 형식의 달력 날짜 */
export type IsoDate = string;

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export const SERVICE_TIME_ZONE = "Asia/Seoul";

export interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_RE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

export function parseIsoDate(value: IsoDate): DateParts {
  if (!isValidIsoDate(value)) {
    throw new RangeError(`Invalid ISO date: ${value}`);
  }
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

export function toIsoDate({ year, month, day }: DateParts): IsoDate {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toUtcMs(value: IsoDate): number {
  const { year, month, day } = parseIsoDate(value);
  return Date.UTC(year, month - 1, day);
}

function fromUtcMs(ms: number): IsoDate {
  const date = new Date(ms);
  return toIsoDate({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

/** b - a (일). a 가 b 보다 이후면 음수. */
export function diffInDays(a: IsoDate, b: IsoDate): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / DAY_MS);
}

export function addDays(value: IsoDate, days: number): IsoDate {
  return fromUtcMs(toUtcMs(value) + days * DAY_MS);
}

/**
 * 달력 기준으로 개월을 더한다. 대상 달에 같은 날짜가 없으면 말일로 맞춘다.
 * 예) 2026-01-31 + 1개월 = 2026-02-28
 */
export function addMonths(value: IsoDate, months: number): IsoDate {
  const { year, month, day } = parseIsoDate(value);
  const monthIndex = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(monthIndex / 12);
  const targetMonth = (monthIndex % 12) + 1;
  return toIsoDate({
    year: targetYear,
    month: targetMonth,
    day: Math.min(day, daysInMonth(targetYear, targetMonth)),
  });
}

export function compareIsoDate(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** 서비스 기준 시간대(KST)의 오늘 날짜 */
export function todayIsoDate(now: Date = new Date(), timeZone: string = SERVICE_TIME_ZONE): IsoDate {
  // en-CA 로케일은 YYYY-MM-DD 형식으로 출력한다.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** 2026.05.09 */
export function formatDotDate(value: IsoDate): string {
  const { year, month, day } = parseIsoDate(value);
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

/** 5월 9일 */
export function formatKoreanMonthDay(value: IsoDate): string {
  const { month, day } = parseIsoDate(value);
  return `${month}월 ${day}일`;
}

/** 2026년 5월 9일 */
export function formatKoreanDate(value: IsoDate): string {
  const { year, month, day } = parseIsoDate(value);
  return `${year}년 ${month}월 ${day}일`;
}
