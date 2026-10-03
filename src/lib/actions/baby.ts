"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { todayIsoDate } from "@/lib/date/date-only";
import { PHOTO_BUCKET, SELECTED_BABY_COOKIE, getCurrentUser, requireUser } from "@/lib/queries/baby";
import { createClient } from "@/lib/supabase/server";
import { validateBabyInput } from "@/lib/validation/baby";
import { actionError, formString, type ActionState } from "./types";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

function readBabyForm(formData: FormData) {
  return {
    name: formString(formData, "name"),
    birth_date: formString(formData, "birth_date"),
    sex: formString(formData, "sex"),
    photo_path: formString(formData, "photo_path"),
  };
}

/**
 * 아기 등록. 세션이 없으면(첫 방문) 로그인 대신 게스트 세션(Supabase 익명 로그인)을 만든 뒤 저장한다.
 * 게스트도 auth.uid() 를 가지므로 RLS(owns_baby) 가 그대로 적용된다.
 */
export async function createBaby(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const existingUser = await getCurrentUser();
  const result = validateBabyInput(readBabyForm(formData), { today: todayIsoDate(), userId: existingUser?.id ?? "" });
  if (!result.ok) return actionError("입력한 내용을 확인해 주세요.", result.errors);

  const supabase = await createClient();
  if (!existingUser) {
    const { error: guestError } = await supabase.auth.signInAnonymously();
    if (guestError) {
      console.error("[createBaby] anonymous sign-in failed", guestError.message);
      return actionError("지금은 바로 시작할 수 없어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  const { data, error } = await supabase.from("babies").insert(result.value).select("id").single();
  if (error) return actionError("아기 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");

  (await cookies()).set(SELECTED_BABY_COOKIE, data.id, COOKIE_OPTIONS);
  revalidatePath("/", "layout");
  redirect("/today?welcome=1");
}

export async function updateBaby(babyId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const result = validateBabyInput(readBabyForm(formData), { today: todayIsoDate(), userId: user.id });
  if (!result.ok) return actionError("입력한 내용을 확인해 주세요.", result.errors);

  const supabase = await createClient();
  const { data: previous } = await supabase.from("babies").select("photo_path").eq("id", babyId).maybeSingle();
  if (!previous) return actionError("아기 정보를 찾을 수 없어요.");

  const { error } = await supabase.from("babies").update(result.value).eq("id", babyId);
  if (error) return actionError("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");

  // 사진을 바꾸거나 지웠다면 이전 파일도 삭제 (본인 폴더만 RLS 로 허용)
  if (previous.photo_path && previous.photo_path !== result.value.photo_path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([previous.photo_path]);
  }

  revalidatePath("/", "layout");
  redirect("/baby?saved=1");
}

export async function deleteBaby(babyId: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();

  const [{ data: baby }, { data: milestonePhotos }] = await Promise.all([
    supabase.from("babies").select("photo_path").eq("id", babyId).maybeSingle(),
    supabase.from("baby_milestones").select("photo_path").eq("baby_id", babyId).not("photo_path", "is", null),
  ]);
  if (!baby) redirect("/baby");

  const { error } = await supabase.from("babies").delete().eq("id", babyId);
  if (error) redirect("/baby?error=delete");

  const photoPaths = [baby.photo_path, ...(milestonePhotos ?? []).map((m) => m.photo_path)].filter(
    (p): p is string => Boolean(p),
  );
  if (photoPaths.length > 0) await supabase.storage.from(PHOTO_BUCKET).remove(photoPaths);

  const cookieStore = await cookies();
  if (cookieStore.get(SELECTED_BABY_COOKIE)?.value === babyId) cookieStore.delete(SELECTED_BABY_COOKIE);

  revalidatePath("/", "layout");
  redirect("/baby");
}

export async function selectBaby(babyId: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  // RLS 로 본인 아기만 조회된다.
  const { data } = await supabase.from("babies").select("id").eq("id", babyId).maybeSingle();
  if (data) (await cookies()).set(SELECTED_BABY_COOKIE, data.id, COOKIE_OPTIONS);
  revalidatePath("/", "layout");
  redirect("/today");
}
