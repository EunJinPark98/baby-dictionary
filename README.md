# ⭐ 아기별 지도 (Baby Star Map)

> 태어난 날부터 첫돌까지, 우리 아기의 성장 길을 한눈에.
> 별마마파파의 세 번째 서비스

아기 생년월일을 등록하면 **생후 일수·주수·개월 수를 자동 계산**하고, 그 시기에 필요한 발달·이유식·놀이·예방접종·건강·안전 정보를 자동으로 보여주는 0세 맞춤 성장 가이드입니다.

```
생년월일 → getBabyAge() → 월령/주수에 맞는 콘텐츠 선택(lib/content/select) → 화면
```

- 의료 진단 서비스가 아닙니다. "정상/비정상", 점수, 백분위 판정 기능은 의도적으로 없습니다.
- 콘텐츠는 모두 Supabase DB 에서 관리하며, 관리자 페이지(`/admin`)에서 코드 수정 없이 편집합니다.
- 초기 seed 콘텐츠는 **샘플(검토 전)** 로 표시됩니다. 예방접종 일정은 공개 전 반드시 공식 자료로 검증하세요.

---

## 디자인 (별마마파파 브랜드)

[별마마파파](https://byeolmamapapa.com) · 별별 작명소와 같은 **밤하늘 · 금빛 무드**를 따릅니다.

- 팔레트: 밤하늘 `#05060c` 배경, 금빛 그라데이션 `#ffe9a8 → #f5c542 → #d9a215`, 본문 `#f6f6f8`
- 서체: 제목은 고운바탕(Gowun Batang, `next/font` 로 자체 호스팅), 본문은 Pretendard/시스템 고딕
- 요소: 금빛 헤어라인 카드(`card-night`), 금빛 그라데이션 알약 버튼, ✦ 구분선(`StarRule`), 고정 별하늘 배경, 금빛 선 아이콘 네비게이션, 하단 별마마파파 서명
- 토큰은 `src/app/globals.css` 의 `@theme` 한 곳에서 관리합니다 (`night/surface/ink/gold/...`). 색을 바꿀 때는 컴포넌트가 아니라 토큰을 수정하세요.

## 기술 스택

| 영역 | 사용 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, Turbopack, `proxy.ts`), React 19, TypeScript |
| 스타일 | Tailwind CSS v4 (디자인 토큰: `src/app/globals.css`) |
| 백엔드 | Supabase (PostgreSQL, Auth, Storage) via `@supabase/ssr` |
| 테스트 | Vitest (순수 로직 단위 테스트) |
| 배포 | Vercel |

추가 런타임 의존성은 `@supabase/supabase-js`, `@supabase/ssr`, `server-only` 뿐입니다. 차트·폼·상태관리 라이브러리를 쓰지 않습니다.

---

## 빠른 시작 (로컬)

```bash
npm install
cp .env.example .env.local   # 값 채우기 (아래 "환경변수")
npm run dev                  # http://localhost:3000
```

Supabase 환경변수가 없어도 빌드와 공개 페이지 렌더링은 동작하며(콘텐츠는 빈 상태), 개인 페이지는 설정 안내를 보여줍니다.

### 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` / `npm start` | 프로덕션 빌드 / 실행 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 라우트 타입 생성 + `tsc --noEmit` |
| `npm test` | Vitest 단위 테스트 |

---

## 환경변수

`.env.example` 참고. **service role key 는 사용하지 않으며 절대 클라이언트에 넣지 마세요.**

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | anon(public) 또는 publishable 키 (RLS 로 보호) |
| `NEXT_PUBLIC_SITE_URL` | ✅(배포) | 서비스 URL. canonical·OG·인증 메일 링크에 사용 |
| `NEXT_PUBLIC_AUTH_PROVIDERS` | 선택 | `kakao,google` 처럼 나열하면 소셜 로그인 버튼 표시 |

---

## Supabase 설정

1. **프로젝트 생성** 후 Project Settings → API 에서 URL / anon key 를 `.env.local` 에 입력.
2. **DB 마이그레이션 실행** (둘 중 하나)
   - SQL Editor: `supabase/migrations/` 의 파일을 이름 순서대로 실행 (`20260930000000_init.sql` → `20261001000000_account_deletion.sql`) → `supabase/seed.sql` 실행
   - Supabase CLI:
     ```bash
     npx supabase link --project-ref <ref>
     npx supabase db push                      # 마이그레이션
     psql "<connection string>" -f supabase/seed.sql   # 샘플 콘텐츠
     ```
     (로컬 Supabase 사용 시 `npx supabase init` 후 `npx supabase db reset` 이 마이그레이션+seed 를 함께 실행)
3. **RLS 검증 (권장)**: SQL Editor 에서 `supabase/tests/rls_check.sql` 실행 → `RLS OK`, `RLS owner OK`, `RLS admin OK`, `RLS anon OK`, `RLS account deletion OK` NOTICE 확인. (트랜잭션 롤백되어 데이터가 남지 않음)
4. **Auth → URL Configuration**
   - Site URL: 배포 도메인 (예: `https://your-domain.com`)
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://your-domain.com/auth/callback`
5. **Auth → Providers → Email**: 활성화. 이메일 인증(Confirm email)을 켜면 가입 후 메일 링크 → `/auth/callback` → `/onboarding` 으로 이동합니다.
6. **Storage**: 마이그레이션이 비공개 버킷 `baby-photos` 와 정책을 생성합니다 (경로 `{user_id}/...`, 본인만 접근, 화면에는 1시간 만료 signed URL).
7. **관리자 지정**: 가입 후 SQL Editor 에서
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   사용자는 스스로 role 을 바꿀 수 없습니다(컬럼 권한 + RLS).
8. (선택) **카카오/Google 로그인**: Supabase Auth 에서 provider 를 켜고 `NEXT_PUBLIC_AUTH_PROVIDERS=kakao,google` 설정. 코드 수정은 필요 없습니다.

### 도메인 없이 테스트 URL 만들기 (약 10분, 무료)

도메인이 없어도 Vercel 이 `https://<프로젝트명>.vercel.app` 주소를 줍니다.

1. [supabase.com](https://supabase.com) 에서 무료 프로젝트 생성 → SQL Editor 에서 위 2번(마이그레이션 2개 + seed) 실행
2. Authentication → Providers → Email 에서 **Confirm email 을 끄면** 가입 즉시 로그인되어 테스트가 편해요 (공개 전 다시 켜기)
3. [vercel.com](https://vercel.com) → Add New Project → GitHub 저장소 `baby-dictionary` 선택, 브랜치 `claude/baby-star-map-mvp`
4. Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`(= 배포된 vercel.app 주소) → Deploy
5. Supabase Authentication → URL Configuration 의 Site URL 과 Redirect URLs 에 `https://<프로젝트명>.vercel.app` 와 `https://<프로젝트명>.vercel.app/auth/callback` 추가

Supabase 없이 배포해도 빌드는 되지만, 로그인·기록 기능은 동작하지 않고 콘텐츠도 비어 보여요.

### Vercel 배포

1. 저장소 import → Framework: Next.js (기본값)
2. Environment Variables 에 위 3개(+선택 1개) 입력
3. 배포 후 Supabase Auth 의 Site URL / Redirect URLs 에 배포 도메인 추가

---

## 폴더 구조

```
src/
├─ app/
│  ├─ page.tsx                 랜딩 (SEO, JSON-LD)
│  ├─ (auth)/login, signup     이메일 로그인/가입 (+소셜 확장)
│  ├─ auth/callback/route.ts   이메일 인증/OAuth 콜백 (PKCE code, token_hash)
│  ├─ onboarding/              아기 등록 (추가 등록: ?add=1)
│  ├─ (app)/                   앱 셸(상단/하단 네비)
│  │  ├─ today/                ★ 오늘: 6개 맞춤 카드 + 이번 주 + 성장 여행
│  │  ├─ map/                  ★ 성장지도 타임라인 ("지금 여기", 발견한 별)
│  │  ├─ week/                 생후 N주 가이드 (주차 이동)
│  │  ├─ development/          월별 발달 관찰 기록 (하고 있어요/아직이에요/잘 모르겠어요)
│  │  ├─ guide/[slug]          공개 월령 가이드 /guide/8-month-development
│  │  ├─ food/                 이유식 가이드, ingredients/[slug], recipes/[slug], tried, fridge
│  │  ├─ play/                 놀이 목록, play/[slug]
│  │  ├─ safety/               시기별 안전 체크
│  │  └─ baby/                 우리아기: edit, growth, vaccines, milestones, favorites
│  ├─ admin/                   관리자 콘텐츠 CRUD (설정 기반)
│  ├─ sitemap.ts robots.ts manifest.ts icon.svg opengraph-image.png
├─ components/                 ui/ (Card, Button, Form…), 기능별 컴포넌트
├─ lib/
│  ├─ date/date-only.ts        달력 날짜 유틸 (KST 기준 오늘)
│  ├─ age/age.ts               ★ 월령 계산 엔진 (유일한 계산 출처)
│  ├─ content/select.ts        월령/주차 → 콘텐츠 선택, 오늘의 놀이, 성장지도 위치
│  ├─ vaccines/                접종 예정일 계산·상태·문구
│  ├─ food/match.ts            이유식 냉장고 레시피 매칭
│  ├─ growth/chart.ts          성장 차트 스케일/눈금
│  ├─ validation/              입력 검증 (아기, 기록)
│  ├─ admin/                   관리자 필드 설정·파서
│  ├─ queries/                 Supabase 조회 (content: 공개/캐시, baby·records: 세션/RLS)
│  ├─ actions/                 Server Actions (auth, baby, records, admin)
│  └─ supabase/                server / client / public / proxy 클라이언트, DB 타입
└─ proxy.ts                    세션 갱신 + 개인 경로 보호 + X-Robots-Tag noindex
supabase/
├─ migrations/…_init.sql       스키마 + RLS + Storage 정책
├─ seed.sql                    샘플 콘텐츠 (is_sample=true)
└─ tests/rls_check.sql         RLS 격리 검증 스크립트
```

### 설계 메모

- **월령 계산**은 `lib/age/age.ts` 한 곳에서만 합니다. 출생일=생후 0일, 개월은 달력 기준(말일 보정), 오늘은 KST 기준.
- **콘텐츠 선택**은 콘텐츠 목록을 가져와 순수 함수로 거릅니다(SQL/TS 규칙 중복 없음, 테스트 용이). 콘텐츠 규모가 커지면 쿼리 단계 필터로 바꾸면 됩니다.
- **공개 콘텐츠 페이지**는 쿠키 없는 클라이언트로 조회해 정적 생성 + 1시간 ISR. 개인 페이지는 세션 클라이언트(RLS)로 요청 시점 렌더링.
- **RLS**: 아기 하위 데이터는 모두 `owns_baby(baby_id)` 하나로 보호 → 향후 공동 양육자 공유는 이 함수만 확장. 콘텐츠는 `is_admin()` 만 쓰기 가능.
- **개인정보**: 개인 경로는 robots 차단 + `noindex` 메타 + `X-Robots-Tag`. 사진은 비공개 버킷, 업로드 전 브라우저에서 재인코딩해 EXIF(GPS) 제거.
- **출처**: `content_sources` ↔ `content_source_relations`(다형 N:M). 화면 하단에 정보 출처와 최종 검토일(미검토 시 "전문가 검토 전")을 표시.
- **성장 기록**은 추이만 보여주며, 향후 공식 성장곡선은 `growth_standards` 테이블에 넣어 같은 차트 스케일에 추가할 수 있습니다.

---

## 테스트

- `npm test` — 월령/주수/개월 계산, 콘텐츠 선택, 예방접종 예정일·상태, 레시피 매칭, 입력 검증, 관리자 폼 파서, 성장 차트 스케일 (단위 테스트)
- `supabase/tests/rls_check.sql` — 다른 사용자 아기 데이터 조회/수정/삭제 차단, 역할 상승 차단, 관리자 쓰기 허용, 비로그인 차단

---

## 다음 개발 우선순위

1. **콘텐츠 검증**: 예방접종 일정을 질병관리청 최신 표준예방접종일정표로 검증 → `data_reference_date`/`reviewed_at` 입력, `is_sample` 해제. 발달·이유식·안전 콘텐츠 전문가 검토.
2. 주차별 가이드(현재 일부 주차만) 0~52주 전체 작성.
3. 비밀번호 재설정, 계정 탈퇴(데이터 일괄 삭제) 화면.
4. 첫돌 "첫 번째 성장지도" 이미지/PDF 공유 (`baby_milestones` 기반).
5. PWA Service Worker(오프라인), 접종·주차 알림.
6. 공동 양육자 초대 (`owns_baby()` 확장).
7. AI 육아 도우미 (별도 정책·출처 검증 후).
