import { describe, expect, it } from "vitest";
import { validateNewPassword } from "./account";

describe("validateNewPassword", () => {
  it("accepts a matching password of 8+ chars", () => {
    expect(validateNewPassword("password1", "password1")).toBeNull();
  });
  it("rejects short, too long, or mismatched passwords", () => {
    expect(validateNewPassword("short", "short")?.password).toBeDefined();
    expect(validateNewPassword("a".repeat(73), "a".repeat(73))?.password).toBeDefined();
    expect(validateNewPassword("password1", "password2")?.passwordConfirm).toBeDefined();
  });
});
