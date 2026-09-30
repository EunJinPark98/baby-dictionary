"use client";

import { useActionForm } from "@/components/ui/use-action-form";
import Link from "next/link";
import { Field, FormMessage, TextInput } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { signInWithEmail, signUpWithEmail } from "@/lib/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(signInWithEmail);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="이메일" htmlFor="email" error={errors.email}>
        <TextInput id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={Boolean(errors.email)} />
      </Field>
      <Field label="비밀번호" htmlFor="password" error={errors.password}>
        <TextInput id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(errors.password)} />
      </Field>
      <FormMessage state={state?.fieldErrors ? null : state} />
      <SubmitButton pending={pending} size="lg" className="w-full" pendingText="로그인 중…">
        로그인
      </SubmitButton>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="inline-flex min-h-11 items-center text-ink-faint underline underline-offset-2 hover:text-gold-700">
          비밀번호를 잊으셨나요?
        </Link>
      </p>
      <p className="text-center text-sm text-ink-soft">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="font-semibold text-gold-700 underline underline-offset-2">
          회원가입
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(signUpWithEmail);

  if (state?.ok) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-5xl" aria-hidden>
          💌
        </p>
        <FormMessage state={state} />
        <Link href="/login" className="inline-block text-sm font-semibold text-gold-700 underline underline-offset-2">
          로그인 화면으로
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="이메일" htmlFor="email" error={errors.email}>
        <TextInput id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={Boolean(errors.email)} />
      </Field>
      <Field label="비밀번호" htmlFor="password" hint="8자 이상" error={errors.password}>
        <TextInput id="password" name="password" type="password" autoComplete="new-password" minLength={8} required aria-invalid={Boolean(errors.password)} />
      </Field>
      <Field label="비밀번호 확인" htmlFor="passwordConfirm" error={errors.passwordConfirm}>
        <TextInput id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" required aria-invalid={Boolean(errors.passwordConfirm)} />
      </Field>
      <div className="rounded-2xl bg-surface/80 p-4 text-[13px] leading-relaxed text-ink-soft">
        <p className="font-semibold text-ink">개인정보 수집·이용 안내</p>
        <p className="mt-1">
          로그인을 위한 이메일, 아기 기록을 위한 이름(애칭)·생년월일과 선택 정보(성별·사진·기록)만 저장해요. 기록은 본인만 볼 수 있어요.
        </p>
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 font-medium text-ink">
          <input type="checkbox" name="agree" className="size-5 accent-gold-600" />
          동의합니다
        </label>
        {errors.agree ? (
          <p className="font-medium text-blush-500" role="alert">
            {errors.agree}
          </p>
        ) : null}
      </div>
      <FormMessage state={state?.fieldErrors ? null : state} />
      <SubmitButton pending={pending} size="lg" className="w-full" pendingText="가입 중…">
        가입하고 성장지도 만들기
      </SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-gold-700 underline underline-offset-2">
          로그인
        </Link>
      </p>
    </form>
  );
}
