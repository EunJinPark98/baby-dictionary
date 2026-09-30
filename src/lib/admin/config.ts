import type { ContentType, PublicTable } from "@/lib/supabase/database.types";
import { ACTIVITY_CATEGORIES, ACTIVITY_CATEGORY_ORDER, DEVELOPMENT_DOMAINS, DEVELOPMENT_DOMAIN_ORDER, FOOD_CATEGORIES, FOOD_CATEGORY_ORDER } from "@/lib/labels";

/**
 * 관리자 콘텐츠 편집 설정.
 * 새 콘텐츠 종류를 추가할 때는 여기에 필드 정의만 추가하면 목록/폼/저장이 자동으로 동작한다.
 */

export type FieldType = "text" | "textarea" | "int" | "decimal" | "bool" | "select" | "lines" | "multiselect" | "date" | "url";

export interface FieldSpec {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: ReadonlyArray<{ value: string; label: string }>;
  min?: number;
  max?: number;
}

export interface AdminContentConfig {
  key: string;
  table: PublicTable;
  label: string;
  emoji: string;
  /** 출처 연결용 콘텐츠 타입 (없으면 출처 연결 없음) */
  contentType: ContentType | null;
  titleField: string;
  /** 목록 부제 표시용 */
  subtitle: (row: Record<string, unknown>) => string;
  orderBy: string;
  fields: FieldSpec[];
  /** 레시피 재료처럼 별도 관계 편집이 필요한 경우 */
  hasRecipeIngredients?: boolean;
}

const slugField: FieldSpec = { name: "slug", label: "slug (URL)", type: "text", required: true, hint: "영문 소문자, 숫자, - 만 사용 (예: beef-zucchini)" };
const monthRange: FieldSpec[] = [
  { name: "min_month", label: "시작 월령", type: "int", required: true, min: 0, max: 36 },
  { name: "max_month", label: "끝 월령", type: "int", required: true, min: 0, max: 36 },
];

/** 공용 콘텐츠 공통 필드 (게시/샘플/검토일/정렬) */
export const CONTENT_META_FIELDS: FieldSpec[] = [
  { name: "sort_order", label: "정렬 순서", type: "int", min: 0, max: 100000 },
  { name: "is_published", label: "게시", type: "bool" },
  { name: "is_sample", label: "샘플 콘텐츠(검토 전)", type: "bool", hint: "전문가 검토 전이면 켜 두세요. 화면에 '샘플' 표시가 나타나요." },
  { name: "reviewed_at", label: "최종 검토일", type: "date" },
];

const range = (row: Record<string, unknown>) => `${row.min_month}~${row.max_month}개월`;

export const ADMIN_CONTENT: AdminContentConfig[] = [
  {
    key: "development",
    table: "development_items",
    label: "발달",
    emoji: "🧠",
    contentType: "development_item",
    titleField: "title",
    subtitle: (row) => `${DEVELOPMENT_DOMAINS[row.domain as keyof typeof DEVELOPMENT_DOMAINS]?.label ?? row.domain} · ${range(row)}`,
    orderBy: "min_month",
    fields: [
      slugField,
      { name: "title", label: "제목", type: "text", required: true },
      { name: "domain", label: "영역", type: "select", required: true, options: DEVELOPMENT_DOMAIN_ORDER.map((d) => ({ value: d, label: DEVELOPMENT_DOMAINS[d].label })) },
      ...monthRange,
      { name: "description", label: "설명", type: "textarea", hint: "'이 시기에 관찰될 수 있어요'처럼 단정하지 않는 표현을 사용하세요." },
      { name: "parent_activities", label: "부모가 해줄 수 있는 활동", type: "lines", hint: "한 줄에 하나씩" },
    ],
  },
  {
    key: "journey",
    table: "journey_stops",
    label: "성장지도",
    emoji: "🗺️",
    contentType: "journey_stop",
    titleField: "title",
    subtitle: (row) => `${row.typical_from_month}~${row.typical_to_month}개월 · ${row.kind}`,
    orderBy: "sort_order",
    fields: [
      slugField,
      { name: "title", label: "제목", type: "text", required: true },
      { name: "emoji", label: "이모지", type: "text", required: true },
      {
        name: "kind",
        label: "종류",
        type: "select",
        required: true,
        options: [
          { value: "start", label: "출발(출생)" },
          { value: "development", label: "발달" },
          { value: "food", label: "이유식" },
          { value: "tooth", label: "치아" },
          { value: "celebration", label: "기념일" },
        ],
      },
      { name: "typical_from_month", label: "흔한 시작 월령", type: "decimal", required: true, min: 0, max: 36 },
      { name: "typical_to_month", label: "흔한 끝 월령", type: "decimal", required: true, min: 0, max: 36 },
      { name: "summary", label: "한 줄 요약", type: "text" },
      { name: "description", label: "설명", type: "textarea" },
      { name: "tips", label: "팁", type: "lines", hint: "한 줄에 하나씩" },
    ],
  },
  {
    key: "weekly",
    table: "weekly_guides",
    label: "주차별 가이드",
    emoji: "📅",
    contentType: "weekly_guide",
    titleField: "title",
    subtitle: (row) => `생후 ${row.week}주`,
    orderBy: "week",
    fields: [
      { name: "week", label: "생후 주차", type: "int", required: true, min: 0, max: 60 },
      { name: "title", label: "제목", type: "text", required: true },
      { name: "development", label: "🧠 이번 주 발달", type: "textarea" },
      { name: "play", label: "🎈 추천 놀이", type: "textarea" },
      { name: "food_tip", label: "🥣 이유식 TIP", type: "textarea" },
      { name: "life_tip", label: "🦷 생활 TIP", type: "textarea" },
      { name: "safety_tip", label: "⚠️ 안전 TIP", type: "textarea" },
    ],
  },
  {
    key: "feeding",
    table: "feeding_stages",
    label: "이유식 단계",
    emoji: "🥣",
    contentType: "feeding_stage",
    titleField: "title",
    subtitle: range,
    orderBy: "sort_order",
    fields: [
      slugField,
      { name: "title", label: "제목", type: "text", required: true },
      ...monthRange,
      { name: "texture", label: "질감", type: "text" },
      { name: "frequency", label: "횟수", type: "text" },
      { name: "summary", label: "요약", type: "textarea" },
      { name: "tips", label: "팁", type: "lines" },
      { name: "cautions", label: "주의사항", type: "lines" },
    ],
  },
  {
    key: "foods",
    table: "foods",
    label: "이유식 재료",
    emoji: "🥕",
    contentType: "food",
    titleField: "name",
    subtitle: (row) => `${FOOD_CATEGORIES[row.category as keyof typeof FOOD_CATEGORIES]?.label ?? row.category}${row.recommended_from_month !== null ? ` · ${row.recommended_from_month}개월~` : ""}`,
    orderBy: "sort_order",
    fields: [
      slugField,
      { name: "name", label: "이름", type: "text", required: true },
      { name: "emoji", label: "이모지", type: "text", required: true },
      { name: "category", label: "분류", type: "select", required: true, options: FOOD_CATEGORY_ORDER.map((c) => ({ value: c, label: FOOD_CATEGORIES[c].label })) },
      { name: "recommended_from_month", label: "권장/참고 시작 월령", type: "int", min: 0, max: 36 },
      { name: "description", label: "소개", type: "textarea" },
      { name: "nutrition", label: "영양 정보", type: "textarea" },
      { name: "preparation", label: "조리 방법", type: "textarea" },
      { name: "pairings", label: "함께 먹기 좋은 재료 (slug)", type: "lines", hint: "재료 slug 를 한 줄에 하나씩 (예: beef)" },
      { name: "allergy_note", label: "알레르기 주의사항", type: "textarea" },
      { name: "is_common_allergen", label: "흔한 알레르기 유발 식품", type: "bool" },
      { name: "is_pantry_staple", label: "기본 재료(냉장고에서 보유 가정)", type: "bool" },
    ],
  },
  {
    key: "recipes",
    table: "recipes",
    label: "레시피",
    emoji: "🍚",
    contentType: "recipe",
    titleField: "title",
    subtitle: range,
    orderBy: "sort_order",
    hasRecipeIngredients: true,
    fields: [
      slugField,
      { name: "title", label: "제목", type: "text", required: true },
      { name: "emoji", label: "이모지", type: "text", required: true },
      ...monthRange,
      { name: "description", label: "소개", type: "textarea" },
      { name: "servings", label: "분량", type: "text" },
      { name: "texture", label: "질감", type: "text" },
      { name: "cook_minutes", label: "조리 시간(분)", type: "int", min: 1, max: 600 },
      { name: "extra_ingredients", label: "부재료 (도감에 없는 것)", type: "lines", hint: "예: 물 200ml" },
      { name: "steps", label: "만드는 방법", type: "lines", hint: "한 줄에 한 단계" },
      { name: "allergy_note", label: "알레르기 주의", type: "textarea" },
    ],
  },
  {
    key: "activities",
    table: "activities",
    label: "놀이",
    emoji: "🎈",
    contentType: "activity",
    titleField: "title",
    subtitle: range,
    orderBy: "min_month",
    fields: [
      slugField,
      { name: "title", label: "제목", type: "text", required: true },
      { name: "emoji", label: "이모지", type: "text", required: true },
      { name: "categories", label: "발달 영역", type: "multiselect", options: ACTIVITY_CATEGORY_ORDER.map((c) => ({ value: c, label: ACTIVITY_CATEGORIES[c].label })) },
      ...monthRange,
      { name: "description", label: "소개", type: "textarea" },
      { name: "materials", label: "준비물", type: "text" },
      { name: "duration_minutes", label: "예상 시간(분)", type: "int", min: 1, max: 120 },
      { name: "steps", label: "방법", type: "lines" },
      { name: "cautions", label: "주의사항", type: "lines" },
    ],
  },
  {
    key: "vaccines",
    table: "vaccines",
    label: "예방접종",
    emoji: "💉",
    contentType: "vaccine",
    titleField: "name",
    subtitle: (row) => `${row.dose_label} · ${row.recommended_label}`,
    orderBy: "sort_order",
    fields: [
      slugField,
      { name: "name", label: "백신명", type: "text", required: true },
      { name: "disease", label: "대상 감염병", type: "text" },
      { name: "dose_number", label: "차수(숫자)", type: "int", required: true, min: 1, max: 10 },
      { name: "dose_label", label: "차수 표시", type: "text", hint: "예: 1차" },
      { name: "min_age_days", label: "최소 연령(일)", type: "int", min: 0, max: 5000 },
      { name: "recommended_from_months", label: "권장 시작: 개월", type: "int", required: true, min: 0, max: 240 },
      { name: "recommended_from_days", label: "권장 시작: +일", type: "int", required: true, min: 0, max: 365 },
      { name: "recommended_to_months", label: "권장 끝: 개월", type: "int", required: true, min: 0, max: 240 },
      { name: "recommended_to_days", label: "권장 끝: +일", type: "int", required: true, min: 0, max: 365 },
      { name: "recommended_label", label: "권장 시기 표시", type: "text", hint: "예: 생후 2개월" },
      { name: "description", label: "설명", type: "textarea" },
      { name: "is_national", label: "국가예방접종", type: "bool" },
      { name: "is_active", label: "활성(일정에 표시)", type: "bool" },
      { name: "data_reference_date", label: "자료 기준일", type: "date", hint: "공식 일정표의 기준일. 반드시 입력하세요." },
    ],
  },
  {
    key: "safety",
    table: "safety_guides",
    label: "안전 정보",
    emoji: "⚠️",
    contentType: "safety_guide",
    titleField: "title",
    subtitle: (row) => `${row.trigger_label} · ${range(row)}`,
    orderBy: "sort_order",
    fields: [
      slugField,
      { name: "title", label: "제목", type: "text", required: true },
      { name: "emoji", label: "이모지", type: "text", required: true },
      { name: "trigger_label", label: "시기 라벨", type: "text", hint: "예: 뒤집기 시기" },
      ...monthRange,
      { name: "summary", label: "요약", type: "textarea" },
      { name: "checklist", label: "체크리스트", type: "lines" },
    ],
  },
  {
    key: "sources",
    table: "content_sources",
    label: "출처",
    emoji: "📚",
    contentType: null,
    titleField: "title",
    subtitle: (row) => String(row.organization),
    orderBy: "organization",
    fields: [
      { name: "organization", label: "기관", type: "text", required: true },
      { name: "title", label: "자료명", type: "text", required: true },
      { name: "url", label: "URL", type: "url" },
      { name: "published_at", label: "발행일", type: "date" },
      { name: "reviewed_at", label: "검토일", type: "date" },
    ],
  },
];

export function getAdminConfig(key: string): AdminContentConfig | null {
  return ADMIN_CONTENT.find((c) => c.key === key) ?? null;
}

/** 편집 폼에 표시할 전체 필드 (콘텐츠 테이블이면 공통 메타 필드 포함) */
export function getEditableFields(config: AdminContentConfig): FieldSpec[] {
  return config.contentType ? [...config.fields, ...CONTENT_META_FIELDS] : config.fields;
}
