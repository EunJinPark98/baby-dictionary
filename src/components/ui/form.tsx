import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClass =
  "block w-full min-h-12 rounded-2xl border border-line bg-surface-2 px-4 text-base text-ink placeholder:text-ink-faint/70 transition-colors focus:border-gold-500/60 focus:outline-none focus:ring-4 focus:ring-gold-500/10 aria-invalid:border-blush-500";

interface FieldProps {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, optional, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
        {optional ? <span className="ml-1 font-normal text-ink-faint">(선택)</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-[13px] text-ink-faint">{hint}</p> : null}
      {error ? (
        <p className="text-[13px] font-medium text-blush-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} min-h-24 py-3 ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} appearance-none ${props.className ?? ""}`} />;
}

/** 폼 결과 메시지 (성공/실패) */
export function FormMessage({ state }: { state: { ok: boolean; message: string } | null | undefined }) {
  if (!state?.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-2xl px-4 py-3 text-sm font-medium ${state.ok ? "border border-mint-700/25 bg-mint-100 text-mint-700" : "border border-blush-500/25 bg-blush-50 text-blush-500"}`}
    >
      {state.message}
    </p>
  );
}

/**
 * 큰 라디오 선택지 (작은 체크박스 남발 대신 엄지로 누르기 쉬운 칩).
 */
export function ChoiceChips<T extends string>({
  name,
  options,
  defaultValue,
  legend,
  required,
}: {
  name: string;
  options: ReadonlyArray<{ value: T; label: string; emoji?: string }>;
  defaultValue?: T | null;
  legend: string;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={defaultValue === option.value}
              required={required}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-12 items-center gap-1.5 rounded-2xl border border-line bg-surface-2 px-4 text-[15px] font-medium text-ink-soft transition-colors peer-checked:border-gold-500/60 peer-checked:bg-gold-100 peer-checked:text-gold-700 peer-checked:shadow-[0_0_20px_rgb(245_197_66/0.12)] peer-focus-visible:ring-4 peer-focus-visible:ring-gold-500/20">
              {option.emoji ? <span aria-hidden>{option.emoji}</span> : null}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
