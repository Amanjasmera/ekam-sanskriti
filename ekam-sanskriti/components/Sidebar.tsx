'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, Compass, Coffee, Calendar, Palette, 
  ShoppingBag, HelpCircle, ScanLine, LogOut, 
  Settings, User, Globe, Moon, Sun, Menu, X,
  LayoutDashboard, PlusCircle, BookOpen, MessageSquare, Map, Lock
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia'
import { getDictionary } from '@/lib/i18n'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [isOpen, setIsOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [langCode, setLangCode] = useState<string>('en')
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    async function getProfile() {
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
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        setProfile({ ...user, ...data })
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
    getProfile()
  }, [])

  const dict = getDictionary(langCode)

  const isArtist = profile?.role === 'artist'

  type NavLink = { name: string; href: string; icon: any; isLocked?: boolean }

  const userNavLinks: NavLink[] = [
    { name: dict.sidebar.dashboard, href: '/dashboard', icon: Home },
    { name: dict.sidebar.explore, href: '/explore', icon: Compass },
    { name: dict.sidebar.interactiveMap, href: '/map', icon: Map },
    { name: dict.sidebar.food, href: '/food', icon: Coffee },
    { name: dict.sidebar.festivals, href: '/festivals', icon: Calendar },
    { name: dict.sidebar.cultureCraft, href: '/culture-craft', icon: Palette },
    { name: 'Artist', href: '#', icon: Lock, isLocked: true },
    { name: dict.sidebar.quiz, href: '/quiz', icon: HelpCircle },
    { name: dict.sidebar.scanner, href: '/scanner', icon: ScanLine },
  ]

  const artistNavLinks: NavLink[] = [
    { name: 'Artist Dashboard', href: '/artist/dashboard', icon: LayoutDashboard },
    { name: 'My Products', href: '/artist/dashboard#products', icon: ShoppingBag },
    { name: 'Add Product', href: '/artist/dashboard#add-product', icon: PlusCircle },
    { name: 'Learning Materials', href: '/artist/dashboard#lessons', icon: BookOpen },
    { name: 'Enquiries', href: '/artist/dashboard#enquiries', icon: MessageSquare },
    { name: 'Profile', href: '/artist/dashboard#profile', icon: User },
  ]

  const navLinks = isArtist ? artistNavLinks : userNavLinks

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const changeLanguage = async (code: string) => {
    setLangCode(code)
    setLangOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('chosen_language', code)
    }
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`

    if (profile?.id) {
      await supabase
        .from('profiles')
        .upsert({ id: profile.id, chosen_language: code }, { onConflict: 'id' })
      setProfile({ ...profile, chosen_language: code })
    }

    window.location.reload()
  }

  const handleLinkClick = (e: React.MouseEvent, link: any) => {
    if (link.isLocked) {
      e.preventDefault()
      setToastMsg('Only verified artists can access this section. Please sign up as an artist.')
      setTimeout(() => setToastMsg(''), 3000)
    }
  }

  const toggleSidebar = () => setIsOpen(!isOpen)

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0]

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl border-r border-amber-100 shadow-2xl overflow-y-auto">
      {/* Logo Area */}
      <div className="p-6 border-b border-orange-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            ए
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-gray-900 leading-none">Ekam Sanskriti</h1>
            <p className="text-xs text-orange-600 font-medium mt-0.5">एकम् संस्कृति</p>
          </div>
        </Link>
        <button className="md:hidden text-gray-500 hover:text-gray-900" onClick={toggleSidebar}>
          <X size={24} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href) && link.href !== '#'
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-orange-50 text-orange-700 font-semibold shadow-sm border border-orange-200' 
                  : link.isLocked
                    ? 'text-gray-400 cursor-not-allowed hover:bg-gray-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-orange-600' : 'text-gray-400'} />
              {link.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        {/* Language Selector Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200 hover:bg-orange-50 hover:border-orange-300 text-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-orange-500" />
              <span className="text-sm font-semibold">{currentLangObj.native} ({currentLangObj.name})</span>
            </div>
            <span className="text-xs text-gray-400">▼</span>
          </button>
          
          <AnimatePresence>
            {langOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-orange-100 max-h-60 overflow-y-auto z-50 p-2"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                      langCode === lang.code 
                        ? 'bg-orange-100 text-orange-800 font-bold' 
                        : 'hover:bg-orange-50 text-gray-700'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-xs text-gray-400">{lang.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative pt-2">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm border border-orange-200">
              {profile?.full_name?.charAt(0) || <User size={18} />}
            </div>
            <div className="text-left flex-1 overflow-hidden">
              <p className="text-xs font-bold text-gray-900 truncate">{profile?.full_name || 'Account'}</p>
              <p className="text-[11px] text-gray-500 truncate">{profile?.email || 'User'}</p>
            </div>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50"
              >
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 rounded-lg text-red-600 font-medium cursor-pointer"
                >
                  <LogOut size={16} /> {dict.sidebar.logout}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-72 md:-translate-x-0 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-3 text-sm font-medium border border-gray-700"
          >
            <Lock size={18} className="text-orange-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mobile Hamburger */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg text-gray-700 border border-gray-100"
      >
        <Menu size={22} />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[260px] h-screen fixed top-0 left-0 z-40">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 h-screen w-[280px] z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
