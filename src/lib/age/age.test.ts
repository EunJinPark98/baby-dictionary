import { describe, expect, it } from "vitest";
import {
  formatAgeLabel,
  formatFirstBirthdayCountdown,
  formatJourneyLabel,
  formatWeekLabel,
  getBabyAge,
} from "./age";

describe("getBabyAge", () => {
  it("matches the product example: 생후 264일 = 8개월 21일", () => {
    const age = getBabyAge("2026-01-01", "2026-09-22");
    expect(age.days).toBe(264);
    expect(age.months).toBe(8);
    expect(age.monthRemainderDays).toBe(21);
    expect(formatAgeLabel(age)).toBe("8개월 21일");
    expect(formatJourneyLabel(age)).toBe("8개월 성장 여행 중");
  });

  it("treats the birth date as day 0", () => {
    const age = getBabyAge("2026-03-10", "2026-03-10");
    expect(age.days).toBe(0);
    expect(age.weeks).toBe(0);
    expect(age.months).toBe(0);
    expect(formatAgeLabel(age)).toBe("0개월");
    expect(formatJourneyLabel(age)).toBe("첫 달 성장 여행 중");
  });

  it("computes weeks and remainder days", () => {
    const age = getBabyAge("2026-01-01", "2026-01-24");
    expect(age.days).toBe(23);
    expect(age.weeks).toBe(3);
    expect(age.weekRemainderDays).toBe(2);
    expect(formatWeekLabel(age)).toBe("3주 2일");
  });

  it("computes week 38 correctly", () => {
    const age = getBabyAge("2026-01-01", "2026-09-24");
    expect(age.days).toBe(266);
    expect(age.weeks).toBe(38);
    expect(formatWeekLabel(age)).toBe("38주");
  });

  it("clamps month-end birthdays (1/31 → 2/28 is 1 month)", () => {
    expect(getBabyAge("2026-01-31", "2026-02-27").months).toBe(0);
    const feb = getBabyAge("2026-01-31", "2026-02-28");
    expect(feb.months).toBe(1);
    expect(feb.monthRemainderDays).toBe(0);
    const mar = getBabyAge("2026-01-31", "2026-03-30");
    expect(mar.months).toBe(1);
    expect(mar.monthRemainderDays).toBe(30);
    expect(getBabyAge("2026-01-31", "2026-03-31").months).toBe(2);
  });

  it("handles leap years", () => {
    const age = getBabyAge("2028-02-29", "2029-02-28");
    expect(age.months).toBe(12);
    expect(age.days).toBe(365);
    expect(age.firstBirthday).toBe("2029-02-28");
    expect(age.isFirstBirthday).toBe(true);
  });

  it("counts down to the first birthday", () => {
    const age = getBabyAge("2026-01-01", "2026-09-22");
    expect(age.firstBirthday).toBe("2027-01-01");
    expect(age.daysUntilFirstBirthday).toBe(101);
    expect(formatFirstBirthdayCountdown(age)).toBe("첫돌까지 101일");
  });

  it("marks first birthday and after", () => {
    const birthday = getBabyAge("2026-01-01", "2027-01-01");
    expect(birthday.isFirstBirthday).toBe(true);
    expect(birthday.months).toBe(12);
    expect(formatJourneyLabel(birthday)).toBe("오늘은 첫돌이에요!");

    const after = getBabyAge("2026-01-01", "2027-02-15");
    expect(after.hasFirstBirthdayPassed).toBe(true);
    expect(after.months).toBe(13);
    expect(formatFirstBirthdayCountdown(after)).toBe("첫돌을 지났어요 🎂");
  });

  it("returns zeros for a future birth date", () => {
    const age = getBabyAge("2026-12-01", "2026-09-30");
    expect(age.isBeforeBirth).toBe(true);
    expect(age.days).toBe(0);
    expect(age.months).toBe(0);
  });

  it("provides a fractional month for positioning", () => {
    const age = getBabyAge("2026-01-01", "2026-09-16");
    expect(age.months).toBe(8);
    expect(age.fractionalMonths).toBeCloseTo(8 + 15 / 30, 5);
  });

  it("is consistent across many consecutive days", () => {
    let previous = getBabyAge("2025-11-30", "2025-11-30");
    for (let i = 1; i < 800; i++) {
      const today = new Date(Date.UTC(2025, 10, 30 + i)).toISOString().slice(0, 10);
      const age = getBabyAge("2025-11-30", today);
      expect(age.days).toBe(previous.days + 1);
      expect(age.months).toBeGreaterThanOrEqual(previous.months);
      expect(age.fractionalMonths).toBeGreaterThan(previous.fractionalMonths);
      previous = age;
    }
  });
});
