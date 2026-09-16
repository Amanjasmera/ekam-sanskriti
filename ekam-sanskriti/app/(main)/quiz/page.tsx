'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import monuments from '@/data/monuments.json';
import foods from '@/data/foods.json';
import festivals from '@/data/festivals.json';
import arts from '@/data/arts.json';
import { createClient } from '@/utils/supabase/client';
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia';
import { getDictionary } from '@/lib/i18n';

export default function QuizLauncherPage() {
  const router = useRouter();
  const [category, setCategory] = useState('monuments');
  const [itemSlug, setItemSlug] = useState(monuments[0]?.slug || '');
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setCategory(cat);
    if (cat === 'monuments') setItemSlug(monuments[0]?.slug);
    if (cat === 'food') setItemSlug(foods[0]?.slug);
    if (cat === 'festivals') setItemSlug(festivals[0]?.slug);
    if (cat === 'arts') setItemSlug(arts[0]?.slug);
  };

  const launchQuiz = () => {
    router.push(`/quiz/play?category=${category}&item=${itemSlug}`);
  };

  const getOptions = () => {
    if (category === 'monuments') return monuments;
    if (category === 'food') return foods;
    if (category === 'festivals') return festivals;
    if (category === 'arts') return arts;
    return [];
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            🧠
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{dict.quiz.title}</h1>
          <p className="text-gray-500 font-medium">{dict.quiz.subtitle}</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">{dict.quiz.selectCategory}</label>
            <select 
              value={category}
              onChange={handleCategoryChange}
              className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-semibold text-gray-800 bg-gray-50 transition-all cursor-pointer"
            >
              <option value="monuments">{dict.quiz.monuments}</option>
              <option value="food">{dict.quiz.food}</option>
              <option value="festivals">{dict.quiz.festivals}</option>
              <option value="arts">{dict.quiz.arts}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">{dict.quiz.selectTopic}</label>
            <select 
              value={itemSlug}
              onChange={(e) => setItemSlug(e.target.value)}
              className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-semibold text-gray-800 bg-gray-50 transition-all cursor-pointer capitalize"
            >
              {getOptions().map((item: {slug: string, name: string}) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={launchQuiz}
            disabled={!itemSlug}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1 mt-4"
          >
            {dict.quiz.startQuiz}
          </button>
        </div>
      </div>
    </div>
  );
}
