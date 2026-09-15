'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getWikiSummaryWithCache, getHighResImageUrl, WikiSummary, SUPPORTED_LANGUAGES } from '@/lib/wikipedia'
import { getDictionary } from '@/lib/i18n'
import festivalsData from '@/data/festivals.json'
import { ArrowLeft, PlayCircle, BookOpen, Volume2, VolumeX, ExternalLink, Sparkles, MapPin, Calendar, ScrollText, PartyPopper } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FestivalDetailPage({ params }: { params: { slug: string } }) {
  const festival = festivalsData.find(f => f.slug === params.slug)
  if (!festival) {
    notFound()
  }

  const supabase = createClient()
  const [langCode, setLangCode] = useState<string>('en')
  const [wiki, setWiki] = useState<WikiSummary | null>(null)
  const [activeTab, setActiveTab] = useState<'watch' | 'story' | 'celebration' | 'wiki'>('story')
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
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
      // For festivals, wikiTitle or fallback to the localized wikipedia_titles
      const summary = await getWikiSummaryWithCache(festival!.wikipedia_titles as unknown as Record<string, string>, langCode)
      if (summary) {
        setWiki(summary)
      }
    }
    fetchWiki()
  }, [langCode, festival])

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const toggleAudio = (text: string, id: string, customLang?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (playingAudioId === id) {
      window.speechSynthesis.cancel()
      setPlayingAudioId(null)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Choose appropriate voice/language mapping
    if (customLang) {
      // Basic mapping from 2-letter to valid language tag
      const langMap: Record<string, string> = {
        'hi': 'hi-IN', 'en': 'en-IN', 'ta': 'ta-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 'ur': 'ur-IN', 'pa': 'pa-IN'
      }
      utterance.lang = langMap[customLang] || 'hi-IN'
    } else {
      utterance.lang = langCode === 'en' ? 'en-IN' : 'hi-IN'
    }
    
    utterance.onend = () => setPlayingAudioId(null)
    window.speechSynthesis.speak(utterance)
    setPlayingAudioId(id)
  }

  const dict = getDictionary(langCode)
  const displayTitle = wiki?.title || festival.name
  const rawImage = wiki?.originalimage?.source || wiki?.thumbnail?.source || festival.imageUrl || festival.image
  const displayImage = imageError ? '/images/fallback-festival.jpg' : getHighResImageUrl(rawImage, 'festival')
  
  // Use 'any' type cast here to bypass strict TS issues with dynamic fields
  const data: any = festival
  const wikiUrl = wiki?.content_urls?.desktop?.page || `https://${langCode}.wikipedia.org/wiki/${data.wikiTitle || festival!.wikipedia_titles[langCode as keyof typeof festival.wikipedia_titles] || festival!.wikipedia_titles['en']}`

  const tabDict = dict.festivalDetail || {
    watch: "Watch",
    storySignificance: "Story & Significance",
    howCelebrated: "How It's Celebrated",
    origin: "Origin",
    significance: "Significance",
    keyFigures: "Key Figures",
    rituals: "Rituals",
    duration: "Duration",
    stateWiseCelebrations: "State-Wise Celebrations",
    specialFood: "Special Food",
    decorations: "Decorations",
    greetings: "Greetings"
  }

  return (
    <div className="min-h-screen bg-orange-50/30 pb-20 font-sans">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full bg-gray-900 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
          <Link href="/festivals" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold hover:bg-white/30 transition-colors">
            <ArrowLeft size={16} /> {dict.common.back}
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="max-w-7xl mx-auto flex flex-col items-start gap-4">
            <div className="flex gap-2">
              <div className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <MapPin size={14} /> {festival.region}
              </div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Calendar size={14} /> {festival.month}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-serif">{displayTitle}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-8 relative z-20">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('watch')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'watch' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <PlayCircle size={18} /> 🎥 {tabDict.watch}
          </button>
          <button 
            onClick={() => setActiveTab('story')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'story' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <ScrollText size={18} /> 📝 {tabDict.storySignificance}
          </button>
          <button 
            onClick={() => setActiveTab('celebration')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'celebration' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <PartyPopper size={18} /> 🎉 {tabDict.howCelebrated}
          </button>
          <button 
            onClick={() => setActiveTab('wiki')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'wiki' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <BookOpen size={18} /> 📖 {dict.foodDetail?.wikipedia || 'Wikipedia'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-orange-100 p-6 md:p-10 min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* WATCH TAB */}
            {activeTab === 'watch' && (
              <motion.div 
                key="watch"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="w-full h-full"
              >
                {data.youtubeVideoId ? (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <iframe 
                      className="w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${data.youtubeVideoId}`} 
                      title={`${festival.name} Video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <PlayCircle size={48} className="mb-4 opacity-50" />
                    <p className="font-medium text-lg">{dict.foodDetail?.noVideo?.replace('recipe', 'festival') || 'Video coming soon'}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STORY TAB */}
            {activeTab === 'story' && (
              <motion.div 
                key="story"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                {data.story ? (
                  <div className="space-y-12">
                    
                    {/* Origin Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold font-serif text-gray-900">{tabDict.origin}</h3>
                        <button 
                          onClick={() => toggleAudio(data.story.origin, 'origin')}
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${playingAudioId === 'origin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {playingAudioId === 'origin' ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                      </div>
                      <p className="text-lg text-gray-700 leading-relaxed">{data.story.origin}</p>
                    </div>

                    {/* Significance Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold font-serif text-gray-900">{tabDict.significance}</h3>
                        <button 
                          onClick={() => toggleAudio(data.story.significance, 'significance')}
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${playingAudioId === 'significance' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {playingAudioId === 'significance' ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                      </div>
                      <p className="text-lg text-gray-700 leading-relaxed">{data.story.significance}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Key Figures Section */}
                      {data.story.deity && data.story.deity.length > 0 && (
                        <div className="bg-orange-50 p-6 rounded-2xl">
                          <h4 className="text-lg font-bold font-serif text-orange-900 mb-4">{tabDict.keyFigures}</h4>
                          <div className="flex flex-wrap gap-2">
                            {data.story.deity.map((d: string, i: number) => (
                              <span key={i} className="px-4 py-2 bg-white text-orange-800 font-semibold rounded-full shadow-sm text-sm border border-orange-100">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Scriptures Section */}
                      {data.story.scriptures && data.story.scriptures.length > 0 && (
                        <div className="bg-red-50 p-6 rounded-2xl">
                          <h4 className="text-lg font-bold font-serif text-red-900 mb-4">{dict.monumentDetail?.youMightAlsoLike?.replace('Monuments', 'Scriptures') || 'Related Scriptures'}</h4>
                          <div className="flex flex-wrap gap-2">
                            {data.story.scriptures.map((s: string, i: number) => (
                              <span key={i} className="px-4 py-2 bg-white text-red-800 font-semibold rounded-full shadow-sm text-sm border border-red-100">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <ScrollText size={48} className="mb-4 opacity-50" />
                    <p className="font-medium text-lg">{dict.common?.loading || 'Story details coming soon.'}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* CELEBRATION TAB */}
            {activeTab === 'celebration' && (
              <motion.div 
                key="celebration"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                {data.celebration ? (
                  <div className="space-y-12">
                    
                    {/* Duration Pill */}
                    {data.celebration.duration && (
                      <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-red-600/20 text-lg">
                          <Calendar size={20} /> {data.celebration.duration}
                        </div>
                      </div>
                    )}

                    {/* Rituals */}
                    {data.celebration.rituals && data.celebration.rituals.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold font-serif text-gray-900 mb-6">{tabDict.rituals}</h3>
                        <ul className="space-y-4">
                          {data.celebration.rituals.map((ritual: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100 group">
                              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                                {i + 1}
                              </span>
                              <span className="text-gray-700 leading-relaxed pt-1 flex-1">{ritual}</span>
                              <button 
                                onClick={() => toggleAudio(ritual, `ritual-${i}`)}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 ${playingAudioId === `ritual-${i}` ? 'bg-red-100 text-red-600 opacity-100' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'}`}
                              >
                                {playingAudioId === `ritual-${i}` ? <VolumeX size={14} /> : <Volume2 size={14} />}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Day by Day Timeline */}
                    {data.celebration.days && data.celebration.days.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold font-serif text-gray-900 mb-6">{dict.festivalDetail?.duration || 'Day-by-Day'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.celebration.days.map((dayObj: any, i: number) => (
                            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -z-0" />
                              <h4 className="font-bold text-red-700 mb-2 relative z-10">{dayObj.day}</h4>
                              <p className="text-sm text-gray-600 leading-relaxed relative z-10">{dayObj.activity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* State-Wise Celebrations */}
                    {data.celebration.stateWiseCelebrations && data.celebration.stateWiseCelebrations.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold font-serif text-gray-900 mb-6">{tabDict.stateWiseCelebrations}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {data.celebration.stateWiseCelebrations.map((st: any, i: number) => (
                            <div key={i} className="flex flex-col p-4 rounded-2xl border-l-4 border-amber-500 bg-amber-50/50">
                              <span className="font-bold text-gray-900 text-lg">{st.state}</span>
                              <span className="text-gray-700 mt-1">{st.custom}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Food and Decorations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {data.celebration.specialFood && data.celebration.specialFood.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold font-serif text-gray-900 mb-4">{tabDict.specialFood}</h3>
                          <div className="flex flex-wrap gap-2">
                            {data.celebration.specialFood.map((food: string, i: number) => (
                              <span key={i} className="px-4 py-2 bg-yellow-100 text-yellow-800 font-semibold rounded-full shadow-sm text-sm">
                                🍲 {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {data.celebration.decorations && data.celebration.decorations.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold font-serif text-gray-900 mb-4">{tabDict.decorations}</h3>
                          <div className="flex flex-wrap gap-2">
                            {data.celebration.decorations.map((dec: string, i: number) => (
                              <span key={i} className="px-4 py-2 bg-pink-100 text-pink-800 font-semibold rounded-full shadow-sm text-sm">
                                ✨ {dec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Greetings */}
                    {data.celebration.greetings && data.celebration.greetings.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold font-serif text-gray-900 mb-6">{tabDict.greetings}</h3>
                        <div className="flex flex-wrap gap-3">
                          {data.celebration.greetings.map((greet: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm pr-4">
                              <button 
                                onClick={() => toggleAudio(greet.text, `greet-${i}`, greet.language)}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors flex-shrink-0 ${playingAudioId === `greet-${i}` ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
                              >
                                {playingAudioId === `greet-${i}` ? <VolumeX size={14} /> : <Volume2 size={14} />}
                              </button>
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{greet.language}</span>
                                <span className="font-semibold text-gray-900">{greet.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <PartyPopper size={48} className="mb-4 opacity-50" />
                    <p className="font-medium text-lg">{dict.common?.loading || 'Celebration details coming soon.'}</p>
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
                  <Sparkles size={14} /> {dict.festivalPage?.wikiPowered || 'Powered by Wikipedia'} ({langCode.toUpperCase()})
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold font-serif">{displayTitle}</h3>
                  <button 
                    onClick={() => toggleAudio(wiki?.extract || '', 'wiki')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${playingAudioId === 'wiki' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                  >
                    {playingAudioId === 'wiki' ? (
                      <><VolumeX size={16} /> {dict.foodDetail?.stopAudio || 'Stop Audio'}</>
                    ) : (
                      <><Volume2 size={16} /> {dict.monument?.listenAudio || 'Read Aloud'}</>
                    )}
                  </button>
                </div>
                
                <div className="prose prose-lg prose-red text-gray-700">
                  {wiki?.extract ? (
                    // In a real app we'd split into 3 paragraphs if Wikipedia gives HTML, but summary is usually 1-2 paragraphs. 
                    // We'll just render the summary extract string.
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
                    {dict.common?.readOnWiki || 'Read Full Article on Wikipedia'} <ExternalLink size={18} />
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
