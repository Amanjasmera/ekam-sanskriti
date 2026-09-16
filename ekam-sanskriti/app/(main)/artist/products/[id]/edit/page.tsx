'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, CheckCircle, Edit3, Sparkles } from 'lucide-react'

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    craft_type: 'Madhubani',
    price: '',
    description: '',
    materials_used: '',
    time_to_make: '',
    story: '',
    status: 'active'
  })
  
  const craftTypes = [
    'Madhubani', 'Warli', 'Pattachitra', 'Bidriware', 
    'Channapatna', 'Kutch Embroidery', 'Terracotta',
    'Wood Carving', 'Handloom Weaving', 'Other'
  ]

  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .eq('artist_id', user.id)
        .maybeSingle()

      if (error || !data) {
        alert('Product not found or unauthorized')
        router.push('/artist/products')
        return
      }

      setFormData({
        name: data.name || '',
        craft_type: data.craft_type || 'Madhubani',
        price: data.price ? data.price.toString() : '',
        description: data.description || '',
        materials_used: data.materials_used || '',
        time_to_make: data.time_to_make || '',
        story: data.story || '',
        status: data.status || 'active'
      })
      setLoading(false)
    }
    
    fetchProduct()
  }, [params.id, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error: dbError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          craft_type: formData.craft_type,
          price: parseFloat(formData.price),
          description: formData.description,
          materials_used: formData.materials_used,
          time_to_make: formData.time_to_make,
          story: formData.story,
          status: formData.status
        })
        .eq('id', params.id)
        .eq('artist_id', user.id)

      if (dbError) throw dbError

      setToastMsg('Product updated successfully!')
      setTimeout(() => {
        router.push('/artist/products')
      }, 1500)
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error updating product.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-saffron" />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 font-bold border border-green-400/50"
          >
            <CheckCircle size={20} />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 mb-8">
        <Link href="/artist/products" className="p-3 text-gray-700 hover:text-gray-900 bg-white/50 hover:bg-white/80 rounded-2xl transition-all shadow-sm active:scale-95 border border-white/60">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-black font-heading text-gray-900 flex items-center gap-2 drop-shadow-sm mb-1">
            <Edit3 className="text-saffron" size={32} />
            Edit Product
          </h2>
          <p className="text-gray-600 font-medium">Update the details of your listing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card max-w-4xl border border-white/60 rounded-3xl p-6 md:p-10 space-y-10 shadow-xl bg-white/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-maroon/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        {/* Basic Details */}
        <div className="space-y-6 relative z-10">
          <h3 className="text-xl font-black text-gray-900 border-b border-gray-200/50 pb-3 flex items-center gap-2">
            <span className="bg-gradient-to-br from-saffron to-maroon text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Basic Details
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Product Name <span className="text-saffron">*</span></label>
            <input 
              type="text" name="name" required value={formData.name} onChange={handleChange}
              className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Craft Type <span className="text-saffron">*</span></label>
              <select 
                name="craft_type" value={formData.craft_type} onChange={handleChange}
                className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 cursor-pointer"
              >
                {craftTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹) <span className="text-saffron">*</span></label>
              <input 
                type="number" name="price" required min="1" step="0.01" value={formData.price} onChange={handleChange}
                className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-saffron">*</span></label>
            <textarea 
              name="description" required rows={4} value={formData.description} onChange={handleChange}
              className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 resize-none" 
            />
          </div>
        </div>

        {/* Craft DNA */}
        <div className="space-y-6 relative z-10">
          <h3 className="text-xl font-black text-gray-900 border-b border-gray-200/50 pb-3 flex items-center gap-2">
            <span className="bg-gradient-to-br from-saffron to-maroon text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Craft DNA (Story)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Materials Used</label>
              <input 
                type="text" name="materials_used" value={formData.materials_used} onChange={handleChange}
                className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Time to Make</label>
              <input 
                type="text" name="time_to_make" value={formData.time_to_make} onChange={handleChange}
                className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Story Behind the Craft</label>
            <textarea 
              name="story" rows={4} value={formData.story} onChange={handleChange}
              className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 resize-none" 
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-6 relative z-10">
          <h3 className="text-xl font-black text-gray-900 border-b border-gray-200/50 pb-3 flex items-center gap-2">
            <span className="bg-gradient-to-br from-saffron to-maroon text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            Visibility
          </h3>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
            <select 
              name="status" value={formData.status} onChange={handleChange}
              className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 cursor-pointer"
            >
              <option value="active">Active (Visible)</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200/50 flex justify-end relative z-10">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full md:w-auto bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {saving ? <><Loader2 className="animate-spin" size={24} /> Saving...</> : <><Sparkles size={24} /> Save Changes</>}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
