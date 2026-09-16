'use client';

export default function Loading() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center p-8 space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="w-full max-w-4xl flex justify-between items-center opacity-50">
        <div className="w-48 h-8 bg-gray-200 rounded-md animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%]"></div>
        <div className="w-24 h-8 bg-gray-200 rounded-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%]"></div>
      </div>
      
      {/* Cards Grid skeleton */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-48 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse-slow"></div>
            <div className="w-3/4 h-6 bg-gray-200 rounded-md animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%]"></div>
            <div className="w-full h-4 bg-gray-200 rounded-md animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%]"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded-md animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%]"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
