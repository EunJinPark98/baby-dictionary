import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  back?: { href: string; label?: string };
  action?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, back, action }: PageHeaderProps) {
  return (
    <header className="mb-5">
      {back ? (
        <Link
          href={back.href}
          className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-medium text-ink-soft hover:text-lavender-700"
        >
          <span aria-hidden>‹</span> {back.label ?? "뒤로"}
        </Link>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? <p className="text-sm font-semibold text-lavender-600">{eyebrow}</p> : null}
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-ink">{title}</h1>
          {description ? <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between gap-3 first:mt-0">
      <h2 id={id} className="text-lg font-bold text-ink">
        {children}
      </h2>
      {action}
    </div>
  );
}
