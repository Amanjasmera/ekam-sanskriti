'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { 
  getWikiSummaryWithCache, 
  getLanguageSpeechTag, 
  WikiSummary, 
  SUPPORTED_LANGUAGES 
} from '@/lib/wikipedia'
import { getDictionary } from '@/lib/i18n'
import monumentsData from '@/data/monuments.json'
import monumentVideos from '@/data/monument-videos.json'
import { 
  Volume2, VolumeX, ArrowLeft, MapPin, Share2, 
  Heart, Play, Pause, Sparkles, 
  CheckCircle2, BookOpen, Film, Radio, Landmark
} from 'lucide-react'

export default function MonumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  // Get slug from params
  const rawParam = (params?.id || params?.slug) as string
  const slug = rawParam ? decodeURIComponent(rawParam).toLowerCase() : ''

  // Find monument data
  const monument = monumentsData.find(
    (m) => m.slug.toLowerCase() === slug || m.slug.replace(/-/g, '') === slug.replace(/-/g, '')
  )

  // Page States
  const [activeTab, setActiveTab] = useState<'listen' | 'watch' | 'read'>('listen')
  const [langCode, setLangCode] = useState<string>('en')
  const dict = getDictionary(langCode)
  const [wikiSummary, setWikiSummary] = useState<WikiSummary | null>(null)
  const [fullArticleText, setFullArticleText] = useState<string[]>([])
  const [loadingWiki, setLoadingWiki] = useState(true)
  const [isSavedToJourney, setIsSavedToJourney] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Audio / Speech States
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyMon = monument as any;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [speechRate, setSpeechRate] = useState<number>(0.9)
  const [currentReadingParagraph, setCurrentReadingParagraph] = useState<number | null>(null)
  const [isFullReadExpanded, setIsFullReadExpanded] = useState(false)

  // Video / Slideshow States
  const [slideshowIndex, setSlideshowIndex] = useState(0)
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false)
  

  // YouTube Video ID
  const youtubeId = anyMon?.youtubeVideoId || (monumentVideos as Record<string, string>)[slug]

  // Slideshow image gallery (fallback for video)
  const galleryImages = [
    monument?.image || '/images/fallback-monument.jpg',
    'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop',
  ]

  // Load User Preferred Language
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
  }, [supabase])

  // Fetch Wikipedia Summary & Full Article Content
  useEffect(() => {
    if (!monument) return
    const currentMon = monument

    async function fetchWiki() {
      setLoadingWiki(true)
      // Fetch summary (REST API)
      const summary = await getWikiSummaryWithCache(currentMon.wikipedia_titles || { en: currentMon.name }, langCode)
      setWikiSummary(summary)

      // Fetch full extract paragraphs (MediaWiki API)
      const title = ((currentMon.wikipedia_titles || {}) as Record<string, string>)?.[langCode] || ((currentMon.wikipedia_titles || {}) as Record<string, string>)?.['en'] || currentMon.name
      try {
        const apiUrl = `https://${langCode}.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(title)}&format=json&origin=*&explaintext=1`
        const res = await fetch(apiUrl)
        const data = await res.json()
        const pages = data?.query?.pages || {}
        const firstKey = Object.keys(pages)[0]
        const extractText = pages[firstKey]?.extract || summary?.extract || ''
        
        // Split into non-empty paragraphs
        const paragraphs = extractText
          .split('\n')
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 30 && !p.startsWith('=='))

        setFullArticleText(paragraphs.length > 0 ? paragraphs : [summary?.extract || 'No text content found.'])
      } catch {
        setFullArticleText([summary?.extract || 'No text content found.'])
      }
      setLoadingWiki(false)
    }

    fetchWiki()
  }, [monument, langCode, supabase])

  // Automatic Slideshow Timer (Ken Burns Video Tab)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (activeTab === 'watch' && isPlayingSlideshow) {
      interval = setInterval(() => {
        setSlideshowIndex((prev) => (prev + 1) % galleryImages.length)
      }, 4000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [activeTab, isPlayingSlideshow, galleryImages.length])

  // Stop Web Speech API when leaving tab or unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Natural Speech Synthesis Helper
  const speakChunks = (text: string, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.')
      return
    }

    window.speechSynthesis.cancel()

    const voices = window.speechSynthesis.getVoices()
    const speechTag = getLanguageSpeechTag(langCode)
    
    // Voice priority: Google/Natural voice -> Lang match -> Fallback
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith(speechTag))
      || voices.find(v => v.name.includes('Google') && v.lang.startsWith(langCode))
      || voices.find(v => v.lang.startsWith(speechTag))
      || voices.find(v => v.lang.startsWith(langCode))
      || voices[0]

    // Chunk text by punctuation to avoid Chrome/Edge limits (< 200 chars)
    const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text]
    const chunks: string[] = []
    
    let currentChunk = ''
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length < 180) {
        currentChunk += ' ' + sentence
      } else {
        if (currentChunk.trim()) chunks.push(currentChunk.trim())
        currentChunk = sentence
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim())

    setIsPlayingAudio(true)

    chunks.forEach((chunk, idx) => {
      const utterance = new SpeechSynthesisUtterance(chunk)
      if (preferredVoice) utterance.voice = preferredVoice
      utterance.lang = speechTag
      utterance.rate = speechRate

      if (idx === chunks.length - 1) {
        utterance.onend = () => {
          setIsPlayingAudio(false)
          setCurrentReadingParagraph(null)
          if (onEndCallback) onEndCallback()
        }
        utterance.onerror = () => {
          setIsPlayingAudio(false)
          setCurrentReadingParagraph(null)
        }
      }

      window.speechSynthesis.speak(utterance)
    })
  }

  // Handle Play/Pause Main Narration (Tab 1)
  const handleToggleMainAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
      setCurrentReadingParagraph(null)
    } else {
      const textToRead = wikiSummary?.extract || fullArticleText.slice(0, 3).join(' ') || monument?.name || ''
      speakChunks(textToRead)
    }
  }

  // Handle Play/Pause Specific Paragraph (Tab 3)
  const handlePlayParagraph = (index: number, text: string) => {
    if (currentReadingParagraph === index && isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
      setCurrentReadingParagraph(null)
    } else {
      setCurrentReadingParagraph(index)
      speakChunks(text, () => setCurrentReadingParagraph(null))
    }
  }

  // Handle Watch Tab Click (Slideshow + Narration Sync)
  const handleWatchTabClick = () => {
    setActiveTab('watch')
    setIsPlayingSlideshow(true)
    if (!isPlayingAudio) {
      const textToRead = wikiSummary?.extract || fullArticleText[0] || ''
      speakChunks(textToRead)
    }
  }

  // Add to Journey (Supabase & LocalStorage)
  const handleAddToJourney = async () => {
    if (!monument) return
    setIsSavedToJourney(true)

    // Store in localStorage
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('my_journey_monuments') || '[]')
      if (!saved.some((item: {slug: string, name?: string, image?: string, date?: string}) => item.slug === monument.slug)) {
        saved.push({ slug: monument.slug, name: monument.name, image: monument.image, date: new Date().toISOString() })
        localStorage.setItem('my_journey_monuments', JSON.stringify(saved))
      }
    }

    // Store in Supabase if logged in
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('user_journey').upsert({
          user_id: user.id,
          monument_slug: monument.slug,
          saved_at: new Date().toISOString()
        }, { onConflict: 'user_id,monument_slug' })
      }
    } catch {}

    setToastMessage(`✨ ${monument.name} added to your Journey!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Share on WhatsApp
  const handleShareWhatsApp = () => {
    if (!monument) return
    const text = `Explore ${monument.name} in ${monument.state} on Ekam Sanskriti! https://ekam-sanskriti.app/monument/${monument.slug}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (!monument) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-100">
        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-4">Monument Not Found</h1>
        <p className="text-gray-600 mb-6">The requested monument details could not be located.</p>
        <Link href="/explore" className="bg-orange-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-orange-700 transition-colors">
          Return to Explore Monuments
        </Link>
      </div>
    )
  }

  // Related Monuments (Exclude current)
  const relatedMonuments = monumentsData
    .filter((m) => m.slug !== monument.slug)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[2000] bg-gray-900 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-2xl border border-orange-500 flex items-center gap-2 animate-bounce">
          <Sparkles className="text-orange-400" size={18} />
          {toastMessage}
        </div>
      )}

      {/* 1. HERO IMAGE BANNER (Height 400px, Full-width) */}
      <div className="relative w-full h-[400px] bg-gray-900 overflow-hidden">
        <Image
          src={monument.image}
          alt={monument.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized={true}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

        {/* Back Button (Top-Left) */}
        <button
          onClick={() => router.push('/explore')}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-gray-900 font-bold shadow-lg hover:bg-white transition-all cursor-pointer hover:scale-105"
        >
          <ArrowLeft size={18} /> {dict.monumentDetail.backToExplore}
        </button>

        {/* Hero Details Overlay */}
        <div className="absolute bottom-8 left-6 right-6 max-w-6xl mx-auto z-10 text-white">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="bg-orange-600 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              📍 {monument.state}
            </span>
            <span className="bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1 rounded-full text-xs font-semibold">
              🏛️ {monument.era}
            </span>
            {anyMon.quickFacts?.unesco && (
              <span className="bg-amber-500/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Sparkles size={12} /> {dict.monumentDetail.unescoHeritage}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold font-serif drop-shadow-md text-white">
            {monument.name}
          </h1>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6 space-y-8">

        {/* 2. THREE TAB NAVIGATION BAR */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-2 flex items-center justify-around gap-2">
          {[
            { key: 'listen', label: dict.monumentDetail.listen, icon: Volume2, emoji: '🔊' },
            { key: 'watch', label: dict.monumentDetail.watch, icon: Film, emoji: '🎥' },
            { key: 'read', label: dict.monumentDetail.read, icon: BookOpen, emoji: '📖' },
          ].map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'watch') {
                    handleWatchTabClick()
                  } else {
                    setActiveTab(tab.key as "listen"|"watch"|"read")
                  }
                }}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg scale-[1.02]'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <span className="text-lg">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB CONTENT AREA */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">

          {/* TAB 1 — 🔊 LISTEN (Audio) */}
          {activeTab === 'listen' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 rounded-2xl border border-orange-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleToggleMainAudio}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer hover:scale-110 ${
                      isPlayingAudio ? 'bg-red-600 animate-pulse' : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    {isPlayingAudio ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </button>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <Radio className="text-orange-600" size={20} />
                      {dict.monumentDetail.audioNarration} ({langCode.toUpperCase()})
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {isPlayingAudio ? dict.monumentDetail.playingNarration : dict.monumentDetail.clickToListen}
                    </p>
                  </div>
                </div>

                {/* Controls: Speed & Language */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Speed Selector */}
                  <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 shadow-sm">
                    <span>{dict.monumentDetail.speed}</span>
                    {[0.5, 0.9, 1.25].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setSpeechRate(rate)
                          if (isPlayingAudio) {
                            window.speechSynthesis.cancel()
                            setIsPlayingAudio(false)
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md cursor-pointer ${
                          speechRate === rate ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {/* Language Selector */}
                  <select
                    value={langCode}
                    onChange={(e) => setLangCode(e.target.value)}
                    className="bg-white px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        🌐 {l.name} ({l.native})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text being read */}
              <div className="p-6 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <Volume2 size={18} />
                  <span>{dict.monumentDetail.narrationScriptText}</span>
                </div>
                <p className="text-gray-800 text-base md:text-lg leading-relaxed font-sans">
                  {loadingWiki
                    ? dict.monumentDetail.loadingSummary
                    : wikiSummary?.extract || fullArticleText[0] || dict.monumentDetail.summaryPrepared}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2 — 🎥 WATCH (Video / Ken Burns Slideshow) */}
          {activeTab === 'watch' && (
            <div className="space-y-4">
              <div className="relative w-full h-[350px] md:h-[450px] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=0`}
                    title={`${monument.name} Video`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  /* Ken Burns Slideshow Fallback */
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={galleryImages[slideshowIndex]}
                      alt={`${monument.name} Slide ${slideshowIndex + 1}`}
                      fill
                      className="object-cover transition-all duration-1000 transform scale-105 animate-pulse"
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Slideshow Player Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white z-10">
                      <div>
                        <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          🎥 {dict.monumentDetail.documentarySlideshow}
                        </span>
                        <h3 className="text-xl font-bold mt-1">{monument.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlayingSlideshow(!isPlayingSlideshow)}
                          className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 cursor-pointer"
                        >
                          {isPlayingSlideshow ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center font-medium">
                {youtubeId ? dict.monumentDetail.playingYoutube : dict.monumentDetail.playingSlideshow}
              </p>
            </div>
          )}

          {/* TAB 3 — 📖 READ (Text) */}
          {activeTab === 'read' && (
            <div className="space-y-6">
              {loadingWiki ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
              ) : (
                <div className="space-y-6">
                  {(isFullReadExpanded ? fullArticleText : fullArticleText.slice(0, 3)).map((para, idx) => {
                    const isReadingThis = currentReadingParagraph === idx && isPlayingAudio
                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          isReadingThis
                            ? 'bg-orange-50 border-orange-300 shadow-md ring-2 ring-orange-400'
                            : 'bg-gray-50/70 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-gray-800 text-base md:text-lg leading-relaxed flex-1">
                            {para}
                          </p>
                          <button
                            onClick={() => handlePlayParagraph(idx, para)}
                            className={`p-2.5 rounded-full shadow-sm flex-shrink-0 cursor-pointer transition-all ${
                              isReadingThis ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-orange-600 hover:bg-orange-600 hover:text-white border border-gray-200'
                            }`}
                            title="Listen paragraph"
                          >
                            {isReadingThis ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {/* Read More Expand Button */}
                  {fullArticleText.length > 3 && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => setIsFullReadExpanded(!isFullReadExpanded)}
                        className="bg-gray-900 hover:bg-black text-white font-bold px-8 py-3 rounded-full text-sm shadow-md transition-all cursor-pointer"
                      >
                        {isFullReadExpanded ? dict.monumentDetail.showLess : dict.monumentDetail.readFullArticle.replace('{count}', String(fullArticleText.length))}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* 6. BELOW TABS — ADDITIONAL INFO (ALWAYS VISIBLE) */}
        <div className="space-y-8">

          {/* QUICK FACTS GRID */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6 flex items-center gap-2.5">
              <Landmark className="text-orange-600" size={24} />
              {dict.monumentDetail.quickFacts}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block mb-1">🏛️ {dict.monumentDetail.builtYear}</span>
                <p className="font-bold text-gray-900 text-base">{anyMon.quickFacts?.builtYear || monument.era}</p>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">👑 {dict.monumentDetail.dynasty}</span>
                <p className="font-bold text-gray-900 text-base">{anyMon.quickFacts?.dynasty || 'Historical Imperial Era'}</p>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">📐 {dict.monumentDetail.architect}</span>
                <p className="font-bold text-gray-900 text-base">{anyMon.quickFacts?.architect || 'Master Royal Artisans'}</p>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">🕒 {dict.monumentDetail.openingHours}</span>
                <p className="font-bold text-gray-900 text-base">{anyMon.quickFacts?.openingHours || '6:00 AM – 6:00 PM'}</p>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">🎟️ {dict.monumentDetail.ticketPrice}</span>
                <p className="font-bold text-gray-900 text-base">{anyMon.quickFacts?.ticketPrice || '₹50 (Indian) / ₹600 (Foreigner)'}</p>
              </div>

              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">📜 {dict.monumentDetail.unescoStatus}</span>
                <p className="font-bold text-gray-900 text-base">
                  {anyMon.quickFacts?.unesco ? dict.monumentDetail.officialHeritage : dict.monumentDetail.protectedMonument}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-4 justify-between">
              <button
                onClick={handleAddToJourney}
                className={`flex-1 min-w-[200px] py-3.5 px-6 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSavedToJourney
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {isSavedToJourney ? <CheckCircle2 size={20} /> : <Heart size={20} />}
                <span>{isSavedToJourney ? dict.monumentDetail.addedToJourney : dict.monumentDetail.saveToJourney}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex-1 min-w-[200px] py-3.5 px-6 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 size={20} />
                <span>{dict.monumentDetail.shareViaWhatsApp}</span>
              </button>

              <Link
                href="/map"
                className="py-3.5 px-6 rounded-2xl font-bold bg-gray-900 hover:bg-black text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MapPin size={20} />
                <span>{dict.monumentDetail.viewOnMap}</span>
              </Link>
            </div>
          </div>

          {/* RELATED MONUMENTS */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-gray-900">{dict.monumentDetail.relatedMonuments}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedMonuments.map((item) => (
                <Link
                  key={item.slug}
                  href={`/monument/${item.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col transform hover:-translate-y-1"
                >
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 250px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-3 left-3 bg-orange-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      {item.state}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.era}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
