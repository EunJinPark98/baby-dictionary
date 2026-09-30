"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getAdminConfig, getEditableFields } from "@/lib/admin/config";
import { adminTable } from "@/lib/admin/db";
import { parseAdminForm, parseIngredientLines } from "@/lib/admin/parse";
import { getIsAdmin, requireUser } from "@/lib/queries/baby";
import { createClient } from "@/lib/supabase/server";
import { actionError, type ActionState } from "./types";

async function requireAdmin() {
  await requireUser();
  if (!(await getIsAdmin())) notFound();
  return createClient();
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 콘텐츠 저장 (생성/수정) + 출처 연결 + 레시피 재료 */
export async function saveContent(key: string, id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const config = getAdminConfig(key);
  if (!config) return actionError("알 수 없는 콘텐츠 종류예요.");
  const supabase = await requireAdmin();

  const parsed = parseAdminForm(
    getEditableFields(config),
    (name) => {
      const v = formData.get(name);
      return typeof v === "string" ? v : null;
    },
    (name) => formData.getAll(name).filter((v): v is string => typeof v === "string"),
  );
  if (!parsed.ok) return actionError("입력한 내용을 확인해 주세요.", parsed.errors);

  const ingredients = config.hasRecipeIngredients ? parseIngredientLines(String(formData.get("recipe_ingredients") ?? "")) : null;
  if (ingredients && !ingredients.ok) return actionError(ingredients.error, { recipe_ingredients: ingredients.error });

  const table = adminTable(supabase, config.table);
  const { data, error } = id
    ? await table.update(parsed.values).eq("id", id).select("id").single()
    : await table.insert(parsed.values).select("id").single();
  if (error || !data) {
    const duplicate = error?.code === "23505";
    return actionError(duplicate ? "같은 slug(또는 주차)가 이미 있어요." : `저장하지 못했어요. (${error?.message ?? "unknown"})`);
  }
  const savedId = String((data as { id: string }).id);

  // 출처 연결: 선택 목록으로 교체
  if (config.contentType) {
    const sourceIds = formData
      .getAll("source_ids")
      .filter((v): v is string => typeof v === "string" && UUID_RE.test(v));
    await supabase.from("content_source_relations").delete().eq("content_type", config.contentType).eq("content_id", savedId);
    if (sourceIds.length > 0) {
      const { error: relError } = await supabase
        .from("content_source_relations")
        .insert(sourceIds.map((source_id) => ({ source_id, content_type: config.contentType!, content_id: savedId })));
      if (relError) return actionError("콘텐츠는 저장했지만 출처 연결에 실패했어요.");
    }
  }

  // 레시피 재료: slug → food id 로 변환 후 교체
  if (ingredients && ingredients.ok) {
    const slugs = ingredients.lines.map((l) => l.slug);
    const { data: foods } = slugs.length
      ? await supabase.from("foods").select("id, slug").in("slug", slugs)
      : { data: [] as { id: string; slug: string }[] };
    const idBySlug = new Map((foods ?? []).map((f) => [f.slug, f.id]));
    const missing = slugs.filter((s) => !idBySlug.has(s));
    if (missing.length > 0) {
      return actionError(`레시피는 저장했지만 재료를 찾을 수 없어요: ${missing.join(", ")}`, { recipe_ingredients: "재료 slug 를 확인해 주세요." });
    }
    await supabase.from("recipe_ingredients").delete().eq("recipe_id", savedId);
    if (ingredients.lines.length > 0) {
      const { error: ingError } = await supabase.from("recipe_ingredients").insert(
        ingredients.lines.map((line, index) => ({
          recipe_id: savedId,
          food_id: idBySlug.get(line.slug)!,
          amount: line.amount,
          is_optional: line.isOptional,
          sort_order: index + 1,
        })),
      );
      if (ingError) return actionError("레시피는 저장했지만 재료 저장에 실패했어요.");
    }
  }

  revalidatePath("/", "layout");
  redirect(`/admin/${config.key}?saved=1`);
}

export async function deleteContent(key: string, id: string): Promise<void> {
  const config = getAdminConfig(key);
  if (!config) notFound();
  const supabase = await requireAdmin();
  const { error } = await adminTable(supabase, config.table).delete().eq("id", id);
  if (!error && config.contentType) {
    await supabase.from("content_source_relations").delete().eq("content_type", config.contentType).eq("content_id", id);
  }
  revalidatePath("/", "layout");
  redirect(`/admin/${config.key}${error ? "?error=delete" : "?deleted=1"}`);
}
