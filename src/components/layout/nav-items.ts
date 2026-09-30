import type { NavIconName } from "./nav-icons";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
  /** 이 경로들 아래에 있으면 활성 탭으로 표시 */
  match: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "오늘", icon: "today", match: ["/today", "/week", "/guide", "/safety"] },
  { href: "/map", label: "성장지도", icon: "map", match: ["/map"] },
  { href: "/food", label: "이유식", icon: "food", match: ["/food"] },
  { href: "/play", label: "놀이", icon: "play", match: ["/play"] },
  { href: "/baby", label: "우리아기", icon: "baby", match: ["/baby", "/development", "/settings"] },
];

export function isNavActive(item: NavItem, pathname: string): boolean {
  return item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
