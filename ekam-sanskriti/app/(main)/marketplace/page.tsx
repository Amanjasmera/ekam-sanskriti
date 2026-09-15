import Image from 'next/image';
import artists from '@/data/artists.json';

export default function MarketplacePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-saffron-600">Heritage Marketplace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => (
          <div key={artist.id} className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4 mb-4">
              <Image src={artist.photo} alt={artist.name} width={64} height={64} className="rounded-full object-cover" />
              <div>
                <h2 className="text-xl font-bold">{artist.name}</h2>
                <p className="text-sm font-semibold text-saffron-600">{artist.craft}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">{artist.bio}</p>
            
            <h3 className="font-bold mb-3 border-b pb-2">Products</h3>
            <div className="space-y-4">
              {artist.products.map(product => (
                <div key={product.id} className="flex gap-4">
                  <Image src={product.image} alt={product.name} width={80} height={80} className="rounded object-cover" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-500">{product.description}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-green-700">₹{product.price}</span>
                      <a 
                        href={`https://wa.me/?text=Hi ${artist.name}, I'm interested in buying your ${product.name} for ₹${product.price}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                      >
                        Enquire (WhatsApp)
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
