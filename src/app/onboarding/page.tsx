import Link from "next/link";
import { redirect } from "next/navigation";
import { BabyForm } from "@/components/baby/baby-form";
import { Logo } from "@/components/layout/logo";
import { Card } from "@/components/ui/card";
import { Star } from "@/components/ui/star";
import { createBaby } from "@/lib/actions/baby";
import { todayIsoDate } from "@/lib/date/date-only";
import { getBabies, requireUser } from "@/lib/queries/baby";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("아기 등록");

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const user = await requireUser();
  const babies = await getBabies();
  const params = await searchParams;
  const isAdding = params.add === "1";
  if (babies.length > 0 && !isAdding) redirect("/today");

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <Logo href={babies.length > 0 ? "/today" : "/"} />
        {isAdding ? (
          <Link href="/baby" className="min-h-11 content-center px-2 text-sm font-medium text-ink-soft">
            취소
          </Link>
        ) : null}
      </header>
      <main className="mx-auto max-w-md px-4 pb-16 pt-2">
        <div className="flex items-center gap-2">
          <Star className="size-8 animate-twinkle" glow />
          <p className="text-[13px] font-bold tracking-[0.08em] text-gold-400">{isAdding ? "새로운 작은 별" : "첫 번째 단계"}</p>
        </div>
        <h1 className="text-gold-gradient mt-2 text-[28px] font-bold leading-snug">
          우리 아기를 소개해 주세요
        </h1>
        <p className="mt-1.5 text-ink-soft">생년월일만 알면 오늘 필요한 발달·이유식·놀이·접종 정보를 자동으로 보여드려요.</p>
        <Card className="mt-6">
          <BabyForm action={createBaby} userId={user.id} today={todayIsoDate()} submitLabel="✦ 성장지도 시작하기" />
        </Card>
        <p className="mt-4 text-center text-[13px] text-ink-faint">꼭 필요한 정보만 저장하며, 기록은 나만 볼 수 있어요.</p>
      </main>
    </div>
  );
}
