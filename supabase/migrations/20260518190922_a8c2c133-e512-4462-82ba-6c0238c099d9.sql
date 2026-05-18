CREATE OR REPLACE FUNCTION public.admin_set_tier(_user_id uuid, _tier text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  update public.profiles
    set tier = _tier,
        tasks_completed_today = 0,
        last_task_date = null,
        updated_at = now()
    where id = _user_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.upgrade_tier(_tier text, _price numeric)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _p public.profiles;
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

  return _p;
end;
$function$;