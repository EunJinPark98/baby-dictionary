import { describe, expect, it } from "vitest";
import { matchRecipes } from "./match";

const req = (food_id: string) => ({ food_id, is_optional: false });
const opt = (food_id: string) => ({ food_id, is_optional: true });

const recipes = [
  { id: "beef-zucchini", ingredients: [req("rice"), req("beef"), req("zucchini")] },
  { id: "potato-tofu", ingredients: [req("rice"), req("potato"), req("tofu")] },
  { id: "beef-carrot", ingredients: [req("rice"), req("beef"), req("carrot")] },
  { id: "cod-cabbage", ingredients: [req("rice"), req("cod"), req("cabbage")] },
  { id: "egg-veggie", ingredients: [req("rice"), req("egg"), req("carrot"), opt("zucchini")] },
  { id: "apple", ingredients: [req("apple")] },
];

describe("matchRecipes", () => {
  it("finds the product example recipes when rice is available", () => {
    const { ready } = matchRecipes(recipes, ["rice", "beef", "zucchini", "potato", "carrot", "tofu"]);
    expect(ready.map((m) => m.recipe.id).sort()).toEqual(["beef-carrot", "beef-zucchini", "potato-tofu"]);
  });

  it("lists almost-ready recipes with missing ingredients", () => {
    const { ready, almost } = matchRecipes(recipes, ["rice", "beef"]);
    expect(ready).toEqual([]);
    expect(almost.map((m) => [m.recipe.id, m.missing])).toEqual([
      ["beef-zucchini", ["zucchini"]],
      ["beef-carrot", ["carrot"]],
    ]);
  });

  it("does not require optional ingredients, but ranks recipes using them higher", () => {
    const { ready } = matchRecipes(recipes, ["rice", "egg", "carrot", "zucchini", "beef"]);
    expect(ready.map((m) => m.recipe.id)).toEqual(["egg-veggie", "beef-zucchini", "beef-carrot"]);
    expect(ready[0].usedCount).toBe(4);
  });

  it("respects maxMissing", () => {
    expect(matchRecipes(recipes, ["rice"], { maxMissing: 2 }).almost).toHaveLength(5);
    expect(matchRecipes(recipes, ["rice"], { maxMissing: 1 }).almost).toHaveLength(0);
  });

  it("ignores recipes that use none of the available ingredients", () => {
    const { ready, almost } = matchRecipes(recipes, ["banana"]);
    expect(ready).toEqual([]);
    expect(almost).toEqual([]);
  });

  it("handles an empty fridge", () => {
    expect(matchRecipes(recipes, [])).toEqual({ ready: [], almost: [] });
  });
});
