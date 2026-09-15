'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link';
import { getDictionary } from '@/lib/i18n'
import { createClient } from '@/utils/supabase/client'
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia'

export default function Home() {
  const [langCode, setLangCode] = useState<string>('en')
  
  useEffect(() => {
    async function loadUserLang() {
      if (typeof window !== 'undefined') {
        const localLang = localStorage.getItem('chosen_language')
        if (localLang) {
          const val = localLang.toLowerCase().trim()
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === val || l.name.toLowerCase() === val
          )
          if (matched) setLangCode(matched.code)
        }
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('chosen_language').eq('id', user.id).maybeSingle()
        if (data?.chosen_language) {
          const val = data.chosen_language.toLowerCase().trim()
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === val || l.name.toLowerCase() === val
          )
          if (matched) {
            setLangCode(matched.code)
          }
        }
      }
    }
    loadUserLang()
  }, [])

  const dict = getDictionary(langCode)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Landing Page Navbar */}
      <nav className="absolute top-0 left-0 w-full z-50 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold border border-white/40">ए</div>
          <span className="text-2xl font-bold text-white drop-shadow-md">Ekam Sanskriti</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/50 text-white font-semibold rounded-full transition-all">
            {dict.landingPage?.loginSignUp || 'Login / Sign Up'}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-12 px-8 overflow-hidden bg-gradient-to-br from-saffron-900 via-gray-900 to-black">
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-[url(/india-diversity-map.jpg)] bg-cover bg-center opacity-20 blur-3xl saturate-200"></div>
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-left">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-xl font-serif leading-tight">
              {dict.landingPage?.heroTitle || 'Ekam '} <span className="text-saffron-400">{dict.landingPage?.heroTitleHighlight || 'Sanskriti'}</span>
            </h1>
            <p className="text-2xl md:text-3xl text-saffron-300 font-medium mb-6 drop-shadow-md">
              {dict.landingPage?.heroSubtitle || 'वसुधैव कुटुम्बकम्'}
            </p>
            <p className="text-lg md:text-xl text-gray-200 mb-8 font-light drop-shadow-md max-w-xl">
              {dict.landingPage?.heroDesc || 'The World Is One Family. Experience the unity in diversity of Indian cultural heritage, monuments, foods, and festivals.'}
            </p>
            <Link 
              href="/explore" 
              className="px-8 py-4 bg-saffron-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(255,153,51,0.4)] hover:bg-saffron-500 hover:scale-105 transition-all text-lg inline-block"
            >
              {dict.landingPage?.startExploring || 'Start Exploring'}
            </Link>
          </div>

          {/* Full Image */}
          <div className="relative w-full aspect-square max-w-[600px] mx-auto group">
            <div className="absolute inset-0 bg-saffron-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <img 
              src="/india-diversity-map.jpg" 
              alt="Diverse Map of India" 
              className="relative w-full h-full object-contain rounded-3xl shadow-2xl border-4 border-white/10"
            />
          </div>
        </div>
      </div>

      {/* 4 Cards Section */}
      <div className="max-w-7xl mx-auto px-8 py-20 w-full relative -mt-20 z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/explore" className="group">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🏛️</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">{dict.landingPage?.exploreTitle || 'Explore'}</h3>
              <p className="text-gray-600">{dict.landingPage?.exploreDesc || 'Discover architectural marvels and monuments spanning history.'}</p>
            </div>
          </Link>
          
          <Link href="/food" className="group">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🍛</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">{dict.landingPage?.foodTitle || 'Food'}</h3>
              <p className="text-gray-600">{dict.landingPage?.foodDesc || 'Taste the rich culinary diversity from every state of India.'}</p>
            </div>
          </Link>

          <Link href="/festivals" className="group">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🎉</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">{dict.landingPage?.festivalsTitle || 'Festivals'}</h3>
              <p className="text-gray-600">{dict.landingPage?.festivalsDesc || 'Experience the vibrant celebrations that unite the nation.'}</p>
            </div>
          </Link>

          <Link href="/learn" className="group">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🎨</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">{dict.landingPage?.learnTitle || 'Art Learn'}</h3>
              <p className="text-gray-600">{dict.landingPage?.learnDesc || 'Master traditional arts and crafts directly from the artisans.'}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
