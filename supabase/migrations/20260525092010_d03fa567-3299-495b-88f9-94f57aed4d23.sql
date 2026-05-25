create table if not exists public.referral_earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  from_user_id uuid,
  amount numeric not null,
  created_at timestamptz not null default now()
);

alter table public.referral_earnings enable row level security;

create policy "Users view own referral earnings"
  on public.referral_earnings for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins view all referral earnings"
  on public.referral_earnings for select
  to authenticated
  using (has_role(auth.uid(), 'admin'));

create index if not exists idx_referral_earnings_user_created
  on public.referral_earnings (user_id, created_at desc);

create or replace function public.pay_referral_commission(_to_user uuid, _amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.bypass_profile_guard','on',true);
  if _to_user is null or _amount is null or _amount <= 0 then
    return;
  end if;
  update public.profiles
     set balance = balance + _amount,
         referral_rewards = referral_rewards + _amount,
         total_earnings = total_earnings + _amount,
         updated_at = now()
   where id = _to_user;

  insert into public.referral_earnings (user_id, amount)
  values (_to_user, _amount);
end;
$$;