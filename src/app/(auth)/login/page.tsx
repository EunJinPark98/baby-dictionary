import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Card } from "@/components/ui/card";
import { safeNextPath } from "@/lib/routes";

export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false, follow: true },
};

const ERROR_MESSAGES: Record<string, string> = {
  callback: "인증 링크가 만료되었거나 이미 사용되었어요. 다시 로그인해 주세요.",
  oauth: "소셜 로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.",
  provider: "지원하지 않는 로그인 방식이에요.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const errorKey = typeof params.error === "string" ? params.error : null;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">다시 만나서 반가워요 ⭐</h1>
      <p className="mt-1.5 text-ink-soft">로그인하고 오늘 우리 아기에게 필요한 것을 확인해 보세요.</p>
      <Card className="mt-6 space-y-4">
        {errorKey && ERROR_MESSAGES[errorKey] ? (
          <p role="alert" className="rounded-2xl bg-blush-50 px-4 py-3 text-sm font-medium text-blush-500">
            {ERROR_MESSAGES[errorKey]}
          </p>
        ) : null}
        <OAuthButtons next={next} />
        <LoginForm next={next} />
      </Card>
    </div>
  );
}
