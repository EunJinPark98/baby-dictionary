import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEME_INIT_SCRIPT, isThemePreference, resolveTheme } from "./theme";

describe("theme", () => {
  it("defaults to light", () => {
    expect(DEFAULT_THEME).toBe("light");
  });

  it("resolves preferences", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it("validates stored values", () => {
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("blue")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });

  it("init script applies the stored theme before paint", () => {
    const attrs: Record<string, string> = {};
    const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
    const env = {
      localStorage: { getItem: () => "dark" },
      window: { matchMedia: () => ({ matches: false }) },
      document: {
        documentElement: root,
        querySelector: () => ({ setAttribute: (k: string, v: string) => (attrs[k] = v) }),
      },
    };
    new Function("localStorage", "window", "document", THEME_INIT_SCRIPT)(env.localStorage, env.window, env.document);
    expect(root.dataset.theme).toBe("dark");
    expect(attrs.content).toBe("#05060c");
  });

  it("init script falls back to light for unknown values", () => {
    const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
    new Function("localStorage", "window", "document", THEME_INIT_SCRIPT)(
      { getItem: () => null },
      { matchMedia: () => ({ matches: true }) },
      { documentElement: root, querySelector: () => null },
    );
    expect(root.dataset.theme).toBe("light");
  });
});
