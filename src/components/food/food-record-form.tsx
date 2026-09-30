"use client";

import { useActionForm } from "@/components/ui/use-action-form";
import { ChoiceChips, Field, FormMessage, TextArea, TextInput } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/actions/types";
import { FOOD_PREFERENCES, FOOD_PREFERENCE_ORDER } from "@/lib/labels";
import type { BabyFoodRecordRow } from "@/lib/supabase/database.types";

export function FoodRecordForm({
  action,
  record,
  today,
  birthDate,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  record: BabyFoodRecordRow | null;
  today: string;
  birthDate: string;
}) {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(action);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
      <Field label="처음 먹은 날" htmlFor="first_tried_on" error={errors.first_tried_on}>
        <TextInput
          id="first_tried_on"
          name="first_tried_on"
          type="date"
          required
          min={birthDate}
          max={today}
          defaultValue={record?.first_tried_on ?? today}
        />
      </Field>
      <ChoiceChips
        name="preference"
        legend="어땠나요? (선택)"
        defaultValue={record?.preference ?? null}
        options={FOOD_PREFERENCE_ORDER.map((p) => ({ value: p, label: FOOD_PREFERENCES[p].label, emoji: FOOD_PREFERENCES[p].emoji }))}
      />
      <Field
        label="반응 기록"
        htmlFor="reaction_note"
        optional
        error={errors.reaction_note}
        hint="예: 입 주변이 살짝 붉어졌다가 금방 사라짐. 관찰한 내용을 그대로 적어주세요."
      >
        <TextArea id="reaction_note" name="reaction_note" maxLength={500} defaultValue={record?.reaction_note ?? ""} />
      </Field>
      <Field label="메모" htmlFor="memo" optional error={errors.memo}>
        <TextArea id="memo" name="memo" maxLength={500} defaultValue={record?.memo ?? ""} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending={pending} size="lg" className="w-full">
        기록 저장
      </SubmitButton>
    </form>
  );
}
