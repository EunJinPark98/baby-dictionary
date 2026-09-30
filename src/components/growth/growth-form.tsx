"use client";

import { useActionForm } from "@/components/ui/use-action-form";
import { Field, FormMessage, TextArea, TextInput } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/actions/types";
import { GROWTH_LIMITS } from "@/lib/validation/records";

export function GrowthForm({
  action,
  today,
  birthDate,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  today: string;
  birthDate: string;
}) {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(action, { resetOnSuccess: true });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <Field label="측정일" htmlFor="measured_on" error={errors.measured_on}>
        <TextInput id="measured_on" name="measured_on" type="date" required min={birthDate} max={today} defaultValue={today} />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        {(["height_cm", "weight_kg", "head_cm"] as const).map((key) => {
          const limit = GROWTH_LIMITS[key];
          return (
            <Field key={key} label={`${limit.label}(${limit.unit})`} htmlFor={key} error={errors[key]}>
              <TextInput
                id={key}
                name={key}
                type="number"
                inputMode="decimal"
                step={limit.step}
                min={limit.min}
                max={limit.max}
                placeholder="-"
              />
            </Field>
          );
        })}
      </div>
      <Field label="메모" htmlFor="memo" optional error={errors.memo}>
        <TextArea id="memo" name="memo" maxLength={500} className="min-h-16" placeholder="예: 영유아 건강검진" />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending={pending} size="lg" className="w-full">
        기록 추가
      </SubmitButton>
    </form>
  );
}
