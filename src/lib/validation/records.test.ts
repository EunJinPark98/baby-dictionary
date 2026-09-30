import { describe, expect, it } from "vitest";
import { validateGrowthInput, validateRecordDate } from "./records";

const ctx = { birthDate: "2026-01-01", today: "2026-09-30" };

describe("validateRecordDate", () => {
  it("allows dates between birth and today", () => {
    expect(validateRecordDate("2026-01-01", ctx)).toBeNull();
    expect(validateRecordDate("2026-09-30", ctx)).toBeNull();
  });
  it("rejects future, pre-birth and invalid dates", () => {
    expect(validateRecordDate("2026-10-01", ctx)).toMatch(/오늘 이후/);
    expect(validateRecordDate("2025-12-31", ctx)).toMatch(/태어나기 전/);
    expect(validateRecordDate("", ctx)).toMatch(/선택/);
  });
});

describe("validateGrowthInput", () => {
  const base = { measured_on: "2026-05-01", height_cm: null, weight_kg: null, head_cm: null, memo: null };

  it("requires at least one measurement", () => {
    const result = validateGrowthInput(base, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toBeDefined();
  });

  it("accepts and rounds valid measurements", () => {
    const result = validateGrowthInput({ ...base, height_cm: 65.34, weight_kg: 7.456 }, ctx);
    expect(result).toEqual({
      ok: true,
      value: { measured_on: "2026-05-01", height_cm: 65.3, weight_kg: 7.46, head_cm: null, memo: null },
    });
  });

  it("rejects out-of-range and non-numeric values", () => {
    const result = validateGrowthInput({ ...base, height_cm: 500, weight_kg: Number.NaN }, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.height_cm).toBeDefined();
      expect(result.errors.weight_kg).toBeDefined();
    }
  });
});
