'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getDictionary } from '@/lib/i18n';
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia';
import { createClient } from '@/utils/supabase/client';

const Map = dynamic(
  () => import('@/components/Map'),
  { ssr: false }
);

export default function InteractiveMapPage() {
  const [langCode, setLangCode] = useState<string>('en');

  useEffect(() => {
    async function loadLang() {
      if (typeof window !== 'undefined') {
        const localLang = localStorage.getItem('chosen_language');
        if (localLang) {
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === localLang.toLowerCase().trim()
          );
          if (matched) setLangCode(matched.code);
        }
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('chosen_language').eq('id', user.id).maybeSingle();
        if (data?.chosen_language) {
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === data.chosen_language.toLowerCase().trim()
          );
          if (matched) setLangCode(matched.code);
        }
      }
    }
    loadLang();
  }, []);

  const dict = getDictionary(langCode);

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="p-4 bg-white shadow-sm z-10 flex gap-4 items-center">
        <h1 className="text-2xl font-bold text-saffron-600">{dict.mapPage.title}</h1>
        <select className="border p-2 rounded">
          <option>{dict.mapPage.allEras}</option>
          <option>{dict.mapPage.ancient}</option>
          <option>{dict.mapPage.medieval}</option>
          <option>{dict.mapPage.modern}</option>
        </select>
        <select className="border p-2 rounded">
          <option>{dict.mapPage.allTypes}</option>
          <option>{dict.mapPage.monument}</option>
          <option>{dict.mapPage.food}</option>
          <option>{dict.mapPage.festival}</option>
        </select>
      </div>
      
      <div className="flex-1 bg-gray-100 relative">
        <Map />
      </div>
    </div>
  );
}
