'use client'

import { motion } from 'framer-motion'
import { Package, Eye, MessageSquare, TrendingUp } from 'lucide-react'

export default function ArtistDashboardOverview() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-saffron to-maroon rounded-xl flex items-center justify-center text-white shadow-md">
          <TrendingUp size={20} />
        </div>
        <h2 className="text-3xl font-black font-heading text-gray-900 drop-shadow-sm">Dashboard Overview</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 rounded-2xl glass-card border border-white/60 shadow-lg relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-saffron/20"></div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-saffron to-orange-400 flex items-center justify-center mb-4 text-white shadow-md">
            <Package size={24} />
          </div>
          <p className="text-gray-600 font-bold uppercase tracking-wider text-sm mb-1">Total Products</p>
          <h3 className="text-4xl font-black text-gray-900 drop-shadow-sm">12</h3>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 rounded-2xl glass-card border border-white/60 shadow-lg relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 text-white shadow-md">
            <Eye size={24} />
          </div>
          <p className="text-gray-600 font-bold uppercase tracking-wider text-sm mb-1">Profile Views</p>
          <h3 className="text-4xl font-black text-gray-900 drop-shadow-sm">1,402</h3>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 rounded-2xl glass-card border border-white/60 shadow-lg relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indiaGreen/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-indiaGreen/20"></div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 text-white shadow-md">
            <MessageSquare size={24} />
          </div>
          <p className="text-gray-600 font-bold uppercase tracking-wider text-sm mb-1">New Enquiries</p>
          <h3 className="text-4xl font-black text-gray-900 drop-shadow-sm">5</h3>
        </motion.div>

      </div>
      
      <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
        <h3 className="font-black text-xl mb-6 text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-maroon/10 flex items-center justify-center text-maroon">🕒</span>
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="p-5 border border-white/60 bg-white/40 backdrop-blur-sm rounded-2xl flex items-center gap-4 hover:shadow-md transition-all group">
            <div className="w-3 h-3 bg-indiaGreen rounded-full shadow-[0_0_8px_rgba(19,136,8,0.5)] group-hover:scale-125 transition-transform"></div>
            <p className="text-gray-700 flex-1 font-medium">New enquiry on <strong className="text-gray-900 font-bold">Pattachitra Canvas</strong></p>
            <span className="text-xs text-gray-700 font-bold bg-white/50 px-3 py-1 rounded-full border border-gray-100">2h ago</span>
          </div>
          <div className="p-5 border border-white/60 bg-white/40 backdrop-blur-sm rounded-2xl flex items-center gap-4 hover:shadow-md transition-all group">
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform"></div>
            <p className="text-gray-700 flex-1 font-medium">Product <strong className="text-gray-900 font-bold">Madhubani Saree</strong> was approved</p>
            <span className="text-xs text-gray-700 font-bold bg-white/50 px-3 py-1 rounded-full border border-gray-100">1d ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
