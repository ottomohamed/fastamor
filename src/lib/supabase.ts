import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export type AffiliateLink = {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: string;
  is_active: boolean;
  clicks: number;
  created_at: string;
};

export type Banner = {
  id: string;
  text: string;
  url: string;
  is_active: boolean;
  position: string;
  created_at: string;
};

export type Setting = {
  id: string;
  value: any;
  updated_at: string;
};

export type Stat = {
  id: string;
  event: string;
  data: any;
  created_at: string;
};

// Helper functions
export async function getAffiliateLinks() {
  const { data, error } = await supabase
    .from('affiliate_links')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as AffiliateLink[];
}

export async function getBanners() {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Banner[];
}

export async function getSettings(id: string) {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Setting;
}

export async function updateSettings(id: string, value: any) {
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function trackEvent(event: string, data?: any) {
  await supabase.from('stats').insert({ event, data });
}

export async function getStats() {
  const { data, error } = await supabase
    .from('stats')
    .select('event, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) throw error;

  const clicks = data?.filter(s => s.event === 'click').length || 0;
  const searches = data?.filter(s => s.event === 'search').length || 0;
  const today = new Date().toDateString();
  const todayClicks = data?.filter(s =>
    s.event === 'click' && new Date(s.created_at).toDateString() === today
  ).length || 0;

  return { clicks, searches, todayClicks, total: data?.length || 0 };
}
