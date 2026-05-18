
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS withdraw_enabled boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.admin_toggle_withdraw(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  update public.profiles set withdraw_enabled = not withdraw_enabled, updated_at = now() where id = _user_id;
end;
$$;

CREATE OR REPLACE FUNCTION public.request_withdrawal(_amount numeric, _fund_pwd text)
RETURNS withdrawals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  _p public.profiles;
  _settings public.app_settings;
  _w public.withdrawals;
  _fee numeric;
  _net numeric;
begin
  select * into _p from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;
  if _p.suspended then raise exception 'Account suspended'; end if;
  if not _p.withdraw_enabled then raise exception 'Please contact the hiring manager'; end if;
  if coalesce(_p.wallet_address,'') = '' then raise exception 'Set TRC-20 wallet first'; end if;
  if coalesce(_p.fund_password,'') = '' then raise exception 'Set fund password first'; end if;
  if _p.fund_password <> _fund_pwd then raise exception 'Incorrect fund password'; end if;

  select * into _settings from public.app_settings where id = 1;
  if _amount < _settings.min_withdrawal then
    raise exception 'Minimum withdrawal is %', _settings.min_withdrawal;
  end if;
  if _amount > _p.balance then raise exception 'Insufficient balance'; end if;

  _fee := round(_amount * _settings.withdrawal_fee_rate, 2);
  _net := _amount - _fee;

  update public.profiles set balance = balance - _amount, updated_at = now()
    where id = auth.uid();

  insert into public.withdrawals (user_id, amount, fee, net_amount, address, network)
  values (auth.uid(), _amount, _fee, _net, _p.wallet_address, 'TRC-20')
  returning * into _w;

  return _w;
end;
$$;
