'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Image as ImageIcon, Video, Upload, X, Loader2, CheckCircle, Sparkles, PackagePlus } from 'lucide-react'

export default function AddNewProduct() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    craft_type: 'Madhubani',
    price: '',
    description: '',
    materials_used: '',
    time_to_make: '',
    story: ''
  })
  
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)

  const craftTypes = [
    'Madhubani', 'Warli', 'Pattachitra', 'Bidriware', 
    'Channapatna', 'Kutch Embroidery', 'Terracotta',
    'Wood Carving', 'Handloom Weaving', 'Other'
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      if (images.length + filesArray.length > 5) {
        alert('You can only upload up to 5 images max.')
        return
      }
      setImages(prev => [...prev, ...filesArray])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 50 * 1024 * 1024) {
        alert('Video size must be less than 50MB')
        return
      }
      setVideo(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (images.length === 0) {
      alert('Please upload at least 1 image for the product.')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const artistId = user.id
      
      // Upload Images
      const imageUrls = []
      for (const file of images) {
        const fileName = `${artistId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { error: uploadError } = await supabase.storage
          .from('artist-uploads')
          .upload(fileName, file)
          
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('artist-uploads')
          .getPublicUrl(fileName)
          
        imageUrls.push(publicUrl)
      }

      // Upload Video if exists
      let videoUrl = null
      if (video) {
        const fileName = `${artistId}/${Date.now()}-${video.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { error: uploadError } = await supabase.storage
          .from('artist-uploads')
          .upload(fileName, video)
          
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('artist-uploads')
          .getPublicUrl(fileName)
          
        videoUrl = publicUrl
      }

      // Insert to Database
      const { error: dbError } = await supabase
        .from('products')
        .insert({
          artist_id: artistId,
          name: formData.name,
          craft_type: formData.craft_type,
          price: parseFloat(formData.price),
          description: formData.description,
          materials_used: formData.materials_used,
          time_to_make: formData.time_to_make,
          story: formData.story,
          images: imageUrls,
          image_url: imageUrls[0], // fallback for old queries
          video_url: videoUrl,
          status: 'active'
        })

      if (dbError) throw dbError

      setToastMsg('Product published successfully!')
      setTimeout(() => {
        router.push('/artist/products')
      }, 2000)
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error uploading product. Make sure you have created the storage buckets.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
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
            <PackagePlus className="text-saffron" size={32} />
            Add New Product
          </h2>
          <p className="text-gray-600 font-medium">Fill in the details to list your craft on the marketplace.</p>
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
              className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-600" 
              placeholder="e.g., Handpainted Warli Canvas" 
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
                className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-600" 
                placeholder="e.g., 1500" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-saffron">*</span></label>
            <textarea 
              name="description" required rows={4} value={formData.description} onChange={handleChange}
              className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-600 resize-none" 
              placeholder="Describe the product..." 
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
                className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-600" 
                placeholder="e.g., Natural dyes, canvas" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Time to Make</label>
              <input 
                type="text" name="time_to_make" value={formData.time_to_make} onChange={handleChange}
                className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-600" 
                placeholder="e.g., 3 days" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Story Behind the Craft</label>
            <textarea 
              name="story" rows={4} value={formData.story} onChange={handleChange}
              className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-600 resize-none" 
              placeholder="Tell buyers the cultural significance or story behind this specific piece..." 
            />
          </div>
        </div>

        {/* Media Uploads */}
        <div className="space-y-6 relative z-10">
          <h3 className="text-xl font-black text-gray-900 border-b border-gray-200/50 pb-3 flex items-center gap-2">
            <span className="bg-gradient-to-br from-saffron to-maroon text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            Media Uploads
          </h3>
          
          {/* Images */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Product Images (1-5) <span className="text-saffron">*</span></label>
            <div className="flex flex-wrap gap-4">
              {images.map((img, idx) => (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={idx} 
                  className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-white shadow-md group"
                >
                  <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeImage(idx)} className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors transform hover:scale-110">
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {images.length < 5 && (
                <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 hover:border-saffron hover:bg-saffron/5 flex flex-col items-center justify-center cursor-pointer transition-all text-gray-600 hover:text-saffron bg-white/40 backdrop-blur-sm group">
                  <div className="bg-gray-100 group-hover:bg-saffron/10 p-3 rounded-full mb-2 transition-colors">
                    <ImageIcon size={24} className="text-gray-600 group-hover:text-saffron" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="pt-2">
            <label className="block text-sm font-bold text-gray-700 mb-3">Product Video <span className="text-xs text-gray-600 font-medium uppercase tracking-wider ml-2 bg-gray-100 px-2 py-1 rounded-md">Optional</span></label>
            {video ? (
              <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl shrink-0">
                  <Video size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{video.name}</p>
                  <p className="text-xs text-gray-700 font-medium mt-0.5">{(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={() => setVideo(null)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 hover:border-saffron hover:bg-saffron/5 rounded-2xl cursor-pointer transition-all bg-white/40 backdrop-blur-sm group">
                <div className="flex flex-col items-center text-gray-600 group-hover:text-saffron transition-colors">
                  <div className="bg-gray-100 group-hover:bg-saffron/10 p-4 rounded-full mb-4 transition-colors">
                    <Upload size={32} />
                  </div>
                  <span className="font-bold text-lg mb-1">Click to upload a video</span>
                  <span className="text-sm font-medium">MP4, WebM (Max 50MB)</span>
                </div>
                <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoUpload} />
              </label>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200/50 flex justify-end relative z-10">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="animate-spin" size={24} /> Publishing...</> : <><Sparkles size={24} /> Publish Product</>}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
