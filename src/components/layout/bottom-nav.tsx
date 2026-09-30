"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavActive } from "./nav-items";

/** 모바일 하단 고정 네비게이션 (엄지 영역). md 이상에서는 상단 네비게이션을 사용한다. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="주요 메뉴"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold"
              >
                <span
                  aria-hidden
                  className={`flex h-8 w-12 items-center justify-center rounded-full text-lg transition-colors ${active ? "bg-lavender-100" : ""}`}
                >
                  {item.emoji}
                </span>
                <span className={active ? "text-lavender-700" : "text-ink-soft"}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** 데스크톱 상단 네비게이션 */
export function TopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="주요 메뉴" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${active ? "bg-lavender-100 text-lavender-700" : "text-ink-soft hover:bg-lavender-50"}`}
              >
                <span aria-hidden>{item.emoji}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
