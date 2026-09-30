/**
 * 버튼 스타일 (별마마파파 브랜드: 금빛 그라데이션 알약형 / 금빛 테두리 고스트).
 * <button> 과 <Link> 모두에서 같은 모양을 쓰기 위해 className 생성 함수로 제공한다.
 * 모든 크기가 최소 44px 이상의 터치 영역을 갖는다.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "star" | "danger";
export type ButtonSize = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-[transform,box-shadow,background-color,border-color] duration-200 disabled:cursor-not-allowed disabled:opacity-45 select-none active:scale-[0.98]";

const gold = "bg-gold-gradient text-[#14100a] shadow-[var(--shadow-gold)] hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgb(245_197_66/0.34)]";

const variants: Record<ButtonVariant, string> = {
  primary: gold,
  star: gold,
  secondary: "border border-gold-500/25 bg-surface/60 text-gold-700 hover:border-gold-500/50 hover:bg-gold-50",
  ghost: "text-ink-soft hover:bg-surface hover:text-gold-700",
  danger: "border border-blush-500/30 bg-surface/60 text-blush-500 hover:bg-blush-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-6 text-base",
  lg: "min-h-14 px-7 text-[17px]",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return [base, variants[variant], sizes[size], extra].filter(Boolean).join(" ");
}
