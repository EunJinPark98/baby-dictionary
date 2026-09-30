import { diffInDays, type IsoDate } from "@/lib/date/date-only";
import type { GrowthMeasure } from "@/lib/validation/records";

/**
 * 성장 기록 차트 계산 (순수 함수). 백분위/정상 판정 없이 기록값 추이만 그린다.
 * 향후 growth_standards 를 도입하면 같은 x(월령)/y 스케일에 참고 곡선을 추가할 수 있다.
 */

export interface GrowthPoint {
  date: IsoDate;
  /** 출생 후 개월 (소수) */
  ageMonths: number;
  value: number;
}

const DAYS_PER_MONTH = 30.4375;

export function buildGrowthSeries(
  records: ReadonlyArray<{ measured_on: string } & Partial<Record<GrowthMeasure, number | null>>>,
  measure: GrowthMeasure,
  birthDate: IsoDate,
): GrowthPoint[] {
  return records
    .filter((r) => r[measure] !== null && r[measure] !== undefined)
    .map((r) => ({
      date: r.measured_on,
      ageMonths: Math.max(0, diffInDays(birthDate, r.measured_on)) / DAYS_PER_MONTH,
      value: Number(r[measure]),
    }))
    .sort((a, b) => a.ageMonths - b.ageMonths);
}

/** 보기 좋은 눈금 간격 (1, 2, 5 × 10^n) */
export function niceStep(range: number, targetTicks = 4): number {
  if (range <= 0) return 1;
  const rough = range / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

export interface Domain {
  min: number;
  max: number;
  ticks: number[];
}

/** 값 범위를 깔끔한 눈금으로 확장한다. 값이 하나뿐이어도 범위를 만든다. */
export function niceDomain(values: readonly number[], targetTicks = 4, minSpan = 1): Domain {
  if (values.length === 0) return { min: 0, max: 1, ticks: [0, 1] };
  let low = Math.min(...values);
  let high = Math.max(...values);
  if (high - low < minSpan) {
    const mid = (high + low) / 2;
    low = mid - minSpan / 2;
    high = mid + minSpan / 2;
  }
  const step = niceStep(high - low, targetTicks);
  const min = Math.floor(low / step) * step;
  const max = Math.ceil(high / step) * step;
  const ticks: number[] = [];
  for (let t = min; t <= max + step / 2; t += step) ticks.push(Number(t.toFixed(6)));
  return { min, max, ticks };
}

export function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}
