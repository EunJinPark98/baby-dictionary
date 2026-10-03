import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Card } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/ui/page-header";
import { signOut } from "@/lib/actions/auth";
import { getIsAdmin, isGuestUser, requireUser } from "@/lib/queries/baby";
import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata("설정");

function SettingsRow({ href, label, description, danger = false }: { href: string; label: string; description?: string; danger?: boolean }) {
  return (
    <Link href={href} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-gold-50">
      <span className="min-w-0">
        <span className={`block font-semibold ${danger ? "text-blush-500" : "text-ink"}`}>{label}</span>
        {description ? <span className="block text-[13px] text-ink-faint">{description}</span> : null}
      </span>
      <span aria-hidden className="text-ink-faint">
        ›
      </span>
    </Link>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <div className="card-night divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-soft)]">{children}</div>;
}

export default async function SettingsPage() {
  const user = await requireUser();
  const isAdmin = await getIsAdmin();
  const guest = isGuestUser(user);

  return (
    <div>
      <PageHeader back={{ href: "/baby", label: "우리아기" }} title="설정" />

      <SectionTitle>화면</SectionTitle>
      <Card>
        <p className="mb-3 text-sm text-ink-soft">밝은 화면이 기본이에요. 밤중 수유 때는 다크 모드를 써 보세요.</p>
        <ThemeSelector />
      </Card>

      <SectionTitle>계정</SectionTitle>
      {guest ? (
        <Group>
          <div className="px-4 py-3">
            <p className="font-semibold text-ink">로그인 없이 이용 중이에요</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-faint">
              기록은 지금 쓰는 브라우저에 연결돼 있어요. 브라우저 데이터를 지우거나 다른 기기·브라우저에서 열면 기록을 볼 수 없어요.
            </p>
          </div>
          <SettingsRow href="/baby/edit" label="아기 정보 수정" />
        </Group>
      ) : (
        <Group>
          <div className="px-4 py-3">
            <p className="text-[13px] text-ink-faint">로그인 이메일</p>
            <p className="font-semibold text-ink">{user.email}</p>
          </div>
          <SettingsRow href="/settings/password" label="비밀번호 변경" description="새 비밀번호로 바꿔요" />
          <SettingsRow href="/baby/edit" label="아기 정보 수정" />
          {isAdmin ? <SettingsRow href="/admin" label="관리자 페이지" description="콘텐츠 관리" /> : null}
          <form action={signOut}>
            <button type="submit" className="flex min-h-14 w-full items-center px-4 text-left font-semibold text-ink hover:bg-gold-50">
              로그아웃
            </button>
          </form>
        </Group>
      )}

      <SectionTitle>기타</SectionTitle>
      <Group>
        {guest ? (
          <SettingsRow href="/settings/delete-account" label="모든 기록 삭제" description="아기 정보와 모든 기록을 지우고 처음으로 돌아가요" danger />
        ) : (
          <SettingsRow href="/settings/delete-account" label="회원 탈퇴" description="계정과 모든 기록을 삭제해요" danger />
        )}
      </Group>
    </div>
  );
}
