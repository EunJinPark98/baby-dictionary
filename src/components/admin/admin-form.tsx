"use client";

import { Field, FormMessage, Select, TextArea, TextInput } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/components/ui/use-action-form";
import type { ActionState } from "@/lib/actions/types";
import type { FieldSpec } from "@/lib/admin/config";

export type AdminInitialValue = string | number | boolean | string[] | null | undefined;

interface AdminFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: FieldSpec[];
  initial: Record<string, AdminInitialValue>;
  sources: { id: string; label: string }[] | null;
  selectedSourceIds: string[];
  recipeIngredients: string | null;
}

/** 설정 기반 관리자 편집 폼 */
export function AdminForm({ action, fields, initial, sources, selectedSourceIds, recipeIngredients }: AdminFormProps) {
  const { state, pending, formRef, onSubmit, errors } = useActionForm(action);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5" noValidate>
      {fields.map((field) => (
        <AdminField key={field.name} field={field} value={initial[field.name]} error={errors[field.name]} />
      ))}

      {recipeIngredients !== null ? (
        <Field
          label="재료 (도감 연결)"
          htmlFor="recipe_ingredients"
          error={errors.recipe_ingredients}
          hint="한 줄에 하나: 재료slug | 분량 | 선택  (예: zucchini | 10g | 선택)"
        >
          <TextArea id="recipe_ingredients" name="recipe_ingredients" defaultValue={recipeIngredients} className="min-h-40 font-mono text-sm" />
        </Field>
      ) : null}

      {sources ? (
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-ink">출처 연결</legend>
          {sources.length === 0 ? (
            <p className="text-sm text-ink-faint">등록된 출처가 없어요. 먼저 출처를 등록해 주세요.</p>
          ) : (
            <div className="space-y-1.5">
              {sources.map((source) => (
                <label key={source.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-3 text-sm">
                  <input type="checkbox" name="source_ids" value={source.id} defaultChecked={selectedSourceIds.includes(source.id)} className="size-5 accent-gold-600" />
                  {source.label}
                </label>
              ))}
            </div>
          )}
        </fieldset>
      ) : null}

      <FormMessage state={state} />
      <SubmitButton pending={pending} size="lg" className="w-full">
        저장
      </SubmitButton>
    </form>
  );
}

function AdminField({ field, value, error }: { field: FieldSpec; value: AdminInitialValue; error?: string }) {
  const id = `f-${field.name}`;
  const label = field.required ? `${field.label} *` : field.label;

  switch (field.type) {
    case "bool":
      return (
        <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4">
          <span>
            <span className="text-sm font-semibold text-ink">{field.label}</span>
            {field.hint ? <span className="block text-[12px] text-ink-faint">{field.hint}</span> : null}
          </span>
          <input type="checkbox" name={field.name} defaultChecked={Boolean(value)} className="size-6 accent-gold-600" />
        </label>
      );
    case "select":
      return (
        <Field label={label} htmlFor={id} hint={field.hint} error={error}>
          <Select id={id} name={field.name} defaultValue={typeof value === "string" ? value : ""}>
            <option value="">선택</option>
            {(field.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-ink">{label}</legend>
          <div className="flex flex-wrap gap-2">
            {(field.options ?? []).map((o) => (
              <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm">
                <input type="checkbox" name={field.name} value={o.value} defaultChecked={selected.includes(o.value)} className="size-5 accent-gold-600" />
                {o.label}
              </label>
            ))}
          </div>
          {error ? <p className="mt-1 text-[13px] text-blush-500">{error}</p> : null}
        </fieldset>
      );
    }
    case "textarea":
    case "lines":
      return (
        <Field label={label} htmlFor={id} hint={field.hint} error={error}>
          <TextArea id={id} name={field.name} defaultValue={Array.isArray(value) ? value.join("\n") : (value ?? "").toString()} className={field.type === "lines" ? "min-h-32" : ""} />
        </Field>
      );
    default:
      return (
        <Field label={label} htmlFor={id} hint={field.hint} error={error}>
          <TextInput
            id={id}
            name={field.name}
            type={field.type === "int" || field.type === "decimal" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"}
            step={field.type === "decimal" ? "0.1" : undefined}
            min={field.min}
            max={field.max}
            defaultValue={value === null || value === undefined ? "" : String(value)}
            aria-invalid={Boolean(error)}
          />
        </Field>
      );
  }
}
