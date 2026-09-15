'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { getWikiSummaryWithCache, getHighResImageUrl, WikiSummary, SUPPORTED_LANGUAGES } from '@/lib/wikipedia'
import { getDictionary } from '@/lib/i18n'
import monumentsData from '@/data/monuments.json'
import { Search, MapPin, Clock, ExternalLink, Sparkles } from 'lucide-react'

export default function ExplorePage() {
  const supabase = createClient()
  const [langCode, setLangCode] = useState<string>('en')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(12)
  const [wikiCache, setWikiCache] = useState<Record<string, WikiSummary>>({})
  const [loadingSlugs, setLoadingSlugs] = useState<Record<string, boolean>>({})
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

  const filteredMonuments = monumentsData.filter((m) => {
    const query = searchQuery.toLowerCase()
    return (
      m.slug.toLowerCase().includes(query) ||
      m.state.toLowerCase().includes(query) ||
      m.era.toLowerCase().includes(query) ||
      Object.values(m.wikipedia_titles).some((t) => t.toLowerCase().includes(query))
    )
  })

  const visibleMonuments = filteredMonuments.slice(0, visibleCount)

  // Load Wikipedia content for visible monuments
  useEffect(() => {
    visibleMonuments.forEach(async (monument) => {
      if (!wikiCache[monument.slug] && !loadingSlugs[monument.slug]) {
        setLoadingSlugs((prev) => ({ ...prev, [monument.slug]: true }))
        const summary = await getWikiSummaryWithCache(monument.wikipedia_titles, langCode)
        if (summary) {
          setWikiCache((prev) => ({ ...prev, [monument.slug]: summary }))
        }
        setLoadingSlugs((prev) => ({ ...prev, [monument.slug]: false }))
      }
    })
  }, [visibleCount, langCode, searchQuery])

  // Prefetch on hover
  const handlePrefetch = async (monument: typeof monumentsData[0]) => {
    if (!wikiCache[monument.slug]) {
      const summary = await getWikiSummaryWithCache(monument.wikipedia_titles, langCode)
      if (summary) {
        setWikiCache((prev) => ({ ...prev, [monument.slug]: summary }))
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30 p-6 md:p-10">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-8 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={14} /> {dict.monument.wikiPowered} ({langCode.toUpperCase()})
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-serif">{dict.monument.title}</h1>
          <p className="mt-2 text-orange-100 text-sm md:text-base max-w-2xl">
            {dict.monument.subtitle}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.monument.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm text-gray-800"
          />
        </div>
      </div>

      {/* Monument Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleMonuments.map((monument) => {
          const wiki = wikiCache[monument.slug]
          const isLoading = loadingSlugs[monument.slug]
          const displayTitle = monument.name
          const snippet = wiki?.extract || dict.common?.loading || 'Loading historical summary from Wikipedia...'
          const wikiUrl = wiki?.content_urls?.desktop?.page || `https://${langCode}.wikipedia.org/wiki/${encodeURIComponent((monument.wikipedia_titles as any)?.[langCode] || monument.wikipediaTitle || monument.name)}`

          return (
            <div
              key={monument.slug}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                <Image
                  src={monument.imageUrl}
                  alt={monument.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 bg-orange-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md z-10">
                  {monument.state}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Prominent Link to Audio / Video / Text Detail Page */}
                  <div className="mb-3">
                    <Link
                      href={`/monument/${monument.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <span>{dict.monument.exploreBtn}</span>
                    </Link>
                  </div>

                  <a href={wikiUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {displayTitle}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-orange-500" /> {monument.era}
                      </span>
                    </div>

                    {/* Extract */}
                    {isLoading && !wiki ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {snippet}
                      </p>
                    )}
                  </a>
                </div>

                <a
                  href={wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-orange-600 hover:underline"
                >
                  <span>{dict.common.readOnWiki}</span>
                  <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredMonuments.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">{dict.monument.noResults}</p>
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredMonuments.length && (
        <div className="text-center mt-12">
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="bg-white hover:bg-orange-50 border-2 border-orange-500 text-orange-600 font-bold px-8 py-3.5 rounded-full shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            {dict.monument.loadMore} ({filteredMonuments.length - visibleCount})
          </button>
        </div>
      )}
    </div>
  )
}
