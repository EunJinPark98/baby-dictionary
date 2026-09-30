-- =============================================================================
-- 아기별 지도 (Baby Star Map) — initial schema
--
-- 구조
--   1) 공통 함수 (updated_at, 관리자 판별, 아기 소유 판별)
--   2) 사용자 데이터: profiles, babies, *_records, baby_milestones, favorites
--   3) 공용 콘텐츠: development_items, journey_stops, weekly_guides, feeding_stages,
--      foods, recipes, recipe_ingredients, activities, vaccines, safety_guides,
--      content_sources, content_source_relations, growth_standards
--   4) Row Level Security
--   5) Storage (baby-photos, 비공개 버킷)
--
-- 원칙
--   * 사용자 개인 데이터는 "자신이 소유한 아기"의 데이터만 CRUD 가능.
--   * 공용 콘텐츠는 누구나 읽기 가능(게시된 항목만), 관리자만 쓰기 가능.
--   * profiles.role 은 사용자가 스스로 바꿀 수 없음(컬럼 단위 권한).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) 공통 함수
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2) 사용자 데이터
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 30),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is '서비스 사용자 프로필. role=admin 이면 콘텐츠 관리 가능.';

-- 관리자 판별 (RLS 정책에서 재사용). security definer 로 profiles RLS 재귀를 피한다.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- 회원가입 시 profile 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(new.raw_user_meta_data ->> 'display_name', 30), ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.babies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 20),
  birth_date date not null,
  sex text check (sex in ('female', 'male')),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.babies is '사용자(보호자) 1 : N 아기. 향후 공동 양육자 공유 시 owns_baby() 만 확장한다.';
create index babies_owner_id_idx on public.babies (owner_id);

-- 아기 소유 판별. 모든 아기 하위 데이터의 RLS 가 이 함수 하나를 사용한다.
create or replace function public.owns_baby(p_baby_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.babies
    where id = p_baby_id and owner_id = (select auth.uid())
  );
$$;

-- -----------------------------------------------------------------------------
-- 3) 공용 콘텐츠
--    공통 컬럼: is_published(게시 여부), is_sample(검증 전 샘플 여부), reviewed_at(최종 검토일)
-- -----------------------------------------------------------------------------
create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  title text not null,
  url text check (url is null or url ~* '^https?://'),
  published_at date,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.content_sources is '콘텐츠 출처 (질병관리청, WHO, CDC 등).';

create table public.development_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  domain text not null check (domain in ('gross_motor', 'fine_motor', 'language', 'cognitive', 'social_emotional')),
  min_month smallint not null check (min_month between 0 and 36),
  max_month smallint not null check (max_month between 0 and 36),
  title text not null,
  description text not null default '',
  parent_activities text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_month <= max_month)
);

comment on table public.development_items is '월령별로 관찰될 수 있는 발달 항목. 평가/진단 기준이 아니다.';
create index development_items_month_idx on public.development_items (min_month, max_month);

create table public.journey_stops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  kind text not null default 'development' check (kind in ('start', 'development', 'food', 'tooth', 'celebration')),
  emoji text not null default '⭐',
  title text not null,
  typical_from_month numeric(4, 1) not null check (typical_from_month >= 0),
  typical_to_month numeric(4, 1) not null check (typical_to_month >= 0),
  summary text not null default '',
  description text not null default '',
  tips text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (typical_from_month <= typical_to_month)
);

comment on table public.journey_stops is '성장지도의 정거장(별). 시기는 "흔히 관찰되는 범위"이며 개인차가 크다.';

create table public.weekly_guides (
  id uuid primary key default gen_random_uuid(),
  week smallint not null unique check (week between 0 and 60),
  title text not null,
  development text not null default '',
  play text not null default '',
  food_tip text not null default '',
  life_tip text not null default '',
  safety_tip text not null default '',
  is_published boolean not null default true,
  is_sample boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.weekly_guides is '생후 주차별 가이드. 해당 주가 없으면 가장 가까운 이전 주차 가이드를 사용한다.';

create table public.feeding_stages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  min_month smallint not null check (min_month between 0 and 36),
  max_month smallint not null check (max_month between 0 and 36),
  texture text not null default '',
  frequency text not null default '',
  summary text not null default '',
  tips text[] not null default '{}',
  cautions text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_month <= max_month)
);

comment on table public.feeding_stages is '이유식 단계 참고 가이드. 절대적인 의료 기준이 아니다.';

create table public.foods (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  emoji text not null default '🥄',
  category text not null check (category in ('grain', 'vegetable', 'fruit', 'meat', 'fish', 'egg', 'soy', 'dairy', 'other')),
  recommended_from_month smallint check (recommended_from_month between 0 and 36),
  description text not null default '',
  nutrition text not null default '',
  preparation text not null default '',
  pairings text[] not null default '{}',
  allergy_note text not null default '',
  is_common_allergen boolean not null default false,
  is_pantry_staple boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.foods is '이유식 재료 도감. pairings 는 함께 먹기 좋은 재료의 slug 목록.';
comment on column public.foods.is_pantry_staple is '쌀처럼 대부분 집에 있는 기본 재료. 이유식 냉장고에서 "기본 재료 있음" 옵션에 사용.';
create index foods_category_idx on public.foods (category, sort_order);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  emoji text not null default '🥣',
  min_month smallint not null check (min_month between 0 and 36),
  max_month smallint not null check (max_month between 0 and 36),
  description text not null default '',
  servings text not null default '',
  texture text not null default '',
  cook_minutes smallint check (cook_minutes is null or cook_minutes between 1 and 600),
  extra_ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  allergy_note text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_month <= max_month)
);

comment on column public.recipes.extra_ingredients is '재료 도감에 없는 부재료(물, 육수 등) 자유 입력.';

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete restrict,
  amount text not null default '',
  is_optional boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, food_id)
);

create index recipe_ingredients_food_id_idx on public.recipe_ingredients (food_id);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  emoji text not null default '🎈',
  categories text[] not null default '{}'
    check (categories <@ array['gross_motor', 'fine_motor', 'cognitive', 'language', 'sensory', 'social']::text[]),
  min_month smallint not null check (min_month between 0 and 36),
  max_month smallint not null check (max_month between 0 and 36),
  description text not null default '',
  materials text not null default '',
  duration_minutes smallint check (duration_minutes is null or duration_minutes between 1 and 120),
  steps text[] not null default '{}',
  cautions text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_month <= max_month)
);

create index activities_month_idx on public.activities (min_month, max_month);

create table public.vaccines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  disease text not null default '',
  dose_number smallint not null default 1 check (dose_number between 1 and 10),
  dose_label text not null default '',
  min_age_days integer check (min_age_days is null or min_age_days >= 0),
  recommended_from_months smallint not null default 0 check (recommended_from_months >= 0),
  recommended_from_days smallint not null default 0 check (recommended_from_days >= 0),
  recommended_to_months smallint not null default 0 check (recommended_to_months >= 0),
  recommended_to_days smallint not null default 0 check (recommended_to_days >= 0),
  recommended_label text not null default '',
  description text not null default '',
  is_national boolean not null default true,
  data_reference_date date,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.vaccines is '예방접종 일정. 권장 시기 = 생년월일 + (months, days). 공식 일정은 바뀔 수 있으므로 data_reference_date 와 출처를 반드시 표시.';

create table public.safety_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  emoji text not null default '⚠️',
  trigger_label text not null default '',
  min_month smallint not null check (min_month between 0 and 36),
  max_month smallint not null check (max_month between 0 and 36),
  summary text not null default '',
  checklist text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_month <= max_month)
);

-- 콘텐츠 ↔ 출처 N:M (다형 관계)
create table public.content_source_relations (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.content_sources (id) on delete cascade,
  content_type text not null check (content_type in (
    'development_item', 'journey_stop', 'weekly_guide', 'feeding_stage', 'food',
    'recipe', 'activity', 'vaccine', 'safety_guide'
  )),
  content_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, content_type, content_id)
);

create index content_source_relations_content_idx on public.content_source_relations (content_type, content_id);

-- 향후 공식 성장곡선 도입용 (현재 화면에서 사용하지 않음: 백분위/판정 기능 없음)
create table public.growth_standards (
  id uuid primary key default gen_random_uuid(),
  sex text not null check (sex in ('female', 'male')),
  measure text not null check (measure in ('height', 'weight', 'head')),
  age_months numeric(4, 1) not null check (age_months >= 0),
  p3 numeric(6, 2),
  p15 numeric(6, 2),
  p50 numeric(6, 2),
  p85 numeric(6, 2),
  p97 numeric(6, 2),
  source_id uuid references public.content_sources (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sex, measure, age_months)
);

comment on table public.growth_standards is '향후 공식 성장곡선 데이터 도입용 테이블. MVP 에서는 비어 있으며 판정에 사용하지 않는다.';

-- -----------------------------------------------------------------------------
-- 2-b) 아기 하위 기록 (공용 콘텐츠를 참조하므로 뒤에 정의)
-- -----------------------------------------------------------------------------
create table public.growth_records (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies (id) on delete cascade,
  measured_on date not null,
  height_cm numeric(5, 1) check (height_cm is null or height_cm between 20 and 150),
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg between 0.3 and 40),
  head_cm numeric(4, 1) check (head_cm is null or head_cm between 15 and 70),
  memo text check (memo is null or char_length(memo) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (height_cm is not null or weight_kg is not null or head_cm is not null)
);

create index growth_records_baby_idx on public.growth_records (baby_id, measured_on);

create table public.development_records (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies (id) on delete cascade,
  development_item_id uuid not null references public.development_items (id) on delete cascade,
  status text not null check (status in ('doing', 'not_yet', 'unsure')),
  observed_on date not null default current_date,
  memo text check (memo is null or char_length(memo) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (baby_id, development_item_id)
);

create table public.baby_food_records (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  first_tried_on date,
  preference text check (preference in ('good', 'okay', 'dislike')),
  reaction_note text check (reaction_note is null or char_length(reaction_note) <= 500),
  memo text check (memo is null or char_length(memo) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (baby_id, food_id)
);

comment on column public.baby_food_records.reaction_note is '부모가 관찰한 반응 메모. 서비스는 이를 의료적으로 해석하지 않는다.';

create table public.vaccination_records (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies (id) on delete cascade,
  vaccine_id uuid not null references public.vaccines (id) on delete cascade,
  vaccinated_on date not null,
  memo text check (memo is null or char_length(memo) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (baby_id, vaccine_id)
);

create table public.baby_milestones (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies (id) on delete cascade,
  journey_stop_id uuid references public.journey_stops (id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 40),
  emoji text not null default '⭐',
  happened_on date not null,
  memo text check (memo is null or char_length(memo) <= 500),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.baby_milestones is '첫해 성장 순간 기록. 향후 "첫 번째 성장지도" 이미지/PDF 공유의 원천 데이터.';
create index baby_milestones_baby_idx on public.baby_milestones (baby_id, happened_on);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content_type text not null check (content_type in ('activity', 'recipe', 'food', 'development_item')),
  content_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

-- -----------------------------------------------------------------------------
-- updated_at 트리거 일괄 등록
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'babies', 'content_sources', 'development_items', 'journey_stops', 'weekly_guides',
    'feeding_stages', 'foods', 'recipes', 'recipe_ingredients', 'activities', 'vaccines',
    'safety_guides', 'content_source_relations', 'growth_standards', 'growth_records',
    'development_records', 'baby_food_records', 'vaccination_records', 'baby_milestones', 'favorites'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4) Row Level Security
-- -----------------------------------------------------------------------------

-- profiles: 본인만 조회/수정. role 컬럼은 수정 불가(컬럼 권한).
alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

-- babies: 소유자만 CRUD
alter table public.babies enable row level security;

create policy "babies: select own" on public.babies
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "babies: insert own" on public.babies
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "babies: update own" on public.babies
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "babies: delete own" on public.babies
  for delete to authenticated using (owner_id = (select auth.uid()));

-- 아기 하위 기록: owns_baby() 로 통일
do $$
declare
  t text;
begin
  foreach t in array array[
    'growth_records', 'development_records', 'baby_food_records', 'vaccination_records', 'baby_milestones'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "%1$s: select own baby" on public.%1$I for select to authenticated using (public.owns_baby(baby_id))',
      t
    );
    execute format(
      'create policy "%1$s: insert own baby" on public.%1$I for insert to authenticated with check (public.owns_baby(baby_id))',
      t
    );
    execute format(
      'create policy "%1$s: update own baby" on public.%1$I for update to authenticated using (public.owns_baby(baby_id)) with check (public.owns_baby(baby_id))',
      t
    );
    execute format(
      'create policy "%1$s: delete own baby" on public.%1$I for delete to authenticated using (public.owns_baby(baby_id))',
      t
    );
    execute format('revoke all on public.%I from anon', t);
  end loop;
end;
$$;

revoke all on public.babies from anon;

-- favorites: 본인만
alter table public.favorites enable row level security;
create policy "favorites: select own" on public.favorites
  for select to authenticated using (user_id = (select auth.uid()));
create policy "favorites: insert own" on public.favorites
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "favorites: delete own" on public.favorites
  for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.favorites from anon;

-- 공용 콘텐츠: 누구나 게시된 항목 읽기, 관리자만 쓰기
do $$
declare
  t text;
begin
  foreach t in array array[
    'development_items', 'journey_stops', 'weekly_guides', 'feeding_stages', 'foods', 'recipes',
    'activities', 'vaccines', 'safety_guides'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "%1$s: public read" on public.%1$I for select to anon, authenticated using (is_published or public.is_admin())',
      t
    );
    execute format(
      'create policy "%1$s: admin insert" on public.%1$I for insert to authenticated with check (public.is_admin())',
      t
    );
    execute format(
      'create policy "%1$s: admin update" on public.%1$I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      t
    );
    execute format(
      'create policy "%1$s: admin delete" on public.%1$I for delete to authenticated using (public.is_admin())',
      t
    );
  end loop;

  foreach t in array array['recipe_ingredients', 'content_sources', 'content_source_relations', 'growth_standards']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "%1$s: public read" on public.%1$I for select to anon, authenticated using (true)',
      t
    );
    execute format(
      'create policy "%1$s: admin insert" on public.%1$I for insert to authenticated with check (public.is_admin())',
      t
    );
    execute format(
      'create policy "%1$s: admin update" on public.%1$I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      t
    );
    execute format(
      'create policy "%1$s: admin delete" on public.%1$I for delete to authenticated using (public.is_admin())',
      t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 5) Storage: baby-photos (비공개). 경로 규칙: {user_id}/...
--    공개 URL 이 없으므로 URL 을 알아도 볼 수 없다. 화면에는 짧은 만료의 signed URL 사용.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('baby-photos', 'baby-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "baby-photos: owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'baby-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "baby-photos: owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'baby-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "baby-photos: owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'baby-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'baby-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "baby-photos: owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'baby-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
