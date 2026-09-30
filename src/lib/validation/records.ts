import { compareIsoDate, isValidIsoDate, type IsoDate } from "@/lib/date/date-only";

/**
 * 개인 기록 입력 검증 (순수 함수). DB check 제약과 같은 범위를 사용한다.
 */

export type FieldErrors = Record<string, string>;

/** 출생일 ~ 오늘 사이의 날짜인지 */
export function validateRecordDate(value: string, context: { birthDate: IsoDate; today: IsoDate }): string | null {
  if (!isValidIsoDate(value)) return "날짜를 선택해 주세요.";
  if (compareIsoDate(value, context.today) > 0) return "오늘 이후 날짜는 기록할 수 없어요.";
  if (compareIsoDate(value, context.birthDate) < 0) return "태어나기 전 날짜는 기록할 수 없어요.";
  return null;
}

export const GROWTH_LIMITS = {
  height_cm: { min: 20, max: 150, label: "키", unit: "cm", step: 0.1 },
  weight_kg: { min: 0.3, max: 40, label: "몸무게", unit: "kg", step: 0.01 },
  head_cm: { min: 15, max: 70, label: "머리둘레", unit: "cm", step: 0.1 },
} as const;

export type GrowthMeasure = keyof typeof GROWTH_LIMITS;

export interface GrowthInput {
  measured_on: IsoDate;
  height_cm: number | null;
  weight_kg: number | null;
  head_cm: number | null;
  memo: string | null;
}

export function validateGrowthInput(
  raw: { measured_on: string; height_cm: number | null; weight_kg: number | null; head_cm: number | null; memo: string | null },
  context: { birthDate: IsoDate; today: IsoDate },
): { ok: true; value: GrowthInput } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const dateError = validateRecordDate(raw.measured_on, context);
  if (dateError) errors.measured_on = dateError;

  (Object.keys(GROWTH_LIMITS) as GrowthMeasure[]).forEach((key) => {
    const value = raw[key];
    const limit = GROWTH_LIMITS[key];
    if (value === null) return;
    if (!Number.isFinite(value)) errors[key] = `${limit.label}는 숫자로 입력해 주세요.`;
    else if (value < limit.min || value > limit.max)
      errors[key] = `${limit.label}는 ${limit.min}~${limit.max}${limit.unit} 사이로 입력해 주세요.`;
  });

  if (raw.height_cm === null && raw.weight_kg === null && raw.head_cm === null) {
    errors.form = "키, 몸무게, 머리둘레 중 하나 이상 입력해 주세요.";
  }
  if (raw.memo && raw.memo.length > 500) errors.memo = "메모는 500자 이내로 입력해 주세요.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      measured_on: raw.measured_on,
      height_cm: raw.height_cm === null ? null : Math.round(raw.height_cm * 10) / 10,
      weight_kg: raw.weight_kg === null ? null : Math.round(raw.weight_kg * 100) / 100,
      head_cm: raw.head_cm === null ? null : Math.round(raw.head_cm * 10) / 10,
      memo: raw.memo,
    },
  };
}

export function validateMemo(value: string | null, max = 500): string | null {
  if (value && value.length > max) return `${max}자 이내로 입력해 주세요.`;
  return null;
}
