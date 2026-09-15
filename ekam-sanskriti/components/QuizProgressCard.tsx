'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia';

export default function QuizProgressCard() {
  const [quizCount, setQuizCount] = useState(0);
  const [langCode, setLangCode] = useState<string>('en');
  const supabase = createClient();
  
  useEffect(() => {
    async function loadQuizStats() {
      if (typeof window !== 'undefined') {
        const localLang = localStorage.getItem('chosen_language');
        if (localLang) {
          const val = localLang.toLowerCase().trim();
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === val || l.name.toLowerCase() === val
          );
          if (matched) setLangCode(matched.code);
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('chosen_language').eq('id', user.id).maybeSingle();
      if (profile?.chosen_language) {
        const val = profile.chosen_language.toLowerCase().trim();
        const matched = SUPPORTED_LANGUAGES.find(
          l => l.code.toLowerCase() === val || l.name.toLowerCase() === val
        );
        if (matched) setLangCode(matched.code);
      }

      const { data, error, count } = await supabase
        .from('quiz_scores')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Dashboard fetch failed:", error);
        return;
      }
      
      setQuizCount(data?.length || 0);
    }
    loadQuizStats();
  }, []);

  const dict = getDictionary(langCode);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mt-6">
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 {dict.dashboard.myQuizProgress || "My Quiz Progress"}</h3>
        <p className="text-gray-600 mb-2">📝 {dict.dashboard.quizzesTaken || "Quizzes Taken"}</p>
        <p className="text-3xl font-black text-orange-600 mb-4">{quizCount}</p>
        
        <Link href="/profile" className="text-orange-600 font-bold hover:underline">
          {dict.dashboard.viewFullStats || "View full stats →"}
        </Link>
      </div>
    </div>
  );
}
