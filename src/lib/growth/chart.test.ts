import { describe, expect, it } from "vitest";
import { buildGrowthSeries, niceDomain, niceStep, scaleLinear } from "./chart";

describe("buildGrowthSeries", () => {
  it("keeps only records with the measure and sorts by age", () => {
    const series = buildGrowthSeries(
      [
        { measured_on: "2026-03-01", weight_kg: 5.1, height_cm: null },
        { measured_on: "2026-01-01", weight_kg: 3.2, height_cm: 50 },
        { measured_on: "2026-02-01", weight_kg: null, height_cm: 54 },
      ],
      "weight_kg",
      "2026-01-01",
    );
    expect(series.map((p) => p.value)).toEqual([3.2, 5.1]);
    expect(series[0].ageMonths).toBe(0);
    expect(series[1].ageMonths).toBeCloseTo(59 / 30.4375, 5);
  });
});

describe("niceStep / niceDomain", () => {
  it("chooses 1-2-5 steps", () => {
    expect(niceStep(10, 4)).toBe(5);
    expect(niceStep(3, 4)).toBe(1);
    expect(niceStep(0.8, 4)).toBe(0.2);
  });

  it("expands to clean ticks", () => {
    expect(niceDomain([3.2, 8.9])).toEqual({ min: 2, max: 10, ticks: [2, 4, 6, 8, 10] });
  });

  it("builds a span around a single value", () => {
    const domain = niceDomain([50], 4, 4);
    expect(domain.min).toBeLessThanOrEqual(48);
    expect(domain.max).toBeGreaterThanOrEqual(52);
  });

  it("handles empty input", () => {
    expect(niceDomain([])).toEqual({ min: 0, max: 1, ticks: [0, 1] });
  });
});

describe("scaleLinear", () => {
  it("maps domain to range, including inverted ranges", () => {
    const y = scaleLinear([0, 10], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(5)).toBe(100);
    expect(y(10)).toBe(0);
  });
});
