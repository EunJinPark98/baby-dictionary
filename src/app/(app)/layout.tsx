import type { ReactNode } from "react";
import { BottomNav, TopNav } from "@/components/layout/bottom-nav";
import { Logo } from "@/components/layout/logo";

/**
 * 서비스 앱 셸: 상단 로고(+데스크톱 네비) / 본문 / 모바일 하단 고정 네비.
 * 사용자 정보에 의존하지 않으므로 공개 콘텐츠 페이지의 정적 생성을 방해하지 않는다.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo href="/today" />
          <TopNav />
        </div>
      </header>
      <main id="main" className="pb-nav mx-auto max-w-3xl px-4 pt-5 md:pb-16">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
