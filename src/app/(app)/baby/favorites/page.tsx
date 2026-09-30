import Link from "next/link";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { getBabyContext } from "@/lib/queries/baby";
import { getActivities, getDevelopmentItems, getFoods, getRecipes } from "@/lib/queries/content";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("저장한 콘텐츠");

export default async function FavoritesPage() {
  const { supabase } = await getBabyContext();
  const [{ data: favorites }, activities, recipes, foods, developmentItems] = await Promise.all([
    supabase.from("favorites").select("*").order("created_at", { ascending: false }),
    getActivities(),
    getRecipes(),
    getFoods(),
    getDevelopmentItems(),
  ]);
  const list = favorites ?? [];
  const idsOf = (type: string) => new Set(list.filter((f) => f.content_type === type).map((f) => f.content_id));

  const groups = [
    { title: "🎈 놀이", items: activities.filter((a) => idsOf("activity").has(a.id)).map((a) => ({ id: a.id, href: `/play/${a.slug}`, label: `${a.emoji} ${a.title}` })) },
    { title: "🥣 레시피", items: recipes.filter((r) => idsOf("recipe").has(r.id)).map((r) => ({ id: r.id, href: `/food/recipes/${r.slug}`, label: `${r.emoji} ${r.title}` })) },
    { title: "📖 재료", items: foods.filter((f) => idsOf("food").has(f.id)).map((f) => ({ id: f.id, href: `/food/ingredients/${f.slug}`, label: `${f.emoji} ${f.name}` })) },
    { title: "🧠 발달", items: developmentItems.filter((d) => idsOf("development_item").has(d.id)).map((d) => ({ id: d.id, href: `/guide/${Math.min(d.min_month, 12)}-month-development`, label: d.title })) },
  ].filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader back={{ href: "/baby", label: "우리아기" }} title="저장한 콘텐츠" description="놀이, 레시피, 재료 페이지에서 ☆ 저장을 누르면 여기에 모여요." />
      {groups.length === 0 ? (
        <EmptyState emoji="☆" title="저장한 콘텐츠가 없어요" action={{ href: "/play", label: "놀이 둘러보기" }} />
      ) : (
        groups.map((group) => (
          <section key={group.title}>
            <SectionTitle>{group.title}</SectionTitle>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="flex min-h-14 items-center justify-between rounded-2xl border border-line bg-surface px-4 font-semibold text-ink">
                    {item.label}
                    <span aria-hidden className="text-ink-faint">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
