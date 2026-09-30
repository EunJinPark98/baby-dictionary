interface StarProps {
  className?: string;
  filled?: boolean;
  title?: string;
}

/** 서비스 상징 별 아이콘 (둥근 모서리의 귀여운 별) */
export function Star({ className = "size-6", filled = true, title }: StarProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        d="M12 2.8c.4 0 .8.2 1 .6l2.3 4.7 5.1.8c.9.1 1.3 1.2.6 1.9l-3.7 3.6.9 5.1c.2.9-.8 1.6-1.6 1.2L12 18.3l-4.6 2.4c-.8.4-1.8-.3-1.6-1.2l.9-5.1-3.7-3.6c-.7-.7-.3-1.8.6-1.9l5.1-.8L11 3.4c.2-.4.6-.6 1-.6Z"
        fill={filled ? "var(--color-star-400)" : "none"}
        stroke={filled ? "var(--color-star-500)" : "var(--color-lavender-300)"}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
