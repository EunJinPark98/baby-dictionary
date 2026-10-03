import Link from "next/link";
import { BrandFooter, Logo } from "@/components/layout/logo";
import { NavIcon, type NavIconName } from "@/components/layout/nav-icons";
import { buttonClass } from "@/components/ui/button";
import { Star, StarRule } from "@/components/ui/star";
import { getSiteUrl } from "@/lib/env";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const metadata = {
  title: { absolute: `${SITE_NAME} — 태어난 날부터 첫돌까지 우리 아기 성장 가이드` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: SITE_NAME, description: SITE_TAGLINE, url: "/" },
};

const FEATURES: ReadonlyArray<{ icon: NavIconName | "star" | "vaccine"; title: string; description: string; tags: string[] }> = [
  { icon: "today", title: "오늘의 맞춤 육아 정보", description: "생후 일수·주수·개월 수를 자동으로 계산해 오늘 필요한 것만 골라드려요.", tags: ["발달", "이유식", "놀이", "안전"] },
  { icon: "map", title: "성장지도", description: "출생부터 첫돌까지, 우리 아기가 지금 어디쯤 있는지 별자리처럼 보여줘요.", tags: ["지금 여기", "발견한 별"] },
  { icon: "food", title: "이유식", description: "단계별 가이드, 재료 도감, 레시피, 먹어본 재료와 냉장고 레시피 찾기.", tags: ["재료 도감", "냉장고"] },
  { icon: "star", title: "발달 기록", description: "이 시기에 관찰될 수 있는 모습을 편하게 기록해요. 점수나 평가는 없어요.", tags: ["하고 있어요", "아직이에요"] },
  { icon: "play", title: "놀이", description: "월령에 맞는 집콕 놀이를 매일 하나씩 추천해요.", tags: ["오늘의 놀이"] },
  { icon: "vaccine", title: "예방접종", description: "생년월일로 접종 예상 시기를 계산하고 완료 날짜를 기록해요.", tags: ["예정일 계산", "출처 표시"] },
];

const FLOW = [
  { step: "오늘", text: "오늘 필요한 발달·이유식·놀이·접종·안전" },
  { step: "이번 주", text: "생후 주수별로 매주 새로운 가이드" },
  { step: "이번 달", text: "월령별 발달과 놀이, 이유식 단계" },
  { step: "앞으로", text: "성장지도에서 다음에 만날 별 미리보기" },
] as const;

const EXPLORE = [
  { href: "/guide", label: "월령별 성장 가이드" },
  { href: "/food", label: "이유식 가이드" },
  { href: "/food/ingredients", label: "재료 도감" },
  { href: "/food/recipes", label: "이유식 레시피" },
  { href: "/food/fridge", label: "이유식 냉장고" },
  { href: "/play", label: "월령별 놀이" },
  { href: "/safety", label: "안전 체크리스트" },
] as const;

function FeatureIcon({ icon }: { icon: (typeof FEATURES)[number]["icon"] }) {
  if (icon === "star") return <Star className="size-6" />;
  if (icon === "vaccine")
    return (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m17 3 4 4M19 5l-9.5 9.5M8 11l5 5M6.5 12.5l5 5-2 2-5-5ZM4.5 19.5 3 21" />
      </svg>
    );
  return <NavIcon name={icon} className="size-6" />;
}

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="text-center">
      <p className="text-[12px] font-bold tracking-[0.26em] text-gold-400">{eyebrow}</p>
      <h2 className="mt-2 text-[26px] font-bold text-ink md:text-[32px]">{title}</h2>
      {desc ? <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">{desc}</p> : null}
    </div>
  );
}

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_DESCRIPTION,
    applicationCategory: "LifestyleApplication",
    inLanguage: "ko-KR",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    publisher: { "@type": "Organization", name: "별마마파파", url: "https://byeolmamapapa.com" },
  };

  return (
    <div className="min-h-dvh">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="sticky top-0 z-30 bg-gradient-to-b from-night/85 to-night/0 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo />
          <Link href="/onboarding" className="min-h-11 content-center px-2 text-sm font-semibold text-ink-soft hover:text-gold-700">
            시작하기
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-3xl px-5 pb-20 pt-10 text-center md:pt-16">
          <div className="relative mx-auto flex size-36 items-center justify-center rounded-full border border-gold-500/25 bg-surface/60 shadow-[0_0_60px_rgb(245_197_66/0.22)] animate-float md:size-44">
            <Star className="size-20 md:size-24" glow />
            <Star className="absolute -right-2 top-5 size-5 animate-twinkle" />
            <Star className="absolute -left-1 bottom-7 size-3.5 animate-twinkle [animation-delay:1s]" />
          </div>
          <p className="mt-7 text-[13px] font-bold tracking-[0.2em] text-gold-400">별마마파파의 세 번째 서비스</p>
          <h1 className="text-gold-gradient mt-3 text-[44px] font-bold leading-tight drop-shadow-[0_0_34px_rgb(245_197_66/0.25)] md:text-[56px]">
            아기별 지도
          </h1>
          <StarRule className="my-6" />
          <p className="font-brand text-[24px] font-bold leading-[1.45] text-ink md:text-[32px]">
            태어난 날부터 첫돌까지
            <br />
            우리 아기의 성장 길을 한눈에.
          </p>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
            가입도 로그인도 필요 없어요. 생년월일만 입력하면
            <br className="hidden sm:block" /> &ldquo;오늘 우리 아기에게 무엇을 해줘야 하지?&rdquo;에 답해드려요.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/onboarding" className={buttonClass("primary", "lg", "sm:px-9")}>
              ✦ 생년월일 입력하고 시작하기
            </Link>
            <Link href="/guide" className={buttonClass("secondary", "lg")}>
              월령별 가이드 보기
            </Link>
          </div>

          {/* 오늘 화면 미리보기 */}
          <div aria-hidden className="card-night mx-auto mt-14 w-full max-w-sm rounded-[2rem] border p-4 text-left shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9),0_0_60px_rgb(245_197_66/0.08)]">
            <div className="rounded-[1.5rem] border border-gold-500/15 bg-night/60 px-4 py-5 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface-2 text-3xl shadow-[0_0_0_1px_rgb(245_197_66/0.3),0_0_30px_rgb(245_197_66/0.25)]">
                👶
              </span>
              <p className="mt-2 font-brand font-bold text-ink">한별이</p>
              <p className="text-gold-gradient font-brand text-3xl font-bold">생후 264일</p>
              <p className="text-sm font-semibold text-ink-soft">8개월 21일 · 37주 5일</p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-[13px] font-bold text-gold-700">
                <Star className="size-3.5" /> 8개월 성장 여행 중
              </p>
            </div>
            <p className="mt-4 px-1 text-[13px] font-bold text-gold-400">✦ 오늘 우리 아기에게 필요한 것</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                ["발달", "숨긴 장난감을 찾아요"],
                ["이유식", "중기 이유식"],
                ["오늘의 놀이", "컵 속 장난감 찾기"],
                ["예방접종", "다음 접종 확인"],
              ].map(([label, title]) => (
                <div key={label} className="rounded-2xl border border-line bg-surface/80 p-3">
                  <p className="text-[11px] font-bold text-gold-400">{label}</p>
                  <p className="mt-1 text-[13px] font-bold text-ink">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 흐름 */}
        <section className="mx-auto max-w-5xl px-5 py-16" aria-labelledby="flow-title">
          <SectionHead eyebrow="HOW IT WORKS" title="오늘 → 이번 주 → 이번 달 → 앞으로" desc="우리 아기에게 필요한 것을 자연스럽게 따라가요." />
          <ol className="mt-10 grid gap-3 sm:grid-cols-4">
            {FLOW.map((item, index) => (
              <li key={item.step} className="card-night rounded-[var(--radius-card)] border p-5 text-left">
                <span className="flex size-7 items-center justify-center rounded-full bg-gold-gradient text-[13px] font-extrabold text-[#14100a]">
                  {index + 1}
                </span>
                <p className="mt-3 font-brand text-lg font-bold text-ink">{item.step}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 기능 */}
        <section className="mx-auto max-w-5xl px-5 py-16" aria-labelledby="features-title">
          <SectionHead eyebrow="FEATURES" title="아기별 지도로 할 수 있는 것" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="card-night relative rounded-[var(--radius-card)] border p-6">
                <span className="flex size-11 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-500">
                  <FeatureIcon icon={feature.icon} />
                </span>
                <h3 className="mt-4 font-brand text-[19px] font-bold text-ink">{feature.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{feature.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {feature.tags.map((tag) => (
                    <li key={tag} className="rounded-full border border-gold-500/20 bg-gold-500/5 px-3 py-1 text-[12px] text-gold-700">
                      {tag}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        {/* 공개 콘텐츠 */}
        <section className="mx-auto max-w-5xl px-5 py-12" aria-labelledby="explore-title">
          <SectionHead eyebrow="EXPLORE" title="로그인 없이 둘러보기" />
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {EXPLORE.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-full border border-gold-500/20 bg-surface/60 px-5 text-[15px] font-semibold text-gold-700 transition-colors hover:border-gold-500/50 hover:bg-gold-500/10"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 원칙 */}
        <section className="mx-auto max-w-3xl px-5 pb-10 pt-12 text-center">
          <SectionHead eyebrow="OUR PROMISE" title="아기마다 속도는 달라요" />
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-soft">
            아기별 지도는 &lsquo;정상/비정상&rsquo;을 판단하거나 점수를 매기지 않아요. 이 시기에 관찰될 수 있는 모습과 부모가 해줄 수 있는 것을 알려드려요. 의료 진단을 대신하지 않으며, 걱정되는 점이
            있다면 소아청소년과 등 전문가와 상담하세요. 아기 기록은 나만 볼 수 있게 안전하게 보관돼요.
          </p>
          <Link href="/onboarding" className={buttonClass("primary", "lg", "mt-8 px-9")}>
            ✦ 지금 시작하기
          </Link>
        </section>
      </main>

      <BrandFooter />
    </div>
  );
}
