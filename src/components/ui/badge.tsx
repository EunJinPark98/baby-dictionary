import type { ReactNode } from "react";

type BadgeTone = "lavender" | "star" | "blush" | "sky" | "mint" | "gray";

const tones: Record<BadgeTone, string> = {
  lavender: "bg-lavender-100 text-lavender-700",
  star: "bg-star-100 text-star-700",
  blush: "bg-blush-100 text-blush-500",
  sky: "bg-sky-100 text-sky-600",
  mint: "bg-mint-100 text-mint-700",
  gray: "bg-line text-ink-soft",
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
