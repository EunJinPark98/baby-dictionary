import Link from "next/link";
import { BabyHero } from "@/components/baby/baby-hero";
import { BabySwitcher } from "@/components/baby/baby-switcher";
import { TodayCard } from "@/components/today/today-card";
import { buttonClass } from "@/components/ui/button";
import { Card, LinkCard } from "@/components/ui/card";
import { Callout, Disclaimer } from "@/components/ui/notice";
import { SectionTitle } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { Star } from "@/components/ui/star";
import { formatAgeLabel } from "@/lib/age/age";
import { locateOnJourney, pickDaily, pickForMonth, pickWeeklyGuide, selectForMonth } from "@/lib/content/select";
import { withTopic } from "@/lib/korean";
import { formatMonthRange } from "@/lib/labels";
import { getBabyContext, getSignedPhotoUrl } from "@/lib/queries/baby";
import {
  getActivities,
  getDevelopmentItems,
  getFeedingStages,
  getJourneyStops,
  getSafetyGuides,
  getSourcesForMany,
  getVaccines,
  getWeeklyGuides,
} from "@/lib/queries/content";
import { getVaccinationRecords } from "@/lib/queries/records";
import { privateMetadata } from "@/lib/seo";
import { describeVaccineTiming } from "@/lib/vaccines/format";
import { buildVaccineSchedule, pickNextVaccine } from "@/lib/vaccines/schedule";

export const metadata = privateMetadata("오늘");

export default async function TodayPage({ searchParams }: PageProps<"/today">) {
  const { baby, babies, age, today } = await getBabyContext();
  const params = await searchParams;
  const month = age.months;

  const [photoUrl, developmentItems, feedingStages, activities, vaccines, safetyGuides, weeklyGuides, journeyStops, vaccinationRecords] =
    await Promise.all([
      getSignedPhotoUrl(baby.photo_path),
      getDevelopmentItems(),
      getFeedingStages(),
      getActivities(),
      getVaccines(),
      getSafetyGuides(),
      getWeeklyGuides(),
      getJourneyStops(),
      getVaccinationRecords(baby.id),
    ]);

  // 월령 → 콘텐츠 선택 (lib/content/select.ts)
  const developmentNow = selectForMonth(developmentItems, month);
  const feedingStage = pickForMonth(feedingStages, month);
  const activitiesNow = selectForMonth(activities, month);
  const todaysActivity = pickDaily(activitiesNow, today, baby.id);
  const safetyNow = selectForMonth(safetyGuides, month);
  const safety = safetyNow.at(-1) ?? null; // 가장 최근 단계의 안전 정보를 우선
  const weekly = pickWeeklyGuide(weeklyGuides, age.weeks);
  const schedule = buildVaccineSchedule(vaccines, baby.birth_date, today, vaccinationRecords);
  const nextVaccine = pickNextVaccine(schedule);
  const journey = locateOnJourney(journeyStops, age.fractionalMonths);
  const nextStop = journey.stops.find((s) => s.state === "upcoming")?.stop ?? null;
  const nowStops = journey.stops.filter((s) => s.state === "now").map((s) => s.stop);

  const shown = {
    development: developmentNow.slice(0, 3),
    feeding: feedingStage ? [feedingStage] : [],
    activity: todaysActivity ? [todaysActivity] : [],
    safety: safety ? [safety] : [],
    weekly: weekly ? [weekly.guide] : [],
    vaccine: nextVaccine ? [nextVaccine.vaccine] : [],
  };
  const sources = await getSourcesForMany([
    { type: "development_item", ids: shown.development.map((i) => i.id) },
    { type: "feeding_stage", ids: shown.feeding.map((i) => i.id) },
    { type: "activity", ids: shown.activity.map((i) => i.id) },
    { type: "safety_guide", ids: shown.safety.map((i) => i.id) },
    { type: "weekly_guide", ids: shown.weekly.map((i) => i.id) },
    { type: "vaccine", ids: shown.vaccine.map((i) => i.id) },
  ]);
  const allShown = Object.values(shown).flat();

  return (
    <div>
      <BabySwitcher babies={babies} selectedId={baby.id} />

      {params.welcome === "1" ? (
        <div className="mb-4">
          <Callout emoji="⭐" tone="lavender">
            <strong>새로운 별을 발견했어요!</strong> {withTopic(baby.name)} 오늘부터 아기별 지도와 함께 성장 여행을 떠나요.
          </Callout>
        </div>
      ) : null}

      <BabyHero name={baby.name} age={age} photoUrl={photoUrl} />

      <SectionTitle id="today-needs">오늘 우리 아기에게 필요한 것</SectionTitle>
      <ul className="grid grid-cols-2 gap-3" aria-labelledby="today-needs">
        <li>
          <TodayCard
            href="/development"
            emoji="🧠"
            label="발달"
            tone="lavender"
            title={developmentNow[0]?.title ?? "이번 달 발달 포인트"}
            description={
              developmentNow.length > 0
                ? `이 시기에 관찰될 수 있는 모습 ${developmentNow.length}가지`
                : "이번 달 발달 정보를 준비하고 있어요."
            }
          />
        </li>
        <li>
          <TodayCard
            href="/food"
            emoji="🥣"
            label="이유식"
            tone="star"
            title={feedingStage?.title ?? "이유식 가이드"}
            description={feedingStage ? feedingStage.texture || feedingStage.summary : "이유식 정보를 준비하고 있어요."}
          />
        </li>
        <li>
          <TodayCard
            href={todaysActivity ? `/play/${todaysActivity.slug}` : "/play"}
            emoji="🎈"
            label="오늘의 놀이"
            tone="blush"
            title={todaysActivity ? `${todaysActivity.emoji} ${todaysActivity.title}` : "월령별 놀이 보기"}
            description={
              todaysActivity
                ? [todaysActivity.duration_minutes ? `${todaysActivity.duration_minutes}분` : null, todaysActivity.materials]
                    .filter(Boolean)
                    .join(" · ")
                : null
            }
          />
        </li>
        <li>
          <TodayCard
            href="/baby/vaccines"
            emoji="💉"
            label="예방접종"
            tone="sky"
            highlight={nextVaccine && nextVaccine.status !== "later" ? "확인해요" : null}
            title={
              nextVaccine
                ? `${nextVaccine.vaccine.name} ${nextVaccine.vaccine.dose_label}`.trim()
                : vaccines.length > 0
                  ? "예정된 접종을 모두 기록했어요"
                  : "접종 일정 보기"
            }
            description={nextVaccine ? describeVaccineTiming(nextVaccine) : null}
          />
        </li>
        <li>
          <TodayCard
            href="/week"
            emoji="🦷"
            label="건강/생활"
            tone="mint"
            title={weekly?.guide.title ?? "이번 주 생활 팁"}
            description={weekly?.guide.life_tip ?? null}
          />
        </li>
        <li>
          <TodayCard
            href="/safety"
            emoji="⚠️"
            label="안전"
            title={safety ? (safety.trigger_label && !safety.title.includes(safety.trigger_label) ? `${safety.trigger_label} · ${safety.title}` : safety.title) : "우리 집 안전 점검"}
            description={safety?.summary ?? null}
          />
        </li>
      </ul>

      {weekly ? (
        <>
          <SectionTitle
            action={
              <Link href="/week" className="min-h-11 content-center text-sm font-semibold text-lavender-700">
                전체 보기 ›
              </Link>
            }
          >
            이번 주 우리 아기 · 생후 {age.weeks}주
          </SectionTitle>
          <LinkCard href="/week" tone="white" className="space-y-2.5">
            <p className="font-bold text-ink">{weekly.guide.title}</p>
            <WeeklyLine emoji="🧠" label="발달" text={weekly.guide.development} />
            <WeeklyLine emoji="🎈" label="놀이" text={weekly.guide.play} />
            <WeeklyLine emoji="⚠️" label="안전" text={weekly.guide.safety_tip} />
          </LinkCard>
        </>
      ) : null}

      <SectionTitle
        action={
          <Link href="/map" className="min-h-11 content-center text-sm font-semibold text-lavender-700">
            성장지도 ›
          </Link>
        }
      >
        성장 여행
      </SectionTitle>
      <Card tone="lavender" className="space-y-3">
        {nowStops.length > 0 ? (
          <p className="text-[15px] leading-relaxed text-ink">
            <Star className="mr-1 inline size-5 align-[-3px]" />
            지금은 <strong>{nowStops.map((s) => s.title).join(", ")}</strong> 시기를 지나고 있을 수 있어요.
          </p>
        ) : null}
        {nextStop ? (
          <p className="text-[15px] leading-relaxed text-ink-soft">
            다음에 만날 수도 있는 별: <strong className="text-ink">{nextStop.emoji} {nextStop.title}</strong> (흔히{" "}
            {formatMonthRange(Math.round(nextStop.typical_from_month), Math.round(nextStop.typical_to_month))} 사이, 개인차가 커요)
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Link href="/map" className={buttonClass("primary", "sm")}>
            ⭐ 성장지도 보기
          </Link>
          <Link href={`/guide/${Math.min(month, 12)}-month-development`} className={buttonClass("secondary", "sm")}>
            {Math.min(month, 12)}개월 가이드
          </Link>
          <Link href="/baby/milestones" className={buttonClass("secondary", "sm")}>
            성장 순간 기록
          </Link>
        </div>
      </Card>

      <p className="mt-6 text-center text-[13px] text-ink-faint">
        {baby.name} · {formatAgeLabel(age)} 기준으로 골랐어요
      </p>
      <Disclaimer className="mt-3" />
      <SourceFooter
        sources={sources}
        reviewedDates={allShown.map((c) => c.reviewed_at)}
        hasSample={allShown.some((c) => c.is_sample)}
      />
    </div>
  );
}

function WeeklyLine({ emoji, label, text }: { emoji: string; label: string; text: string }) {
  if (!text) return null;
  return (
    <p className="flex gap-2 text-sm leading-relaxed text-ink-soft">
      <span aria-hidden>{emoji}</span>
      <span>
        <span className="font-semibold text-ink">{label}</span> {text}
      </span>
    </p>
  );
}
