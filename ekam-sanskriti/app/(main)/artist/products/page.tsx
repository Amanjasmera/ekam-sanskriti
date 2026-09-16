'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { PlusCircle, Loader2, Edit, Trash2, Eye, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MyProductsPage() {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) setProducts(data)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) {
      setProducts(products.filter(p => p.id !== id))
      setDeleteId(null)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black font-heading text-gray-900 flex items-center gap-2 drop-shadow-sm">
            <Sparkles className="text-saffron" size={28} />
            My Products
          </h2>
          <p className="text-gray-600 font-medium text-sm mt-2">Manage your crafts and physical items for sale.</p>
        </div>
        <Link 
          href="/artist/products/new" 
          className="bg-gradient-to-r from-saffron to-maroon hover:from-saffron-600 hover:to-maroon-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-saffron/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-saffron" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 glass-card border border-white/60 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
          <h3 className="text-2xl font-black text-gray-900 mb-2 font-heading">No products yet</h3>
          {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
          <p className="text-gray-700 max-w-sm mx-auto mb-8 font-medium">
{/* eslint-disable-next-line react/no-unescaped-entities */}
            You haven't listed any crafts or products. Click "Add New Product" to start selling.
          </p>
          <Link 
            href="/artist/products/new" 
            className="text-saffron font-bold hover:text-saffron-600 flex items-center justify-center gap-2 transition-colors"
          >
            <PlusCircle className="w-5 h-5" /> Add your first product
          </Link>
        </div>
      ) : (
        <div className="glass-card border border-white/60 rounded-3xl overflow-hidden shadow-xl bg-white/40 relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/60 backdrop-blur-md text-sm text-gray-600 border-b border-gray-200/50">
                <tr>
                  <th className="p-5 font-bold uppercase tracking-wider text-xs">Product</th>
                  <th className="p-5 font-bold uppercase tracking-wider text-xs">Category</th>
                  <th className="p-5 font-bold uppercase tracking-wider text-xs">Price</th>
                  <th className="p-5 font-bold uppercase tracking-wider text-xs">Status</th>
                  <th className="p-5 font-bold uppercase tracking-wider text-xs">Views</th>
                  <th className="p-5 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30 text-sm">
                {products.map((product) => {
                  const image = (product.images && product.images.length > 0) ? product.images[0] : (product.image_url || '/placeholder.png')
                  return (
                    <tr key={product.id} className="hover:bg-white/80 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-white border border-gray-100">
                            <img src={image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="font-bold text-gray-900 max-w-[200px] truncate" title={product.name}>
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-gray-600 font-medium">{product.craft_type || 'Uncategorized'}</td>
                      <td className="p-5 font-black text-gray-900">₹{product.price}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-xs rounded-full font-bold tracking-wide ${
                          product.status === 'active' ? 'bg-green-100/80 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {product.status === 'active' ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-5 text-gray-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-blue-500" />
                          {product.views || 0}
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/artist/products/${product.id}/edit`} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => setDeleteId(product.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 relative"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-black font-heading text-gray-900 mb-2">Delete Product?</h3>
              <p className="text-gray-600 mb-6 font-medium">
                Are you sure? This action cannot be undone and will permanently remove this product from the marketplace.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors active:scale-95 shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  )
}
