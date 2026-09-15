'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { getWikiSummaryWithCache, getHighResImageUrl, WikiSummary, SUPPORTED_LANGUAGES } from '@/lib/wikipedia'
import { getDictionary } from '@/lib/i18n'
import festivalsData from '@/data/festivals.json'
import { Sparkles, Calendar, ExternalLink } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-amber-50/30 p-6 md:p-10 font-sans">
      {/* Banner */}
      <div className="max-w-7xl mx-auto mb-10 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={14} /> {dict.festivalPage.wikiPowered} ({langCode.toUpperCase()})
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-serif">{dict.festivalPage.title}</h1>
        <p className="mt-2 text-orange-100 max-w-2xl text-sm md:text-base">
          {dict.festivalPage.subtitle}
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {festivalsData.map((festival) => {
          const wiki = wikiCache[festival.slug]
          const displayTitle = wiki?.title || festival.slug.replace(/-/g, ' ').toUpperCase()
          const rawImage = wiki?.originalimage?.source || wiki?.thumbnail?.source || festival.image
          const isFailed = failedImages[festival.slug]
          const displayImage = isFailed ? '/images/fallback-festival.jpg' : getHighResImageUrl(rawImage, 'festival')
          const wikiUrl = wiki?.content_urls?.desktop?.page || `https://${langCode}.wikipedia.org/wiki/${festival.wikipedia_titles[langCode as keyof typeof festival.wikipedia_titles] || festival.wikipedia_titles['en']}`

          return (
            <Link
              href={`/festivals/${festival.slug}`}
              key={festival.slug}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer block"
            >
              <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                <Image
                  src={displayImage}
                  alt={displayTitle}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized={true}
                  onError={() => setFailedImages((prev) => ({ ...prev, [festival.slug]: true }))}
                />
                <span className="absolute bottom-3 left-3 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md z-10">
                  {festival.region}
                </span>
                <span className="absolute top-3 right-3 bg-white/90 text-red-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                  <Calendar size={12} /> {festival.month}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {displayTitle}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {wiki?.extract || dict.festivalPage.loadingWiki}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-red-600 font-bold text-xs group-hover:text-red-800">
                  <span>{dict.festivalPage.exploreFestival}</span>
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
