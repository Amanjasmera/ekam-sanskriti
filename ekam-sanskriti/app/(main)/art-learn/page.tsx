'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Palette, ShoppingBag, Video, MessageCircle, Play, ExternalLink, Sparkles } from 'lucide-react'
import artistsData from '@/data/artists.json'
import lessonsData from '@/data/lessons.json'

interface Product {
  id: string
  name: string
  price: number
  description?: string
  image_url?: string
  artist_name?: string
}

interface Lesson {
  id: string
  title: string
  artist?: string
  duration?: string
  video_url?: string
  thumbnail_url?: string
  description?: string
}

export default function ArtLearnPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState<Lesson | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Fetch products from Supabase
      const { data: dbProducts } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch lessons from Supabase
      const { data: dbLessons } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false })

      // Process products (fallback to json if db empty)
      if (dbProducts && dbProducts.length > 0) {
        setProducts(
          dbProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            description: p.description,
            image_url: p.image_url,
            artist_name: p.artist_name || 'Master Artisan',
          }))
        )
      } else {
        // Fallback from artists.json
        const fallbackProducts: Product[] = []
        artistsData.forEach((a) => {
          a.products.forEach((p) => {
            fallbackProducts.push({
              id: p.id,
              name: p.name,
              price: p.price,
              description: p.description,
              image_url: p.image,
              artist_name: a.name,
            })
          })
        })
        setProducts(fallbackProducts)
      }

      // Process lessons (fallback to json if db empty)
      if (dbLessons && dbLessons.length > 0) {
        setLessons(
          dbLessons.map((l) => ({
            id: l.id,
            title: l.title,
            artist: l.artist_name || 'Craft Master',
            duration: l.duration || '12:00',
            video_url: l.video_url,
            thumbnail_url: l.thumbnail_url,
            description: l.description,
          }))
        )
      } else {
        setLessons(
          lessonsData.map((l) => ({
            id: l.id,
            title: l.title,
            artist: l.artist,
            duration: l.duration,
            video_url: l.video_url,
            thumbnail_url: l.thumbnail,
          }))
        )
      }

      setLoading(false)
    }

    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-amber-50/20 p-6 md:p-10">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-12 bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 rounded-3xl p-8 md:p-10 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={14} /> Traditional Indian Arts & Crafts
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-serif mb-2">Art & Learning Hub</h1>
        <p className="text-orange-100 max-w-2xl text-sm md:text-base">
          Support local master artisans by exploring authentic handcrafted products and learning ancient Indian art forms.
        </p>
      </div>

      {/* SECTION 1: ARTIST PRODUCTS (Marketplace) */}
      <section className="max-w-7xl mx-auto mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingBag className="text-orange-600" /> Artisan Products
            </h2>
            <p className="text-xs md:text-sm text-gray-700 mt-1">Directly crafted & uploaded by verified master artists</p>
          </div>
          <Link
            href="/marketplace"
            className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All Crafts →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 text-orange-700 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    ₹{product.price}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium mb-2">By {product.artist_name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <a
                      href={`https://wa.me/?text=Hi! I am interested in buying ${encodeURIComponent(product.name)} for ₹${product.price}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                      <MessageCircle size={15} /> Enquire on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: LEARNING MATERIALS */}
      <section className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Video className="text-orange-600" /> Masterclasses & Lessons
            </h2>
            <p className="text-xs md:text-sm text-gray-700 mt-1">Learn traditional painting, pottery, and textile arts</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-gray-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => setActiveVideo(lesson)}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
              >
                <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                  <img
                    src={lesson.thumbnail_url || 'https://images.unsplash.com/photo-1580136608260-4ebf15facce2'}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                      <Play size={20} className="ml-1" />
                    </div>
                  </div>
                  {lesson.duration && (
                    <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-md">
                      {lesson.duration}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-gray-700 font-medium mt-1">Instructor: {lesson.artist}</p>
                    {lesson.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-orange-600">
                    <span>Watch Tutorial</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg">{activeVideo.title}</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-gray-600 hover:text-white text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                controls
                autoPlay
                className="w-full h-full"
                src={activeVideo.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4'}
              ></video>
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-orange-600">Instructor: {activeVideo.artist}</p>
              <p className="text-xs text-gray-600 mt-2">{activeVideo.description || 'Interactive masterclass on traditional Indian art.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
