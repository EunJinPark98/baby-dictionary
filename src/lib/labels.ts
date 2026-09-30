import type {
  ActivityCategory,
  DevelopmentDomain,
  DevelopmentStatus,
  FoodCategory,
  FoodPreference,
} from "@/lib/supabase/database.types";

/** UI 라벨 (콘텐츠가 아닌 고정 분류명) */

export interface LabelInfo {
  label: string;
  emoji: string;
}

export const DEVELOPMENT_DOMAINS: Record<DevelopmentDomain, LabelInfo> = {
  gross_motor: { label: "대근육", emoji: "🦵" },
  fine_motor: { label: "소근육", emoji: "✋" },
  language: { label: "언어", emoji: "🗣️" },
  cognitive: { label: "인지", emoji: "🧠" },
  social_emotional: { label: "사회성·정서", emoji: "💞" },
};

export const DEVELOPMENT_DOMAIN_ORDER: DevelopmentDomain[] = [
  "gross_motor",
  "fine_motor",
  "language",
  "cognitive",
  "social_emotional",
];

export const DEVELOPMENT_STATUSES: Record<DevelopmentStatus, LabelInfo> = {
  doing: { label: "하고 있어요", emoji: "✦" },
  not_yet: { label: "아직이에요", emoji: "☾" },
  unsure: { label: "잘 모르겠어요", emoji: "?" },
};

export const DEVELOPMENT_STATUS_ORDER: DevelopmentStatus[] = ["doing", "not_yet", "unsure"];

export const ACTIVITY_CATEGORIES: Record<ActivityCategory, LabelInfo> = {
  gross_motor: { label: "대근육", emoji: "🦵" },
  fine_motor: { label: "소근육", emoji: "✋" },
  cognitive: { label: "인지", emoji: "🧠" },
  language: { label: "언어", emoji: "🗣️" },
  sensory: { label: "감각", emoji: "👀" },
  social: { label: "사회성", emoji: "💞" },
};

export const ACTIVITY_CATEGORY_ORDER: ActivityCategory[] = [
  "gross_motor",
  "fine_motor",
  "cognitive",
  "language",
  "sensory",
  "social",
];

export const FOOD_CATEGORIES: Record<FoodCategory, LabelInfo> = {
  grain: { label: "곡류", emoji: "🌾" },
  vegetable: { label: "채소", emoji: "🥦" },
  fruit: { label: "과일", emoji: "🍎" },
  meat: { label: "육류", emoji: "🥩" },
  fish: { label: "생선", emoji: "🐟" },
  egg: { label: "달걀", emoji: "🥚" },
  soy: { label: "콩/두부", emoji: "🫘" },
  dairy: { label: "유제품", emoji: "🧀" },
  other: { label: "기타", emoji: "🥄" },
};

export const FOOD_CATEGORY_ORDER: FoodCategory[] = [
  "grain",
  "vegetable",
  "fruit",
  "meat",
  "fish",
  "egg",
  "soy",
  "dairy",
  "other",
];

export const FOOD_PREFERENCES: Record<FoodPreference, LabelInfo> = {
  good: { label: "잘 먹었어요", emoji: "😋" },
  okay: { label: "보통이에요", emoji: "🙂" },
  dislike: { label: "싫어했어요", emoji: "😖" },
};

export const FOOD_PREFERENCE_ORDER: FoodPreference[] = ["good", "okay", "dislike"];

/** "8~10개월", "12개월", "4개월부터" */
export function formatMonthRange(min: number, max: number): string {
  if (min === max) return `${min}개월`;
  return `${min}~${max}개월`;
}

export function isFoodCategory(value: string): value is FoodCategory {
  return value in FOOD_CATEGORIES;
}

export function isActivityCategory(value: string): value is ActivityCategory {
  return value in ACTIVITY_CATEGORIES;
}
