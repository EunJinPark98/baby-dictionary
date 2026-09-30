import { describe, expect, it } from "vitest";
import { isOwnPhotoPath, validateBabyInput } from "./baby";

const ctx = { today: "2026-09-30", userId: "user-1" };
const valid = { name: " 한별이 ", birth_date: "2026-01-01", sex: "", photo_path: "" };

describe("validateBabyInput", () => {
  it("accepts a valid baby and trims the name", () => {
    expect(validateBabyInput(valid, ctx)).toEqual({
      ok: true,
      value: { name: "한별이", birth_date: "2026-01-01", sex: null, photo_path: null },
    });
  });

  it("rejects empty or long names", () => {
    expect(validateBabyInput({ ...valid, name: "  " }, ctx).ok).toBe(false);
    expect(validateBabyInput({ ...valid, name: "가".repeat(21) }, ctx).ok).toBe(false);
  });

  it("rejects future and invalid birth dates", () => {
    const future = validateBabyInput({ ...valid, birth_date: "2026-10-01" }, ctx);
    expect(future.ok).toBe(false);
    if (!future.ok) expect(future.errors.birth_date).toContain("오늘 이후");
    expect(validateBabyInput({ ...valid, birth_date: "2026-02-30" }, ctx).ok).toBe(false);
    expect(validateBabyInput({ ...valid, birth_date: "2020-01-01" }, ctx).ok).toBe(false);
  });

  it("accepts today as birth date", () => {
    expect(validateBabyInput({ ...valid, birth_date: "2026-09-30" }, ctx).ok).toBe(true);
  });

  it("validates sex values", () => {
    expect(validateBabyInput({ ...valid, sex: "female" }, ctx).ok).toBe(true);
    expect(validateBabyInput({ ...valid, sex: "other" }, ctx).ok).toBe(false);
  });

  it("rejects photo paths outside the user's folder", () => {
    expect(validateBabyInput({ ...valid, photo_path: "user-2/profile/a.jpg" }, ctx).ok).toBe(false);
    expect(validateBabyInput({ ...valid, photo_path: "user-1/profile/a.jpg" }, ctx).ok).toBe(true);
  });
});

describe("isOwnPhotoPath", () => {
  it("blocks traversal and foreign folders", () => {
    expect(isOwnPhotoPath("user-1/../user-2/a.jpg", "user-1")).toBe(false);
    expect(isOwnPhotoPath("user-10/a.jpg", "user-1")).toBe(false);
    expect(isOwnPhotoPath("user-1/milestones/abc-123.jpg", "user-1")).toBe(true);
  });
});
