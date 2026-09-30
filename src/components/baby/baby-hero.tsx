import { Star, StarRule } from "@/components/ui/star";
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
 * 밤하늘 위에 떠 있는 작은 별(아기) 느낌으로, 금빛 잔광과 떠다니는 사진을 사용한다.
 */
export function BabyHero({ name, age, photoUrl }: BabyHeroProps) {
  return (
    <section
      aria-label={`${name} 성장 요약`}
      className="card-night relative overflow-hidden rounded-[1.75rem] border px-5 pb-6 pt-7 text-center shadow-[var(--shadow-soft)]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />
      <Star className="absolute left-6 top-6 size-3 opacity-70 animate-twinkle" />
      <Star className="absolute right-8 top-12 size-2.5 opacity-60 animate-twinkle [animation-delay:1.2s]" />
      <Star className="absolute bottom-10 right-5 size-3 opacity-50 animate-twinkle [animation-delay:.6s]" />

      <div className="relative mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-5xl shadow-[0_0_0_1px_rgb(245_197_66/0.3),0_0_48px_rgb(245_197_66/0.28)] animate-float">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 짧은 만료의 비공개 signed URL
          <img src={photoUrl} alt="" className="size-full object-cover" />
        ) : (
          <span aria-hidden>👶</span>
        )}
      </div>

      <p className="relative mt-4 font-brand text-[22px] font-bold tracking-[0.04em] text-ink">{name}</p>

      {age.isBeforeBirth ? (
        <p className="relative mt-1 text-ink-soft">곧 만나요!</p>
      ) : (
        <>
          <p className="text-gold-gradient relative mt-1 font-brand text-[44px] font-bold leading-tight drop-shadow-[0_0_24px_rgb(245_197_66/0.25)]">
            생후 {age.days}일
          </p>
          <p className="relative mt-1 text-[15px] font-semibold text-ink-soft">
            {formatAgeLabel(age)} <span className="text-gold-300">·</span> {formatWeekLabel(age)}
          </p>
        </>
      )}

      <StarRule className="relative my-5" />

      <div className="relative flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm font-bold text-gold-700">
          <Star className="size-4" /> {journeySentence(name, age)}
        </span>
        <span className="rounded-full border border-line bg-surface-2/80 px-4 py-2 text-sm font-semibold text-ink-soft">
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
