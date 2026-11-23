// Trip kit: after the assistant finds flights, suggest the other things the
// traveller needs for the same destination. Partner links carry a SubID
// ("<page>_tripkit-<item>_<lang>") so Travelpayouts reports show what earns.
import { aff, sid, hotelSearchUrl, trackClick } from '@/lib/tracking';
import type { TripDest } from '@/hooks/use-fastamor-chat';
import { localizedPath, isLang } from '@/lib/i18n-url';

type L = 'en' | 'ar' | 'fr' | 'es';

const COPY: Record<L, { title: (c: string) => string; hotel: string; hotelD: (c: string) => string; esim: string; esimD: string;
  transfer: string; transferD: string; tours: string; toursD: (c: string) => string; generic: string; car: string; carD: string }> = {
  en: { title: c => `Complete your trip to ${c}`, hotel: 'Hotels', hotelD: c => `Places to stay in ${c}`, esim: 'Mobile data',
        esimD: 'eSIM, no roaming fees', transfer: 'Airport transfer', transferD: 'Driver waiting on arrival', tours: 'Tours & tickets', toursD: c => `Things to do in ${c}`,
        generic: 'Before you travel', car: 'Car hire', carD: 'Compare rental companies' },
  ar: { title: c => `أكمل رحلتك إلى ${c}`, hotel: 'فنادق', hotelD: c => `أماكن للإقامة في ${c}`, esim: 'إنترنت الهاتف',
        esimD: 'شريحة eSIM بدون رسوم تجوال', transfer: 'النقل من المطار', transferD: 'سائق ينتظرك عند الوصول', tours: 'جولات وتذاكر', toursD: c => `ماذا تفعل في ${c}`,
        generic: 'قبل أن تسافر', car: 'كراء سيارة', carD: 'قارن شركات الكراء' },
  fr: { title: c => `Complétez votre voyage à ${c}`, hotel: 'Hôtels', hotelD: c => `Où dormir à ${c}`, esim: 'Données mobiles',
        esimD: 'eSIM sans frais d’itinérance', transfer: 'Transfert aéroport', transferD: 'Chauffeur à l’arrivée', tours: 'Visites & billets', toursD: c => `À faire à ${c}`,
        generic: 'Avant de partir', car: 'Location de voiture', carD: 'Comparez les loueurs' },
  es: { title: c => `Completa tu viaje a ${c}`, hotel: 'Hoteles', hotelD: c => `Dónde dormir en ${c}`, esim: 'Datos móviles',
        esimD: 'eSIM sin roaming', transfer: 'Traslado aeropuerto', transferD: 'Conductor a tu llegada', tours: 'Tours y entradas', toursD: c => `Qué hacer en ${c}`,
        generic: 'Antes de viajar', car: 'Alquiler de coche', carD: 'Compara empresas de alquiler' },
};

export function TripKit({ dest, lang, page, title, wide = false }:
  { dest: TripDest | null; lang: string; page: string; title?: string; wide?: boolean }) {
  const l = (['en', 'ar', 'fr', 'es'].includes(lang) ? lang : 'en') as L;
  const c = COPY[l];
  const show = dest?.name || '';
  const esim = { key: 'esim', icon: '📶', name: c.esim, desc: c.esimD, url: aff('https://yesim.tpx.gr/9gzdax7m', sid(page, 'tripkit-esim', l)), rel: 'sponsored nofollow noopener', ext: true };
  const transfer = { key: 'transfer', icon: '🚕', name: c.transfer, desc: c.transferD, url: aff('https://kiwitaxi.tpx.gr/Y6yrFeYN', sid(page, 'tripkit-transfer', l)), rel: 'sponsored nofollow noopener', ext: true };
  const items = dest?.city
    ? [
        { key: 'hotel', icon: '🏨', name: c.hotel, desc: c.hotelD(show), url: hotelSearchUrl(dest.city, sid(page, 'tripkit-hotel', l), dest.checkin), rel: 'sponsored nofollow noopener', ext: true },
        esim, transfer,
        { key: 'tours', icon: '🎟️', name: c.tours, desc: c.toursD(show), url: aff('https://klook.tpx.gr/vRUzaJbI', sid(page, 'tripkit-tours', l)), rel: 'sponsored nofollow noopener', ext: true },
      ]
    : [
        esim, transfer,
        { key: 'car', icon: '🚗', name: c.car, desc: c.carD, url: localizedPath('/car', isLang(l) ? l : 'en'), rel: '', ext: false },
      ];
  const heading = title || (dest?.city ? c.title(show) : c.generic);
  return (
    <section className="mt-4" aria-label={heading}>
      <h3 className={`${wide ? 'text-lg' : 'text-sm'} font-extrabold text-[#14204A] mb-2`}>{heading}</h3>
      <ul className={`grid grid-cols-2 gap-2 ${wide ? (items.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3') : ''}`}>
        {items.map(i => (
          <li key={i.key}>
            <a href={i.url} {...(i.ext ? { target: '_blank', rel: i.rel, onClick: () => trackClick(i.url) } : {})}
              className="flex h-full items-start gap-2 rounded-xl border border-[#E1E4F0] bg-white px-3 py-2.5 hover:border-[#3550C8] transition-colors">
              <span className="text-lg leading-none mt-0.5" aria-hidden>{i.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold text-[#14204A]">{i.name}</span>
                <span className="block text-xs text-[#14204A]/60 leading-snug">{i.desc}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
