import Link from "next/link";
import { GrowthChart } from "@/components/growth/growth-chart";
import { GrowthForm } from "@/components/growth/growth-form";
import { Card } from "@/components/ui/card";
import { Disclaimer } from "@/components/ui/notice";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { addGrowthRecord, deleteGrowthRecord } from "@/lib/actions/records";
import { formatDotDate } from "@/lib/date/date-only";
import { buildGrowthSeries } from "@/lib/growth/chart";
import { withPossessive } from "@/lib/korean";
import { getBabyContext } from "@/lib/queries/baby";
import { getGrowthRecords } from "@/lib/queries/records";
import { privateMetadata } from "@/lib/seo";
import { GROWTH_LIMITS, type GrowthMeasure } from "@/lib/validation/records";

export const metadata = privateMetadata("성장 기록");

const MEASURES: GrowthMeasure[] = ["weight_kg", "height_cm", "head_cm"];

function isMeasure(value: unknown): value is GrowthMeasure {
  return typeof value === "string" && (MEASURES as string[]).includes(value);
}

export default async function GrowthPage({ searchParams }: PageProps<"/baby/growth">) {
  const { baby, today } = await getBabyContext();
  const params = await searchParams;
  const measure: GrowthMeasure = isMeasure(params.m) ? params.m : "weight_kg";
  const records = await getGrowthRecords(baby.id);
  const series = buildGrowthSeries(records, measure, baby.birth_date);
  const limit = GROWTH_LIMITS[measure];

  return (
    <div>
      <PageHeader back={{ href: "/baby", label: "우리아기" }} eyebrow={withPossessive(baby.name)} title="성장 기록" description="날짜별로 키, 몸무게, 머리둘레를 기록하고 추이를 확인해요." />

      <nav aria-label="측정 항목" className="mb-3 grid grid-cols-3 gap-2">
        {MEASURES.map((key) => (
          <Link
            key={key}
            href={`/baby/growth?m=${key}`}
            scroll={false}
            aria-current={key === measure ? "page" : undefined}
            className={`flex min-h-11 items-center justify-center rounded-2xl border text-sm font-semibold ${key === measure ? "border-lavender-400 bg-lavender-100 text-lavender-700" : "border-line bg-white text-ink-soft"}`}
          >
            {GROWTH_LIMITS[key].label}
          </Link>
        ))}
      </nav>

      <Card>
        {series.length === 0 ? (
          <EmptyState emoji="📏" title={`아직 ${limit.label} 기록이 없어요`} description="아래에서 첫 기록을 남겨보세요." />
        ) : (
          <GrowthChart points={series} unit={limit.unit} label={limit.label} />
        )}
      </Card>
      <Disclaimer className="mt-3">
        그래프는 기록한 값의 변화만 보여줘요. 성장 백분위나 정상 여부를 판단하지 않아요. 성장이 걱정된다면 영유아 건강검진이나 소아청소년과에서 상담하세요.
      </Disclaimer>

      <SectionTitle>새 기록</SectionTitle>
      <Card>
        <GrowthForm action={addGrowthRecord.bind(null, baby.id)} today={today} birthDate={baby.birth_date} />
      </Card>

      <SectionTitle>기록 목록</SectionTitle>
      {records.length === 0 ? (
        <p className="rounded-2xl bg-white/70 px-4 py-4 text-sm text-ink-soft">아직 기록이 없어요.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <caption className="sr-only">성장 기록 표</caption>
            <thead className="bg-lavender-50 text-left text-[13px] text-ink-soft">
              <tr>
                <th scope="col" className="px-3 py-2.5 font-semibold">날짜</th>
                <th scope="col" className="px-2 py-2.5 text-right font-semibold">키</th>
                <th scope="col" className="px-2 py-2.5 text-right font-semibold">몸무게</th>
                <th scope="col" className="px-2 py-2.5 text-right font-semibold">머리</th>
                <th scope="col" className="px-2 py-2.5"><span className="sr-only">삭제</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...records].reverse().map((record) => (
                <tr key={record.id}>
                  <td className="px-3 py-2 text-ink">
                    {formatDotDate(record.measured_on)}
                    {record.memo ? <span className="block text-[12px] text-ink-faint">{record.memo}</span> : null}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">{record.height_cm ?? "-"}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{record.weight_kg ?? "-"}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{record.head_cm ?? "-"}</td>
                  <td className="px-1 py-1 text-right">
                    <form action={deleteGrowthRecord.bind(null, record.id)}>
                      <button type="submit" className="min-h-11 rounded-xl px-2 text-[13px] text-ink-faint hover:text-blush-500" aria-label={`${formatDotDate(record.measured_on)} 기록 삭제`}>
                        삭제
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
