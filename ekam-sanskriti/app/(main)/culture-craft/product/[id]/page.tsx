'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, IndianRupee, Clock, Info, ShieldCheck, Share2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function ProductDetailsPage() {
  const params = useParams()
  const { id } = params as { id: string }
  const supabase = createClient()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return
      
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
        
      if (fetchError) {
        setError('Failed to load product details.')
        console.error(fetchError)
      } else if (data) {
        // Fetch artist profile manually since foreign key is missing
        if (data.artist_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', data.artist_id)
            .single()
            
          if (profile) {
            data.artist = profile
          }
        }
        setProduct(data)
      }
      setLoading(false)
    }
    
    fetchProduct()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product not found'}</h1>
          <Link href="/culture-craft" className="text-orange-600 hover:underline">
            Return to Culture & Craft
          </Link>
        </div>
      </div>
    )
  }

  const primaryImage = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : (product.image_url || 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800')

  const artistName = product.artist?.full_name || 'Verified Artisan'

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/culture-craft" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-8 font-medium">
          <ChevronLeft size={20} /> Back to Collection
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            {/* Image Gallery Section */}
            <div className="bg-gray-100 p-8 flex items-center justify-center min-h-[400px]">
              <img 
                src={primaryImage} 
                alt={product.name} 
                className="w-full h-auto max-h-[600px] object-contain rounded-xl shadow-lg"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800' }}
              />
            </div>

            {/* Details Section */}
            <div className="p-8 md:p-12 md:pl-4 flex flex-col justify-center">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                {product.craft_type || 'Handcrafted'}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              
              <p className="text-gray-600 text-lg mb-6 flex items-center gap-2">
                Crafted by <span className="font-semibold text-gray-900">{artistName}</span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs">✓</span>
              </p>
              
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center">
                <IndianRupee size={32} className="mr-1 text-gray-700" />
                {product.price?.toLocaleString('en-IN') || 'Price upon request'}
              </div>

              <div className="space-y-6 mb-10">
                {product.description && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">Description</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}
                
                {product.story && (
                  <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                    <h3 className="text-lg font-bold text-orange-900 mb-2 font-serif flex items-center gap-2">
                      <Info size={20} className="text-orange-600" /> The Story Behind the Craft
                    </h3>
                    <p className="text-orange-800 leading-relaxed italic">"{product.story}"</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {product.materials_used && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Materials</p>
                      <p className="text-gray-900 font-medium">{product.materials_used}</p>
                    </div>
                  )}
                  {product.time_to_make && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                      <Clock size={20} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Time to Make</p>
                        <p className="text-gray-900 font-medium">{product.time_to_make}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <a 
                  href={`https://wa.me/?text=Hi ${encodeURIComponent(artistName)}, I am interested in purchasing "${encodeURIComponent(product.name)}". Can you provide more details?`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-lg flex items-center justify-center gap-2"
                >
                  Contact Artisan via WhatsApp
                </a>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Check out ${product.name} crafted by ${artistName}`,
                        url: window.location.href,
                      })
                    }
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-4 rounded-xl font-bold transition-all flex items-center justify-center"
                  title="Share"
                >
                  <Share2 size={24} />
                </button>
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 justify-center sm:justify-start">
                <ShieldCheck size={16} className="text-green-600" />
                <span>Authentic Handcrafted Product</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
