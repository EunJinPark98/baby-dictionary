/**
 * 화면 테마 (라이트 기본 / 다크 / 시스템 설정 따르기).
 *
 * 테마는 기기별 화면 설정이므로 서버가 아닌 브라우저(localStorage)에 저장한다.
 * 첫 페인트 전에 <head> 의 인라인 스크립트가 <html data-theme> 를 정해 깜빡임을 막는다.
 * 서버에서 쿠키를 읽지 않으므로 공개 페이지의 정적 생성에 영향을 주지 않는다.
 */
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "bsm-theme";
export const DEFAULT_THEME: ThemePreference = "light";
export const THEME_COLORS: Record<ResolvedTheme, string> = { light: "#fbf8f1", dark: "#05060c" };

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

/** <head> 인라인 스크립트. 로직은 resolveTheme 과 같다 (테스트는 resolveTheme 으로). */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(p!=="light"&&p!=="dark"&&p!=="system")p=${JSON.stringify(DEFAULT_THEME)};var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var t=d?"dark":"light";var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"?${JSON.stringify(THEME_COLORS.dark)}:${JSON.stringify(THEME_COLORS.light)});}catch(e){}})();`;
