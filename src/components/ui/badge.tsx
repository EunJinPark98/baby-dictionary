import type { ReactNode } from "react";

type BadgeTone = "lavender" | "star" | "blush" | "sky" | "mint" | "gray";

const tones: Record<BadgeTone, string> = {
  lavender: "border border-gold-500/25 bg-gold-500/5 text-gold-700",
  star: "bg-gold-gradient text-[#14100a]",
  blush: "border border-blush-500/30 bg-blush-50 text-blush-500",
  sky: "border border-sky-600/25 bg-sky-50 text-sky-600",
  mint: "border border-mint-700/25 bg-mint-100 text-mint-700",
  gray: "border border-ink-faint/30 text-ink-faint",
};

export function Badge({ children, tone = "lavender", className = "" }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** 검증되지 않은 seed 콘텐츠 표시 */
export function SampleBadge({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return (
    <Badge tone="gray" className="font-medium">
      샘플 콘텐츠 · 검토 전
    </Badge>
  );
}
