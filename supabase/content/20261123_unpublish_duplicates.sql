-- Run AFTER 20261123_article_upgrades.sql.
-- Duplicates now 301-redirect (vercel.json) to the upgraded articles; take them out of the sitemap.
-- comprehensive-global-travel-guide-2026 contains unverifiable statistics and a stray code snippet:
-- unpublish until it is rewritten.
begin;
update public.articles set status = 'draft'
where slug in ('traveler-health-guide-avoiding-diseases', 'customs-guide-travel', 'comprehensive-global-travel-guide-2026');
commit;
