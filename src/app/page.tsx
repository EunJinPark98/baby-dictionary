import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { buttonClass } from "@/components/ui/button";
import { Star } from "@/components/ui/star";
import { getSiteUrl } from "@/lib/env";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const metadata = {
  title: { absolute: `${SITE_NAME} — 태어난 날부터 첫돌까지 우리 아기 성장 가이드` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: SITE_NAME, description: SITE_TAGLINE, url: "/" },
};

const FEATURES = [
  { emoji: "☀️", title: "오늘의 맞춤 육아 정보", description: "생후 일수·주수·개월 수를 자동 계산해 오늘 필요한 것만 골라드려요." },
  { emoji: "🗺️", title: "성장지도", description: "출생부터 첫돌까지, 우리 아기가 지금 어디쯤 있는지 한눈에 봐요." },
  { emoji: "🥣", title: "이유식", description: "단계별 가이드, 재료 도감, 레시피, 먹어본 재료와 냉장고 레시피 찾기." },
  { emoji: "🧠", title: "발달", description: "이 시기에 관찰될 수 있는 모습을 편하게 기록해요. 점수나 평가는 없어요." },
  { emoji: "🎈", title: "놀이", description: "월령에 맞는 집콕 놀이를 매일 하나씩 추천해요." },
  { emoji: "💉", title: "예방접종", description: "생년월일로 접종 예상 시기를 계산하고 완료 날짜를 기록해요." },
] as const;

const PREVIEW_CARDS = [
  { emoji: "🧠", label: "발달", title: "숨긴 장난감을 찾아요" },
  { emoji: "🥣", label: "이유식", title: "중기 이유식" },
  { emoji: "🎈", label: "오늘의 놀이", title: "컵 속 장난감 찾기" },
  { emoji: "💉", label: "예방접종", title: "다음 접종 확인" },
] as const;

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
  };

  return (
    <div className="min-h-dvh bg-ivory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Logo />
        <Link href="/login" className={buttonClass("ghost", "sm")}>
          로그인
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-0 h-[520px] bg-gradient-to-b from-lavender-100/70 via-lavender-50/60 to-transparent" aria-hidden />
          <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:pt-16">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-lavender-700 shadow-sm">
                <Star className="size-4" /> 별마마파파의 세 번째 서비스
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-5xl">
                ⭐ 아기별 지도
              </h1>
              <p className="mt-4 text-xl font-bold leading-relaxed text-ink md:text-2xl">
                태어난 날부터 첫돌까지
                <br />
                우리 아기의 성장 길을 한눈에.
              </p>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
                검색하지 않아도 괜찮아요. 생년월일만 등록하면 “오늘 우리 아기에게 무엇을 해줘야 하지?”에 답해드려요.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className={buttonClass("primary", "lg")}>
                  우리 아기 성장지도 만들기
                </Link>
                <Link href="/guide" className={buttonClass("secondary", "lg")}>
                  월령별 가이드 보기
                </Link>
              </div>
            </div>

            {/* 오늘 화면 미리보기 */}
            <div aria-hidden className="mx-auto w-full max-w-sm rounded-[2.25rem] border border-lavender-100 bg-white p-4 shadow-[var(--shadow-soft)]">
              <div className="rounded-[1.75rem] bg-gradient-to-br from-lavender-100 via-lavender-50 to-star-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-14 items-center justify-center rounded-full border-4 border-white bg-white text-3xl">👶</span>
                  <div>
                    <p className="font-extrabold text-ink">한별이</p>
                    <p className="text-2xl font-extrabold text-lavender-700">생후 264일</p>
                    <p className="text-sm font-semibold text-ink-soft">8개월 21일</p>
                  </div>
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-ink">
                  <Star className="size-4" /> 8개월 성장 여행 중
                </p>
              </div>
              <p className="mt-4 px-1 text-sm font-bold text-ink">오늘 우리 아기에게 필요한 것</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {PREVIEW_CARDS.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-line bg-ivory p-3">
                    <p className="text-[12px] font-bold text-ink-soft">
                      {card.emoji} {card.label}
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink">{card.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 흐름 */}
        <section className="mx-auto max-w-5xl px-4 py-12" aria-labelledby="flow-title">
          <h2 id="flow-title" className="text-center text-2xl font-extrabold text-ink">
            오늘 → 이번 주 → 이번 달 → 앞으로
          </h2>
          <p className="mt-2 text-center text-ink-soft">우리 아기에게 필요한 것을 자연스럽게 따라가요.</p>
          <ol className="mt-8 grid gap-3 sm:grid-cols-4">
            {[
              { step: "오늘", text: "오늘 필요한 발달·이유식·놀이·접종·안전" },
              { step: "이번 주", text: "생후 주수별로 매주 새로운 가이드" },
              { step: "이번 달", text: "월령별 발달과 놀이, 이유식 단계" },
              { step: "앞으로", text: "성장지도에서 다음에 만날 별 미리보기" },
            ].map((item, index) => (
              <li key={item.step} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-soft)]">
                <span className="text-sm font-bold text-lavender-600">STEP {index + 1}</span>
                <p className="mt-1 text-lg font-extrabold text-ink">{item.step}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 기능 */}
        <section className="bg-white/60 py-14" aria-labelledby="features-title">
          <div className="mx-auto max-w-5xl px-4">
            <h2 id="features-title" className="text-center text-2xl font-extrabold text-ink">
              아기별 지도로 할 수 있는 것
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="rounded-[var(--radius-card)] border border-line bg-ivory p-5">
                  <span aria-hidden className="text-3xl">
                    {feature.emoji}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-ink">{feature.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 공개 콘텐츠 */}
        <section className="mx-auto max-w-5xl px-4 py-12" aria-labelledby="explore-title">
          <h2 id="explore-title" className="text-xl font-extrabold text-ink">
            로그인 없이 둘러보기
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              { href: "/guide", label: "📅 월령별 성장 가이드" },
              { href: "/food", label: "🥣 이유식 가이드" },
              { href: "/food/ingredients", label: "📖 재료 도감" },
              { href: "/food/recipes", label: "🍚 이유식 레시피" },
              { href: "/food/fridge", label: "🧊 이유식 냉장고" },
              { href: "/play", label: "🎈 월령별 놀이" },
              { href: "/safety", label: "⚠️ 안전 체크리스트" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-[15px] font-semibold text-ink hover:border-lavender-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 원칙 */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="rounded-[2rem] bg-gradient-to-br from-lavender-100 to-star-50 p-6 md:p-10">
            <h2 className="text-xl font-extrabold text-ink">아기마다 속도는 달라요</h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">
              아기별 지도는 &lsquo;정상/비정상&rsquo;을 판단하거나 점수를 매기지 않아요. 이 시기에 관찰될 수 있는 모습과 부모가 해줄 수 있는 것을 알려드려요. 의료 진단을 대신하지 않으며,
              걱정되는 점이 있다면 소아청소년과 등 전문가와 상담하세요. 아기 기록은 나만 볼 수 있게 안전하게 보관돼요.
            </p>
            <Link href="/signup" className={buttonClass("primary", "lg", "mt-6")}>
              ⭐ 지금 시작하기
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-[13px] text-ink-faint">
        <p>© 별마마파파 · 아기별 지도</p>
        <p className="mt-1">이 서비스의 정보는 의료 진단을 대신하지 않습니다.</p>
      </footer>
    </div>
  );
}
