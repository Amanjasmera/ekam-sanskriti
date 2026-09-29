'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { PackageSearch, Loader2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function MarketplacePage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      // Fetch active products and profile info of the artist
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles:artist_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <PageTransition className="min-h-screen bg-cream p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black font-heading text-gray-900 mb-4 text-center">Heritage Marketplace</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg font-medium">
          Discover authentic handcrafted treasures directly from the artisans. Every purchase supports local heritage.
        </p>
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-saffron" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 glass-card border border-white/60 rounded-3xl shadow-lg relative overflow-hidden">
             <PackageSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
             <h3 className="text-2xl font-black text-gray-900 mb-2 font-heading">No products listed yet</h3>
             <p className="text-gray-600">Be the first to list a craft in the marketplace!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => {
              const image = (product.images && product.images.length > 0) ? product.images[0] : (product.image_url || '/placeholder.png');
              const artistName = product.profiles?.full_name || 'Artisan';
              const artistAvatar = product.profiles?.avatar_url || '/placeholder.png';
              
              return (
                <div key={product.id} className="glass-card rounded-3xl overflow-hidden shadow-xl border border-white/60 hover:shadow-2xl transition-all group flex flex-col h-full bg-white/40">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-saffron font-black px-3 py-1 rounded-full shadow-sm text-sm">
                      ₹{product.price}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-xs font-bold uppercase tracking-wider text-saffron mb-2">{product.craft_type}</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
                    
                    <div className="border-t border-gray-200/50 pt-4 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <img src={artistAvatar} alt={artistName} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">{artistName}</span>
                      </div>
                      
                      <a 
                        href={`https://wa.me/?text=Hi ${artistName}, I'm interested in buying your ${product.name} for ₹${product.price} on Ekam Sanskriti.`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-gradient-to-r from-green-500 to-green-600 text-white font-bold px-3 py-2 rounded-lg hover:from-green-600 hover:to-green-700 shadow-sm transition-colors"
                      >
                        Enquire
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
