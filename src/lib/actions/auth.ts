"use server";

import { redirect } from "next/navigation";
import { getEnabledOAuthProviders, getSiteUrl, type OAuthProvider } from "@/lib/env";
import { safeNextPath } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import { actionError, formString, type ActionState } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않아요.";
  if (lower.includes("email not confirmed")) return "이메일 인증을 먼저 완료해 주세요. 메일함을 확인해 주세요.";
  if (lower.includes("already registered") || lower.includes("already been registered"))
    return "이미 가입된 이메일이에요. 로그인해 주세요.";
  if (lower.includes("password")) return "비밀번호 조건을 확인해 주세요.";
  if (lower.includes("rate limit") || lower.includes("too many")) return "요청이 많아요. 잠시 후 다시 시도해 주세요.";
  return "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

export async function signInWithEmail(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const next = safeNextPath(formString(formData, "next"));

  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "이메일 주소를 확인해 주세요.";
  if (!password) fieldErrors.password = "비밀번호를 입력해 주세요.";
  if (Object.keys(fieldErrors).length > 0) return actionError("입력한 내용을 확인해 주세요.", fieldErrors);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return actionError(translateAuthError(error.message));

  redirect(next);
}

export async function signUpWithEmail(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const passwordConfirm = formString(formData, "passwordConfirm");
  const agreed = formData.get("agree") === "on";

  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "이메일 주소를 확인해 주세요.";
  if (password.length < MIN_PASSWORD_LENGTH) fieldErrors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상으로 입력해 주세요.`;
  if (password !== passwordConfirm) fieldErrors.passwordConfirm = "비밀번호가 서로 달라요.";
  if (!agreed) fieldErrors.agree = "개인정보 수집·이용에 동의해 주세요.";
  if (Object.keys(fieldErrors).length > 0) return actionError("입력한 내용을 확인해 주세요.", fieldErrors);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/onboarding` },
  });
  if (error) return actionError(translateAuthError(error.message));

  // 이메일 인증이 꺼져 있으면 바로 세션이 생긴다.
  if (data.session) redirect("/onboarding");

  return {
    ok: true,
    message: `${email} 로 인증 메일을 보냈어요. 메일의 링크를 누르면 가입이 완료돼요.`,
  };
}

export async function signInWithOAuth(provider: OAuthProvider, nextPath?: string): Promise<void> {
  if (!getEnabledOAuthProviders().includes(provider)) redirect("/login?error=provider");

  const supabase = await createClient();
  const next = safeNextPath(nextPath);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
