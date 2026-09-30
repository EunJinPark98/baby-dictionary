/**
 * 버튼 스타일. <button> 과 <Link> 모두에서 같은 모양을 쓰기 위해 className 생성 함수로 제공한다.
 * 모든 크기가 최소 44px 이상의 터치 영역을 갖는다.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "star" | "danger";
export type ButtonSize = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 select-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-lavender-600 text-white hover:bg-lavender-700 active:bg-lavender-700",
  secondary: "bg-white text-lavender-700 border border-lavender-200 hover:bg-lavender-50",
  ghost: "text-ink-soft hover:bg-lavender-50",
  star: "bg-star-300 text-ink hover:bg-star-400",
  danger: "bg-white text-blush-500 border border-blush-100 hover:bg-blush-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-6 text-lg",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return [base, variants[variant], sizes[size], extra].filter(Boolean).join(" ");
}
