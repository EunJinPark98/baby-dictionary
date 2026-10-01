// supabase/migrations/*.sql + supabase/seed.sql → supabase/setup_all.sql
// Supabase SQL Editor 에 한 번에 붙여넣기 위한 파일을 만든다.  실행: npm run db:bundle
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const dir = "supabase/migrations";
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort().map((f) => `${dir}/${f}`);
files.push("supabase/seed.sql");
const header = `-- =============================================================================
-- 아기별 지도 — Supabase 전체 설정 (자동 생성 파일, 직접 수정하지 마세요)
-- 생성: npm run db:bundle  /  포함: ${files.join(", ")}
-- 사용: Supabase Dashboard → SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
-- 주의: 새 프로젝트에서 한 번만 실행하세요.
-- =============================================================================
`;
const body = files.map((f) => `\n-- ───────── ${f} ─────────\n${readFileSync(f, "utf8")}`).join("\n");
writeFileSync("supabase/setup_all.sql", header + body);
console.log(`supabase/setup_all.sql <- ${files.length} files`);
