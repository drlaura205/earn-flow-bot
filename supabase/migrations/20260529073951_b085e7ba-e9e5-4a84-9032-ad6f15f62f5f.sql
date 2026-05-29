CREATE OR REPLACE FUNCTION public.complete_task(_reward numeric)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _profile public.profiles;
  _today date := current_date;
  _daily_limit int;
  _a uuid; _b uuid; _c uuid;
  _a_tier text; _b_tier text; _c_tier text;
  _worker_rank int;
begin
  perform set_config('app.bypass_profile_guard','on',true);
  select * into _profile from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;
  if _profile.suspended then raise exception 'Account suspended'; end if;

  if _profile.last_task_date is distinct from _today then
    _profile.tasks_completed_today := 0;
    _profile.today_earnings := 0;
    _profile.last_task_date := _today;
  end if;

  if _profile.tier = 'Intern' then
    if _today > (_profile.created_at::date + 2) then
      raise exception 'Intern trial expired. Upgrade to continue.';
    end if;
    if _profile.tasks_completed_today >= 3 then
      raise exception 'Daily task limit reached';
    end if;
  else
    _daily_limit := case _profile.tier
      when 'C1' then 3
      when 'C2' then 5
      when 'C3' then 5
      when 'C4' then 5
      when 'C5' then 5
      else 5 end;
    if _profile.tasks_completed_today >= _daily_limit then
      raise exception 'Daily task limit reached';
    end if;
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

  if _profile.tier <> 'Intern' then
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
  end if;

  return _profile;
end;
$function$;