import { addDays, addMonths, compareIsoDate, diffInDays, type IsoDate } from "@/lib/date/date-only";

/**
 * 예방접종 예정 시기 계산 (순수 함수).
 *
 * 권장 시작일 = 생년월일 + recommended_from_months 개월 + recommended_from_days 일
 * 권장 종료일 = 생년월일 + recommended_to_months 개월 + recommended_to_days 일
 *
 * 상태는 부모에게 "확인"을 돕기 위한 분류이며 의료적 판단이 아니다.
 */
export interface VaccineScheduleInput {
  id: string;
  min_age_days: number | null;
  recommended_from_months: number;
  recommended_from_days: number;
  recommended_to_months: number;
  recommended_to_days: number;
  sort_order: number;
}

export interface VaccinationRecordInput {
  vaccine_id: string;
  vaccinated_on: string;
}

export type VaccineStatus =
  /** 접종 완료 기록 있음 */
  | "done"
  /** 오늘이 권장 기간 안 */
  | "due"
  /** 권장 시작일이 곧 다가옴 */
  | "soon"
  /** 권장 기간이 지났는데 기록이 없음 → "기록/확인이 필요해요" */
  | "check"
  /** 아직 먼 일정 */
  | "later";

export interface ScheduledVaccine<T extends VaccineScheduleInput> {
  vaccine: T;
  status: VaccineStatus;
  recommendedFrom: IsoDate;
  recommendedTo: IsoDate;
  /** 최소 접종 가능일 (데이터가 있을 때) */
  minimumDate: IsoDate | null;
  /** 오늘 기준 권장 시작일까지 남은 일수 (지났으면 음수) */
  daysUntilFrom: number;
  vaccinatedOn: IsoDate | null;
}

export function getRecommendedWindow(
  vaccine: VaccineScheduleInput,
  birthDate: IsoDate,
): { from: IsoDate; to: IsoDate; minimum: IsoDate | null } {
  const from = addDays(addMonths(birthDate, vaccine.recommended_from_months), vaccine.recommended_from_days);
  let to = addDays(addMonths(birthDate, vaccine.recommended_to_months), vaccine.recommended_to_days);
  if (compareIsoDate(to, from) < 0) to = from;
  const minimum = vaccine.min_age_days === null ? null : addDays(birthDate, vaccine.min_age_days);
  return { from, to, minimum };
}

export function buildVaccineSchedule<T extends VaccineScheduleInput>(
  vaccines: readonly T[],
  birthDate: IsoDate,
  today: IsoDate,
  records: readonly VaccinationRecordInput[],
  soonWindowDays = 30,
): ScheduledVaccine<T>[] {
  const recordByVaccine = new Map(records.map((r) => [r.vaccine_id, r.vaccinated_on]));

  return vaccines
    .map((vaccine) => {
      const { from, to, minimum } = getRecommendedWindow(vaccine, birthDate);
      const vaccinatedOn = recordByVaccine.get(vaccine.id) ?? null;
      const daysUntilFrom = diffInDays(today, from);

      let status: VaccineStatus;
      if (vaccinatedOn) status = "done";
      else if (compareIsoDate(today, to) > 0) status = "check";
      else if (compareIsoDate(today, from) >= 0) status = "due";
      else if (daysUntilFrom <= soonWindowDays) status = "soon";
      else status = "later";

      return { vaccine, status, recommendedFrom: from, recommendedTo: to, minimumDate: minimum, daysUntilFrom, vaccinatedOn };
    })
    .sort(
      (a, b) =>
        compareIsoDate(a.recommendedFrom, b.recommendedFrom) || a.vaccine.sort_order - b.vaccine.sort_order,
    );
}

export interface GroupedSchedule<T extends VaccineScheduleInput> {
  /** 지금 확인할 접종: check + due + soon */
  toCheck: ScheduledVaccine<T>[];
  later: ScheduledVaccine<T>[];
  done: ScheduledVaccine<T>[];
}

export function groupVaccineSchedule<T extends VaccineScheduleInput>(
  schedule: readonly ScheduledVaccine<T>[],
): GroupedSchedule<T> {
  const statusRank: Record<VaccineStatus, number> = { check: 0, due: 1, soon: 2, later: 3, done: 4 };
  const toCheck = schedule
    .filter((s) => s.status === "check" || s.status === "due" || s.status === "soon")
    .sort((a, b) => statusRank[a.status] - statusRank[b.status] || compareIsoDate(a.recommendedFrom, b.recommendedFrom));
  return {
    toCheck,
    later: schedule.filter((s) => s.status === "later"),
    done: schedule.filter((s) => s.status === "done"),
  };
}

/** 오늘 화면용: 가장 먼저 챙길 접종 1건 */
export function pickNextVaccine<T extends VaccineScheduleInput>(
  schedule: readonly ScheduledVaccine<T>[],
): ScheduledVaccine<T> | null {
  const grouped = groupVaccineSchedule(schedule);
  return grouped.toCheck[0] ?? grouped.later[0] ?? null;
}
