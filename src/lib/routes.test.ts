import { describe, expect, it } from "vitest";
import { isPrivatePath, safeNextPath } from "./routes";

describe("routes", () => {
  it("detects private paths by prefix", () => {
    expect(isPrivatePath("/today")).toBe(true);
    expect(isPrivatePath("/baby/growth")).toBe(true);
    expect(isPrivatePath("/food/tried/carrot")).toBe(true);
    expect(isPrivatePath("/food/ingredients/carrot")).toBe(false);
    expect(isPrivatePath("/todayx")).toBe(false);
    expect(isPrivatePath("/")).toBe(false);
  });

  it("only allows internal redirect targets", () => {
    expect(safeNextPath("/baby")).toBe("/baby");
    expect(safeNextPath("https://evil.example")).toBe("/today");
    expect(safeNextPath("//evil.example")).toBe("/today");
    expect(safeNextPath("/\\evil.example")).toBe("/today");
    expect(safeNextPath(null)).toBe("/today");
  });
});
