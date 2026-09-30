"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/env";
import { PHOTO_BUCKET, SELECTED_BABY_COOKIE, requireUser } from "@/lib/queries/baby";
import { createClient } from "@/lib/supabase/server";
import { DELETE_CONFIRM_PHRASE, validateNewPassword } from "@/lib/validation/account";
import { actionError, actionOk, formString, type ActionState } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 비밀번호 재설정 메일 보내기 (로그인 전).
 * 가입 여부를 노출하지 않도록 결과와 상관없이 같은 안내를 보여준다.
 */
export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = formString(formData, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return actionError("이메일 주소를 확인해 주세요.", { email: "이메일 주소를 확인해 주세요." });

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/settings/password?recovery=1")}`,
  });
  return actionOk(`${email} 로 가입된 계정이 있다면 비밀번호 재설정 메일을 보냈어요. 메일의 링크를 눌러 새 비밀번호를 정해 주세요.`);
}

/** 새 비밀번호로 변경 (로그인 상태 또는 재설정 메일 링크로 들어온 상태) */
export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const password = formString(formData, "password");
  const confirm = formString(formData, "passwordConfirm");
  const errors = validateNewPassword(password, confirm);
  if (errors) return actionError("입력한 내용을 확인해 주세요.", errors);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const same = error.message.toLowerCase().includes("different from the old");
    return actionError(same ? "지금 쓰는 비밀번호와 다른 비밀번호를 입력해 주세요." : "비밀번호를 바꾸지 못했어요. 다시 로그인한 뒤 시도해 주세요.");
  }
  return actionOk("비밀번호를 바꿨어요.");
}

/**
 * 회원 탈퇴: 사진 파일 삭제 → 계정 삭제(DB 함수, 모든 기록 cascade) → 로그아웃.
 * 모든 작업은 사용자 세션으로 실행되며 본인 데이터만 지울 수 있다.
 */
export async function deleteAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (formString(formData, "confirm") !== DELETE_CONFIRM_PHRASE) {
    return actionError(`확인을 위해 '${DELETE_CONFIRM_PHRASE}'를 정확히 입력해 주세요.`, { confirm: "문구가 일치하지 않아요." });
  }

  const supabase = await createClient();

  // 1) 비공개 버킷의 본인 사진 삭제 ({userId}/profile, {userId}/milestones)
  for (const folder of ["profile", "milestones"]) {
    const prefix = `${user.id}/${folder}`;
    const { data: files } = await supabase.storage.from(PHOTO_BUCKET).list(prefix, { limit: 1000 });
    const paths = (files ?? []).filter((f) => f.name).map((f) => `${prefix}/${f.name}`);
    if (paths.length > 0) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
  }

  // 2) 계정 삭제 (profiles, babies → 모든 기록, favorites 가 함께 삭제됨)
  const { error } = await supabase.rpc("delete_my_account");
  if (error) return actionError("탈퇴를 처리하지 못했어요. 잠시 후 다시 시도해 주세요.");

  // 3) 이 기기의 세션/선택 정보 정리
  await supabase.auth.signOut({ scope: "local" });
  (await cookies()).delete(SELECTED_BABY_COOKIE);
  redirect("/goodbye");
}
