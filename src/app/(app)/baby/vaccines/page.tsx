import { SampleBadge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/notice";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { EmptyState } from "@/components/ui/states";
import { VaccineRecordForm } from "@/components/vaccines/vaccine-record-form";
import { deleteVaccination, markPastVaccinesDone, saveVaccination } from "@/lib/actions/records";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete";
import { formatDotDate, type IsoDate } from "@/lib/date/date-only";
import { withPossessive } from "@/lib/korean";
import { getBabyContext } from "@/lib/queries/baby";
import { getSourcesFor, getVaccines } from "@/lib/queries/content";
import { getVaccinationRecords } from "@/lib/queries/records";
import { privateMetadata } from "@/lib/seo";
import type { VaccineRow } from "@/lib/supabase/database.types";
import { VACCINE_STATUS_LABELS, describeVaccineTiming } from "@/lib/vaccines/format";
import { buildVaccineSchedule, groupVaccineSchedule, type ScheduledVaccine } from "@/lib/vaccines/schedule";

export const metadata = privateMetadata("예방접종");

const statusTone = {
  check: "bg-blush-100 text-blush-500",
  due: "bg-gold-100 text-gold-700",
  soon: "bg-star-100 text-star-700",
  later: "bg-line text-ink-soft",
  done: "bg-mint-100 text-mint-700",
} as const;

export default async function VaccinesPage({ searchParams }: PageProps<"/baby/vaccines">) {
  const { baby, today } = await getBabyContext();
  const params = await searchParams;
  const [vaccines, records] = await Promise.all([getVaccines(), getVaccinationRecords(baby.id)]);
  const schedule = buildVaccineSchedule(vaccines, baby.birth_date, today, records);
  const grouped = groupVaccineSchedule(schedule);
  const memoByVaccine = new Map(records.map((r) => [r.vaccine_id, r.memo ?? ""]));
  const sources = await getSourcesFor(
    "vaccine",
    vaccines.map((v) => v.id),
  );
  const referenceDates = [...new Set(vaccines.map((v) => v.data_reference_date))];
  const hasSample = vaccines.some((v) => v.is_sample);
  const savedVaccine = typeof params.saved === "string" ? vaccines.find((v) => v.id === params.saved) : undefined;
  const checkCount = grouped.toCheck.filter((s) => s.status === "check").length;

  const renderItem = (item: ScheduledVaccine<VaccineRow>) => (
    <VaccineItem
      key={item.vaccine.id}
      item={item}
      babyId={baby.id}
      birthDate={baby.birth_date}
      today={today}
      memo={memoByVaccine.get(item.vaccine.id) ?? ""}
    />
  );

  return (
    <div>
      <PageHeader back={{ href: "/baby", label: "우리아기" }} eyebrow={withPossessive(baby.name)} title="예방접종" description="생년월일로 계산한 권장 시기예요. 접종 후 날짜를 기록해 두세요." />

      {savedVaccine ? (
        <div className="mb-3" role="status">
          <Callout emoji="✅" tone="lavender">
            {savedVaccine.name} {savedVaccine.dose_label} 접종을 기록했어요.
          </Callout>
        </div>
      ) : null}
      <Callout emoji="📌" tone={hasSample ? "blush" : "lavender"}>
        <p className="font-semibold">공식 접종 일정은 변경될 수 있어요.</p>
        <p className="mt-0.5">
          자료 기준일:{" "}
          {referenceDates.map((d) => (d ? formatDotDate(d) : "미확인")).join(", ") || "미확인"}
          {hasSample ? " · 현재 일정은 검증 전 샘플 데이터예요." : ""} 실제 접종은 반드시{" "}
          <a href="https://nip.kdca.go.kr" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
            질병관리청 예방접종도우미
          </a>
          와 의료기관 안내를 확인하세요.
        </p>
      </Callout>

      {vaccines.length === 0 ? (
        <div className="mt-6">
          <EmptyState emoji="💉" title="예방접종 일정이 아직 등록되지 않았어요" description="관리자가 공식 일정을 등록하면 이곳에 나타나요." />
        </div>
      ) : (
        <>
          <SectionTitle>확인할 접종</SectionTitle>
          {grouped.toCheck.length === 0 ? (
            <p className="rounded-2xl bg-surface/70 px-4 py-4 text-sm text-ink-soft">지금 확인할 접종이 없어요. 👍</p>
          ) : (
            <>
              {checkCount >= 2 ? (
                <div className="mb-3 rounded-2xl border border-gold-100 bg-gold-50 p-4 text-sm text-ink-soft">
                  <p>
                    권장 시기가 지난 접종이 <strong className="text-ink">{checkCount}개</strong> 있어요. 이미 맞았다면 한 번에 기록할 수 있어요. (접종일은 권장 시작일로
                    기록되며, 나중에 실제 날짜로 고칠 수 있어요.)
                  </p>
                  <BulkButton action={markPastVaccinesDone.bind(null, baby.id)} count={checkCount} />
                </div>
              ) : null}
              <ul className="space-y-2">{grouped.toCheck.map(renderItem)}</ul>
            </>
          )}

          <SectionTitle>완료 ✓</SectionTitle>
          {grouped.done.length === 0 ? (
            <p className="rounded-2xl bg-surface/70 px-4 py-4 text-sm text-ink-soft">아직 기록한 접종이 없어요.</p>
          ) : (
            <ul className="space-y-2">{grouped.done.map(renderItem)}</ul>
          )}

          {grouped.later.length > 0 ? (
            <>
              <SectionTitle>앞으로 예정</SectionTitle>
              <ul className="space-y-2">{grouped.later.map(renderItem)}</ul>
            </>
          ) : null}
        </>
      )}

      <SourceFooter sources={sources} reviewedDates={vaccines.map((v) => v.reviewed_at)} hasSample={hasSample} />
    </div>
  );
}

function VaccineItem({
  item,
  babyId,
  birthDate,
  today,
  memo,
}: {
  item: ScheduledVaccine<VaccineRow>;
  babyId: string;
  birthDate: IsoDate;
  today: IsoDate;
  memo: string;
}) {
  const { vaccine, status } = item;
  return (
    <li>
      <details className="group rounded-2xl border border-line bg-surface shadow-[var(--shadow-soft)]">
        <summary className="flex min-h-16 items-center gap-3 px-4 py-3">
          <span aria-hidden className="text-xl">
            {status === "done" ? "✅" : "💉"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold text-ink">
                {vaccine.name} {vaccine.dose_label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone[status]}`}>{VACCINE_STATUS_LABELS[status]}</span>
            </span>
            <span className="mt-0.5 block text-[13px] text-ink-soft">
              {vaccine.disease} · {describeVaccineTiming(item)}
            </span>
          </span>
          <span aria-hidden className="text-ink-faint transition-transform group-open:rotate-90">
            ›
          </span>
        </summary>
        <div className="space-y-3 border-t border-line px-4 py-4 text-sm text-ink-soft">
          <dl className="grid grid-cols-2 gap-2">
            <div>
              <dt className="text-[12px] text-ink-faint">권장 시기</dt>
              <dd className="font-semibold text-ink">{vaccine.recommended_label || "-"}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-ink-faint">예상 날짜</dt>
              <dd className="font-semibold text-ink">
                {formatDotDate(item.recommendedFrom)}
                {item.recommendedTo !== item.recommendedFrom ? ` ~ ${formatDotDate(item.recommendedTo)}` : ""}
              </dd>
            </div>
            {item.minimumDate ? (
              <div className="col-span-2">
                <dt className="text-[12px] text-ink-faint">최소 접종 가능 시기(참고)</dt>
                <dd className="font-semibold text-ink">{formatDotDate(item.minimumDate)} 이후</dd>
              </div>
            ) : null}
          </dl>
          {vaccine.description ? <p className="leading-relaxed">{vaccine.description}</p> : null}
          <SampleBadge show={vaccine.is_sample} />
          <VaccineRecordForm
            action={saveVaccination.bind(null, babyId, vaccine.id)}
            id={vaccine.id}
            defaultDate={item.vaccinatedOn ?? today}
            defaultMemo={memo}
            min={birthDate}
            max={today}
          />
          {status === "done" ? (
            <form action={deleteVaccination.bind(null, babyId, vaccine.id)}>
              <button type="submit" className="min-h-11 text-[13px] font-medium text-ink-faint underline underline-offset-2">
                접종 기록 삭제
              </button>
            </form>
          ) : null}
        </div>
      </details>
    </li>
  );
}

function BulkButton({ action, count }: { action: () => Promise<void>; count: number }) {
  return <ConfirmDeleteButton action={action} label={`지난 접종 ${count}개 모두 완료로 기록`} confirmLabel="네, 모두 맞았어요" size="sm" variant="primary" pendingText="기록 중…" />;
}
