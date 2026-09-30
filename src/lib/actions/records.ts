"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { todayIsoDate } from "@/lib/date/date-only";
import { PHOTO_BUCKET, requireUser } from "@/lib/queries/baby";
import type { DevelopmentStatus, FoodPreference } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { isOwnPhotoPath } from "@/lib/validation/baby";
import { validateGrowthInput, validateMemo, validateRecordDate } from "@/lib/validation/records";
import { buildVaccineSchedule } from "@/lib/vaccines/schedule";
import { actionError, actionOk, formOptionalNumber, formOptionalString, formString, type ActionState } from "./types";

/**
 * 아기 기록 Server Actions.
 * babyId 는 클라이언트에서 전달되지만, 모든 쓰기는 사용자 세션으로 실행되어 RLS(owns_baby)가
 * 다른 사람의 아기에 대한 쓰기를 차단한다. 여기서는 사용자 경험을 위한 검증만 한다.
 */

async function getOwnedBaby(babyId: string) {
  await requireUser();
  const supabase = await createClient();
  const { data: baby } = await supabase.from("babies").select("id, birth_date").eq("id", babyId).maybeSingle();
  return { supabase, baby };
}

// ---------------------------------------------------------------------------
// 발달 기록
// ---------------------------------------------------------------------------
const DEVELOPMENT_STATUSES: readonly DevelopmentStatus[] = ["doing", "not_yet", "unsure"];

export async function setDevelopmentStatus(
  babyId: string,
  itemId: string,
  status: DevelopmentStatus | null,
): Promise<{ ok: boolean }> {
  const { supabase, baby } = await getOwnedBaby(babyId);
  if (!baby) return { ok: false };

  if (status === null) {
    const { error } = await supabase
      .from("development_records")
      .delete()
      .eq("baby_id", babyId)
      .eq("development_item_id", itemId);
    revalidatePath("/development");
    return { ok: !error };
  }
  if (!DEVELOPMENT_STATUSES.includes(status)) return { ok: false };

  const { error } = await supabase
    .from("development_records")
    .upsert(
      { baby_id: babyId, development_item_id: itemId, status, observed_on: todayIsoDate() },
      { onConflict: "baby_id,development_item_id" },
    );
  revalidatePath("/development");
  return { ok: !error };
}

// ---------------------------------------------------------------------------
// 먹어본 재료
// ---------------------------------------------------------------------------
const FOOD_PREFERENCES: readonly FoodPreference[] = ["good", "okay", "dislike"];

/** 빠른 체크: 먹어봤어요 ↔ 기록 삭제 */
export async function toggleFoodTried(babyId: string, foodId: string, tried: boolean): Promise<{ ok: boolean }> {
  const { supabase, baby } = await getOwnedBaby(babyId);
  if (!baby) return { ok: false };

  const { error } = tried
    ? await supabase
        .from("baby_food_records")
        .upsert(
          { baby_id: babyId, food_id: foodId, first_tried_on: todayIsoDate() },
          { onConflict: "baby_id,food_id", ignoreDuplicates: true },
        )
    : await supabase.from("baby_food_records").delete().eq("baby_id", babyId).eq("food_id", foodId);

  revalidatePath("/food", "layout");
  return { ok: !error };
}

export async function saveFoodRecord(
  babyId: string,
  foodId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, baby } = await getOwnedBaby(babyId);
  if (!baby) return actionError("아기 정보를 찾을 수 없어요.");

  const firstTriedOn = formString(formData, "first_tried_on");
  const preferenceRaw = formString(formData, "preference");
  const reactionNote = formOptionalString(formData, "reaction_note");
  const memo = formOptionalString(formData, "memo");

  const errors: Record<string, string> = {};
  const dateError = validateRecordDate(firstTriedOn, { birthDate: baby.birth_date, today: todayIsoDate() });
  if (dateError) errors.first_tried_on = dateError;
  const preference = FOOD_PREFERENCES.find((p) => p === preferenceRaw) ?? null;
  if (preferenceRaw && !preference) errors.preference = "선택 값을 확인해 주세요.";
  const reactionError = validateMemo(reactionNote);
  if (reactionError) errors.reaction_note = reactionError;
  const memoError = validateMemo(memo);
  if (memoError) errors.memo = memoError;
  if (Object.keys(errors).length > 0) return actionError("입력한 내용을 확인해 주세요.", errors);

  const { error } = await supabase.from("baby_food_records").upsert(
    {
      baby_id: babyId,
      food_id: foodId,
      first_tried_on: firstTriedOn,
      preference,
      reaction_note: reactionNote,
      memo,
    },
    { onConflict: "baby_id,food_id" },
  );
  if (error) return actionError("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");

  revalidatePath("/food", "layout");
  return actionOk("✦ 새로운 맛을 기록했어요!");
}

// ---------------------------------------------------------------------------
// 예방접종 기록
// ---------------------------------------------------------------------------
export async function saveVaccination(
  babyId: string,
  vaccineId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, baby } = await getOwnedBaby(babyId);
  if (!baby) return actionError("아기 정보를 찾을 수 없어요.");

  const vaccinatedOn = formString(formData, "vaccinated_on");
  const memo = formOptionalString(formData, "memo");
  const dateError = validateRecordDate(vaccinatedOn, { birthDate: baby.birth_date, today: todayIsoDate() });
  if (dateError) return actionError(dateError, { vaccinated_on: dateError });
  const memoError = validateMemo(memo);
  if (memoError) return actionError(memoError, { memo: memoError });

  const { error } = await supabase
    .from("vaccination_records")
    .upsert({ baby_id: babyId, vaccine_id: vaccineId, vaccinated_on: vaccinatedOn, memo }, { onConflict: "baby_id,vaccine_id" });
  if (error) return actionError("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");

  revalidatePath("/baby/vaccines");
  revalidatePath("/today");
  // 저장 후 항목이 '완료' 목록으로 이동하므로, 페이지 상단에서 결과를 알려준다.
  redirect(`/baby/vaccines?saved=${vaccineId}`);
}

export async function deleteVaccination(babyId: string, vaccineId: string): Promise<void> {
  const { supabase, baby } = await getOwnedBaby(babyId);
  if (!baby) return;
  await supabase.from("vaccination_records").delete().eq("baby_id", babyId).eq("vaccine_id", vaccineId);
  revalidatePath("/baby/vaccines");
  revalidatePath("/today");
}

// ---------------------------------------------------------------------------
// 성장 기록
// ---------------------------------------------------------------------------
export async function addGrowthRecord(babyId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, baby } = await getOwnedBaby(babyId);
  if (!baby) return actionError("아기 정보를 찾을 수 없어요.");

  const result = validateGrowthInput(
    {
      measured_on: formString(formData, "measured_on"),
      height_cm: formOptionalNumber(formData, "height_cm"),
      weight_kg: formOptionalNumber(formData, "weight_kg"),
      head_cm: formOptionalNumber(formData, "head_cm"),
      memo: formOptionalString(formData, "memo"),
    },
    { birthDate: baby.birth_date, today: todayIsoDate() },
  );
  if (!result.ok) return actionError(result.errors.form ?? "입력한 내용을 확인해 주세요.", result.errors);

  const { error } = await supabase.from("growth_records").insert({ baby_id: babyId, ...result.value });
  if (error) return actionError("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");

  revalidatePath("/baby/growth");
  return actionOk("성장 기록을 저장했어요.");
}

export async function deleteGrowthRecord(recordId: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("growth_records").delete().eq("id", recordId);
  revalidatePath("/baby/growth");
}

// ---------------------------------------------------------------------------
// 성장 순간(milestone)
// ---------------------------------------------------------------------------
export async function addMilestone(babyId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const { supabase, baby } = await getOwnedBaby(babyId);
  if (!baby) return actionError("아기 정보를 찾을 수 없어요.");

  const stopId = formOptionalString(formData, "journey_stop_id");
  let title = formString(formData, "title");
  let emoji = formString(formData, "emoji") || "⭐";
  const happenedOn = formString(formData, "happened_on");
  const memo = formOptionalString(formData, "memo");
  const photoPath = formOptionalString(formData, "photo_path");

  if (stopId) {
    const { data: stop } = await supabase.from("journey_stops").select("id, title, emoji").eq("id", stopId).maybeSingle();
    if (!stop) return actionError("성장지도 항목을 찾을 수 없어요.");
    if (!title) title = stop.title;
    emoji = stop.emoji;
  }

  const errors: Record<string, string> = {};
  if (!title) errors.title = "어떤 순간인지 입력해 주세요.";
  else if (title.length > 40) errors.title = "40자 이내로 입력해 주세요.";
  const dateError = validateRecordDate(happenedOn, { birthDate: baby.birth_date, today: todayIsoDate() });
  if (dateError) errors.happened_on = dateError;
  const memoError = validateMemo(memo);
  if (memoError) errors.memo = memoError;
  if (photoPath && !isOwnPhotoPath(photoPath, user.id)) errors.photo_path = "사진을 다시 올려 주세요.";
  if ([...emoji].length > 4) emoji = "⭐";
  if (Object.keys(errors).length > 0) return actionError("입력한 내용을 확인해 주세요.", errors);

  const { error } = await supabase.from("baby_milestones").insert({
    baby_id: babyId,
    journey_stop_id: stopId,
    title,
    emoji,
    happened_on: happenedOn,
    memo,
    photo_path: photoPath,
  });
  if (error) return actionError("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");

  revalidatePath("/baby/milestones");
  revalidatePath("/map");
  return actionOk("✦ 새로운 별을 발견했어요!");
}

export async function deleteMilestone(milestoneId: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("baby_milestones").select("photo_path").eq("id", milestoneId).maybeSingle();
  if (!data) return;
  const { error } = await supabase.from("baby_milestones").delete().eq("id", milestoneId);
  if (!error && data.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([data.photo_path]);
  revalidatePath("/baby/milestones");
  revalidatePath("/map");
}

/**
 * 권장 시기가 이미 지난(기록 없는) 접종을 한 번에 완료로 기록한다.
 * 조금 자란 뒤 가입한 부모가 "확인이 필요해요" 목록에 압도되지 않도록 돕는다.
 * 접종일은 권장 시작일(오늘 이후면 오늘)로 기록하고 메모로 일괄 기록임을 남긴다. 이후 수정 가능.
 */
export async function markPastVaccinesDone(babyId: string): Promise<void> {
  const { supabase, baby } = await getOwnedBaby(babyId);
  if (!baby) return;
  const today = todayIsoDate();
  const [{ data: vaccines }, { data: records }] = await Promise.all([
    supabase.from("vaccines").select("*").eq("is_active", true),
    supabase.from("vaccination_records").select("vaccine_id, vaccinated_on").eq("baby_id", babyId),
  ]);
  const schedule = buildVaccineSchedule(vaccines ?? [], baby.birth_date, today, records ?? []);
  const rows = schedule
    .filter((s) => s.status === "check")
    .map((s) => ({
      baby_id: babyId,
      vaccine_id: s.vaccine.id,
      vaccinated_on: s.recommendedFrom <= today ? s.recommendedFrom : today,
      memo: "일괄 기록 (권장 시작일 기준, 실제 날짜로 수정할 수 있어요)",
    }));
  if (rows.length > 0) {
    await supabase.from("vaccination_records").upsert(rows, { onConflict: "baby_id,vaccine_id", ignoreDuplicates: true });
  }
  revalidatePath("/baby/vaccines");
  revalidatePath("/today");
}
