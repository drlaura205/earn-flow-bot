create or replace function public.get_my_downline()
returns table (
  user_id uuid,
  phone text,
  tier text,
  level text,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (select my_code from public.profiles where id = auth.uid()),
  a as (
    select p.id, p.phone, p.tier, p.my_code, p.created_at
      from public.profiles p, me
     where p.invitation_code = me.my_code
  ),
  b as (
    select p.id, p.phone, p.tier, p.my_code, p.created_at
      from public.profiles p
      join a on p.invitation_code = a.my_code
  ),
  c as (
    select p.id, p.phone, p.tier, p.my_code, p.created_at
      from public.profiles p
      join b on p.invitation_code = b.my_code
  )
  select id, phone, tier, 'A'::text, created_at from a
  union all
  select id, phone, tier, 'B'::text, created_at from b
  union all
  select id, phone, tier, 'C'::text, created_at from c;
$$;