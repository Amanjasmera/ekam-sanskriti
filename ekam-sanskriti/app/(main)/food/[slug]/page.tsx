'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getWikiSummaryWithCache, getHighResImageUrl, WikiSummary, SUPPORTED_LANGUAGES } from '@/lib/wikipedia'
import { getDictionary } from '@/lib/i18n'
import foodsData from '@/data/foods.json'
import { ArrowLeft, Clock, Users, PlayCircle, BookOpen, Volume2, VolumeX, ExternalLink, ChefHat, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FoodDetailPage({ params }: { params: { slug: string } }) {
  const food = foodsData.find(f => f.slug === params.slug)
  if (!food) {
    notFound()
  }

  const supabase = createClient()
  const [langCode, setLangCode] = useState<string>('en')
  const [wiki, setWiki] = useState<WikiSummary | null>(null)
  const [activeTab, setActiveTab] = useState<'video' | 'recipe' | 'wiki'>('video')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [imageError, setImageError] = useState(false)
  
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
          }
        }
      }
    }
    loadUserLang()
  }, [])

  useEffect(() => {
    async function fetchWiki() {
      const summary = await getWikiSummaryWithCache(food!.wikipedia_titles as unknown as Record<string, string>, langCode)
      if (summary) {
        setWiki(summary)
      }
    }
    fetchWiki()
  }, [langCode, food])

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
      return
    }

    if (!food.recipe || !food.recipe.steps) return

    const utterance = new SpeechSynthesisUtterance()
    const textToRead = "Step by step recipe. " + food.recipe.steps.map((step: string, i: number) => `Step ${i + 1}. ${step}`).join(". ")
    utterance.text = textToRead
    utterance.lang = langCode === 'en' ? 'en-IN' : 'hi-IN' // Basic fallback, would map appropriately in production
    
    utterance.onend = () => setIsPlayingAudio(false)
    window.speechSynthesis.speak(utterance)
    setIsPlayingAudio(true)
  }

  const dict = getDictionary(langCode)
  const displayTitle = wiki?.title || food.name
  const rawImage = wiki?.originalimage?.source || wiki?.thumbnail?.source || food.imageUrl || food.image
  const displayImage = imageError ? '/images/fallback-food.jpg' : getHighResImageUrl(rawImage, 'food')
  const wikiUrl = wiki?.content_urls?.desktop?.page || `https://${langCode}.wikipedia.org/wiki/${food.wikiTitle || food.wikipedia_titles[langCode as keyof typeof food.wikipedia_titles] || food.wikipedia_titles['en']}`

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header Image Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-gray-900 overflow-hidden">
        <Image
          src={displayImage}
          alt={displayTitle}
          fill
          sizes="100vw"
          className="object-cover opacity-60"
          unoptimized={true}
          onError={() => setImageError(true)}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
          <Link href="/food" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold hover:bg-white/30 transition-colors">
            <ArrowLeft size={16} /> {dict.foodDetail.backToFood}
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              {food.state}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-serif mb-2">{displayTitle}</h1>
            <p className="text-amber-100 text-lg">{food.type}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-8 relative z-20">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('video')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'video' ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <PlayCircle size={18} /> 🎥 {dict.foodDetail.watchVideo}
          </button>
          <button 
            onClick={() => setActiveTab('recipe')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'recipe' ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <ChefHat size={18} /> 📝 {dict.foodDetail.stepByStepRecipe}
          </button>
          <button 
            onClick={() => setActiveTab('wiki')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'wiki' ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <BookOpen size={18} /> 📖 {dict.foodDetail.wikipedia}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* VIDEO TAB */}
            {activeTab === 'video' && (
              <motion.div 
                key="video"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="w-full h-full"
              >
                {food.youtubeVideoId ? (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <iframe 
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${food.youtubeVideoId}`} 
                      title={`${food.name} Recipe Video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <PlayCircle size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">{dict.foodDetail.noVideo}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* RECIPE TAB */}
            {activeTab === 'recipe' && (
              <motion.div 
                key="recipe"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                {food.recipe ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Left Column: Meta & Ingredients */}
                    <div className="lg:col-span-1 space-y-8">
                      <div className="bg-orange-50 rounded-2xl p-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1"><Clock size={12} /> {dict.foodDetail.prepTime}</span>
                            <span className="font-semibold text-gray-900">{food.recipe.prepTime}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1"><Clock size={12} /> {dict.foodDetail.cookTime}</span>
                            <span className="font-semibold text-gray-900">{food.recipe.cookTime}</span>
                          </div>
                          <div className="flex flex-col gap-1 col-span-2">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1"><Users size={12} /> {dict.foodDetail.servings}</span>
                            <span className="font-semibold text-gray-900">{food.recipe.servings}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
                          {dict.foodDetail.ingredients}
                        </h3>
                        <ul className="space-y-3">
                          {food.recipe.ingredients.map((ing: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                              <span>{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Column: Steps */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold font-serif">{dict.foodDetail.instructions}</h3>
                        <button 
                          onClick={toggleAudio}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${isPlayingAudio ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                        >
                          {isPlayingAudio ? (
                            <><VolumeX size={16} /> {dict.foodDetail.stopAudio}</>
                          ) : (
                            <><Volume2 size={16} /> {dict.foodDetail.readSteps}</>
                          )}
                        </button>
                      </div>

                      <div className="space-y-6">
                        {food.recipe.steps.map((step: string, i: number) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold font-serif text-sm">
                              {i + 1}
                            </div>
                            <p className="text-gray-700 leading-relaxed pt-1">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <ChefHat size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">Recipe details coming soon.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* WIKI TAB */}
            {activeTab === 'wiki' && (
              <motion.div 
                key="wiki"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto"
              >
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                  <Sparkles size={14} /> {dict.foodPage?.wikiPowered || 'Powered by Wikipedia'} ({langCode.toUpperCase()})
                </div>
                
                <h3 className="text-3xl font-bold font-serif mb-6">{displayTitle}</h3>
                
                <div className="prose prose-lg prose-amber text-gray-700">
                  {wiki?.extract ? (
                    <p className="leading-relaxed">{wiki.extract}</p>
                  ) : (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <a 
                    href={wikiUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                  >
                    {dict.common.readOnWiki} <ExternalLink size={18} />
                  </a>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
