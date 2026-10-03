/**
 * 경로 규칙 (proxy, robots, 레이아웃에서 공유)
 */

/** 개인 페이지. 검색엔진 노출 금지. (/onboarding 외에는 세션이 있어야 들어갈 수 있다) */
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

/**
 * 세션 없이 들어올 수 있는 개인 페이지 = 시작 화면.
 * 생년월일을 입력하면 게스트(Supabase 익명 로그인) 세션이 만들어진다.
 */
export const GUEST_START_PATH = "/onboarding";

/** 이메일 로그인이 필요한 페이지 (게스트 시작 대신 /login 으로 보낸다) */
export const LOGIN_REQUIRED_PREFIXES = ["/admin"] as const;

/** 이메일 계정으로 로그인한 사용자가 접근하면 /today 로 보내는 페이지 (게스트는 그대로 둔다) */
export const AUTH_PAGES = ["/login", "/signup"] as const;

export function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isPrivatePath(pathname: string): boolean {
  return matchesPrefix(pathname, PRIVATE_PATH_PREFIXES);
}

/**
 * 세션이 없을 때 보낼 곳. null 이면 그대로 둔다.
 * 관리자 페이지는 이메일 로그인, 그 밖의 개인 페이지는 생년월일 입력(게스트 시작) 화면으로 보낸다.
 */
export function signedOutRedirect(pathname: string): string | null {
  if (!isPrivatePath(pathname) || matchesPrefix(pathname, [GUEST_START_PATH])) return null;
  if (matchesPrefix(pathname, LOGIN_REQUIRED_PREFIXES)) return "/login";
  return GUEST_START_PATH;
}

/** 오픈 리다이렉트 방지: 내부 경로만 허용 */
export function safeNextPath(value: string | null | undefined, fallback = "/today"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
