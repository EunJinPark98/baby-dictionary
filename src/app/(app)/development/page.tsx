import Link from "next/link";
import { DevelopmentItemCard } from "@/components/development/development-item-card";
import { DevelopmentStatusButtons } from "@/components/development/status-buttons";
import { MonthTabs, parseMonthParam } from "@/components/ui/month-tabs";
import { Disclaimer } from "@/components/ui/notice";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { EmptyState } from "@/components/ui/states";
import { formatAgeLabel } from "@/lib/age/age";
import { selectForMonth, selectUpcoming } from "@/lib/content/select";
import { DEVELOPMENT_DOMAINS, DEVELOPMENT_DOMAIN_ORDER } from "@/lib/labels";
import { getBabyContext } from "@/lib/queries/baby";
import { getDevelopmentItems, getSourcesFor } from "@/lib/queries/content";
import { getDevelopmentRecords } from "@/lib/queries/records";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("발달 기록");

export default async function DevelopmentPage({ searchParams }: PageProps<"/development">) {
  const { baby, age } = await getBabyContext();
  const params = await searchParams;
  const currentMonth = Math.min(age.months, 12);
  const month = parseMonthParam(params.m, currentMonth);

  const [items, records] = await Promise.all([getDevelopmentItems(), getDevelopmentRecords(baby.id)]);
  const statusByItem = new Map(records.map((r) => [r.development_item_id, r.status]));
  const monthItems = selectForMonth(items, month);
  const upcoming = selectUpcoming(items, month);
  const sources = await getSourcesFor(
    "development_item",
    monthItems.map((i) => i.id),
  );

  return (
    <div>
      <PageHeader
        back={{ href: "/today", label: "오늘" }}
        eyebrow={`${baby.name} · ${formatAgeLabel(age)}`}
        title="발달 관찰 기록"
        description="이 시기에 관찰될 수 있는 모습이에요. 우리 아기의 모습을 편하게 기록해 보세요."
      />
      <Disclaimer className="mb-5" />
      <MonthTabs basePath="/development" selected={month} current={age.isBeforeBirth ? null : currentMonth} />

      {monthItems.length === 0 ? (
        <EmptyState emoji="🌙" title={`${month}개월 발달 정보를 준비하고 있어요`} description="다른 월령을 선택해 보세요." />
      ) : (
        DEVELOPMENT_DOMAIN_ORDER.map((domain) => {
          const domainItems = monthItems.filter((item) => item.domain === domain);
          if (domainItems.length === 0) return null;
          return (
            <section key={domain} aria-labelledby={`domain-${domain}`}>
              <SectionTitle id={`domain-${domain}`}>
                <span aria-hidden>{DEVELOPMENT_DOMAINS[domain].emoji}</span> {DEVELOPMENT_DOMAINS[domain].label}
              </SectionTitle>
              <ul className="space-y-3">
                {domainItems.map((item) => (
                  <li key={item.id}>
                    <DevelopmentItemCard item={item}>
                      <DevelopmentStatusButtons
                        babyId={baby.id}
                        itemId={item.id}
                        itemTitle={item.title}
                        status={statusByItem.get(item.id) ?? null}
                      />
                    </DevelopmentItemCard>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {upcoming.length > 0 ? (
        <>
          <SectionTitle>곧 관찰될 수도 있는 모습</SectionTitle>
          <ul className="space-y-2">
            {upcoming.map((item) => (
              <li key={item.id} className="flex items-center gap-2 rounded-2xl bg-surface/70 px-4 py-3 text-sm text-ink-soft">
                <span aria-hidden>{DEVELOPMENT_DOMAINS[item.domain].emoji}</span>
                <span className="font-medium text-ink">{item.title}</span>
                <span className="ml-auto shrink-0 text-xs">{item.min_month}개월~</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="mt-6 text-center text-sm">
        <Link href={`/guide/${month}-month-development`} className="inline-flex min-h-11 items-center font-semibold text-gold-700">
          {month}개월 성장 가이드 전체 보기 ›
        </Link>
      </p>
      <SourceFooter
        sources={sources}
        reviewedDates={monthItems.map((i) => i.reviewed_at)}
        hasSample={monthItems.some((i) => i.is_sample)}
      />
    </div>
  );
}
