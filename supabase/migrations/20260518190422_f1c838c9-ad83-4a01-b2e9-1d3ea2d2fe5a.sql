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
  return _profile;
end;
$function$;