"use client";

import { useState } from "react";
import { PhotoPicker } from "@/components/baby/photo-picker";
import { ChoiceChips, Field, FormMessage, Select, TextArea, TextInput } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/components/ui/use-action-form";
import type { ActionState } from "@/lib/actions/types";

const EMOJIS = ["⭐", "🦷", "🥣", "👣", "😊", "🎂", "💬", "🛁"] as const;

export function MilestoneForm({
  action,
  stops,
  defaultStopId,
  userId,
  today,
  birthDate,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  stops: { id: string; title: string; emoji: string }[];
  defaultStopId: string | null;
  userId: string;
  today: string;
  birthDate: string;
}) {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(action, { resetOnSuccess: true });
  const [stopId, setStopId] = useState(defaultStopId ?? "");
  const [uploading, setUploading] = useState(false);
  // 성공 시 사진 선택기도 초기화
  const pickerKey = state?.ok ? `done-${state.nonce}` : "picker";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <Field label="어떤 순간인가요?" htmlFor="journey_stop_id">
        <Select id="journey_stop_id" name="journey_stop_id" value={stopId} onChange={(e) => setStopId(e.target.value)}>
          <option value="">직접 입력할게요</option>
          {stops.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.emoji} {stop.title}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label={stopId ? "제목" : "순간 이름"}
        htmlFor="title"
        optional={Boolean(stopId)}
        error={errors.title}
        hint={stopId ? "비워두면 성장지도 이름으로 저장돼요." : "예: 첫 뒤집기, 첫니, 엄마 소리"}
      >
        <TextInput id="title" name="title" maxLength={40} />
      </Field>
      {!stopId ? (
        <ChoiceChips name="emoji" legend="아이콘" defaultValue="⭐" options={EMOJIS.map((e) => ({ value: e, label: e }))} />
      ) : null}
      <Field label="날짜" htmlFor="happened_on" error={errors.happened_on}>
        <TextInput id="happened_on" name="happened_on" type="date" required min={birthDate} max={today} defaultValue={today} />
      </Field>
      <Field label="메모" htmlFor="memo" optional error={errors.memo}>
        <TextArea id="memo" name="memo" maxLength={500} className="min-h-16" />
      </Field>
      <PhotoPicker key={pickerKey} userId={userId} folder="milestones" onUploadingChange={setUploading} />
      <FormMessage state={state?.fieldErrors ? { ok: false, message: state.message } : state} />
      <SubmitButton pending={pending} size="lg" className="w-full" disabled={uploading}>
        ⭐ 별 기록하기
      </SubmitButton>
    </form>
  );
}
