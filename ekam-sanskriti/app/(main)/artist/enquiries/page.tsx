'use client'

import { motion } from 'framer-motion'
import { MessageSquare, ExternalLink, CheckCircle, Sparkles } from 'lucide-react'

export default function EnquiriesPage() {
  // Mock data for MVP
  const enquiries = [
    {
      id: '1',
      customerName: 'Rahul Sharma',
      product: 'Handpainted Warli Canvas',
      message: 'Hi, is this painting available in a larger size? Around 4x4 feet?',
      date: '2023-10-15T10:30:00Z',
      phone: '919876543210',
      status: 'pending'
    },
    {
      id: '2',
      customerName: 'Priya Patel',
      product: 'Terracotta Horse',
      message: 'Can you ship this to Mumbai by next week?',
      date: '2023-10-14T14:15:00Z',
      phone: '919876543211',
      status: 'resolved'
    }
  ]

  const handleWhatsAppReply = (phone: string, text: string) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-10">
        <h2 className="text-3xl font-black font-heading text-gray-900 flex items-center gap-2 drop-shadow-sm mb-2">
          <Sparkles className="text-saffron" size={28} />
          Buyer Enquiries
        </h2>
        <p className="text-gray-600 font-medium">Manage customer messages from WhatsApp deep links.</p>
      </div>

      <div className="space-y-6">
        {enquiries.map((enquiry, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={enquiry.id} 
            className="glass-card border border-white/60 rounded-3xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row gap-6 items-start relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-all ${enquiry.status === 'pending' ? 'bg-saffron/10 group-hover:bg-saffron/20' : 'bg-green-500/10 group-hover:bg-green-500/20'}`}></div>
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${enquiry.status === 'pending' ? 'bg-gradient-to-br from-saffron to-orange-400 text-white' : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600'}`}>
              <MessageSquare size={24} />
            </div>
            
            <div className="flex-1 relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                <h3 className="font-black text-xl text-gray-900">{enquiry.customerName}</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 bg-white/50 px-3 py-1 rounded-full border border-gray-100">
                  {new Date(enquiry.date).toLocaleDateString()}
                </span>
              </div>
              <div className="inline-block bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 mb-4 shadow-sm">
                <span className="text-gray-600 uppercase tracking-widest text-xs mr-2">Product:</span> 
                {enquiry.product}
              </div>
              
              <div className="relative mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-saffron to-maroon rounded-full"></div>
                <p className="text-gray-700 text-base font-medium italic pl-5 py-1">
                  &quot;{enquiry.message}&quot;
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-auto">
                <button 
                  onClick={() => handleWhatsAppReply(enquiry.phone, `Hi ${enquiry.customerName}, regarding your enquiry for ${enquiry.product}: `)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2 active:scale-95"
                >
                  <ExternalLink size={18} />
                  Reply on WhatsApp
                </button>
                
                {enquiry.status === 'pending' && (
                  <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95">
                    Mark as Resolved
                  </button>
                )}
                {enquiry.status === 'resolved' && (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                    <CheckCircle size={18} /> Resolved
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
