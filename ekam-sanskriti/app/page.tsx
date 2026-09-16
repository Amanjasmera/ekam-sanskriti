/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { getDictionary } from '@/lib/i18n'
import { createClient } from '@/utils/supabase/client'
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowRight, Play, Globe, MapPin, Coffee, PartyPopper, BookOpen, Compass, Quote } from 'lucide-react'
import PageTransition from '@/components/PageTransition';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1564507592208-028f870fe6f5?auto=format&fit=crop&q=80", // Taj Mahal
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80", // Kerala
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80", // Rajasthan
  "https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?auto=format&fit=crop&q=80", // Tamil Nadu
  "https://images.unsplash.com/photo-1514222288957-492e7284f67c?auto=format&fit=crop&q=80", // Punjab
  "https://images.unsplash.com/photo-1543888351-419b6715f2ed?auto=format&fit=crop&q=80"  // Diwali
];

const TESTIMONIALS = [
  { text: "India is not a country, but a continent of cultures.", author: "Cultural Explorer" },
  { text: "In India, every state is a new world, every dialect a new perspective.", author: "Heritage Scholar" },
  { text: "The soul of India lives in its rich diversity and ancient traditions.", author: "History Enthusiast" }
];

export default function Home() {
  const [langCode, setLangCode] = useState<string>('en')
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  
  // Hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Testimonial slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // Original language logic
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

      const supabase = createClient()
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

  const dict = getDictionary(langCode)

  const featureCards = [
    { icon: <MapPin className="w-8 h-8" />, title: dict.landingPage?.exploreTitle || 'Explore Monuments', desc: dict.landingPage?.exploreDesc || 'Discover architectural marvels spanning history.', href: '/explore', color: 'bg-blue-50 text-blue-600' },
    { icon: <Coffee className="w-8 h-8" />, title: dict.landingPage?.foodTitle || 'Authentic Food', desc: dict.landingPage?.foodDesc || 'Taste rich culinary diversity from every state.', href: '/food', color: 'bg-orange-50 text-orange-600' },
    { icon: <PartyPopper className="w-8 h-8" />, title: dict.landingPage?.festivalsTitle || 'Festivals', desc: dict.landingPage?.festivalsDesc || 'Experience the vibrant celebrations.', href: '/festivals', color: 'bg-pink-50 text-pink-600' },
    { icon: <Globe className="w-8 h-8" />, title: 'Interactive Map', desc: 'Navigate India visually with our custom map.', href: '/map', color: 'bg-green-50 text-green-600' },
    { icon: <BookOpen className="w-8 h-8" />, title: 'Sacred Scriptures', desc: 'Read ancient wisdom and philosophy.', href: '/scriptures', color: 'bg-purple-50 text-purple-600' },
    { icon: <Compass className="w-8 h-8" />, title: 'Culture & Craft', desc: 'Master traditional arts from the artisans.', href: '/unified-india', color: 'bg-amber-50 text-amber-600' }
  ];

  return (
    <PageTransition className="min-h-screen flex flex-col bg-cream font-sans">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-0 left-0 w-full z-50 px-6 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white font-serif text-2xl border border-white/20 shadow-lg">ए</div>
          <span className="text-2xl font-heading font-bold text-white drop-shadow-md tracking-tight">Ekam Sanskriti</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-semibold rounded-full transition-all hover:scale-105 shadow-lg">
            {dict.landingPage?.loginSignUp || 'Login / Sign Up'}
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Image 
              src={HERO_IMAGES[currentHeroIndex]} 
              alt="India Heritage" 
              fill
              priority
              className="object-cover object-center"
              quality={90}
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-4xl md:text-6xl font-serif text-saffron-300 drop-shadow-[0_0_15px_rgba(255,153,51,0.5)] mb-4">
              वसुधैव कुटुम्बकम्
            </h2>
            <h1 className="text-6xl md:text-8xl font-heading font-bold text-white tracking-tight drop-shadow-xl">
              Ekam <span className="text-saffron-400">Sanskriti</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-3xl text-gray-200 font-light mb-12 drop-shadow-md tracking-wide"
          >
            One Platform · 22 Languages · Infinite Heritage
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link 
              href="/explore" 
              className="px-8 py-4 bg-saffron text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(255,153,51,0.4)] hover:bg-saffron-500 hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 group"
            >
              Explore Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Demo
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/70 flex flex-col items-center"
        >
          <span className="text-sm font-medium mb-2 uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Feature Cards Section */}
      <section className="py-24 px-6 relative z-30 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">Discover India</h2>
            <div className="w-24 h-1 bg-saffron mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link href={card.href} className="block h-full">
                  <div className="bg-white p-8 rounded-[16px] shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full group flex flex-col">
                    <div className={`w-16 h-16 rounded-2xl ${card.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                      {card.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 font-heading">{card.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed flex-grow">{card.desc}</p>
                    <div className="mt-6 flex items-center text-saffron font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-20 bg-maroon text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-bold font-heading text-gold mb-2">22</div>
              <div className="text-lg font-medium text-white/80">Languages</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-bold font-heading text-gold mb-2">25+</div>
              <div className="text-lg font-medium text-white/80">Monuments</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-bold font-heading text-gold mb-2">50+</div>
              <div className="text-lg font-medium text-white/80">Traditional Foods</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-bold font-heading text-gold mb-2">20+</div>
              <div className="text-lg font-medium text-white/80">Festivals</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-16 h-16 mx-auto text-saffron/30 mb-8" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="min-h-[160px]"
            >
              <p className="text-2xl md:text-4xl font-serif text-gray-800 leading-relaxed mb-6">
                "{TESTIMONIALS[currentTestimonial].text}"
              </p>
              <p className="text-lg font-semibold text-saffron uppercase tracking-widest">
                — {TESTIMONIALS[currentTestimonial].author}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-3 h-3 rounded-full transition-all ${idx === currentTestimonial ? 'bg-saffron w-8' : 'bg-gray-300'}`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tricolor Footer */}
      <footer className="mt-auto">
        <div className="h-4 flex">
          <div className="flex-1 bg-saffron"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-indiaGreen"></div>
        </div>
        <div className="bg-gray-900 py-12 px-6 text-center text-gray-600">
          <p className="text-lg flex items-center justify-center gap-2">
            Made with <span className="text-red-500 text-xl animate-pulse">❤️</span> for India
          </p>
          <p className="mt-4 text-sm text-gray-700">© {new Date().getFullYear()} Ekam Sanskriti. All rights reserved.</p>
        </div>
      </footer>
    </PageTransition>
  );
}
