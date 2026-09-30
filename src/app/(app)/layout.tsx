import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNav, TopNav } from "@/components/layout/bottom-nav";
import { BrandFooter, Logo } from "@/components/layout/logo";

/**
 * 서비스 앱 셸: 상단 로고(+데스크톱 네비) / 본문 / 모바일 하단 고정 네비.
 * 사용자 정보에 의존하지 않으므로 공개 콘텐츠 페이지의 정적 생성을 방해하지 않는다.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-night/75 backdrop-blur-xl">
        <div className="mx-auto flex h-15 max-w-3xl items-center justify-between px-4">
          <Logo href="/today" />
          <div className="flex items-center gap-1">
            <TopNav />
            <Link
              href="/settings"
              aria-label="설정"
              className="flex size-11 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-gold-50 hover:text-gold-700"
            >
              <SettingsIcon />
            </Link>
          </div>
        </div>
      </header>
      <div className="pb-nav md:pb-0">
        <main id="main" className="mx-auto max-w-3xl px-4 pt-6">
          {children}
        </main>
        <BrandFooter />
      </div>
      <BottomNav />
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
