import { describe, expect, it } from "vitest";
import { normalizeSupabaseUrl } from "./env";

describe("normalizeSupabaseUrl", () => {
  it("keeps a correct project URL", () => {
    expect(normalizeSupabaseUrl("https://abcd1234.supabase.co")).toBe("https://abcd1234.supabase.co");
  });
  it("strips the REST path and trailing slashes copied from the dashboard", () => {
    expect(normalizeSupabaseUrl("https://abcd1234.supabase.co/rest/v1/")).toBe("https://abcd1234.supabase.co");
    expect(normalizeSupabaseUrl("https://abcd1234.supabase.co/")).toBe("https://abcd1234.supabase.co");
  });
  it("fixes whitespace, quotes and missing protocol", () => {
    expect(normalizeSupabaseUrl('  "abcd1234.supabase.co" ')).toBe("https://abcd1234.supabase.co");
  });
  it("converts a dashboard URL to the project URL", () => {
    expect(normalizeSupabaseUrl("https://supabase.com/dashboard/project/abcd1234/settings/api")).toBe("https://abcd1234.supabase.co");
  });
  it("keeps local development URLs", () => {
    expect(normalizeSupabaseUrl("http://127.0.0.1:54321")).toBe("http://127.0.0.1:54321");
  });
  it("rejects empty or invalid values", () => {
    expect(normalizeSupabaseUrl("   ")).toBeNull();
    expect(normalizeSupabaseUrl("https://")).toBeNull();
  });
});
