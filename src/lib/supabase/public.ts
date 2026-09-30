import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

/**
 * 공용 콘텐츠 읽기 전용 클라이언트 (쿠키/세션 없음 → 정적 생성·ISR 가능).
 * 환경변수가 없으면 null 을 반환해 빌드가 실패하지 않도록 한다.
 */
export function getPublicClient(): SupabaseClient<Database> | null {
  const env = getSupabasePublicEnv();
  if (!env) return null;
  if (!client) {
    client = createSupabaseClient<Database>(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
