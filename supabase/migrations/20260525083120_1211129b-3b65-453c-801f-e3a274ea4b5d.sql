
-- 1. user_roles: restrict INSERT/DELETE to admins
CREATE POLICY "Admins manage roles insert"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles delete"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles update"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. profiles: prevent self-edit of privileged columns via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_privileged_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins and SECURITY DEFINER RPCs (called with elevated context) bypass via has_role check
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Only allow this trigger to fire on user self-update path; block changes to privileged fields
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
$$;

DROP TRIGGER IF EXISTS profiles_prevent_privileged_update ON public.profiles;
CREATE TRIGGER profiles_prevent_privileged_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privileged_update();

-- 3. Realtime: restrict deposits/withdrawals channel subscriptions to admins
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read realtime messages" ON realtime.messages;
CREATE POLICY "Admins read realtime messages"
ON realtime.messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. tier_rank: fix mutable search_path
CREATE OR REPLACE FUNCTION public.tier_rank(_tier text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path = public
AS $function$
  select case _tier
    when 'Intern' then 0
    when 'C1' then 1
    when 'C2' then 2
    when 'C3' then 3
    when 'C4' then 4
    when 'C5' then 5
    else 0 end;
$function$;

-- 5. Revoke EXECUTE from anon on sensitive SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.admin_approve_deposit(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_reject_deposit(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_pay_withdrawal(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_reject_withdrawal(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_adjust_balance(uuid, numeric) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_set_tier(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_toggle_suspend(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_toggle_withdraw(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.upgrade_tier(text, numeric) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.complete_task(numeric) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.request_withdrawal(numeric, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.request_withdrawal(numeric, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.pay_referral_commission(uuid, numeric) FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_referrer(uuid) FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privileged_update() FROM anon, public, authenticated;
