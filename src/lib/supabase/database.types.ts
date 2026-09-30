/**
 * Supabase 데이터베이스 타입.
 *
 * supabase/migrations 의 스키마와 1:1 로 대응한다. 스키마를 바꾸면 이 파일도 함께 수정하거나
 * `npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts`
 * 로 재생성한다. (재생성 시 아래 도메인 별칭 export 는 별도 파일로 옮겨 유지)
 */

type Timestamps = {
  created_at: string;
  updated_at: string;
};

type ContentMeta = {
  is_published: boolean;
  is_sample: boolean;
  reviewed_at: string | null;
};

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

/** Row 에서 DB 기본값이 있는 컬럼(Optional)을 선택 입력으로 만든 테이블 정의 */
type TableDef<Row extends Record<string, unknown>, Optional extends keyof Row, Rel extends Relationship[] = []> = {
  Row: Row;
  Insert: Omit<Row, Optional> & Partial<Pick<Row, Optional>>;
  Update: Partial<Row>;
  Relationships: Rel;
};

type AutoColumns = "id" | "created_at" | "updated_at";
type ContentAutoColumns = AutoColumns | "is_published" | "is_sample" | "reviewed_at" | "sort_order";

// ---------------------------------------------------------------------------
// Enum-like unions
// ---------------------------------------------------------------------------
export type ProfileRole = "user" | "admin";
export type BabySex = "female" | "male";
export type DevelopmentDomain = "gross_motor" | "fine_motor" | "language" | "cognitive" | "social_emotional";
export type DevelopmentStatus = "doing" | "not_yet" | "unsure";
export type JourneyStopKind = "start" | "development" | "food" | "tooth" | "celebration";
export type FoodCategory = "grain" | "vegetable" | "fruit" | "meat" | "fish" | "egg" | "soy" | "dairy" | "other";
export type FoodPreference = "good" | "okay" | "dislike";
export type ActivityCategory = "gross_motor" | "fine_motor" | "cognitive" | "language" | "sensory" | "social";
export type ContentType =
  | "development_item"
  | "journey_stop"
  | "weekly_guide"
  | "feeding_stage"
  | "food"
  | "recipe"
  | "activity"
  | "vaccine"
  | "safety_guide";
export type FavoriteContentType = "activity" | "recipe" | "food" | "development_item";

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------
export type ProfileRow = Timestamps & {
  id: string;
  display_name: string | null;
  role: ProfileRole;
};

export type BabyRow = Timestamps & {
  id: string;
  owner_id: string;
  name: string;
  birth_date: string;
  sex: BabySex | null;
  photo_path: string | null;
};

export type ContentSourceRow = Timestamps & {
  id: string;
  organization: string;
  title: string;
  url: string | null;
  published_at: string | null;
  reviewed_at: string | null;
};

export type DevelopmentItemRow = Timestamps &
  ContentMeta & {
    id: string;
    slug: string;
    domain: DevelopmentDomain;
    min_month: number;
    max_month: number;
    title: string;
    description: string;
    parent_activities: string[];
    sort_order: number;
  };

export type JourneyStopRow = Timestamps &
  ContentMeta & {
    id: string;
    slug: string;
    kind: JourneyStopKind;
    emoji: string;
    title: string;
    typical_from_month: number;
    typical_to_month: number;
    summary: string;
    description: string;
    tips: string[];
    sort_order: number;
  };

export type WeeklyGuideRow = Timestamps &
  ContentMeta & {
    id: string;
    week: number;
    title: string;
    development: string;
    play: string;
    food_tip: string;
    life_tip: string;
    safety_tip: string;
  };

export type FeedingStageRow = Timestamps &
  ContentMeta & {
    id: string;
    slug: string;
    title: string;
    min_month: number;
    max_month: number;
    texture: string;
    frequency: string;
    summary: string;
    tips: string[];
    cautions: string[];
    sort_order: number;
  };

export type FoodRow = Timestamps &
  ContentMeta & {
    id: string;
    slug: string;
    name: string;
    emoji: string;
    category: FoodCategory;
    recommended_from_month: number | null;
    description: string;
    nutrition: string;
    preparation: string;
    pairings: string[];
    allergy_note: string;
    is_common_allergen: boolean;
    is_pantry_staple: boolean;
    sort_order: number;
  };

export type RecipeRow = Timestamps &
  ContentMeta & {
    id: string;
    slug: string;
    title: string;
    emoji: string;
    min_month: number;
    max_month: number;
    description: string;
    servings: string;
    texture: string;
    cook_minutes: number | null;
    extra_ingredients: string[];
    steps: string[];
    allergy_note: string;
    sort_order: number;
  };

export type RecipeIngredientRow = Timestamps & {
  id: string;
  recipe_id: string;
  food_id: string;
  amount: string;
  is_optional: boolean;
  sort_order: number;
};

export type ActivityRow = Timestamps &
  ContentMeta & {
    id: string;
    slug: string;
    title: string;
    emoji: string;
    categories: ActivityCategory[];
    min_month: number;
    max_month: number;
    description: string;
    materials: string;
    duration_minutes: number | null;
    steps: string[];
    cautions: string[];
    sort_order: number;
  };

export type VaccineRow = Timestamps &
  ContentMeta & {
    id: string;
    slug: string;
    name: string;
    disease: string;
    dose_number: number;
    dose_label: string;
    min_age_days: number | null;
    recommended_from_months: number;
    recommended_from_days: number;
    recommended_to_months: number;
    recommended_to_days: number;
    recommended_label: string;
    description: string;
    is_national: boolean;
    data_reference_date: string | null;
    is_active: boolean;
    sort_order: number;
  };

export type SafetyGuideRow = Timestamps &
  ContentMeta & {
    id: string;
    slug: string;
    title: string;
    emoji: string;
    trigger_label: string;
    min_month: number;
    max_month: number;
    summary: string;
    checklist: string[];
    sort_order: number;
  };

export type ContentSourceRelationRow = Timestamps & {
  id: string;
  source_id: string;
  content_type: ContentType;
  content_id: string;
};

export type GrowthStandardRow = Timestamps & {
  id: string;
  sex: BabySex;
  measure: "height" | "weight" | "head";
  age_months: number;
  p3: number | null;
  p15: number | null;
  p50: number | null;
  p85: number | null;
  p97: number | null;
  source_id: string | null;
};

export type GrowthRecordRow = Timestamps & {
  id: string;
  baby_id: string;
  measured_on: string;
  height_cm: number | null;
  weight_kg: number | null;
  head_cm: number | null;
  memo: string | null;
};

export type DevelopmentRecordRow = Timestamps & {
  id: string;
  baby_id: string;
  development_item_id: string;
  status: DevelopmentStatus;
  observed_on: string;
  memo: string | null;
};

export type BabyFoodRecordRow = Timestamps & {
  id: string;
  baby_id: string;
  food_id: string;
  first_tried_on: string | null;
  preference: FoodPreference | null;
  reaction_note: string | null;
  memo: string | null;
};

export type VaccinationRecordRow = Timestamps & {
  id: string;
  baby_id: string;
  vaccine_id: string;
  vaccinated_on: string;
  memo: string | null;
};

export type BabyMilestoneRow = Timestamps & {
  id: string;
  baby_id: string;
  journey_stop_id: string | null;
  title: string;
  emoji: string;
  happened_on: string;
  memo: string | null;
  photo_path: string | null;
};

export type FavoriteRow = Timestamps & {
  id: string;
  user_id: string;
  content_type: FavoriteContentType;
  content_id: string;
};

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
type BabyFk<Name extends string> = {
  foreignKeyName: `${Name}_baby_id_fkey`;
  columns: ["baby_id"];
  isOneToOne: false;
  referencedRelation: "babies";
  referencedColumns: ["id"];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, "created_at" | "updated_at" | "display_name" | "role">;
      babies: TableDef<BabyRow, AutoColumns | "owner_id" | "sex" | "photo_path">;
      content_sources: TableDef<ContentSourceRow, AutoColumns | "url" | "published_at" | "reviewed_at">;
      development_items: TableDef<
        DevelopmentItemRow,
        ContentAutoColumns | "description" | "parent_activities"
      >;
      journey_stops: TableDef<
        JourneyStopRow,
        ContentAutoColumns | "kind" | "emoji" | "summary" | "description" | "tips"
      >;
      weekly_guides: TableDef<
        WeeklyGuideRow,
        Exclude<ContentAutoColumns, "sort_order"> | "development" | "play" | "food_tip" | "life_tip" | "safety_tip"
      >;
      feeding_stages: TableDef<
        FeedingStageRow,
        ContentAutoColumns | "texture" | "frequency" | "summary" | "tips" | "cautions"
      >;
      foods: TableDef<
        FoodRow,
        | ContentAutoColumns
        | "emoji"
        | "recommended_from_month"
        | "description"
        | "nutrition"
        | "preparation"
        | "pairings"
        | "allergy_note"
        | "is_common_allergen"
        | "is_pantry_staple"
      >;
      recipes: TableDef<
        RecipeRow,
        | ContentAutoColumns
        | "emoji"
        | "description"
        | "servings"
        | "texture"
        | "cook_minutes"
        | "extra_ingredients"
        | "steps"
        | "allergy_note"
      >;
      recipe_ingredients: TableDef<
        RecipeIngredientRow,
        AutoColumns | "amount" | "is_optional" | "sort_order",
        [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_ingredients_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
        ]
      >;
      activities: TableDef<
        ActivityRow,
        | ContentAutoColumns
        | "emoji"
        | "categories"
        | "description"
        | "materials"
        | "duration_minutes"
        | "steps"
        | "cautions"
      >;
      vaccines: TableDef<
        VaccineRow,
        | ContentAutoColumns
        | "disease"
        | "dose_number"
        | "dose_label"
        | "min_age_days"
        | "recommended_from_months"
        | "recommended_from_days"
        | "recommended_to_months"
        | "recommended_to_days"
        | "recommended_label"
        | "description"
        | "is_national"
        | "data_reference_date"
        | "is_active"
      >;
      safety_guides: TableDef<
        SafetyGuideRow,
        ContentAutoColumns | "emoji" | "trigger_label" | "summary" | "checklist"
      >;
      content_source_relations: TableDef<
        ContentSourceRelationRow,
        AutoColumns,
        [
          {
            foreignKeyName: "content_source_relations_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "content_sources";
            referencedColumns: ["id"];
          },
        ]
      >;
      growth_standards: TableDef<GrowthStandardRow, AutoColumns | "p3" | "p15" | "p50" | "p85" | "p97" | "source_id">;
      growth_records: TableDef<
        GrowthRecordRow,
        AutoColumns | "height_cm" | "weight_kg" | "head_cm" | "memo",
        [BabyFk<"growth_records">]
      >;
      development_records: TableDef<
        DevelopmentRecordRow,
        AutoColumns | "observed_on" | "memo",
        [
          BabyFk<"development_records">,
          {
            foreignKeyName: "development_records_development_item_id_fkey";
            columns: ["development_item_id"];
            isOneToOne: false;
            referencedRelation: "development_items";
            referencedColumns: ["id"];
          },
        ]
      >;
      baby_food_records: TableDef<
        BabyFoodRecordRow,
        AutoColumns | "first_tried_on" | "preference" | "reaction_note" | "memo",
        [
          BabyFk<"baby_food_records">,
          {
            foreignKeyName: "baby_food_records_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
        ]
      >;
      vaccination_records: TableDef<
        VaccinationRecordRow,
        AutoColumns | "memo",
        [
          BabyFk<"vaccination_records">,
          {
            foreignKeyName: "vaccination_records_vaccine_id_fkey";
            columns: ["vaccine_id"];
            isOneToOne: false;
            referencedRelation: "vaccines";
            referencedColumns: ["id"];
          },
        ]
      >;
      baby_milestones: TableDef<
        BabyMilestoneRow,
        AutoColumns | "journey_stop_id" | "emoji" | "memo" | "photo_path",
        [
          BabyFk<"baby_milestones">,
          {
            foreignKeyName: "baby_milestones_journey_stop_id_fkey";
            columns: ["journey_stop_id"];
            isOneToOne: false;
            referencedRelation: "journey_stops";
            referencedColumns: ["id"];
          },
        ]
      >;
      favorites: TableDef<FavoriteRow, AutoColumns | "user_id">;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      owns_baby: { Args: { p_baby_id: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PublicTable = keyof Database["public"]["Tables"];
export type TableRow<T extends PublicTable> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends PublicTable> = Database["public"]["Tables"][T]["Insert"];
