drop function if exists public.get_my_downline();

create function public.get_my_downline()
returns table (
  user_id uuid,
  phone text,
  tier text,
  level text,
  joined_at timestamptz,
  deposits_total numeric,
  task_rewards_total numeric,
  commission_earned numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (select my_code from public.profiles where id = auth.uid()),
  a as (
    select p.id, p.phone, p.tier, p.my_code, p.created_at, 'A'::text as lvl, 0.05::numeric as rate
      from public.profiles p, me
     where p.invitation_code = me.my_code
  ),
  b as (
    select p.id, p.phone, p.tier, p.my_code, p.created_at, 'B'::text as lvl, 0.03::numeric as rate
      from public.profiles p
      join a on p.invitation_code = a.my_code
  ),
  c as (
    select p.id, p.phone, p.tier, p.my_code, p.created_at, 'C'::text as lvl, 0.01::numeric as rate
      from public.profiles p
      join b on p.invitation_code = b.my_code
  ),
  all_members as (
    select * from a union all select * from b union all select * from c
  )
  select
    m.id as user_id,
    m.phone,
    m.tier,
    m.lvl as level,
    m.created_at as joined_at,
    coalesce((select sum(d.amount) from public.deposits d
              where d.user_id = m.id and d.status = 'Approved'), 0) as deposits_total,
    coalesce((select sum(tc.reward) from public.task_completions tc
              where tc.user_id = m.id), 0) as task_rewards_total,
    round(
      (coalesce((select sum(d.amount) from public.deposits d
                 where d.user_id = m.id and d.status = 'Approved'), 0)
       + coalesce((select sum(tc.reward) from public.task_completions tc
                   where tc.user_id = m.id), 0)
      ) * m.rate
    , 2) as commission_earned
  from all_members m;
$$;