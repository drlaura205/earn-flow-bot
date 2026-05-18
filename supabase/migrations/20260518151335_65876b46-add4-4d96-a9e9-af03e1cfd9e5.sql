create or replace function public.validate_invite_code(_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.deposits d on d.user_id = p.id
    where p.my_code = _code
      and d.status = 'Approved'
  );
$$;

grant execute on function public.validate_invite_code(text) to anon, authenticated;