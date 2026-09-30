"use client";

import { useEffect } from "react";
import { buttonClass } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const notConfigured = error.message.includes("Supabase 환경변수");

  return (
    <ErrorState
      title={notConfigured ? "Supabase 설정이 필요해요" : "화면을 불러오지 못했어요"}
      description={
        notConfigured
          ? "관리자: .env.local 에 Supabase URL 과 anon key 를 설정한 뒤 다시 실행해 주세요."
          : "네트워크 상태를 확인하고 다시 시도해 주세요."
      }
    >
      <button type="button" onClick={reset} className={buttonClass("primary", "md", "mt-5")}>
        다시 시도
      </button>
    </ErrorState>
  );
}
