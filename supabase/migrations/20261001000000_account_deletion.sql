-- =============================================================================
-- 회원 탈퇴: 본인 계정 삭제 함수
--
-- 클라이언트에 service role key 를 두지 않기 위해, 로그인한 사용자가 "자기 자신만" 삭제할 수 있는
-- security definer 함수를 둔다. auth.users 삭제 시 FK(on delete cascade)로
-- profiles, babies(→ 모든 아기 기록), favorites 가 함께 삭제된다.
-- Storage 사진은 앱(Server Action)이 이 함수를 호출하기 전에 사용자 세션으로 먼저 지운다.
-- =============================================================================
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  delete from auth.users where id = v_uid;
end;
$$;

comment on function public.delete_my_account() is '로그인한 사용자 본인의 계정과 모든 기록을 삭제한다 (회원 탈퇴).';

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;
