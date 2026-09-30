import Link from "next/link";
import type { ReactNode } from "react";

/**
 * 카드 톤. 기본(white)은 브랜드 밤하늘 카드(금빛 헤어라인 + 잔광),
 * 나머지는 의미별 은은한 틴트다. (이름은 기존 호출부 호환을 위해 유지)
 */
type Tone = "white" | "lavender" | "star" | "blush" | "sky" | "mint";

const tones: Record<Tone, string> = {
  white: "card-night",
  lavender: "border-gold-500/25 bg-gradient-to-br from-gold-100/80 via-surface/90 to-surface/90",
  star: "border-gold-500/30 bg-gradient-to-br from-star-100 via-surface/90 to-surface/90",
  blush: "border-blush-500/20 bg-gradient-to-br from-blush-50 via-surface/90 to-surface/90",
  sky: "border-sky-600/20 bg-gradient-to-br from-sky-50 via-surface/90 to-surface/90",
  mint: "border-mint-700/20 bg-gradient-to-br from-mint-100/70 via-surface/90 to-surface/90",
};

interface CardProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}

export function Card({ children, tone = "white", className = "", as: Tag = "div" }: CardProps) {
  return (
    <Tag className={`rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm ${tones[tone]} ${className}`}>
      {children}
    </Tag>
  );
}

interface LinkCardProps {
  href: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

/** 전체 영역이 눌리는 카드 (큰 터치 영역). 호버 시 금빛 테두리가 밝아진다. */
export function LinkCard({ href, children, tone = "white", className = "" }: LinkCardProps) {
  return (
    <Link
      href={href}
      className={`group block rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-gold-500/45 hover:shadow-[0_20px_44px_rgb(0_0_0/0.5),0_0_36px_rgb(245_197_66/0.1)] active:scale-[0.99] ${tones[tone]} ${className}`}
    >
      {children}
    </Link>
  );
}
