-- Move article/destination images from temporary lh3.googleusercontent.com links
-- to Fastamor's own storage, served at https://www.fastamor.com/media/<sha1(url)[0:20]>.png
-- All 82 files were copied to the Blob store on 2026-11-23 (all PNG, 0 failures).
-- RUN ONLY AFTER the /media route is live in production.

-- 1) Backups (kept until we're sure everything renders)
create table if not exists backup_articles_images_20261123 as
  select id, featured_image, body_en, body_ar, body_fr, body_es from articles;
create table if not exists backup_destinations_images_20261123 as
  select id, image_url from destinations;

-- 2) URL mapping helper
create or replace function pg_temp.fa_media(u text) returns text language sql immutable as $$
  select 'https://www.fastamor.com/media/' || left(encode(extensions.digest(u, 'sha1'), 'hex'), 20) || '.png'
$$;

create or replace function pg_temp.fa_body(b text) returns text language plpgsql as $$
declare m text;
begin
  if b is null then return b; end if;
  for m in select distinct (regexp_matches(b, '(https://lh3\.googleusercontent\.com/[^"''\s)]+)', 'g'))[1] loop
    b := replace(b, m, pg_temp.fa_media(m));
  end loop;
  return b;
end $$;

-- 3) Rewrite
update articles set featured_image = pg_temp.fa_media(featured_image)
  where featured_image like 'https://lh3.googleusercontent.com/%';
update articles set
  body_en = pg_temp.fa_body(body_en), body_ar = pg_temp.fa_body(body_ar),
  body_fr = pg_temp.fa_body(body_fr), body_es = pg_temp.fa_body(body_es)
  where concat(body_en, body_ar, body_fr, body_es) like '%lh3.googleusercontent.com%';
update destinations set image_url = pg_temp.fa_media(image_url)
  where image_url like 'https://lh3.googleusercontent.com/%';

-- 4) Check: should return 0
select count(*) as remaining_google_images from articles
  where concat(featured_image, body_en, body_ar, body_fr, body_es) like '%lh3.googleusercontent.com%';
