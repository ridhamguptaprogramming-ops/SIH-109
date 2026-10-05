-- MastiGuard: Row Level Security, grants and Realtime publication.
--
-- Model: the browser (supabase-js, Realtime) gets READ-ONLY access, scoped to the
-- farms the user owns or belongs to (ADMIN: all). Every write goes through FastAPI,
-- which connects with a role that bypasses RLS and does its own authorization.
-- Hence there are intentionally no INSERT/UPDATE/DELETE policies, except the
-- user's own profile name.

-- ----------------------------------------------------------- helper functions
-- SECURITY DEFINER avoids recursive RLS evaluation between farms/animals/profiles.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
    select exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid()) and p.role = 'ADMIN'
    );
$$;

create or replace function public.can_access_farm(p_farm_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
    select public.is_admin()
        or exists (select 1 from public.farms f
                   where f.id = p_farm_id and f.owner_id = (select auth.uid()))
        or exists (select 1 from public.farm_members m
                   where m.farm_id = p_farm_id and m.user_id = (select auth.uid()));
$$;

create or replace function public.can_access_animal(p_animal_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
    select exists (select 1 from public.animals a
                   where a.id = p_animal_id and public.can_access_farm(a.farm_id));
$$;

-- Helpers are callable by signed-in users (needed by policies), never by anon.
revoke execute on function public.is_admin(), public.can_access_farm(uuid),
                           public.can_access_animal(uuid) from public, anon;
grant  execute on function public.is_admin(), public.can_access_farm(uuid),
                           public.can_access_animal(uuid) to authenticated;

-- ------------------------------------------------------------------- grants
-- Supabase grants broad default privileges; reset them to least privilege.
revoke all on public.profiles, public.farms, public.farm_members, public.animals,
              public.devices, public.sensor_readings, public.risk_predictions,
              public.alerts, public.recommendations
    from anon, authenticated;

grant select on public.profiles, public.farms, public.farm_members, public.animals,
                public.sensor_readings, public.risk_predictions, public.alerts,
                public.recommendations
    to authenticated;

-- Users may edit only their display name (role and email are not updatable by clients).
grant update (full_name) on public.profiles to authenticated;

-- ---------------------------------------------------------------- enable RLS
alter table public.profiles         enable row level security;
alter table public.farms            enable row level security;
alter table public.farm_members     enable row level security;
alter table public.animals          enable row level security;
alter table public.devices          enable row level security;  -- no policies = no client access
alter table public.sensor_readings  enable row level security;
alter table public.risk_predictions enable row level security;
alter table public.alerts           enable row level security;
alter table public.recommendations  enable row level security;

-- ----------------------------------------------------------------- policies
create policy profiles_select on public.profiles for select to authenticated
    using (id = (select auth.uid()) or public.is_admin());

create policy profiles_update_own on public.profiles for update to authenticated
    using (id = (select auth.uid()))
    with check (id = (select auth.uid()));

create policy farms_select on public.farms for select to authenticated
    using (public.can_access_farm(id));

create policy farm_members_select on public.farm_members for select to authenticated
    using (public.can_access_farm(farm_id));

create policy animals_select on public.animals for select to authenticated
    using (public.can_access_farm(farm_id));

create policy sensor_readings_select on public.sensor_readings for select to authenticated
    using (public.can_access_animal(animal_id));

create policy risk_predictions_select on public.risk_predictions for select to authenticated
    using (public.can_access_animal(animal_id));

create policy alerts_select on public.alerts for select to authenticated
    using (public.can_access_farm(farm_id));

create policy recommendations_select on public.recommendations for select to authenticated
    using (public.can_access_animal(animal_id));

-- ----------------------------------------------------------------- realtime
-- Realtime applies the SELECT policies above, so each user only receives events
-- for their own farms.
alter publication supabase_realtime add table
    public.sensor_readings, public.risk_predictions, public.alerts;

-- ------------------------------------------------------- how to test (SQL editor)
-- begin;
--   set local role authenticated;
--   select set_config('request.jwt.claims', '{"sub":"<user-uuid>","role":"authenticated"}', true);
--   select count(*) from public.animals;   -- only that user's farms
-- rollback;
