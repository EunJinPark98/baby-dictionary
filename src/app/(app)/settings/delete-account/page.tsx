import { DeleteAccountForm } from "@/components/settings/account-forms";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getBabies, requireUser } from "@/lib/queries/baby";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("회원 탈퇴");

export default async function DeleteAccountPage() {
  const user = await requireUser();
  const babies = await getBabies();

  return (
    <div>
      <PageHeader back={{ href: "/settings", label: "설정" }} title="회원 탈퇴" description="탈퇴하면 아래 정보가 즉시 영구 삭제되며 되돌릴 수 없어요." />
      <Card tone="blush" className="mb-4">
        <ul className="space-y-1.5 text-[15px] leading-relaxed text-ink">
          <li>✦ 계정 ({user.email})</li>
          <li>✦ 등록한 아기 정보{babies.length > 0 ? ` (${babies.map((b) => b.name).join(", ")})` : ""}</li>
          <li>✦ 성장·발달·이유식·예방접종 기록과 성장 순간, 저장한 콘텐츠</li>
          <li>✦ 올린 사진</li>
        </ul>
      </Card>
      <Card>
        <DeleteAccountForm />
      </Card>
    </div>
  );
}
