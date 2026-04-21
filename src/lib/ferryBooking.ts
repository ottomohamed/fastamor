// src/lib/ferryBooking.ts
// نظام حجز البواخر - المستوى 2 (50% من الرحلة)

export interface FerrySearchParams {
  from: string;
  to: string;
  date?: string;
  adults?: number;
  children?: number;
  vehicle?: boolean;
}

const portNameMap: Record<string, string> = {
  'طنجة': 'Tangier',
  'طنجة المتوسط': 'Tanger Med',
  'طنجة المدينة': 'Tanger Ville',
  'الناظور': 'Nador',
  'الحسيمة': 'Al Hoceima',
  'الجزيرة الخضراء': 'Algeciras',
  'مالقة': 'Malaga',
  'المرية': 'Almeria',
  'برشلونة': 'Barcelona',
  'طريفة': 'Tarifa',
  'سبتة': 'Ceuta',
  'موتريل': 'Motril',
  'مرسيليا': 'Marseille',
  'سيت': 'Sete',
  'جنوة': 'Genoa',
  'نابولي': 'Naples',
  'جران كناريا': 'Gran Canaria',
  'لاس بالماس': 'Las Palmas',
  'تينيريفي': 'Tenerife',
};

const VALID_ROUTES: { from: string; to: string }[] = [
  { from: 'Algeciras', to: 'Tanger Med' },
  { from: 'Algeciras', to: 'Tanger Ville' },
  { from: 'Malaga', to: 'Tanger Med' },
  { from: 'Malaga', to: 'Tanger Ville' },
  { from: 'Malaga', to: 'Nador' },
  { from: 'Barcelona', to: 'Tanger Med' },
  { from: 'Barcelona', to: 'Tanger Ville' },
  { from: 'Barcelona', to: 'Nador' },
  { from: 'Almeria', to: 'Nador' },
  { from: 'Motril', to: 'Nador' },
  { from: 'Tarifa', to: 'Tanger Ville' },
];

export function normalizePortName(name: string): string {
  const lower = name.toLowerCase().trim();
  return portNameMap[lower] || name;
}

export function isValidRoute(from: string, to: string): boolean {
  const normalizedFrom = normalizePortName(from);
  const normalizedTo = normalizePortName(to);
  
  return VALID_ROUTES.some(
    route => route.from === normalizedFrom && route.to === normalizedTo
  );
}

export function buildFerryBookingLink(params: FerrySearchParams): string {
  const from = normalizePortName(params.from);
  const to = normalizePortName(params.to);
  
  if (!isValidRoute(params.from, params.to)) {
    throw new Error(`الخط ${params.from}  ${params.to} غير متاح حالياً على Balearia`);
  }
  
  const encodedFrom = encodeURIComponent(from);
  const encodedTo = encodeURIComponent(to);
  
  return `https://www.balearia.com/es/web/balearia-booking/funnel?origin=${encodedFrom}&destination=${encodedTo}`;
}

export function formatFerrySummary(params: FerrySearchParams): string {
  const parts = [];
  parts.push(` من: ${params.from}`);
  parts.push(` إلى: ${params.to}`);
  if (params.date) parts.push(` التاريخ: ${params.date}`);
  if (params.adults) parts.push(` عدد البالغين: ${params.adults}`);
  if (params.children) parts.push(` عدد الأطفال: ${params.children}`);
  if (params.vehicle) parts.push(` مع سيارة: نعم`);
  
  return parts.join('\n');
}
