/** Server Action 결과 (useActionState 와 함께 사용) */
export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  /** 성공 응답마다 달라지는 값 (클라이언트에서 폼 하위 상태를 초기화할 때 key 로 사용) */
  nonce?: number;
} | null;

export function actionError(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { ok: false, message, fieldErrors };
}

export function actionOk(message: string): ActionState {
  return { ok: true, message, nonce: Date.now() };
}

/** FormData 에서 공백 제거한 문자열 (없으면 빈 문자열) */
export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** 빈 문자열이면 null */
export function formOptionalString(formData: FormData, key: string): string | null {
  const value = formString(formData, key);
  return value === "" ? null : value;
}

/** 숫자 입력 (빈 값이면 null, 숫자가 아니면 NaN) */
export function formOptionalNumber(formData: FormData, key: string): number | null {
  const value = formString(formData, key);
  if (value === "") return null;
  return Number(value.replace(",", "."));
}
