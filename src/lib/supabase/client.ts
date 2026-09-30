import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/** 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트. anon key 만 사용한다. */
export function createClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}
