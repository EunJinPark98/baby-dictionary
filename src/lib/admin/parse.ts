import { isValidIsoDate } from "@/lib/date/date-only";
import type { FieldSpec } from "./config";

/**
 * 관리자 폼 → DB 값 변환/검증 (순수 함수).
 */

export type AdminValues = Record<string, string | number | boolean | string[] | null>;

export function parseAdminForm(
  fields: readonly FieldSpec[],
  get: (name: string) => string | null,
  getAll: (name: string) => string[],
): { ok: true; values: AdminValues } | { ok: false; errors: Record<string, string> } {
  const values: AdminValues = {};
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const raw = (get(field.name) ?? "").trim();

    switch (field.type) {
      case "bool":
        values[field.name] = get(field.name) === "on" || get(field.name) === "true";
        continue;
      case "multiselect": {
        const allowed = new Set((field.options ?? []).map((o) => o.value));
        const selected = getAll(field.name).filter((v) => allowed.has(v));
        values[field.name] = selected;
        if (field.required && selected.length === 0) errors[field.name] = `${field.label}을(를) 선택해 주세요.`;
        continue;
      }
      case "lines":
        values[field.name] = raw
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
        continue;
    }

    if (raw === "") {
      if (field.required) errors[field.name] = `${field.label}을(를) 입력해 주세요.`;
      // text/textarea 는 DB 기본값이 '' 인 컬럼이 많으므로 빈 문자열로 저장
      values[field.name] = field.type === "text" || field.type === "textarea" ? "" : null;
      continue;
    }

    switch (field.type) {
      case "int":
      case "decimal": {
        const num = Number(raw);
        if (!Number.isFinite(num) || (field.type === "int" && !Number.isInteger(num))) {
          errors[field.name] = `${field.label}은(는) ${field.type === "int" ? "정수" : "숫자"}로 입력해 주세요.`;
        } else if ((field.min !== undefined && num < field.min) || (field.max !== undefined && num > field.max)) {
          errors[field.name] = `${field.label}은(는) ${field.min ?? "-"}~${field.max ?? "-"} 범위로 입력해 주세요.`;
        } else {
          values[field.name] = num;
        }
        break;
      }
      case "date":
        if (!isValidIsoDate(raw)) errors[field.name] = "날짜 형식을 확인해 주세요.";
        else values[field.name] = raw;
        break;
      case "url":
        if (!/^https?:\/\/\S+$/i.test(raw)) errors[field.name] = "http(s):// 로 시작하는 주소를 입력해 주세요.";
        else values[field.name] = raw;
        break;
      case "select":
        if (!(field.options ?? []).some((o) => o.value === raw)) errors[field.name] = "선택 값을 확인해 주세요.";
        else values[field.name] = raw;
        break;
      default:
        if (field.name === "slug" && !/^[a-z0-9-]+$/.test(raw)) errors[field.name] = "영문 소문자, 숫자, - 만 사용할 수 있어요.";
        else values[field.name] = raw;
    }
  }

  // 월령 범위 교차 검증
  if (typeof values.min_month === "number" && typeof values.max_month === "number" && values.min_month > values.max_month) {
    errors.max_month = "끝 월령은 시작 월령보다 크거나 같아야 해요.";
  }
  if (
    typeof values.typical_from_month === "number" &&
    typeof values.typical_to_month === "number" &&
    values.typical_from_month > values.typical_to_month
  ) {
    errors.typical_to_month = "끝 월령은 시작 월령보다 크거나 같아야 해요.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, values };
}

export interface ParsedIngredientLine {
  slug: string;
  amount: string;
  isOptional: boolean;
}

/**
 * 레시피 재료 편집 텍스트 파싱. 한 줄 형식: `재료slug | 분량 | 선택`
 *  예) beef | 15g
 *      zucchini | 10g | 선택
 */
export function parseIngredientLines(text: string): { ok: true; lines: ParsedIngredientLine[] } | { ok: false; error: string } {
  const lines: ParsedIngredientLine[] = [];
  const seen = new Set<string>();
  const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const [index, row] of rows.entries()) {
    const [slugRaw = "", amount = "", flag = ""] = row.split("|").map((p) => p.trim());
    const slug = slugRaw.toLowerCase();
    if (!/^[a-z0-9-]+$/.test(slug)) return { ok: false, error: `${index + 1}번째 줄의 재료 slug 를 확인해 주세요.` };
    if (seen.has(slug)) return { ok: false, error: `재료 '${slug}' 가 두 번 입력됐어요.` };
    seen.add(slug);
    lines.push({ slug, amount, isOptional: ["선택", "optional", "opt", "y", "yes"].includes(flag.toLowerCase()) });
  }
  return { ok: true, lines };
}

export function formatIngredientLines(lines: ReadonlyArray<{ slug: string; amount: string; isOptional: boolean }>): string {
  return lines.map((l) => [l.slug, l.amount, l.isOptional ? "선택" : ""].filter((p, i) => i < 2 || p).join(" | ")).join("\n");
}
