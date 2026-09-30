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
export function TodayCard({ href, emoji, label, title, description, highlight }: TodayCardProps) {
  return (
    <LinkCard href={href} className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-[13px] font-bold text-gold-400">
          <span aria-hidden className="flex size-8 items-center justify-center rounded-full border border-gold-500/25 bg-gold-500/10 text-base">
            {emoji}
          </span>
          {label}
        </span>
        <span aria-hidden className="text-gold-500/60 transition-transform group-hover:translate-x-0.5">
          ›
        </span>
      </div>
      {highlight ? (
        <span className="mt-3 w-fit rounded-full bg-gold-gradient px-2.5 py-0.5 text-[11px] font-bold text-[#14100a]">{highlight}</span>
      ) : null}
      <p className="mt-3 text-[15px] font-bold leading-snug text-ink">{title}</p>
      {description ? <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-ink-faint">{description}</p> : null}
    </LinkCard>
  );
}
