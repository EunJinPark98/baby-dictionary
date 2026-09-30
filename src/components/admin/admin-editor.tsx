import { AdminForm, type AdminInitialValue } from "@/components/admin/admin-form";
import { Card } from "@/components/ui/card";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete";
import { PageHeader } from "@/components/ui/page-header";
import { deleteContent, saveContent } from "@/lib/actions/admin";
import { getEditableFields, type AdminContentConfig } from "@/lib/admin/config";
import { formatIngredientLines } from "@/lib/admin/parse";
import { createClient } from "@/lib/supabase/server";

/** 새로 만들기 / 수정 공용 서버 컴포넌트 */
export async function AdminEditor({ config, row }: { config: AdminContentConfig; row: Record<string, unknown> | null }) {
  const supabase = await createClient();
  const id = row ? String(row.id) : null;

  const [sourcesResult, relationsResult, ingredientsResult] = await Promise.all([
    config.contentType ? supabase.from("content_sources").select("id, organization, title").order("organization") : null,
    config.contentType && id
      ? supabase.from("content_source_relations").select("source_id").eq("content_type", config.contentType).eq("content_id", id)
      : null,
    config.hasRecipeIngredients && id
      ? supabase.from("recipe_ingredients").select("amount, is_optional, sort_order, food:foods(slug)").eq("recipe_id", id).order("sort_order")
      : null,
  ]);

  const initial: Record<string, AdminInitialValue> = row
    ? Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v as AdminInitialValue]))
    : { is_published: true, is_sample: false, is_active: true, is_national: true, sort_order: 0, dose_number: 1, recommended_from_days: 0, recommended_to_days: 0 };

  const recipeIngredients = config.hasRecipeIngredients
    ? formatIngredientLines(
        (ingredientsResult?.data ?? []).map((i) => ({ slug: i.food?.slug ?? "", amount: i.amount, isOptional: i.is_optional })),
      )
    : null;

  return (
    <div>
      <PageHeader back={{ href: `/admin/${config.key}`, label: config.label }} title={row ? `${config.label} 수정` : `새 ${config.label}`} />
      <Card>
        <AdminForm
          action={saveContent.bind(null, config.key, id)}
          fields={getEditableFields(config)}
          initial={initial}
          sources={sourcesResult ? (sourcesResult.data ?? []).map((s) => ({ id: s.id, label: `${s.organization} · ${s.title}` })) : null}
          selectedSourceIds={(relationsResult?.data ?? []).map((r) => r.source_id)}
          recipeIngredients={recipeIngredients}
        />
      </Card>
      {id ? (
        <div className="mt-6 rounded-2xl border border-blush-100 bg-blush-50 p-4">
          <p className="text-sm text-ink-soft">삭제하면 되돌릴 수 없어요. 사용자 기록에서 참조 중인 콘텐츠는 게시 해제를 권장해요.</p>
          <ConfirmDeleteButton action={deleteContent.bind(null, config.key, id)} label="이 콘텐츠 삭제" />
        </div>
      ) : null}
    </div>
  );
}
