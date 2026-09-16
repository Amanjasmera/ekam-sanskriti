/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { ScripturesSection } from '@/components/Scriptures';
import scripturesData from '@/data/scriptures.json';
import PageTransition from '@/components/PageTransition';
import { Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const religions = [
  { name: 'Hinduism', id: 'hinduism' },
  { name: 'Islam', id: 'islam' },
  { name: 'Christianity', id: 'christianity' },
  { name: 'Sikhism', id: 'sikhism' },
  { name: 'Buddhism', id: 'buddhism' },
  { name: 'Jainism', id: 'jainism' },
  { name: 'Zoroastrianism', id: 'zoroastrianism' },
  { name: 'Judaism', id: 'judaism' },
  { name: 'Bahá\'í', id: 'bahai' },
  { name: 'Tribal', id: 'tribal' }
];

export default function ScripturesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const activeReligion = religions[activeTab];
  const activeScriptures = (scripturesData as any)[activeReligion.id] || [];

  return (
    <PageTransition className="max-w-7xl mx-auto p-6 md:p-10 min-h-screen">
      {/* Banner */}
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/30">
            <Sparkles size={14} className="text-purple-300" /> Sacred Heritage
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading drop-shadow-md">Sacred Scriptures</h1>
          <p className="mt-3 text-purple-200 max-w-2xl text-base md:text-lg font-light">
            Explore the profound wisdom and sacred texts of various faiths. 
            Learn about the historical context and foundational teachings.
          </p>
        </div>
      </div>

      {/* Religion Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {religions.map((r, i) => (
          <button
            key={r.name}
            onClick={() => setActiveTab(i)}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === i 
                ? 'bg-purple-700 text-white shadow-lg scale-105' 
                : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Scriptures Content */}
      <motion.div
        key={activeReligion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[400px]"
      >
        {activeScriptures.length > 0 ? (
          <ScripturesSection scriptures={activeScriptures} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <BookOpen size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">No Scriptures Found</h3>
            <p className="text-gray-700 max-w-sm">We are currently gathering sacred texts for {activeReligion.name}. Please check back later.</p>
          </div>
        )}
      </motion.div>
    </PageTransition>
  );
}
