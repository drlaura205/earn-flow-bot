CREATE OR REPLACE FUNCTION public.admin_adjust_commission(_user_id uuid, _delta numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform set_config('app.bypass_profile_guard','on',true);
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  update public.profiles
     set referral_rewards = greatest(0, referral_rewards + _delta),
         balance = greatest(0, balance + _delta),
         updated_at = now()
   where id = _user_id;
end;
$function$;