CREATE OR REPLACE FUNCTION public.upgrade_tier(_tier text, _price numeric)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _p public.profiles;
  _a uuid;
  _b uuid;
  _c uuid;
  _real_price numeric;
begin
  perform set_config('app.bypass_profile_guard','on',true);

  -- Server-side price lookup (ignore client-supplied _price to prevent tampering)
  _real_price := case _tier
    when 'Intern' then 0
    when 'C1' then 40
    when 'C2' then 75
    when 'C3' then 120
    when 'C4' then 250
    when 'C5' then 500
    else null end;

  if _real_price is null then
    raise exception 'Invalid tier';
  end if;

  select * into _p from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;
  if _p.suspended then raise exception 'Account suspended'; end if;
  if _p.balance < _real_price then raise exception 'Insufficient balance'; end if;

  update public.profiles
     set tier = _tier,
         balance = balance - _real_price,
         tasks_completed_today = 0,
         last_task_date = null,
         updated_at = now()
   where id = auth.uid()
   returning * into _p;

  -- Referral chain commissions on the real upgrade price
  _a := public.get_referrer(_p.id);
  if _a is not null then
    perform public.pay_referral_commission(_a, round(_real_price * 0.05, 2));
    _b := public.get_referrer(_a);
    if _b is not null then
      perform public.pay_referral_commission(_b, round(_real_price * 0.03, 2));
      _c := public.get_referrer(_b);
      if _c is not null then
        perform public.pay_referral_commission(_c, round(_real_price * 0.01, 2));
      end if;
    end if;
  end if;

  return _p;
end;
$function$;