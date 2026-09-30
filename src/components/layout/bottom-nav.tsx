"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "./nav-icons";
import { NAV_ITEMS, isNavActive } from "./nav-items";

/** 모바일 하단 고정 네비게이션 (엄지 영역). md 이상에서는 상단 네비게이션을 사용한다. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="주요 메뉴"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-night/85 backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${active ? "text-gold-500" : "text-ink-faint hover:text-ink-soft"}`}
              >
                {active ? (
                  <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-gold-gradient shadow-[0_0_12px_rgb(245_197_66/0.8)]" />
                ) : null}
                <NavIcon name={item.icon} className={`size-6 ${active ? "drop-shadow-[0_0_6px_rgb(245_197_66/0.55)]" : ""}`} />
                <span className={active ? "text-gold-700" : undefined}>{item.label}</span>
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
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${active ? "border border-gold-500/30 bg-gold-500/10 text-gold-700" : "text-ink-soft hover:text-gold-700"}`}
              >
                <NavIcon name={item.icon} className="size-[18px]" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
