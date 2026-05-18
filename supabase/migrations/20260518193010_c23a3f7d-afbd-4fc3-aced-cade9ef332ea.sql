-- Helper: pay commission to a single upline user
create or replace function public.pay_referral_commission(
  _to_user uuid,
  _amount numeric
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if _to_user is null or _amount is null or _amount <= 0 then
    return;
  end if;
  update public.profiles
     set balance = balance + _amount,
         referral_rewards = referral_rewards + _amount,
         total_earnings = total_earnings + _amount,
         updated_at = now()
   where id = _to_user;
end;
$$;

-- Find the referrer (A) of a given user via invitation_code -> my_code
create or replace function public.get_referrer(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select r.id
    from public.profiles p
    join public.profiles r on r.my_code = p.invitation_code
   where p.id = _user_id
     and coalesce(p.invitation_code,'') <> '';
$$;

-- Tier rank helper (higher = more senior)
create or replace function public.tier_rank(_tier text)
returns int
language sql
immutable
as $$
  select case _tier
    when 'Intern' then 0
    when 'C1' then 1
    when 'C2' then 2
    when 'C3' then 3
    when 'C4' then 4
    when 'C5' then 5
    else 0 end;
$$;

-- Replace upgrade_tier to pay A/B/C 5/3/1% instantly
create or replace function public.upgrade_tier(_tier text, _price numeric)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  _p public.profiles;
  _a uuid;
  _b uuid;
  _c uuid;
begin
  select * into _p from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;
  if _p.suspended then raise exception 'Account suspended'; end if;
  if _p.balance < _price then raise exception 'Insufficient balance'; end if;

  update public.profiles
     set tier = _tier,
         balance = balance - _price,
         tasks_completed_today = 0,
         last_task_date = null,
         updated_at = now()
   where id = auth.uid()
   returning * into _p;

  -- Referral chain commissions on the deposit/upgrade price
  _a := public.get_referrer(_p.id);
  if _a is not null then
    perform public.pay_referral_commission(_a, round(_price * 0.05, 2));
    _b := public.get_referrer(_a);
    if _b is not null then
      perform public.pay_referral_commission(_b, round(_price * 0.03, 2));
      _c := public.get_referrer(_b);
      if _c is not null then
        perform public.pay_referral_commission(_c, round(_price * 0.01, 2));
      end if;
    end if;
  end if;

  return _p;
end;
$$;

-- Replace complete_task to pay A/B/C task management bonuses
create or replace function public.complete_task(_reward numeric)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  _profile public.profiles;
  _today date := current_date;
  _daily_limit int;
  _a uuid; _b uuid; _c uuid;
  _a_tier text; _b_tier text; _c_tier text;
  _worker_rank int;
begin
  select * into _profile from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;
  if _profile.suspended then raise exception 'Account suspended'; end if;

  _daily_limit := case _profile.tier
    when 'Intern' then 3
    when 'C1' then 3
    when 'C2' then 5
    when 'C3' then 5
    when 'C4' then 5
    when 'C5' then 5
    else 3 end;

  if _profile.last_task_date is distinct from _today then
    _profile.tasks_completed_today := 0;
    _profile.today_earnings := 0;
    _profile.last_task_date := _today;
  end if;

  if _profile.tasks_completed_today >= _daily_limit then
    raise exception 'Daily task limit reached';
  end if;

  update public.profiles set
    balance = balance + _reward,
    today_earnings = _profile.today_earnings + _reward,
    total_earnings = total_earnings + _reward,
    task_count = task_count + 1,
    task_rewards = task_rewards + _reward,
    tasks_completed_today = _profile.tasks_completed_today + 1,
    last_task_date = _today,
    updated_at = now()
  where id = auth.uid()
  returning * into _profile;

  insert into public.task_completions (user_id, reward) values (auth.uid(), _reward);

  -- Upline task management bonuses; only if upline tier >= worker tier
  _worker_rank := public.tier_rank(_profile.tier);
  _a := public.get_referrer(_profile.id);
  if _a is not null then
    select tier into _a_tier from public.profiles where id = _a;
    if public.tier_rank(_a_tier) >= _worker_rank then
      perform public.pay_referral_commission(_a, round(_reward * 0.05, 2));
    end if;
    _b := public.get_referrer(_a);
    if _b is not null then
      select tier into _b_tier from public.profiles where id = _b;
      if public.tier_rank(_b_tier) >= _worker_rank then
        perform public.pay_referral_commission(_b, round(_reward * 0.03, 2));
      end if;
      _c := public.get_referrer(_b);
      if _c is not null then
        select tier into _c_tier from public.profiles where id = _c;
        if public.tier_rank(_c_tier) >= _worker_rank then
          perform public.pay_referral_commission(_c, round(_reward * 0.01, 2));
        end if;
      end if;
    end if;
  end if;

  return _profile;
end;
$$;