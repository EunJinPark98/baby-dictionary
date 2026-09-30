"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import type { ActionState } from "@/lib/actions/types";

/**
 * useActionState + onSubmit 제출.
 *
 * React 19 는 `<form action>` 제출 후 폼을 항상 초기화하므로, 검증 오류가 나면 사용자가 입력한 값이
 * 사라진다. onSubmit 에서 직접 액션을 호출해 입력값을 유지하고, 성공 시에만 선택적으로 초기화한다.
 */
export function useActionForm(
  action: (state: ActionState, formData: FormData) => Promise<ActionState>,
  { resetOnSuccess = false }: { resetOnSuccess?: boolean } = {},
) {
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.ok) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return { state, pending, formRef, onSubmit, errors: state?.fieldErrors ?? {} };
}
