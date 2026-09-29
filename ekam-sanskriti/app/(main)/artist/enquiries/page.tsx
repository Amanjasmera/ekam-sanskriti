'use client'

import { motion } from 'framer-motion'
import { Sparkles, Inbox } from 'lucide-react'

export default function EnquiriesPage() {
  // We currently don't track WhatsApp enquiries in the database since they are direct messages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enquiries: any[] = []

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
        {enquiries.length > 0 ? (
          enquiries.map((enquiry, idx) => (
            <div key={idx}></div>
          ))
        ) : (
          <div className="text-center py-20 glass-card border border-white/60 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2 font-heading">No enquiries yet</h3>
            <p className="text-gray-700 max-w-sm mx-auto mb-8 font-medium">
              When buyers click on WhatsApp links for your products, you'll receive direct messages on your phone.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
