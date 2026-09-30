import { BabyForm } from "@/components/baby/baby-form";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete";
import { Card } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { deleteBaby, updateBaby } from "@/lib/actions/baby";
import { getBabyContext, getSignedPhotoUrl } from "@/lib/queries/baby";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("아기 정보 수정");

export default async function BabyEditPage() {
  const { baby, user, today } = await getBabyContext();
  const photoUrl = await getSignedPhotoUrl(baby.photo_path);

  return (
    <div>
      <PageHeader back={{ href: "/baby", label: "우리아기" }} title="아기 정보 수정" />
      <Card>
        <BabyForm
          action={updateBaby.bind(null, baby.id)}
          userId={user.id}
          today={today}
          baby={baby}
          photoUrl={photoUrl}
          submitLabel="저장하기"
        />
      </Card>

      <SectionTitle>아기 정보 삭제</SectionTitle>
      <div className="rounded-2xl border border-blush-100 bg-blush-50 p-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          {baby.name}의 모든 기록(성장, 발달, 이유식, 접종, 성장 순간, 사진)이 영구히 삭제돼요. 되돌릴 수 없어요.
        </p>
        <ConfirmDeleteButton action={deleteBaby.bind(null, baby.id)} label={`${baby.name} 정보 삭제`} confirmLabel="정말 삭제할게요" />
      </div>
    </div>
  );
}
