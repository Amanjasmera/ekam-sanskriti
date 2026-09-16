'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, Save, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    bio: '',
    artist_status: ''
  })
  
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setEmail(user.email || '')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setFormData({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          bio: data.bio || '',
          artist_status: data.artist_status || 'pending'
        })
      }
      setLoading(false)
    }
    
    loadProfile()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          bio: formData.bio
        })
        .eq('id', user.id)

      if (error) throw error

      setToastMsg('Profile updated successfully!')
      setTimeout(() => setToastMsg(''), 3000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

      <div className="mb-8">
        <h2 className="text-3xl font-black font-heading text-gray-900 flex items-center gap-2 drop-shadow-sm mb-2">
          <Sparkles className="text-saffron" size={28} />
          Profile Settings
        </h2>
        <p className="text-gray-600 font-medium text-sm">Manage your public artist profile and contact details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card border border-white/60 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl bg-white/40 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-saffron/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-saffron">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                    className="w-full pl-11 p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number (WhatsApp)</label>
                <input 
                  type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange}
                  className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900" 
                  placeholder="+91..."
                />
              </div>
            </div>

            <div className="relative z-10">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                Email Address 
                <span className="text-xs text-gray-600 bg-gray-100/80 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Read-only</span>
              </label>
              <input 
                type="email" value={email} disabled
                className="w-full p-4 border border-gray-200/50 rounded-xl bg-gray-100/50 text-gray-700 cursor-not-allowed font-medium" 
              />
            </div>
            
            <div className="relative z-10">
              <label className="block text-sm font-bold text-gray-700 mb-2">Artist Bio</label>
              <textarea 
                name="bio" rows={5} value={formData.bio} onChange={handleChange}
                className="w-full p-4 border border-white/60 rounded-xl focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white/60 backdrop-blur-sm shadow-sm transition-all font-medium text-gray-900 resize-none" 
                placeholder="Tell buyers about your craft journey, traditions you follow, and your heritage..." 
              />
            </div>

            <div className="pt-6 border-t border-gray-200/50 flex justify-end relative z-10">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col - Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card border border-white/60 rounded-3xl p-8 text-center shadow-lg bg-white/40 relative overflow-hidden h-full flex flex-col justify-center">
            
            {formData.artist_status === 'verified' ? (
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
            ) : (
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
            )}

            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-md relative z-10 ${
              formData.artist_status === 'verified' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
            }`}>
              {formData.artist_status === 'verified' ? <ShieldCheck size={40} /> : <AlertCircle size={40} />}
            </div>
            
            <h3 className="font-black font-heading text-gray-900 text-2xl mb-2 relative z-10">Verification Status</h3>
            
            <div className="mb-6 relative z-10">
              {formData.artist_status === 'verified' ? (
                <span className="bg-green-100/80 border border-green-200 text-green-800 text-sm font-black tracking-wide uppercase px-4 py-1.5 rounded-full inline-block shadow-sm">Verified Artist</span>
              ) : (
                <span className="bg-yellow-100/80 border border-yellow-200 text-yellow-800 text-sm font-black tracking-wide uppercase px-4 py-1.5 rounded-full inline-block shadow-sm">Pending Verification</span>
              )}
            </div>
            
            <p className="text-base text-gray-600 leading-relaxed font-medium relative z-10">
              {formData.artist_status === 'verified' 
                ? "Your artist account is verified. Your products will be visible on the public store, and you can contribute to the community." 
                : "Your account is currently under review by our admin team. Once verified, your products will become publicly visible."}
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
