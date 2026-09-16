'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from 'framer-motion'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ShoppingBag, BookOpen, PlayCircle, MapPin, ChevronRight, Palette, Clock, IndianRupee, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { getDictionary } from '@/lib/i18n'
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia'

export default function CultureCraftPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [langCode, setLangCode] = useState<string>('en')
  const supabase = createClient()

  // Embla setup
  const [emblaRefLessons] = useEmblaCarousel({ align: 'start', skipSnaps: false, dragFree: true })
  const [emblaRefProducts] = useEmblaCarousel({ align: 'start', skipSnaps: false, dragFree: true })

  useEffect(() => {
    async function fetchData() {
      if (typeof window !== 'undefined') {
        const localLang = localStorage.getItem('chosen_language');
        if (localLang) {
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === localLang.toLowerCase().trim()
          );
          if (matched) setLangCode(matched.code);
        }
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('chosen_language').eq('id', user.id).maybeSingle();
        if (data?.chosen_language) {
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === data.chosen_language.toLowerCase().trim()
          );
          if (matched) setLangCode(matched.code);
        }
      }

      // Fetch Products (real data only)
      const { data: pData, error: pErr } = await supabase
        .from('products')
        .select(`*, artist:profiles(full_name)`)
        .order('created_at', { ascending: false })
      
      if (!pErr && pData) {
        setProducts(pData)
      }

      // Fetch Lessons (real data, published, launch_date <= now for live, future for "upcoming")
      // Wait, we need to fetch all published lessons. If launch_date > now, it's "Upcoming"
      const { data: lData, error: lErr } = await supabase
        .from('lessons')
        .select(`*, artist:profiles(full_name)`)
        .eq('course_status', 'published')
        .order('launch_date', { ascending: false }) // or created_at

      if (!lErr && lData) {
        setLessons(lData)
      }

      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const isEmpty = products.length === 0 && lessons.length === 0
  const dict = getDictionary(langCode)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-maroon-900 to-red-900 text-white py-16 px-4" style={{ background: 'linear-gradient(to right, #7B1E1E, #A02B2B)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{dict.cultureCraftPage.title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            {dict.cultureCraftPage.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : isEmpty ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center max-w-2xl mx-auto mt-10">
            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Palette size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{dict.cultureCraftPage.noProducts}</h2>
            <p className="text-gray-700 mb-8">{dict.cultureCraftPage.noProductsSub}</p>
            <Link 
              href="/signup?role=artist" 
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#FF9933' }}
            >
              {dict.cultureCraftPage.becomeArtist} <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Section 1: Learning Slider */}
            {lessons.length > 0 && (
              <section>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif flex items-center gap-2">
                      <BookOpen className="text-orange-600" /> {dict.cultureCraftPage.learnArtisans}
                    </h2>
                  </div>
                  <Link href="/culture-craft/learning-all" className="text-orange-600 font-medium hover:underline flex items-center text-sm md:text-base">
                    {dict.cultureCraftPage.viewAll} <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="overflow-hidden" ref={emblaRefLessons}>
                  <div className="flex gap-6 -ml-4 pl-4 pr-4 py-4">
                    {lessons.map((lesson) => {
                      const isFuture = new Date(lesson.launch_date) > new Date();
                      
                      // Calculate days until launch for badge
                      const daysUntilLaunch = isFuture ? Math.ceil((new Date(lesson.launch_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
                      let launchText = isFuture ? `Launching in ${daysUntilLaunch} days` : '';
                      if (daysUntilLaunch === 1) launchText = 'Launching Tomorrow';
                      if (daysUntilLaunch > 7) {
                         const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
                         launchText = `Launching ${new Date(lesson.launch_date).toLocaleDateString('en-US', options)}`;
                      }

                      return (
                        <div key={lesson.id} className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col relative" style={{ transform: 'scale(1)', transition: 'transform 0.2s ease-in-out' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                          {isFuture && (
                            <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                              {launchText}
                            </div>
                          )}
                          
                          <div className="relative h-48 w-full bg-gray-900 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                            <PlayCircle size={48} className="text-white/90 relative z-10 group-hover:scale-110 transition-transform" />
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1.5">
                              <Clock size={12} /> {lesson.total_lessons || 1} {lesson.total_lessons > 1 ? dict.cultureCraftPage?.lessons || 'Lessons' : dict.cultureCraftPage?.lesson || 'Lesson'}
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-white uppercase">
                              {dict.cultureCraftPage?.beginner || 'Beginner'}
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">{lesson.title}</h3>
                            <p className="text-sm text-gray-700 mb-4 flex items-center gap-1.5">
                              {dict.cultureCraftPage?.by || 'By'} <span className="font-semibold text-gray-700">{lesson.artist?.full_name || dict.cultureCraftPage?.verifiedArtisan || 'Verified Artisan'}</span>
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                              <span className="text-lg font-bold text-gray-900 flex items-center">
                                {lesson.price > 0 ? <>₹{lesson.price}</> : <span className="text-green-600">{dict.cultureCraftPage?.free || 'Free'}</span>}
                              </span>
                              <Link 
                                href={`/culture-craft/learn/${lesson.id}`}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isFuture 
                                    ? 'bg-gray-100 text-gray-700 cursor-not-allowed pointer-events-none'
                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                }`}
                              >
                                {isFuture ? (dict.cultureCraftPage?.comingSoon || 'Coming Soon') : (dict.cultureCraftPage?.startLearning || 'Start Learning')}
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Section 2: Products Slider */}
            {products.length > 0 && (
              <section>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif flex items-center gap-2">
                      <ShoppingBag className="text-orange-600" /> {dict.cultureCraftPage?.handcraftedBy || 'Handcrafted by Artisans'}
                    </h2>
                  </div>
                  <Link href="/culture-craft/products-all" className="text-orange-600 font-medium hover:underline flex items-center text-sm md:text-base">
                    {dict.cultureCraftPage?.viewAll || 'View All'} <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="overflow-hidden" ref={emblaRefProducts}>
                  <div className="flex gap-6 -ml-4 pl-4 pr-4 py-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_25%] min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col" style={{ transform: 'scale(1)', transition: 'transform 0.2s ease-in-out' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                          <img 
                            src={product.image_url || 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800'} 
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800' }}
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                            <MapPin size={12} className="text-orange-600" />
                            {product.state || dict.cultureCraftPage?.india || 'India'}
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <p className="text-xs text-orange-600 font-bold mb-1 uppercase tracking-wide">{product.category}</p>
                          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight">{product.title}</h3>
                          <p className="text-sm text-gray-700 mb-4 flex items-center gap-1.5">
                            {dict.cultureCraftPage?.by || 'By'} <span className="font-semibold text-gray-700">{product.artist?.full_name || dict.cultureCraftPage?.verifiedArtisan || 'Verified Artisan'}</span>
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px]">✓</span>
                          </p>
                          
                          <div className="mt-auto space-y-3">
                            <span className="text-xl font-bold text-gray-900 flex items-center">
                              ₹{product.price?.toLocaleString('en-IN') || '0'}
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <Link 
                                href={`/culture-craft/product/${product.id}`}
                                className="bg-gray-900 hover:bg-gray-800 text-white text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                {dict.cultureCraftPage?.viewDetails || 'View Details'}
                              </Link>
                              <a 
                                href="https://wa.me/919999999999?text=Hi, I am interested in this craft." 
                                target="_blank"
                                rel="noreferrer"
                                className="bg-green-50 hover:bg-green-100 text-green-700 text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-green-200"
                              >
                                {dict.cultureCraftPage?.whatsapp || 'WhatsApp'}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
