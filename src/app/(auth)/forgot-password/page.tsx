import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/settings/account-forms";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "비밀번호 재설정",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-gold-gradient text-[28px] font-bold leading-snug">비밀번호 재설정</h1>
      <p className="mt-1.5 text-ink-soft">가입한 이메일로 새 비밀번호를 정할 수 있는 링크를 보내드려요.</p>
      <Card className="mt-6">
        <ForgotPasswordForm />
      </Card>
      <p className="mt-4 text-center text-sm text-ink-soft">
        비밀번호가 기억났나요?{" "}
        <Link href="/login" className="font-semibold text-gold-700 underline underline-offset-2">
          로그인
        </Link>
      </p>
    </div>
  );
}
