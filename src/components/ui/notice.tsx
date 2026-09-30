import type { ReactNode } from "react";

/** 의료 정보 원칙에 따른 안내 문구 */
export const MEDICAL_DISCLAIMER =
  "아기마다 발달 속도와 시기에는 차이가 있어요. 이 정보는 의료 진단이나 발달 선별검사를 대신하지 않아요. 걱정되는 점이 있다면 소아청소년과 등 전문가와 상담하세요.";

export function Disclaimer({ children = MEDICAL_DISCLAIMER, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <p className={`flex gap-2.5 rounded-2xl border border-line bg-surface/60 px-4 py-3 text-[13px] leading-relaxed text-ink-faint ${className}`}>
      <span aria-hidden className="text-gold-500">
        ✦
      </span>
      <span>{children}</span>
    </p>
  );
}

export function Callout({ emoji = "💡", children, tone = "star" }: { emoji?: string; children: ReactNode; tone?: "star" | "blush" | "lavender" }) {
  const toneClass = {
    star: "border-gold-500/25 bg-star-50",
    blush: "border-blush-500/25 bg-blush-50",
    lavender: "border-gold-500/25 bg-gold-50",
  }[tone];
  return (
    <div className={`flex gap-2.5 rounded-2xl border px-4 py-3 text-sm leading-relaxed text-ink ${toneClass}`}>
      <span aria-hidden className="text-base">
        {emoji}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
