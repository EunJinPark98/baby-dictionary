import { describe, expect, it } from "vitest";
import { describeVaccineTiming } from "./format";
import { buildVaccineSchedule } from "./schedule";

const v = (id: string, from: number, to: number) => ({
  id,
  min_age_days: null,
  recommended_from_months: from,
  recommended_from_days: 0,
  recommended_to_months: to,
  recommended_to_days: 0,
  sort_order: 0,
});

describe("describeVaccineTiming", () => {
  it("describes each status without alarming wording", () => {
    const [item] = buildVaccineSchedule([v("a", 2, 2)], "2026-01-01", "2026-02-20", []);
    expect(describeVaccineTiming(item)).toBe("D-9 · 3월 1일부터");

    const [due] = buildVaccineSchedule([v("a", 2, 3)], "2026-01-01", "2026-03-05", []);
    expect(describeVaccineTiming(due)).toBe("4월 1일까지 권장 시기예요");

    const [check] = buildVaccineSchedule([v("a", 2, 2)], "2026-01-01", "2026-04-01", []);
    expect(describeVaccineTiming(check)).toContain("기록해 주세요");

    const [done] = buildVaccineSchedule([v("a", 2, 2)], "2026-01-01", "2026-04-01", [
      { vaccine_id: "a", vaccinated_on: "2026-03-02" },
    ]);
    expect(describeVaccineTiming(done)).toBe("3월 2일 접종");
  });
});
