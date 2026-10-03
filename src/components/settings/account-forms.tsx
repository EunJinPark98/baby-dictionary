"use client";

import Link from "next/link";
import { Field, FormMessage, TextInput } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/components/ui/use-action-form";
import { deleteAccount, requestPasswordReset, updatePassword } from "@/lib/actions/account";
import { DELETE_CONFIRM_PHRASE } from "@/lib/validation/account";

export function ForgotPasswordForm() {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(requestPasswordReset);
  if (state?.ok) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-5xl" aria-hidden>
          💌
        </p>
        <FormMessage state={state} />
        <Link href="/login" className="inline-flex min-h-11 items-center text-sm font-semibold text-gold-700 underline underline-offset-2">
          로그인 화면으로
        </Link>
      </div>
    );
  }
  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="가입한 이메일" htmlFor="email" error={errors.email}>
        <TextInput id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={Boolean(errors.email)} />
      </Field>
      <FormMessage state={state?.fieldErrors ? null : state} />
      <SubmitButton pending={pending} size="lg" className="w-full" pendingText="보내는 중…">
        재설정 메일 받기
      </SubmitButton>
    </form>
  );
}

export function ChangePasswordForm() {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(updatePassword, { resetOnSuccess: true });
  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="새 비밀번호" htmlFor="password" hint="8자 이상" error={errors.password}>
        <TextInput id="password" name="password" type="password" autoComplete="new-password" minLength={8} required aria-invalid={Boolean(errors.password)} />
      </Field>
      <Field label="새 비밀번호 확인" htmlFor="passwordConfirm" error={errors.passwordConfirm}>
        <TextInput id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" required aria-invalid={Boolean(errors.passwordConfirm)} />
      </Field>
      <FormMessage state={state?.fieldErrors ? null : state} />
      <SubmitButton pending={pending} size="lg" className="w-full" pendingText="바꾸는 중…">
        비밀번호 변경
      </SubmitButton>
    </form>
  );
}

export function DeleteAccountForm({ guest = false }: { guest?: boolean }) {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(deleteAccount);
  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label={`확인을 위해 '${DELETE_CONFIRM_PHRASE}'를 입력해 주세요`} htmlFor="confirm" error={errors.confirm}>
        <TextInput id="confirm" name="confirm" autoComplete="off" placeholder={DELETE_CONFIRM_PHRASE} aria-invalid={Boolean(errors.confirm)} />
      </Field>
      <FormMessage state={state?.fieldErrors ? null : state} />
      <SubmitButton pending={pending} variant="danger" size="lg" className="w-full" pendingText={guest ? "삭제하는 중…" : "탈퇴 처리 중…"}>
        {guest ? "모든 기록 삭제하기" : "모든 기록을 삭제하고 탈퇴하기"}
      </SubmitButton>
    </form>
  );
}
