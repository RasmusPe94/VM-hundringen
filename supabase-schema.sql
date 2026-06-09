create extension if not exists pgcrypto;

do $$
begin
  create type public.bet_status as enum ('pending', 'won', 'lost', 'void');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'player' check (role in ('player', 'admin')),
  starting_bankroll numeric(12, 2) not null default 100.00 check (starting_bankroll >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competition_settings (
  id boolean primary key default true check (id),
  locked boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.competition_settings (id, locked)
values (true, false)
on conflict (id) do nothing;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  match_no integer not null unique check (match_no > 0),
  starts_at timestamptz,
  home_team text not null,
  away_team text not null,
  phase text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  match_label text,
  description text not null,
  odds numeric(12, 2) not null check (odds > 1),
  stake numeric(12, 2) not null check (stake > 0),
  status public.bet_status not null default 'pending',
  payout numeric(12, 2),
  settled_at timestamptz,
  settled_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bet_has_match check (match_id is not null or nullif(trim(match_label), '') is not null),
  constraint settled_state_is_consistent check (
    (
      status = 'pending'
      and payout is null
      and settled_at is null
      and settled_by is null
    )
    or
    (
      status <> 'pending'
      and payout is not null
      and settled_at is not null
    )
  )
);

create index if not exists bets_user_id_idx on public.bets(user_id);
create index if not exists bets_match_id_idx on public.bets(match_id);
create index if not exists bets_status_idx on public.bets(status);
create index if not exists bets_created_at_idx on public.bets(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists bets_set_updated_at on public.bets;
create trigger bets_set_updated_at
before update on public.bets
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Ny spelare'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.competition_is_locked()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select locked from public.competition_settings where id = true), false);
$$;

alter table public.profiles enable row level security;
alter table public.competition_settings enable row level security;
alter table public.matches enable row level security;
alter table public.bets enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_admin_manage" on public.profiles;
create policy "profiles_admin_manage"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "settings_select_authenticated" on public.competition_settings;
create policy "settings_select_authenticated"
on public.competition_settings
for select
to authenticated
using (true);

drop policy if exists "settings_admin_manage" on public.competition_settings;
create policy "settings_admin_manage"
on public.competition_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "matches_select_authenticated" on public.matches;
create policy "matches_select_authenticated"
on public.matches
for select
to authenticated
using (true);

drop policy if exists "matches_admin_manage" on public.matches;
create policy "matches_admin_manage"
on public.matches
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "bets_select_authenticated" on public.bets;
create policy "bets_select_authenticated"
on public.bets
for select
to authenticated
using (true);

drop policy if exists "bets_insert_own_pending" on public.bets;
create policy "bets_insert_own_pending"
on public.bets
for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'pending'
  and payout is null
  and settled_at is null
  and settled_by is null
  and not public.competition_is_locked()
);

drop policy if exists "bets_update_own_pending" on public.bets;
create policy "bets_update_own_pending"
on public.bets
for update
to authenticated
using (
  auth.uid() = user_id
  and status = 'pending'
)
with check (
  auth.uid() = user_id
  and status = 'pending'
  and payout is null
  and settled_at is null
  and settled_by is null
);

drop policy if exists "bets_delete_own_pending" on public.bets;
create policy "bets_delete_own_pending"
on public.bets
for delete
to authenticated
using (
  auth.uid() = user_id
  and status = 'pending'
);

drop policy if exists "bets_admin_manage" on public.bets;
create policy "bets_admin_manage"
on public.bets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace view public.leaderboard
with (security_invoker = true)
as
with bet_rollup as (
  select
    p.id as user_id,
    p.display_name,
    p.starting_bankroll,
    coalesce(sum(b.stake), 0)::numeric(12, 2) as total_staked,
    coalesce(sum(b.stake) filter (where b.status = 'pending'), 0)::numeric(12, 2) as pending_stake,
    coalesce(sum(b.stake * b.odds) filter (where b.status = 'pending'), 0)::numeric(12, 2) as potential_payout,
    coalesce(sum(b.stake) filter (where b.status <> 'pending'), 0)::numeric(12, 2) as settled_stake,
    coalesce(sum(b.payout) filter (where b.status <> 'pending'), 0)::numeric(12, 2) as settled_payout,
    count(b.id)::integer as bet_count,
    count(b.id) filter (where b.status = 'won')::integer as won_bet_count
  from public.profiles p
  left join public.bets b on b.user_id = p.id
  group by p.id, p.display_name, p.starting_bankroll
),
scored as (
  select
    user_id,
    display_name,
    total_staked,
    (starting_bankroll - total_staked + settled_payout)::numeric(12, 2) as current_balance,
    pending_stake,
    potential_payout,
    (starting_bankroll - total_staked + settled_payout + potential_payout)::numeric(12, 2)
      as balance_including_possible_payout,
    case
      when settled_stake > 0 then round(settled_payout / settled_stake, 4)
      else 0
    end as roi,
    bet_count,
    won_bet_count
  from bet_rollup
)
select
  rank() over (
    order by current_balance desc, balance_including_possible_payout desc, display_name asc
  )::integer as rank,
  *
from scored
order by current_balance desc, balance_including_possible_payout desc, display_name asc;

grant usage on schema public to authenticated;
grant select on public.leaderboard to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.matches to authenticated;
grant select, insert, update, delete on public.bets to authenticated;
grant select, update on public.competition_settings to authenticated;
