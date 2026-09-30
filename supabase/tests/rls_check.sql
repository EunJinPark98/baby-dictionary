-- =============================================================================
-- RLS 격리 검증 스크립트
--
-- Supabase SQL Editor(또는 psql, postgres 권한)에서 그대로 실행할 수 있다.
-- 전체가 하나의 트랜잭션이며 마지막에 ROLLBACK 하므로 데이터가 남지 않는다.
-- 실패하면 "RLS FAIL: ..." 예외가 발생한다. 성공 시 "RLS OK" NOTICE 를 출력한다.
-- =============================================================================
begin;

-- 테스트 사용자 2명 (A, B)
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'rls-a@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'rls-b@example.com');

-- 사용자 A 로 전환
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

insert into public.babies (id, name, birth_date) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '별이', '2026-01-01');
insert into public.growth_records (baby_id, measured_on, weight_kg) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '2026-02-01', 4.2);

-- 사용자 B 로 전환
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);

do $$
declare
  n integer;
begin
  -- 1) B 는 A 의 아기를 볼 수 없다
  select count(*) into n from public.babies;
  if n <> 0 then raise exception 'RLS FAIL: B can see % babies of A', n; end if;

  -- 2) B 는 A 의 성장 기록을 볼 수 없다
  select count(*) into n from public.growth_records;
  if n <> 0 then raise exception 'RLS FAIL: B can see growth_records of A'; end if;

  -- 3) B 는 A 의 아기에 기록을 추가할 수 없다
  begin
    insert into public.growth_records (baby_id, measured_on, weight_kg)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '2026-03-01', 5.0);
    raise exception 'RLS FAIL: B inserted into A baby';
  exception when insufficient_privilege then null;
  end;

  -- 4) B 는 A 의 아기를 수정/삭제할 수 없다 (영향 0행)
  update public.babies set name = '해킹' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'RLS FAIL: B updated A baby'; end if;
  delete from public.babies where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'RLS FAIL: B deleted A baby'; end if;

  -- 5) B 는 다른 사람 소유로 아기를 만들 수 없다
  begin
    insert into public.babies (owner_id, name, birth_date)
    values ('11111111-1111-4111-8111-111111111111', '가짜', '2026-01-01');
    raise exception 'RLS FAIL: B created baby for A';
  exception when insufficient_privilege then null;
  end;

  -- 6) 일반 사용자는 공용 콘텐츠를 수정할 수 없다
  begin
    insert into public.foods (slug, name, category) values ('rls-test-food', '테스트', 'other');
    raise exception 'RLS FAIL: non-admin inserted content';
  exception when insufficient_privilege then null;
  end;

  -- 7) 일반 사용자는 스스로 관리자가 될 수 없다
  begin
    update public.profiles set role = 'admin' where id = '22222222-2222-4222-8222-222222222222';
    raise exception 'RLS FAIL: user escalated own role';
  exception when insufficient_privilege then null;
  end;

  raise notice 'RLS OK';
end;
$$;

-- 소유자 A 는 자기 데이터를 볼 수 있다
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
do $$
declare
  n integer;
begin
  select count(*) into n from public.babies;
  if n <> 1 then raise exception 'RLS FAIL: owner sees % babies (expected 1)', n; end if;
  select count(*) into n from public.growth_records;
  if n <> 1 then raise exception 'RLS FAIL: owner sees % growth_records (expected 1)', n; end if;
  raise notice 'RLS owner OK';
end;
$$;

-- 관리자로 승격된 A 는 콘텐츠를 쓸 수 있다 (승격은 postgres 권한으로만 가능)
reset role;
update public.profiles set role = 'admin' where id = '11111111-1111-4111-8111-111111111111';
set local role authenticated;
do $$
begin
  insert into public.foods (slug, name, category) values ('rls-admin-food', '관리자 테스트', 'other');
  raise notice 'RLS admin OK';
end;
$$;

-- 8) 비로그인(anon) 은 아기 데이터에 접근할 수 없고, 공용 콘텐츠는 읽을 수 있다
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
declare
  n integer;
begin
  begin
    select count(*) into n from public.babies;
    if n <> 0 then raise exception 'RLS FAIL: anon can see babies'; end if;
  exception when insufficient_privilege then null;
  end;
  perform 1 from public.development_items limit 1;
  raise notice 'RLS anon OK';
end;
$$;

rollback;
