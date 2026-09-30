import { LinkCard } from "@/components/ui/card";

type Tone = "white" | "lavender" | "star" | "blush" | "sky" | "mint";

interface TodayCardProps {
  href: string;
  emoji: string;
  label: string;
  title: string;
  description?: string | null;
  tone?: Tone;
  highlight?: string | null;
}

/** "오늘 우리 아기에게 필요한 것" 카드. 카드 전체가 상세 페이지 링크다. */
export function TodayCard({ href, emoji, label, title, description, tone = "white", highlight }: TodayCardProps) {
  return (
    <LinkCard href={href} tone={tone} className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-soft">
          <span aria-hidden className="text-lg">
            {emoji}
          </span>
          {label}
        </span>
        <span aria-hidden className="text-ink-faint transition-transform group-hover:translate-x-0.5">
          ›
        </span>
      </div>
      {highlight ? (
        <span className="mt-2 w-fit rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-lavender-700">{highlight}</span>
      ) : null}
      <p className="mt-2 text-[15px] font-bold leading-snug text-ink">{title}</p>
      {description ? <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">{description}</p> : null}
    </LinkCard>
  );
}
