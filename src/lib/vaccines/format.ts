import { formatKoreanMonthDay } from "@/lib/date/date-only";
import type { ScheduledVaccine, VaccineScheduleInput, VaccineStatus } from "./schedule";

/** 상태 라벨 — 불안을 주지 않는 "확인" 중심 표현 */
export const VACCINE_STATUS_LABELS: Record<VaccineStatus, string> = {
  done: "완료",
  due: "지금 권장 시기",
  soon: "곧 다가와요",
  check: "확인이 필요해요",
  later: "예정",
};

export function describeVaccineTiming<T extends VaccineScheduleInput>(item: ScheduledVaccine<T>): string {
  switch (item.status) {
    case "done":
      return item.vaccinatedOn ? `${formatKoreanMonthDay(item.vaccinatedOn)} 접종` : "접종 완료";
    case "check":
      return "권장 시기가 지났어요. 이미 맞았다면 기록해 주세요";
    case "due":
      return item.recommendedFrom === item.recommendedTo
        ? "오늘이 권장 시기예요"
        : `${formatKoreanMonthDay(item.recommendedTo)}까지 권장 시기예요`;
    case "soon":
      return `D-${item.daysUntilFrom} · ${formatKoreanMonthDay(item.recommendedFrom)}부터`;
    case "later":
      return `${formatKoreanMonthDay(item.recommendedFrom)}부터`;
  }
}
