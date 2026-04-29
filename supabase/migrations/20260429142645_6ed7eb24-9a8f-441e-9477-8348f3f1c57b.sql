
revoke execute on function public.complete_task(numeric) from public, anon;
revoke execute on function public.request_withdrawal(numeric, text) from public, anon;
revoke execute on function public.admin_approve_deposit(uuid) from public, anon;
revoke execute on function public.admin_reject_deposit(uuid) from public, anon;
revoke execute on function public.admin_pay_withdrawal(uuid) from public, anon;
revoke execute on function public.admin_reject_withdrawal(uuid) from public, anon;
revoke execute on function public.admin_adjust_balance(uuid, numeric) from public, anon;
revoke execute on function public.admin_set_tier(uuid, text) from public, anon;
revoke execute on function public.admin_toggle_suspend(uuid) from public, anon;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;

grant execute on function public.complete_task(numeric) to authenticated;
grant execute on function public.request_withdrawal(numeric, text) to authenticated;
grant execute on function public.admin_approve_deposit(uuid) to authenticated;
grant execute on function public.admin_reject_deposit(uuid) to authenticated;
grant execute on function public.admin_pay_withdrawal(uuid) to authenticated;
grant execute on function public.admin_reject_withdrawal(uuid) to authenticated;
grant execute on function public.admin_adjust_balance(uuid, numeric) to authenticated;
grant execute on function public.admin_set_tier(uuid, text) to authenticated;
grant execute on function public.admin_toggle_suspend(uuid) to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
