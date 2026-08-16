-- Execute este arquivo uma única vez no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'client' check (role in ('admin','client')),
  reservation_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.house_settings (
  id integer primary key default 1 check (id = 1),
  title text not null default 'Casa Cabana',
  address text not null default '',
  directions text not null default '',
  maps_url text not null default '',
  image_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2),
  image_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.eateries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  maps_url text not null,
  image_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, reservation_code)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'client', new.raw_user_meta_data->>'reservation_code')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.house_settings enable row level security;
alter table public.menu_items enable row level security;
alter table public.eateries enable row level security;

drop policy if exists "profile self or admin read" on public.profiles;
create policy "profile self or admin read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "admin manages profiles" on public.profiles;
create policy "admin manages profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "authenticated reads house" on public.house_settings;
drop policy if exists "public reads house" on public.house_settings;
create policy "public reads house" on public.house_settings for select to anon, authenticated using (true);
drop policy if exists "admin manages house" on public.house_settings;
create policy "admin manages house" on public.house_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "authenticated reads menu" on public.menu_items;
drop policy if exists "public reads menu" on public.menu_items;
create policy "public reads menu" on public.menu_items for select to anon, authenticated using (true);
drop policy if exists "admin manages menu" on public.menu_items;
create policy "admin manages menu" on public.menu_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "authenticated reads eateries" on public.eateries;
drop policy if exists "public reads eateries" on public.eateries;
create policy "public reads eateries" on public.eateries for select to anon, authenticated using (true);
drop policy if exists "admin manages eateries" on public.eateries;
create policy "admin manages eateries" on public.eateries for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images','site-images',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true, file_size_limit=5242880, allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "public reads site images" on storage.objects;
create policy "public reads site images" on storage.objects for select using (bucket_id = 'site-images');
drop policy if exists "admin uploads site images" on storage.objects;
create policy "admin uploads site images" on storage.objects for insert to authenticated with check (bucket_id = 'site-images' and public.is_admin());
drop policy if exists "admin updates site images" on storage.objects;
create policy "admin updates site images" on storage.objects for update to authenticated using (bucket_id = 'site-images' and public.is_admin()) with check (bucket_id = 'site-images' and public.is_admin());
drop policy if exists "admin deletes site images" on storage.objects;
create policy "admin deletes site images" on storage.objects for delete to authenticated using (bucket_id = 'site-images' and public.is_admin());

insert into public.house_settings(id) values(1) on conflict(id) do nothing;

-- Depois de criar o primeiro usuário no painel Authentication, torne-o administrador:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='SEU_EMAIL');
