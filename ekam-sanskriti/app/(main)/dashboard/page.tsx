import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MapPin, Compass, Coffee, Calendar, Award, Shield, Sparkles, BookOpen, ExternalLink } from 'lucide-react'
import { getWikiContent } from '@/lib/wikipedia'
import monumentsData from '@/data/monuments.json'
import foodsData from '@/data/foods.json'
import festivalsData from '@/data/festivals.json'
import QuizProgressCard from '@/components/QuizProgressCard'
import { getDictionary } from '@/lib/i18n'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const { data: scores } = await supabase
    .from('quiz_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: quizAttempts } = await supabase
    .from('user_quiz_attempts')
    .select('*')
    .eq('user_id', user.id)

  const userLang = profile?.chosen_language || 'en'
  const dict = getDictionary(userLang)

  // Fetch Wikipedia summary snippets for featured items
  const featuredTajTitle = monumentsData[0].wikipedia_titles[userLang as keyof typeof monumentsData[0]['wikipedia_titles']] || monumentsData[0].wikipedia_titles['en']
  const featuredBiryaniTitle = foodsData[0].wikipedia_titles[userLang as keyof typeof foodsData[0]['wikipedia_titles']] || foodsData[0].wikipedia_titles['en']
  const featuredDiwaliTitle = festivalsData[0].wikipedia_titles[userLang as keyof typeof festivalsData[0]['wikipedia_titles']] || festivalsData[0].wikipedia_titles['en']

  const [tajWiki, biryaniWiki, diwaliWiki] = await Promise.all([
    getWikiContent(featuredTajTitle, userLang),
    getWikiContent(featuredBiryaniTitle, userLang),
    getWikiContent(featuredDiwaliTitle, userLang),
  ])

  const currentHour = new Date().getHours()
  let greeting = dict.dashboard.goodMorning
  if (currentHour >= 12 && currentHour < 17) greeting = dict.dashboard.goodAfternoon
  else if (currentHour >= 17) greeting = dict.dashboard.goodEvening

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-orange-50/20 via-white to-amber-50/20">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 rounded-3xl p-8 md:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={14} /> Ekam Sanskriti Dashboard ({userLang.toUpperCase()})
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-serif mb-2">
              {dict.dashboard.namaste}, {profile?.full_name || dict.dashboard.explorer} 🙏
            </h1>
            <p className="text-orange-100 text-base md:text-lg max-w-2xl">
              {greeting}! {dict.dashboard.discoverText}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
            <p className="text-xs text-orange-200">{dict.dashboard.chosenLanguage}</p>
            <p className="text-xl font-bold uppercase tracking-wider">{userLang}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white text-3xl font-bold flex items-center justify-center shadow-lg mb-4 border-2 border-white">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile?.full_name || dict.dashboard.user}</h2>
            <p className="text-sm font-bold text-saffron-600 mb-6 bg-saffron-50 px-3 py-1 rounded-lg inline-block border border-saffron-200">
              📝 {dict.dashboard.quizzesTaken}: {scores?.length || 0}
            </p>
            
            <div className="space-y-3 text-sm mb-6 border-t border-gray-100 pt-4">
              <div className="flex justify-between py-1">
                <span className="text-gray-500 font-medium">{dict.dashboard.placeOfBirth}</span>
                <span className="text-gray-900 font-bold">{profile?.place_of_birth || dict.dashboard.notSpecified}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 font-medium">{dict.dashboard.occupation}</span>
                <span className="text-gray-900 font-bold">{profile?.occupation || dict.dashboard.notSpecified}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 font-medium">{dict.dashboard.activeLanguage}</span>
                <span className="text-orange-600 font-bold uppercase">{userLang}</span>
              </div>
            </div>

            <Link href="/language-select" className="block w-full py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-center rounded-2xl transition-colors border border-orange-200">
              🌐 {dict.dashboard.switchLanguage}
            </Link>
          </div>

          <QuizProgressCard />
        </div>

        {/* Feature Cards Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Link href="/explore" className="group">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                  <Compass size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{dict.dashboard.monuments}</h3>
                <p className="text-gray-500 text-xs mt-1">25+ {dict.dashboard.worldHeritage} {userLang.toUpperCase()}</p>
              </div>
            </Link>

            <Link href="/food" className="group">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <Coffee size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{dict.dashboard.foodHeritage}</h3>
                <p className="text-gray-500 text-xs mt-1">{dict.dashboard.foodDesc}</p>
              </div>
            </Link>

            <Link href="/festivals" className="group">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <Calendar size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">{dict.dashboard.festivals}</h3>
                <p className="text-gray-500 text-xs mt-1">{dict.dashboard.festivalsDesc}</p>
              </div>
            </Link>
          </div>

          {/* Featured Wikipedia Section in User's Language */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-orange-600" /> {dict.dashboard.featuredContent} ({userLang.toUpperCase()})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Taj Mahal Card */}
              <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{dict.dashboard.monument}</span>
                <h4 className="font-bold text-gray-900 text-base mt-1 mb-2 line-clamp-1">
                  {tajWiki?.title || 'Taj Mahal'}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {tajWiki?.extract || dict.dashboard.loadingSummary}
                </p>
                <Link href="/monument/taj-mahal" className="mt-3 text-xs font-bold text-orange-600 hover:underline inline-block">
                  {dict.dashboard.explore} →
                </Link>
              </div>

              {/* Biryani Card */}
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{dict.dashboard.food}</span>
                <h4 className="font-bold text-gray-900 text-base mt-1 mb-2 line-clamp-1">
                  {biryaniWiki?.title || 'Biryani'}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {biryaniWiki?.extract || dict.dashboard.loadingSummary}
                </p>
                <Link href="/food" className="mt-3 text-xs font-bold text-amber-600 hover:underline inline-block">
                  {dict.dashboard.explore} →
                </Link>
              </div>

              {/* Diwali Card */}
              <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{dict.dashboard.festival}</span>
                <h4 className="font-bold text-gray-900 text-base mt-1 mb-2 line-clamp-1">
                  {diwaliWiki?.title || 'Diwali'}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {diwaliWiki?.extract || dict.dashboard.loadingSummary}
                </p>
                <Link href="/festivals" className="mt-3 text-xs font-bold text-red-600 hover:underline inline-block">
                  {dict.dashboard.explore} →
                </Link>
              </div>
            </div>
          </div>

          {/* 🏆 Quiz Stats Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award size={20} className="text-saffron-600" /> 🏆 {dict.dashboard.quizStats}
            </h3>
            
            {/* Big Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-center shadow-sm">
                <p className="text-sm text-gray-500 font-bold uppercase mb-2">{dict.dashboard.totalQuizzes}</p>
                <p className="text-3xl font-black text-gray-900">{scores?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-center shadow-sm">
                <p className="text-sm text-gray-500 font-bold uppercase mb-2">{dict.dashboard.questionsAnswered}</p>
                <p className="text-3xl font-black text-gray-900">{quizAttempts?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-center shadow-sm">
                <p className="text-sm text-gray-500 font-bold uppercase mb-2">{dict.dashboard.averageScore}</p>
                <p className="text-3xl font-black text-gray-900">
                  {(() => {
                    const totalScore = scores?.reduce((acc, s) => acc + s.score, 0) || 0;
                    const totalPossible = scores?.reduce((acc, s) => acc + s.total, 0) || 0;
                    return totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
                  })()}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-center shadow-sm">
                <p className="text-sm text-gray-500 font-bold uppercase mb-2">{dict.dashboard.bestScore}</p>
                <p className="text-3xl font-black text-gray-900">
                  {(() => {
                    if (!scores || scores.length === 0) return '0/5';
                    const best = scores.reduce((prev, current) => (prev.score > current.score) ? prev : current);
                    return `${best.score}/${best.total}`;
                  })()}
                </p>
              </div>
            </div>

            {/* 📊 Category Progress */}
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 mt-8">
              📊 {dict.dashboard.categoryProgress}
            </h3>
            <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              {[
                { id: 'monuments', label: `🏛️ ${dict.dashboard.monuments}`, color: 'bg-orange-500' },
                { id: 'food', label: `🍛 ${dict.dashboard.foodHeritage}`, color: 'bg-amber-500' },
                { id: 'festivals', label: `🎉 ${dict.dashboard.festivals}`, color: 'bg-red-500' },
                { id: 'culture-craft', label: `🎨 ${dict.dashboard.artCraft}`, color: 'bg-purple-500' },
              ].map(cat => {
                const catScores = scores?.filter((s: any) => s.category === cat.id) || [];
                const catScoreSum = catScores.reduce((acc: number, s: any) => acc + s.score, 0);
                const catTotalSum = catScores.reduce((acc: number, s: any) => acc + s.total, 0);
                const percentage = catTotalSum > 0 ? Math.round((catScoreSum / catTotalSum) * 100) : 0;
                
                return (
                  <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="w-40 font-bold text-gray-700">{cat.label}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden relative shadow-inner">
                      <div className={`h-full ${cat.color} transition-all`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="w-24 text-right font-bold text-gray-600 text-sm">
                      {percentage}% <span className="text-gray-400 font-normal">({catScoreSum}/{catTotalSum})</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 📜 Recent Attempts */}
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 mt-8">
              📜 {dict.dashboard.recentAttempts}
            </h3>
            <div className="space-y-3">
              {scores?.slice(0, 10).map((score: any, i: number) => {
                const dateLabels = [
                  dict.dashboard.today,
                  dict.dashboard.yesterday,
                  dict.dashboard.twoDaysAgo,
                  dict.dashboard.threeDaysAgo,
                  dict.dashboard.lastWeek,
                ];
                const dateLabel = dateLabels[Math.min(i, dateLabels.length - 1)];
                const itemName = score.item_name || score.item_slug.replace(/-/g, ' ');

                return (
                  <div key={score.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-bold text-gray-900 capitalize text-lg flex items-center gap-3">
                      <span>{itemName} {dict.quiz.categoryQuiz}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-black text-lg text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">{score.score}/{score.total}</span>
                      <span className="text-sm font-medium text-gray-500 w-20 text-right">{dateLabel}</span>
                    </div>
                  </div>
                )
              })}
              {(!scores || scores.length === 0) && (
                <div className="text-center p-6 text-gray-500 italic bg-gray-50 rounded-xl border border-gray-100">
                  {dict.dashboard.noQuizzesTaken}
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  )
}
