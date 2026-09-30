import { describe, expect, it } from "vitest";
import { locateOnJourney, pickDaily, pickForMonth, pickWeeklyGuide, selectForMonth, selectUpcoming } from "./select";

const items = [
  { id: "a", min_month: 0, max_month: 2, sort_order: 2 },
  { id: "b", min_month: 1, max_month: 3, sort_order: 1 },
  { id: "c", min_month: 8, max_month: 10, sort_order: 0 },
  { id: "d", min_month: 9, max_month: 12, sort_order: 0 },
];

describe("selectForMonth", () => {
  it("includes items whose range contains the month (inclusive)", () => {
    expect(selectForMonth(items, 2).map((i) => i.id)).toEqual(["b", "a"]);
    expect(selectForMonth(items, 8).map((i) => i.id)).toEqual(["c"]);
    expect(selectForMonth(items, 5)).toEqual([]);
  });
});

describe("selectUpcoming", () => {
  it("returns items starting within the lookahead window", () => {
    expect(selectUpcoming(items, 7).map((i) => i.id)).toEqual(["c", "d"]);
    expect(selectUpcoming(items, 7, 1).map((i) => i.id)).toEqual(["c"]);
    expect(selectUpcoming(items, 12)).toEqual([]);
  });
});

describe("pickForMonth", () => {
  it("prefers an in-range item", () => {
    expect(pickForMonth(items, 9)?.id).toBe("c");
  });
  it("falls back to the nearest earlier item when there is a gap", () => {
    expect(pickForMonth(items, 5)?.id).toBe("b");
  });
  it("falls back to the earliest item before any range", () => {
    expect(pickForMonth([{ id: "x", min_month: 4, max_month: 6 }], 1)?.id).toBe("x");
  });
  it("returns null for no items", () => {
    expect(pickForMonth([], 3)).toBeNull();
  });
});

describe("pickWeeklyGuide", () => {
  const guides = [{ week: 0 }, { week: 4 }, { week: 8 }];
  it("returns the exact week", () => {
    expect(pickWeeklyGuide(guides, 4)).toEqual({ guide: { week: 4 }, isExact: true });
  });
  it("falls back to the closest previous week", () => {
    expect(pickWeeklyGuide(guides, 6)).toEqual({ guide: { week: 4 }, isExact: false });
    expect(pickWeeklyGuide(guides, 60)).toEqual({ guide: { week: 8 }, isExact: false });
  });
  it("handles empty input", () => {
    expect(pickWeeklyGuide([], 3)).toBeNull();
  });
});

describe("pickDaily", () => {
  const list = ["a", "b", "c", "d", "e"];
  it("is stable for the same day", () => {
    expect(pickDaily(list, "2026-09-30")).toBe(pickDaily(list, "2026-09-30"));
  });
  it("rotates over days", () => {
    const picks = new Set(
      Array.from({ length: 30 }, (_, i) => pickDaily(list, `2026-09-${String(i + 1).padStart(2, "0")}`)),
    );
    expect(picks.size).toBeGreaterThan(1);
  });
  it("returns null for empty lists", () => {
    expect(pickDaily([], "2026-09-30")).toBeNull();
  });
});

describe("locateOnJourney", () => {
  const stops = [
    { id: "birth", typical_from_month: 0, typical_to_month: 0, sort_order: 1 },
    { id: "rolling", typical_from_month: 4, typical_to_month: 7, sort_order: 2 },
    { id: "crawling", typical_from_month: 7, typical_to_month: 11, sort_order: 3 },
    { id: "steps", typical_from_month: 11, typical_to_month: 15, sort_order: 4 },
  ];

  it("marks now/passed/upcoming by fractional month", () => {
    const { stops: result, markerAfterIndex } = locateOnJourney(stops, 8.7);
    expect(result.map((s) => s.state)).toEqual(["passed", "passed", "now", "upcoming"]);
    expect(markerAfterIndex).toBe(2);
  });

  it("places the marker after birth for newborns", () => {
    const { stops: result, markerAfterIndex } = locateOnJourney(stops, 0);
    expect(result[0].state).toBe("now");
    expect(markerAfterIndex).toBe(0);
  });

  it("orders by sort_order", () => {
    const shuffled = [stops[2], stops[0], stops[3], stops[1]];
    expect(locateOnJourney(shuffled, 5).stops.map((s) => s.stop.id)).toEqual([
      "birth",
      "rolling",
      "crawling",
      "steps",
    ]);
  });
});
