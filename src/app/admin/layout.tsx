import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { getIsAdmin, requireUser } from "@/lib/queries/baby";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("관리자");

/** 관리자 전용. 권한이 없으면 존재 자체를 드러내지 않도록 404. (쓰기 권한은 RLS 가 최종 강제) */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireUser();
  if (!(await getIsAdmin())) notFound();

  return (
    <div className="min-h-dvh bg-ivory">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Logo href="/today" />
            <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">관리자</span>
          </div>
          <Link href="/admin" className="min-h-11 content-center text-sm font-semibold text-lavender-700">
            콘텐츠 목록
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
