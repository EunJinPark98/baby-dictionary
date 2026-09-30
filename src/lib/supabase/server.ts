import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabasePublicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * 서버 컴포넌트 / Server Action / Route Handler 용 Supabase 클라이언트.
 * 사용자 세션(쿠키)을 사용하므로 모든 쿼리에 RLS 가 적용된다.
 */
export async function createClient() {
  // cookies() 를 먼저 호출해 이 경로를 요청 시점 렌더링(dynamic)으로 만든다.
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabasePublicEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // 서버 컴포넌트 렌더링 중에는 쿠키를 쓸 수 없다. 세션 갱신은 proxy.ts 가 담당한다.
        }
      },
    },
  });
}

export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;
