-- MastiGuard: core schema for Supabase PostgreSQL
-- Run order: 1) this file  2) 20261005000100_rls_policies.sql
-- Apply via Supabase Dashboard > SQL Editor, or `supabase db push`.

-- ---------------------------------------------------------------- profiles
create table public.profiles (
    id          uuid primary key references auth.users (id) on delete cascade,
    full_name   text,
    email       text,
    role        text not null default 'FARMER'
                check (role in ('FARMER', 'VETERINARIAN', 'DAIRY_MANAGER', 'ADMIN')),
    created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------------- farms
create table public.farms (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    location    text,
    owner_id    uuid references public.profiles (id) on delete set null,
    created_at  timestamptz not null default now()
);
create index idx_farms_owner_id on public.farms (owner_id);

-- ADDITION: lets veterinarians / dairy managers access farms they do not own.
create table public.farm_members (
    farm_id     uuid not null references public.farms (id) on delete cascade,
    user_id     uuid not null references public.profiles (id) on delete cascade,
    created_at  timestamptz not null default now(),
    primary key (farm_id, user_id)
);
create index idx_farm_members_user_id on public.farm_members (user_id);

-- ----------------------------------------------------------------- animals
create table public.animals (
    id          uuid primary key default gen_random_uuid(),
    farm_id     uuid not null references public.farms (id) on delete cascade,
    animal_tag  text not null unique,
    name        text,
    breed       text,
    age         integer check (age is null or age >= 0),
    gender      text,
    status      text not null default 'ACTIVE'
                check (status in ('ACTIVE', 'UNDER_TREATMENT', 'DRY', 'SOLD')),
    created_at  timestamptz not null default now()
);
create index idx_animals_farm_id on public.animals (farm_id);

-- ADDITION: ESP32 devices authenticate with a per-device key, never with a
-- Supabase key. Only a hash of the key is stored. No client can read this table.
create table public.devices (
    id            uuid primary key default gen_random_uuid(),
    device_id     text not null unique,
    animal_id     uuid not null references public.animals (id) on delete cascade,
    api_key_hash  text not null,
    is_active     boolean not null default true,
    last_seen_at  timestamptz,
    created_at    timestamptz not null default now()
);
create index idx_devices_animal_id on public.devices (animal_id);

-- ---------------------------------------------------------- sensor_readings
-- Range checks mirror the API validation (defence in depth). The conductivity
-- upper bound is enforced in the API only, because its unit is still to be confirmed.
create table public.sensor_readings (
    id                   uuid primary key default gen_random_uuid(),
    animal_id            uuid not null references public.animals (id) on delete cascade,
    timestamp            timestamptz not null,
    temperature          double precision check (temperature is null or temperature between 30 and 45),
    heart_rate           double precision check (heart_rate is null or heart_rate between 20 and 220),
    activity_score       double precision check (activity_score is null or activity_score between 0 and 100),
    activity_level       text check (activity_level is null or activity_level in ('LOW', 'NORMAL', 'HIGH')),
    milk_conductivity    double precision check (milk_conductivity is null or milk_conductivity >= 0),
    humidity             double precision check (humidity is null or humidity between 0 and 100),
    ambient_temperature  double precision check (ambient_temperature is null or ambient_temperature between -10 and 60),
    source               text,
    created_at           timestamptz not null default now()
);
create index idx_sensor_readings_animal_id        on public.sensor_readings (animal_id);
create index idx_sensor_readings_timestamp        on public.sensor_readings (timestamp);
create index idx_sensor_readings_animal_timestamp on public.sensor_readings (animal_id, timestamp desc);
-- Duplicate protection: same animal + timestamp + source is rejected.
create unique index uq_sensor_readings_dedupe
    on public.sensor_readings (animal_id, timestamp, coalesce(source, ''));

-- ---------------------------------------------------------- risk_predictions
create table public.risk_predictions (
    id             uuid primary key default gen_random_uuid(),
    animal_id      uuid not null references public.animals (id) on delete cascade,
    reading_id     uuid references public.sensor_readings (id) on delete set null,  -- ADDITION
    timestamp      timestamptz not null,
    risk_score     double precision not null check (risk_score between 0 and 100),
    risk_level     text not null check (risk_level in ('LOW', 'MEDIUM', 'HIGH')),
    confidence     double precision check (confidence is null or confidence between 0 and 1),
    model_version  text,
    explanation    jsonb,
    created_at     timestamptz not null default now()
);
create index idx_risk_predictions_animal_timestamp on public.risk_predictions (animal_id, timestamp desc);

-- ------------------------------------------------------------------- alerts
-- ADDITIONS: farm_id (needed for RLS and herd-level alerts, which have no animal)
-- and resolved_at (lets the backend avoid duplicate open alerts).
create table public.alerts (
    id           uuid primary key default gen_random_uuid(),
    animal_id    uuid references public.animals (id) on delete cascade,
    farm_id      uuid not null references public.farms (id) on delete cascade,
    type         text not null check (type in (
                     'HIGH_RISK', 'TEMPERATURE_ANOMALY', 'ACTIVITY_DROP',
                     'MILK_CONDUCTIVITY_HIGH', 'HERD_RISK_INCREASE', 'SENSOR_OFFLINE')),
    severity     text not null check (severity in ('LOW', 'MEDIUM', 'HIGH')),
    title        text not null,
    message      text,
    is_read      boolean not null default false,
    resolved_at  timestamptz,
    created_at   timestamptz not null default now()
);
create index idx_alerts_farm_read_created on public.alerts (farm_id, is_read, created_at desc);
create index idx_alerts_animal_id         on public.alerts (animal_id);
-- At most one open alert per animal and type; one open herd alert per farm and type.
create unique index uq_alerts_open_per_animal
    on public.alerts (animal_id, type) where resolved_at is null and animal_id is not null;
create unique index uq_alerts_open_per_farm
    on public.alerts (farm_id, type) where resolved_at is null and animal_id is null;

-- ---------------------------------------------------------- recommendations
create table public.recommendations (
    id                  uuid primary key default gen_random_uuid(),
    animal_id           uuid not null references public.animals (id) on delete cascade,
    risk_prediction_id  uuid references public.risk_predictions (id) on delete set null,
    title               text not null,
    description         text,
    priority            text not null check (priority in ('LOW', 'MEDIUM', 'HIGH')),
    created_at          timestamptz not null default now()
);
create index idx_recommendations_animal_created on public.recommendations (animal_id, created_at desc);

-- ------------------------------------------- profile auto-creation on sign-up
-- A role requested at sign-up (user_metadata.role) is honoured for non-admin roles
-- only. ADMIN can never be self-assigned; promote admins manually with SQL.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    requested text := upper(coalesce(new.raw_user_meta_data ->> 'role', ''));
begin
    insert into public.profiles (id, full_name, email, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', ''),
        new.email,
        case when requested in ('FARMER', 'VETERINARIAN', 'DAIRY_MANAGER')
             then requested else 'FARMER' end
    );
    return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
