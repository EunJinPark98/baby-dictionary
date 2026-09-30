import Link from "next/link";
import { BabySwitcher } from "@/components/baby/baby-switcher";
import { JourneyMap } from "@/components/map/journey-map";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Disclaimer } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { SourceFooter } from "@/components/ui/source-footer";
import { EmptyState } from "@/components/ui/states";
import { formatAgeLabel } from "@/lib/age/age";
import { locateOnJourney } from "@/lib/content/select";
import { withPossessive } from "@/lib/korean";
import { getBabyContext, getSignedPhotoUrl } from "@/lib/queries/baby";
import { getJourneyStops, getSourcesFor } from "@/lib/queries/content";
import { getMilestones } from "@/lib/queries/records";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("성장지도");

export default async function MapPage() {
  const { baby, babies, age } = await getBabyContext();
  const [stops, milestones, photoUrl] = await Promise.all([
    getJourneyStops(),
    getMilestones(baby.id),
    getSignedPhotoUrl(baby.photo_path),
  ]);

  const discovered = new Map<string, string>();
  for (const milestone of milestones) {
    if (milestone.journey_stop_id && !discovered.has(milestone.journey_stop_id)) {
      discovered.set(milestone.journey_stop_id, milestone.happened_on);
    }
  }
  // 출생은 항상 발견한 별
  const birthStop = stops.find((s) => s.kind === "start");
  if (birthStop && !discovered.has(birthStop.id)) discovered.set(birthStop.id, baby.birth_date);

  const position = locateOnJourney(stops, age.fractionalMonths);
  const sources = await getSourcesFor(
    "journey_stop",
    stops.map((s) => s.id),
  );
  const discoveredCount = [...discovered.keys()].filter((id) => id !== birthStop?.id).length;

  return (
    <div>
      <BabySwitcher babies={babies} selectedId={baby.id} />
      <PageHeader
        eyebrow="태어난 날부터 첫돌까지"
        title={`${withPossessive(baby.name)} 성장지도`}
        description="별을 누르면 그 시기에 대한 설명과 해줄 수 있는 것을 볼 수 있어요."
      />

      <Card tone="star" className="mb-6 flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-ink">
          ⭐ 지금까지 <strong className="text-lavender-700">{discoveredCount}개</strong>의 별을 발견했어요
        </p>
        <Link href="/baby/milestones" className={buttonClass("secondary", "sm", "shrink-0")}>
          기록하기
        </Link>
      </Card>

      {stops.length === 0 ? (
        <EmptyState emoji="🗺️" title="성장지도 콘텐츠를 준비하고 있어요" description="관리자가 성장지도 정거장을 등록하면 이곳에 나타나요." />
      ) : (
        <JourneyMap
          babyName={baby.name}
          ageLabel={age.isBeforeBirth ? "곧 만나요" : `생후 ${age.days}일 · ${formatAgeLabel(age)}`}
          position={position}
          discovered={discovered}
          photoUrl={photoUrl}
        />
      )}

      <Disclaimer className="mt-6">
        성장지도의 시기는 &lsquo;흔히 관찰되는 범위&rsquo;예요. 아기마다 순서와 시기가 다르고, 어떤 단계는 건너뛰기도 해요. 걱정되는 점이 있다면 소아청소년과 등 전문가와 상담하세요.
      </Disclaimer>
      <SourceFooter
        sources={sources}
        reviewedDates={stops.map((s) => s.reviewed_at)}
        hasSample={stops.some((s) => s.is_sample)}
      />
    </div>
  );
}
