import { buttonClass } from "@/components/ui/button";
import { signInWithOAuth } from "@/lib/actions/auth";
import { getEnabledOAuthProviders, type OAuthProvider } from "@/lib/env";

const PROVIDER_LABELS: Record<OAuthProvider, { label: string; className: string }> = {
  kakao: { label: "카카오로 계속하기", className: "!bg-[#FEE500] !text-[#191600] !border-transparent" },
  google: { label: "Google로 계속하기", className: "" },
};

/**
 * 소셜 로그인 버튼. NEXT_PUBLIC_AUTH_PROVIDERS 에 등록된 provider 만 표시한다.
 * (Supabase Auth 에서 provider 를 켜고 env 에 추가하면 코드 수정 없이 활성화)
 */
export function OAuthButtons({ next }: { next: string }) {
  const providers = getEnabledOAuthProviders();
  if (providers.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {providers.map((provider) => (
        <form key={provider} action={signInWithOAuth.bind(null, provider, next)}>
          <button type="submit" className={buttonClass("secondary", "lg", `w-full ${PROVIDER_LABELS[provider].className}`)}>
            {PROVIDER_LABELS[provider].label}
          </button>
        </form>
      ))}
      <div className="flex items-center gap-3 py-2 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-line" />
        또는 이메일로
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
