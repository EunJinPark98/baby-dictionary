"use client";

import { Field, FormMessage, TextInput } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/components/ui/use-action-form";
import type { ActionState } from "@/lib/actions/types";

export function VaccineRecordForm({
  action,
  id,
  defaultDate,
  defaultMemo,
  min,
  max,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  id: string;
  defaultDate: string;
  defaultMemo: string;
  min: string;
  max: string;
}) {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(action);
  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
      <Field label="접종일" htmlFor={`date-${id}`} error={errors.vaccinated_on}>
        <TextInput id={`date-${id}`} name="vaccinated_on" type="date" required min={min} max={max} defaultValue={defaultDate} />
      </Field>
      <Field label="메모" htmlFor={`memo-${id}`} optional error={errors.memo}>
        <TextInput id={`memo-${id}`} name="memo" maxLength={500} defaultValue={defaultMemo} placeholder="예: 접종 기관, 백신 종류" />
      </Field>
      <FormMessage state={state?.fieldErrors ? null : state} />
      <SubmitButton pending={pending} className="w-full">
        접종 완료로 기록
      </SubmitButton>
    </form>
  );
}
