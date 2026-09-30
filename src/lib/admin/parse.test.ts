import { describe, expect, it } from "vitest";
import { ADMIN_CONTENT, getAdminConfig, getEditableFields } from "./config";
import { formatIngredientLines, parseAdminForm, parseIngredientLines } from "./parse";

function formOf(entries: Record<string, string | string[]>) {
  return {
    get: (name: string) => {
      const v = entries[name];
      return v === undefined ? null : Array.isArray(v) ? (v[0] ?? null) : v;
    },
    getAll: (name: string) => {
      const v = entries[name];
      return v === undefined ? [] : Array.isArray(v) ? v : [v];
    },
  };
}

describe("parseAdminForm", () => {
  const activity = getAdminConfig("activities")!;
  const fields = getEditableFields(activity);

  it("parses a valid activity", () => {
    const form = formOf({
      slug: "cup-game",
      title: "컵 놀이",
      emoji: "🥤",
      categories: ["cognitive", "invalid"],
      min_month: "8",
      max_month: "10",
      steps: "하나\n\n 둘 ",
      duration_minutes: "",
      is_published: "on",
      reviewed_at: "2026-09-01",
    });
    const result = parseAdminForm(fields, form.get, form.getAll);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.values).toMatchObject({
      slug: "cup-game",
      categories: ["cognitive"],
      min_month: 8,
      max_month: 10,
      steps: ["하나", "둘"],
      duration_minutes: null,
      is_published: true,
      is_sample: false,
      reviewed_at: "2026-09-01",
      description: "",
    });
  });

  it("reports required, range and slug errors", () => {
    const form = formOf({ slug: "Bad Slug", title: "", emoji: "x", min_month: "10", max_month: "8" });
    const result = parseAdminForm(fields, form.get, form.getAll);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(["max_month", "slug", "title"]);
  });

  it("validates urls and select options", () => {
    const source = getAdminConfig("sources")!;
    const bad = formOf({ organization: "WHO", title: "t", url: "javascript:alert(1)" });
    expect(parseAdminForm(source.fields, bad.get, bad.getAll).ok).toBe(false);

    const foods = getAdminConfig("foods")!;
    const wrongCategory = formOf({ slug: "x", name: "x", emoji: "x", category: "candy" });
    const result = parseAdminForm(foods.fields, wrongCategory.get, wrongCategory.getAll);
    expect(result.ok).toBe(false);
  });

  it("has unique keys and a title field for every config", () => {
    const keys = ADMIN_CONTENT.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const config of ADMIN_CONTENT) {
      expect(config.fields.some((f) => f.name === config.titleField)).toBe(true);
    }
  });
});

describe("parseIngredientLines", () => {
  it("parses slug | amount | optional", () => {
    expect(parseIngredientLines("rice | 불린 쌀 30g\nZucchini | 10g | 선택\n")).toEqual({
      ok: true,
      lines: [
        { slug: "rice", amount: "불린 쌀 30g", isOptional: false },
        { slug: "zucchini", amount: "10g", isOptional: true },
      ],
    });
  });

  it("rejects duplicates and bad slugs", () => {
    expect(parseIngredientLines("rice\nrice").ok).toBe(false);
    expect(parseIngredientLines("쌀 | 20g").ok).toBe(false);
  });

  it("round-trips through formatIngredientLines", () => {
    const text = "rice | 20g\nbeef | 10g | 선택";
    const parsed = parseIngredientLines(text);
    expect(parsed.ok && formatIngredientLines(parsed.lines)).toBe(text);
  });
});
