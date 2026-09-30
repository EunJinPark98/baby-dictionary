/**
 * 공개 환경변수 접근.
 *
 * NEXT_PUBLIC_* 값은 빌드 시 인라인되므로 반드시 `process.env.NEXT_PUBLIC_X` 형태로 직접 참조한다.
 * 이 앱은 service role key 를 사용하지 않는다.
 */

export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase 환경변수가 설정되지 않았어요. .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 를 입력해 주세요.",
    );
    this.name = "SupabaseNotConfiguredError";
  }
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = getSupabasePublicEnv();
  if (!env) throw new SupabaseNotConfiguredError();
  return env;
}

/** canonical / OG / 이메일 인증 링크에 쓰는 서비스 기본 URL (끝 슬래시 없음) */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export type OAuthProvider = "kakao" | "google";
const SUPPORTED_OAUTH_PROVIDERS: readonly OAuthProvider[] = ["kakao", "google"];

/** 활성화된 소셜 로그인 목록. Supabase Auth 에서 provider 를 켠 뒤 env 에 추가하면 버튼이 나타난다. */
export function getEnabledOAuthProviders(): OAuthProvider[] {
  const raw = process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "";
  return raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter((p): p is OAuthProvider => (SUPPORTED_OAUTH_PROVIDERS as readonly string[]).includes(p));
}
