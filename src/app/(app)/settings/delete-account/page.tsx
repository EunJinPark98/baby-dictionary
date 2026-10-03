import { DeleteAccountForm } from "@/components/settings/account-forms";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getBabies, isGuestUser, requireUser } from "@/lib/queries/baby";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("회원 탈퇴");

export default async function DeleteAccountPage() {
  const user = await requireUser();
  const babies = await getBabies();
  const guest = isGuestUser(user);

  return (
    <div>
      <PageHeader
        back={{ href: "/settings", label: "설정" }}
        title={guest ? "모든 기록 삭제" : "회원 탈퇴"}
        description={guest ? "아래 정보가 즉시 영구 삭제되며 되돌릴 수 없어요." : "탈퇴하면 아래 정보가 즉시 영구 삭제되며 되돌릴 수 없어요."}
      />
      <Card tone="blush" className="mb-4">
        <ul className="space-y-1.5 text-[15px] leading-relaxed text-ink">
          {guest ? null : <li>✦ 계정 ({user.email})</li>}
          <li>✦ 등록한 아기 정보{babies.length > 0 ? ` (${babies.map((b) => b.name).join(", ")})` : ""}</li>
          <li>✦ 성장·발달·이유식·예방접종 기록과 성장 순간, 저장한 콘텐츠</li>
          <li>✦ 올린 사진</li>
        </ul>
      </Card>
      <Card>
        <DeleteAccountForm guest={guest} />
      </Card>
    </div>
  );
}
