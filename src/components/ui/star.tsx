import { useId } from "react";

interface StarProps {
  className?: string;
  filled?: boolean;
  title?: string;
  /** 은은한 금빛 광채 */
  glow?: boolean;
}

/** 서비스 상징 별 아이콘 (금빛 그라데이션 별) */
export function Star({ className = "size-6", filled = true, title, glow = false }: StarProps) {
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${glow ? "drop-shadow-[0_0_8px_rgb(245_197_66/0.6)]" : ""}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.55" stopColor="#f5c542" />
          <stop offset="1" stopColor="#d9a215" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.8c.4 0 .8.2 1 .6l2.3 4.7 5.1.8c.9.1 1.3 1.2.6 1.9l-3.7 3.6.9 5.1c.2.9-.8 1.6-1.6 1.2L12 18.3l-4.6 2.4c-.8.4-1.8-.3-1.6-1.2l.9-5.1-3.7-3.6c-.7-.7-.3-1.8.6-1.9l5.1-.8L11 3.4c.2-.4.6-.6 1-.6Z"
        fill={filled ? `url(#${gradientId})` : "none"}
        stroke={filled ? "#d9a215" : "rgb(245 197 66 / 0.45)"}
        strokeWidth={filled ? 0.6 : 1.3}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ✦ 금빛 구분선 (브랜드 사이트의 rule) */
export function StarRule({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto flex max-w-[220px] items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      <span className="text-[11px] text-gold-500">✦</span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
    </div>
  );
}

/** 콘텐츠의 이모지 표시. ⭐ 는 브랜드 금빛 별로 바꿔 그린다 (DB 콘텐츠 기본값이 ⭐ 라서). */
export function ContentEmoji({ emoji, className = "" }: { emoji: string; className?: string }) {
  if (emoji === "⭐" || emoji === "🌟") return <Star className={`inline size-[1em] align-[-0.12em] ${className}`} />;
  return <span className={className}>{emoji}</span>;
}
