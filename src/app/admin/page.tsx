import { LinkCard } from "@/components/ui/card";
import { Callout } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { ADMIN_CONTENT } from "@/lib/admin/config";
import { adminTable } from "@/lib/admin/db";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const counts = await Promise.all(
    ADMIN_CONTENT.map(async (config) => {
      const table = adminTable(supabase, config.table);
      const [{ count: total }, sample] = await Promise.all([
        table.select("id", { count: "exact", head: true }),
        config.contentType
          ? adminTable(supabase, config.table).select("id", { count: "exact", head: true }).eq("is_sample", true)
          : Promise.resolve({ count: 0 }),
      ]);
      return { key: config.key, total: total ?? 0, sample: sample.count ?? 0 };
    }),
  );

  return (
    <div>
      <PageHeader title="콘텐츠 관리" description="코드 수정 없이 콘텐츠를 추가·수정할 수 있어요. 저장하면 서비스 화면에 바로 반영돼요." />
      <Callout emoji="🩺" tone="blush">
        의료·발달·접종 콘텐츠는 공신력 있는 출처를 연결하고, 검토 후 &lsquo;최종 검토일&rsquo;을 입력한 뒤 &lsquo;샘플&rsquo; 표시를 해제해 주세요. &ldquo;정상/비정상&rdquo;, &ldquo;반드시 X개월에&rdquo; 같은 단정적 표현은 피해주세요.
      </Callout>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {ADMIN_CONTENT.map((config) => {
          const count = counts.find((c) => c.key === config.key);
          return (
            <li key={config.key}>
              <LinkCard href={`/admin/${config.key}`} className="flex items-center justify-between gap-3">
                <span className="font-bold text-ink">
                  {config.emoji} {config.label}
                </span>
                <span className="text-right text-sm text-ink-soft">
                  {count?.total ?? 0}개
                  {count && count.sample > 0 ? <span className="block text-[12px] text-blush-500">검토 전 {count.sample}개</span> : null}
                </span>
              </LinkCard>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
