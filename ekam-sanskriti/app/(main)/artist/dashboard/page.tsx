'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { 
  Package, LayoutDashboard, PlusCircle, 
  BookOpen, MessageSquare, Settings, User, 
  Award, Eye, TrendingUp, DollarSign, Loader2, PlayCircle
} from 'lucide-react'

export default function ArtistDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function checkArtist() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      
      if (!data || data.role !== 'artist') {
        router.push('/dashboard')
        return
      }

      setProfile({ ...user, ...data })
      setLoading(false)
      
      // Parse hash for initial tab
      if (window.location.hash) {
        setActiveTab(window.location.hash.replace('#', ''))
      }
    }
    checkArtist()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-maroon-800" style={{ color: '#7B1E1E' }}>
            Welcome back, {profile.full_name}
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-500" />
            Verified Ekam Sanskriti Artisan
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('add-product')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center gap-2"
          style={{ backgroundColor: '#FF9933' }}
        >
          <PlusCircle className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation inside Dashboard */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'profile', icon: User, label: 'Digital ID / Craft DNA' },
            { id: 'products', icon: Package, label: 'My Products' },
            { id: 'add-product', icon: PlusCircle, label: 'Add Product' },
            { id: 'lessons', icon: BookOpen, label: 'Learning Content' },
            { id: 'enquiries', icon: MessageSquare, label: 'Enquiries' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-medium ${
                activeTab === tab.id 
                  ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-500 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-orange-600' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[600px]">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center mb-4">
                    <Package className="text-orange-700" />
                  </div>
                  <p className="text-gray-600 font-medium">Total Products</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">12</h3>
                </div>
                
                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center mb-4">
                    <Eye className="text-blue-700" />
                  </div>
                  <p className="text-gray-600 font-medium">Profile Views</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">1,402</h3>
                </div>

                <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center mb-4">
                    <MessageSquare className="text-green-700" />
                  </div>
                  <p className="text-gray-600 font-medium">New Enquiries</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">5</h3>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600 flex-1">New enquiry on <strong>Pattachitra Canvas</strong></p>
                  <span className="text-xs text-gray-400">2h ago</span>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-600 flex-1">Product <strong>Madhubani Saree</strong> was approved</p>
                  <span className="text-xs text-gray-400">1d ago</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Digital ID & Craft DNA</h2>
              <p className="text-gray-500 mb-8">This information builds trust and is visible to buyers on your products.</p>
              
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-6 p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                  <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    <User size={40} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{profile.full_name}</h3>
                    <p className="text-orange-600 font-medium">{profile.occupation || 'Artisan'}</p>
                    <p className="text-sm text-gray-500 mt-1">{profile.place_of_birth || 'India'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Craft Form</label>
                    <input type="text" className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50" defaultValue="Madhubani Painting" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input type="number" className="w-full p-2.5 border border-gray-200 rounded-lg" defaultValue="15" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Artisan Story (Craft DNA)</label>
                    <textarea rows={4} className="w-full p-2.5 border border-gray-200 rounded-lg" defaultValue="I learned this craft from my grandmother in our village in Bihar..." />
                  </div>
                </div>
                <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium">Save Profile</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
                <button onClick={() => setActiveTab('add-product')} className="text-sm font-medium text-orange-600 hover:underline">
                  + Add New
                </button>
              </div>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-500">
                    <tr>
                      <th className="p-4 font-medium">Product Name</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Price</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    <tr>
                      <td className="p-4 font-medium text-gray-900">Handwoven Silk Saree</td>
                      <td className="p-4 text-gray-500">Textiles</td>
                      <td className="p-4 font-medium text-gray-900">₹4,500</td>
                      <td className="p-4 text-right">
                        <button className="text-orange-600 hover:underline">Edit</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-900">Terracotta Horse</td>
                      <td className="p-4 text-gray-500">Pottery</td>
                      <td className="p-4 font-medium text-gray-900">₹850</td>
                      <td className="p-4 text-right">
                        <button className="text-orange-600 hover:underline">Edit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'add-product' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
              <form className="max-w-2xl space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Product created (Demo)"); setActiveTab('products'); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                  <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" placeholder="e.g., Handpainted Warli Vase" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input type="number" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category / Craft Type</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-orange-500 focus:border-orange-500">
                      <option>Textiles & Weaving</option>
                      <option>Paintings (Madhubani, Warli)</option>
                      <option>Pottery & Ceramics</option>
                      <option>Woodwork</option>
                      <option>Jewelry</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description & Craft Process</label>
                  <textarea rows={4} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" placeholder="Describe the materials, process, and meaning..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                    <PlusCircle className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop images</p>
                  </div>
                </div>
                <button type="submit" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold w-full md:w-auto shadow-md">
                  Publish Product
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'lessons' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Learning Content</h2>
                  <p className="text-gray-500">Upload tutorials or full courses to educate buyers about your craft.</p>
                </div>
              </div>

              {/* Upload Form Demo */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="text-orange-600" size={20} />
                  Publish New Course or Lesson
                </h3>
                
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Course published (Demo)"); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                      <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" placeholder="e.g., Master Madhubani Basics" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500">
                        <option>Painting</option>
                        <option>Weaving</option>
                        <option>Pottery</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input type="number" defaultValue="0" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                      <p className="text-xs text-gray-500 mt-1">0 for Free</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Lessons</label>
                      <input type="number" defaultValue="1" min="1" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Launch Date</label>
                      <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                  </div>

                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                    Save Course
                  </button>
                </form>
              </div>

              {/* Existing Content */}
              <h3 className="font-bold text-lg text-gray-900 mb-4">Your Uploaded Content</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="border border-gray-100 rounded-xl p-4 flex gap-4 bg-white shadow-sm">
                  <div className="w-32 h-20 bg-gray-900 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800')] bg-cover"></div>
                    <PlayCircle className="text-white relative z-10" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900">How I make natural colors</h4>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Published</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">1 Lesson • Free • 1.2k views</p>
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      Launched on Jan 10, 2024
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'enquiries' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Buyer Enquiries</h2>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} />
                </div>
                <h3 className="font-bold text-lg">WhatsApp Integration Active</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  Buyers are contacting you directly on your verified WhatsApp number. Check your phone for recent messages.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
              <p className="text-gray-500">Settings and preferences configuration will go here.</p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
