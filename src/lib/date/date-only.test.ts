import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  diffInDays,
  formatDotDate,
  isValidIsoDate,
  todayIsoDate,
} from "./date-only";

describe("date-only", () => {
  it("validates ISO dates", () => {
    expect(isValidIsoDate("2026-02-28")).toBe(true);
    expect(isValidIsoDate("2026-02-29")).toBe(false);
    expect(isValidIsoDate("2028-02-29")).toBe(true);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("2026-1-1")).toBe(false);
    expect(isValidIsoDate("")).toBe(false);
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("adds months with end-of-month clamping", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-08-31", 1)).toBe("2026-09-30");
    expect(addMonths("2026-11-15", 2)).toBe("2027-01-15");
    expect(addMonths("2026-03-15", -3)).toBe("2025-12-15");
  });

  it("diffs days", () => {
    expect(diffInDays("2026-01-01", "2026-09-22")).toBe(264);
    expect(diffInDays("2026-09-22", "2026-01-01")).toBe(-264);
  });

  it("uses Korea time for today", () => {
    // 2026-09-30 16:30 UTC = 2026-10-01 01:30 KST
    expect(todayIsoDate(new Date("2026-09-30T16:30:00Z"))).toBe("2026-10-01");
    expect(todayIsoDate(new Date("2026-09-30T14:59:00Z"))).toBe("2026-09-30");
  });

  it("formats dotted dates", () => {
    expect(formatDotDate("2026-05-09")).toBe("2026.05.09");
  });
});
