ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS wallet_type text NOT NULL DEFAULT 'Main';

CREATE OR REPLACE FUNCTION public.request_withdrawal(_amount numeric, _fund_pwd text, _wallet_type text DEFAULT 'Main')
 RETURNS withdrawals
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _p public.profiles;
  _settings public.app_settings;
  _w public.withdrawals;
  _fee numeric;
  _net numeric;
  _available numeric;
  _today_count int;
begin
  if _wallet_type not in ('Main','Commission') then
    raise exception 'Invalid wallet type';
  end if;

  select * into _p from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;
  if _p.suspended then raise exception 'Account suspended'; end if;
  if not _p.withdraw_enabled then raise exception 'Please contact the hiring manager'; end if;
  if coalesce(_p.wallet_address,'') = '' then raise exception 'Set TRC-20 wallet first'; end if;
  if coalesce(_p.fund_password,'') = '' then raise exception 'Set fund password first'; end if;
  if _p.fund_password <> _fund_pwd then raise exception 'Incorrect fund password'; end if;

  select count(*) into _today_count
    from public.withdrawals
   where user_id = auth.uid()
     and wallet_type = _wallet_type
     and status <> 'Rejected'
     and created_at::date = current_date;
  if _today_count > 0 then
    raise exception 'You already made a % wallet withdrawal today', _wallet_type;
  end if;

  select * into _settings from public.app_settings where id = 1;
  if _amount < _settings.min_withdrawal then
    raise exception 'Minimum withdrawal is %', _settings.min_withdrawal;
  end if;

  if _wallet_type = 'Commission' then
    _available := coalesce(_p.referral_rewards, 0);
  else
    _available := coalesce(_p.balance, 0) - coalesce(_p.referral_rewards, 0);
  end if;

  if _amount > _available then raise exception 'Insufficient balance'; end if;

  _fee := round(_amount * _settings.withdrawal_fee_rate, 2);
  _net := _amount - _fee;

  if _wallet_type = 'Commission' then
    update public.profiles
       set balance = balance - _amount,
           referral_rewards = referral_rewards - _amount,
           updated_at = now()
     where id = auth.uid();
  else
    update public.profiles
       set balance = balance - _amount,
           updated_at = now()
     where id = auth.uid();
  end if;

  insert into public.withdrawals (user_id, amount, fee, net_amount, address, network, wallet_type)
  values (auth.uid(), _amount, _fee, _net, _p.wallet_address, 'TRC-20', _wallet_type)
  returning * into _w;

  return _w;
end;
$function$;