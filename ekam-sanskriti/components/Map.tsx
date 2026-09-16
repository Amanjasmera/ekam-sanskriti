/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
   Volume2, 
  VolumeX, ChevronLeft, ChevronRight, X, Sparkles, 
  MapPin, Box, ExternalLink, Info, ArrowRight
} from 'lucide-react'

import monumentsData from '@/data/monuments.json'
import foodsData from '@/data/foods.json'
import festivalsData from '@/data/festivals.json'
import artsData from '@/data/arts.json'
import districtsData from '@/data/districts.json'
import fallbackMapData from '@/data/map-fallback.json'
import { 
  getWikiSummaryWithCache, 
  getLanguageSpeechTag, 
  getHighResImageUrl,
  WikiSummary, 
  SUPPORTED_LANGUAGES 
} from '@/lib/wikipedia'
import { createClient } from '@/utils/supabase/client'
import ModelViewerModal from '@/components/ModelViewerModal'

// Fix Leaflet Default Marker Icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom Marker Icons for each layer
function createCustomIcon(bgColor: string, emoji: string) {
  return L.divIcon({
    html: `
      <div style="
        background: ${bgColor};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border: 3px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        font-size: 18px;
        transition: transform 0.2s ease-in-out;
      " class="hover:scale-110">
        ${emoji}
      </div>
    `,
    className: 'custom-leaflet-pin-wrapper',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  })
}

// Icon Definitions
const monumentIcon = createCustomIcon('linear-gradient(135deg, #f97316, #ea580c)', '🏛️')
const foodIcon = createCustomIcon('linear-gradient(135deg, #f59e0b, #d97706)', '🍛')
const festivalIcon = createCustomIcon('linear-gradient(135deg, #ef4444, #dc2626)', '🎉')
const artIcon = createCustomIcon('linear-gradient(135deg, #a855f7, #9333ea)', '🎨')
const districtIcon = createCustomIcon('linear-gradient(135deg, #3b82f6, #2563eb)', '📍')

// Map FlyTo Helper Component
function MapFlyToHandler({ flyTarget }: { flyTarget: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], flyTarget.zoom, {
        animate: true,
        duration: 1.5,
      })
    }
  }, [flyTarget, map])
  return null
}

export default function InteractiveMap() {
  const supabase = createClient()
  
  // Layer State: monuments | food | festivals | arts
  const [activeLayer, setActiveLayer] = useState<'monuments' | 'food' | 'festivals' | 'arts'>('monuments')
  
  // Map FlyTo Target State
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>({
    lat: 20.5937,
    lng: 78.9629,
    zoom: 5,
  })

  // Selected Item for Details / Bottom Sheet
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  
  // Bottom Sheet State & Tabs
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const [activeDistrictTab, setActiveDistrictTab] = useState<'monuments' | 'food' | 'festivals' | 'arts'>('monuments')
  
  // AR/VR Modal State
  const [is3DModalOpen, setIs3DModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')

  const [langCode, setLangCode] = useState<string>('en')
  const [wikiSummary, setWikiSummary] = useState<WikiSummary | null>(null)
  const [globalWikiCache, setGlobalWikiCache] = useState<Record<string, WikiSummary>>({})
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  const sliderRef = useRef<HTMLDivElement>(null)

  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      setProducts(data || [])
    }
    loadProducts()
  }, [])

  const stateCoordinates: Record<string, { lat: number; lng: number }> = {
    'Maharashtra': { lat: 19.7515, lng: 75.7139 },
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
    'Punjab': { lat: 31.1471, lng: 75.3412 },
    'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
    'West Bengal': { lat: 22.9868, lng: 87.8550 },
    'Gujarat': { lat: 22.2587, lng: 71.1924 },
    'Bihar': { lat: 25.0961, lng: 85.3131 },
    'Rajasthan': { lat: 27.0238, lng: 74.2179 },
    'Karnataka': { lat: 15.3173, lng: 75.7139 },
    'Kerala': { lat: 10.8505, lng: 76.2711 },
  }

  const layerData: Record<string, any[]> = {
    monuments: monumentsData,
    food: foodsData,
    festivals: festivalsData,
    arts: products,
  }

  const sliderItems = layerData[activeLayer] || []

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
            if (typeof window !== 'undefined') {
              localStorage.setItem('chosen_language', matched.code)
            }
          }
        }
      }
    }
    loadUserLang()
  }, [])

  // Preload wiki data for active layer
  useEffect(() => {
    if (activeLayer === 'food' || activeLayer === 'festivals') {
      const items = activeLayer === 'food' ? foodsData : festivalsData
      items.forEach(async (item) => {
        if (!globalWikiCache[item.slug]) {
          const summary = await getWikiSummaryWithCache(item.wikipedia_titles as any, langCode)
          if (summary) {
            setGlobalWikiCache(prev => ({ ...prev, [item.slug]: summary }))
          }
        }
      })
    }
  }, [activeLayer, langCode])

  // Flatten all districts from districts.json
  const allDistricts = Object.values(districtsData).flat()

  // Generate Items for Active Layer (Merging Primary Datasets & Fallback)
  const currentLayerItems = (() => {
    // Fallback items for active layer
    const fallbacks = fallbackMapData.filter(item => item.category === activeLayer)

    if (activeLayer === 'monuments') {
      const mainMonuments = monumentsData.map(m => ({
        id: m.slug,
        title: m.name,
        district: m.state,
        subtitle: `${m.state} • ${m.era}`,
        image: (m as any).imageUrl || m.image,
        imageUrl: (m as any).imageUrl || m.image,
        lat: m.lat || 20.5937,
        lng: m.lng || 78.9629,
        wikipedia_titles: m.wikipedia_titles,
        category: 'monuments',
        raw: m,
      }))
      const ids = new Set(mainMonuments.map(m => m.id))
      const combined = [...mainMonuments]
      fallbacks.forEach(f => {
        if (!ids.has(f.id)) {
          combined.push({
            ...f,
            title: f.title || (f as any).name,
            district: f.district || f.state,
            image: (f as any).imageUrl || f.image
          } as any)
        }
      })
      return combined
    }

    if (activeLayer === 'food') {
      const mainFoods = foodsData.map(f => ({
        id: f.slug,
        title: (f as any).name || f.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        district: f.state,
        subtitle: `${f.state} • ${f.type || 'Cuisine'}`,
        image: (f as any).imageUrl || f.image,
        imageUrl: (f as any).imageUrl || f.image,
        lat: f.lat || 20.5937,
        lng: f.lng || 78.9629,
        wikipedia_titles: f.wikipedia_titles,
        category: 'food',
        raw: f,
      }))
      const ids = new Set(mainFoods.map(f => f.id))
      const combined = [...mainFoods]
      fallbacks.forEach(f => {
        if (!ids.has(f.id)) {
          combined.push({
            ...f,
            title: f.title || (f as any).name,
            district: f.district || f.state,
            image: (f as any).imageUrl || f.image
          } as any)
        }
      })
      return combined
    }

    if (activeLayer === 'festivals') {
      const mainFestivals = festivalsData.map(fest => ({
        id: fest.slug,
        title: (fest as any).name || fest.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        district: fest.region || (fest as any).state,
        subtitle: `${fest.region || (fest as any).state} • ${fest.month || 'Festival'}`,
        image: (fest as any).imageUrl || fest.image,
        imageUrl: (fest as any).imageUrl || fest.image,
        lat: fest.lat || 20.5937,
        lng: fest.lng || 78.9629,
        wikipedia_titles: fest.wikipedia_titles,
        category: 'festivals',
        raw: fest,
      }))
      const ids = new Set(mainFestivals.map(f => f.id))
      const combined = [...mainFestivals]
      fallbacks.forEach(f => {
        if (!ids.has(f.id)) {
          combined.push({
            ...f,
            title: f.title || (f as any).name,
            district: f.district || f.state || (f as any).region,
            image: (f as any).imageUrl || f.image
          } as any)
        }
      })
      return combined
    }

    // Arts Layer
    const mainArts = artsData.map(a => ({
      id: a.slug,
      title: a.name,
      district: a.state,
      subtitle: `${a.state} • ${a.era || 'Art'}`,
      image: (a as any).imageUrl || a.image,
      imageUrl: (a as any).imageUrl || a.image,
      lat: a.lat || 20.5937,
      lng: a.lng || 78.9629,
      wikipedia_titles: a.wikipedia_titles,
      category: 'arts',
      raw: a,
    }))
    const ids = new Set(mainArts.map(a => a.id))
    const combined = [...mainArts]
    fallbacks.forEach(f => {
      if (!ids.has(f.id)) {
        combined.push({
          ...f,
          title: f.title || (f as any).name,
          district: f.district || f.state,
          image: (f as any).imageUrl || f.image
        } as any)
      }
    })
    return combined
  })()

  // Card Click Handler: Zoom + FlyTo + Open Details
  const handleSelectItem = async (item: any) => {
    setSelectedItem(item)
    // Fly to map coordinates (Zoom: 12)
    setFlyTarget({ lat: item.lat, lng: item.lng, zoom: 12 })
    setBottomSheetOpen(true)
    setWikiSummary(null)

    if (item.wikipedia_titles) {
      const summary = await getWikiSummaryWithCache(item.wikipedia_titles, langCode)
      setWikiSummary(summary)
    }
  }

  const handleCardClick = async (item: any) => {
    const lat = item.lat || stateCoordinates[item.state]?.lat
    const lng = item.lng || stateCoordinates[item.state]?.lng
    
    if (lat && lng) {
      setFlyTarget({ lat, lng, zoom: 12 })
      
      const mappedItem = {
        ...item,
        id: item.slug || item.id,
        title: item.name,
        district: item.state,
        subtitle: `${item.state} • ${item.type || item.era || item.month || 'Culture'}`,
        lat,
        lng,
        category: activeLayer
      }
      setSelectedItem(mappedItem)
      setBottomSheetOpen(true)
      setWikiSummary(null)
      
      if (item.wikipedia_titles) {
        const summary = await getWikiSummaryWithCache(item.wikipedia_titles, langCode)
        setWikiSummary(summary)
      }
    }
  }

  // District Pin Click Handler
  const handleSelectDistrict = (district: any) => {
    const districtObj = {
      id: district.id,
      title: `${district.name} District`,
      district: district.state,
      subtitle: `${district.state} Region`,
      lat: district.lat,
      lng: district.lng,
      districtRaw: district,
    }
    setSelectedItem(districtObj)
    setFlyTarget({ lat: district.lat, lng: district.lng, zoom: 11 })
    setBottomSheetOpen(true)
  }

  // Text-To-Speech Audio Narration
  const handleSpeakText = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
      return
    }

    const text = wikiSummary?.extract || selectedItem?.title || ''
    if (!text) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = getLanguageSpeechTag(langCode)
    utterance.rate = 0.95

    utterance.onend = () => setIsPlayingAudio(false)
    utterance.onerror = () => setIsPlayingAudio(false)

    setIsPlayingAudio(true)
    window.speechSynthesis.speak(utterance)
  }

  // Slider Navigation Controls
  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col bg-gray-950 font-sans">
      
      {/* MAP CONTAINER */}
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic FlyTo Handler */}
        <MapFlyToHandler flyTarget={flyTarget} />

        {/* ACTIVE LAYER MARKERS */}
        {currentLayerItems.map((item) => {
          const defaultFallback = activeLayer === 'food' 
            ? '/images/fallback-food.jpg' 
            : activeLayer === 'festivals' 
            ? '/images/fallback-festival.jpg' 
            : '/images/fallback-monument.jpg'
          
          const wiki = globalWikiCache[item.id]
          const rawImage = wiki?.originalimage?.source || wiki?.thumbnail?.source || item.image
          const popupImgSrc = failedImages[item.id] ? defaultFallback : getHighResImageUrl(rawImage, activeLayer)

          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={
                activeLayer === 'monuments'
                  ? monumentIcon
                  : activeLayer === 'food'
                  ? foodIcon
                  : activeLayer === 'festivals'
                  ? festivalIcon
                  : artIcon
              }
              eventHandlers={{
                click: () => handleSelectItem(item),
              }}
            >
              <Popup>
                <div className="p-1.5 text-center max-w-[220px]">
                  <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2 bg-gray-100 shadow-inner">
                    <img
                      src={popupImgSrc}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={() => setFailedImages(prev => ({ ...prev, [item.id]: true }))}
                    />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight">{item.title}</h4>
                  <p className="text-xs text-gray-500 my-1">{item.subtitle || item.district}</p>
                  <button
                    onClick={() => handleSelectItem(item)}
                    className="w-full mt-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Explore Details
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* DISTRICT MARKERS */}
        {allDistricts.map((district) => (
          <Marker
            key={`dist-${district.id}`}
            position={[district.lat, district.lng]}
            icon={districtIcon}
            eventHandlers={{
              click: () => handleSelectDistrict(district),
            }}
          >
            <Popup>
              <div className="p-2 text-center max-w-[200px]">
                <h4 className="font-bold text-sm text-gray-900">📍 {district.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{district.state}</p>
                <button
                  onClick={() => handleSelectDistrict(district)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  View District Culture
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* FLOATING LAYER SWITCHER (Top-Left) */}
      <div className="absolute top-5 left-5 z-[1000] flex flex-wrap items-center gap-2 bg-white/85 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/60">
        {[
          { key: 'monuments', label: 'Monuments', emoji: '🏛️', activeBg: 'bg-orange-600 text-white' },
          { key: 'food', label: 'Food', emoji: '🍛', activeBg: 'bg-amber-600 text-white' },
          { key: 'festivals', label: 'Festivals', emoji: '🎉', activeBg: 'bg-red-600 text-white' },
          { key: 'arts', label: 'Arts & Crafts', emoji: '🎨', activeBg: 'bg-purple-600 text-white' },
        ].map((layer) => {
          const isActive = activeLayer === layer.key
          return (
            <button
              key={layer.key}
              onClick={() => setActiveLayer(layer.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                isActive
                  ? `${layer.activeBg} shadow-lg scale-105`
                  : 'bg-white/70 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-base">{layer.emoji}</span>
              <span>{layer.label}</span>
            </button>
          )
        })}
      </div>

      {/* MAP LEGEND (Top-Right) */}
      <div className="absolute top-5 right-5 z-[1000] hidden sm:flex flex-col gap-1.5 bg-white/85 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/60 text-xs">
        <div className="font-bold text-gray-800 border-b border-gray-200/80 pb-1 mb-0.5 flex items-center gap-1">
          <Info size={13} className="text-orange-600" />
          <span>Map Legend</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <span>🏛️</span>
          <span>Monuments & Forts</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <span>🍛</span>
          <span>District Special Food</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <span>🎉</span>
          <span>Festivals & Fairs</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <span>🎨</span>
          <span>Traditional Arts</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <span>📍</span>
          <span>District Centers</span>
        </div>
      </div>

      {/* HIGH-RES EXPANDED CAROUSEL SLIDER (Floating at bottom-4, z-[1000]) */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="max-w-7xl mx-auto relative pointer-events-auto">
          
          {/* Scroll Left Desktop Arrow */}
          <button
            onClick={() => scrollSlider('left')}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-[1010] w-11 h-11 rounded-full bg-white/95 text-gray-900 shadow-2xl items-center justify-center border border-gray-200 hover:bg-orange-600 hover:text-white transition-all cursor-pointer hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Cards Carousel Container */}
          <div
            ref={sliderRef}
            className="flex items-center gap-4 overflow-x-auto scrollbar-none py-2 px-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeLayer === 'arts' && sliderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full min-h-[12rem] bg-purple-50 rounded-2xl border border-purple-200 p-6 text-center">
                <span className="text-3xl mb-3">🛍️</span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No crafts uploaded yet</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-sm">Artists, upload your first creation to appear here!</p>
                <a href="/signup" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition-colors inline-flex items-center gap-2">
                  Become an Artist <ArrowRight size={16} />
                </a>
              </div>
            ) : (
              sliderItems.map((item: any, idx: number) => {
                const isSelected = selectedItem?.id === (item.slug || item.id)
                
                const wiki = globalWikiCache[item.slug || item.id]
                const rawImage = wiki?.originalimage?.source || wiki?.thumbnail?.source || item.imageUrl || item.image_url || item.image

                const defaultFallback = activeLayer === 'food' 
                  ? '/images/fallback-food.jpg' 
                  : activeLayer === 'festivals' 
                  ? '/images/fallback-festival.jpg' 
                  : activeLayer === 'arts'
                  ? 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop'
                  : '/images/fallback-monument.jpg'
                
                const isFailed = failedImages[item.slug || item.id || idx]
                const imgSrc = isFailed ? defaultFallback : getHighResImageUrl(rawImage, activeLayer)

                return (
                  <div
                    key={item.slug || item.id || idx}
                    onClick={() => handleCardClick(item)}
                    className={`relative min-w-[16rem] w-64 h-48 rounded-xl overflow-hidden shadow-lg group cursor-pointer flex-shrink-0 flex flex-col justify-end border border-white/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 snap-start ${
                      isSelected
                        ? 'ring-4 ring-orange-500 border-2 border-orange-400 scale-[1.02] shadow-orange-500/20'
                        : 'hover:border-orange-300'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gray-800 animate-pulse z-0" />

                    <Image
                      src={imgSrc}
                      alt={item.name || 'Cultural Heritage'}
                      fill
                      sizes="(max-width: 768px) 100vw, 256px"
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 z-0"
                      priority={idx < 3}
                      unoptimized={true}
                      onError={() => setFailedImages(prev => ({ ...prev, [item.slug || item.id || idx]: true }))}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3.5 flex flex-col justify-end text-white z-10 font-sans">
                      <span className="inline-block bg-orange-600/90 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold w-fit mb-1 text-white shadow-sm">
                        📍 {item.state}
                      </span>
                      <h3 className="font-bold text-sm md:text-base text-white truncate drop-shadow-md">
                        {item.name}
                      </h3>
                      
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-orange-200 group-hover:text-white flex items-center gap-1 transition-colors">
                          <MapPin size={12} /> View on Map
                        </span>
                        {isSelected && (
                          <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Scroll Right Desktop Arrow */}
          <button
            onClick={() => scrollSlider('right')}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-[1010] w-11 h-11 rounded-full bg-white/95 text-gray-900 shadow-2xl items-center justify-center border border-gray-200 hover:bg-orange-600 hover:text-white transition-all cursor-pointer hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* BOTTOM SHEET DETAILS PANEL */}
      <AnimatePresence>
        {bottomSheetOpen && selectedItem && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute inset-x-0 bottom-0 z-[1100] bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 max-h-[75vh] flex flex-col font-sans"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center py-2.5 border-b border-gray-100">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="p-5 pb-3 flex items-start justify-between border-b border-gray-100">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1.5">
                  <Sparkles size={13} /> {selectedItem.subtitle || selectedItem.district || 'Cultural Heritage'}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">{selectedItem.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpeakText}
                  className={`p-2.5 rounded-full font-bold shadow-md transition-all cursor-pointer ${
                    isPlayingAudio ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                  title="Listen Narration"
                >
                  {isPlayingAudio ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {(selectedItem.category === 'monuments' || selectedItem.raw?.era) && (
                  <button
                    onClick={() => {
                      setModalTitle(selectedItem.title)
                      setIs3DModalOpen(true)
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Box size={16} /> 3D / AR View
                  </button>
                )}

                <button
                  onClick={() => setBottomSheetOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* District 4 Tabs (If district pin clicked) */}
            {selectedItem.districtRaw && (
              <div className="flex border-b border-gray-100 bg-gray-50/60 px-6 gap-2 pt-2">
                {[
                  { key: 'monuments', label: 'Monuments', emoji: '🏛️' },
                  { key: 'food', label: 'Famous Food', emoji: '🍛' },
                  { key: 'festivals', label: 'Festivals', emoji: '🎉' },
                  { key: 'arts', label: 'Famous Arts', emoji: '🎨' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveDistrictTab(tab.key as any)}
                    className={`px-4 py-2.5 text-xs md:text-sm font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                      activeDistrictTab === tab.key
                        ? 'border-orange-600 text-orange-600 bg-white shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.emoji} {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {selectedItem.districtRaw ? (
                <div>
                  {activeDistrictTab === 'monuments' && (
                    <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
                      <h4 className="font-bold text-gray-900 mb-1">🏛️ Monuments in {selectedItem.title}</h4>
                      <p className="text-xs text-gray-600">Explore historic forts, temples, and heritage landmarks located in this district.</p>
                    </div>
                  )}
                  {activeDistrictTab === 'food' && (
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                      <h4 className="font-bold text-gray-900 mb-1">🍛 Famous Culinary Cuisine</h4>
                      <p className="text-sm font-semibold text-amber-800">{selectedItem.districtRaw.famous_food}</p>
                    </div>
                  )}
                  {activeDistrictTab === 'festivals' && (
                    <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100">
                      <h4 className="font-bold text-gray-900 mb-1">🎉 Major Regional Festivals</h4>
                      <p className="text-sm font-semibold text-red-800">{selectedItem.districtRaw.famous_festival}</p>
                    </div>
                  )}
                  {activeDistrictTab === 'arts' && (
                    <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
                      <h4 className="font-bold text-gray-900 mb-1">🎨 Traditional Arts & Crafts</h4>
                      <p className="text-sm font-semibold text-purple-800">{selectedItem.districtRaw.famous_art}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {wikiSummary ? (
                    <div>
                      <p className="text-gray-700 text-sm md:text-base leading-relaxed font-sans">
                        {wikiSummary.extract}
                      </p>
                      {wikiSummary.content_urls?.desktop?.page && (
                        <a
                          href={wikiSummary.content_urls.desktop.page}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
                        >
                          <span>Read full article on Wikipedia</span>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D / AR MODAL */}
      <ModelViewerModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        title={modalTitle || selectedItem?.title || 'Monument'}
      />
    </div>
  )
}
