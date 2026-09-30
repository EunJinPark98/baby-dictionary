import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "white" | "lavender" | "star" | "blush" | "sky" | "mint";

const tones: Record<Tone, string> = {
  white: "bg-white border-line",
  lavender: "bg-lavender-50 border-lavender-100",
  star: "bg-star-50 border-star-100",
  blush: "bg-blush-50 border-blush-100",
  sky: "bg-sky-50 border-sky-100",
  mint: "bg-mint-100/60 border-mint-100",
};

interface CardProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}

export function Card({ children, tone = "white", className = "", as: Tag = "div" }: CardProps) {
  return (
    <Tag className={`rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] ${tones[tone]} ${className}`}>
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

/** 전체 영역이 눌리는 카드 (큰 터치 영역) */
export function LinkCard({ href, children, tone = "white", className = "" }: LinkCardProps) {
  return (
    <Link
      href={href}
      className={`group block rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.99] hover:border-lavender-200 ${tones[tone]} ${className}`}
    >
      {children}
    </Link>
  );
}
