import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  BabyFoodRecordRow,
  BabyMilestoneRow,
  DevelopmentRecordRow,
  GrowthRecordRow,
  VaccinationRecordRow,
} from "@/lib/supabase/database.types";

/**
 * 아기별 개인 기록 조회. 모든 쿼리는 사용자 세션으로 실행되어 RLS(owns_baby)가 적용된다.
 */

function fail(table: string, error: unknown): never {
  throw new Error(`기록을 불러오지 못했어요 (${table}).`, { cause: error });
}

export const getVaccinationRecords = cache(async (babyId: string): Promise<VaccinationRecordRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("vaccination_records").select("*").eq("baby_id", babyId);
  if (error) fail("vaccination_records", error);
  return data;
});

export const getDevelopmentRecords = cache(async (babyId: string): Promise<DevelopmentRecordRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("development_records").select("*").eq("baby_id", babyId);
  if (error) fail("development_records", error);
  return data;
});

export const getFoodRecords = cache(async (babyId: string): Promise<BabyFoodRecordRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("baby_food_records").select("*").eq("baby_id", babyId);
  if (error) fail("baby_food_records", error);
  return data;
});

export const getGrowthRecords = cache(async (babyId: string): Promise<GrowthRecordRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("growth_records")
    .select("*")
    .eq("baby_id", babyId)
    .order("measured_on", { ascending: true });
  if (error) fail("growth_records", error);
  return data;
});

export const getMilestones = cache(async (babyId: string): Promise<BabyMilestoneRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("baby_milestones")
    .select("*")
    .eq("baby_id", babyId)
    .order("happened_on", { ascending: true });
  if (error) fail("baby_milestones", error);
  return data;
});
