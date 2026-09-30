import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass } from "./button";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: ReactNode;
  action?: { href: string; label: string };
  children?: ReactNode;
}

export function EmptyState({ emoji = "🌙", title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-gold-500/25 bg-surface/50 px-6 py-10 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <p className="mt-3 text-base font-bold text-ink">{title}</p>
      {description ? <div className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</div> : null}
      {action ? (
        <Link href={action.href} className={buttonClass("primary", "md", "mt-5")}>
          {action.label}
        </Link>
      ) : null}
      {children}
    </div>
  );
}

export function ErrorState({ title = "문제가 생겼어요", description, children }: { title?: string; description?: ReactNode; children?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-[var(--radius-card)] border border-blush-500/25 bg-blush-50 px-6 py-10 text-center">
      <span className="text-4xl" aria-hidden>
        🌧️
      </span>
      <p className="mt-3 text-base font-bold text-ink">{title}</p>
      {description ? <div className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</div> : null}
      {children}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} aria-hidden />;
}

/** 페이지 로딩 스켈레톤 (loading.tsx 공용) */
export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <span className="sr-only">불러오는 중…</span>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}
