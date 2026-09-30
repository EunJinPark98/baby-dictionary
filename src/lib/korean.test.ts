import { describe, expect, it } from "vitest";
import { hasFinalConsonant, withSubject, withTopic } from "./korean";

describe("korean particles", () => {
  it("detects final consonants", () => {
    expect(hasFinalConsonant("서준")).toBe(true);
    expect(hasFinalConsonant("한별이")).toBe(false);
    expect(hasFinalConsonant("Luna")).toBe(false);
    expect(hasFinalConsonant("")).toBe(false);
  });

  it("chooses topic and subject particles", () => {
    expect(withTopic("서준")).toBe("서준은");
    expect(withTopic("한별이")).toBe("한별이는");
    expect(withSubject("서준")).toBe("서준이");
    expect(withSubject("한별이")).toBe("한별이가");
  });
});
