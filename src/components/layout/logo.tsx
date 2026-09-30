import Image from "next/image";
import Link from "next/link";

/** 헤더 로고: 별마마파파 마크 + 서비스명 (별별 작명소와 같은 구성) */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2.5 rounded-xl">
      <Image
        src="/brand/byeolmamapapa-logo.png"
        alt=""
        width={30}
        height={30}
        className="rounded-full shadow-[0_0_0_1px_rgb(245_197_66/0.25),0_0_18px_rgb(245_197_66/0.25)]"
        priority
      />
      <span className="font-brand text-[18px] font-bold tracking-[0.02em] text-ink">아기별 지도</span>
    </Link>
  );
}

/** 페이지 하단: 별마마파파 서비스임을 알리는 서명 */
export function BrandFooter() {
  return (
    <footer className="mt-14 border-t border-white/5 px-4 pb-10 pt-10 text-center">
      <a href="https://byeolmamapapa.com" target="_blank" rel="noopener noreferrer" className="inline-flex flex-col items-center gap-2">
        <Image src="/brand/byeolmamapapa-logo.png" alt="" width={36} height={36} className="rounded-full opacity-85" />
        <span className="font-brand text-[15px] font-bold tracking-[0.06em] text-gold-700">별마마파파</span>
      </a>
      <p className="mt-1 text-[12px] text-ink-faint">결혼 · 육아 · 가족을 위한 웹서비스</p>
      <p className="mt-2 text-[12px] text-ink-faint/80">이 서비스의 정보는 의료 진단을 대신하지 않아요.</p>
    </footer>
  );
}
