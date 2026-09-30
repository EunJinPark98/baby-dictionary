import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  /** 제목 앞 아이콘(이모지 등). 금빛 그라데이션 글자와 섞이지 않도록 따로 그린다. */
  icon?: ReactNode;
  back?: { href: string; label?: string };
  action?: ReactNode;
}

/** 페이지 제목: 금빛 그라데이션 명조(고운바탕) + 금빛 eyebrow */
export function PageHeader({ title, description, eyebrow, icon, back, action }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {back ? (
        <Link
          href={back.href}
          className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-medium text-ink-faint hover:text-gold-700"
        >
          <span aria-hidden>‹</span> {back.label ?? "뒤로"}
        </Link>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? <p className="mb-1 text-[13px] font-bold tracking-[0.08em] text-gold-400">{eyebrow}</p> : null}
          <div className="flex items-center gap-3">
            {icon ? (
              <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10 text-2xl shadow-[0_0_24px_rgb(245_197_66/0.15)]">
                {icon}
              </span>
            ) : null}
            <h1 className="text-gold-gradient text-[28px] font-bold leading-tight">{title}</h1>
          </div>
          {description ? <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 mt-10 flex items-end justify-between gap-3 first:mt-0">
      <h2 id={id} className="flex items-center gap-2 text-[19px] font-bold text-ink">
        <span aria-hidden className="text-[11px] text-gold-500">
          ✦
        </span>
        {children}
      </h2>
      {action}
    </div>
  );
}
