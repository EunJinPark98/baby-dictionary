import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "회원가입",
  description: "아기별 지도에 가입하고 우리 아기 성장지도를 만들어 보세요.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">우리 아기 성장지도 만들기</h1>
      <p className="mt-1.5 text-ink-soft">가입 후 아기 생년월일만 등록하면 오늘 필요한 정보가 자동으로 보여요.</p>
      <Card className="mt-6 space-y-4">
        <OAuthButtons next="/onboarding" />
        <SignupForm />
      </Card>
    </div>
  );
}
