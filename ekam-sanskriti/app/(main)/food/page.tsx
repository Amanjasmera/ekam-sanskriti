'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { getWikiSummaryWithCache, getHighResImageUrl, WikiSummary, SUPPORTED_LANGUAGES } from '@/lib/wikipedia'
import { getDictionary } from '@/lib/i18n'
import foodsData from '@/data/foods.json'
import { Sparkles, Utensils, ExternalLink } from 'lucide-react'

export default function FoodPage() {
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
    foodsData.forEach(async (food) => {
      const summary = await getWikiSummaryWithCache(food.wikipedia_titles as unknown as Record<string, string>, langCode)
      if (summary) {
        setWikiCache(prev => ({ ...prev, [food.slug]: summary }))
      }
    })
  }, [langCode])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30 p-6 md:p-10 font-sans">
      {/* Banner */}
      <div className="max-w-7xl mx-auto mb-10 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={14} /> {dict.foodPage.wikiPowered} ({langCode.toUpperCase()})
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-serif">{dict.foodPage.title}</h1>
        <p className="mt-2 text-amber-100 max-w-2xl text-sm md:text-base">
          {dict.foodPage.subtitle}
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodsData.map((food) => {
          const wiki = wikiCache[food.slug]
          const displayTitle = wiki?.title || food.slug.replace(/-/g, ' ').toUpperCase()
          const rawImage = wiki?.originalimage?.source || wiki?.thumbnail?.source || food.image
          const isFailed = failedImages[food.slug]
          const displayImage = isFailed ? '/images/fallback-food.jpg' : getHighResImageUrl(rawImage, 'food')
          const wikiUrl = wiki?.content_urls?.desktop?.page || `https://${langCode}.wikipedia.org/wiki/${food.wikipedia_titles[langCode as keyof typeof food.wikipedia_titles] || food.wikipedia_titles['en']}`

          return (
            <Link
              key={food.slug}
              href={`/food/${food.slug}`}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group block"
            >
              <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                <Image
                  src={displayImage}
                  alt={displayTitle}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized={true}
                  onError={() => setFailedImages((prev) => ({ ...prev, [food.slug]: true }))}
                />
                <span className="absolute bottom-3 left-3 bg-amber-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md z-10">
                  {food.state}
                </span>
                <span className="absolute top-3 right-3 bg-white/90 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                  {food.type}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {displayTitle}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {wiki?.extract || dict.foodPage.loadingWiki}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 group-hover:text-amber-900"
                  >
                    <span>{dict.foodPage.viewRecipe}</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
