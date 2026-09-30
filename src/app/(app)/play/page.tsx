import Link from "next/link";
import { ActivityCard } from "@/components/play/activity-card";
import { Callout } from "@/components/ui/notice";
import { MonthTabs, parseMonthParam } from "@/components/ui/month-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { selectForMonth } from "@/lib/content/select";
import { withSubject } from "@/lib/korean";
import { ACTIVITY_CATEGORIES, ACTIVITY_CATEGORY_ORDER, isActivityCategory } from "@/lib/labels";
import { getOptionalBabyContext } from "@/lib/queries/baby";
import { getActivities } from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "월령별 아기 놀이",
  description: "대근육, 소근육, 인지, 언어, 감각, 사회성 — 우리 아기 월령에 맞는 집콕 놀이를 찾아보세요.",
  path: "/play",
});

export default async function PlayPage({ searchParams }: PageProps<"/play">) {
  const [params, context, activities] = await Promise.all([searchParams, getOptionalBabyContext(), getActivities()]);
  const currentMonth = context ? Math.min(context.age.months, 12) : null;
  const month = parseMonthParam(params.m, currentMonth ?? 6);
  const categoryParam = typeof params.c === "string" ? params.c : "";
  const category = isActivityCategory(categoryParam) ? categoryParam : null;

  const monthActivities = selectForMonth(activities, month);
  const filtered = category ? monthActivities.filter((a) => a.categories.includes(category)) : monthActivities;
  const query = (c: string | null) => `/play?m=${month}${c ? `&c=${c}` : ""}`;

  return (
    <div>
      <PageHeader
        eyebrow={context ? `${context.baby.name} · ${context.age.months}개월` : "월령별 놀이"}
        title={context && month === currentMonth ? `${withSubject(context.baby.name)} 좋아할 놀이` : `${month}개월 추천 놀이`}
        description="짧게, 아기 컨디션이 좋을 때 함께 해보세요."
      />
      <MonthTabs basePath="/play" selected={month} current={currentMonth} />

      <nav aria-label="놀이 영역" className="-mx-4 mb-5 overflow-x-auto px-4">
        <ul className="flex gap-2">
          <li>
            <CategoryChip href={query(null)} active={category === null} label="전체" />
          </li>
          {ACTIVITY_CATEGORY_ORDER.map((key) => (
            <li key={key}>
              <CategoryChip
                href={query(key)}
                active={category === key}
                label={`${ACTIVITY_CATEGORIES[key].emoji} ${ACTIVITY_CATEGORIES[key].label}`}
              />
            </li>
          ))}
        </ul>
      </nav>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="🎈"
          title="조건에 맞는 놀이가 아직 없어요"
          description="다른 월령이나 영역을 선택해 보세요."
          action={category ? { href: query(null), label: "전체 놀이 보기" } : undefined}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((activity) => (
            <li key={activity.id}>
              <ActivityCard activity={activity} />
            </li>
          ))}
        </ul>
      )}

      {!context ? (
        <div className="mt-6">
          <Callout emoji="✨" tone="lavender">
            아기 생년월일을 등록하면 월령에 맞는 놀이를 매일 골라드려요.{" "}
            <Link href="/signup" className="font-semibold text-gold-700 underline underline-offset-2">
              성장지도 만들기
            </Link>
          </Callout>
        </div>
      ) : null}
    </div>
  );
}

function CategoryChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold ${active ? "border-gold-400 bg-gold-100 text-gold-700" : "border-line bg-surface text-ink-soft"}`}
    >
      {label}
    </Link>
  );
}
