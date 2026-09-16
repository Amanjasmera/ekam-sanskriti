'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { getWikiSummaryWithCache, getHighResImageUrl, WikiSummary, SUPPORTED_LANGUAGES } from '@/lib/wikipedia'
import { getDictionary } from '@/lib/i18n'
import festivalsData from '@/data/festivals.json'
import { Sparkles, Calendar, ExternalLink } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import { motion } from 'framer-motion'

export default function FestivalsPage() {
  const supabase = createClient()
  const [langCode, setLangCode] = useState<string>('en')
  const [wikiCache, setWikiCache] = useState<Record<string, WikiSummary>>({})
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

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
            if (typeof window !== 'undefined') {
              localStorage.setItem('chosen_language', matched.code)
            }
          }
        }
      }
    }
    loadUserLang()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dict = getDictionary(langCode)

  useEffect(() => {
    festivalsData.forEach(async (festival) => {
      const summary = await getWikiSummaryWithCache(festival.wikipedia_titles as unknown as Record<string, string>, langCode)
      if (summary) {
        setWikiCache(prev => ({ ...prev, [festival.slug]: summary }))
      }
    })
  }, [langCode])

  return (
    <PageTransition className="min-h-screen bg-cream p-6 md:p-10 font-sans">
      {/* Banner */}
      <div className="max-w-7xl mx-auto mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-maroon to-red-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/30">
            <Sparkles size={14} className="text-red-200" /> {dict.festivalPage.wikiPowered} ({langCode.toUpperCase()})
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading drop-shadow-md">{dict.festivalPage.title}</h1>
          <p className="mt-3 text-red-100 max-w-2xl text-base md:text-lg font-light">
            {dict.festivalPage.subtitle}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {festivalsData.map((festival, idx) => {
          const wiki = wikiCache[festival.slug]
          const displayTitle = wiki?.title || festival.slug.replace(/-/g, ' ').toUpperCase()
          const rawImage = wiki?.originalimage?.source || wiki?.thumbnail?.source || festival.image
          const isFailed = failedImages[festival.slug]
          const displayImage = isFailed ? '/images/fallback-festival.jpg' : getHighResImageUrl(rawImage, 'festival')
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const wikiUrl = wiki?.content_urls?.desktop?.page || `https://${langCode}.wikipedia.org/wiki/${festival.wikipedia_titles[langCode as keyof typeof festival.wikipedia_titles] || festival.wikipedia_titles['en']}`

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (idx % 12) * 0.05 }}
              key={festival.slug}
            >
              <Link
                href={`/festivals/${festival.slug}`}
                className="group glass-card overflow-hidden flex flex-col h-full hover:border-maroon/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 block"
              >
                <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={displayImage}
                    alt={displayTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized={true}
                    onError={() => setFailedImages((prev) => ({ ...prev, [festival.slug]: true }))}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <span className="absolute bottom-4 left-4 bg-maroon text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1 border border-white/20">
                    {festival.region}
                  </span>
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-maroon text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 z-10 border border-red-100 uppercase tracking-wider">
                    <Calendar size={14} className="text-maroon" /> {festival.month}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-gray-900 mb-2 group-hover:text-maroon transition-colors line-clamp-1">
                      {displayTitle}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {wiki?.extract || dict.festivalPage.loadingWiki}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-maroon font-bold text-sm group-hover:text-red-700 transition-colors">
                    <span>{dict.festivalPage.exploreFestival}</span>
                    <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </PageTransition>
  )
}
