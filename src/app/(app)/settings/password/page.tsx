import { ChangePasswordForm } from "@/components/settings/account-forms";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/queries/baby";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("비밀번호 변경");

export default async function ChangePasswordPage({ searchParams }: PageProps<"/settings/password">) {
  await requireUser();
  const params = await searchParams;
  const isRecovery = params.recovery === "1";

  return (
    <div>
      <PageHeader back={{ href: "/settings", label: "설정" }} title={isRecovery ? "새 비밀번호 정하기" : "비밀번호 변경"} />
      {isRecovery ? (
        <div className="mb-4">
          <Callout emoji="🔑" tone="lavender">
            메일 인증이 완료됐어요. 앞으로 사용할 새 비밀번호를 입력해 주세요.
          </Callout>
        </div>
      ) : null}
      <Card>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
