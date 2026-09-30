import Link from "next/link";
import { notFound } from "next/navigation";
import { FoodRecordForm } from "@/components/food/food-record-form";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { saveFoodRecord, toggleFoodTried } from "@/lib/actions/records";
import { withPossessive } from "@/lib/korean";
import { getBabyContext } from "@/lib/queries/baby";
import { getFoodBySlug } from "@/lib/queries/content";
import { getFoodRecords } from "@/lib/queries/records";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("먹어본 재료 기록");

export default async function FoodRecordPage({ params }: PageProps<"/food/tried/[slug]">) {
  const { slug } = await params;
  const { baby, today } = await getBabyContext();
  const food = await getFoodBySlug(slug);
  if (!food) notFound();
  const records = await getFoodRecords(baby.id);
  const record = records.find((r) => r.food_id === food.id) ?? null;

  const babyId = baby.id;
  const foodId = food.id;
  async function removeRecord() {
    "use server";
    await toggleFoodTried(babyId, foodId, false);
  }

  return (
    <div>
      <PageHeader
        back={{ href: "/food/tried", label: "먹어본 재료" }}
        eyebrow={withPossessive(baby.name)}
        title={
          <span>
            <span aria-hidden>{food.emoji}</span> {food.name} 기록
          </span>
        }
      />
      {food.allergy_note ? (
        <div className="mb-4">
          <Callout emoji="⚠️" tone="blush">
            {food.allergy_note}
          </Callout>
        </div>
      ) : null}
      <Card>
        <FoodRecordForm
          action={saveFoodRecord.bind(null, baby.id, food.id)}
          record={record}
          today={today}
          birthDate={baby.birth_date}
        />
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/food/ingredients/${food.slug}`} className={buttonClass("secondary", "md")}>
          재료 정보 보기
        </Link>
        {record ? (
          <form action={removeRecord}>
            <button type="submit" className={buttonClass("ghost", "md")}>
              기록 삭제
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
