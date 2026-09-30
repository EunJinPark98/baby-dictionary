import Link from "next/link";
import { BabyHero } from "@/components/baby/baby-hero";
import { buttonClass } from "@/components/ui/button";
import { LinkCard } from "@/components/ui/card";
import { Callout } from "@/components/ui/notice";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { selectBaby } from "@/lib/actions/baby";
import { formatAgeLabel, getBabyAge } from "@/lib/age/age";
import { formatDotDate } from "@/lib/date/date-only";
import { getBabyContext, getSignedPhotoUrl } from "@/lib/queries/baby";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("우리아기");

const MENU = [
  { href: "/baby/growth", emoji: "📏", title: "성장 기록", description: "키·몸무게·머리둘레" },
  { href: "/baby/vaccines", emoji: "💉", title: "예방접종", description: "접종 일정과 완료 기록" },
  { href: "/baby/milestones", emoji: "✨", title: "첫해 성장 순간", description: "첫 뒤집기, 첫니, 첫걸음…" },
  { href: "/development", emoji: "🧠", title: "발달 기록", description: "하고 있어요 · 아직이에요" },
  { href: "/food/tried", emoji: "🥕", title: "먹어본 재료", description: "처음 먹은 날과 반응" },
  { href: "/baby/favorites", emoji: "★", title: "저장한 콘텐츠", description: "놀이·레시피·재료" },
] as const;

export default async function BabyPage({ searchParams }: PageProps<"/baby">) {
  const { baby, babies, age, today, user } = await getBabyContext();
  const [photoUrl, params] = await Promise.all([getSignedPhotoUrl(baby.photo_path), searchParams]);

  return (
    <div>
      <PageHeader
        title="우리아기"
        action={
          <Link href="/baby/edit" className={buttonClass("secondary", "sm")}>
            정보 수정
          </Link>
        }
      />
      {params.saved === "1" ? (
        <div className="mb-4">
          <Callout emoji="✅" tone="lavender">
            아기 정보를 저장했어요.
          </Callout>
        </div>
      ) : null}
      <BabyHero name={baby.name} age={age} photoUrl={photoUrl} />
      <p className="mt-2 text-center text-[13px] text-ink-faint">생년월일 {formatDotDate(baby.birth_date)}</p>

      <ul className="mt-5 grid grid-cols-2 gap-3">
        {MENU.map((item) => (
          <li key={item.href}>
            <LinkCard href={item.href} className="h-full p-4">
              <span aria-hidden className="text-2xl">
                {item.emoji}
              </span>
              <span className="mt-1 block font-bold text-ink">{item.title}</span>
              <span className="text-[13px] text-ink-soft">{item.description}</span>
            </LinkCard>
          </li>
        ))}
      </ul>

      <SectionTitle>우리 집 작은 별들</SectionTitle>
      <ul className="space-y-2">
        {babies.map((b) => {
          const bAge = getBabyAge(b.birth_date, today);
          const selected = b.id === baby.id;
          return (
            <li key={b.id}>
              <form action={selectBaby.bind(null, b.id)}>
                <button
                  type="submit"
                  disabled={selected}
                  className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 text-left ${selected ? "border-gold-300 bg-gold-50" : "border-line bg-surface"}`}
                >
                  <span className="font-semibold text-ink">✦ {b.name}</span>
                  <span className="text-sm text-ink-soft">{selected ? "보고 있어요" : formatAgeLabel(bAge)}</span>
                </button>
              </form>
            </li>
          );
        })}
      </ul>
      <Link href="/onboarding?add=1" className={buttonClass("secondary", "md", "mt-3 w-full")}>
        + 아기 추가하기
      </Link>

      <SectionTitle>계정</SectionTitle>
      <Link href="/settings" className="card-night flex min-h-14 items-center justify-between rounded-[var(--radius-card)] border px-4 py-3 shadow-[var(--shadow-soft)]">
        <span>
          <span className="block font-semibold text-ink">⚙ 설정</span>
          <span className="block text-[13px] text-ink-faint">{user.email} · 화면 테마 · 비밀번호 · 로그아웃 · 탈퇴</span>
        </span>
        <span aria-hidden className="text-ink-faint">
          ›
        </span>
      </Link>
    </div>
  );
}
