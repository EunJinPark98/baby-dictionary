/**
 * 경로 규칙 (proxy, robots, 레이아웃에서 공유)
 */

/** 로그인이 필요한 개인 페이지. 검색엔진 노출 금지. */
export const PRIVATE_PATH_PREFIXES = [
  "/today",
  "/map",
  "/week",
  "/development",
  "/baby",
  "/onboarding",
  "/settings",
  "/food/tried",
  "/admin",
] as const;

/** 로그인한 사용자가 접근하면 /today 로 보내는 페이지 */
export const AUTH_PAGES = ["/login", "/signup"] as const;

export function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isPrivatePath(pathname: string): boolean {
  return matchesPrefix(pathname, PRIVATE_PATH_PREFIXES);
}

/** 오픈 리다이렉트 방지: 내부 경로만 허용 */
export function safeNextPath(value: string | null | undefined, fallback = "/today"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
