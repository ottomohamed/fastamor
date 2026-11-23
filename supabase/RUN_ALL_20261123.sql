-- Fastamor: ALL database steps in one file. Paste into Supabase -> SQL Editor -> Run.
-- BEFORE running: Authentication -> turn OFF new sign-ups, and create your admin user.

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

-- Fastamor article upgrades, 2026-11-23
-- Rewrites title/excerpt/body (EN + AR) for 10 high-potential articles.
-- Text values use PostgreSQL dollar-quoting ($body$...$body$).
-- updated_at is NOT set below because its existence on public.articles is unconfirmed
-- (api/sitemap.js falls back when the column is missing). See the optional statement at the end.

begin;

-- morocco-magic-of-the-east
update public.articles set
  title_en = $body$Morocco Travel Guide: Best Places, Best Time, Budget and Tips$body$,
  title_ar = $body$دليل السفر إلى المغرب: أجمل الوجهات وأفضل وقت للزيارة والميزانية$body$,
  excerpt_en = $body$Plan a trip to Morocco: Marrakech, Fes, Chefchaouen and the Sahara, plus the best time to go, approximate budgets, flights and ferries from Europe, and tips.$body$,
  excerpt_ar = $body$خطط لرحلتك إلى المغرب: مراكش وفاس وشفشاون والصحراء، مع أفضل وقت للزيارة وميزانية تقريبية وطرق الوصول جواً وبحراً من أوروبا ونصائح عملية مفيدة لكل مسافر.$body$,
  body_en = $body$<p>Morocco is one of the few countries where you can watch the sun rise over Saharan dunes, drink mint tea in a medieval medina at lunchtime and fall asleep to the sound of the Atlantic, all within a few days. For first-time visitors it is an introduction to North Africa. For the Moroccan diaspora it is home, but there is always another region to discover beyond the family town. This guide covers where to go, when to travel, how much to budget and how to get there from Europe and within the country.</p>

<h2>Why Visit Morocco</h2>
<p>Morocco combines Amazigh (Berber), Arab, Andalusian, African and Mediterranean influences, and you can see that mix in its architecture, music and food. The country is compact enough for a varied one- or two-week trip, and its tourism infrastructure has expanded steadily. It now has a high-speed rail line, an extensive motorway network and a growing number of international air routes. You can travel in very different ways, from family-run riads and shared grand taxis to luxury desert camps and private drivers.</p>

<h2>Top Destinations</h2>
<h3>Marrakech</h3>
<p>Marrakech is the country's best-known city. Its medina is a UNESCO World Heritage Site, centred on Jemaa el-Fna square, which fills with food stalls, musicians and storytellers every evening. Landmarks include the Koutoubia Mosque, the Bahia Palace, the Saadian Tombs and the Majorelle Garden. Marrakech is also the usual starting point for trips to the High Atlas and the desert.</p>
<h3>Fes</h3>
<p>Fes el-Bali is one of the largest car-free urban areas in the world. Its maze of lanes holds the Al-Qarawiyyin mosque and university, founded in the 9th century, as well as the Bou Inania Madrasa and the Chouara tannery. Come to Fes for traditional crafts such as zellige tilework, brass, leather and pottery. A licensed guide saves a lot of time on the first day.</p>
<h3>Chefchaouen and the North</h3>
<p>Chefchaouen is famous for its blue-washed lanes in the Rif Mountains. It is quieter than the imperial cities and good for walking. Combine it with Tangier, a port city with a long literary history, and Tetouan, whose medina shows strong Andalusian influence.</p>
<h3>The Sahara: Merzouga and Zagora</h3>
<p>The Erg Chebbi dunes near Merzouga are the classic place for a night in a desert camp. From Marrakech it is a long drive, usually spread over two or three days via the Draa Valley, Ouarzazate and the Todra Gorge. Zagora is closer but has smaller dunes. If you have the time, Merzouga is usually worth the extra distance.</p>
<h3>The Atlantic Coast</h3>
<p>Essaouira is a relaxed, windy fishing town with a walled medina and a well-known Gnaoua music festival. Agadir and Taghazout are popular for beaches and surfing. Further north, Rabat (the capital) and Casablanca are modern cities. Casablanca's Hassan II Mosque is one of the largest mosques in Africa and one of the few in Morocco that non-Muslim visitors can enter on guided tours.</p>

<h2>Best Time to Visit Morocco</h2>
<ul>
<li><strong>Spring (March to May):</strong> generally the best overall season, with mild temperatures, green valleys and comfortable desert nights.</li>
<li><strong>Autumn (September to November):</strong> also excellent, warm but not extreme, and good for the desert and the mountains.</li>
<li><strong>Summer (June to August):</strong> very hot inland, especially in Marrakech, Fes and the desert. The coast stays cooler. It is also peak season for the diaspora, so ferries, flights and coastal towns fill up.</li>
<li><strong>Winter (December to February):</strong> sunny days but cold nights. Snow is common in the Atlas, so pack layers for desert camps.</li>
</ul>
<p>The date of Ramadan moves earlier each year. Travelling during the holy month is perfectly possible and can be very rewarding, but some restaurants close during the day and opening hours change.</p>

<h2>Getting to Morocco</h2>
<h3>By Air from Europe</h3>
<p>Morocco is well connected to Europe. The main international airports are Casablanca Mohammed V, Marrakech Menara, Agadir, Fes, Tangier, Rabat-Salé, Nador and Oujda. Royal Air Maroc and several European full-service and low-cost airlines fly from cities such as Paris, Brussels, Madrid, Barcelona, Málaga, Milan, Rome and Bologna. Flight times from southern Europe are often around 1 to 3 hours, and roughly 3 to 4 hours from Paris or Brussels, depending on the route.</p>
<h3>By Ferry from Spain, France and Italy</h3>
<p>Many families travelling with a car cross by sea. The most common routes are Algeciras to Tanger Med and Tarifa to Tangier, with shorter crossings to Ceuta and Melilla and longer routes from ports such as Almería, Sète, Barcelona and Genoa. In summer, the Marhaba operation organises the very large flow of Moroccans living abroad. Book early and check the official port and operator information before you travel.</p>

<h2>Visas and Entry</h2>
<p>Moroccan citizens enter with a Moroccan passport or national ID card, depending on the route. Citizens of many countries, including EU member states, the UK and the USA, can usually visit Morocco visa-free for short stays, often up to 90 days. Other nationalities need a visa or an electronic travel authorisation. Rules change, so always confirm on the official website of the Moroccan Ministry of Foreign Affairs or your nearest Moroccan consulate before booking. Your passport should be valid for the whole stay, and ideally for several months beyond it.</p>

<h2>Getting Around Morocco</h2>
<ul>
<li><strong>Train:</strong> ONCF runs the national network, including the Al Boraq high-speed line between Tangier, Kenitra, Rabat and Casablanca, with conventional trains on to Marrakech and Fes.</li>
<li><strong>Bus:</strong> long-distance coach companies cover most routes comfortably and at low cost.</li>
<li><strong>Grand taxis:</strong> shared intercity taxis that leave when full. You can also pay for all the seats to have the car to yourself.</li>
<li><strong>Petit taxis:</strong> city taxis. Ask for the meter or agree the fare before getting in.</li>
<li><strong>Car hire:</strong> ideal for the Atlas, the desert and the coast, but city driving and medina parking can be stressful.</li>
</ul>

<h2>Budget: How Much Does a Trip to Morocco Cost?</h2>
<p>Prices vary widely by season, city and comfort level. The figures below are <strong>approximate ranges per person per day</strong>, excluding international flights, and should be used only as a starting point:</p>
<table>
<thead><tr><th>Travel style</th><th>Approximate daily budget</th><th>What it typically includes</th></tr></thead>
<tbody>
<tr><td>Budget</td><td>about 30–50 EUR</td><td>Hostel or simple guesthouse, local food, buses and shared taxis</td></tr>
<tr><td>Mid-range</td><td>about 60–120 EUR</td><td>Comfortable riad, restaurant meals, some guided tours, trains</td></tr>
<tr><td>Comfort / luxury</td><td>150 EUR and above</td><td>Boutique riads or resorts, private drivers, premium desert camps</td></tr>
</tbody>
</table>
<p>The currency is the Moroccan dirham (MAD). It is a closed currency, so you normally get it inside Morocco, at banks, exchange offices or ATMs. Keep exchange receipts. Cards are accepted in many hotels and larger shops, but cash is still essential in souks, small cafés and taxis.</p>

<h2>Practical Tips</h2>
<ul>
<li><strong>Dress:</strong> modest clothing covering shoulders and knees is respectful, especially in medinas and rural areas.</li>
<li><strong>Bargaining:</strong> it is normal in souks. Stay friendly, decide your maximum price in advance and walk away politely if it doesn't fit.</li>
<li><strong>Unofficial guides:</strong> politely decline people who offer to "show you the way". Book licensed guides through your accommodation or official channels.</li>
<li><strong>Photography:</strong> always ask before photographing people, and expect performers in Jemaa el-Fna to ask for a tip.</li>
<li><strong>Language:</strong> Darija (Moroccan Arabic) and Amazigh are widely spoken. French is common in cities and Spanish in the north. A few words of Darija go a long way.</li>
<li><strong>Drones:</strong> bringing a drone into Morocco generally requires prior authorisation. Without it, a drone may be held at customs.</li>
</ul>

<h2>Suggested 10-Day Itinerary</h2>
<ol>
<li><strong>Days 1–3:</strong> Marrakech, covering the medina, palaces, gardens and a cooking class.</li>
<li><strong>Days 4–6:</strong> cross the High Atlas via Ouarzazate and the Dades or Todra gorges to Merzouga for a night in the dunes.</li>
<li><strong>Days 7–8:</strong> drive north through the Middle Atlas to Fes.</li>
<li><strong>Days 9–10:</strong> Chefchaouen, then a train from Tangier or Fes back to Casablanca or Rabat for your flight.</li>
</ol>

<h2>Frequently Asked Questions</h2>
<h3>Is Morocco safe for tourists?</h3>
<p>Morocco welcomes millions of visitors every year, and most trips are trouble-free. The usual concerns are petty theft, persistent touts and taxi overcharging rather than serious crime. Check your government's current travel advice before you go.</p>
<h3>How many days do I need in Morocco?</h3>
<p>Seven days is enough for Marrakech plus a short desert trip. Ten to fourteen days lets you add Fes, Chefchaouen and the coast without rushing.</p>
<h3>Can I use euros in Morocco?</h3>
<p>Some tourist businesses accept euros, but usually at a poor rate. Pay in dirhams, which you can withdraw from local ATMs or exchange at official bureaux.</p>
<h3>Is Morocco good for families?</h3>
<p>Yes. Children are warmly welcomed, and beaches, desert camps and camel rides are popular with families. Plan shorter driving days and avoid inland cities in the heat of midsummer.</p>
<h3>Do I need a guide in the medina?</h3>
<p>Not strictly, but a licensed guide is very helpful in Fes on your first day. In Marrakech many visitors explore on their own with an offline map.</p>

<h2>Plan Your Morocco Trip with Fastamor</h2>
<p>Whether you are visiting family in the summer or discovering the Sahara for the first time, the <strong>Fastamor AI assistant</strong> can help you compare flights and ferries, choose your route and build a day-by-day itinerary that suits your budget. Tell it your dates and interests and start planning your Moroccan journey today.</p>$body$,
  body_ar = $body$<p>في المغرب يمكنك أن تشاهد شروق الشمس على كثبان الصحراء، ثم تشرب كأس شاي بالنعناع في مدينة عتيقة وقت الظهيرة، وتنام في المساء على صوت أمواج الأطلسي، وكل ذلك في أيام قليلة. والمغرب لكثير من الزوار أول تعارف مع شمال إفريقيا. أما لأبناء الجالية المغربية في الخارج فهو الوطن، ومع ذلك تبقى فيه مناطق كثيرة تنتظر الاكتشاف بعيداً عن مدينة العائلة. في هذا الدليل نعرض أبرز الوجهات، وأنسب أوقات السفر، والميزانية التقريبية، وطرق الوصول من أوروبا والتنقل داخل البلاد.</p>

<h2>لماذا تزور المغرب؟</h2>
<p>تلتقي في المغرب الثقافة الأمازيغية والعربية والأندلسية والإفريقية والمتوسطية، ويظهر هذا التنوع في العمارة والموسيقى والمطبخ. والبلد قريب المسافات نسبياً، فرحلة من أسبوع أو أسبوعين تكفي لرؤية وجوه متعددة منه. وقد تطورت بنيته السياحية كثيراً في السنوات الأخيرة، فصار فيه قطار فائق السرعة وشبكة طرق سيارة واسعة وخطوط جوية دولية كثيرة. ويمكنك أن تسافر فيه بأساليب مختلفة جداً، من الرياض العائلية البسيطة وسيارات الأجرة الكبيرة المشتركة إلى المخيمات الصحراوية الفاخرة والسائقين الخاصين.</p>

<h2>أبرز الوجهات</h2>
<h3>مراكش</h3>
<p>مراكش أشهر مدن المغرب، ومدينتها العتيقة مدرجة في قائمة التراث العالمي لليونسكو. قلبها ساحة جامع الفنا التي تمتلئ كل مساء بالمطاعم الشعبية والموسيقيين والحكواتيين. ومن معالمها جامع الكتبية وقصر الباهية وقبور السعديين وحديقة ماجوريل. ومنها تنطلق عادة الرحلات إلى الأطلس الكبير والصحراء.</p>
<h3>فاس</h3>
<p>فاس البالي من أكبر المناطق الحضرية الخالية من السيارات في العالم. في متاهة أزقتها يقع جامع القرويين وجامعته التي تأسست في القرن التاسع الميلادي، إلى جانب المدرسة البوعنانية ودار الدباغة الشوارة. وفاس عاصمة الحرف التقليدية من زليج ونحاس وجلد وفخار. ويوفر عليك مرشد مرخّص وقتاً كثيراً في اليوم الأول.</p>
<h3>شفشاون والشمال</h3>
<p>اشتهرت شفشاون بأزقتها المصبوغة بالأزرق بين جبال الريف، وهي أهدأ من المدن الإمبراطورية ومناسبة للتجول على الأقدام. ويمكن الجمع بينها وبين طنجة، المدينة المرفئية ذات التاريخ الأدبي العريق، وتطوان التي يحمل طابع مدينتها العتيقة أثراً أندلسياً واضحاً.</p>
<h3>الصحراء: مرزوكة وزاكورة</h3>
<p>كثبان عرق الشبي قرب مرزوكة هي الوجهة الكلاسيكية لقضاء ليلة في مخيم صحراوي. والطريق إليها من مراكش طويلة، فتُقسم عادة على يومين أو ثلاثة عبر وادي درعة وورزازات ومضيق تودغى. أما زاكورة فأقرب، لكن كثبانها أصغر. فإن كان لديك وقت كافٍ فمرزوكة تستحق المسافة الإضافية في الغالب.</p>
<h3>الساحل الأطلسي</h3>
<p>الصويرة مدينة صيد هادئة تهب عليها الرياح، لها مدينة عتيقة محاطة بالأسوار ومهرجان معروف لموسيقى كناوة. ويقصد الزوار أكادير وتغازوت للشواطئ وركوب الأمواج. وإلى الشمال تقع الرباط العاصمة والدار البيضاء، وهما مدينتان عصريتان. ومسجد الحسن الثاني في الدار البيضاء من أكبر مساجد إفريقيا، ومن المساجد القليلة في المغرب التي يمكن لغير المسلمين دخولها في جولات مرشدة.</p>

<h2>أفضل وقت لزيارة المغرب</h2>
<ul>
<li><strong>الربيع (من مارس إلى مايو):</strong> أفضل المواسم عموماً، فالحرارة معتدلة والوديان خضراء وليالي الصحراء لطيفة.</li>
<li><strong>الخريف (من سبتمبر إلى نوفمبر):</strong> ممتاز أيضاً، دافئ دون إفراط، ومناسب للصحراء والجبال.</li>
<li><strong>الصيف (من يونيو إلى أغسطس):</strong> حرارة شديدة في الداخل، خصوصاً في مراكش وفاس والصحراء، بينما يبقى الساحل ألطف. وهو كذلك موسم عودة الجالية، فتمتلئ البواخر والرحلات الجوية والمدن الساحلية.</li>
<li><strong>الشتاء (من ديسمبر إلى فبراير):</strong> نهار مشمس وليالٍ باردة، والثلج شائع في الأطلس، فاحمل ملابس دافئة لليالي المخيمات.</li>
</ul>
<p>يتقدم موعد رمضان كل سنة. والسفر خلال الشهر الكريم ممكن تماماً وقد يكون تجربة غنية، لكن بعض المطاعم تغلق نهاراً وتتغير مواعيد العمل.</p>

<h2>الوصول إلى المغرب</h2>
<h3>جواً من أوروبا</h3>
<p>المغرب مرتبط جيداً بأوروبا. أهم مطاراته الدولية: محمد الخامس بالدار البيضاء، ومراكش المنارة، وأكادير، وفاس، وطنجة، والرباط سلا، والناظور، ووجدة. وتسيّر الخطوط الملكية المغربية وعدد من الشركات الأوروبية التقليدية ومنخفضة التكلفة رحلات من مدن مثل باريس وبروكسل ومدريد وبرشلونة ومالقة وميلانو وروما وبولونيا. تستغرق الرحلة غالباً من ساعة إلى ثلاث ساعات من جنوب أوروبا، ومن ثلاث إلى أربع ساعات تقريباً من باريس أو بروكسل بحسب الخط.</p>
<h3>بحراً من إسبانيا وفرنسا وإيطاليا</h3>
<p>تفضّل عائلات كثيرة السفر بسيارتها عبر البحر. أشهر الخطوط: الجزيرة الخضراء نحو طنجة المتوسط، وطريفة نحو طنجة المدينة، إضافة إلى خطوط قصيرة نحو سبتة ومليلية وخطوط أطول من موانئ مثل ألميريا وسيت وبرشلونة وجنوة. وفي الصيف تنظم عملية "مرحبا" العبور الكثيف لمغاربة العالم. احجز مبكراً وراجع المعلومات الرسمية للموانئ والشركات قبل السفر.</p>

<h2>التأشيرة وشروط الدخول</h2>
<p>يدخل المواطنون المغاربة بجواز السفر المغربي أو بطاقة التعريف الوطنية حسب المسار. ويستطيع مواطنو دول كثيرة، منها دول الاتحاد الأوروبي والمملكة المتحدة والولايات المتحدة، زيارة المغرب عادة دون تأشيرة لإقامات قصيرة تصل غالباً إلى 90 يوماً. أما جنسيات أخرى فتحتاج إلى تأشيرة أو ترخيص إلكتروني. وبما أن القواعد تتغير، تأكد دائماً من الموقع الرسمي لوزارة الشؤون الخارجية المغربية أو من أقرب قنصلية قبل الحجز. ويجب أن يكون جوازك صالحاً طوال مدة الإقامة، ويُفضَّل أن تبقى صلاحيته عدة أشهر بعدها.</p>

<h2>التنقل داخل المغرب</h2>
<ul>
<li><strong>القطار:</strong> يدير المكتب الوطني للسكك الحديدية الشبكة، وفيها خط "البراق" فائق السرعة بين طنجة والقنيطرة والرباط والدار البيضاء، ثم قطارات عادية نحو مراكش وفاس.</li>
<li><strong>الحافلات:</strong> تغطي شركات النقل الطرقي معظم الخطوط براحة وتكلفة منخفضة.</li>
<li><strong>سيارات الأجرة الكبيرة:</strong> تربط بين المدن وتنطلق عند امتلاء مقاعدها، ويمكنك أن تدفع ثمن كل المقاعد لتنفرد بالسيارة.</li>
<li><strong>سيارات الأجرة الصغيرة:</strong> للتنقل داخل المدن. اطلب تشغيل العداد أو اتفق على السعر قبل الركوب.</li>
<li><strong>استئجار سيارة:</strong> مثالي للأطلس والصحراء والساحل، لكن القيادة في المدن وإيجاد موقف قرب المدن العتيقة قد يكون مرهقاً.</li>
</ul>

<h2>الميزانية: كم تكلف رحلة إلى المغرب؟</h2>
<p>تختلف الأسعار كثيراً حسب الموسم والمدينة ومستوى الراحة. الأرقام التالية <strong>نطاقات تقريبية للشخص في اليوم</strong> دون تذاكر الطيران الدولية، وهي للاسترشاد فقط:</p>
<table>
<thead><tr><th>نمط السفر</th><th>الميزانية اليومية التقريبية</th><th>ما تشمله عادة</th></tr></thead>
<tbody>
<tr><td>اقتصادي</td><td>حوالي 30–50 يورو</td><td>نُزل أو دار ضيافة بسيطة، أكل شعبي، حافلات وسيارات أجرة مشتركة</td></tr>
<tr><td>متوسط</td><td>حوالي 60–120 يورو</td><td>رياض مريح، وجبات في المطاعم، بعض الجولات المرشدة، القطار</td></tr>
<tr><td>مريح / فاخر</td><td>150 يورو فأكثر</td><td>رياض بوتيك أو منتجعات، سائق خاص، مخيمات صحراوية راقية</td></tr>
</tbody>
</table>
<p>العملة هي الدرهم المغربي، وهو عملة غير قابلة للتحويل الحر، لذلك تحصل عليه عادة داخل المغرب من البنوك ومكاتب الصرف والصرافات الآلية. احتفظ بوصولات الصرف. تُقبل البطاقات البنكية في كثير من الفنادق والمتاجر الكبرى، لكن النقد ما زال ضرورياً في الأسواق والمقاهي الصغيرة وسيارات الأجرة.</p>

<h2>نصائح عملية</h2>
<ul>
<li><strong>اللباس:</strong> الملابس المحتشمة التي تغطي الكتفين والركبتين تعبّر عن الاحترام، خاصة في المدن العتيقة والقرى.</li>
<li><strong>المساومة:</strong> أمر عادي في الأسواق. حافظ على الود، وحدد سقفك مسبقاً، وانسحب بلطف إن لم يناسبك السعر.</li>
<li><strong>المرشدون غير الرسميين:</strong> اعتذر بلباقة لمن يعرض عليك أن "يدلك على الطريق"، واحجز مرشداً مرخصاً عبر مكان إقامتك أو القنوات الرسمية.</li>
<li><strong>التصوير:</strong> استأذن دائماً قبل تصوير الأشخاص، وتوقع أن يطلب منك فنانو جامع الفنا مقابلاً.</li>
<li><strong>اللغة:</strong> الدارجة والأمازيغية منتشرتان، والفرنسية شائعة في المدن، والإسبانية في الشمال.</li>
<li><strong>الطائرات المسيّرة:</strong> إدخال "الدرون" إلى المغرب يتطلب عموماً ترخيصاً مسبقاً، وبدونه قد تحجزه الجمارك.</li>
</ul>

<h2>برنامج مقترح لعشرة أيام</h2>
<ol>
<li><strong>الأيام 1–3:</strong> مراكش، بين المدينة العتيقة والقصور والحدائق وحصة طبخ.</li>
<li><strong>الأيام 4–6:</strong> عبور الأطلس الكبير مروراً بورزازات ومضيق دادس أو تودغى وصولاً إلى مرزوكة وليلة بين الكثبان.</li>
<li><strong>الأيام 7–8:</strong> الطريق شمالاً عبر الأطلس المتوسط إلى فاس.</li>
<li><strong>الأيام 9–10:</strong> شفشاون، ثم القطار من طنجة أو فاس عودةً إلى الدار البيضاء أو الرباط للسفر.</li>
</ol>

<h2>أسئلة شائعة</h2>
<h3>هل المغرب آمن للسياح؟</h3>
<p>يستقبل المغرب ملايين الزوار سنوياً، وتمر معظم الرحلات دون مشاكل. والمخاوف المعتادة هي السرقات البسيطة والإلحاح التجاري ورفع أسعار سيارات الأجرة، لا الجرائم الخطيرة. راجع توصيات السفر الرسمية لبلدك قبل المغادرة.</p>
<h3>كم يوماً أحتاج في المغرب؟</h3>
<p>سبعة أيام تكفي لمراكش ورحلة قصيرة إلى الصحراء. ومن عشرة إلى أربعة عشر يوماً تتيح لك إضافة فاس وشفشاون والساحل دون استعجال.</p>
<h3>هل يمكن الدفع باليورو في المغرب؟</h3>
<p>بعض الأنشطة السياحية تقبل اليورو، لكن بسعر غير مناسب غالباً. ادفع بالدرهم الذي يمكنك سحبه من الصرافات الآلية أو صرفه في المكاتب الرسمية.</p>
<h3>هل المغرب مناسب للعائلات؟</h3>
<p>نعم، فالأطفال يُستقبلون بحفاوة، والشواطئ والمخيمات الصحراوية وركوب الجمال محبوبة لدى العائلات. خطط لأيام قيادة أقصر وتجنب المدن الداخلية في ذروة الصيف.</p>
<h3>هل أحتاج إلى مرشد في المدينة العتيقة؟</h3>
<p>ليس إلزامياً، لكن المرشد المرخص مفيد جداً في فاس خلال اليوم الأول. أما في مراكش فيكتفي كثير من الزوار بخريطة تعمل دون إنترنت.</p>

<h2>خطط رحلتك إلى المغرب مع فاستامور</h2>
<p>سواء كنت عائداً لزيارة العائلة في الصيف أو تكتشف الصحراء لأول مرة، يساعدك <strong>مساعد فاستامور الذكي</strong> على مقارنة الرحلات الجوية والبحرية واختيار المسار وبناء برنامج يومي يناسب ميزانيتك. أخبره بتواريخك واهتماماتك وابدأ التخطيط لرحلتك المغربية اليوم.</p>$body$
where slug = 'morocco-magic-of-the-east';

-- moroccan-cuisine-maghreb-table
update public.articles set
  title_en = $body$Moroccan Food Guide: Dishes to Try, Where to Eat and Etiquette$body$,
  title_ar = $body$دليل المطبخ المغربي: أشهر الأطباق وأين تتذوقها وآداب المائدة$body$,
  excerpt_en = $body$Discover Moroccan cuisine: tagine, couscous, pastilla, harira and mint tea, regional specialities, table etiquette, food budgets and tips for a culinary trip.$body$,
  excerpt_ar = $body$اكتشف المطبخ المغربي: الطاجين والكسكس والبسطيلة والحريرة وأتاي، مع أطباق الجهات وآداب المائدة وميزانية الأكل ونصائح لرحلة تذوق لا تُنسى في المغرب كله.$body$,
  body_en = $body$<p>Moroccan cuisine is one of the main reasons people travel to Morocco, and one of the things the diaspora misses most. It is generous and fragrant without being fiery. It is built on slow cooking, seasonal produce and a careful balance of sweet and savoury, and centuries of Amazigh, Arab, Andalusian, Jewish-Moroccan and Sub-Saharan influence shaped it. This guide explains the dishes worth seeking out, where to eat them, how meals work in Moroccan homes and how to plan a food-focused trip.</p>

<h2>What Makes Moroccan Cuisine Unique</h2>
<p>A few principles explain most of Moroccan cooking:</p>
<ul>
<li><strong>Spice blends, not heat:</strong> cumin, ginger, turmeric, saffron, cinnamon, paprika and black pepper are used in layers. Ras el hanout is a house blend that can include many spices, and every spice merchant has their own version.</li>
<li><strong>Preserved flavours:</strong> preserved lemons, cured olives, smen (aged butter) and khlii (spiced preserved meat) add depth.</li>
<li><strong>Sweet and savoury together:</strong> dried fruit, honey, almonds and cinnamon appear alongside meat in many festive dishes.</li>
<li><strong>Slow cooking:</strong> the tagine pot and the couscoussier steamer both reward patience.</li>
<li><strong>Bread at every meal:</strong> khobz is used instead of cutlery to scoop food from a shared plate.</li>
</ul>

<h2>Dishes You Should Try</h2>
<h3>Tagine</h3>
<p>Tagine is both the conical clay pot and the stew cooked in it. Classic combinations include chicken with preserved lemon and olives, lamb or beef with prunes and almonds, kefta (spiced meatballs) with eggs and tomato, and seasonal vegetable tagines. In the south and the mountains, tagines are often cooked slowly over charcoal.</p>
<h3>Couscous</h3>
<p>Couscous is traditionally the Friday family meal, served after midday prayer. Hand-rolled semolina is steamed several times over a broth of meat and vegetables, often the well-known "seven vegetables". The sweet-savoury tfaya version, topped with caramelised onions and raisins, is a favourite for celebrations. Couscous traditions shared across the Maghreb were inscribed on UNESCO's intangible cultural heritage list in 2020 as a joint nomination by Morocco, Algeria, Tunisia and Mauritania.</p>
<h3>Pastilla (Bastila)</h3>
<p>Pastilla is a festive pie made from thin warqa pastry. The classic filling is chicken (traditionally pigeon) with eggs, almonds and spices, dusted with cinnamon and sugar. Fes is famous for it, and seafood pastilla is popular on the coast.</p>
<h3>Harira</h3>
<p>Harira is a hearty tomato, lentil and chickpea soup with herbs and a little meat. It is the soup most associated with breaking the fast in Ramadan, usually alongside dates and chebakia, a honey-coated sesame pastry.</p>
<h3>Mechoui and Tangia</h3>
<p>Mechoui is lamb roasted slowly until very tender, typical of celebrations. Tangia is a Marrakech speciality: meat sealed in a clay urn with spices and preserved lemon, then cooked for hours in the ashes of a hammam furnace.</p>
<h3>Street Food and Snacks</h3>
<ul>
<li><strong>Msemen and baghrir:</strong> layered flatbread and "thousand-hole" pancakes, eaten with honey and butter at breakfast or teatime.</li>
<li><strong>Bissara:</strong> a warming fava-bean soup with olive oil and cumin, popular on winter mornings.</li>
<li><strong>Grilled sardines and fried fish:</strong> best in coastal towns such as Essaouira, Safi and Agadir.</li>
<li><strong>Snail broth (babbouche):</strong> a Jemaa el-Fna classic for the adventurous.</li>
<li><strong>Sfenj:</strong> fresh doughnut rings, often sold early in the morning.</li>
</ul>
<h3>Mint Tea and Sweets</h3>
<p>Atay, green tea brewed with fresh mint and usually plenty of sugar, is a ritual of hospitality. It is poured from a height to create foam, and refusing it can seem cold, so accept at least one glass if you can. Typical sweets include kaab el ghazal ("gazelle horns"), ghriba cookies and sellou (or sfouf), a toasted flour, almond and sesame mix.</p>

<h2>Regional Flavours</h2>
<table>
<thead><tr><th>Region</th><th>What to look for</th></tr></thead>
<tbody>
<tr><td>Fes and Meknes</td><td>Refined city cuisine, pastilla, sweet tagines, pastries</td></tr>
<tr><td>Marrakech</td><td>Tangia, mechoui, Jemaa el-Fna food stalls</td></tr>
<tr><td>North (Tangier, Tetouan, Chefchaouen)</td><td>Andalusian-influenced dishes, goat cheese, seafood</td></tr>
<tr><td>Atlantic coast</td><td>Grilled fish, seafood pastilla, fish tagines</td></tr>
<tr><td>Souss and the south</td><td>Argan oil, amlou (argan, almond and honey spread), barley couscous</td></tr>
<tr><td>Sahara and oases</td><td>Dates, madfouna ("Berber pizza"), slow-cooked tagines</td></tr>
</tbody>
</table>

<h2>Best Time for a Food Trip to Morocco</h2>
<p>Spring and autumn are the most comfortable seasons for walking markets and joining cooking classes. Autumn is also the season for date harvests in the oases. During Ramadan, daytime eating is limited, but the evening ftour (iftar) is an unforgettable experience, and many guesthouses prepare it for guests. Eid al-Adha is a family festival centred on sacrifice and shared meals. Some businesses close for a few days, so check the dates if you are travelling then.</p>

<h2>Budget for Eating in Morocco</h2>
<p>Food is one of the best-value parts of a Moroccan trip, though prices vary by city and setting. As a <strong>rough guide only</strong>:</p>
<ul>
<li>Street snacks, bread, msemen or a bowl of bissara: often only a few dirhams to around 20 MAD.</li>
<li>A simple local meal (tagine, salad, bread, tea): roughly 50–120 MAD.</li>
<li>Mid-range restaurant or riad dinner: roughly 150–350 MAD per person.</li>
<li>High-end dining in Marrakech or Casablanca: can exceed 500 MAD per person.</li>
<li>Cooking classes: typically priced per person for half a day. Compare what is included (market visit, number of dishes, transport).</li>
</ul>

<h2>Getting There and Visas</h2>
<p>Morocco's main food cities, Marrakech, Fes, Casablanca and Tangier, all have international airports with direct flights from many European cities, and ferries link southern Spain with Tangier. Many nationalities, including EU citizens, can usually visit visa-free for short stays, but entry rules change, so check official Moroccan government sources before booking.</p>

<h2>Table Etiquette in Moroccan Homes</h2>
<ul>
<li>Wash your hands before the meal. Hosts often bring a basin and kettle to the table.</li>
<li>Eat with your right hand from the part of the shared dish in front of you.</li>
<li>Use bread to scoop food, and don't reach across to the centre, where the best pieces of meat are usually served by the host.</li>
<li>Expect to be encouraged to eat more. Saying "alhamdulillah" politely signals you are full.</li>
<li>Bringing pastries, fruit or tea sugar as a small gift is appreciated.</li>
</ul>

<h2>Halal, Vegetarian and Dietary Needs</h2>
<p>Meat served in Morocco is halal as standard. Vegetarians eat well with vegetable tagines, couscous, lentils, salads and bread, though broths may contain meat stock, so ask. Gluten-free travellers will find it harder because bread and semolina are everywhere. Learn a few key phrases in Darija or French.</p>

<h2>Bringing Moroccan Food Home</h2>
<p>Spices, argan oil, amlou, honey, tea and sweets are popular souvenirs. If you are flying back to Europe, remember that the EU strictly limits personal imports of meat and dairy from outside the EU, and fresh fruit, vegetables and plants generally require a phytosanitary certificate. Liquids such as argan oil follow airline cabin rules. Check the customs rules of your destination country before packing.</p>

<h2>Frequently Asked Questions</h2>
<h3>Is Moroccan food spicy?</h3>
<p>Generally not. It is aromatic rather than hot. Harissa or chilli is often served separately so you can add heat to taste.</p>
<h3>What is the national dish of Morocco?</h3>
<p>Couscous and tagine are both considered national dishes. Couscous is the traditional Friday meal, and tagine is eaten throughout the week.</p>
<h3>Is street food safe in Morocco?</h3>
<p>Busy stalls with fast turnover and food cooked in front of you are usually the safest choice. Drink bottled or filtered water if you have a sensitive stomach.</p>
<h3>Where is the best place to take a cooking class?</h3>
<p>Marrakech and Fes have the widest choice, and many classes include a market visit. Choose a small group and check recent reviews.</p>
<h3>Can I eat during the day in Ramadan as a visitor?</h3>
<p>Many tourist restaurants and hotels serve food during the day, but eating discreetly and not in the street is respectful.</p>

<h2>Plan a Food Journey with Fastamor</h2>
<p>From a Friday couscous with family to a cooking class in Fes or a ftour in a Marrakech riad, the <strong>Fastamor AI assistant</strong> can help you plan a trip around the flavours you love. Tell it your cities, dates and diet, and it will suggest an itinerary built around Morocco's table.</p>$body$,
  body_ar = $body$<p>المطبخ المغربي من أهم أسباب السفر إلى المغرب، ومن أكثر ما يشتاق إليه أبناء الجالية في المهجر. هو مطبخ كريم عطر دون أن يكون حارّاً، يقوم على الطهي البطيء والمنتجات الموسمية والتوازن الدقيق بين الحلو والمالح، وقد تشكّل عبر قرون من التأثيرات الأمازيغية والعربية والأندلسية واليهودية المغربية والإفريقية. يقدّم هذا الدليل أبرز الأطباق التي تستحق البحث عنها، وأين تتذوقها، وكيف تجري المائدة في البيوت المغربية، وكيف تخطط لرحلة محورها الطعام.</p>

<h2>ما الذي يميّز المطبخ المغربي؟</h2>
<p>بضعة مبادئ تفسّر معظم الطبخ المغربي:</p>
<ul>
<li><strong>توابل متدرجة لا حرارة لاذعة:</strong> الكمون والزنجبيل والكركم والزعفران والقرفة والفلفل الأحمر والأسود تُستعمل طبقة فوق طبقة. و"رأس الحانوت" خلطة قد تضم توابل كثيرة، ولكل عطّار وصفته الخاصة.</li>
<li><strong>نكهات محفوظة:</strong> الحامض المصيّر والزيتون المرقّد والسمن البلدي والخليع تمنح الأطباق عمقاً خاصاً.</li>
<li><strong>الحلو مع المالح:</strong> الفواكه المجففة والعسل واللوز والقرفة ترافق اللحم في أطباق المناسبات.</li>
<li><strong>الصبر على النار:</strong> الطاجين والكسكاس كلاهما يكافئ من يطهو على مهل.</li>
<li><strong>الخبز في كل وجبة:</strong> يحلّ الخبز محل الملعقة في الأكل من الصحن المشترك.</li>
</ul>

<h2>أطباق لا تفوّتها</h2>
<h3>الطاجين</h3>
<p>الطاجين اسم للقدر الفخارية المخروطية وللطبق الذي يُطهى فيها معاً. ومن تركيباته الكلاسيكية الدجاج بالحامض المصيّر والزيتون، ولحم الغنم أو البقر بالبرقوق واللوز، والكفتة بالبيض والطماطم، وطواجين الخضر الموسمية. وفي الجنوب والجبال يُطهى الطاجين غالباً على الفحم ببطء.</p>
<h3>الكسكس</h3>
<p>الكسكس وجبة يوم الجمعة العائلية تقليدياً بعد صلاة الظهر. تُفتل حبات السميد باليد ثم تُبخّر مرات عدة فوق مرق اللحم والخضر، والأشهر كسكس "السبع خضاري". أما كسكس التفاية بالبصل المكرمل والزبيب فمحبوب في الأفراح. وقد أُدرجت المعارف والممارسات المرتبطة بالكسكس في قائمة اليونسكو للتراث الثقافي غير المادي سنة 2020 بملف مشترك قدّمه المغرب والجزائر وتونس وموريتانيا.</p>
<h3>البسطيلة</h3>
<p>البسطيلة فطيرة احتفالية من أوراق الورقة الرقيقة، حشوتها الكلاسيكية الدجاج (والحمام تقليدياً) مع البيض واللوز والتوابل، ويُرش وجهها بالقرفة والسكر. تشتهر بها فاس، أما بسطيلة الحوت فمحبوبة في المدن الساحلية.</p>
<h3>الحريرة</h3>
<p>الحريرة حساء مغذٍّ من الطماطم والعدس والحمص والأعشاب مع قليل من اللحم، وهي أشهر ما يُفطر عليه في رمضان إلى جانب التمر والشباكية المعسّلة بالسمسم.</p>
<h3>المشوي والطنجية</h3>
<p>المشوي لحم خروف يُشوى ببطء حتى يذوب، وهو حاضر في المناسبات. أما الطنجية فاختصاص مراكشي: لحم يُحكم إغلاقه في جرة فخارية مع التوابل والحامض المصيّر، ثم يُطهى ساعات طويلة في رماد موقد الحمّام التقليدي المعروف بـ"الفرناتشي".</p>
<h3>أكلات الشارع والوجبات الخفيفة</h3>
<ul>
<li><strong>المسمن والبغرير:</strong> فطائر مورّقة و"ألف ثقب"، تؤكل بالعسل والزبدة في الفطور أو وقت الشاي.</li>
<li><strong>البيصارة:</strong> حساء الفول المجفف بزيت الزيتون والكمون، يدفئ صباحات الشتاء.</li>
<li><strong>السردين المشوي والسمك المقلي:</strong> ألذّه في المدن الساحلية كالصويرة وآسفي وأكادير.</li>
<li><strong>مرق الببوش (الحلزون):</strong> من كلاسيكيات جامع الفنا لمحبي المغامرة.</li>
<li><strong>السفنج:</strong> حلقات عجين مقلية تباع ساخنة في الصباح الباكر.</li>
</ul>
<h3>أتاي والحلويات</h3>
<p>أتاي، أي الشاي الأخضر بالنعناع الطازج والسكر في الغالب، طقس من طقوس الضيافة. يُسكب من علوّ ليصنع رغوته، ورفضه قد يبدو جفاءً، فاقبل كأساً واحدة على الأقل إن استطعت. ومن الحلويات المعروفة كعب الغزال والغريبة والسلّو (السفوف) المصنوع من الدقيق المحمّص واللوز والسمسم.</p>

<h2>نكهات الجهات</h2>
<table>
<thead><tr><th>الجهة</th><th>ما يستحق التذوق</th></tr></thead>
<tbody>
<tr><td>فاس ومكناس</td><td>مطبخ حضري راقٍ، البسطيلة، الطواجين الحلوة، الحلويات</td></tr>
<tr><td>مراكش</td><td>الطنجية، المشوي، مطاعم جامع الفنا الشعبية</td></tr>
<tr><td>الشمال (طنجة، تطوان، شفشاون)</td><td>أطباق بنفَس أندلسي، جبن الماعز، المأكولات البحرية</td></tr>
<tr><td>الساحل الأطلسي</td><td>السمك المشوي، بسطيلة الحوت، طاجين السمك</td></tr>
<tr><td>سوس والجنوب</td><td>زيت الأركان، أملو، كسكس الشعير</td></tr>
<tr><td>الصحراء والواحات</td><td>التمور، المدفونة، الطواجين المطهوة ببطء</td></tr>
</tbody>
</table>

<h2>أفضل وقت لرحلة تذوق في المغرب</h2>
<p>الربيع والخريف أنسب الفصول للتجول في الأسواق والمشاركة في حصص الطبخ، والخريف كذلك موسم جني التمور في الواحات. أما في رمضان فالأكل نهاراً محدود، لكن الفطور عند المغرب تجربة لا تُنسى، وكثير من دور الضيافة تعدّه لضيوفها. وعيد الأضحى عيد عائلي تتمحور طقوسه حول الأضحية والولائم المشتركة، وتغلق فيه بعض المحلات أياماً، فتحقق من التواريخ إن كنت مسافراً في تلك الفترة.</p>

<h2>ميزانية الأكل في المغرب</h2>
<p>الطعام من أفضل بنود الرحلة قيمةً مقابل السعر، مع اختلاف حسب المدينة ونوع المكان. على سبيل <strong>التقدير التقريبي فقط</strong>:</p>
<ul>
<li>أكلات الشارع والخبز والمسمن أو زلافة بيصارة: غالباً من دراهم معدودة إلى نحو 20 درهماً.</li>
<li>وجبة محلية بسيطة (طاجين وسلطة وخبز وشاي): ما بين 50 و120 درهماً تقريباً.</li>
<li>عشاء في مطعم متوسط أو رياض: ما بين 150 و350 درهماً للشخص تقريباً.</li>
<li>المطاعم الراقية في مراكش أو الدار البيضاء: قد تتجاوز 500 درهم للشخص.</li>
<li>حصص الطبخ: تُسعّر عادة للشخص لنصف يوم، فقارن ما تتضمنه (زيارة السوق، عدد الأطباق، النقل).</li>
</ul>

<h2>الوصول والتأشيرة</h2>
<p>لمدن الطعام الكبرى، مراكش وفاس والدار البيضاء وطنجة، مطارات دولية برحلات مباشرة من مدن أوروبية كثيرة، كما تربط البواخر جنوب إسبانيا بطنجة. ويستطيع مواطنو جنسيات عديدة، منها دول الاتحاد الأوروبي، زيارة المغرب عادة دون تأشيرة لإقامات قصيرة، لكن شروط الدخول تتغير، فراجع المصادر الحكومية المغربية الرسمية قبل الحجز.</p>

<h2>آداب المائدة في البيوت المغربية</h2>
<ul>
<li>اغسل يديك قبل الأكل، وكثيراً ما يحضر المضيف الطاس والإبريق إلى المائدة.</li>
<li>كُل بيدك اليمنى من الجهة التي أمامك في الصحن المشترك.</li>
<li>استعمل الخبز لتغرف، ولا تمد يدك إلى الوسط، فأطيب قطع اللحم يوزعها المضيف عادة بنفسه.</li>
<li>سيلحّ عليك المضيف لتأكل أكثر، وقولك "الحمد لله" بلطف إشارة إلى أنك شبعت.</li>
<li>تُقدَّر الهدية البسيطة كالحلويات أو الفاكهة أو قوالب السكر.</li>
</ul>

<h2>الحلال والنباتي والحميات الخاصة</h2>
<p>اللحم المقدم في المغرب حلال بطبيعة الحال. ويجد النباتيون خيارات جيدة كطواجين الخضر والكسكس والعدس والسلطات والخبز، مع الانتباه إلى أن بعض المرق قد يحتوي على مرق اللحم، فاسأل. أما من يتجنب الغلوتين فسيجد صعوبة أكبر لانتشار الخبز والسميد، فتعلّم بعض العبارات الأساسية بالدارجة أو الفرنسية.</p>

<h2>حمل المنتجات المغربية معك</h2>
<p>التوابل وزيت الأركان وأملو والعسل والشاي والحلويات هدايا محبوبة. وإذا كنت عائداً جواً إلى أوروبا فتذكّر أن الاتحاد الأوروبي يقيّد بشدة إدخال اللحوم ومشتقات الحليب من خارجه للاستعمال الشخصي، وأن الفواكه والخضر والنباتات الطازجة تتطلب عموماً شهادة صحة نباتية. وتخضع السوائل كزيت الأركان لقواعد مقصورة الطائرة. تحقق من قواعد جمارك بلد الوصول قبل حزم الأمتعة.</p>

<h2>أسئلة شائعة</h2>
<h3>هل الأكل المغربي حار؟</h3>
<p>ليس في الغالب، فهو عطِر أكثر منه لاذع، وكثيراً ما تُقدَّم الهريسة أو الفلفل الحار جانباً لمن يريد.</p>
<h3>ما هو الطبق الوطني في المغرب؟</h3>
<p>يُعدّ الكسكس والطاجين كلاهما طبقين وطنيين، فالكسكس وجبة الجمعة التقليدية، والطاجين حاضر طوال الأسبوع.</p>
<h3>هل أكل الشارع آمن في المغرب؟</h3>
<p>الأكشاك المزدحمة ذات الإقبال السريع والطعام الذي يُطهى أمامك هي الخيار الأسلم عادة. واشرب الماء المعبأ أو المصفّى إن كانت معدتك حساسة.</p>
<h3>أين أفضل مكان لحصة طبخ؟</h3>
<p>في مراكش وفاس أوسع الخيارات، وكثير منها يشمل زيارة السوق. اختر مجموعة صغيرة وراجع التقييمات الحديثة.</p>
<h3>هل يمكنني الأكل نهاراً في رمضان بصفتي زائراً؟</h3>
<p>تقدّم كثير من المطاعم السياحية والفنادق الطعام نهاراً، لكن الأكل بتحفّظ وبعيداً عن الشارع من باب الاحترام.</p>

<h2>خطط رحلة تذوق مع فاستامور</h2>
<p>من كسكس الجمعة مع العائلة إلى حصة طبخ في فاس أو فطور رمضاني في رياض مراكشي، يساعدك <strong>مساعد فاستامور الذكي</strong> على تخطيط رحلة تدور حول النكهات التي تحبها. أخبره بالمدن والتواريخ ونظامك الغذائي، وسيقترح عليك برنامجاً مبنياً على المائدة المغربية.</p>$body$
where slug = 'moroccan-cuisine-maghreb-table';

-- spain-mediterranean-treasure
update public.articles set
  title_en = $body$Spain Travel Guide: Andalusia, Madrid, Barcelona and Ferry Tips$body$,
  title_ar = $body$دليل السفر إلى إسبانيا: الأندلس ومدريد وبرشلونة والعبور بالباخرة$body$,
  excerpt_en = $body$Plan your trip to Spain: the Alhambra, Córdoba, Seville, Madrid and Barcelona, the best time to go, budgets, ferries and flights from Morocco, and visa basics.$body$,
  excerpt_ar = $body$خطط لرحلتك إلى إسبانيا: قصر الحمراء وقرطبة وإشبيلية ومدريد وبرشلونة، مع أفضل وقت للسفر والميزانية والبواخر والرحلات من المغرب وأساسيات تأشيرة شنغن.$body$,
  body_en = $body$<p>Spain is the closest European country to Morocco, at its narrowest point only about 14 kilometres across the Strait of Gibraltar, and for many travellers from the Maghreb it feels familiar. Arabic place names, Andalusian architecture, orange trees in the courtyards and a long tradition of late, sociable meals connect the two shores. This guide covers the regions worth visiting, the best time to go, budgets, how to get there from Morocco and other European cities, and the entry rules you should check before you travel.</p>

<h2>Why Visit Spain</h2>
<p>Spain offers great variety within one country. You can explore the Islamic heritage of Al-Andalus, the art museums of Madrid, Gaudí's Barcelona, the Mediterranean beaches of Valencia and the Costa del Sol, and the green north of Galicia and the Basque Country. Its high-speed rail network makes it easy to combine several cities in one trip, and Spain consistently ranks among the world's most-visited countries.</p>

<h2>Andalusia: The Heritage of Al-Andalus</h2>
<h3>Granada and the Alhambra</h3>
<p>The Alhambra, the palace-fortress of the Nasrid dynasty, is the highlight of many trips to Spain. Its Nasrid Palaces, the Court of the Lions and the Generalife gardens are UNESCO-listed alongside the Albaicín, Granada's old Moorish quarter, which climbs the hill opposite. Tickets are limited and timed and often sell out weeks ahead in high season, so book only through the official channel as early as you can.</p>
<h3>Córdoba</h3>
<p>The Mosque-Cathedral of Córdoba, with its forest of red-and-white arches, is one of the most important monuments of Islamic architecture in Europe. Spend time in the historic centre, the old Jewish quarter and, in May, the flower-filled patios during the city's patio festival.</p>
<h3>Seville</h3>
<p>Seville combines the Real Alcázar, a royal palace built largely in the Mudéjar style, the cathedral and its Giralda tower, which was originally a minaret, and the riverside Triana district, known for flamenco and ceramics. Spring brings Holy Week processions and the April Fair, and both are crowded, so book well ahead.</p>
<h3>Málaga and the Costa del Sol</h3>
<p>Málaga is a lively city with an airport well connected to Morocco and the rest of Europe. It has a Moorish fortress (the Alcazaba), good museums and easy access to beach towns along the coast. It also makes a convenient base for day trips to Ronda or Granada.</p>

<h2>Beyond Andalusia</h2>
<h3>Madrid</h3>
<p>Spain's capital is known for its art museums, especially the Prado, the Reina Sofía and the Thyssen-Bornemisza, as well as the Royal Palace, Retiro Park and a food scene that runs late into the night. Toledo and Segovia are both easy day trips by train.</p>
<h3>Barcelona</h3>
<p>Barcelona combines Gaudí's architecture, including the Sagrada Família, Park Güell, Casa Batlló and Casa Milà, with a Gothic old town and a city beach. It is very popular, so book major sights in advance, and watch your belongings in crowded areas and on the metro.</p>
<h3>Valencia and the North</h3>
<p>Valencia is the home of paella and has a futuristic City of Arts and Sciences. In the north, San Sebastián and Bilbao are known for food and modern architecture, while Santiago de Compostela marks the end of the famous pilgrimage route.</p>

<h2>Best Time to Visit Spain</h2>
<ul>
<li><strong>Spring (March to May):</strong> ideal for Andalusia, with flowers, festivals and comfortable temperatures.</li>
<li><strong>Summer (June to August):</strong> beach season. Inland cities such as Seville, Córdoba and Madrid can be extremely hot, so plan sightseeing for early morning and evening.</li>
<li><strong>Autumn (September to November):</strong> warm sea, fewer crowds and pleasant city weather, which makes it one of the best all-round periods.</li>
<li><strong>Winter (December to February):</strong> mild in the south and good value outside the holidays, with snow in the Sierra Nevada and the Pyrenees.</li>
</ul>

<h2>Getting to Spain</h2>
<h3>From Morocco</h3>
<ul>
<li><strong>By ferry:</strong> the main routes are Tanger Med to Algeciras and Tangier Ville to Tarifa, with crossings often around one to one and a half hours depending on route and operator. There are also routes to Almería, Motril and Málaga from Nador, Al Hoceima or Tangier, depending on the season.</li>
<li><strong>By air:</strong> direct flights link Casablanca, Marrakech, Tangier, Fes, Agadir, Rabat and Nador with cities such as Madrid, Barcelona, Málaga, Seville and Valencia. Route availability changes by season.</li>
</ul>
<h3>From Other European Cities</h3>
<p>Spain is one of Europe's best-connected countries, with frequent flights from France, Belgium, Italy, the Netherlands, Germany and the UK. From France you can also take the train. High-speed services link Paris and southern French cities with Barcelona, and you can continue to Madrid on Spain's high-speed network.</p>

<h2>Visas and Entry Requirements</h2>
<p>Spain is part of the Schengen Area.</p>
<ul>
<li><strong>Moroccan passport holders</strong> generally need a Schengen short-stay visa, unless they hold a valid residence permit from a Schengen country. Apply through the Spanish consulate or its official visa service provider, ideally well before your travel dates. You will typically need proof of accommodation, return travel, funds and travel medical insurance.</li>
<li><strong>EU/EEA citizens</strong> travel with a passport or national ID card.</li>
<li><strong>Other visa-exempt nationalities</strong> are subject to Schengen short-stay limits, and the EU's new digital border systems (the Entry/Exit System and, later, the ETIAS travel authorisation) are being introduced in stages.</li>
</ul>
<p>Requirements and processing times change, so always check the official website of the Spanish Ministry of Foreign Affairs, your local Spanish consulate and the EU's official travel portals before booking.</p>

<h2>Budget: How Much Does Spain Cost?</h2>
<p>Spain is generally more affordable than France, the UK or Switzerland, but costs rise sharply in summer and in Barcelona, Madrid and coastal resorts. As an <strong>approximate guide per person per day</strong>, excluding flights:</p>
<table>
<thead><tr><th>Style</th><th>Approximate daily budget</th></tr></thead>
<tbody>
<tr><td>Budget (hostels, menú del día, public transport)</td><td>about 60–90 EUR</td></tr>
<tr><td>Mid-range (3-star hotel, restaurant meals, a few paid sights)</td><td>about 120–200 EUR</td></tr>
<tr><td>Comfort (4–5 star hotels, guided tours, taxis)</td><td>250 EUR and above</td></tr>
</tbody>
</table>
<p>Look for the <strong>menú del día</strong>, a fixed-price lunch menu offered by many restaurants on weekdays, which is often the best-value meal of the day. Some regions and cities also charge a tourist tax on accommodation.</p>

<h2>Halal Food and Muslim-Friendly Travel</h2>
<p>Halal restaurants are easy to find in Granada (especially around the Albaicín), Madrid, Barcelona, Málaga and Valencia, and in towns with large Moroccan communities. Granada's Albaicín, for example, has many tea houses and North African restaurants. Spanish menus often include pork (cerdo) and ham (jamón), so ask about ingredients. Seafood, grilled fish, vegetable dishes and many tapas are good alternatives. There are mosques in all the major cities.</p>

<h2>Practical Tips</h2>
<ul>
<li><strong>Meal times:</strong> lunch is often served from around 2 pm and dinner from 8:30 or 9 pm, later than in Morocco or northern Europe.</li>
<li><strong>Trains:</strong> book high-speed trains early for lower fares. Several operators compete on major routes.</li>
<li><strong>Pickpockets:</strong> be vigilant in tourist areas of Barcelona and Madrid, especially on public transport.</li>
<li><strong>Siesta hours:</strong> smaller shops may close in the early afternoon, especially in the south.</li>
<li><strong>Language:</strong> Spanish is spoken everywhere, with Catalan, Basque and Galician in their regions. Many Moroccans from the north will find their Spanish very useful.</li>
</ul>

<h2>Frequently Asked Questions</h2>
<h3>How long is the ferry from Morocco to Spain?</h3>
<p>The Tarifa–Tangier and Algeciras–Tanger Med crossings are among the shortest, often around one to one and a half hours, though schedules, weather and border formalities affect total journey time.</p>
<h3>Do I need to book the Alhambra in advance?</h3>
<p>Yes. Daily entries are limited, so book through the official Alhambra ticketing website as early as possible, especially for spring and summer.</p>
<h3>Which is better for a first trip: Andalusia, Madrid or Barcelona?</h3>
<p>For travellers interested in Islamic heritage, Andalusia (Granada, Córdoba, Seville) is the natural choice. Barcelona suits architecture and beach lovers, and Madrid suits museum lovers.</p>
<h3>Can I drive my car from Morocco to Spain?</h3>
<p>Yes, many travellers take their car on the ferry. You will need valid vehicle documents and insurance that covers the countries you will drive in. Check the requirements with your insurer and the ferry operator.</p>
<h3>Is Spain expensive compared to Morocco?</h3>
<p>Yes, most daily costs are noticeably higher than in Morocco, but Spain is often cheaper than many other Western European destinations.</p>

<h2>Plan Your Spain Trip with Fastamor</h2>
<p>From an Andalusian route through Granada, Córdoba and Seville to a city break in Barcelona, the <strong>Fastamor AI assistant</strong> can help you compare ferries and flights, plan train connections and build an itinerary that matches your budget. Share your dates and interests and let Fastamor plan your Spanish journey.</p>$body$,
  body_ar = $body$<p>إسبانيا أقرب بلد أوروبي إلى المغرب، إذ لا يفصل بينهما في أضيق نقطة من مضيق جبل طارق سوى نحو 14 كيلومتراً. ولهذا يشعر كثير من المسافرين المغاربيين فيها بشيء من الألفة: أسماء أماكن ذات أصل عربي، وعمارة أندلسية، وأشجار برتقال في الصحون، وتقليد عريق في الوجبات المتأخرة والسهر مع الأهل والأصدقاء. يعرض هذا الدليل أبرز المناطق، وأنسب أوقات الزيارة، والميزانية، وطرق الوصول من المغرب ومن المدن الأوروبية، وشروط الدخول التي ينبغي التحقق منها قبل السفر.</p>

<h2>لماذا تزور إسبانيا؟</h2>
<p>تقدّم إسبانيا تنوعاً كبيراً داخل بلد واحد. يمكنك أن تكتشف إرث الأندلس الإسلامي، ومتاحف الفن في مدريد، وبرشلونة غاودي، وشواطئ بلنسية وكوستا ديل سول المتوسطية، والشمال الأخضر في غاليسيا وبلاد الباسك. وتسهّل شبكة القطارات فائقة السرعة الجمع بين عدة مدن في رحلة واحدة، وتبقى إسبانيا باستمرار ضمن أكثر دول العالم استقبالاً للزوار.</p>

<h2>الأندلس: على خطى الحضارة الأندلسية</h2>
<h3>غرناطة وقصر الحمراء</h3>
<p>قصر الحمراء، القلعة والقصر الذي شيّده بنو نصر، هو ذروة رحلات كثيرة إلى إسبانيا. قصوره النصرية وبهو السباع وحدائق جنة العريف مدرجة في قائمة اليونسكو إلى جانب حي البيازين، الحي العربي القديم الذي يصعد التلة المقابلة. التذاكر محدودة ومرتبطة بمواعيد دخول، وكثيراً ما تنفد قبل أسابيع في الموسم المرتفع، فاحجز عبر القناة الرسمية وحدها وفي أبكر وقت ممكن.</p>
<h3>قرطبة</h3>
<p>مسجد قرطبة الكبير، المعروف اليوم بالمسجد الكاتدرائية، بغابة أقواسه الحمراء والبيضاء، من أهم معالم العمارة الإسلامية في أوروبا. خصص وقتاً للمركز التاريخي والحي اليهودي القديم، وفي مايو لأفنية البيوت المزهرة خلال مهرجان الأفنية.</p>
<h3>إشبيلية</h3>
<p>تجمع إشبيلية بين قصر "ريال ألكازار" المبني في معظمه على الطراز المدجّن، والكاتدرائية وبرجها "الخيرالدا" الذي كان في الأصل مئذنة، وحي تريانا على ضفة النهر المعروف بالفلامنكو والخزف. وفي الربيع تشهد المدينة مواكب الأسبوع المقدس ومعرض أبريل، وكلاهما يعرف ازدحاماً كبيراً، فاحجز مبكراً.</p>
<h3>مالقة وكوستا ديل سول</h3>
<p>مالقة مدينة نابضة بالحياة، مطارها مرتبط جيداً بالمغرب وبباقي أوروبا، وفيها قلعة القصبة ومتاحف جيدة ووصول سهل إلى المدن الشاطئية على الساحل. وهي قاعدة مناسبة لرحلات يومية إلى رندة أو غرناطة.</p>

<h2>ما وراء الأندلس</h2>
<h3>مدريد</h3>
<p>العاصمة معروفة بمتاحفها الفنية، وأشهرها البرادو والملكة صوفيا وتيسن بورنيميسا، إلى جانب القصر الملكي وحديقة الريتيرو ومشهد مطاعم يمتد إلى ساعات متأخرة من الليل. وطليطلة وشقوبية رحلتان يوميتان سهلتان بالقطار.</p>
<h3>برشلونة</h3>
<p>تجمع برشلونة بين عمارة غاودي، ومنها كنيسة ساغرادا فاميليا وحديقة غويل وكاسا باتلو وكاسا ميلا، وبين حي قوطي عتيق وشاطئ داخل المدينة. ولأنها شديدة الإقبال، احجز المعالم الكبرى مسبقاً وانتبه لأغراضك في الأماكن المزدحمة والمترو.</p>
<h3>بلنسية والشمال</h3>
<p>بلنسية موطن طبق "الباييا"، وفيها مدينة الفنون والعلوم ذات الطابع المستقبلي. أما في الشمال فتشتهر سان سيباستيان وبلباو بالمطبخ والعمارة الحديثة، وتشكّل سانتياغو دي كومبوستيلا نهاية طريق الحج الشهير.</p>

<h2>أفضل وقت لزيارة إسبانيا</h2>
<ul>
<li><strong>الربيع (من مارس إلى مايو):</strong> مثالي للأندلس بزهوره ومهرجاناته وحرارته المعتدلة.</li>
<li><strong>الصيف (من يونيو إلى أغسطس):</strong> موسم الشواطئ، لكن المدن الداخلية مثل إشبيلية وقرطبة ومدريد قد تكون شديدة الحرارة، فاجعل زياراتك في الصباح الباكر والمساء.</li>
<li><strong>الخريف (من سبتمبر إلى نوفمبر):</strong> بحر دافئ وازدحام أقل وطقس لطيف في المدن، وهو من أفضل الفترات إجمالاً.</li>
<li><strong>الشتاء (من ديسمبر إلى فبراير):</strong> معتدل في الجنوب وأسعاره مناسبة خارج العطل، مع ثلوج في سييرا نيفادا وجبال البرانس.</li>
</ul>

<h2>الوصول إلى إسبانيا</h2>
<h3>من المغرب</h3>
<ul>
<li><strong>بحراً:</strong> أهم الخطوط من طنجة المتوسط إلى الجزيرة الخضراء ومن طنجة المدينة إلى طريفة، ويستغرق العبور غالباً بين ساعة وساعة ونصف حسب الخط والشركة. وتوجد كذلك خطوط نحو ألميريا وموتريل ومالقة من الناظور أو الحسيمة أو طنجة حسب الموسم.</li>
<li><strong>جواً:</strong> رحلات مباشرة تربط الدار البيضاء ومراكش وطنجة وفاس وأكادير والرباط والناظور بمدن مثل مدريد وبرشلونة ومالقة وإشبيلية وبلنسية، مع تغيّر الخطوط المتاحة حسب الموسم.</li>
</ul>
<h3>من المدن الأوروبية الأخرى</h3>
<p>إسبانيا من أكثر بلدان أوروبا ارتباطاً جوياً، برحلات متكررة من فرنسا وبلجيكا وإيطاليا وهولندا وألمانيا والمملكة المتحدة. ومن فرنسا يمكنك السفر بالقطار أيضاً، إذ تربط قطارات فائقة السرعة باريس ومدن الجنوب الفرنسي ببرشلونة، ومنها تواصل إلى مدريد عبر الشبكة الإسبانية.</p>

<h2>التأشيرة وشروط الدخول</h2>
<p>إسبانيا جزء من فضاء شنغن.</p>
<ul>
<li><strong>حاملو الجواز المغربي</strong> يحتاجون عموماً إلى تأشيرة شنغن قصيرة الإقامة، ما لم تكن لديهم بطاقة إقامة سارية في إحدى دول شنغن. يُقدَّم الطلب لدى القنصلية الإسبانية أو مزوّد خدمات التأشيرة المعتمد لديها، ويُفضَّل قبل موعد السفر بوقت كافٍ. وتُطلب عادة إثباتات السكن وتذكرة العودة والموارد المالية وتأمين السفر الطبي.</li>
<li><strong>مواطنو الاتحاد الأوروبي والمنطقة الاقتصادية الأوروبية</strong> يسافرون بجواز السفر أو بطاقة الهوية الوطنية.</li>
<li><strong>الجنسيات الأخرى المعفاة من التأشيرة</strong> تخضع لحدود الإقامة القصيرة في شنغن، ويجري تطبيق الأنظمة الرقمية الأوروبية الجديدة على الحدود، أي نظام الدخول والخروج ثم ترخيص السفر "إتياس" لاحقاً، على مراحل.</li>
</ul>
<p>تتغير المتطلبات ومدد المعالجة، فراجع دائماً موقع وزارة الخارجية الإسبانية والقنصلية الإسبانية المختصة والبوابات الأوروبية الرسمية قبل الحجز.</p>

<h2>الميزانية: كم تكلف إسبانيا؟</h2>
<p>إسبانيا أقل تكلفة عموماً من فرنسا أو المملكة المتحدة أو سويسرا، لكن الأسعار ترتفع كثيراً في الصيف وفي برشلونة ومدريد والمنتجعات الساحلية. وهذه <strong>تقديرات تقريبية للشخص في اليوم</strong> دون تذاكر الطيران:</p>
<table>
<thead><tr><th>نمط السفر</th><th>الميزانية اليومية التقريبية</th></tr></thead>
<tbody>
<tr><td>اقتصادي (نُزل، "منيو ديل ديا"، نقل عمومي)</td><td>حوالي 60–90 يورو</td></tr>
<tr><td>متوسط (فندق 3 نجوم، وجبات في المطاعم، بعض المعالم المدفوعة)</td><td>حوالي 120–200 يورو</td></tr>
<tr><td>مريح (فنادق 4–5 نجوم، جولات مرشدة، سيارات أجرة)</td><td>250 يورو فأكثر</td></tr>
</tbody>
</table>
<p>ابحث عن <strong>"منيو ديل ديا"</strong>، وهي قائمة غداء بسعر ثابت تقدمها مطاعم كثيرة في أيام الأسبوع، وكثيراً ما تكون أفضل وجبة من حيث السعر. وتفرض بعض الجهات والمدن كذلك ضريبة سياحية على الإقامة.</p>

<h2>الأكل الحلال والسفر المناسب للمسلمين</h2>
<p>يسهل العثور على مطاعم حلال في غرناطة، خصوصاً حول البيازين، وفي مدريد وبرشلونة ومالقة وبلنسية، وفي المدن التي تضم جاليات مغربية كبيرة. ففي البيازين مثلاً مقاهٍ كثيرة للشاي ومطاعم مغاربية. وتتضمن القوائم الإسبانية كثيراً لحم الخنزير ("ثيردو") و"الخامون"، فاسأل عن المكونات. والمأكولات البحرية والسمك المشوي وأطباق الخضر وكثير من "التاباس" بدائل جيدة. وتوجد مساجد في كل المدن الكبرى.</p>

<h2>نصائح عملية</h2>
<ul>
<li><strong>مواعيد الأكل:</strong> الغداء يبدأ غالباً من الثانية ظهراً، والعشاء من الثامنة والنصف أو التاسعة مساءً، وهي مواعيد متأخرة مقارنة بالمغرب وشمال أوروبا.</li>
<li><strong>القطارات:</strong> احجز القطارات فائقة السرعة مبكراً للحصول على أسعار أقل، فعدة شركات تتنافس على الخطوط الرئيسية.</li>
<li><strong>النشّالون:</strong> كن يقظاً في المناطق السياحية في برشلونة ومدريد، خاصة في وسائل النقل العمومي.</li>
<li><strong>ساعات القيلولة:</strong> قد تغلق المحلات الصغيرة بعد الظهر، لا سيما في الجنوب.</li>
<li><strong>اللغة:</strong> الإسبانية منتشرة في كل مكان، مع الكتالونية والباسكية والغاليسية في مناطقها، وسيجد كثير من أبناء الشمال المغربي إسبانيتهم مفيدة جداً.</li>
</ul>

<h2>أسئلة شائعة</h2>
<h3>كم يستغرق العبور بالباخرة من المغرب إلى إسبانيا؟</h3>
<p>خطّا طريفة–طنجة والجزيرة الخضراء–طنجة المتوسط من أقصر الخطوط، وغالباً ما يستغرق العبور بين ساعة وساعة ونصف، مع أن المواعيد والطقس وإجراءات الحدود تؤثر في المدة الإجمالية.</p>
<h3>هل يجب حجز قصر الحمراء مسبقاً؟</h3>
<p>نعم، فعدد الزوار اليومي محدود، فاحجز عبر موقع التذاكر الرسمي للحمراء في أبكر وقت، خاصة في الربيع والصيف.</p>
<h3>ما الأفضل لأول رحلة: الأندلس أم مدريد أم برشلونة؟</h3>
<p>لمن يهتم بالتراث الإسلامي، الأندلس (غرناطة وقرطبة وإشبيلية) هي الخيار الطبيعي. أما برشلونة فتناسب محبي العمارة والشاطئ، ومدريد تناسب عشاق المتاحف.</p>
<h3>هل يمكنني السفر بسيارتي من المغرب إلى إسبانيا؟</h3>
<p>نعم، يأخذ كثير من المسافرين سياراتهم على الباخرة. ستحتاج إلى وثائق سارية للسيارة وتأمين يغطي البلدان التي ستقود فيها، فتحقق من المتطلبات لدى شركة التأمين وشركة النقل البحري.</p>
<h3>هل إسبانيا غالية مقارنة بالمغرب؟</h3>
<p>نعم، معظم المصاريف اليومية أعلى بشكل ملحوظ مما هي في المغرب، لكن إسبانيا كثيراً ما تكون أرخص من وجهات أخرى في أوروبا الغربية.</p>

<h2>خطط رحلتك إلى إسبانيا مع فاستامور</h2>
<p>من مسار أندلسي بين غرناطة وقرطبة وإشبيلية إلى عطلة قصيرة في برشلونة، يساعدك <strong>مساعد فاستامور الذكي</strong> على مقارنة البواخر والرحلات الجوية، وتنظيم الربط بين القطارات، وبناء برنامج يناسب ميزانيتك. شاركه تواريخك واهتماماتك ودع فاستامور يخطط لرحلتك الإسبانية.</p>$body$
where slug = 'spain-mediterranean-treasure';

-- portugal-travel-guide
update public.articles set
  title_en = $body$Portugal Travel Guide: Lisbon, Porto, Sintra and the Algarve$body$,
  title_ar = $body$دليل السفر إلى البرتغال: لشبونة وبورتو وسنترا والغارف بالتفصيل$body$,
  excerpt_en = $body$Plan a trip to Portugal: Lisbon, Sintra, Porto and the Algarve, with the best time to visit, rough budgets, flights from Morocco, halal food and visa tips.$body$,
  excerpt_ar = $body$خطط لرحلتك إلى البرتغال: لشبونة وسنترا وبورتو والغارف، مع أفضل وقت للزيارة وميزانية تقريبية والرحلات من المغرب والأكل الحلال ونصائح التأشيرة والتنقل.$body$,
  body_en = $body$<p>Portugal has become one of Europe's favourite destinations, and it is easy to see why. It has Atlantic beaches, hilltop cities, tiled façades, excellent seafood and a relaxed pace of life, all in a country you can cross by car in a day. It is also close to Morocco, with short direct flights, and shares a long history with North Africa that you can still see in its castles, place names and food. This guide covers where to go, when to travel, budgets, getting there and entry rules.</p>

<h2>Why Visit Portugal</h2>
<p>Portugal is compact, safe by European standards and good value compared with many Western European countries. You can combine a city break in Lisbon or Porto with fairy-tale palaces in Sintra, wine country in the Douro Valley and the beaches of the Algarve, all in one trip. For travellers from the Maghreb, the Islamic past of the region known as Al-Gharb al-Andalus adds an extra layer of interest. The name "Algarve" itself comes from the Arabic word for "the west".</p>

<h2>Top Destinations in Portugal</h2>
<h3>Lisbon</h3>
<p>The capital spreads over steep hills above the Tagus estuary. Wander the Alfama, the oldest district, whose winding lanes date back to the Moorish period, and climb to São Jorge Castle for views. Ride the historic Tram 28 early in the day before it gets crowded. In Belém you'll find the Jerónimos Monastery, Belém Tower and the Monument to the Discoveries. Lisbon also has lively viewpoints (miradouros), riverside promenades and a growing food scene.</p>
<h3>Sintra</h3>
<p>Sintra, a UNESCO-listed cultural landscape about 40 minutes from Lisbon by train, is a hillside town full of palaces and gardens. Highlights include the colourful Pena Palace, the Moorish Castle (Castelo dos Mouros) with its walls snaking along the ridge, and the gardens of Quinta da Regaleira. Arrive early and buy tickets in advance in high season.</p>
<h3>Porto and the Douro Valley</h3>
<p>Porto, Portugal's second city, is known for its Ribeira riverside, the Dom Luís I bridge, tiled churches and the port-wine lodges across the river in Vila Nova de Gaia. Upstream, the Douro Valley's terraced vineyards are among the most beautiful landscapes in Europe and can be seen by train, boat or road.</p>
<h3>The Algarve</h3>
<p>Portugal's southern coast has golden cliffs, sea caves and sandy coves around Lagos, Albufeira and Tavira. It is also home to Silves, once an important city of Al-Andalus, whose red sandstone castle still dominates the town. Mértola, inland near the Spanish border, preserves a church that was originally a mosque.</p>
<h3>Évora and the Alentejo</h3>
<p>The Alentejo is a quieter region of rolling plains, cork oaks and whitewashed villages. Évora, its historic capital, is UNESCO-listed and has a Roman temple, a cathedral and well-preserved medieval walls.</p>

<h2>Best Time to Visit Portugal</h2>
<ul>
<li><strong>Spring (March to May):</strong> mild, green and less crowded, which makes it a great time for cities and hiking.</li>
<li><strong>Summer (June to August):</strong> peak season for the Algarve beaches. The Atlantic stays cool, and Lisbon and Porto are busy and more expensive.</li>
<li><strong>Autumn (September to October):</strong> warm days, harvest season in the Douro and fewer tourists, which makes it one of the best times overall.</li>
<li><strong>Winter (November to February):</strong> rainy in the north, mild in the south and good value for city breaks.</li>
</ul>

<h2>Getting to Portugal</h2>
<h3>From Morocco</h3>
<p>Direct flights link Casablanca with Lisbon, and depending on the season there are other routes from cities such as Marrakech, Agadir and Tangier to Lisbon, Porto or Faro. Flights from Casablanca to Lisbon usually take around 1.5 to 2 hours. There is no direct ferry between Morocco and Portugal, but you can cross the Strait to southern Spain and drive west to the Algarve.</p>
<h3>From Other European Cities</h3>
<p>Lisbon, Porto and Faro airports are well served from France, Belgium, Spain, Italy, Switzerland, Germany and the UK, by both full-service and low-cost airlines. Porto and Lisbon are especially popular with travellers from France, and there is a large Portuguese community in France.</p>

<h2>Visas and Entry</h2>
<p>Portugal is a member of the EU and the Schengen Area. Moroccan passport holders generally need a Schengen short-stay visa unless they hold a valid Schengen residence permit. Apply through the Portuguese consulate or its official visa centre and allow plenty of time. EU/EEA citizens can travel with an ID card or passport. Other nationalities follow Schengen short-stay rules, and the EU is introducing digital border systems, the Entry/Exit System and ETIAS, in stages. Always confirm the latest requirements on official Portuguese and EU government websites before booking.</p>

<h2>Getting Around</h2>
<ul>
<li><strong>Trains:</strong> the national rail company links Lisbon, Coimbra, Porto and the Algarve, and suburban trains go to Sintra and Cascais.</li>
<li><strong>Metro and trams:</strong> Lisbon and Porto both have metro systems. In Lisbon a rechargeable transport card covers the metro, buses, trams and suburban trains.</li>
<li><strong>Buses:</strong> long-distance buses are comfortable and often cheaper than trains.</li>
<li><strong>Car hire:</strong> useful for the Algarve, the Alentejo and the Douro. Many motorways have electronic tolls, so ask the rental company about a toll device.</li>
</ul>

<h2>Budget: How Much Does Portugal Cost?</h2>
<p>Portugal is still considered affordable by Western European standards, though prices in Lisbon and Porto have risen in recent years. As an <strong>approximate guide per person per day</strong>, excluding flights:</p>
<table>
<thead><tr><th>Travel style</th><th>Approximate daily budget</th></tr></thead>
<tbody>
<tr><td>Budget</td><td>about 55–85 EUR</td></tr>
<tr><td>Mid-range</td><td>about 110–180 EUR</td></tr>
<tr><td>Comfort</td><td>220 EUR and above</td></tr>
</tbody>
</table>
<p>Lisbon, Porto and some other municipalities charge a small tourist tax per night of accommodation. A <strong>prato do dia</strong> (dish of the day) at a local tasca is often the best-value lunch.</p>

<h2>Food and Halal Options</h2>
<p>Portuguese cuisine is built around fish and seafood: grilled sardines, bacalhau (salt cod) cooked in countless ways, octopus and seafood rice. Don't miss the pastel de nata, a custard tart. Many traditional dishes include pork, so ask before ordering. Halal restaurants are found mainly in Lisbon, especially around Martim Moniz and the area near the Central Mosque of Lisbon. In Porto and the Algarve the choice is smaller, and grilled fish is a reliable option everywhere.</p>

<h2>Practical Tips</h2>
<ul>
<li><strong>Comfortable shoes:</strong> Lisbon and Porto are hilly, and the traditional calçada (stone pavement) can be slippery.</li>
<li><strong>Couvert:</strong> bread, olives and starters placed on your table are usually charged if you eat them. You can politely send them back.</li>
<li><strong>Language:</strong> Portuguese is the official language. English is widely spoken in tourist areas, and Spanish speakers will understand some written Portuguese.</li>
<li><strong>Sun and sea:</strong> the Atlantic can have strong currents, so swim at supervised beaches and respect the flags.</li>
</ul>

<h2>Suggested 7-Day Itinerary</h2>
<ol>
<li><strong>Days 1–3:</strong> Lisbon, covering Alfama, Baixa, Belém and the viewpoints.</li>
<li><strong>Day 4:</strong> a day trip to Sintra, with an optional sunset in Cascais.</li>
<li><strong>Days 5–7:</strong> train to Porto, then the Ribeira and a day trip to the Douro Valley. Alternatively, head south to the Algarve for beaches and Silves.</li>
</ol>

<h2>Frequently Asked Questions</h2>
<h3>Is Portugal expensive?</h3>
<p>It is usually cheaper than France, the UK or the Netherlands, but more expensive than Morocco. Costs are highest in Lisbon and in the Algarve in summer.</p>
<h3>Lisbon or Porto for a first visit?</h3>
<p>Lisbon offers more variety and easy day trips to Sintra and Cascais. Porto is smaller, very atmospheric and close to the Douro Valley. With a week you can enjoy both.</p>
<h3>How many days do I need in Portugal?</h3>
<p>Four to five days cover Lisbon and Sintra. A week or more lets you add Porto or the Algarve.</p>
<h3>Can I see Islamic heritage in Portugal?</h3>
<p>Yes. Look for the Moorish Castle in Sintra, São Jorge Castle and Alfama in Lisbon, Silves in the Algarve and Mértola in the Alentejo.</p>
<h3>Is it easy to find halal food?</h3>
<p>In Lisbon, yes, especially in central neighbourhoods. Elsewhere, choose seafood and vegetarian dishes or prepare a short list of halal restaurants before you go.</p>

<h2>Plan Your Portugal Trip with Fastamor</h2>
<p>Whether you want a long weekend in Lisbon or a full route from Porto to the Algarve, the <strong>Fastamor AI assistant</strong> can help you find flights from Morocco or Europe, organise trains and day trips, and build an itinerary around your budget. Tell Fastamor your dates and start planning today.</p>$body$,
  body_ar = $body$<p>صارت البرتغال من أحب الوجهات الأوروبية إلى المسافرين، ولا عجب في ذلك، ففيها شواطئ أطلسية ومدن على التلال وواجهات مكسوة بالزليج، ومأكولات بحرية ممتازة وإيقاع حياة هادئ، وكل ذلك في بلد يمكن عبوره بالسيارة في يوم واحد. وهي قريبة من المغرب برحلات جوية مباشرة قصيرة، وتجمعها بشمال إفريقيا صفحات طويلة من التاريخ ما زالت آثارها ظاهرة في القلاع وأسماء الأماكن والمطبخ. يتناول هذا الدليل أبرز الوجهات، وأنسب أوقات السفر، والميزانية، وطرق الوصول، وشروط الدخول.</p>

<h2>لماذا تزور البرتغال؟</h2>
<p>البرتغال بلد صغير المساحة، آمن بالمعايير الأوروبية، وأسعاره مناسبة مقارنة بكثير من بلدان أوروبا الغربية. يمكنك أن تجمع في رحلة واحدة بين عطلة في لشبونة أو بورتو، وقصور سنترا التي تشبه الحكايات، وكروم وادي دورو، وشواطئ الغارف. وللمسافر المغاربي، يضيف الماضي الإسلامي لهذه المنطقة التي عُرفت باسم "غرب الأندلس" بُعداً خاصاً للرحلة، بل إن اسم "الغارف" نفسه مشتق من الكلمة العربية "الغرب".</p>

<h2>أبرز الوجهات في البرتغال</h2>
<h3>لشبونة</h3>
<p>تمتد العاصمة على تلال شديدة الانحدار فوق مصب نهر تاجه. تجوّل في حي ألفاما، أقدم أحيائها، الذي تعود أزقته المتعرجة إلى العهد الإسلامي، واصعد إلى قلعة ساو جورجي لترى المدينة من علٍ. اركب الترام التاريخي رقم 28 في الصباح الباكر قبل الزحام. وفي حي بيليم تجد دير جيرونيموس وبرج بيليم ونصب الاكتشافات. وفي لشبونة أيضاً شرفات مطلة حيوية، وممشى على ضفة النهر، ومشهد مطاعم آخذ في التوسع.</p>
<h3>سنترا</h3>
<p>سنترا بلدة على سفح جبلي مليئة بالقصور والحدائق، ومشهدها الثقافي مدرج في قائمة اليونسكو، وتبعد عن لشبونة نحو 40 دقيقة بالقطار. من أبرز معالمها قصر بينا الملوّن، وقلعة المور التي تمتد أسوارها على طول القمة، وحدائق "كينتا دا ريغاليرا". احضر مبكراً واشترِ التذاكر مسبقاً في الموسم المرتفع.</p>
<h3>بورتو ووادي دورو</h3>
<p>بورتو، ثانية مدن البرتغال، معروفة بضفة ريبيرا وجسر دوم لويس الأول وكنائسها المكسوة بالزليج، وبمخازن نبيذ بورتو في فيلا نوفا دي غايا على الضفة المقابلة. وإلى أعلى النهر تُعدّ مدرجات الكروم في وادي دورو من أجمل المناظر الطبيعية في أوروبا، ويمكن اكتشافها بالقطار أو القارب أو السيارة.</p>
<h3>الغارف</h3>
<p>يتميز الساحل الجنوبي بجروف ذهبية وكهوف بحرية وخلجان رملية حول لاغوس وألبوفيرا وتافيرا. وفيه أيضاً شلب (سيلفش)، التي كانت مدينة مهمة في الأندلس، وما زالت قلعتها من الحجر الرملي الأحمر تشرف على البلدة. أما ميرتولة في الداخل قرب الحدود الإسبانية فتحتفظ بكنيسة كانت في الأصل مسجداً.</p>
<h3>إيفورا والألنتيجو</h3>
<p>الألنتيجو منطقة هادئة من السهول المتموجة وأشجار البلوط الفليني والقرى البيضاء. وعاصمتها التاريخية إيفورا مدرجة في قائمة اليونسكو، وفيها معبد روماني وكاتدرائية وأسوار من العصور الوسطى في حالة جيدة.</p>

<h2>أفضل وقت لزيارة البرتغال</h2>
<ul>
<li><strong>الربيع (من مارس إلى مايو):</strong> معتدل وأخضر وأقل ازدحاماً، فهو وقت رائع للمدن والمشي في الطبيعة.</li>
<li><strong>الصيف (من يونيو إلى أغسطس):</strong> ذروة موسم شواطئ الغارف. يبقى المحيط بارداً نسبياً، وتزدحم لشبونة وبورتو وترتفع أسعارهما.</li>
<li><strong>الخريف (سبتمبر وأكتوبر):</strong> نهار دافئ وموسم القطاف في دورو وسياح أقل، فهو من أفضل الأوقات إجمالاً.</li>
<li><strong>الشتاء (من نوفمبر إلى فبراير):</strong> ممطر في الشمال ومعتدل في الجنوب، ومناسب للعطل القصيرة في المدن بأسعار جيدة.</li>
</ul>

<h2>الوصول إلى البرتغال</h2>
<h3>من المغرب</h3>
<p>توجد رحلات مباشرة بين الدار البيضاء ولشبونة، وحسب الموسم تتوفر خطوط أخرى من مدن مثل مراكش وأكادير وطنجة نحو لشبونة أو بورتو أو فارو. وتستغرق الرحلة من الدار البيضاء إلى لشبونة عادة ما بين ساعة ونصف وساعتين. لا يوجد خط بحري مباشر بين المغرب والبرتغال، لكن يمكنك عبور المضيق إلى جنوب إسبانيا ثم القيادة غرباً نحو الغارف.</p>
<h3>من المدن الأوروبية الأخرى</h3>
<p>مطارات لشبونة وبورتو وفارو مخدومة جيداً من فرنسا وبلجيكا وإسبانيا وإيطاليا وسويسرا وألمانيا والمملكة المتحدة، بشركات تقليدية ومنخفضة التكلفة. وتحظى بورتو ولشبونة بإقبال خاص من المسافرين القادمين من فرنسا، حيث تعيش جالية برتغالية كبيرة.</p>

<h2>التأشيرة وشروط الدخول</h2>
<p>البرتغال عضو في الاتحاد الأوروبي وفضاء شنغن. ويحتاج حاملو الجواز المغربي عموماً إلى تأشيرة شنغن قصيرة الإقامة ما لم تكن لديهم إقامة سارية في دولة من دول شنغن، ويُقدَّم الطلب عبر القنصلية البرتغالية أو مركز التأشيرات المعتمد لديها مع ترك وقت كافٍ. ويسافر مواطنو الاتحاد الأوروبي والمنطقة الاقتصادية الأوروبية ببطاقة الهوية أو الجواز. أما الجنسيات الأخرى فتخضع لقواعد الإقامة القصيرة في شنغن، ويعمل الاتحاد الأوروبي على تطبيق أنظمة حدودية رقمية، هي نظام الدخول والخروج وترخيص "إتياس"، على مراحل. تحقق دائماً من آخر المتطلبات على المواقع الحكومية البرتغالية والأوروبية الرسمية قبل الحجز.</p>

<h2>التنقل داخل البرتغال</h2>
<ul>
<li><strong>القطارات:</strong> تربط شركة السكك الحديدية الوطنية لشبونة وكويمبرا وبورتو والغارف، وتصل قطارات الضواحي إلى سنترا وكاشكايش.</li>
<li><strong>المترو والترام:</strong> في لشبونة وبورتو شبكات مترو، وفي لشبونة بطاقة نقل قابلة للشحن تشمل المترو والحافلات والترام وقطارات الضواحي.</li>
<li><strong>الحافلات:</strong> حافلات المسافات الطويلة مريحة وأرخص من القطار في الغالب.</li>
<li><strong>استئجار سيارة:</strong> مفيد للغارف والألنتيجو ودورو. وفي كثير من الطرق السيارة رسوم مرور إلكترونية، فاسأل شركة التأجير عن جهاز الأداء.</li>
</ul>

<h2>الميزانية: كم تكلف البرتغال؟</h2>
<p>ما زالت البرتغال تُعد وجهة معقولة التكلفة بمعايير أوروبا الغربية، وإن ارتفعت الأسعار في لشبونة وبورتو خلال السنوات الأخيرة. وهذه <strong>تقديرات تقريبية للشخص في اليوم</strong> دون الطيران:</p>
<table>
<thead><tr><th>نمط السفر</th><th>الميزانية اليومية التقريبية</th></tr></thead>
<tbody>
<tr><td>اقتصادي</td><td>حوالي 55–85 يورو</td></tr>
<tr><td>متوسط</td><td>حوالي 110–180 يورو</td></tr>
<tr><td>مريح</td><td>220 يورو فأكثر</td></tr>
</tbody>
</table>
<p>تفرض لشبونة وبورتو وبلديات أخرى ضريبة سياحية صغيرة عن كل ليلة إقامة. وكثيراً ما يكون "طبق اليوم" في المطاعم الشعبية الصغيرة أفضل غداء من حيث السعر.</p>

<h2>الأكل وخيارات الحلال</h2>
<p>يقوم المطبخ البرتغالي على السمك والمأكولات البحرية: السردين المشوي، والقُدّ المملح (باكالاو) بطرق لا تُحصى، والأخطبوط، وأرز المأكولات البحرية. ولا تفوّت "باستيل دي ناتا"، فطيرة الكاسترد الشهيرة. وتتضمن أطباق تقليدية كثيرة لحم الخنزير، فاسأل قبل الطلب. توجد المطاعم الحلال أساساً في لشبونة، خصوصاً حول ساحة مارتيم مونيز وقرب المسجد المركزي في لشبونة، أما في بورتو والغارف فالخيارات أقل، ويبقى السمك المشوي خياراً مضموناً في كل مكان.</p>

<h2>نصائح عملية</h2>
<ul>
<li><strong>أحذية مريحة:</strong> لشبونة وبورتو مدينتان جبليتان، والرصيف الحجري التقليدي قد يكون زلقاً.</li>
<li><strong>المقبلات على الطاولة:</strong> الخبز والزيتون والمقبلات التي توضع أمامك تُحتسب عادة إن أكلت منها، ويمكنك إعادتها بلطف.</li>
<li><strong>اللغة:</strong> البرتغالية هي اللغة الرسمية، والإنجليزية منتشرة في المناطق السياحية، ومن يتقن الإسبانية سيفهم بعض البرتغالية المكتوبة.</li>
<li><strong>الشمس والبحر:</strong> قد تكون تيارات الأطلسي قوية، فاسبح في الشواطئ المحروسة واحترم الأعلام.</li>
</ul>

<h2>برنامج مقترح لسبعة أيام</h2>
<ol>
<li><strong>الأيام 1–3:</strong> لشبونة، بين ألفاما وبايشا وبيليم والشرفات المطلة.</li>
<li><strong>اليوم 4:</strong> رحلة يومية إلى سنترا، مع غروب اختياري في كاشكايش.</li>
<li><strong>الأيام 5–7:</strong> القطار إلى بورتو، ثم ضفة ريبيرا ورحلة يومية إلى وادي دورو، أو التوجه جنوباً إلى الغارف للشواطئ ومدينة شلب.</li>
</ol>

<h2>أسئلة شائعة</h2>
<h3>هل البرتغال غالية؟</h3>
<p>هي في العادة أرخص من فرنسا أو المملكة المتحدة أو هولندا، لكنها أغلى من المغرب. وتبلغ التكاليف ذروتها في لشبونة وفي الغارف صيفاً.</p>
<h3>لشبونة أم بورتو لأول زيارة؟</h3>
<p>لشبونة أكثر تنوعاً وتتيح رحلات يومية سهلة إلى سنترا وكاشكايش، أما بورتو فأصغر وأجواؤها ساحرة وقريبة من وادي دورو. وفي أسبوع يمكنك الاستمتاع بالاثنتين.</p>
<h3>كم يوماً أحتاج في البرتغال؟</h3>
<p>أربعة إلى خمسة أيام تكفي للشبونة وسنترا، وأسبوع أو أكثر يتيح إضافة بورتو أو الغارف.</p>
<h3>هل يمكن رؤية التراث الإسلامي في البرتغال؟</h3>
<p>نعم، ابحث عن قلعة المور في سنترا، وقلعة ساو جورجي وحي ألفاما في لشبونة، ومدينة شلب في الغارف، وميرتولة في الألنتيجو.</p>
<h3>هل من السهل العثور على أكل حلال؟</h3>
<p>في لشبونة نعم، خاصة في الأحياء المركزية. أما في غيرها فاختر المأكولات البحرية والأطباق النباتية، أو أعدّ قائمة قصيرة بالمطاعم الحلال قبل السفر.</p>

<h2>خطط رحلتك إلى البرتغال مع فاستامور</h2>
<p>سواء أردت عطلة نهاية أسبوع طويلة في لشبونة أو مساراً كاملاً من بورتو إلى الغارف، يساعدك <strong>مساعد فاستامور الذكي</strong> على إيجاد رحلات من المغرب أو أوروبا، وتنظيم القطارات والرحلات اليومية، وبناء برنامج يراعي ميزانيتك. أخبر فاستامور بتواريخك وابدأ التخطيط اليوم.</p>$body$
where slug = 'portugal-travel-guide';

-- italy-travel-guide
update public.articles set
  title_en = $body$Italy Travel Guide: Rome, Florence, Venice and Sicily Made Easy$body$,
  title_ar = $body$دليل السفر إلى إيطاليا: روما وفلورنسا والبندقية وصقلية بسهولة$body$,
  excerpt_en = $body$Plan your trip to Italy: Rome, Florence, Venice, Milan, Naples and Sicily, with the best time to go, budgets, flights from Morocco, trains and visa basics.$body$,
  excerpt_ar = $body$خطط لرحلتك إلى إيطاليا: روما وفلورنسا والبندقية وميلانو ونابولي وصقلية، مع أفضل وقت للسفر والميزانية والرحلات من المغرب والقطارات والأكل الحلال والتأشيرة.$body$,
  body_en = $body$<p>Italy packs an extraordinary amount into one country: ancient Rome, Renaissance Florence, the canals of Venice, the fashion of Milan, the coastline around Naples and the Arab-Norman monuments of Sicily. It is also one of the European countries with a large Moroccan community, and it is well connected to Morocco by air. This guide will help you choose where to go, decide when to travel, estimate a budget and prepare for entry requirements.</p>

<h2>Why Visit Italy</h2>
<p>Italy has more UNESCO World Heritage Sites than almost any other country. It is equally rewarding for history, art, food, coastline and mountains. Distances between the main cities are short, and fast trains link Milan, Florence, Rome and Naples in just a few hours. That makes it easy to see several regions in one trip, even on your first visit.</p>

<h2>Top Destinations in Italy</h2>
<h3>Rome</h3>
<p>The "Eternal City" is an open-air museum. Visit the Colosseum, the Roman Forum and the Palatine Hill on one day, and spend another on the Pantheon, Piazza Navona and the Trevi Fountain. Vatican City, a separate state inside Rome, is home to St Peter's Basilica, the Vatican Museums and the Sistine Chapel. Book timed tickets for the Colosseum and the Vatican Museums in advance. The Grand Mosque of Rome, one of the largest mosques in Europe, is another notable landmark.</p>
<h3>Florence and Tuscany</h3>
<p>Florence was the cradle of the Renaissance. Its highlights include the Duomo with Brunelleschi's dome, the Uffizi Gallery, Michelangelo's David at the Accademia and the Ponte Vecchio. From Florence, explore Tuscan hill towns such as Siena, San Gimignano and Lucca, or the Leaning Tower of Pisa.</p>
<h3>Venice</h3>
<p>Venice is a city built on water, with no cars. Highlights include St Mark's Square and Basilica, the Doge's Palace, the Rialto Bridge and the islands of Murano and Burano. To reduce overcrowding, Venice has introduced an access fee for day-trippers on selected peak days. Check the official city website for current dates and exemptions, including whether overnight hotel guests are exempt.</p>
<h3>Milan and the Lakes</h3>
<p>Milan is Italy's business and fashion capital, home to the Duomo, the Galleria Vittorio Emanuele II and Leonardo's Last Supper (book well ahead). Lake Como, Lake Garda and Lake Maggiore are all within easy reach. Milan's airports are also major arrival points from Morocco.</p>
<h3>Naples, Pompeii and the Amalfi Coast</h3>
<p>Naples is the birthplace of pizza and a lively, authentic city. Nearby, Pompeii and Herculaneum preserve Roman towns buried by Vesuvius in 79 CE. Further south, the Amalfi Coast and the island of Capri offer some of the most famous coastal scenery in Europe.</p>
<h3>Sicily</h3>
<p>Sicily has a deep connection to the Arab world. It was under Arab rule for over two centuries before the Norman conquest, and the Arab-Norman monuments of Palermo, Cefalù and Monreale are UNESCO-listed. Sicilian food still reflects that heritage in dishes that use couscous, citrus, almonds and saffron, particularly around Trapani.</p>

<h2>Best Time to Visit Italy</h2>
<ul>
<li><strong>Spring (April to June):</strong> pleasant temperatures and long days, the ideal season for cities and the coast, though Easter is busy.</li>
<li><strong>Summer (July to August):</strong> hot and crowded in the cities, and high season on the coast. Many Italians take holidays around mid-August.</li>
<li><strong>Autumn (September to October):</strong> warm sea, harvest season and fewer crowds, an excellent time overall.</li>
<li><strong>Winter (November to March):</strong> quieter and cheaper for cities, with skiing in the Alps and the Dolomites. It is also a good time to see museums without queues.</li>
</ul>

<h2>Getting to Italy</h2>
<h3>From Morocco</h3>
<p>There are direct flights between Moroccan airports such as Casablanca, Marrakech, Fes, Tangier, Nador and Agadir and Italian cities including Rome, Milan, Bologna, Bergamo, Turin, Venice/Treviso and Pisa, operated by Royal Air Maroc and low-cost airlines. Routes vary by season. A flight from Casablanca to Rome or Milan usually takes around three hours. There are also ferry routes between Tangier and Genoa, popular with families travelling with a car in summer.</p>
<h3>From Other European Cities</h3>
<p>Italy is very well connected by air from France, Belgium, Spain and the rest of Europe. From France, trains run from Paris and Lyon to Turin and Milan on routes through the Alps, with services that can vary due to works or disruptions.</p>

<h2>Visas and Entry</h2>
<p>Italy is a member of the EU and the Schengen Area. Moroccan passport holders generally need a Schengen short-stay visa unless they hold a valid residence permit from a Schengen state. This is common among Moroccans living in Italy, Spain, France or Belgium. Visa applications are made through the Italian consulate or its official visa provider and usually require travel medical insurance, proof of accommodation and proof of funds. EU citizens travel with an ID card or passport. The EU's Entry/Exit System and future ETIAS authorisation affect other non-EU visitors. Always verify current rules on official Italian and EU websites.</p>

<h2>Getting Around Italy</h2>
<ul>
<li><strong>High-speed trains:</strong> two competing operators run fast services between major cities. Booking early often gives much lower fares.</li>
<li><strong>Regional trains:</strong> cheaper and fixed-price, ideal for short trips. On some regional tickets you must validate the ticket before boarding.</li>
<li><strong>Car hire:</strong> great for Tuscany, Sicily and Puglia, but avoid driving into historic centres. Many have restricted traffic zones (ZTL), and entering one can lead to fines.</li>
</ul>

<h2>Budget: How Much Does Italy Cost?</h2>
<p>Costs depend heavily on the city and season, and Venice, Milan, Rome and the Amalfi Coast are the most expensive. As an <strong>approximate guide per person per day</strong>, excluding flights:</p>
<table>
<thead><tr><th>Style</th><th>Approximate daily budget</th></tr></thead>
<tbody>
<tr><td>Budget</td><td>about 70–100 EUR</td></tr>
<tr><td>Mid-range</td><td>about 130–220 EUR</td></tr>
<tr><td>Comfort</td><td>280 EUR and above</td></tr>
</tbody>
</table>
<p>Many Italian cities charge a nightly tourist tax at hotels, and some restaurants add a <strong>coperto</strong> (cover charge) per person. These are normal and usually shown on the menu or the bill.</p>

<h2>Food and Halal Options</h2>
<p>Italian food varies enormously by region: fresh pasta in Emilia-Romagna, pizza in Naples, risotto in Lombardy, seafood along the coasts and arancini in Sicily. Many dishes are naturally vegetarian or seafood-based. However, cured meats such as prosciutto and guanciale, and sometimes wine, appear in sauces, so ask. Halal butchers and restaurants are found in the big cities, especially Rome, Milan, Turin and Bologna, often run by North African or Middle Eastern communities.</p>

<h2>Practical Tips</h2>
<ul>
<li><strong>Dress codes:</strong> churches and St Peter's Basilica require covered shoulders and knees.</li>
<li><strong>Coffee culture:</strong> a coffee drunk standing at the bar is often cheaper than one served at a table.</li>
<li><strong>Water:</strong> public drinking fountains are common in Rome and many other cities, so bring a refillable bottle.</li>
<li><strong>Pickpockets:</strong> be careful on crowded buses, at major sights and in railway stations.</li>
<li><strong>Opening hours:</strong> smaller shops may close in the early afternoon, and many museums close one day a week.</li>
</ul>

<h2>Frequently Asked Questions</h2>
<h3>How many days do I need in Italy?</h3>
<p>For a first visit, 7 to 10 days lets you see Rome, Florence and Venice comfortably. Add a few extra days for Naples and the Amalfi Coast or for Sicily.</p>
<h3>Is Italy expensive?</h3>
<p>Italy is mid-to-high priced for Europe. You can keep costs down by staying outside historic centres, eating at local trattorias and booking trains early.</p>
<h3>Do I need to book the Vatican Museums in advance?</h3>
<p>It is strongly recommended. Book timed tickets on the official Vatican Museums website to avoid long queues.</p>
<h3>Is it easy to travel to Italy from Morocco?</h3>
<p>Yes. There are many direct flights from several Moroccan cities, especially to northern Italy, and a ferry connection between Tangier and Genoa.</p>
<h3>Where can I see Arab heritage in Italy?</h3>
<p>Sicily, especially Palermo, with its Arab-Norman palaces and churches, its markets and its cuisine. Trapani is known for its fish couscous.</p>

<h2>Plan Your Italy Trip with Fastamor</h2>
<p>From the Colosseum to the canals of Venice and the markets of Palermo, the <strong>Fastamor AI assistant</strong> can help you find flights from Morocco or your European city, plan train routes between cities and build an itinerary that fits your budget. Tell Fastamor your dates and start planning your Italian journey.</p>$body$,
  body_ar = $body$<p>تجمع إيطاليا في بلد واحد قدراً استثنائياً من الكنوز: روما القديمة، وفلورنسا عصر النهضة، وقنوات البندقية، وأناقة ميلانو، وسواحل نابولي، والمعالم العربية النورماندية في صقلية. وهي كذلك من الدول الأوروبية التي تحتضن جالية مغربية كبيرة، وترتبط بالمغرب برحلات جوية كثيرة. سيساعدك هذا الدليل على اختيار وجهتك، وتحديد وقت السفر، وتقدير الميزانية، والاستعداد لشروط الدخول.</p>

<h2>لماذا تزور إيطاليا؟</h2>
<p>تضم إيطاليا من مواقع التراث العالمي لليونسكو أكثر مما يضمه أي بلد آخر تقريباً، وهي غنية بالقدر نفسه لعشاق التاريخ والفن والطعام والسواحل والجبال. والمسافات بين المدن الكبرى قصيرة، فالقطارات السريعة تربط ميلانو وفلورنسا وروما ونابولي في ساعات قليلة، مما يجعل رؤية عدة مناطق في رحلة واحدة أمراً سهلاً حتى في الزيارة الأولى.</p>

<h2>أبرز الوجهات في إيطاليا</h2>
<h3>روما</h3>
<p>"المدينة الخالدة" متحف مفتوح. خصص يوماً للكولوسيوم والمنتدى الروماني وتلة بالاتين، ويوماً آخر للبانثيون وساحة نافونا ونافورة تريفي. ودولة الفاتيكان المستقلة داخل روما تضم كاتدرائية القديس بطرس ومتاحف الفاتيكان وكنيسة سيستينا. احجز تذاكر الكولوسيوم ومتاحف الفاتيكان المحددة بمواعيد مسبقاً. ومن المعالم اللافتة أيضاً المسجد الكبير في روما، وهو من أكبر المساجد في أوروبا.</p>
<h3>فلورنسا وتوسكانا</h3>
<p>فلورنسا مهد عصر النهضة. من أبرز معالمها الكاتدرائية وقبتها التي صممها برونليسكي، ومعرض أوفيزي، وتمثال داود لمايكل أنجلو في الأكاديمية، وجسر بونتي فيكيو. ومنها تنطلق لاكتشاف بلدات توسكانا الجبلية مثل سيينا وسان جيمينيانو ولوكا، أو برج بيزا المائل.</p>
<h3>البندقية</h3>
<p>البندقية مدينة مبنية على الماء بلا سيارات. من معالمها ساحة القديس مرقس وكاتدرائيتها، وقصر الدوجي، وجسر ريالتو، وجزيرتا مورانو وبورانو. وللحد من الازدحام، فرضت البلدية رسوم دخول على زوار اليوم الواحد في أيام ذروة محددة، فراجع الموقع الرسمي للمدينة لمعرفة التواريخ الحالية والإعفاءات، ومنها ما إذا كان نزلاء الفنادق معفيين.</p>
<h3>ميلانو والبحيرات</h3>
<p>ميلانو عاصمة إيطاليا الاقتصادية وعاصمة الموضة، وفيها الكاتدرائية ورواق فيتوريو إيمانويلي الثاني ولوحة "العشاء الأخير" لليوناردو، واحجزها قبل وقت طويل. وتقع بحيرات كومو وغاردا وماجوري على مسافة قريبة. ومطارات ميلانو من أهم نقاط الوصول من المغرب.</p>
<h3>نابولي وبومبي وساحل أمالفي</h3>
<p>نابولي مدينة حيوية أصيلة وموطن البيتزا. وبالقرب منها بومبي وهركولانيوم، مدينتان رومانيتان طمرهما بركان فيزوف سنة 79 للميلاد. وإلى الجنوب يقدّم ساحل أمالفي وجزيرة كابري بعضاً من أشهر المناظر الساحلية في أوروبا.</p>
<h3>صقلية</h3>
<p>لصقلية صلة عميقة بالعالم العربي، فقد خضعت للحكم العربي أكثر من قرنين قبل الفتح النورماندي، والمعالم العربية النورماندية في باليرمو وتشيفالو ومونريالي مدرجة في قائمة اليونسكو. وما زال المطبخ الصقلي يحمل أثر هذا الإرث في أطباق تستعمل الكسكس والحمضيات واللوز والزعفران، ولا سيما حول طرابنش (تراباني).</p>

<h2>أفضل وقت لزيارة إيطاليا</h2>
<ul>
<li><strong>الربيع (من أبريل إلى يونيو):</strong> حرارة لطيفة ونهار طويل، وهو الموسم المثالي للمدن والسواحل، مع ازدحام في فترة عيد الفصح.</li>
<li><strong>الصيف (يوليو وأغسطس):</strong> حرّ وزحام في المدن، وموسم مرتفع في السواحل، ويأخذ كثير من الإيطاليين عطلهم في منتصف أغسطس.</li>
<li><strong>الخريف (سبتمبر وأكتوبر):</strong> بحر دافئ وموسم قطاف وازدحام أقل، فهو وقت ممتاز إجمالاً.</li>
<li><strong>الشتاء (من نوفمبر إلى مارس):</strong> أهدأ وأرخص للمدن، مع التزلج في جبال الألب والدولوميت، وهو وقت مناسب لزيارة المتاحف دون طوابير.</li>
</ul>

<h2>الوصول إلى إيطاليا</h2>
<h3>من المغرب</h3>
<p>تربط رحلات مباشرة مطارات مغربية مثل الدار البيضاء ومراكش وفاس وطنجة والناظور وأكادير بمدن إيطالية منها روما وميلانو وبولونيا وبيرغامو وتورينو والبندقية/تريفيزو وبيزا، تسيّرها الخطوط الملكية المغربية وشركات منخفضة التكلفة، وتختلف الخطوط حسب الموسم. وتستغرق الرحلة من الدار البيضاء إلى روما أو ميلانو نحو ثلاث ساعات عادة. وتوجد كذلك خطوط بحرية بين طنجة وجنوة، تحظى بإقبال العائلات المسافرة بسياراتها صيفاً.</p>
<h3>من المدن الأوروبية الأخرى</h3>
<p>إيطاليا مرتبطة جوياً بشكل ممتاز بفرنسا وبلجيكا وإسبانيا وباقي أوروبا. ومن فرنسا تسير قطارات من باريس وليون نحو تورينو وميلانو عبر جبال الألب، وقد تتغير الخدمات بسبب الأشغال أو الاضطرابات.</p>

<h2>التأشيرة وشروط الدخول</h2>
<p>إيطاليا عضو في الاتحاد الأوروبي وفضاء شنغن. ويحتاج حاملو الجواز المغربي عموماً إلى تأشيرة شنغن قصيرة الإقامة ما لم تكن لديهم إقامة سارية في إحدى دول شنغن، وهذا حال كثير من المغاربة المقيمين في إيطاليا أو إسبانيا أو فرنسا أو بلجيكا. تُقدَّم طلبات التأشيرة لدى القنصلية الإيطالية أو مزوّد خدماتها المعتمد، وتتطلب عادة تأميناً طبياً للسفر وإثبات السكن والموارد المالية. ويسافر مواطنو الاتحاد الأوروبي ببطاقة الهوية أو الجواز، بينما يشمل نظام الدخول والخروج الأوروبي وترخيص "إتياس" المرتقب زواراً آخرين من خارج الاتحاد. تحقق دائماً من القواعد الحالية على المواقع الإيطالية والأوروبية الرسمية.</p>

<h2>التنقل داخل إيطاليا</h2>
<ul>
<li><strong>القطارات فائقة السرعة:</strong> شركتان متنافستان تسيّران رحلات سريعة بين المدن الكبرى، والحجز المبكر يمنحك غالباً أسعاراً أقل بكثير.</li>
<li><strong>القطارات الإقليمية:</strong> أرخص وبأسعار ثابتة، ومثالية للمسافات القصيرة. وفي بعض التذاكر الإقليمية يجب ختم التذكرة قبل الصعود.</li>
<li><strong>استئجار سيارة:</strong> رائع لتوسكانا وصقلية وبوليا، لكن تجنب القيادة داخل المراكز التاريخية، ففي كثير منها مناطق مرور محدودة قد يؤدي دخولها إلى غرامات.</li>
</ul>

<h2>الميزانية: كم تكلف إيطاليا؟</h2>
<p>تعتمد التكاليف كثيراً على المدينة والموسم، والبندقية وميلانو وروما وساحل أمالفي أغلاها. وهذه <strong>تقديرات تقريبية للشخص في اليوم</strong> دون الطيران:</p>
<table>
<thead><tr><th>نمط السفر</th><th>الميزانية اليومية التقريبية</th></tr></thead>
<tbody>
<tr><td>اقتصادي</td><td>حوالي 70–100 يورو</td></tr>
<tr><td>متوسط</td><td>حوالي 130–220 يورو</td></tr>
<tr><td>مريح</td><td>280 يورو فأكثر</td></tr>
</tbody>
</table>
<p>تفرض مدن إيطالية كثيرة ضريبة سياحية عن كل ليلة في الفنادق، وتضيف بعض المطاعم رسم "كوبيرتو" عن كل شخص. هذا أمر عادي ويظهر عادة في القائمة أو الفاتورة.</p>

<h2>الأكل وخيارات الحلال</h2>
<p>يختلف الطعام الإيطالي كثيراً من منطقة إلى أخرى: المعكرونة الطازجة في إميليا رومانيا، والبيتزا في نابولي، والريزوتو في لومبارديا، والمأكولات البحرية على السواحل، والأرانشيني في صقلية. وكثير من الأطباق نباتية أو بحرية بطبيعتها، لكن اللحوم المقددة مثل "البروشوتو" و"الغوانشالي"، والنبيذ أحياناً، تدخل في بعض الصلصات، فاسأل. وتوجد مجازر ومطاعم حلال في المدن الكبرى، خاصة روما وميلانو وتورينو وبولونيا، يديرها غالباً أبناء الجاليات المغاربية والشرق أوسطية.</p>

<h2>نصائح عملية</h2>
<ul>
<li><strong>قواعد اللباس:</strong> تتطلب الكنائس وكاتدرائية القديس بطرس تغطية الكتفين والركبتين.</li>
<li><strong>ثقافة القهوة:</strong> القهوة التي تُشرب واقفاً عند الكونتوار أرخص في الغالب من تلك التي تُقدَّم على الطاولة.</li>
<li><strong>الماء:</strong> نوافير الشرب العامة منتشرة في روما ومدن كثيرة، فاحمل قارورة قابلة لإعادة التعبئة.</li>
<li><strong>النشالون:</strong> احذر في الحافلات المزدحمة وعند المعالم الكبرى وفي محطات القطار.</li>
<li><strong>مواعيد العمل:</strong> قد تغلق المحلات الصغيرة بعد الظهر، وكثير من المتاحف تغلق يوماً في الأسبوع.</li>
</ul>

<h2>أسئلة شائعة</h2>
<h3>كم يوماً أحتاج في إيطاليا؟</h3>
<p>في الزيارة الأولى تتيح لك 7 إلى 10 أيام رؤية روما وفلورنسا والبندقية براحة، وأضف بضعة أيام لنابولي وساحل أمالفي أو لصقلية.</p>
<h3>هل إيطاليا غالية؟</h3>
<p>أسعار إيطاليا متوسطة إلى مرتفعة بالمقياس الأوروبي. ويمكنك خفض التكاليف بالإقامة خارج المراكز التاريخية، والأكل في المطاعم الشعبية "التراتوريا"، وحجز القطارات مبكراً.</p>
<h3>هل يجب حجز متاحف الفاتيكان مسبقاً؟</h3>
<p>يُنصح بذلك بشدة، فاحجز تذاكر بمواعيد محددة عبر الموقع الرسمي لمتاحف الفاتيكان لتجنب الطوابير الطويلة.</p>
<h3>هل السفر من المغرب إلى إيطاليا سهل؟</h3>
<p>نعم، فهناك رحلات مباشرة كثيرة من عدة مدن مغربية، خاصة نحو شمال إيطاليا، إضافة إلى خط بحري بين طنجة وجنوة.</p>
<h3>أين أرى التراث العربي في إيطاليا؟</h3>
<p>في صقلية، وخصوصاً باليرمو بقصورها وكنائسها العربية النورماندية وأسواقها ومطبخها، وتشتهر تراباني بكسكس السمك.</p>

<h2>خطط رحلتك إلى إيطاليا مع فاستامور</h2>
<p>من الكولوسيوم إلى قنوات البندقية وأسواق باليرمو، يساعدك <strong>مساعد فاستامور الذكي</strong> على إيجاد رحلات من المغرب أو من مدينتك الأوروبية، وتخطيط مسارات القطار بين المدن، وبناء برنامج يناسب ميزانيتك. أخبر فاستامور بتواريخك وابدأ التخطيط لرحلتك الإيطالية.</p>$body$
where slug = 'italy-travel-guide';

-- uae-luxury-hotels
update public.articles set
  title_en = $body$UAE Hotels Guide: Where to Stay in Dubai and Abu Dhabi, by Area$body$,
  title_ar = $body$دليل فنادق الإمارات: أين تقيم في دبي وأبوظبي ونصائح الحجز الذكي$body$,
  excerpt_en = $body$Where to stay in Dubai and Abu Dhabi: the best areas, landmark hotels, approximate prices, the best time to visit, flights from Morocco and Europe, and visas.$body$,
  excerpt_ar = $body$أين تقيم في دبي وأبوظبي: أفضل المناطق والفنادق الأيقونية والأسعار التقريبية وأنسب وقت للزيارة والرحلات من المغرب وأوروبا ونصائح التأشيرة والحجز الذكي.$body$,
  body_en = $body$<p>The United Arab Emirates, and Dubai and Abu Dhabi in particular, is known for some of the most ambitious hotels in the world: sail-shaped towers, palace-style resorts and entire artificial islands lined with beach hotels. For Arabic-speaking and Muslim travellers it is also one of the easiest luxury destinations in the world. Halal food is the norm, prayer facilities are everywhere and Arabic is widely spoken. This guide explains where to stay, which landmark hotels are worth knowing about, when to go, what to budget and how to get there from Morocco and Europe.</p>

<h2>Why Stay in the UAE</h2>
<p>The UAE has a huge range of accommodation, from city business hotels to beach resorts and desert retreats. Competition is intense, so service levels are high, and outside peak periods you can often find good-value deals at four- and five-star properties. The country combines beaches, desert, shopping, theme parks and culture, which makes it popular with families, couples and groups of friends.</p>

<h2>Where to Stay in Dubai</h2>
<h3>Downtown Dubai</h3>
<p>Downtown is home to the Burj Khalifa, the Dubai Mall and the Dubai Fountain. Stay here for city views, shopping and easy metro access. It is ideal for first-time visitors on a short trip.</p>
<h3>Dubai Marina and JBR</h3>
<p>A waterfront district of high-rise towers, with a walkable marina promenade and the beach at Jumeirah Beach Residence (JBR). It's good for travellers who want a beach plus restaurants and nightlife. Note that it is some distance from the older parts of the city.</p>
<h3>Palm Jumeirah</h3>
<p>The palm-shaped artificial island holds many of Dubai's resort hotels, with private beaches, pools and water parks. It is popular with families and honeymooners who want a resort holiday more than city sightseeing.</p>
<h3>Jumeirah Beach Road and Umm Suqeim</h3>
<p>This is a more residential coastline with public beaches and views of the Burj Al Arab. Several well-known beach resorts are located here.</p>
<h3>Deira and Bur Dubai (Old Dubai)</h3>
<p>Here you'll find the Dubai Creek, abra boat crossings, the gold and spice souks and the Al Fahidi historical neighbourhood. Hotels are generally more affordable, and the area offers authentic local atmosphere and easy metro access.</p>

<h2>Where to Stay in Abu Dhabi</h2>
<ul>
<li><strong>The Corniche and city centre:</strong> sea views, business hotels and easy access to the city's main sights.</li>
<li><strong>Saadiyat Island:</strong> beaches and the cultural district, including the Louvre Abu Dhabi.</li>
<li><strong>Yas Island:</strong> the entertainment hub, with theme parks such as Ferrari World, Yas Waterworld and Warner Bros. World, as well as the Yas Marina Formula 1 circuit. It is ideal for families.</li>
<li><strong>Near the Sheikh Zayed Grand Mosque:</strong> convenient for visiting one of the most remarkable mosques in the world.</li>
</ul>

<h2>Landmark Hotels Worth Knowing</h2>
<p>A few UAE hotels are famous enough to be landmarks in their own right. Many travellers visit them for a meal, afternoon tea or a tour even if they stay elsewhere. Booking conditions and access vary, so always check directly.</p>
<ul>
<li><strong>Burj Al Arab Jumeirah (Dubai):</strong> the sail-shaped tower on its own island, often described in the media as a "seven-star" hotel. That is a nickname, not an official rating.</li>
<li><strong>Atlantis The Palm (Dubai):</strong> the large resort at the tip of Palm Jumeirah, known for its water park and aquarium.</li>
<li><strong>Emirates Palace (Abu Dhabi):</strong> a palace-style hotel on the Abu Dhabi waterfront, known for its grand domes and gold-themed interiors.</li>
</ul>

<h2>Best Time to Visit the UAE</h2>
<ul>
<li><strong>November to March:</strong> the most pleasant season, warm and sunny with comfortable evenings. It is also the busiest and most expensive time, especially around Christmas, New Year and European school holidays.</li>
<li><strong>April and October:</strong> shoulder months that are already hot, but with lower hotel rates.</li>
<li><strong>May to September:</strong> very hot and humid. Hotels often offer their best deals, and indoor attractions, malls and pools make it manageable for many families.</li>
</ul>
<p>Ramadan changes each year. Hotels stay open and many offer iftar and suhoor, but some daytime services and entertainment are adjusted.</p>

<h2>Getting to the UAE</h2>
<h3>From Morocco</h3>
<p>Direct flights link Casablanca with Dubai, and Abu Dhabi is reachable directly or with one connection depending on the season. Operating airlines and frequencies change, so compare current options. Travellers from other Moroccan cities usually connect via Casablanca or a European or Gulf hub. A direct flight from Casablanca typically takes around 7 to 8 hours.</p>
<h3>From Europe</h3>
<p>Dubai (DXB) and Abu Dhabi (AUH) are major global hubs with direct flights from most European capitals and many secondary cities, including Paris, Brussels, Madrid, Barcelona, Milan and Rome. Flight times from Western Europe are typically around 6 to 7.5 hours. Sharjah and Dubai World Central (DWC) airports are also served by some airlines.</p>

<h2>Visas and Entry</h2>
<p>Entry rules for the UAE depend on your nationality. Citizens of many countries, including EU member states and the UK, can generally enter visa-free or receive a visa on arrival for short stays. Moroccan passport holders generally need to obtain a visa before travelling, typically through an airline, a hotel, a licensed travel agency or the official UAE e-visa channels. Holders of certain residence permits or visas from other countries may have specific options. Requirements change frequently, so always check the official UAE government portals (ICP or GDRFA Dubai) or your airline before booking. Your passport should be valid for at least six months.</p>

<h2>Budget: How Much Do UAE Hotels Cost?</h2>
<p>Hotel prices in the UAE vary enormously by season, location and events. The ranges below are <strong>approximate nightly rates for a double room</strong> and should be used only as a guide:</p>
<table>
<thead><tr><th>Category</th><th>Approximate price per night</th><th>Typical areas</th></tr></thead>
<tbody>
<tr><td>Budget / 3-star</td><td>about 50–120 EUR</td><td>Deira, Bur Dubai, Al Barsha</td></tr>
<tr><td>Mid-range / 4-star</td><td>about 100–250 EUR</td><td>Downtown edges, Marina, Business Bay</td></tr>
<tr><td>Luxury / 5-star resort</td><td>about 250–700 EUR</td><td>Palm Jumeirah, Jumeirah, Saadiyat</td></tr>
<tr><td>Iconic landmark hotels</td><td>often well above 1,000 EUR</td><td>Burj Al Arab and similar properties</td></tr>
</tbody>
</table>
<p>In addition to the room rate, Dubai hotels charge a per-night <strong>Tourism Dirham</strong> fee, and other emirates have similar charges. Service charges and taxes may also apply. Check whether the price shown includes them.</p>

<h2>Tips for Booking UAE Hotels</h2>
<ul>
<li><strong>Compare location, not just stars:</strong> a beach resort far from the metro can add significant taxi costs if you plan to sightsee.</li>
<li><strong>Look at board options:</strong> half-board or all-inclusive packages can be good value at resorts, especially for families.</li>
<li><strong>Check family facilities:</strong> kids' clubs, connecting rooms and water-park access vary between hotels.</li>
<li><strong>Read the cancellation policy:</strong> flexible rates cost more but are useful if your visa or flights are not yet confirmed.</li>
<li><strong>Watch for events:</strong> major exhibitions, Formula 1 weekends and New Year can push prices much higher.</li>
</ul>

<h2>Practical Tips for Your Stay</h2>
<ul>
<li><strong>Dress:</strong> swimwear is fine at pools and beaches. In malls, mosques and traditional areas, more modest clothing is expected.</li>
<li><strong>Public conduct:</strong> respect local laws and customs. Public displays of affection, offensive gestures and photographing people without permission can cause problems.</li>
<li><strong>Medicines:</strong> some medicines that are common elsewhere are controlled in the UAE. Carry prescriptions and check the official rules before travelling.</li>
<li><strong>Transport:</strong> the Dubai Metro, taxis and ride-hailing apps are widely used. Distances are large, so plan your days by area.</li>
<li><strong>Payments:</strong> cards are accepted almost everywhere, and the local currency is the UAE dirham (AED).</li>
</ul>

<h2>Frequently Asked Questions</h2>
<h3>Is Dubai or Abu Dhabi better for a family holiday?</h3>
<p>Both work well. Dubai offers more variety and nightlife, while Abu Dhabi is calmer and has Yas Island's theme parks and Saadiyat's beaches.</p>
<h3>Is the Burj Al Arab really a seven-star hotel?</h3>
<p>"Seven stars" is a popular description, not an official classification. Standard hotel rating systems go up to five stars.</p>
<h3>Do I need a visa for Dubai as a Moroccan citizen?</h3>
<p>In general, yes, and you should arrange it before you travel. Rules change, so check official UAE sources or your airline for the current procedure.</p>
<h3>What is the cheapest time to stay in Dubai?</h3>
<p>Summer, roughly June to August, usually has the lowest hotel rates, but temperatures are very high.</p>
<h3>Are UAE hotels suitable for Muslim travellers?</h3>
<p>Yes. Halal food is standard, prayer direction markers are common in rooms, and many hotels offer alcohol-free dining options and family-friendly beaches.</p>

<h2>Plan Your UAE Stay with Fastamor</h2>
<p>Whether you want a city break by the Burj Khalifa, a beach resort on the Palm or a family trip to Yas Island, the <strong>Fastamor AI assistant</strong> can help you compare areas, find flights from Morocco or Europe and plan an itinerary around your budget. Tell Fastamor your dates and travel style to get started.</p>$body$,
  body_ar = $body$<p>تشتهر الإمارات العربية المتحدة، وخاصة دبي وأبوظبي، بفنادق من أكثر فنادق العالم طموحاً: أبراج على شكل شراع، ومنتجعات على هيئة قصور، وجزر اصطناعية كاملة تصطف عليها فنادق الشاطئ. وهي كذلك من أسهل الوجهات الفاخرة في العالم للمسافر العربي والمسلم، فالأكل الحلال هو القاعدة، وأماكن الصلاة في كل مكان، والعربية لغة متداولة. يشرح هذا الدليل أين تقيم، وما الفنادق الأيقونية التي تستحق المعرفة، ومتى تسافر، وكم تخصص من الميزانية، وكيف تصل من المغرب وأوروبا.</p>

<h2>لماذا تقيم في الإمارات؟</h2>
<p>تضم الإمارات طيفاً واسعاً جداً من أماكن الإقامة، من فنادق الأعمال في المدن إلى منتجعات الشاطئ وملاذات الصحراء. والمنافسة شديدة، فمستوى الخدمة مرتفع، وخارج فترات الذروة كثيراً ما تجد عروضاً جيدة في فنادق الأربع والخمس نجوم. وتجمع البلاد بين الشواطئ والصحراء والتسوق والمدن الترفيهية والثقافة، مما يجعلها محبوبة لدى العائلات والأزواج ومجموعات الأصدقاء.</p>

<h2>أين تقيم في دبي؟</h2>
<h3>وسط مدينة دبي (داون تاون)</h3>
<p>هنا يقع برج خليفة ودبي مول ونافورة دبي. أقم في هذه المنطقة إن أردت إطلالات المدينة والتسوق والوصول السهل إلى المترو، وهي مثالية لمن يزور دبي أول مرة في رحلة قصيرة.</p>
<h3>دبي مارينا وجي بي آر</h3>
<p>حي واجهة بحرية من الأبراج الشاهقة، فيه ممشى المارينا والشاطئ في "جميرا بيتش ريزيدنس". يناسب من يريد البحر مع المطاعم والسهر، مع ملاحظة بعده النسبي عن الأحياء القديمة.</p>
<h3>نخلة جميرا</h3>
<p>الجزيرة الاصطناعية على شكل نخلة تضم كثيراً من منتجعات دبي، بشواطئها الخاصة ومسابحها وحدائقها المائية. وهي محبوبة لدى العائلات والعرسان الذين يفضلون عطلة المنتجع على جولات المدينة.</p>
<h3>شارع جميرا وأم سقيم</h3>
<p>ساحل أكثر طابعاً سكنياً، فيه شواطئ عامة وإطلالات على برج العرب، وعدد من منتجعات الشاطئ المعروفة.</p>
<h3>ديرة وبر دبي (دبي القديمة)</h3>
<p>هنا تجد خور دبي وعبّاراته الخشبية، وسوق الذهب وسوق التوابل، وحي الفهيدي التاريخي. الفنادق أرخص عموماً، والأجواء محلية أصيلة، والمترو قريب.</p>

<h2>أين تقيم في أبوظبي؟</h2>
<ul>
<li><strong>الكورنيش ووسط المدينة:</strong> إطلالات بحرية وفنادق أعمال وقرب من أهم معالم المدينة.</li>
<li><strong>جزيرة السعديات:</strong> شواطئ والمنطقة الثقافية التي تضم متحف اللوفر أبوظبي.</li>
<li><strong>جزيرة ياس:</strong> مركز الترفيه، بمدن ملاهٍ مثل عالم فيراري وياس ووتروورلد وعالم وارنر براذرز، إضافة إلى حلبة مرسى ياس للفورمولا 1، وهي مثالية للعائلات.</li>
<li><strong>قرب جامع الشيخ زايد الكبير:</strong> مناسبة لزيارة واحد من أروع المساجد في العالم.</li>
</ul>

<h2>فنادق أيقونية تستحق المعرفة</h2>
<p>بعض فنادق الإمارات بلغت من الشهرة حداً جعلها معالم قائمة بذاتها، ويزورها كثيرون لتناول وجبة أو شاي العصر أو للقيام بجولة حتى لو أقاموا في مكان آخر. وتختلف شروط الحجز والدخول، فتحقق منها مباشرة.</p>
<ul>
<li><strong>برج العرب جميرا (دبي):</strong> البرج الشراعي القائم على جزيرته الخاصة، ويوصف كثيراً في الإعلام بأنه فندق "سبع نجوم"، وهذا لقب شائع لا تصنيف رسمي.</li>
<li><strong>أتلانتس النخلة (دبي):</strong> المنتجع الضخم في طرف نخلة جميرا، المعروف بحديقته المائية وأحواضه البحرية.</li>
<li><strong>قصر الإمارات (أبوظبي):</strong> فندق على طراز القصور على واجهة أبوظبي البحرية، معروف بقبابه الكبيرة وديكوراته المذهبة.</li>
</ul>

<h2>أفضل وقت لزيارة الإمارات</h2>
<ul>
<li><strong>من نوفمبر إلى مارس:</strong> ألطف المواسم، دافئ ومشمس مع أمسيات مريحة، لكنه أيضاً الأكثر ازدحاماً والأغلى، خاصة حول رأس السنة والعطل المدرسية الأوروبية.</li>
<li><strong>أبريل وأكتوبر:</strong> شهران انتقاليان، الحرارة فيهما مرتفعة لكن أسعار الفنادق أقل.</li>
<li><strong>من مايو إلى سبتمبر:</strong> حرارة ورطوبة شديدتان، وفيه تقدّم الفنادق غالباً أفضل عروضها، وتجعل الأنشطة الداخلية والمراكز التجارية والمسابح الإقامة ممكنة لكثير من العائلات.</li>
</ul>
<p>يتغير موعد رمضان كل سنة. تبقى الفنادق مفتوحة ويقدّم كثير منها الإفطار والسحور، مع تعديل بعض الخدمات والأنشطة الترفيهية نهاراً.</p>

<h2>الوصول إلى الإمارات</h2>
<h3>من المغرب</h3>
<p>تربط رحلات مباشرة الدار البيضاء بدبي، ويمكن الوصول إلى أبوظبي مباشرة أو بتوقف واحد حسب الموسم. وتتغير شركات الطيران المشغّلة وعدد الرحلات، فقارن الخيارات المتاحة حالياً. أما المسافرون من مدن مغربية أخرى فيمرّون عادة عبر الدار البيضاء أو عبر محطة أوروبية أو خليجية. وتستغرق الرحلة المباشرة من الدار البيضاء نحو 7 إلى 8 ساعات عادة.</p>
<h3>من أوروبا</h3>
<p>مطارا دبي وأبوظبي محوران عالميان برحلات مباشرة من معظم العواصم الأوروبية ومدن ثانوية كثيرة، منها باريس وبروكسل ومدريد وبرشلونة وميلانو وروما. وتستغرق الرحلة من أوروبا الغربية نحو 6 إلى 7 ساعات ونصف في الغالب. كما تخدم بعض الشركات مطاري الشارقة ودبي وورلد سنترال.</p>

<h2>التأشيرة وشروط الدخول</h2>
<p>تختلف شروط دخول الإمارات حسب الجنسية. فمواطنو دول كثيرة، منها دول الاتحاد الأوروبي والمملكة المتحدة، يدخلون عموماً دون تأشيرة أو بتأشيرة عند الوصول للإقامات القصيرة. أما حاملو الجواز المغربي فيحتاجون عموماً إلى استخراج تأشيرة قبل السفر، عادة عبر شركة الطيران أو الفندق أو وكالة سفر مرخصة أو القنوات الإماراتية الرسمية للتأشيرة الإلكترونية. وقد تتاح خيارات خاصة لحاملي بعض الإقامات أو التأشيرات من دول أخرى. وتتغير المتطلبات كثيراً، فراجع دائماً البوابات الحكومية الإماراتية الرسمية (الهيئة الاتحادية للهوية والجنسية أو الإدارة العامة للإقامة وشؤون الأجانب في دبي) أو شركة الطيران قبل الحجز. ويجب أن يكون جوازك صالحاً ستة أشهر على الأقل.</p>

<h2>الميزانية: كم تكلف فنادق الإمارات؟</h2>
<p>تتفاوت أسعار الفنادق في الإمارات تفاوتاً كبيراً حسب الموسم والموقع والفعاليات. والنطاقات التالية <strong>أسعار تقريبية لليلة في غرفة مزدوجة</strong> للاسترشاد فقط:</p>
<table>
<thead><tr><th>الفئة</th><th>السعر التقريبي لليلة</th><th>المناطق المعتادة</th></tr></thead>
<tbody>
<tr><td>اقتصادي / 3 نجوم</td><td>حوالي 50–120 يورو</td><td>ديرة، بر دبي، البرشاء</td></tr>
<tr><td>متوسط / 4 نجوم</td><td>حوالي 100–250 يورو</td><td>أطراف وسط المدينة، المارينا، الخليج التجاري</td></tr>
<tr><td>فاخر / منتجع 5 نجوم</td><td>حوالي 250–700 يورو</td><td>نخلة جميرا، جميرا، السعديات</td></tr>
<tr><td>الفنادق الأيقونية</td><td>كثيراً ما تتجاوز 1000 يورو بكثير</td><td>برج العرب وما يماثله</td></tr>
</tbody>
</table>
<p>إلى جانب سعر الغرفة، تفرض فنادق دبي رسماً يومياً يُعرف بـ<strong>"درهم السياحة"</strong>، ولدى الإمارات الأخرى رسوم مشابهة، وقد تُضاف رسوم خدمة وضرائب. تحقق مما إذا كان السعر المعروض يشملها.</p>

<h2>نصائح لحجز فنادق الإمارات</h2>
<ul>
<li><strong>قارن الموقع لا النجوم فقط:</strong> منتجع شاطئي بعيد عن المترو قد يضيف تكاليف كبيرة لسيارات الأجرة إن كنت تنوي التجول.</li>
<li><strong>انتبه لخيارات الوجبات:</strong> باقات نصف الإقامة أو الإقامة الشاملة قد تكون مجدية في المنتجعات، خاصة للعائلات.</li>
<li><strong>تحقق من مرافق العائلة:</strong> نوادي الأطفال والغرف المتصلة والدخول إلى الحدائق المائية تختلف من فندق لآخر.</li>
<li><strong>اقرأ سياسة الإلغاء:</strong> الأسعار المرنة أغلى، لكنها مفيدة إن لم تكن تأشيرتك أو رحلتك مؤكدة بعد.</li>
<li><strong>راقب الفعاليات:</strong> المعارض الكبرى وعطلات الفورمولا 1 ورأس السنة قد ترفع الأسعار كثيراً.</li>
</ul>

<h2>نصائح عملية خلال إقامتك</h2>
<ul>
<li><strong>اللباس:</strong> ملابس السباحة مقبولة في المسابح والشواطئ، أما في المراكز التجارية والمساجد والمناطق التقليدية فيُتوقع لباس أكثر احتشاماً.</li>
<li><strong>السلوك العام:</strong> احترم القوانين والأعراف المحلية، فإظهار المودة علناً والإشارات المسيئة وتصوير الناس دون إذن قد يسبب مشاكل.</li>
<li><strong>الأدوية:</strong> بعض الأدوية الشائعة في بلدان أخرى خاضعة للرقابة في الإمارات، فاحمل الوصفات الطبية وتحقق من القواعد الرسمية قبل السفر.</li>
<li><strong>التنقل:</strong> مترو دبي وسيارات الأجرة وتطبيقات النقل مستعملة على نطاق واسع، والمسافات كبيرة، فنظّم أيامك حسب المناطق.</li>
<li><strong>الدفع:</strong> البطاقات مقبولة في كل مكان تقريباً، والعملة المحلية هي الدرهم الإماراتي.</li>
</ul>

<h2>أسئلة شائعة</h2>
<h3>دبي أم أبوظبي لعطلة عائلية؟</h3>
<p>كلتاهما مناسبة. دبي أكثر تنوعاً وحياة ليلية، أما أبوظبي فأهدأ، وفيها مدن ملاهي جزيرة ياس وشواطئ السعديات.</p>
<h3>هل برج العرب فندق سبع نجوم فعلاً؟</h3>
<p>"سبع نجوم" وصف شائع لا تصنيف رسمي، فأنظمة التصنيف الفندقي المعتمدة تصل إلى خمس نجوم.</p>
<h3>هل أحتاج إلى تأشيرة لدبي بصفتي مواطناً مغربياً؟</h3>
<p>نعم في العموم، وينبغي ترتيبها قبل السفر. وبما أن القواعد تتغير، راجع المصادر الإماراتية الرسمية أو شركة الطيران لمعرفة الإجراء الحالي.</p>
<h3>ما أرخص وقت للإقامة في دبي؟</h3>
<p>الصيف، أي من يونيو إلى أغسطس تقريباً، تكون فيه أسعار الفنادق عادة في أدنى مستوياتها، لكن الحرارة شديدة جداً.</p>
<h3>هل فنادق الإمارات مناسبة للمسافرين المسلمين؟</h3>
<p>نعم، فالأكل الحلال هو المعتاد، واتجاه القبلة محدد غالباً في الغرف، وكثير من الفنادق توفر خيارات طعام خالية من الكحول وشواطئ مناسبة للعائلات.</p>

<h2>خطط إقامتك في الإمارات مع فاستامور</h2>
<p>سواء أردت عطلة في المدينة قرب برج خليفة، أو منتجعاً شاطئياً على النخلة، أو رحلة عائلية إلى جزيرة ياس، يساعدك <strong>مساعد فاستامور الذكي</strong> على مقارنة المناطق، وإيجاد رحلات من المغرب أو أوروبا، وتخطيط برنامج يراعي ميزانيتك. أخبر فاستامور بتواريخك وأسلوب سفرك لتبدأ.</p>$body$
where slug = 'uae-luxury-hotels';

-- travel-health-guide
update public.articles set
  title_en = $body$Travel Health Guide: Vaccines, Insurance and Avoiding Illness$body$,
  title_ar = $body$دليل صحة المسافر: اللقاحات والتأمين وكيف تتجنب أمراض السفر$body$,
  excerpt_en = $body$Stay healthy abroad: vaccines, travel insurance, medicines, a travel pharmacy checklist, avoiding stomach bugs and heatstroke, and what to do in emergencies.$body$,
  excerpt_ar = $body$حافظ على صحتك في السفر: اللقاحات وتأمين السفر والأدوية وقائمة صيدلية المسافر، وكيف تتجنب اضطرابات المعدة وضربة الشمس، وماذا تفعل في حالات الطوارئ الطبية.$body$,
  body_en = $body$<p>Nothing ruins a trip faster than falling ill far from home. The good news is that most travel health problems, such as stomach upsets, heat exhaustion, jet lag and minor injuries, are predictable and largely preventable. This guide explains how to prepare before you leave, what to pack, how to avoid the most common travel illnesses and what to do if something goes wrong abroad. It is written for travellers from Morocco and the diaspora in Europe heading to Europe, the Gulf, Africa or further afield.</p>
<p><strong>Important:</strong> this article is general information, not medical advice. Always consult a doctor or a travel health clinic about your own situation, especially if you are pregnant, travelling with a baby, or living with a chronic condition.</p>

<h2>Before You Travel: A Health Checklist</h2>
<h3>See a Doctor 4 to 8 Weeks Before Departure</h3>
<p>Some vaccines need several weeks to become effective or require more than one dose. A travel health consultation lets a professional review your destination, the length and style of your trip and your medical history. Ask about:</p>
<ul>
<li>Routine vaccinations (for example tetanus, measles and seasonal flu) and whether yours are up to date.</li>
<li>Destination-specific vaccines, such as hepatitis A, typhoid or rabies, depending on where and how you travel.</li>
<li>Whether you need malaria prevention for parts of Sub-Saharan Africa, South Asia or other regions.</li>
<li>A yellow fever vaccination certificate, which some countries require at entry, particularly if you arrive from a country with yellow fever risk.</li>
</ul>
<h3>Pilgrims: Umrah and Hajj</h3>
<p>Saudi authorities set specific health requirements for pilgrims, including meningococcal vaccination. Requirements can be updated each season, so check the official Saudi guidance and your national health authority well before departure.</p>
<h3>Travel Insurance</h3>
<p>Medical treatment abroad can be very expensive, especially in private hospitals. Good travel insurance should cover emergency treatment, hospitalisation, repatriation and, ideally, trip cancellation. Keep in mind:</p>
<ul>
<li><strong>Schengen visa applicants</strong> must generally show travel medical insurance valid across the Schengen Area with a minimum level of cover, commonly 30,000 EUR.</li>
<li><strong>EU residents</strong> travelling within the EU can use the European Health Insurance Card (EHIC) for necessary state healthcare. It does not replace travel insurance and does not cover repatriation.</li>
<li><strong>Pre-existing conditions</strong> must usually be declared, or they may not be covered.</li>
</ul>
<p>Insurance prices vary with age, destination, trip length and cover. As a rough indication only, basic short-trip policies can cost from a few euros per day, while comprehensive annual policies cost more. Always compare what is actually covered, not just the price.</p>

<h2>Travelling with Medicines</h2>
<ul>
<li>Bring enough of your regular medicines for the whole trip plus a few extra days in case of delays.</li>
<li>Keep them in their original packaging, in your hand luggage, with a copy of your prescription. A translation or an international non-proprietary name (generic name) helps abroad.</li>
<li>Some medicines that are freely available in one country are controlled in another. The UAE, Saudi Arabia, Japan and some other countries restrict certain painkillers, sleeping tablets, ADHD medicines and medicines containing codeine. Check the embassy or health ministry website of your destination before travelling.</li>
<li>For injectable medicines such as insulin, carry a doctor's letter and inform security staff at the airport.</li>
</ul>

<h2>Your Travel Pharmacy</h2>
<p>Pack a small kit adapted to your trip. A typical kit might include:</p>
<ul>
<li>Oral rehydration salts for diarrhoea and dehydration.</li>
<li>Paracetamol or another pain reliever and fever reducer that you have used before.</li>
<li>Plasters, antiseptic wipes, a small bandage and blister pads.</li>
<li>Antihistamines for allergies and insect bites.</li>
<li>Motion sickness tablets if you are prone to car, ferry or plane sickness.</li>
<li>High-SPF sunscreen, lip balm and after-sun.</li>
<li>Insect repellent containing an ingredient such as DEET, picaridin (icaridin) or similar.</li>
<li>Hand sanitiser and a digital thermometer.</li>
</ul>
<p>Ask your pharmacist or doctor which products are suitable for you and your children.</p>

<h2>Common Travel Illnesses and How to Avoid Them</h2>
<h3>Traveller's Diarrhoea</h3>
<p>This is one of the most common travel health problems, usually caused by contaminated food or water. To reduce the risk:</p>
<ul>
<li>Wash your hands before eating and use sanitiser when soap is unavailable.</li>
<li>Choose busy food stalls and restaurants where food is cooked fresh and served hot.</li>
<li>Where tap water is not considered safe, drink bottled or properly treated water and be careful with ice.</li>
<li>Follow the old rule for raw fruit and vegetables: "cook it, peel it or leave it".</li>
</ul>
<p>Most cases settle in a few days with rest and fluids. Drink plenty and use oral rehydration salts. See a doctor quickly if you have blood in your stool, a high fever, signs of severe dehydration or symptoms lasting more than a few days, and for young children, older people and pregnant women.</p>
<h3>Heat Exhaustion and Heatstroke</h3>
<p>Summer heat in southern Spain, inland Morocco, the Gulf and much of Italy can be intense. Drink water regularly, wear a hat and light clothing, avoid strenuous activity in the hottest hours (roughly late morning to late afternoon) and rest in the shade. Confusion, a very high body temperature, hot dry skin or fainting can signal heatstroke, a medical emergency. Call emergency services and cool the person immediately.</p>
<h3>Jet Lag</h3>
<p>Crossing several time zones, for example from Morocco to the Gulf, Asia or the Americas, disrupts your sleep. Shift your sleep schedule gradually a few days before departure, stay hydrated on the plane, limit caffeine, get daylight on arrival and try to adopt local meal and sleep times quickly.</p>
<h3>Motion Sickness</h3>
<p>Ferries across the Strait of Gibraltar or winding mountain roads in the Atlas can trigger nausea. Sit where movement is least felt (the middle of a ship or the front of a car), look at the horizon, avoid reading and consider medication taken in advance.</p>
<h3>Mosquito and Insect Bites</h3>
<p>Mosquitoes can transmit diseases such as dengue or malaria in some regions. Use repellent, wear long sleeves in the evening and sleep under a net or in screened, air-conditioned rooms where advised.</p>
<h3>Altitude Sickness</h3>
<p>Above roughly 2,500 metres, for example on Toubkal in Morocco or in the Andes, some people develop headache, nausea and breathlessness. Ascend gradually, stay hydrated and descend if symptoms worsen.</p>

<h2>Seasonal Health Risks</h2>
<table>
<thead><tr><th>Season / situation</th><th>Main risks</th><th>Key precautions</th></tr></thead>
<tbody>
<tr><td>Summer in Morocco, Spain, Italy, the Gulf</td><td>Heat, dehydration, sunburn</td><td>Water, shade, sunscreen, rest at midday</td></tr>
<tr><td>Winter in Europe</td><td>Seasonal flu and respiratory infections</td><td>Vaccination where recommended, hand hygiene</td></tr>
<tr><td>Rainy seasons in the tropics</td><td>Mosquito-borne diseases</td><td>Repellent, covering clothes, nets</td></tr>
<tr><td>Long-haul flights</td><td>Dehydration, deep vein thrombosis risk</td><td>Walk, stretch, drink water, ask your doctor if at higher risk</td></tr>
</tbody>
</table>

<h2>What to Do in a Medical Emergency Abroad</h2>
<ul>
<li><strong>Know the emergency numbers:</strong> 112 works across the EU. In Morocco, 15 is commonly used for ambulance and civil protection and 19 for police in cities. In the UAE, 998 is ambulance and 999 is police. Verify the numbers for your destination before you go.</li>
<li><strong>Call your insurer early:</strong> most insurers have a 24/7 assistance line and may need to approve treatment or direct you to partner hospitals.</li>
<li><strong>Keep documents to hand:</strong> passport, insurance details, prescriptions and a list of allergies and conditions, stored both on paper and on your phone.</li>
<li><strong>Use pharmacies for minor problems:</strong> in Morocco, Spain, Italy, France and Portugal pharmacists are a valuable first point of advice, and duty pharmacies operate at night.</li>
<li><strong>Contact your consulate</strong> if you are seriously ill, hospitalised or need help contacting family.</li>
</ul>

<h2>Frequently Asked Questions</h2>
<h3>Do I need vaccines to travel from Morocco to Europe?</h3>
<p>Usually no specific vaccines are required for entry to European countries, but you should be up to date with routine vaccinations. Always check with your doctor and with official sources for current requirements.</p>
<h3>Is tap water safe to drink in Europe?</h3>
<p>In most Western European cities tap water is treated and considered safe. In rural areas or if in doubt, follow local guidance or drink bottled water.</p>
<h3>Can I take my prescription medicine on the plane?</h3>
<p>Generally yes, in your hand luggage, in original packaging, with your prescription. Liquids above the usual cabin limit may need to be declared at security. Check rules for controlled substances at your destination.</p>
<h3>Does the EHIC replace travel insurance?</h3>
<p>No. The EHIC gives access to necessary public healthcare in EU countries on the same terms as residents, but it does not cover private care, repatriation or trip cancellation.</p>
<h3>What should I do if I get food poisoning while travelling?</h3>
<p>Rest, drink plenty of fluids with oral rehydration salts and eat light food when you can. Seek medical help if symptoms are severe, include blood or high fever, or last more than a few days.</p>

<h2>Travel Healthy with Fastamor</h2>
<p>Good health planning is part of good trip planning. The <strong>Fastamor AI assistant</strong> can help you build a checklist for your destination, plan realistic daily schedules that avoid the midday heat and organise the documents you need. Tell Fastamor where you are going and start preparing for a safe, healthy journey.</p>$body$,
  body_ar = $body$<p>لا شيء يفسد الرحلة أسرع من المرض بعيداً عن البيت. والخبر السار أن معظم مشكلات الصحة في السفر، كاضطرابات المعدة والإجهاد الحراري واضطراب الرحلات الطويلة والإصابات البسيطة، متوقعة ويمكن تفادي أغلبها. يشرح هذا الدليل كيف تستعد قبل المغادرة، وماذا تحمل معك، وكيف تتجنب أكثر أمراض السفر شيوعاً، وماذا تفعل إن طرأ طارئ في الخارج. وهو موجّه للمسافرين من المغرب وأبناء الجالية في أوروبا المتجهين إلى أوروبا أو الخليج أو إفريقيا أو أبعد من ذلك.</p>
<p><strong>تنبيه مهم:</strong> هذا المقال معلومات عامة وليس استشارة طبية. استشر دائماً طبيباً أو عيادة متخصصة في طب السفر بشأن حالتك، خصوصاً إن كنتِ حاملاً، أو تسافر مع رضيع، أو تعاني من مرض مزمن.</p>

<h2>قبل السفر: قائمة الصحة</h2>
<h3>زر الطبيب قبل المغادرة بأربعة إلى ثمانية أسابيع</h3>
<p>بعض اللقاحات تحتاج أسابيع لتصبح فعالة أو تتطلب أكثر من جرعة. واستشارة طب السفر تتيح للمختص مراجعة وجهتك ومدة رحلتك ونمطها وتاريخك الطبي. اسأل عن:</p>
<ul>
<li>اللقاحات الروتينية، مثل الكزاز والحصبة والإنفلونزا الموسمية، وهل لقاحاتك محدّثة.</li>
<li>اللقاحات الخاصة بالوجهة، مثل التهاب الكبد "أ" أو التيفوئيد أو داء الكلب، حسب المكان وطريقة السفر.</li>
<li>مدى حاجتك إلى الوقاية من الملاريا في مناطق من إفريقيا جنوب الصحراء أو جنوب آسيا أو غيرها.</li>
<li>شهادة التطعيم ضد الحمى الصفراء التي تشترطها بعض الدول عند الدخول، لا سيما إن كنت قادماً من بلد تنتشر فيه.</li>
</ul>
<h3>الحجاج والمعتمرون</h3>
<p>تحدد السلطات السعودية متطلبات صحية خاصة بالحجاج والمعتمرين، منها لقاح التهاب السحايا. وقد تُحدَّث هذه المتطلبات كل موسم، فراجع الإرشادات السعودية الرسمية والسلطات الصحية في بلدك قبل السفر بوقت كافٍ.</p>
<h3>تأمين السفر</h3>
<p>قد يكون العلاج في الخارج باهظ التكلفة، خاصة في المستشفيات الخاصة. والتأمين الجيد يغطي العلاج الطارئ والاستشفاء والإعادة إلى الوطن، ويُستحسن أن يشمل إلغاء الرحلة. وتذكّر:</p>
<ul>
<li><strong>طالبو تأشيرة شنغن</strong> يُطلب منهم عموماً تأمين طبي للسفر صالح في كامل فضاء شنغن بحد أدنى من التغطية يبلغ في الغالب 30 ألف يورو.</li>
<li><strong>المقيمون في الاتحاد الأوروبي</strong> المسافرون داخله يمكنهم استعمال البطاقة الأوروبية للتأمين الصحي للحصول على الرعاية العمومية الضرورية، لكنها لا تغني عن تأمين السفر ولا تغطي الإعادة إلى الوطن.</li>
<li><strong>الأمراض السابقة</strong> يجب التصريح بها عادة، وإلا فقد لا تشملها التغطية.</li>
</ul>
<p>تختلف أسعار التأمين حسب السن والوجهة ومدة الرحلة ونطاق التغطية. وعلى سبيل الإشارة التقريبية فقط، قد تبدأ وثائق الرحلات القصيرة الأساسية من بضعة يوروهات في اليوم، بينما تكلف الوثائق السنوية الشاملة أكثر. قارن دائماً ما تغطيه الوثيقة فعلاً لا السعر وحده.</p>

<h2>السفر مع الأدوية</h2>
<ul>
<li>احمل ما يكفي من أدويتك المعتادة لكامل الرحلة، مع بضعة أيام إضافية تحسباً للتأخير.</li>
<li>أبقِها في علبها الأصلية وفي حقيبة اليد، مع نسخة من الوصفة الطبية. وتفيدك في الخارج ترجمة الوصفة أو الاسم العلمي للدواء.</li>
<li>بعض الأدوية المتاحة بحرية في بلد ما خاضعة للرقابة في بلد آخر، فالإمارات والسعودية واليابان ودول أخرى تقيّد بعض المسكنات والمنومات وأدوية فرط الحركة والأدوية المحتوية على الكودايين. راجع موقع سفارة بلد الوجهة أو وزارة صحته قبل السفر.</li>
<li>بالنسبة إلى الأدوية التي تؤخذ بالحقن كالأنسولين، احمل رسالة من الطبيب وأخبر موظفي التفتيش في المطار.</li>
</ul>

<h2>صيدلية السفر</h2>
<p>جهّز حقيبة صغيرة تناسب رحلتك، وقد تضم عادة:</p>
<ul>
<li>أملاح الإماهة الفموية لعلاج الإسهال والجفاف.</li>
<li>الباراسيتامول أو مسكناً وخافضاً للحرارة سبق أن استعملته.</li>
<li>لاصقات الجروح ومناديل معقمة وضمادة صغيرة ولاصقات للبثور.</li>
<li>مضادات الهيستامين للحساسية ولسعات الحشرات.</li>
<li>أقراص دوار الحركة إن كنت تتأثر بالسيارة أو الباخرة أو الطائرة.</li>
<li>واقي شمس بعامل حماية مرتفع ومرطب للشفاه ومستحضر لما بعد التعرض للشمس.</li>
<li>طارد حشرات يحتوي على مادة مثل "ديت" أو "بيكاريدين" أو ما يماثلها.</li>
<li>معقم لليدين وميزان حرارة رقمي.</li>
</ul>
<p>اسأل الصيدلي أو الطبيب عن المنتجات المناسبة لك ولأطفالك.</p>

<h2>أمراض السفر الشائعة وكيف تتجنبها</h2>
<h3>إسهال المسافرين</h3>
<p>من أكثر المشكلات الصحية شيوعاً في السفر، وسببه غالباً طعام أو ماء ملوث. ولتقليل الخطر:</p>
<ul>
<li>اغسل يديك قبل الأكل، واستعمل المعقم حين لا يتوفر الصابون.</li>
<li>اختر الأكشاك والمطاعم المزدحمة التي يُطهى فيها الطعام طازجاً ويقدَّم ساخناً.</li>
<li>حيث لا يُعدّ ماء الصنبور آمناً، اشرب الماء المعبأ أو المعالج جيداً، واحذر من الثلج.</li>
<li>اتبع القاعدة القديمة مع الفواكه والخضر النيئة: "اطبخها أو قشّرها أو اتركها".</li>
</ul>
<p>تتحسن معظم الحالات في أيام قليلة بالراحة والسوائل، فاشرب كثيراً واستعمل أملاح الإماهة. وراجع الطبيب سريعاً عند وجود دم في البراز أو حمى مرتفعة أو علامات جفاف شديد أو أعراض تستمر أكثر من بضعة أيام، وكذلك بالنسبة إلى الأطفال الصغار وكبار السن والحوامل.</p>
<h3>الإجهاد الحراري وضربة الشمس</h3>
<p>قد تكون حرارة الصيف شديدة في جنوب إسبانيا وداخل المغرب والخليج وكثير من مناطق إيطاليا. اشرب الماء بانتظام، والبس قبعة وملابس خفيفة، وتجنب المجهود الشاق في أشد ساعات النهار حرارة، أي من أواخر الصباح إلى أواخر العصر تقريباً، واسترح في الظل. وقد يدل الارتباك أو الارتفاع الشديد في حرارة الجسم أو الجلد الساخن الجاف أو الإغماء على ضربة شمس، وهي حالة طبية طارئة تستدعي الاتصال بالإسعاف وتبريد المصاب فوراً.</p>
<h3>اضطراب الرحلات الطويلة (الجت لاغ)</h3>
<p>عبور عدة مناطق زمنية، كالسفر من المغرب إلى الخليج أو آسيا أو الأمريكتين، يربك نومك. عدّل مواعيد نومك تدريجياً قبل المغادرة ببضعة أيام، واشرب الماء في الطائرة، وقلل الكافيين، وتعرّض لضوء النهار عند الوصول، وحاول اعتماد مواعيد الأكل والنوم المحلية بسرعة.</p>
<h3>دوار الحركة</h3>
<p>قد يسبب عبور مضيق جبل طارق بالباخرة أو الطرق الجبلية المتعرجة في الأطلس غثياناً. اجلس حيث تقل الحركة، أي في وسط الباخرة أو مقدمة السيارة، وانظر إلى الأفق، وتجنب القراءة، وفكّر في دواء يؤخذ مسبقاً.</p>
<h3>لسعات البعوض والحشرات</h3>
<p>قد ينقل البعوض في بعض المناطق أمراضاً مثل حمى الضنك أو الملاريا. استعمل طارد الحشرات، والبس أكماماً طويلة مساءً، ونم تحت ناموسية أو في غرف مكيفة محمية بشبابيك حيث يُنصح بذلك.</p>
<h3>داء المرتفعات</h3>
<p>فوق نحو 2500 متر، كما في جبل توبقال بالمغرب أو في جبال الأنديز، يصاب بعض الناس بصداع وغثيان وضيق في التنفس. اصعد تدريجياً، وحافظ على الترطيب، وانزل إن ازدادت الأعراض سوءاً.</p>

<h2>المخاطر الصحية حسب الموسم</h2>
<table>
<thead><tr><th>الموسم / الحالة</th><th>أبرز المخاطر</th><th>أهم الاحتياطات</th></tr></thead>
<tbody>
<tr><td>الصيف في المغرب وإسبانيا وإيطاليا والخليج</td><td>الحرارة، الجفاف، حروق الشمس</td><td>الماء، الظل، واقي الشمس، الراحة وقت الظهيرة</td></tr>
<tr><td>الشتاء في أوروبا</td><td>الإنفلونزا الموسمية والتهابات الجهاز التنفسي</td><td>التطعيم حيث يُنصح به، نظافة اليدين</td></tr>
<tr><td>مواسم الأمطار في المناطق الاستوائية</td><td>الأمراض المنقولة بالبعوض</td><td>طارد الحشرات، ملابس ساترة، الناموسيات</td></tr>
<tr><td>الرحلات الجوية الطويلة</td><td>الجفاف، خطر الجلطات الوريدية</td><td>المشي، التمدد، شرب الماء، استشارة الطبيب لمن هم أكثر عرضة</td></tr>
</tbody>
</table>

<h2>ماذا تفعل في حالة طوارئ طبية في الخارج؟</h2>
<ul>
<li><strong>اعرف أرقام الطوارئ:</strong> الرقم 112 يعمل في كل دول الاتحاد الأوروبي. وفي المغرب يُستعمل الرقم 15 عادة للإسعاف والوقاية المدنية، والرقم 19 للشرطة في المدن. وفي الإمارات الرقم 998 للإسعاف و999 للشرطة. تحقق من أرقام وجهتك قبل السفر.</li>
<li><strong>اتصل بشركة التأمين مبكراً:</strong> لدى معظم شركات التأمين خط مساعدة يعمل على مدار الساعة، وقد تحتاج إلى الموافقة على العلاج أو توجيهك إلى مستشفيات شريكة.</li>
<li><strong>أبقِ وثائقك في المتناول:</strong> جواز السفر، وبيانات التأمين، والوصفات، وقائمة بالحساسيات والأمراض، ورقياً وعلى هاتفك.</li>
<li><strong>استعن بالصيدليات في المشكلات البسيطة:</strong> في المغرب وإسبانيا وإيطاليا وفرنسا والبرتغال يُعدّ الصيدلي مصدراً أولياً قيّماً للنصيحة، وتوجد صيدليات حراسة ليلية.</li>
<li><strong>تواصل مع قنصلية بلدك</strong> إن كنت مريضاً بشدة أو نُقلت إلى المستشفى أو احتجت إلى مساعدة في الاتصال بعائلتك.</li>
</ul>

<h2>أسئلة شائعة</h2>
<h3>هل أحتاج إلى لقاحات للسفر من المغرب إلى أوروبا؟</h3>
<p>في العادة لا تُشترط لقاحات محددة لدخول الدول الأوروبية، لكن ينبغي أن تكون لقاحاتك الروتينية محدّثة. تحقق دائماً مع طبيبك ومن المصادر الرسمية من المتطلبات الحالية.</p>
<h3>هل ماء الصنبور صالح للشرب في أوروبا؟</h3>
<p>في معظم مدن أوروبا الغربية يُعالج ماء الصنبور ويُعدّ آمناً. وفي المناطق الريفية أو عند الشك، اتبع الإرشادات المحلية أو اشرب الماء المعبأ.</p>
<h3>هل يمكنني حمل أدويتي الموصوفة في الطائرة؟</h3>
<p>نعم في العموم، في حقيبة اليد وبالعلب الأصلية ومع الوصفة. وقد يلزم التصريح عند التفتيش بالسوائل التي تتجاوز الحد المعتاد للمقصورة. وتحقق من قواعد المواد الخاضعة للرقابة في بلد الوجهة.</p>
<h3>هل تغني البطاقة الأوروبية للتأمين الصحي عن تأمين السفر؟</h3>
<p>لا، فهي تتيح الوصول إلى الرعاية العمومية الضرورية في دول الاتحاد بشروط المقيمين نفسها، لكنها لا تغطي الرعاية الخاصة ولا الإعادة إلى الوطن ولا إلغاء الرحلة.</p>
<h3>ماذا أفعل إن أصبت بتسمم غذائي أثناء السفر؟</h3>
<p>استرح، واشرب كثيراً من السوائل مع أملاح الإماهة، وتناول طعاماً خفيفاً حين تستطيع. واطلب المساعدة الطبية إن كانت الأعراض شديدة أو صاحبها دم أو حمى مرتفعة أو استمرت أكثر من بضعة أيام.</p>

<h2>سافر بصحة جيدة مع فاستامور</h2>
<p>التخطيط الصحي جزء من التخطيط الجيد للرحلة. يساعدك <strong>مساعد فاستامور الذكي</strong> على إعداد قائمة مراجعة خاصة بوجهتك، وتنظيم برامج يومية واقعية تتجنب حر الظهيرة، وترتيب الوثائق التي تحتاجها. أخبر فاستامور بوجهتك وابدأ الاستعداد لرحلة آمنة وصحية.</p>$body$
where slug = 'travel-health-guide';

-- customs-regulations-guide
update public.articles set
  title_en = $body$Customs Rules Guide: Cash, Food and Duty-Free, Morocco to Europe$body$,
  title_ar = $body$دليل قواعد الجمارك: النقد والأغذية والإعفاءات بين المغرب وأوروبا$body$,
  excerpt_en = $body$Customs rules explained: EU duty-free allowances, cash declarations, bringing food from Morocco, medicines, prohibited items and tips for travelling by car.$body$,
  excerpt_ar = $body$قواعد الجمارك بوضوح: الإعفاءات الأوروبية، والتصريح بالنقد، وإدخال الأغذية من المغرب، والأدوية، والمواد الممنوعة، ونصائح السفر بالسيارة عبر البواخر بين الضفتين.$body$,
  body_en = $body$<p>Customs is the part of the journey most travellers think about least, until a suitcase is opened at the airport or a ferry port. Customs rules decide what you can bring into a country, what you must declare and what is prohibited altogether. Getting them wrong can mean confiscated goods, fines or long delays. This guide explains the principles that apply almost everywhere, the EU rules that matter most for travellers between Morocco and Europe, and practical tips for families who travel home with full suitcases or a loaded car.</p>
<p><strong>Note:</strong> customs allowances and thresholds are set by law and change from time to time. The figures below reflect commonly published rules, but always check the official customs authority of the country you are entering before you travel.</p>

<h2>How Customs Works: The Basics</h2>
<ul>
<li><strong>Green channel ("nothing to declare"):</strong> use it only if everything you carry is within the duty-free allowances and none of it is restricted.</li>
<li><strong>Red channel ("goods to declare"):</strong> use it if you exceed allowances, carry restricted items or carry cash above the declaration threshold. Declaring is not an admission of wrongdoing. Failing to declare is what leads to penalties.</li>
<li><strong>Random checks:</strong> customs officers may inspect any traveller in any channel.</li>
<li><strong>Personal use vs commercial:</strong> allowances apply to goods for your own use or as gifts. Large quantities of the same item may be treated as commercial goods and taxed or refused.</li>
</ul>

<h2>Cash and Currency Rules</h2>
<p>Many countries require you to declare large amounts of cash, not because carrying it is illegal, but to fight money laundering.</p>
<ul>
<li><strong>European Union:</strong> anyone entering or leaving the EU carrying <strong>10,000 EUR or more</strong> in cash (or the equivalent in other currencies and certain bearer instruments) must declare it. The threshold applies per person.</li>
<li><strong>Morocco:</strong> Morocco has its own declaration rules for foreign currency brought into the country above a set threshold. The Moroccan dirham is a non-convertible currency, so there are limits on taking dirhams in and out. Check the latest rules with the Moroccan Customs Administration (ADII) and the Office des Changes before travelling.</li>
<li><strong>Other countries:</strong> the UAE, the UK, the USA and others have their own declaration thresholds and forms.</li>
</ul>
<p>Keep exchange receipts and bank withdrawal slips, especially when carrying larger sums.</p>

<h2>Duty-Free Allowances When Entering the EU</h2>
<p>When you arrive in an EU country from outside the EU, for example from Morocco, Turkey or the UAE, the following <strong>commonly cited EU allowances</strong> apply for travellers aged 17 and over. Some member states set lower limits for land and sea borders, so check the country you are entering.</p>
<table>
<thead><tr><th>Category</th><th>Typical EU allowance</th></tr></thead>
<tbody>
<tr><td>Cigarettes</td><td>200 cigarettes (some countries apply a lower limit at land borders)</td></tr>
<tr><td>Spirits over 22%</td><td>1 litre, or 2 litres of drinks up to 22%</td></tr>
<tr><td>Still wine</td><td>4 litres</td></tr>
<tr><td>Beer</td><td>16 litres</td></tr>
<tr><td>Other goods (perfume, electronics, gifts)</td><td>up to 430 EUR in value by air or sea, and 300 EUR by land. Lower limits apply to children in some countries.</td></tr>
</tbody>
</table>
<p>Goods above these allowances must be declared, and import VAT and duties may apply. You cannot split the value of one expensive item between several people.</p>

<h2>Food, Plants and Animal Products</h2>
<p>This is the area where Moroccan and Maghrebi travellers most often get caught out, usually with homemade food given by family.</p>
<h3>Bringing Food into the EU</h3>
<ul>
<li><strong>Meat and dairy:</strong> personal imports of meat, meat products, milk and dairy products from most non-EU countries, including Morocco, are banned in principle to protect animal health. That includes khlii, cheeses and homemade butter. Limited exceptions exist, such as certain baby food and medical foods.</li>
<li><strong>Fruit, vegetables and plants:</strong> under EU plant health rules, fresh fruit, vegetables, plants, cuttings and seeds from outside the EU generally require a phytosanitary certificate. A few fruits are exempt, including bananas, pineapples, coconuts, dates and durians.</li>
<li><strong>Usually allowed in personal quantities:</strong> packaged sweets and biscuits, bread, tea, coffee, spices, olive oil, argan oil, honey (within certain limits) and dried goods, provided they don't contain meat or dairy. Rules vary, so check if you are unsure.</li>
</ul>
<h3>Bringing Food into Morocco</h3>
<p>Morocco also has health controls on animal and plant products. Bringing food for personal consumption is generally tolerated in reasonable quantities, but meat, plants and seeds may be restricted. Check with ADII and ONSSA (the national food safety office) if you are carrying unusual items.</p>

<h2>Medicines</h2>
<ul>
<li>Carry medicines in their original packaging with a copy of your prescription, preferably translated or with the generic name.</li>
<li>Bring only the quantity you need for your trip.</li>
<li>Some medicines are controlled or banned in certain countries. The UAE and Saudi Arabia, for example, restrict some painkillers, sedatives and medicines containing codeine. Check the destination's official health authority or embassy website before travelling.</li>
</ul>

<h2>Items That Are Commonly Prohibited or Restricted</h2>
<ul>
<li><strong>Counterfeit goods:</strong> fake designer items can be seized in the EU, and you may be fined.</li>
<li><strong>Protected species:</strong> products made from protected animals or plants, such as some corals, shells, ivory, tortoiseshell and certain reptile skins, are covered by international CITES rules.</li>
<li><strong>Cultural goods and antiques:</strong> exporting archaeological objects, fossils or antiques usually requires a permit. Buy only from reputable sellers who can provide paperwork.</li>
<li><strong>Weapons and replicas:</strong> including some knives, pepper sprays and toy guns that look real.</li>
<li><strong>Drones:</strong> Morocco generally requires prior authorisation to bring in a drone, and drones without authorisation may be held at the border. Other countries have their own drone registration rules.</li>
<li><strong>Drugs:</strong> cannabis and other narcotics are illegal to transport across borders, regardless of the laws in your home or destination country.</li>
</ul>

<h2>Travelling by Car: Morocco and the Ferries</h2>
<p>Many families drive from France, Belgium, Spain or Italy to Morocco, especially in summer.</p>
<ul>
<li><strong>Temporary admission of vehicles:</strong> foreign-registered vehicles can enter Morocco temporarily under specific conditions and time limits, and the vehicle must leave the country again. Keep all registration and insurance documents and follow ADII's current procedures.</li>
<li><strong>Goods in the car:</strong> gifts and household items for family are common, but large quantities of new goods (electronics, appliances, clothing still with tags) may be considered commercial and taxed.</li>
<li><strong>Insurance:</strong> make sure your car insurance covers Morocco (check the green card) or buy border insurance.</li>
<li><strong>Returning to Europe:</strong> EU allowances for food, tobacco and alcohol also apply at ferry ports, where they are often lower at land and sea borders.</li>
</ul>

<h2>Tax-Free Shopping and VAT Refunds</h2>
<p>Visitors residing outside the EU can often reclaim VAT on purchases made in EU shops that offer tax-free shopping, provided the goods leave the EU in their luggage. Ask for the tax-free form in the shop, keep receipts and have the form validated by customs at your final EU exit point before checking your bags. Minimum purchase amounts and procedures vary by country.</p>

<h2>Practical Checklist</h2>
<ol>
<li>Check the official customs website of each country you will enter, including transit countries if you collect your luggage.</li>
<li>Keep receipts for expensive items, especially electronics and jewellery you take abroad, to prove you already owned them.</li>
<li>Pack medicines in your hand luggage with prescriptions.</li>
<li>Leave homemade meat and dairy products behind when flying into the EU.</li>
<li>Declare cash above the threshold, and if in doubt, declare.</li>
<li>Never carry a package for someone else without knowing exactly what it contains.</li>
</ol>

<h2>Frequently Asked Questions</h2>
<h3>Can I bring khlii, cheese or homemade smen from Morocco to France or Spain?</h3>
<p>In general, no. EU rules prohibit personal imports of meat and dairy products from most non-EU countries, and these items are often confiscated at airports and ports.</p>
<h3>How much cash can I carry between Morocco and Europe?</h3>
<p>There is no general ban on carrying cash, but you must declare 10,000 EUR or more when entering or leaving the EU. Morocco has its own rules for foreign currency and dirhams, so check ADII and the Office des Changes before you travel.</p>
<h3>Do I need to declare gifts?</h3>
<p>Gifts count towards your duty-free allowance. If their total value exceeds the allowance, declare them.</p>
<h3>What happens if I forget to declare something?</h3>
<p>Goods may be seized, and you may have to pay duties plus a fine. In serious cases, especially involving cash or prohibited items, legal proceedings can follow.</p>
<h3>Can I bring argan oil and spices back to Europe?</h3>
<p>Usually yes, in personal quantities, provided they are properly packaged. If you are flying, follow cabin liquid rules or pack oils in checked luggage.</p>

<h2>Travel Smoothly with Fastamor</h2>
<p>Preparing for customs is part of a stress-free journey. The <strong>Fastamor AI assistant</strong> can help you build a packing and documents checklist for your route between Morocco and Europe, or anywhere else, and point you to the official sources to check. Tell Fastamor where you are travelling and plan your trip with confidence.</p>$body$,
  body_ar = $body$<p>الجمارك أقل ما يفكر فيه المسافرون في رحلتهم، إلى أن تُفتح حقيبة في المطار أو في ميناء العبور. فقواعد الجمارك هي التي تحدد ما يمكنك إدخاله إلى بلد ما، وما يجب التصريح به، وما هو ممنوع تماماً، والخطأ فيها قد يعني مصادرة البضائع أو غرامات أو تأخيراً طويلاً. يشرح هذا الدليل المبادئ المعمول بها في كل مكان تقريباً، وقواعد الاتحاد الأوروبي الأهم للمسافرين بين المغرب وأوروبا، ونصائح عملية للعائلات التي تعود إلى الوطن بحقائب ممتلئة أو بسيارة محمّلة.</p>
<p><strong>ملاحظة:</strong> الإعفاءات والحدود الجمركية يحددها القانون وتتغير من حين لآخر. والأرقام الواردة هنا تعكس القواعد المنشورة عادة، لكن تحقق دائماً من الموقع الرسمي لإدارة الجمارك في البلد الذي ستدخله قبل السفر.</p>

<h2>كيف تعمل الجمارك؟ الأساسيات</h2>
<ul>
<li><strong>الممر الأخضر ("لا شيء للتصريح"):</strong> لا تستعمله إلا إذا كان كل ما تحمله ضمن حدود الإعفاء ولا يخضع لأي قيود.</li>
<li><strong>الممر الأحمر ("بضائع للتصريح"):</strong> استعمله إن تجاوزت حدود الإعفاء، أو حملت مواد مقيدة، أو مبلغاً نقدياً يفوق عتبة التصريح. فالتصريح ليس اعترافاً بمخالفة، وإنما إغفاله هو ما يجرّ العقوبات.</li>
<li><strong>التفتيش العشوائي:</strong> يحق لأعوان الجمارك تفتيش أي مسافر في أي ممر.</li>
<li><strong>الاستعمال الشخصي أم التجاري:</strong> الإعفاءات تخص البضائع المعدّة للاستعمال الشخصي أو الهدايا، أما الكميات الكبيرة من الصنف نفسه فقد تُعامل كبضائع تجارية فتُفرض عليها الرسوم أو يُرفض إدخالها.</li>
</ul>

<h2>قواعد النقد والعملات</h2>
<p>تشترط دول كثيرة التصريح بالمبالغ النقدية الكبيرة، لا لأن حملها ممنوع، بل لمكافحة غسل الأموال.</p>
<ul>
<li><strong>الاتحاد الأوروبي:</strong> كل من يدخل الاتحاد أو يغادره حاملاً <strong>10 آلاف يورو فأكثر</strong> نقداً، أو ما يعادلها بعملات أخرى وبعض الأدوات القابلة للتداول، ملزم بالتصريح بها، والعتبة محسوبة لكل شخص.</li>
<li><strong>المغرب:</strong> للمغرب قواعده الخاصة بالتصريح بالعملات الأجنبية التي تُدخل إلى البلاد فوق عتبة معينة. ولأن الدرهم المغربي عملة غير قابلة للتحويل، هناك حدود لإدخاله وإخراجه. راجع آخر القواعد لدى إدارة الجمارك والضرائب غير المباشرة ومكتب الصرف قبل السفر.</li>
<li><strong>دول أخرى:</strong> الإمارات والمملكة المتحدة والولايات المتحدة وغيرها لها عتباتها ونماذجها الخاصة للتصريح.</li>
</ul>
<p>احتفظ بوصولات الصرف وإيصالات السحب البنكي، خاصة حين تحمل مبالغ كبيرة.</p>

<h2>الإعفاءات الجمركية عند دخول الاتحاد الأوروبي</h2>
<p>عند وصولك إلى بلد من الاتحاد الأوروبي قادماً من خارجه، من المغرب أو تركيا أو الإمارات مثلاً، تُطبَّق <strong>الإعفاءات الأوروبية المعتادة</strong> التالية على المسافرين البالغين 17 سنة فأكثر. وتحدد بعض الدول الأعضاء حدوداً أدنى عند المعابر البرية والبحرية، فتحقق من قواعد البلد الذي ستدخله.</p>
<table>
<thead><tr><th>الصنف</th><th>الإعفاء الأوروبي المعتاد</th></tr></thead>
<tbody>
<tr><td>السجائر</td><td>200 سيجارة، مع حد أدنى في بعض الدول عند المعابر البرية</td></tr>
<tr><td>المشروبات الروحية فوق 22%</td><td>لتر واحد، أو لتران من المشروبات حتى 22%</td></tr>
<tr><td>النبيذ غير الفوار</td><td>4 لترات</td></tr>
<tr><td>الجعة</td><td>16 لتراً</td></tr>
<tr><td>بضائع أخرى (عطور، إلكترونيات، هدايا)</td><td>بقيمة تصل إلى 430 يورو جواً أو بحراً و300 يورو براً، مع حدود أدنى للأطفال في بعض الدول</td></tr>
</tbody>
</table>
<p>البضائع التي تتجاوز هذه الحدود يجب التصريح بها، وقد تُفرض عليها ضريبة القيمة المضافة والرسوم الجمركية. ولا يمكن تقسيم قيمة سلعة واحدة غالية على عدة أشخاص.</p>

<h2>الأغذية والنباتات والمنتجات الحيوانية</h2>
<p>هذا هو المجال الذي يقع فيه المسافرون المغاربة والمغاربيون في المشاكل أكثر من غيره، وغالباً بسبب أكل منزلي أهدته العائلة.</p>
<h3>إدخال الأغذية إلى الاتحاد الأوروبي</h3>
<ul>
<li><strong>اللحوم ومشتقات الحليب:</strong> إدخال اللحوم ومنتجاتها والحليب ومشتقاته للاستعمال الشخصي من معظم الدول غير الأوروبية، ومنها المغرب، ممنوع من حيث المبدأ حمايةً لصحة الحيوان. ويشمل ذلك الخليع والأجبان والزبدة المنزلية، مع استثناءات محدودة كبعض أغذية الرضع والأغذية الطبية.</li>
<li><strong>الفواكه والخضر والنباتات:</strong> بموجب قواعد الصحة النباتية الأوروبية، تتطلب الفواكه والخضر الطازجة والنباتات والعُقَل والبذور القادمة من خارج الاتحاد عموماً شهادة صحة نباتية، مع إعفاء بعض الفواكه، ومنها الموز والأناناس وجوز الهند والتمر والدوريان.</li>
<li><strong>ما يُسمح به عادة بكميات شخصية:</strong> الحلويات والبسكويت المعلّب، والخبز، والشاي، والقهوة، والتوابل، وزيت الزيتون، وزيت الأركان، والعسل ضمن حدود معينة، والمواد الجافة، شرط ألا تحتوي على لحم أو حليب. وتختلف القواعد، فتحقق إن كنت غير متأكد.</li>
</ul>
<h3>إدخال الأغذية إلى المغرب</h3>
<p>للمغرب أيضاً رقابة صحية على المنتجات الحيوانية والنباتية. ويُتسامح عموماً مع إدخال الأغذية للاستهلاك الشخصي بكميات معقولة، لكن اللحوم والنباتات والبذور قد تخضع لقيود. راجع إدارة الجمارك والمكتب الوطني للسلامة الصحية للمنتجات الغذائية إن كنت تحمل مواد غير مألوفة.</p>

<h2>الأدوية</h2>
<ul>
<li>احمل الأدوية في علبها الأصلية مع نسخة من الوصفة، ويُفضَّل أن تكون مترجمة أو تتضمن الاسم العلمي للدواء.</li>
<li>لا تحمل إلا الكمية التي تحتاجها لرحلتك.</li>
<li>بعض الأدوية خاضعة للرقابة أو ممنوعة في دول معينة، فالإمارات والسعودية مثلاً تقيّدان بعض المسكنات والمهدئات والأدوية المحتوية على الكودايين. راجع الموقع الرسمي للسلطة الصحية أو سفارة بلد الوجهة قبل السفر.</li>
</ul>

<h2>مواد ممنوعة أو مقيدة في الغالب</h2>
<ul>
<li><strong>البضائع المقلدة:</strong> قد تُصادر السلع المقلدة للماركات العالمية في الاتحاد الأوروبي وقد تتعرض لغرامة.</li>
<li><strong>الأنواع المحمية:</strong> المنتجات المصنوعة من حيوانات أو نباتات محمية، كبعض المرجان والأصداف والعاج وصدف السلاحف وجلود بعض الزواحف، تخضع لاتفاقية "سايتس" الدولية.</li>
<li><strong>الممتلكات الثقافية والتحف:</strong> تصدير القطع الأثرية أو المستحاثات أو التحف القديمة يتطلب عادة ترخيصاً، فاشترِ فقط من بائعين موثوقين يقدمون الوثائق اللازمة.</li>
<li><strong>الأسلحة ونماذجها:</strong> ومنها بعض السكاكين ورذاذ الفلفل والألعاب التي تشبه الأسلحة الحقيقية.</li>
<li><strong>الطائرات المسيّرة:</strong> يشترط المغرب عموماً ترخيصاً مسبقاً لإدخال "الدرون"، وقد تُحجز عند الحدود إن لم يكن معها ترخيص. ولدول أخرى قواعدها الخاصة بتسجيل الطائرات المسيّرة.</li>
<li><strong>المخدرات:</strong> نقل القنب الهندي وغيره من المخدرات عبر الحدود غير قانوني، أياً كانت القوانين في بلد إقامتك أو بلد وجهتك.</li>
</ul>

<h2>السفر بالسيارة: المغرب والبواخر</h2>
<p>تسافر عائلات كثيرة بالسيارة من فرنسا أو بلجيكا أو إسبانيا أو إيطاليا إلى المغرب، خاصة في الصيف.</p>
<ul>
<li><strong>القبول المؤقت للمركبات:</strong> يمكن للسيارات المسجلة في الخارج دخول المغرب مؤقتاً وفق شروط ومدد محددة، ويجب أن تغادر البلاد بعد ذلك. احتفظ بكل وثائق التسجيل والتأمين، واتبع الإجراءات الحالية لإدارة الجمارك.</li>
<li><strong>البضائع في السيارة:</strong> الهدايا والأغراض المنزلية للعائلة أمر شائع، لكن الكميات الكبيرة من البضائع الجديدة، كالأجهزة الإلكترونية والمنزلية والملابس التي ما زالت تحمل بطاقاتها، قد تُعدّ تجارية فتُفرض عليها رسوم.</li>
<li><strong>التأمين:</strong> تأكد أن تأمين سيارتك يغطي المغرب (راجع البطاقة الخضراء)، أو اشترِ تأميناً حدودياً.</li>
<li><strong>العودة إلى أوروبا:</strong> تُطبَّق الإعفاءات الأوروبية الخاصة بالأغذية والتبغ والكحول في الموانئ أيضاً، وكثيراً ما تكون أدنى في المعابر البرية والبحرية.</li>
</ul>

<h2>التسوق المعفى من الضريبة واسترداد الضريبة على القيمة المضافة</h2>
<p>يستطيع الزوار المقيمون خارج الاتحاد الأوروبي في الغالب استرداد الضريبة على القيمة المضافة عن مشترياتهم من المتاجر الأوروبية التي توفر خدمة التسوق المعفى، شرط أن تغادر البضائع الاتحاد في أمتعتهم. اطلب نموذج الاسترداد في المتجر، واحتفظ بالفواتير، واحرص على ختم النموذج لدى الجمارك في آخر نقطة خروج من الاتحاد قبل تسجيل الحقائب. ويختلف الحد الأدنى للشراء والإجراءات من بلد لآخر.</p>

<h2>قائمة مراجعة عملية</h2>
<ol>
<li>راجع الموقع الرسمي للجمارك في كل بلد ستدخله، بما في ذلك بلدان العبور إن كنت ستستلم أمتعتك فيها.</li>
<li>احتفظ بفواتير الأغراض الثمينة، خاصة الإلكترونيات والمجوهرات التي تأخذها معك، لتثبت أنها كانت في ملكك قبل السفر.</li>
<li>ضع الأدوية في حقيبة اليد مع الوصفات.</li>
<li>اترك اللحوم ومشتقات الحليب المنزلية حين تسافر جواً إلى الاتحاد الأوروبي.</li>
<li>صرّح بالنقد الذي يتجاوز العتبة، وعند الشك صرّح.</li>
<li>لا تحمل أبداً طرداً لشخص آخر دون أن تعرف بالضبط ما بداخله.</li>
</ol>

<h2>أسئلة شائعة</h2>
<h3>هل يمكنني إدخال الخليع أو الجبن أو السمن البلدي من المغرب إلى فرنسا أو إسبانيا؟</h3>
<p>في العموم لا، فقواعد الاتحاد الأوروبي تمنع إدخال اللحوم ومشتقات الحليب للاستعمال الشخصي من معظم الدول غير الأوروبية، وكثيراً ما تُصادر هذه المواد في المطارات والموانئ.</p>
<h3>كم يمكنني أن أحمل من النقود بين المغرب وأوروبا؟</h3>
<p>لا يوجد منع عام لحمل النقود، لكن يجب التصريح بمبلغ 10 آلاف يورو فأكثر عند دخول الاتحاد الأوروبي أو مغادرته. وللمغرب قواعده الخاصة بالعملات الأجنبية والدرهم، فراجع إدارة الجمارك ومكتب الصرف قبل السفر.</p>
<h3>هل يجب التصريح بالهدايا؟</h3>
<p>الهدايا تُحتسب ضمن حد الإعفاء، فإن تجاوزت قيمتها الإجمالية هذا الحد وجب التصريح بها.</p>
<h3>ماذا يحدث إن نسيت التصريح بشيء؟</h3>
<p>قد تُصادر البضائع وقد تُلزم بدفع الرسوم مع غرامة، وفي الحالات الخطيرة، خاصة المتعلقة بالنقد أو المواد الممنوعة، قد تُتخذ إجراءات قانونية.</p>
<h3>هل يمكنني حمل زيت الأركان والتوابل إلى أوروبا؟</h3>
<p>عادة نعم، بكميات شخصية ومعبأة جيداً. وإن كنت مسافراً جواً فالتزم بقواعد السوائل في المقصورة أو ضع الزيوت في الحقيبة المسجلة.</p>

<h2>سافر براحة بال مع فاستامور</h2>
<p>الاستعداد للجمارك جزء من رحلة خالية من التوتر. يساعدك <strong>مساعد فاستامور الذكي</strong> على إعداد قائمة بالأمتعة والوثائق تناسب مسارك بين المغرب وأوروبا أو أي وجهة أخرى، ويرشدك إلى المصادر الرسمية التي ينبغي مراجعتها. أخبر فاستامور بوجهتك وخطط لرحلتك بثقة.</p>$body$
where slug = 'customs-regulations-guide';

-- travel-preparation-guide
update public.articles set
  title_en = $body$Pre-Travel Checklist: Passport, Visa, Insurance, Money and Tips$body$,
  title_ar = $body$قائمة الاستعداد للسفر: الجواز والتأشيرة والتأمين والمال والنصائح$body$,
  excerpt_en = $body$A complete pre-travel checklist: passport validity, Schengen visas, travel insurance, money, phones and plugs, documents and what to do on departure day.$body$,
  excerpt_ar = $body$قائمة كاملة للاستعداد للسفر: صلاحية الجواز وتأشيرة شنغن وتأمين السفر والمال والهاتف والمقابس الكهربائية والوثائق، وما يجب فعله في يوم المغادرة بالتفصيل.$body$,
  body_en = $body$<p>A good trip starts long before you reach the airport. Most travel problems, such as a passport that expires too soon, a visa applied for too late, an unusable bank card or a forgotten adapter, can be avoided with a little planning. This guide gives you a clear pre-travel checklist organised by timeline. It is designed for travellers from Morocco and the Moroccan diaspora in Europe, whether you are planning a city break, a family holiday or a long trip abroad.</p>

<h2>Three Months or More Before You Travel</h2>
<h3>Check Your Passport</h3>
<ul>
<li>Many countries require your passport to be valid for at least <strong>three to six months beyond your planned departure date</strong>. Schengen countries require at least three months beyond the date you intend to leave the Schengen Area, and the passport must have been issued within the previous ten years.</li>
<li>Make sure you have enough blank pages for stamps and visas.</li>
<li>Passport renewal can take several weeks, longer in peak season, so start early. That applies at Moroccan consulates abroad too.</li>
<li>Children need their own passports, and some countries ask for a parental authorisation if a minor travels without both parents.</li>
</ul>
<h3>Find Out Whether You Need a Visa or Travel Authorisation</h3>
<p>Entry requirements depend on your nationality, your residence status and the purpose of your trip:</p>
<ul>
<li><strong>Schengen Area (Spain, France, Italy, Portugal and others):</strong> Moroccan passport holders generally need a short-stay Schengen visa unless they hold a valid Schengen residence permit. Applications can usually be submitted up to six months before travel and at least 15 days before. Apply through the consulate of your main destination or its official visa provider.</li>
<li><strong>United Kingdom:</strong> the UK is outside Schengen and has its own visa system. Many visa-exempt nationalities now need an Electronic Travel Authorisation (ETA) before travelling, while Moroccan citizens generally need a UK visitor visa.</li>
<li><strong>Gulf states, Turkey and others:</strong> rules vary widely. Some offer e-visas, some visas on arrival, and some require a visa in advance.</li>
<li><strong>EU digital borders:</strong> the EU's Entry/Exit System and, later, the ETIAS travel authorisation for visa-exempt travellers are being introduced in stages.</li>
</ul>
<p>Always use official government websites and accredited visa providers. Beware of unofficial sites that charge extra fees.</p>
<h3>Set Your Budget</h3>
<p>List your main costs: flights or ferry, accommodation, local transport, food, activities, insurance, visa fees and a buffer for unexpected expenses. Many travellers add an emergency margin of around 10–20% of the total budget. Prices change by season, so compare dates if you are flexible.</p>

<h2>One to Two Months Before</h2>
<h3>Book the Essentials</h3>
<ul>
<li>Flights or ferry tickets. In summer, routes between Europe and Morocco fill up early.</li>
<li>Accommodation, especially in high season or during festivals and major events.</li>
<li>Timed-entry attractions that sell out, such as the Alhambra, the Vatican Museums, the Sagrada Família and the Last Supper in Milan.</li>
<li>Airport transfers or car hire, particularly if you arrive late at night.</li>
</ul>
<h3>Buy Travel Insurance</h3>
<p>Choose a policy that covers medical emergencies, repatriation, cancellation and lost luggage. It is mandatory for Schengen visa applications and strongly recommended for every trip. Check exclusions for pre-existing conditions, sports and electronics.</p>
<h3>Health Preparation</h3>
<p>See your doctor or a travel clinic four to eight weeks before departure for vaccines and medical advice, renew prescriptions, and check whether your medicines are allowed at your destination.</p>

<h2>Two to Three Weeks Before</h2>
<h3>Money and Payments</h3>
<ul>
<li>Tell your bank you will be travelling, if required, and check foreign transaction and ATM fees.</li>
<li>Carry at least two payment methods, such as a debit card and a credit card, kept in separate places.</li>
<li>Have a small amount of local currency for arrival, taxis and tips. The Moroccan dirham is generally obtained inside Morocco.</li>
<li>Find out whether your destination is mainly card-based (much of northern Europe) or cash-based (many markets, rural areas and small shops in Morocco and elsewhere).</li>
<li>When paying by card abroad, choosing to pay in the local currency rather than your home currency often avoids poor conversion rates.</li>
</ul>
<h3>Phone and Internet</h3>
<ul>
<li>Check your roaming plan. EU "roam like at home" rules apply within the EU, but not automatically in Morocco, the UK, Switzerland or Turkey.</li>
<li>Consider a local SIM card or an eSIM for longer trips.</li>
<li>Download offline maps, translation apps, airline apps and your booking confirmations.</li>
</ul>
<h3>Plugs and Electricity</h3>
<table>
<thead><tr><th>Destination</th><th>Typical plug type</th><th>Voltage</th></tr></thead>
<tbody>
<tr><td>Morocco, Spain, France, Portugal, Italy, Belgium</td><td>Type C / E / F (Italy also uses Type L)</td><td>230 V</td></tr>
<tr><td>United Kingdom, Ireland, UAE, Malta</td><td>Type G</td><td>230 V</td></tr>
<tr><td>USA, Canada, Mexico</td><td>Type A / B</td><td>120 V</td></tr>
<tr><td>Turkey, Egypt</td><td>Type C / F</td><td>220–230 V</td></tr>
</tbody>
</table>
<p>A universal adapter is a sensible investment. Most phone and laptop chargers handle both 120 V and 230 V, but check before plugging in hair dryers and other appliances.</p>

<h2>The Week Before</h2>
<ul>
<li><strong>Documents:</strong> print or save copies of your passport, visa, insurance, bookings and tickets. Store copies separately from the originals and in a secure cloud folder.</li>
<li><strong>Emergency contacts:</strong> note your insurer's assistance number, your bank's card-blocking number and your consulate's details at your destination.</li>
<li><strong>Luggage rules:</strong> check your airline's cabin and hold allowances. Low-cost airlines are strict about size and weight, and liquids in hand luggage are limited at most airports.</li>
<li><strong>Weather and clothing:</strong> check the forecast and local dress expectations, for example for mosques, churches and conservative areas.</li>
<li><strong>Local rules:</strong> read up on customs allowances, laws on drones and medicines, and basic etiquette.</li>
</ul>

<h2>The Day Before and Departure Day</h2>
<ol>
<li>Check in online and save your boarding pass.</li>
<li>Check your flight status and terminal.</li>
<li>Charge your phone, power bank and devices. Power banks usually have to go in hand luggage.</li>
<li>Pack your passport, wallet, medicines, chargers and essentials in your hand luggage.</li>
<li>Leave enough time: airlines and airports often recommend arriving around two to three hours before international flights, more in peak periods.</li>
<li>At home: empty the fridge, unplug appliances, lock windows and tell a neighbour or relative you are away.</li>
</ol>

<h2>Respecting Local Customs</h2>
<p>Learn a few words of the local language, read about tipping customs, dress codes and photography etiquette, and be aware of religious holidays such as Ramadan, Christmas or national holidays that can affect opening hours. Tipping practices vary widely. Service is often included in some European countries, while in others a small tip for good service is customary. Check local guidance rather than applying your home habits.</p>

<h2>Frequently Asked Questions</h2>
<h3>How early should I apply for a Schengen visa?</h3>
<p>Applications can generally be submitted up to six months before travel and no later than 15 days before. In practice, applying as early as possible, especially for summer, gives you more flexibility if appointment slots are limited.</p>
<h3>How long must my passport be valid?</h3>
<p>It depends on the destination. Many countries ask for six months, and Schengen countries require at least three months beyond your planned departure from the area. Check each country's official requirements.</p>
<h3>Is travel insurance really necessary?</h3>
<p>Yes. It is required for Schengen visas and can save you a lot of money and stress if you fall ill, have an accident or need to cancel your trip.</p>
<h3>Should I take cash or cards?</h3>
<p>Both. Cards are convenient and safer for larger payments, while cash is still essential in many markets, taxis and small businesses, especially in Morocco.</p>
<h3>What documents should I keep copies of?</h3>
<p>Your passport, visa, ID card, insurance policy, flight and hotel bookings, driving licence and prescriptions. Keep them both on paper and digitally.</p>

<h2>Plan Smarter with Fastamor</h2>
<p>With so many details to manage, a planning companion helps. The <strong>Fastamor AI assistant</strong> can create a personalised pre-travel checklist for your destination and dates, help you compare flights, hotels and transfers, and remind you of the official sources to check for visas and entry rules. Tell Fastamor about your next trip and start preparing today.</p>$body$,
  body_ar = $body$<p>تبدأ الرحلة الناجحة قبل الوصول إلى المطار بوقت طويل. فمعظم المشكلات، كجواز سفر تنتهي صلاحيته مبكراً، أو تأشيرة طُلبت متأخرة، أو بطاقة بنكية لا تعمل، أو محوّل كهربائي منسي، يمكن تفاديها بقليل من التخطيط. يقدم هذا الدليل قائمة مراجعة واضحة لما قبل السفر مرتبة حسب الجدول الزمني، وهو موجّه للمسافرين من المغرب ولأبناء الجالية المغربية في أوروبا، سواء كنت تخطط لعطلة قصيرة في مدينة، أو عطلة عائلية، أو رحلة طويلة في الخارج.</p>

<h2>قبل السفر بثلاثة أشهر أو أكثر</h2>
<h3>تحقق من جواز سفرك</h3>
<ul>
<li>تشترط دول كثيرة أن يبقى جوازك صالحاً <strong>ثلاثة إلى ستة أشهر بعد تاريخ المغادرة المقرر</strong>. وتشترط دول شنغن صلاحية لا تقل عن ثلاثة أشهر بعد تاريخ مغادرة فضاء شنغن، وأن يكون الجواز قد صدر خلال السنوات العشر الأخيرة.</li>
<li>تأكد من وجود صفحات فارغة كافية للأختام والتأشيرات.</li>
<li>قد يستغرق تجديد الجواز عدة أسابيع، وأكثر في مواسم الذروة، فابدأ مبكراً، ويشمل ذلك القنصليات المغربية في الخارج.</li>
<li>يحتاج الأطفال إلى جوازات خاصة بهم، وقد تطلب بعض الدول إذناً من الوالدين إن سافر القاصر دون أحدهما أو كليهما.</li>
</ul>
<h3>اعرف هل تحتاج إلى تأشيرة أو ترخيص سفر</h3>
<p>تعتمد شروط الدخول على جنسيتك ووضع إقامتك والغرض من رحلتك:</p>
<ul>
<li><strong>فضاء شنغن (إسبانيا وفرنسا وإيطاليا والبرتغال وغيرها):</strong> يحتاج حاملو الجواز المغربي عموماً إلى تأشيرة شنغن قصيرة الإقامة ما لم تكن لديهم إقامة سارية في دولة من دول شنغن. ويمكن عادة تقديم الطلب قبل السفر بستة أشهر كحد أقصى وبخمسة عشر يوماً كحد أدنى، لدى قنصلية الوجهة الرئيسية أو مزوّد خدماتها المعتمد.</li>
<li><strong>المملكة المتحدة:</strong> خارج فضاء شنغن ولها نظام تأشيرات مستقل. تحتاج جنسيات كثيرة معفاة من التأشيرة إلى ترخيص السفر الإلكتروني قبل السفر، أما المواطنون المغاربة فيحتاجون عموماً إلى تأشيرة زيارة بريطانية.</li>
<li><strong>دول الخليج وتركيا وغيرها:</strong> تختلف القواعد كثيراً، فبعضها يمنح تأشيرات إلكترونية، وبعضها تأشيرة عند الوصول، وبعضها يشترط التأشيرة مسبقاً.</li>
<li><strong>الحدود الرقمية الأوروبية:</strong> يُطبَّق نظام الدخول والخروج الأوروبي، ثم ترخيص السفر "إتياس" لاحقاً للمسافرين المعفيين من التأشيرة، على مراحل.</li>
</ul>
<p>استعمل دائماً المواقع الحكومية الرسمية ومزوّدي التأشيرات المعتمدين، واحذر المواقع غير الرسمية التي تفرض رسوماً إضافية.</p>
<h3>حدد ميزانيتك</h3>
<p>اكتب تكاليفك الرئيسية: الطيران أو الباخرة، والإقامة، والتنقل المحلي، والأكل، والأنشطة، والتأمين، ورسوم التأشيرة، وهامشاً للمصاريف غير المتوقعة. ويضيف كثير من المسافرين هامش طوارئ يقارب 10 إلى 20% من الميزانية الإجمالية. وبما أن الأسعار تتغير حسب الموسم، قارن بين التواريخ إن كنت مرناً.</p>

<h2>قبل السفر بشهر أو شهرين</h2>
<h3>احجز الأساسيات</h3>
<ul>
<li>تذاكر الطيران أو الباخرة، ففي الصيف تمتلئ الخطوط بين أوروبا والمغرب مبكراً.</li>
<li>الإقامة، خاصة في الموسم المرتفع وخلال المهرجانات والفعاليات الكبرى.</li>
<li>المعالم ذات الدخول بمواعيد التي تنفد تذاكرها، مثل قصر الحمراء ومتاحف الفاتيكان وساغرادا فاميليا ولوحة العشاء الأخير في ميلانو.</li>
<li>النقل من المطار أو استئجار السيارة، لا سيما إن كان وصولك في وقت متأخر من الليل.</li>
</ul>
<h3>اشترِ تأمين السفر</h3>
<p>اختر وثيقة تغطي الطوارئ الطبية والإعادة إلى الوطن والإلغاء وضياع الأمتعة. وهو إلزامي لطلبات تأشيرة شنغن ومُستحسن بشدة في كل رحلة. تحقق من الاستثناءات المتعلقة بالأمراض السابقة والرياضات والأجهزة الإلكترونية.</p>
<h3>الاستعداد الصحي</h3>
<p>زر طبيبك أو عيادة طب السفر قبل المغادرة بأربعة إلى ثمانية أسابيع للقاحات والنصائح الطبية، وجدّد وصفاتك، وتحقق من أن أدويتك مسموح بها في بلد الوجهة.</p>

<h2>قبل السفر بأسبوعين إلى ثلاثة</h2>
<h3>المال ووسائل الدفع</h3>
<ul>
<li>أخبر بنكك بسفرك إن لزم الأمر، وتحقق من رسوم المعاملات الخارجية والسحب.</li>
<li>احمل وسيلتي دفع على الأقل، كبطاقة خصم وبطاقة ائتمان، واحفظهما في مكانين مختلفين.</li>
<li>احتفظ بمبلغ صغير بالعملة المحلية للوصول وسيارات الأجرة والإكراميات. والدرهم المغربي يُحصل عليه عادة داخل المغرب.</li>
<li>اعرف هل تعتمد وجهتك أساساً على البطاقات، كمعظم شمال أوروبا، أم على النقد، ككثير من الأسواق والمناطق القروية والمحلات الصغيرة في المغرب وغيره.</li>
<li>عند الدفع بالبطاقة في الخارج، يساعدك اختيار الدفع بالعملة المحلية بدل عملة بلدك غالباً على تجنب أسعار تحويل غير مناسبة.</li>
</ul>
<h3>الهاتف والإنترنت</h3>
<ul>
<li>تحقق من باقة التجوال لديك. فقواعد التجوال الأوروبي بالسعر المحلي تسري داخل الاتحاد، لكنها لا تشمل تلقائياً المغرب أو المملكة المتحدة أو سويسرا أو تركيا.</li>
<li>فكّر في شريحة محلية أو شريحة إلكترونية للرحلات الطويلة.</li>
<li>حمّل الخرائط دون اتصال، وتطبيقات الترجمة وشركات الطيران، وتأكيدات الحجز.</li>
</ul>
<h3>المقابس والكهرباء</h3>
<table>
<thead><tr><th>الوجهة</th><th>نوع المقبس المعتاد</th><th>الجهد</th></tr></thead>
<tbody>
<tr><td>المغرب، إسبانيا، فرنسا، البرتغال، إيطاليا، بلجيكا</td><td>النوع C / E / F (وفي إيطاليا أيضاً النوع L)</td><td>230 فولت</td></tr>
<tr><td>المملكة المتحدة، أيرلندا، الإمارات، مالطا</td><td>النوع G</td><td>230 فولت</td></tr>
<tr><td>الولايات المتحدة، كندا، المكسيك</td><td>النوع A / B</td><td>120 فولت</td></tr>
<tr><td>تركيا، مصر</td><td>النوع C / F</td><td>220–230 فولت</td></tr>
</tbody>
</table>
<p>المحوّل العالمي استثمار مفيد. وتتحمل معظم شواحن الهواتف والحواسيب جهدي 120 و230 فولت، لكن تحقق قبل توصيل مجففات الشعر وغيرها من الأجهزة.</p>

<h2>في الأسبوع الأخير</h2>
<ul>
<li><strong>الوثائق:</strong> اطبع أو احفظ نسخاً من الجواز والتأشيرة والتأمين والحجوزات والتذاكر، واحفظ النسخ بعيداً عن الأصول وفي مجلد سحابي آمن.</li>
<li><strong>أرقام الطوارئ:</strong> دوّن رقم مساعدة شركة التأمين، ورقم إيقاف البطاقة لدى بنكك، وبيانات قنصلية بلدك في الوجهة.</li>
<li><strong>قواعد الأمتعة:</strong> راجع حدود حقيبة المقصورة والحقيبة المسجلة لدى شركة الطيران، فالشركات منخفضة التكلفة صارمة في المقاسات والأوزان، والسوائل في حقيبة اليد محدودة في معظم المطارات.</li>
<li><strong>الطقس واللباس:</strong> تابع توقعات الطقس وتعرّف على ما يُنتظر من لباس محلياً، في المساجد والكنائس والمناطق المحافظة مثلاً.</li>
<li><strong>القواعد المحلية:</strong> اطّلع على حدود الإعفاء الجمركي والقوانين الخاصة بالطائرات المسيّرة والأدوية وآداب السلوك الأساسية.</li>
</ul>

<h2>يوم قبل السفر ويوم المغادرة</h2>
<ol>
<li>سجّل دخولك إلكترونياً واحفظ بطاقة الصعود.</li>
<li>تحقق من حالة الرحلة ومن المبنى الذي ستغادر منه.</li>
<li>اشحن هاتفك وبطارية الشحن المتنقلة وأجهزتك، وتذكّر أن بطاريات الشحن توضع غالباً في حقيبة اليد.</li>
<li>ضع الجواز والمحفظة والأدوية والشواحن والضروريات في حقيبة اليد.</li>
<li>امنح نفسك وقتاً كافياً، فشركات الطيران والمطارات توصي غالباً بالحضور قبل الرحلات الدولية بساعتين إلى ثلاث، وأكثر في فترات الذروة.</li>
<li>في البيت: أفرغ الثلاجة، وافصل الأجهزة، وأغلق النوافذ، وأخبر جاراً أو قريباً بغيابك.</li>
</ol>

<h2>احترام العادات المحلية</h2>
<p>تعلّم بضع كلمات من اللغة المحلية، واقرأ عن عادات الإكرامية وقواعد اللباس وآداب التصوير، وانتبه للمناسبات الدينية والأعياد الوطنية كرمضان وأعياد الميلاد التي قد تؤثر في مواعيد العمل. وتختلف عادات الإكرامية كثيراً، ففي بعض الدول الأوروبية تكون الخدمة محتسبة غالباً، وفي غيرها جرت العادة على إكرامية صغيرة مقابل الخدمة الجيدة. استرشد بالتوجيهات المحلية بدل تطبيق عاداتك الخاصة.</p>

<h2>أسئلة شائعة</h2>
<h3>متى ينبغي أن أطلب تأشيرة شنغن؟</h3>
<p>يمكن عموماً تقديم الطلب قبل السفر بستة أشهر كحد أقصى وبخمسة عشر يوماً كحد أدنى. وعملياً، يمنحك التقديم في أبكر وقت، خاصة للصيف، مرونة أكبر إن كانت المواعيد المتاحة محدودة.</p>
<h3>كم يجب أن تكون مدة صلاحية جوازي؟</h3>
<p>يعتمد ذلك على الوجهة، فدول كثيرة تطلب ستة أشهر، ودول شنغن تشترط ثلاثة أشهر على الأقل بعد مغادرتك المقررة للفضاء. تحقق من المتطلبات الرسمية لكل بلد.</p>
<h3>هل تأمين السفر ضروري فعلاً؟</h3>
<p>نعم، فهو إلزامي لتأشيرات شنغن، وقد يوفر عليك كثيراً من المال والقلق إن مرضت أو تعرضت لحادث أو اضطررت إلى إلغاء رحلتك.</p>
<h3>هل أحمل النقد أم البطاقات؟</h3>
<p>الاثنين معاً. فالبطاقات عملية وأكثر أماناً للمبالغ الكبيرة، والنقد ما زال ضرورياً في كثير من الأسواق وسيارات الأجرة والمحلات الصغيرة، خاصة في المغرب.</p>
<h3>ما الوثائق التي يجب الاحتفاظ بنسخ منها؟</h3>
<p>جواز السفر، والتأشيرة، وبطاقة الهوية، ووثيقة التأمين، وحجوزات الطيران والفندق، ورخصة السياقة، والوصفات الطبية، ورقياً ورقمياً.</p>

<h2>خطط بذكاء مع فاستامور</h2>
<p>مع كثرة التفاصيل، يفيدك رفيق في التخطيط. يستطيع <strong>مساعد فاستامور الذكي</strong> إعداد قائمة مراجعة شخصية لما قبل السفر حسب وجهتك وتواريخك، ومساعدتك على مقارنة الرحلات والفنادق وخدمات النقل، وتذكيرك بالمصادر الرسمية التي ينبغي مراجعتها بشأن التأشيرات وشروط الدخول. أخبر فاستامور برحلتك القادمة وابدأ الاستعداد اليوم.</p>$body$
where slug = 'travel-preparation-guide';

-- ultimate-guide-airport-transfer-services
update public.articles set
  title_en = $body$Airport Transfer Guide: Private, Shared, Taxi or Public Transport$body$,
  title_ar = $body$دليل النقل من المطار: خاص أم مشترك أم سيارة أجرة أم نقل عمومي؟$body$,
  excerpt_en = $body$Airport transfers explained: private vs shared, taxis, apps and trains, approximate costs, and tips for Casablanca, Marrakech, Madrid, Paris, Rome and Dubai.$body$,
  excerpt_ar = $body$كل ما تحتاج معرفته عن النقل من المطار: الخاص والمشترك وسيارات الأجرة والقطارات، مع التكاليف التقريبية ونصائح لمطارات الدار البيضاء ومراكش ومدريد ودبي.$body$,
  body_en = $body$<p>After a long flight, the last thing you want is to argue over a taxi fare, drag suitcases through a car park looking for a ride-hailing pickup point, or wait an hour for a shuttle. An airport transfer, a ride arranged in advance between the airport and your hotel or home, removes that stress. This guide explains the different types of airport transfers, how booking works, how much you might pay and how to choose the right option at major airports in Morocco, Europe and the UAE.</p>

<h2>What Is an Airport Transfer?</h2>
<p>An airport transfer is pre-arranged transport between an airport and another location, such as a hotel, a home, a cruise port or a train station. Unlike a taxi you hail on arrival, a transfer is booked in advance for a specific time and passenger count. Many services also track your flight and adjust the pickup if you are delayed. Transfers can be private (just your group) or shared (with other passengers).</p>

<h2>The Main Types of Airport Transfers</h2>
<h3>Private Transfer</h3>
<p>A driver meets you in the arrivals hall, often holding a sign with your name, helps with luggage and drives you directly to your address. You choose the vehicle: sedan, minivan, SUV or a luxury car.</p>
<ul>
<li><strong>Best for:</strong> families, groups, late-night arrivals, travellers with heavy luggage, and first-time visitors to a country.</li>
<li><strong>Pros:</strong> fixed price, no waiting, door-to-door and child seats on request.</li>
<li><strong>Cons:</strong> more expensive than public transport for solo travellers.</li>
</ul>
<h3>Shared Shuttle</h3>
<p>A van or minibus carries several passengers to hotels in the same area and drops them off one by one.</p>
<ul>
<li><strong>Best for:</strong> solo travellers and couples on a budget heading to central or resort areas.</li>
<li><strong>Cons:</strong> longer journeys with several stops, and you may wait for other flights.</li>
</ul>
<h3>Taxis</h3>
<p>Official taxi ranks are available at most airports. Some cities apply fixed fares from the airport to the centre, while others use meters.</p>
<ul>
<li><strong>Best for:</strong> spontaneous trips when queues are short.</li>
<li><strong>Cons:</strong> prices and quality vary, and in some destinations visitors risk being overcharged.</li>
</ul>
<h3>Ride-Hailing Apps</h3>
<p>Apps are common in many European cities and in the UAE. Pickup is often from a designated zone, and prices rise at busy times. Availability and regulation differ greatly between countries, so check before relying on an app.</p>
<h3>Public Transport</h3>
<p>Trains, metros and buses are usually the cheapest option and are often fast in big cities. They work best if you travel light and arrive during the day.</p>

<h2>How Booking a Transfer Works</h2>
<ol>
<li><strong>Enter your details:</strong> airport, destination address, date, time and number of passengers and bags.</li>
<li><strong>Choose a vehicle:</strong> make sure there is room for everyone's luggage, including pushchairs, wheelchairs or sports equipment.</li>
<li><strong>Add your flight number:</strong> this allows the operator to monitor delays.</li>
<li><strong>Request extras:</strong> child seats, a meet-and-greet sign, extra stops or assistance for reduced mobility.</li>
<li><strong>Pay and receive a voucher:</strong> it should include the meeting point, the driver's or local office's phone number and the waiting time policy.</li>
<li><strong>Meet your driver:</strong> follow the instructions after you clear passport control and collect your luggage.</li>
</ol>

<h2>How Much Do Airport Transfers Cost?</h2>
<p>Prices depend on the city, distance, vehicle type, time of day and season. The table below gives <strong>approximate, indicative ranges</strong> for a typical airport-to-city-centre journey. Always compare current quotes.</p>
<table>
<thead><tr><th>Option</th><th>Typical cost level</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Public transport</td><td>Lowest, often a few euros or dirhams</td><td>Fast in big cities, harder with heavy luggage</td></tr>
<tr><td>Shared shuttle</td><td>Low to moderate, per person</td><td>Several stops, fixed schedules</td></tr>
<tr><td>Official taxi</td><td>Moderate</td><td>Fixed or metered depending on the city; night and luggage surcharges may apply</td></tr>
<tr><td>Private transfer (sedan)</td><td>Moderate to high, per vehicle</td><td>Fixed price, meet and greet, good value for groups</td></tr>
<tr><td>Minivan or luxury car</td><td>High, per vehicle</td><td>Ideal for families and large groups or VIP service</td></tr>
</tbody>
</table>
<p>For a family of four with luggage, a private transfer often costs little more than two taxis and is much more comfortable.</p>

<h2>Airport Transfers in Morocco</h2>
<p>Morocco's main airports are Casablanca Mohammed V, Marrakech Menara, Agadir Al Massira, Fes-Saïss, Tangier Ibn Battouta, Rabat-Salé and Nador. A few key points:</p>
<ul>
<li><strong>Casablanca Mohammed V:</strong> the airport is far from the city centre. The ONCF train links the airport with Casablanca, and connections continue towards Rabat and other cities. Taxis and private transfers are available at all hours.</li>
<li><strong>Marrakech Menara:</strong> close to the city. Taxis, an airport bus service and private transfers are available. Riads inside the medina are often not reachable by car, so many transfers drop you at the nearest point, and a porter helps with luggage to the door.</li>
<li><strong>Taxis:</strong> airport taxis are usually large grand taxis. Some airports display reference fares. Agree the price before departure if no meter or fixed fare applies.</li>
<li><strong>Arriving at night or with family:</strong> a pre-booked transfer is often the simplest choice, especially if you are going to a medina riad, a rural area or a resort outside the city.</li>
</ul>

<h2>Airport Transfers in Europe and the UAE</h2>
<ul>
<li><strong>Madrid-Barajas:</strong> Metro line 8 links the airport with the city, and there is an airport express bus and suburban trains from Terminal 4.</li>
<li><strong>Barcelona-El Prat:</strong> the Aerobús runs to the city centre, and there are train and metro connections.</li>
<li><strong>Lisbon:</strong> the metro's red line serves the airport and connects with the rest of the network.</li>
<li><strong>Paris-Charles de Gaulle:</strong> the RER B train runs to central Paris, and there are taxis with fixed fares to the left or right bank.</li>
<li><strong>Rome-Fiumicino:</strong> the Leonardo Express train runs to Roma Termini, and taxis to central Rome use a fixed fare.</li>
<li><strong>Milan-Malpensa:</strong> the Malpensa Express train runs to the city centre.</li>
<li><strong>Dubai International:</strong> the Dubai Metro red line serves terminals 1 and 3, and taxis and ride-hailing are widely available.</li>
</ul>
<p>Services, routes and fares change, so check the official airport website before you fly.</p>

<h2>How to Choose the Right Transfer</h2>
<ul>
<li><strong>Group size and luggage:</strong> for three or more people with suitcases, a private transfer is often the best value.</li>
<li><strong>Arrival time:</strong> late-night or very early arrivals favour pre-booked transfers, when public transport may not run.</li>
<li><strong>Destination:</strong> medinas, mountain villages and resorts far from the city are easier with a driver who knows the area.</li>
<li><strong>Budget:</strong> solo travellers with light bags save the most with public transport.</li>
<li><strong>Accessibility:</strong> request adapted vehicles or assistance in advance.</li>
</ul>

<h2>Tips for a Smooth Transfer</h2>
<ul>
<li>Check how long the driver will wait after landing at no extra cost, and what happens if your flight is very late.</li>
<li>Keep your phone charged and save the operator's local number.</li>
<li>Confirm whether the price includes tolls, parking, night surcharges and luggage.</li>
<li>Only use official taxi ranks or your pre-booked driver. Politely decline unsolicited offers in the arrivals hall.</li>
<li>For your return journey, book pickup with plenty of margin. International flights often recommend arriving two to three hours before departure.</li>
</ul>

<h2>Frequently Asked Questions</h2>
<h3>What happens if my flight is delayed?</h3>
<p>Most professional transfer services track your flight number and adjust the pickup time automatically. Check the waiting-time policy when booking, especially for long delays or cancellations.</p>
<h3>Is a private transfer more expensive than a taxi?</h3>
<p>Not always. In many cities, a pre-booked private transfer costs about the same as a taxi, and it has a fixed price and no surprises.</p>
<h3>Can I book a transfer for a family member arriving alone?</h3>
<p>Yes. Enter their name and phone number when booking so the driver can recognise and contact them.</p>
<h3>Are child seats available?</h3>
<p>Many operators provide child seats on request, sometimes for an extra fee. Always request them during booking and confirm in writing.</p>
<h3>How do I get from Casablanca airport to the city?</h3>
<p>You can take the ONCF train, a taxi or a pre-booked private transfer. The train is economical, while a taxi or transfer is more convenient with luggage or at night.</p>

<h2>Book Your Transfer with Fastamor</h2>
<p>The <strong>Fastamor AI assistant</strong> can help you compare airport transfer options, estimate journey times and plan your arrival and departure around your flight. Whether you are landing in Marrakech, Madrid or Dubai, tell Fastamor your flight details and let it plan a smooth start to your trip.</p>$body$,
  body_ar = $body$<p>بعد رحلة جوية طويلة، آخر ما تريده هو الجدال حول سعر سيارة الأجرة، أو جرّ الحقائب عبر موقف السيارات بحثاً عن نقطة التقاء تطبيق النقل، أو انتظار حافلة مكوكية ساعة كاملة. والنقل من المطار المحجوز مسبقاً بين المطار والفندق أو البيت يرفع عنك هذا العناء. يشرح هذا الدليل أنواع خدمات النقل من المطار، وكيف يتم الحجز، وكم قد تدفع، وكيف تختار الخيار المناسب في أهم مطارات المغرب وأوروبا والإمارات.</p>

<h2>ما هو النقل من المطار؟</h2>
<p>هو وسيلة نقل تُحجز مسبقاً بين المطار ومكان آخر، كالفندق أو البيت أو ميناء الرحلات البحرية أو محطة القطار. وعلى خلاف سيارة الأجرة التي تستوقفها عند الوصول، يُحجز النقل لموعد محدد وعدد ركاب معين، وتتابع كثير من الخدمات رحلتك الجوية وتعدّل موعد الاستقبال إن تأخرت. وقد يكون النقل خاصاً بمجموعتك وحدها أو مشتركاً مع مسافرين آخرين.</p>

<h2>أنواع النقل من المطار</h2>
<h3>النقل الخاص</h3>
<p>يستقبلك السائق في قاعة الوصول، وكثيراً ما يحمل لافتة باسمك، ويساعدك في الأمتعة ثم يوصلك مباشرة إلى عنوانك. وأنت تختار نوع السيارة: سيدان أو ميني فان أو سيارة رباعية الدفع أو سيارة فاخرة.</p>
<ul>
<li><strong>يناسب:</strong> العائلات والمجموعات والوصول في وقت متأخر ليلاً، والمسافرين بأمتعة ثقيلة، ومن يزور بلداً لأول مرة.</li>
<li><strong>المزايا:</strong> سعر ثابت، ولا انتظار، ونقل من الباب إلى الباب، ومقاعد أطفال عند الطلب.</li>
<li><strong>العيوب:</strong> أغلى من النقل العمومي للمسافر المنفرد.</li>
</ul>
<h3>النقل المشترك</h3>
<p>حافلة صغيرة أو ميني فان تنقل عدة ركاب إلى فنادق في المنطقة نفسها وتنزلهم واحداً تلو الآخر.</p>
<ul>
<li><strong>يناسب:</strong> المسافرين المنفردين والأزواج ذوي الميزانية المحدودة المتجهين إلى وسط المدينة أو مناطق المنتجعات.</li>
<li><strong>العيوب:</strong> رحلة أطول بتوقفات متعددة، وقد تنتظر رحلات جوية أخرى.</li>
</ul>
<h3>سيارات الأجرة</h3>
<p>تتوفر مواقف رسمية لسيارات الأجرة في معظم المطارات. وتطبق بعض المدن أسعاراً ثابتة من المطار إلى المركز، بينما تعتمد مدن أخرى على العداد.</p>
<ul>
<li><strong>تناسب:</strong> الرحلات غير المخطط لها حين يكون الطابور قصيراً.</li>
<li><strong>العيوب:</strong> تفاوت الأسعار والجودة، واحتمال المبالغة في الأسعار على الزوار في بعض الوجهات.</li>
</ul>
<h3>تطبيقات النقل</h3>
<p>منتشرة في كثير من المدن الأوروبية وفي الإمارات، ويكون الالتقاء غالباً في منطقة مخصصة، وترتفع الأسعار في أوقات الذروة. ويختلف توفرها وتنظيمها كثيراً من بلد لآخر، فتحقق قبل الاعتماد عليها.</p>
<h3>النقل العمومي</h3>
<p>القطار والمترو والحافلة هي الخيار الأرخص في العادة، وغالباً ما تكون سريعة في المدن الكبرى، وتناسب أكثر من يسافر بأمتعة خفيفة ويصل نهاراً.</p>

<h2>كيف يتم حجز النقل؟</h2>
<ol>
<li><strong>أدخل بياناتك:</strong> المطار، وعنوان الوصول، والتاريخ، والوقت، وعدد الركاب والحقائب.</li>
<li><strong>اختر السيارة:</strong> تأكد أنها تتسع لأمتعة الجميع، بما في ذلك عربات الأطفال أو الكراسي المتحركة أو المعدات الرياضية.</li>
<li><strong>أضف رقم رحلتك:</strong> ليتمكن المشغّل من متابعة أي تأخير.</li>
<li><strong>اطلب الإضافات:</strong> مقاعد الأطفال، أو لافتة الاستقبال، أو توقفات إضافية، أو مساعدة لذوي الحركة المحدودة.</li>
<li><strong>ادفع واستلم القسيمة:</strong> يجب أن تتضمن نقطة اللقاء، ورقم هاتف السائق أو المكتب المحلي، وسياسة الانتظار.</li>
<li><strong>التقِ بالسائق:</strong> اتبع التعليمات بعد اجتياز شرطة الحدود واستلام أمتعتك.</li>
</ol>

<h2>كم يكلف النقل من المطار؟</h2>
<p>تعتمد الأسعار على المدينة والمسافة ونوع السيارة والتوقيت والموسم. ويعرض الجدول التالي <strong>مستويات تقريبية استرشادية</strong> لرحلة معتادة من المطار إلى وسط المدينة، فقارن دائماً العروض الحالية.</p>
<table>
<thead><tr><th>الخيار</th><th>مستوى التكلفة المعتاد</th><th>ملاحظات</th></tr></thead>
<tbody>
<tr><td>النقل العمومي</td><td>الأدنى، غالباً بضعة يوروهات أو دراهم</td><td>سريع في المدن الكبرى، وأصعب مع الأمتعة الثقيلة</td></tr>
<tr><td>النقل المشترك</td><td>منخفض إلى متوسط، للشخص</td><td>توقفات متعددة ومواعيد ثابتة</td></tr>
<tr><td>سيارة الأجرة الرسمية</td><td>متوسط</td><td>ثابت أو بالعداد حسب المدينة، وقد تُضاف رسوم ليلية أو للأمتعة</td></tr>
<tr><td>نقل خاص (سيدان)</td><td>متوسط إلى مرتفع، للسيارة</td><td>سعر ثابت واستقبال شخصي، وقيمة جيدة للمجموعات</td></tr>
<tr><td>ميني فان أو سيارة فاخرة</td><td>مرتفع، للسيارة</td><td>مثالي للعائلات والمجموعات الكبيرة أو الخدمة المميزة</td></tr>
</tbody>
</table>
<p>بالنسبة إلى عائلة من أربعة أفراد مع أمتعتها، كثيراً ما لا يكلف النقل الخاص أكثر من سيارتي أجرة إلا قليلاً، وهو أكثر راحة بكثير.</p>

<h2>النقل من المطار في المغرب</h2>
<p>أهم مطارات المغرب: محمد الخامس بالدار البيضاء، ومراكش المنارة، وأكادير المسيرة، وفاس سايس، وطنجة ابن بطوطة، والرباط سلا، والناظور. وإليك أبرز النقاط:</p>
<ul>
<li><strong>مطار محمد الخامس بالدار البيضاء:</strong> بعيد عن وسط المدينة، ويربطه قطار المكتب الوطني للسكك الحديدية بالدار البيضاء مع إمكانية مواصلة الرحلة نحو الرباط ومدن أخرى. وتتوفر سيارات الأجرة والنقل الخاص في كل الأوقات.</li>
<li><strong>مطار مراكش المنارة:</strong> قريب من المدينة، وتتوفر فيه سيارات الأجرة وخدمة حافلات المطار والنقل الخاص. ولأن الوصول بالسيارة إلى رياضات المدينة العتيقة غير ممكن في الغالب، يوصلك كثير من السائقين إلى أقرب نقطة، ثم يساعدك حمّال في نقل الأمتعة إلى الباب.</li>
<li><strong>سيارات الأجرة:</strong> سيارات الأجرة في المطارات تكون عادة من الصنف الكبير، وتعرض بعض المطارات أسعاراً مرجعية. اتفق على السعر قبل الانطلاق إن لم يكن هناك عداد أو سعر ثابت.</li>
<li><strong>الوصول ليلاً أو مع العائلة:</strong> النقل المحجوز مسبقاً هو في الغالب الخيار الأبسط، خاصة إن كنت متجهاً إلى رياض في المدينة العتيقة أو منطقة قروية أو منتجع خارج المدينة.</li>
</ul>

<h2>النقل من المطار في أوروبا والإمارات</h2>
<ul>
<li><strong>مدريد باراخاس:</strong> الخط 8 من المترو يربط المطار بالمدينة، إضافة إلى حافلة المطار السريعة وقطارات الضواحي من المبنى 4.</li>
<li><strong>برشلونة إل برات:</strong> حافلة "إيروبوس" إلى وسط المدينة، مع خطوط قطار ومترو.</li>
<li><strong>لشبونة:</strong> الخط الأحمر للمترو يخدم المطار ويتصل بباقي الشبكة.</li>
<li><strong>باريس شارل ديغول:</strong> قطار RER B إلى وسط باريس، وسيارات أجرة بأسعار ثابتة إلى الضفة اليسرى أو اليمنى.</li>
<li><strong>روما فيوميتشينو:</strong> قطار "ليوناردو إكسبريس" إلى محطة روما تيرميني، وسيارات أجرة بسعر ثابت إلى وسط روما.</li>
<li><strong>ميلانو مالبينسا:</strong> قطار "مالبينسا إكسبريس" إلى وسط المدينة.</li>
<li><strong>مطار دبي الدولي:</strong> الخط الأحمر لمترو دبي يخدم المبنيين 1 و3، وتتوفر سيارات الأجرة وتطبيقات النقل على نطاق واسع.</li>
</ul>
<p>تتغير الخدمات والخطوط والأسعار، فراجع الموقع الرسمي للمطار قبل السفر.</p>

<h2>كيف تختار النقل المناسب؟</h2>
<ul>
<li><strong>حجم المجموعة والأمتعة:</strong> لثلاثة أشخاص أو أكثر مع حقائب، يكون النقل الخاص غالباً الأفضل قيمة.</li>
<li><strong>وقت الوصول:</strong> الوصول في وقت متأخر ليلاً أو مبكر جداً يرجّح النقل المحجوز مسبقاً، فقد لا يعمل النقل العمومي حينها.</li>
<li><strong>الوجهة:</strong> المدن العتيقة والقرى الجبلية والمنتجعات البعيدة عن المدينة أسهل مع سائق يعرف المنطقة.</li>
<li><strong>الميزانية:</strong> المسافر المنفرد بأمتعة خفيفة يوفر أكثر مع النقل العمومي.</li>
<li><strong>سهولة الولوج:</strong> اطلب مسبقاً سيارات مهيأة أو مساعدة خاصة.</li>
</ul>

<h2>نصائح لنقل سلس</h2>
<ul>
<li>تحقق من المدة التي سينتظرها السائق بعد الهبوط دون رسوم إضافية، وماذا يحدث إن تأخرت رحلتك كثيراً.</li>
<li>أبقِ هاتفك مشحوناً واحفظ الرقم المحلي للمشغّل.</li>
<li>تأكد من أن السعر يشمل رسوم الطرق والمواقف والرسوم الليلية والأمتعة.</li>
<li>لا تستعمل إلا مواقف سيارات الأجرة الرسمية أو السائق المحجوز مسبقاً، واعتذر بلطف عن العروض غير المطلوبة في قاعة الوصول.</li>
<li>لرحلة العودة، احجز موعد الاستقبال بهامش كافٍ، إذ يُنصح غالباً بالوصول قبل الرحلات الدولية بساعتين إلى ثلاث.</li>
</ul>

<h2>أسئلة شائعة</h2>
<h3>ماذا يحدث إن تأخرت رحلتي؟</h3>
<p>تتابع معظم خدمات النقل المحترفة رقم رحلتك وتعدّل موعد الاستقبال تلقائياً. تحقق من سياسة الانتظار عند الحجز، خاصة في حالات التأخير الطويل أو الإلغاء.</p>
<h3>هل النقل الخاص أغلى من سيارة الأجرة؟</h3>
<p>ليس دائماً. ففي مدن كثيرة يكلف النقل الخاص المحجوز مسبقاً تقريباً ما تكلفه سيارة الأجرة، بسعر ثابت ودون مفاجآت.</p>
<h3>هل يمكنني حجز نقل لأحد أفراد عائلتي يصل وحده؟</h3>
<p>نعم، أدخل اسمه ورقم هاتفه عند الحجز ليتعرف عليه السائق ويتواصل معه.</p>
<h3>هل تتوفر مقاعد للأطفال؟</h3>
<p>يوفر كثير من المشغلين مقاعد الأطفال عند الطلب، وأحياناً مقابل رسوم إضافية. اطلبها دائماً أثناء الحجز وتأكد منها كتابياً.</p>
<h3>كيف أصل من مطار الدار البيضاء إلى المدينة؟</h3>
<p>يمكنك ركوب قطار المكتب الوطني للسكك الحديدية، أو سيارة أجرة، أو نقل خاص محجوز مسبقاً. القطار اقتصادي، وسيارة الأجرة أو النقل الخاص أكثر راحة مع الأمتعة أو ليلاً.</p>

<h2>احجز نقلك مع فاستامور</h2>
<p>يساعدك <strong>مساعد فاستامور الذكي</strong> على مقارنة خيارات النقل من المطار، وتقدير مدة الطريق، وتخطيط وصولك ومغادرتك حسب رحلتك الجوية. سواء كنت ستهبط في مراكش أو مدريد أو دبي، أخبر فاستامور ببيانات رحلتك ودعه يخطط لبداية سلسة لسفرك.</p>$body$
where slug = 'ultimate-guide-airport-transfer-services';

commit;

-- Optional: run only after confirming public.articles has an updated_at column, e.g.
--   select column_name from information_schema.columns where table_schema='public' and table_name='articles' and column_name='updated_at';
-- update public.articles set updated_at = now() where slug in ('morocco-magic-of-the-east', 'moroccan-cuisine-maghreb-table', 'spain-mediterranean-treasure', 'portugal-travel-guide', 'italy-travel-guide', 'uae-luxury-hotels', 'travel-health-guide', 'customs-regulations-guide', 'travel-preparation-guide', 'ultimate-guide-airport-transfer-services');

-- Run AFTER 20261123_article_upgrades.sql.
-- Duplicates now 301-redirect (vercel.json) to the upgraded articles; take them out of the sitemap.
-- comprehensive-global-travel-guide-2026 contains unverifiable statistics and a stray code snippet:
-- unpublish until it is rewritten.
begin;
update public.articles set status = 'draft'
where slug in ('traveler-health-guide-avoiding-diseases', 'customs-guide-travel', 'comprehensive-global-travel-guide-2026');
commit;
