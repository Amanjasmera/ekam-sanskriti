import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow border-b border-gray-100 py-4 px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-saffron-500 rounded-full flex items-center justify-center text-white font-bold">ए</div>
        <span className="text-xl font-bold text-gray-800">Ekam Sanskriti</span>
      </div>
      
      <div className="flex items-center gap-4 text-sm font-semibold text-gray-600">
        <Link href="/" className="hover:text-saffron-600">Home</Link>
        <Link href="/explore" className="hover:text-saffron-600">Explore</Link>
        <Link href="/food" className="hover:text-saffron-600">Food</Link>
        <Link href="/festivals" className="hover:text-saffron-600">Festivals</Link>
        <Link href="/learn" className="hover:text-saffron-600">Art Learn</Link>
        <Link href="/marketplace" className="hover:text-saffron-600 text-green-700">Marketplace</Link>
        <Link href="/quiz" className="hover:text-saffron-600">Quiz</Link>
        <Link href="/scanner" className="hover:text-saffron-600">Scanner</Link>
        <Link href="/dashboard" className="hover:text-saffron-600 bg-gray-100 px-3 py-1 rounded">Dashboard</Link>
      </div>
    </nav>
  );
}
