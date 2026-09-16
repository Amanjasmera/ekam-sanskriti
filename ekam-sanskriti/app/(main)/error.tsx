'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We can log this to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <PageTransition className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg border border-red-100"
      >
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
          Oops! Something went wrong.
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          We encountered an unexpected issue while loading this page. Our team has been notified. 
          Please try refreshing the page.
        </p>
        
        <button
          onClick={() => reset()}
          className="px-8 py-4 bg-saffron text-white rounded-xl font-bold flex items-center justify-center gap-2 mx-auto hover:bg-saffron-500 hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          <RefreshCcw className="w-5 h-5" />
          Try Again
        </button>
      </motion.div>
    </PageTransition>
  );
}
