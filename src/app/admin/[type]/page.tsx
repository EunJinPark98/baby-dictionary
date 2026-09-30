import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Callout } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { getAdminConfig } from "@/lib/admin/config";
import { adminTable } from "@/lib/admin/db";
import { createClient } from "@/lib/supabase/server";

export default async function AdminListPage({ params, searchParams }: PageProps<"/admin/[type]">) {
  const [{ type }, query] = await Promise.all([params, searchParams]);
  const config = getAdminConfig(type);
  if (!config) notFound();

  const supabase = await createClient();
  const { data, error } = await adminTable(supabase, config.table).select("*").order(config.orderBy).limit(500);
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div>
      <PageHeader
        back={{ href: "/admin", label: "콘텐츠 관리" }}
        icon={config.emoji}
        title={config.label}
        action={
          <Link href={`/admin/${config.key}/new`} className={buttonClass("primary", "sm")}>
            + 새로 만들기
          </Link>
        }
      />
      {query.saved === "1" ? <Callout emoji="✅" tone="lavender">저장했어요.</Callout> : null}
      {query.deleted === "1" ? <Callout emoji="🗑️" tone="lavender">삭제했어요.</Callout> : null}
      {query.error === "delete" ? (
        <Callout emoji="⚠️" tone="blush">
          삭제하지 못했어요. 다른 데이터에서 참조 중일 수 있어요 (예: 레시피에 쓰인 재료).
        </Callout>
      ) : null}
      {error ? (
        <Callout emoji="⚠️" tone="blush">
          목록을 불러오지 못했어요.
        </Callout>
      ) : rows.length === 0 ? (
        <EmptyState title="아직 콘텐츠가 없어요" action={{ href: `/admin/${config.key}/new`, label: "첫 콘텐츠 만들기" }} />
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {rows.map((row) => (
            <li key={String(row.id)}>
              <Link href={`/admin/${config.key}/${String(row.id)}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2.5 hover:bg-gold-50">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">
                    {typeof row.emoji === "string" ? `${row.emoji} ` : ""}
                    {String(row[config.titleField] ?? "")}
                  </span>
                  <span className="block text-[13px] text-ink-faint">{config.subtitle(row)}</span>
                </span>
                <span className="flex shrink-0 gap-1">
                  {row.is_published === false ? <Badge tone="gray">비공개</Badge> : null}
                  {row.is_sample === true ? <Badge tone="blush">샘플</Badge> : null}
                  {row.is_active === false ? <Badge tone="gray">비활성</Badge> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
