import { LinkCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { guideMonths, guideSlug } from "@/lib/guide";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "월령별 성장 가이드",
  description: "0개월부터 12개월까지, 월령별로 관찰될 수 있는 발달과 추천 놀이, 이유식, 안전 정보를 한눈에.",
  path: "/guide",
});

export default function GuideIndexPage() {
  return (
    <div>
      <PageHeader
        eyebrow="이번 달 가이드"
        title="월령별 성장 가이드"
        description="태어난 날부터 첫돌까지, 달마다 살펴볼 것을 모았어요."
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {guideMonths().map((month) => (
          <li key={month}>
            <LinkCard href={`/guide/${guideSlug(month)}`} tone={month === 12 ? "star" : "white"} className="text-center">
              <span className="block text-2xl text-gold-500" aria-hidden>
                {month === 0 ? "🌱" : month === 12 ? "🎂" : "✦"}
              </span>
              <span className="mt-1 block text-lg font-extrabold text-ink">{month}개월</span>
              <span className="text-[13px] text-ink-soft">{month === 0 ? "신생아" : month === 12 ? "첫돌" : "성장 가이드"}</span>
            </LinkCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
