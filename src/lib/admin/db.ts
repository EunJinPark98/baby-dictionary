import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicTable } from "@/lib/supabase/database.types";

/**
 * 관리자 화면은 테이블 이름을 설정(config)으로 받아 공통 처리하므로, 테이블별 제네릭 타입 대신
 * 느슨한 타입의 쿼리 빌더를 사용한다. 이 파일 밖에서는 타입이 지정된 클라이언트만 사용한다.
 * 권한은 DB RLS(is_admin)가 강제한다.
 */
export function adminTable(supabase: ServerSupabaseClient, table: PublicTable) {
  return (supabase as unknown as SupabaseClient).from(table);
}
