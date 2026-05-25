
-- Update guard trigger to allow trusted RPCs that set a session bypass flag
CREATE OR REPLACE FUNCTION public.prevent_profile_privileged_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('app.bypass_profile_guard', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.balance IS DISTINCT FROM OLD.balance
     OR NEW.tier IS DISTINCT FROM OLD.tier
     OR NEW.withdraw_enabled IS DISTINCT FROM OLD.withdraw_enabled
     OR NEW.suspended IS DISTINCT FROM OLD.suspended
     OR NEW.total_earnings IS DISTINCT FROM OLD.total_earnings
     OR NEW.task_rewards IS DISTINCT FROM OLD.task_rewards
     OR NEW.task_count IS DISTINCT FROM OLD.task_count
     OR NEW.referral_rewards IS DISTINCT FROM OLD.referral_rewards
     OR NEW.today_earnings IS DISTINCT FROM OLD.today_earnings
     OR NEW.tasks_completed_today IS DISTINCT FROM OLD.tasks_completed_today
     OR NEW.last_task_date IS DISTINCT FROM OLD.last_task_date
     OR NEW.my_code IS DISTINCT FROM OLD.my_code
     OR NEW.invitation_code IS DISTINCT FROM OLD.invitation_code
     OR NEW.phone IS DISTINCT FROM OLD.phone
     OR NEW.id IS DISTINCT FROM OLD.id
  THEN
    RAISE EXCEPTION 'Modification of privileged profile fields is not allowed';
  END IF;
  RETURN NEW;
END;
$function$;

-- Patch each trusted RPC to set the bypass flag at the start of its transaction-local scope.
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

-- Patch pay_referral_commission, upgrade_tier, request_withdrawal, admin_* to also set the bypass flag
DO $$
DECLARE r record; src text; newdef text;
BEGIN
  FOR r IN SELECT oid, proname FROM pg_proc
    WHERE pronamespace='public'::regnamespace
      AND proname IN ('pay_referral_commission','upgrade_tier','request_withdrawal',
                      'admin_adjust_balance','admin_approve_deposit','admin_reject_withdrawal',
                      'admin_set_tier','admin_toggle_suspend','admin_toggle_withdraw')
  LOOP
    src := pg_get_functiondef(r.oid);
    IF src ILIKE '%bypass_profile_guard%' THEN CONTINUE; END IF;
    -- Inject bypass call right after the first 'begin' (case-insensitive, first occurrence as a standalone line)
    newdef := regexp_replace(src, '(\nbegin\n)',
      E'\nbegin\n  perform set_config(''app.bypass_profile_guard'',''on'',true);\n', 'i');
    IF newdef = src THEN
      newdef := regexp_replace(src, '(\nBEGIN\n)',
        E'\nBEGIN\n  PERFORM set_config(''app.bypass_profile_guard'',''on'',true);\n');
    END IF;
    IF newdef <> src THEN
      EXECUTE newdef;
    END IF;
  END LOOP;
END$$;
