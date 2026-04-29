
-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can view all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null,
  invitation_code text,
  my_code text not null unique,
  balance numeric(14,2) not null default 0,
  tier text not null default 'Internship',
  wallet_address text default '',
  fund_password text default '',
  today_earnings numeric(14,2) not null default 0,
  total_earnings numeric(14,2) not null default 0,
  task_count integer not null default 0,
  task_rewards numeric(14,2) not null default 0,
  referral_rewards numeric(14,2) not null default 0,
  tasks_completed_today integer not null default 0,
  last_task_date date,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users view own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Admins view all profiles"
  on public.profiles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create policy "Admins update all profiles"
  on public.profiles for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _phone text;
  _invite text;
  _mycode text;
begin
  _phone := coalesce(new.raw_user_meta_data->>'phone', new.email);
  _invite := coalesce(new.raw_user_meta_data->>'invitation_code', '');
  _mycode := lpad((floor(random() * 900000) + 100000)::text, 6, '0');

  insert into public.profiles (id, phone, invitation_code, my_code)
  values (new.id, _phone, _invite, _mycode);

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- DEPOSITS
create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null,
  txid text,
  network text not null default 'TRC-20',
  status text not null default 'Pending',
  note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.deposits enable row level security;

create policy "Users view own deposits"
  on public.deposits for select to authenticated
  using (user_id = auth.uid());

create policy "Admins view all deposits"
  on public.deposits for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users create own deposits"
  on public.deposits for insert to authenticated
  with check (user_id = auth.uid());

create policy "Admins update deposits"
  on public.deposits for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- WITHDRAWALS
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null,
  fee numeric(14,2) not null default 0,
  net_amount numeric(14,2) not null default 0,
  address text not null,
  network text not null default 'TRC-20',
  status text not null default 'Pending',
  note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.withdrawals enable row level security;

create policy "Users view own withdrawals"
  on public.withdrawals for select to authenticated
  using (user_id = auth.uid());

create policy "Admins view all withdrawals"
  on public.withdrawals for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users create own withdrawals"
  on public.withdrawals for insert to authenticated
  with check (user_id = auth.uid());

create policy "Admins update withdrawals"
  on public.withdrawals for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- TASK COMPLETIONS
create table public.task_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward numeric(14,2) not null,
  completed_at timestamptz not null default now()
);

alter table public.task_completions enable row level security;

create policy "Users view own tasks"
  on public.task_completions for select to authenticated
  using (user_id = auth.uid());

create policy "Admins view all tasks"
  on public.task_completions for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users insert own tasks"
  on public.task_completions for insert to authenticated
  with check (user_id = auth.uid());

-- APP SETTINGS (single row, id=1)
create table public.app_settings (
  id integer primary key default 1,
  deposit_address text not null default 'TJRabPrwbZy45sbavfcjinPJC18kjpRTv8',
  min_withdrawal numeric(14,2) not null default 2,
  withdrawal_fee_rate numeric(5,4) not null default 0.08,
  tier_rates jsonb not null default '{"Internship":3,"Silver":4,"Gold":8,"Platinum":15}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table public.app_settings enable row level security;

create policy "Anyone authenticated can read settings"
  on public.app_settings for select to authenticated
  using (true);

create policy "Admins can update settings"
  on public.app_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert settings"
  on public.app_settings for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.app_settings (id) values (1);

-- RPC: complete a task atomically (enforces daily cap)
create or replace function public.complete_task(_reward numeric)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  _profile public.profiles;
  _today date := current_date;
  _daily_limit int;
begin
  select * into _profile from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;
  if _profile.suspended then raise exception 'Account suspended'; end if;

  _daily_limit := case _profile.tier
    when 'Internship' then 1
    when 'Silver' then 5
    when 'Gold' then 8
    when 'Platinum' then 15
    else 1 end;

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
$$;

-- RPC: request withdrawal (atomic balance debit + insert)
create or replace function public.request_withdrawal(_amount numeric, _fund_pwd text)
returns public.withdrawals
language plpgsql
security definer
set search_path = public
as $$
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

-- RPC admin: approve deposit (credits user)
create or replace function public.admin_approve_deposit(_deposit_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare _d public.deposits;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  select * into _d from public.deposits where id = _deposit_id for update;
  if not found then raise exception 'Deposit not found'; end if;
  if _d.status <> 'Pending' then raise exception 'Already processed'; end if;

  update public.profiles set balance = balance + _d.amount, updated_at = now()
    where id = _d.user_id;
  update public.deposits set status='Approved', reviewed_at=now() where id = _deposit_id;
end;
$$;

create or replace function public.admin_reject_deposit(_deposit_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  update public.deposits set status='Rejected', reviewed_at=now()
    where id = _deposit_id and status='Pending';
end;
$$;

-- Admin withdrawal actions
create or replace function public.admin_pay_withdrawal(_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  update public.withdrawals set status='Paid', reviewed_at=now()
    where id = _id and status='Pending';
end;
$$;

create or replace function public.admin_reject_withdrawal(_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _w public.withdrawals;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  select * into _w from public.withdrawals where id = _id for update;
  if not found or _w.status <> 'Pending' then return; end if;
  update public.profiles set balance = balance + _w.amount where id = _w.user_id;
  update public.withdrawals set status='Rejected', reviewed_at=now() where id = _id;
end;
$$;

-- Admin: adjust balance / set tier / suspend
create or replace function public.admin_adjust_balance(_user_id uuid, _delta numeric)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  update public.profiles set balance = greatest(0, balance + _delta), updated_at = now()
    where id = _user_id;
end;
$$;

create or replace function public.admin_set_tier(_user_id uuid, _tier text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  update public.profiles set tier = _tier, updated_at = now() where id = _user_id;
end;
$$;

create or replace function public.admin_toggle_suspend(_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Not admin'; end if;
  update public.profiles set suspended = not suspended, updated_at = now() where id = _user_id;
end;
$$;

-- Realtime for live activity
alter publication supabase_realtime add table public.deposits;
alter publication supabase_realtime add table public.withdrawals;
