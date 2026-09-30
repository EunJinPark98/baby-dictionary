import type { ReactNode } from "react";

/** 하단/상단 네비게이션용 선 아이콘 (currentColor, 1.6px 선) */
export type NavIconName = "today" | "map" | "food" | "play" | "baby";

const paths: Record<NavIconName, ReactNode> = {
  // 떠오르는 해
  today: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  // 별자리
  map: (
    <>
      <path d="m4 17 5-6 4 3 7-8" />
      <circle cx="4" cy="17" r="1.6" />
      <circle cx="9" cy="11" r="1.6" />
      <circle cx="13" cy="14" r="1.6" />
      <path d="m20 3.2.8 1.8 1.9.3-1.4 1.3.3 1.9-1.6-.9-1.7.9.4-1.9L17.3 5.3l1.9-.3Z" />
    </>
  ),
  // 이유식 그릇
  food: (
    <>
      <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" />
      <path d="M9 20h6" />
      <path d="M14 3.5 17.5 8M10 5c.8 1 .8 2 0 3M13 5.5c.6.8.6 1.6 0 2.4" />
    </>
  ),
  // 풍선
  play: (
    <>
      <path d="M12 3a5.5 5.5 0 0 0-5.5 5.5c0 3.6 3.3 6.8 5.5 7.5 2.2-.7 5.5-3.9 5.5-7.5A5.5 5.5 0 0 0 12 3Z" />
      <path d="m11 16-1 1.5h4L13 16M12 17.5c0 1.5-1.5 2-1.5 3.5" />
    </>
  ),
  // 아기 얼굴
  baby: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 5.5c0-1.4 1-2.3 2.2-2" />
      <circle cx="9.3" cy="12.5" r=".6" fill="currentColor" />
      <circle cx="14.7" cy="12.5" r=".6" fill="currentColor" />
      <path d="M10 16c1.1.9 2.9.9 4 0" />
    </>
  ),
};

export function NavIcon({ name, className = "size-6" }: { name: NavIconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[name]}
    </svg>
  );
}
