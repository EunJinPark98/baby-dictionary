"use client";

import { useActionForm } from "@/components/ui/use-action-form";
import { useState } from "react";
import { ChoiceChips, Field, FormMessage, TextInput } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/actions/types";
import type { BabyRow } from "@/lib/supabase/database.types";
import { PhotoPicker } from "./photo-picker";

interface BabyFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  userId: string;
  today: string;
  baby?: Pick<BabyRow, "name" | "birth_date" | "sex" | "photo_path"> | null;
  photoUrl?: string | null;
  submitLabel: string;
}

export function BabyForm({ action, userId, today, baby = null, photoUrl = null, submitLabel }: BabyFormProps) {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(action);
  const [uploading, setUploading] = useState(false);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="이름 또는 애칭" htmlFor="name" error={errors.name} hint="예: 한별이">
        <TextInput
          id="name"
          name="name"
          required
          maxLength={20}
          defaultValue={baby?.name ?? ""}
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
        />
      </Field>
      <Field label="생년월일" htmlFor="birth_date" error={errors.birth_date} hint="생후 일수와 개월 수 계산에 사용해요.">
        <TextInput
          id="birth_date"
          name="birth_date"
          type="date"
          required
          max={today}
          defaultValue={baby?.birth_date ?? ""}
          aria-invalid={Boolean(errors.birth_date)}
        />
      </Field>
      <ChoiceChips
        name="sex"
        legend="성별 (선택)"
        defaultValue={baby?.sex ?? ""}
        options={[
          { value: "", label: "선택 안 함" },
          { value: "female", label: "여아" },
          { value: "male", label: "남아" },
        ]}
      />
      <PhotoPicker
        userId={userId}
        folder="profile"
        label="프로필 사진"
        initialPath={baby?.photo_path ?? null}
        initialUrl={photoUrl}
        onUploadingChange={setUploading}
      />
      {errors.photo_path ? <p className="text-sm text-blush-500">{errors.photo_path}</p> : null}
      <FormMessage state={state?.fieldErrors ? { ok: false, message: state.message } : state} />
      <SubmitButton pending={pending} size="lg" className="w-full" disabled={uploading}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
