
-- Drop the over-eager trigger that blocked SECURITY DEFINER RPCs like complete_task
DROP TRIGGER IF EXISTS prevent_profile_privileged_update_trigger ON public.profiles;
DROP TRIGGER IF EXISTS prevent_profile_privileged_update ON public.profiles;

-- Use column-level grants instead. SECURITY DEFINER functions run as the
-- function owner (postgres) and bypass these grants, so admin_*, complete_task,
-- upgrade_tier, request_withdrawal, etc. continue to work.
REVOKE UPDATE ON public.profiles FROM authenticated, anon, public;

-- Allow users to update only safe self-service fields directly via the client
GRANT UPDATE (wallet_address, fund_password, updated_at) ON public.profiles TO authenticated;
