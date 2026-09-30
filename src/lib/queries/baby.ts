import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getBabyAge, type BabyAge } from "@/lib/age/age";
import { todayIsoDate, type IsoDate } from "@/lib/date/date-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient, type ServerSupabaseClient } from "@/lib/supabase/server";
import type { BabyRow } from "@/lib/supabase/database.types";
import type { User } from "@supabase/supabase-js";

export const SELECTED_BABY_COOKIE = "bsm_baby";
export const PHOTO_BUCKET = "baby-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** 현재 로그인 사용자 (없으면 null). 요청당 1회만 조회한다. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

export const requireUser = cache(async (): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

export const getBabies = cache(async (): Promise<BabyRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("babies").select("*").order("created_at");
  if (error) throw new Error("아기 정보를 불러오지 못했어요.", { cause: error });
  return data;
});

export interface BabyContext {
  supabase: ServerSupabaseClient;
  user: User;
  babies: BabyRow[];
  baby: BabyRow;
  today: IsoDate;
  age: BabyAge;
}

/**
 * 개인 페이지 공통 컨텍스트: 로그인 사용자 + 선택된 아기 + 오늘 기준 월령.
 * 로그인하지 않았으면 /login, 아기가 없으면 /onboarding 으로 보낸다.
 */
export const getBabyContext = cache(async (): Promise<BabyContext> => {
  const user = await requireUser();
  const babies = await getBabies();
  if (babies.length === 0) redirect("/onboarding");

  const selectedId = (await cookies()).get(SELECTED_BABY_COOKIE)?.value;
  const baby = babies.find((b) => b.id === selectedId) ?? babies[0];
  const today = todayIsoDate();

  return {
    supabase: await createClient(),
    user,
    babies,
    baby,
    today,
    age: getBabyAge(baby.birth_date, today),
  };
});

/** 비공개 버킷 사진의 짧은 만료 signed URL. 본인 경로만 RLS 로 허용된다. */
export async function getSignedPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export async function getSignedPhotoUrls(paths: readonly string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (paths.length === 0) return result;
  const supabase = await createClient();
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls([...paths], SIGNED_URL_TTL_SECONDS);
  data?.forEach((item) => {
    if (item.path && item.signedUrl) result.set(item.path, item.signedUrl);
  });
  return result;
}

/** 관리자 여부 (profiles.role). UI 분기용이며 실제 권한은 RLS(is_admin)가 강제한다. */
export const getIsAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin";
});

export interface OptionalBabyContext {
  baby: BabyRow;
  age: BabyAge;
  today: IsoDate;
}

/**
 * 공개 페이지에서 "로그인했다면" 아기 정보로 개인화할 때 사용. 리다이렉트하지 않는다.
 * (Supabase 미설정/비로그인/아기 없음 → null)
 */
export const getOptionalBabyContext = cache(async (): Promise<OptionalBabyContext | null> => {
  if (!isSupabaseConfigured()) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const babies = await getBabies();
  if (babies.length === 0) return null;
  const selectedId = (await cookies()).get(SELECTED_BABY_COOKIE)?.value;
  const baby = babies.find((b) => b.id === selectedId) ?? babies[0];
  const today = todayIsoDate();
  return { baby, today, age: getBabyAge(baby.birth_date, today) };
});
