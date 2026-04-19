import { useReducer, useState, useEffect } from "react";
import { supabase } from '@/lib/supabase'; // الربط الحقيقي بمشروعك
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Globe, Image as ImageIcon, Mail } from "lucide-react";
import { toast } from 'react-hot-toast';

export default function SiteSettingsPanel({ darkMode }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [state, dispatch] = useReducer((state, action) => {
    if (action.type === "SET_ALL") return { ...state, ...action.payload };
    return { ...state, [action.field]: action.value };
  }, {
    hero_title_ar: "",
    hero_title_en: "",
    hero_image: "",
    footer_text_ar: "",
    contact_email: "",
  });

  // جلب البيانات عند التحميل
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').single();
        if (data) dispatch({ type: "SET_ALL", payload: data });
      } finally {
        setFetching(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('site_settings').upsert({ id: 1, ...state });
    
    if (error) {
      toast.error("خطأ في الحفظ");
    } else {
      toast.success("تم تحديث الموقع بنجاح!");
    }
    setLoading(false);
  };

  if (fetching) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className={`p-6 space-y-6 ${darkMode ? 'text-white' : 'text-black'}`}>
      <div className="grid md:grid-cols-2 gap-8">
        {/* قسم الواجهة الرئيسية */}
        <Card className={darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Globe size={20} />
              <h3 className="text-lg font-black">نصوص الواجهة (Hero Section)</h3>
            </div>
            
            <div className="space-y-2">
              <Label>العنوان بالعربي</Label>
              <Input 
                className={darkMode ? "bg-zinc-800 border-zinc-700" : ""}
                value={state.hero_title_ar} 
                onChange={(e) => dispatch({ field: "hero_title_ar", value: e.target.value })} 
              />
            </div>

            <div className="space-y-2">
              <Label>العنوان بالإنجليزية</Label>
              <Input 
                className={darkMode ? "bg-zinc-800 border-zinc-700" : ""}
                value={state.hero_title_en} 
                onChange={(e) => dispatch({ field: "hero_title_en", value: e.target.value })} 
              />
            </div>
          </CardContent>
        </Card>

        {/* قسم الوسائط والتواصل */}
        <Card className={darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <ImageIcon size={20} />
              <h3 className="text-lg font-black">الوسائط والروابط</h3>
            </div>

            <div className="space-y-2">
              <Label>رابط صورة الخلفية الرئيسية</Label>
              <Input 
                value={state.hero_image} 
                onChange={(e) => dispatch({ field: "hero_image", value: e.target.value })} 
              />
            </div>

            <div className="space-y-2">
              <Label>بريد التواصل</Label>
              <Input 
                type="email"
                value={state.contact_email} 
                onChange={(e) => dispatch({ field: "contact_email", value: e.target.value })} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSave} disabled={loading} className="px-12 py-6 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          تطبيق التغييرات على FastAmor
        </Button>
      </div>
    </div>
  );
}