"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FavoriteContentType } from "@/lib/supabase/database.types";

type State = { status: "loading" } | { status: "anonymous" } | { status: "ready"; userId: string; favoriteId: string | null };

/**
 * 즐겨찾기 버튼. 공개(정적) 페이지에서도 동작하도록 클라이언트에서 로그인 상태를 확인한다.
 * favorites 테이블 RLS 로 본인 데이터만 읽고 쓴다.
 */
export function FavoriteButton({ contentType, contentId, loginNext }: { contentType: FavoriteContentType; contentId: string; loginNext: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        if (!userId) {
          if (!cancelled) setState({ status: "anonymous" });
          return;
        }
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("content_type", contentType)
          .eq("content_id", contentId)
          .maybeSingle();
        if (!cancelled) setState({ status: "ready", userId, favoriteId: data?.id ?? null });
      } catch {
        if (!cancelled) setState({ status: "anonymous" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contentType, contentId]);

  if (state.status === "loading") {
    return <span className="inline-flex min-h-11 w-24 animate-pulse rounded-2xl bg-lavender-50" aria-hidden />;
  }

  if (state.status === "anonymous") {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(loginNext)}`}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-ink-soft"
      >
        ☆ 저장
      </Link>
    );
  }

  const saved = state.favoriteId !== null;

  function toggle() {
    if (state.status !== "ready") return;
    const current = state;
    startTransition(async () => {
      const supabase = createClient();
      if (current.favoriteId) {
        const { error } = await supabase.from("favorites").delete().eq("id", current.favoriteId);
        if (!error) setState({ ...current, favoriteId: null });
      } else {
        const { data, error } = await supabase
          .from("favorites")
          .insert({ content_type: contentType, content_id: contentId })
          .select("id")
          .single();
        if (!error && data) setState({ ...current, favoriteId: data.id });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={saved}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-2xl border px-4 text-sm font-semibold transition-colors ${saved ? "border-star-300 bg-star-100 text-star-700" : "border-line bg-white text-ink-soft"}`}
    >
      {saved ? "★ 저장됨" : "☆ 저장"}
    </button>
  );
}
