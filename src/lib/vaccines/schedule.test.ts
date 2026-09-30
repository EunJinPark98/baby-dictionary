import { describe, expect, it } from "vitest";
import { buildVaccineSchedule, getRecommendedWindow, groupVaccineSchedule, pickNextVaccine } from "./schedule";

function vaccine(id: string, from: [number, number], to: [number, number], sort = 0, minDays: number | null = null) {
  return {
    id,
    min_age_days: minDays,
    recommended_from_months: from[0],
    recommended_from_days: from[1],
    recommended_to_months: to[0],
    recommended_to_days: to[1],
    sort_order: sort,
  };
}

const bcg = vaccine("bcg", [0, 0], [0, 28], 1, 0);
const dtap1 = vaccine("dtap1", [2, 0], [2, 0], 2, 42);
const dtap2 = vaccine("dtap2", [4, 0], [4, 0], 3);
const mmr = vaccine("mmr", [12, 0], [15, 0], 4);

describe("getRecommendedWindow", () => {
  it("adds calendar months and days to the birth date", () => {
    expect(getRecommendedWindow(bcg, "2026-01-31")).toEqual({ from: "2026-01-31", to: "2026-02-28", minimum: "2026-01-31" });
    expect(getRecommendedWindow(dtap1, "2026-01-31")).toEqual({ from: "2026-03-31", to: "2026-03-31", minimum: "2026-03-14" });
    expect(getRecommendedWindow(mmr, "2026-01-15")).toEqual({ from: "2027-01-15", to: "2027-04-15", minimum: null });
  });

  it("never returns an end before the start", () => {
    const broken = vaccine("x", [3, 0], [2, 0]);
    const window = getRecommendedWindow(broken, "2026-01-01");
    expect(window.to).toBe(window.from);
  });
});

describe("buildVaccineSchedule", () => {
  const birth = "2026-01-01";

  it("classifies statuses relative to today", () => {
    const schedule = buildVaccineSchedule([mmr, dtap2, dtap1, bcg], birth, "2026-03-01", [
      { vaccine_id: "bcg", vaccinated_on: "2026-01-10" },
    ]);
    expect(schedule.map((s) => [s.vaccine.id, s.status])).toEqual([
      ["bcg", "done"],
      ["dtap1", "due"],
      ["dtap2", "later"],
      ["mmr", "later"],
    ]);
    expect(schedule[0].vaccinatedOn).toBe("2026-01-10");
  });

  it("marks soon within 30 days and check after the window", () => {
    const schedule = buildVaccineSchedule([bcg, dtap1, dtap2], birth, "2026-03-15", []);
    const byId = Object.fromEntries(schedule.map((s) => [s.vaccine.id, s]));
    expect(byId.bcg.status).toBe("check");
    expect(byId.dtap1.status).toBe("check");
    expect(byId.dtap2.status).toBe("later");

    const soon = buildVaccineSchedule([dtap2], birth, "2026-04-10", []);
    expect(soon[0].status).toBe("soon");
    expect(soon[0].daysUntilFrom).toBe(21);
  });
});

describe("groupVaccineSchedule / pickNextVaccine", () => {
  it("puts check items first, then due, then soon", () => {
    const dueNow = vaccine("due-now", [2, 0], [3, 0], 5);
    const soon = vaccine("soon", [3, 5], [3, 5], 6);
    // today 2026-03-10: bcg window ended (check), due-now 03-01~04-01 (due), soon 04-06 (27 days)
    const schedule = buildVaccineSchedule([soon, mmr, dueNow, bcg], "2026-01-01", "2026-03-10", []);
    const grouped = groupVaccineSchedule(schedule);
    expect(grouped.toCheck.map((s) => [s.vaccine.id, s.status])).toEqual([
      ["bcg", "check"],
      ["due-now", "due"],
      ["soon", "soon"],
    ]);
    expect(grouped.later.map((s) => s.vaccine.id)).toEqual(["mmr"]);
    expect(pickNextVaccine(schedule)?.vaccine.id).toBe("bcg");
  });

  it("returns the next later vaccine when nothing needs checking", () => {
    const schedule = buildVaccineSchedule([bcg, mmr], "2026-01-01", "2026-06-01", [
      { vaccine_id: "bcg", vaccinated_on: "2026-01-05" },
    ]);
    expect(pickNextVaccine(schedule)?.vaccine.id).toBe("mmr");
  });

  it("returns null when everything is done", () => {
    const schedule = buildVaccineSchedule([bcg], "2026-01-01", "2026-06-01", [
      { vaccine_id: "bcg", vaccinated_on: "2026-01-05" },
    ]);
    expect(pickNextVaccine(schedule)).toBeNull();
  });
});
