'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { 
  Package, LayoutDashboard, PlusCircle, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BookOpen, MessageSquare, Settings, User, 
  Award, LogOut, Loader2, Sparkles
} from 'lucide-react'
import PageTransition from '@/components/PageTransition'

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkArtist() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      
      if (!data) {
        // If no profile, they are a brand new user, but for local testing we will let them see the UI.
        // We will mock a profile so the UI doesn't crash.
        setProfile({ ...user, full_name: 'Test Artist', role: 'artist', artist_status: 'verified' })
        setLoading(false)
        return
      }
      
      // Temporarily bypassing strict check so you can view the UI without manual DB updates
      // if (data.role !== 'artist' || data.artist_status !== 'verified') {
      //   router.push('/dashboard')
      //   return
      // }

      setProfile({ ...user, ...data, artist_status: 'verified' })
      setLoading(false)
    }
    checkArtist()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-cream">
        <Loader2 className="w-10 h-10 animate-spin text-saffron" />
      </div>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const tabs = [
    { id: '/artist/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: '/artist/products', icon: Package, label: 'My Products' },
    { id: '/artist/products/new', icon: PlusCircle, label: 'Add Product' },
    { id: '/artist/enquiries', icon: MessageSquare, label: 'Enquiries' },
    { id: '/artist/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <PageTransition className="min-h-screen bg-cream py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="bg-gradient-to-br from-saffron to-maroon rounded-3xl p-8 md:p-10 text-white shadow-2xl mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/30">
              <Sparkles size={14} className="text-gold" /> Artisan Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-heading drop-shadow-md">
              Welcome back, {profile.full_name}
            </h1>
            <p className="text-orange-100 font-medium mt-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-gold drop-shadow-sm" />
              Verified Ekam Sanskriti Artisan
            </p>
          </div>
          
          <div className="relative z-10">
            <button 
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Inner Sidebar Navigation */}
          <div className="w-full lg:w-72 shrink-0 space-y-3">
            <div className="glass-card p-4 rounded-3xl shadow-xl sticky top-6">
              {tabs.map(tab => {
                const isActive = pathname === tab.id || (tab.id !== '/artist/dashboard' && pathname.startsWith(tab.id))
                return (
                  <Link
                    key={tab.id}
                    href={tab.id}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all font-bold mb-2 last:mb-0 ${
                      isActive 
                        ? 'bg-gradient-to-r from-saffron to-orange-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-white/60 hover:shadow-sm'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-saffron'}`} />
                    {tab.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 glass-card p-6 md:p-10 min-h-[600px]">
            {children}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
