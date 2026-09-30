<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes (아기별 지도)

- Age math lives only in `src/lib/age/age.ts`; content selection in `src/lib/content/select.ts`. Keep both pure and tested.
- Content is data in Supabase (never hard-code medical/vaccine data in React). Seed rows are `is_sample = true`.
- Never use a service role key. All writes go through the user session so RLS (`owns_baby`, `is_admin`) applies.
- Avoid evaluative/diagnostic wording ("정상/비정상", "반드시 X개월").
- Checks: `npm run lint && npm run typecheck && npm test && npm run build`.
