import { describe, expect, it } from "vitest";
import { isPrivatePath, safeNextPath, signedOutRedirect } from "./routes";

describe("routes", () => {
  it("detects private paths by prefix", () => {
    expect(isPrivatePath("/today")).toBe(true);
    expect(isPrivatePath("/baby/growth")).toBe(true);
    expect(isPrivatePath("/food/tried/carrot")).toBe(true);
    expect(isPrivatePath("/food/ingredients/carrot")).toBe(false);
    expect(isPrivatePath("/todayx")).toBe(false);
    expect(isPrivatePath("/")).toBe(false);
  });

  it("sends signed-out visitors to the guest start page, admins to login", () => {
    expect(signedOutRedirect("/today")).toBe("/onboarding");
    expect(signedOutRedirect("/baby/growth")).toBe("/onboarding");
    expect(signedOutRedirect("/onboarding")).toBeNull();
    expect(signedOutRedirect("/admin/foods")).toBe("/login");
    expect(signedOutRedirect("/food/ingredients")).toBeNull();
    expect(signedOutRedirect("/")).toBeNull();
  });

  it("only allows internal redirect targets", () => {
    expect(safeNextPath("/baby")).toBe("/baby");
    expect(safeNextPath("https://evil.example")).toBe("/today");
    expect(safeNextPath("//evil.example")).toBe("/today");
    expect(safeNextPath("/\\evil.example")).toBe("/today");
    expect(safeNextPath(null)).toBe("/today");
  });
});
