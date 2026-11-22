-- Fastamor: lock down the database.
-- Run in Supabase → SQL Editor (project yvmjdtgzzjnlspcupnyo).
--
-- BEFORE running:
--   1. Authentication → Sign In / Providers → turn OFF "Allow new users to sign up".
--      (Every signed-in user is treated as an admin below.)
--   2. Authentication → Users → "Add user" → create your admin email + strong password.
--
-- Model: visitors (anon) can only READ public content and INSERT analytics events.
--        Signed-in admins (authenticated) can do everything.

-- ---------- 0. drop ALL existing policies on these tables ----------
-- Postgres policies are OR-ed: an old "allow anon all" policy would keep the door open.
do $$
declare r record;
begin
  for r in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename = any (array['articles','destinations','settings','site_settings','affiliate_links','banners','hotels','stats'])
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ---------- helper: apply the standard policy set to a table if it exists ----------
do $$
declare
  t text;
begin
  foreach t in array array['articles','destinations','settings','site_settings','affiliate_links','banners','hotels','stats']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "admin all" on public.%I', t);
      execute format('create policy "admin all" on public.%I for all to authenticated using (true) with check (true)', t);
    end if;
  end loop;
end $$;

-- ---------- public read access ----------
do $$
begin
  if to_regclass('public.articles') is not null then
    drop policy if exists "public read published" on public.articles;
    create policy "public read published" on public.articles
      for select to anon using (status = 'published');
  end if;

  if to_regclass('public.destinations') is not null then
    drop policy if exists "public read" on public.destinations;
    create policy "public read" on public.destinations for select to anon using (true);
  end if;

  if to_regclass('public.settings') is not null then
    drop policy if exists "public read" on public.settings;
    create policy "public read" on public.settings for select to anon using (true);
  end if;

  if to_regclass('public.site_settings') is not null then
    drop policy if exists "public read" on public.site_settings;
    create policy "public read" on public.site_settings for select to anon using (true);
  end if;

  if to_regclass('public.affiliate_links') is not null then
    drop policy if exists "public read" on public.affiliate_links;
    create policy "public read" on public.affiliate_links for select to anon using (true);
  end if;

  if to_regclass('public.banners') is not null then
    drop policy if exists "public read active" on public.banners;
    create policy "public read active" on public.banners for select to anon using (is_active = true);
  end if;

  if to_regclass('public.hotels') is not null then
    drop policy if exists "public read" on public.hotels;
    create policy "public read" on public.hotels for select to anon using (true);
  end if;

  -- analytics: visitors may insert small events, never read or modify them
  if to_regclass('public.stats') is not null then
    drop policy if exists "public insert events" on public.stats;
    create policy "public insert events" on public.stats
      for insert to anon
      with check (length(event) <= 64 and coalesce(pg_column_size(data), 0) < 4096);
  end if;
end $$;

-- Review the result (should show only the policies created above):
-- List what is left so you can review it (should show only the policies created above):
-- select tablename, policyname, roles, cmd from pg_policies where schemaname = 'public' order by 1,2;

-- ---------- counters without giving anon UPDATE on articles ----------
-- NOTE: if articles.id is not uuid (check: select data_type from information_schema.columns
--       where table_name='articles' and column_name='id'), replace "uuid" below with that type.
create or replace function public.increment_article_views(article_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.articles set views = coalesce(views, 0) + 1
  where id = article_id and status = 'published';
$$;

create or replace function public.increment_article_likes(article_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.articles set likes = coalesce(likes, 0) + 1
  where id = article_id and status = 'published';
$$;

revoke all on function public.increment_article_views(uuid) from public;
revoke all on function public.increment_article_likes(uuid) from public;
grant execute on function public.increment_article_views(uuid) to anon, authenticated;
grant execute on function public.increment_article_likes(uuid) to anon, authenticated;
