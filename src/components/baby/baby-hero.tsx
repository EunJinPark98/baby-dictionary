import { Star } from "@/components/ui/star";
import {
  formatAgeLabel,
  formatFirstBirthdayCountdown,
  formatJourneyLabel,
  formatWeekLabel,
  type BabyAge,
} from "@/lib/age/age";
import { withTopic } from "@/lib/korean";

interface BabyHeroProps {
  name: string;
  age: BabyAge;
  photoUrl?: string | null;
}

/**
 * 아기 요약 카드: 이름 / 생후 N일 / N개월 N일 / ⭐ N개월 성장 여행 중 / 첫돌 카운트다운
 */
export function BabyHero({ name, age, photoUrl }: BabyHeroProps) {
  return (
    <section
      aria-label={`${name} 성장 요약`}
      className="relative overflow-hidden rounded-[2rem] border border-lavender-100 bg-gradient-to-br from-lavender-100 via-lavender-50 to-star-50 p-5 shadow-[var(--shadow-soft)]"
    >
      <Star className="absolute -right-3 -top-3 size-24 opacity-30" />
      <Star className="absolute bottom-3 right-16 size-5 opacity-60" />
      <div className="relative flex items-center gap-4">
        <div className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-4xl shadow-sm">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- 짧은 만료의 비공개 signed URL
            <img src={photoUrl} alt={`${name} 프로필 사진`} className="size-full object-cover" />
          ) : (
            <span aria-hidden>👶</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-extrabold text-ink">{name}</p>
          {age.isBeforeBirth ? (
            <p className="mt-0.5 text-ink-soft">곧 만나요!</p>
          ) : (
            <>
              <p className="mt-0.5 text-3xl font-extrabold tracking-tight text-lavender-700">생후 {age.days}일</p>
              <p className="text-[15px] font-semibold text-ink-soft">
                {formatAgeLabel(age)} · {formatWeekLabel(age)}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-ink shadow-sm">
          <Star className="size-4" /> {journeySentence(name, age)}
        </span>
        <span className="rounded-full bg-star-100 px-3.5 py-2 text-sm font-semibold text-star-700">
          {formatFirstBirthdayCountdown(age)}
        </span>
      </div>
    </section>
  );
}

function journeySentence(name: string, age: BabyAge): string {
  if (age.isBeforeBirth) return `${withTopic(name)} 곧 만날 작은 별이에요`;
  if (age.isFirstBirthday) return `오늘은 ${name}의 첫돌이에요!`;
  if (age.hasFirstBirthdayPassed) return `${withTopic(name)} 첫 번째 성장 여행을 완주했어요`;
  return `${withTopic(name)} 지금 ${formatJourneyLabel(age)}`;
}
