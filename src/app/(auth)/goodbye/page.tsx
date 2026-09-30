import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Star, StarRule } from "@/components/ui/star";

export const metadata: Metadata = {
  title: "탈퇴 완료",
  robots: { index: false, follow: false },
};

export default function GoodbyePage() {
  return (
    <div className="pt-10 text-center">
      <Star className="mx-auto size-14 animate-float" glow />
      <h1 className="text-gold-gradient mt-5 text-[28px] font-bold">탈퇴가 완료되었어요</h1>
      <StarRule className="my-5" />
      <p className="leading-relaxed text-ink-soft">
        계정과 모든 기록을 삭제했어요.
        <br />
        그동안 아기별 지도와 함께해 주셔서 고마워요.
      </p>
      <Link href="/" className={buttonClass("secondary", "lg", "mt-8")}>
        처음으로
      </Link>
    </div>
  );
}
