'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getWikiSummaryWithCache, getHighResImageUrl, WikiSummary, SUPPORTED_LANGUAGES } from '@/lib/wikipedia'
import { getDictionary } from '@/lib/i18n'
import monumentsData from '@/data/monuments.json'
import { Search, MapPin, Clock, ExternalLink, Sparkles } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import { motion } from 'framer-motion'

export default function ExplorePage() {
  const supabase = createClient()
  const [langCode, setLangCode] = useState<string>('en')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(12)
  const [wikiCache, setWikiCache] = useState<Record<string, WikiSummary>>({})
  const [loadingSlugs, setLoadingSlugs] = useState<Record<string, boolean>>({})

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount, langCode, searchQuery])

  return (
    <PageTransition className="min-h-screen bg-cream p-6 md:p-10">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-saffron to-maroon rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/30">
            <Sparkles size={14} className="text-gold" /> {dict.monument.wikiPowered} ({langCode.toUpperCase()})
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading drop-shadow-md">{dict.monument.title}</h1>
          <p className="mt-3 text-orange-100 text-base md:text-lg max-w-2xl font-light">
            {dict.monument.subtitle}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="relative max-w-xl mx-auto md:mx-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-saffron" size={22} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.monument.searchPlaceholder}
            className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-xl rounded-[16px] border border-gray-200 focus:ring-4 focus:ring-saffron/20 focus:border-saffron shadow-lg text-gray-900 transition-all font-medium text-lg"
          />
        </div>
      </div>

      {/* Monument Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {visibleMonuments.map((monument, idx) => {
          const wiki = wikiCache[monument.slug]
          const isLoading = loadingSlugs[monument.slug]
          const displayTitle = monument.name
          const snippet = wiki?.extract || dict.common?.loading || 'Loading historical summary from Wikipedia...'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const wikiUrl = wiki?.content_urls?.desktop?.page || `https://${langCode}.wikipedia.org/wiki/${encodeURIComponent((monument.wikipedia_titles as any)?.[langCode] || monument.wikipediaTitle || monument.name)}`

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (idx % 12) * 0.05 }}
              key={monument.slug}
              className="group glass-card overflow-hidden flex flex-col hover:border-saffron/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                <Image
                  src={monument.imageUrl}
                  alt={monument.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <span className="absolute bottom-4 left-4 bg-saffron text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1 border border-white/20">
                  <MapPin size={12} /> {monument.state}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <Link
                      href={`/monument/${monument.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-saffron hover:bg-saffron-600 text-white font-bold text-sm px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                      <span>{dict.monument.exploreBtn}</span>
                    </Link>
                  </div>

                  <a href={wikiUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <h3 className="text-xl font-bold font-heading text-gray-900 group-hover:text-saffron transition-colors line-clamp-1">
                      {displayTitle}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 mt-2 mb-4 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-saffron" /> {monument.era}
                      </span>
                    </div>

                    {/* Extract */}
                    {isLoading && !wiki ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-4/6"></div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {snippet}
                      </p>
                    )}
                  </a>
                </div>

                <a
                  href={wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-saffron hover:text-saffron-600 transition-colors"
                >
                  <span>{dict.common.readOnWiki}</span>
                  <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredMonuments.length === 0 && (
        <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl mt-8 border border-dashed border-gray-300">
          <p className="text-gray-700 text-xl font-medium">{dict.monument.noResults}</p>
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredMonuments.length && (
        <div className="text-center mt-16 mb-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="bg-white hover:bg-saffron/10 border-2 border-saffron text-saffron font-bold px-10 py-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer text-lg"
          >
            {dict.monument.loadMore} ({filteredMonuments.length - visibleCount})
          </button>
        </div>
      )}
    </PageTransition>
  )
}
