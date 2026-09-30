import { MilestoneForm } from "@/components/milestones/milestone-form";
import { Card } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { addMilestone, deleteMilestone } from "@/lib/actions/records";
import { getBabyAge, formatAgeLabel } from "@/lib/age/age";
import { formatDotDate } from "@/lib/date/date-only";
import { withPossessive } from "@/lib/korean";
import { getBabyContext, getSignedPhotoUrls } from "@/lib/queries/baby";
import { getJourneyStops } from "@/lib/queries/content";
import { getMilestones } from "@/lib/queries/records";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("첫해 성장 순간");

export default async function MilestonesPage({ searchParams }: PageProps<"/baby/milestones">) {
  const { baby, user, today } = await getBabyContext();
  const params = await searchParams;
  const [stops, milestones] = await Promise.all([getJourneyStops(), getMilestones(baby.id)]);
  const photoUrls = await getSignedPhotoUrls(milestones.map((m) => m.photo_path).filter((p): p is string => Boolean(p)));
  const recordableStops = stops.filter((s) => s.kind !== "start");
  const defaultStop = typeof params.stop === "string" ? recordableStops.find((s) => s.slug === params.stop) : undefined;

  return (
    <div>
      <PageHeader
        back={{ href: "/baby", label: "우리아기" }}
        eyebrow={withPossessive(baby.name)}
        title="첫해 성장 순간"
        description="처음 해낸 순간을 기록하면 성장지도에 별이 떠요."
      />

      <Card>
        <MilestoneForm
          action={addMilestone.bind(null, baby.id)}
          stops={recordableStops.map((s) => ({ id: s.id, title: s.title, emoji: s.emoji }))}
          defaultStopId={defaultStop?.id ?? null}
          userId={user.id}
          today={today}
          birthDate={baby.birth_date}
        />
      </Card>

      <SectionTitle>{withPossessive(baby.name)} 첫 번째 성장지도</SectionTitle>
      {milestones.length === 0 ? (
        <EmptyState emoji="🌟" title="아직 기록한 별이 없어요" description="첫 미소, 첫 뒤집기처럼 작은 순간도 소중한 별이에요." />
      ) : (
        <ol className="relative space-y-3 border-l-[3px] border-dotted border-star-200 pl-5">
          {milestones.map((milestone) => {
            const photoUrl = milestone.photo_path ? photoUrls.get(milestone.photo_path) : undefined;
            const ageAt = getBabyAge(baby.birth_date, milestone.happened_on);
            return (
              <li key={milestone.id} className="relative">
                <span aria-hidden className="absolute -left-[1.95rem] top-4 flex size-7 items-center justify-center rounded-full bg-star-100 text-sm">
                  {milestone.emoji}
                </span>
                <article className="rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-ink">
                        {milestone.emoji} {milestone.title}
                      </h3>
                      <p className="text-[13px] text-ink-soft">
                        {formatDotDate(milestone.happened_on)} · 생후 {ageAt.days}일 ({formatAgeLabel(ageAt)})
                      </p>
                    </div>
                    <form action={deleteMilestone.bind(null, milestone.id)}>
                      <button type="submit" className="min-h-11 rounded-xl px-2 text-[13px] text-ink-faint hover:text-blush-500" aria-label={`${milestone.title} 기록 삭제`}>
                        삭제
                      </button>
                    </form>
                  </div>
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- 짧은 만료의 비공개 signed URL
                    <img src={photoUrl} alt={`${milestone.title} 사진`} className="mt-3 max-h-72 w-full rounded-2xl object-cover" loading="lazy" />
                  ) : null}
                  {milestone.memo ? <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{milestone.memo}</p> : null}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
