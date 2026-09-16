/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import AudioButton from '@/components/AudioButton';
import { ScripturesSection } from '@/components/Scriptures';
import scripturesData from '@/data/scriptures.json';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen } from 'lucide-react';

const religions = [
  {
    name: 'Hinduism',
    id: 'hinduism',
    teachings: [
      {
        original: 'अहं ब्रह्मास्मि',
        translation: 'I am Brahman (the ultimate reality)',
        audio: 'Aham Brahmasmi'
      }
    ],
    science: [
      { type: '✅ Verified', text: 'Yoga and meditation have proven neurological benefits.', source: 'Harvard Medical School' }
    ]
  },
  {
    name: 'Islam',
    id: 'islam',
    teachings: [
      {
        original: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ',
        translation: 'The believers are but brothers',
        audio: 'Innamal mu minoona ikhwa'
      }
    ],
    science: [
      { type: '✅ Verified', text: 'Fasting (Sawm) triggers autophagy, reducing inflammation.', source: 'Nobel Prize in Medicine, 2016' }
    ]
  },
  {
    name: 'Christianity',
    id: 'christianity',
    teachings: [],
    science: []
  },
  {
    name: 'Sikhism',
    id: 'sikhism',
    teachings: [
      {
        original: 'ਮਾਨਸ ਕੀ ਜਾਤ ਸਬੈ ਏਕੈ ਪਹਚਾਨਬੋ',
        translation: 'Recognize the whole human race as one',
        audio: 'Manas ki jaat sabai ekai pehchanbo'
      }
    ],
    science: [
      { type: '✅ Verified', text: 'Langar (community kitchen) promotes psychological well-being through communal equality.', source: 'Sociological Studies' }
    ]
  },
  {
    name: 'Buddhism',
    id: 'buddhism',
    teachings: [],
    science: []
  },
  {
    name: 'Jainism',
    id: 'jainism',
    teachings: [],
    science: []
  },
  {
    name: 'Zoroastrianism',
    id: 'zoroastrianism',
    teachings: [],
    science: []
  },
  {
    name: 'Judaism',
    id: 'judaism',
    teachings: [],
    science: []
  },
  {
    name: 'Bahá\'í',
    id: 'bahai',
    teachings: [],
    science: []
  },
  {
    name: 'Tribal beliefs',
    id: 'tribal',
    teachings: [],
    science: []
  }
];

export default function UnifiedIndiaPage() {
  const [activeTab, setActiveTab] = useState(0);
  const activeReligion = religions[activeTab];
  const activeScriptures = (scripturesData as any)[activeReligion.id] || [];

  return (
    <PageTransition className="min-h-screen bg-cream p-6 md:p-12 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-saffron/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-indiaGreen/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-4 font-heading text-gray-900 drop-shadow-sm flex items-center justify-center gap-3"
          >
            <Sparkles className="text-saffron" size={36} />
            Unified India
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg"
          >
            Explore the diverse faiths that co-exist in harmony. Learn about their core scriptures, profound teachings, and the scientific perspectives behind their ancient wisdom.
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {religions.map((r, i) => (
            <button
              key={r.name}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm ${activeTab === i ? 'bg-gradient-to-r from-saffron to-maroon text-white scale-105 hover:shadow-saffron/30 shadow-lg' : 'glass-card border border-white/50 text-gray-700 hover:bg-white hover:scale-105'}`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeReligion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl border border-white/40"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200/50">
              <div className="w-16 h-16 bg-gradient-to-br from-saffron to-maroon rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-3">
                <BookOpen size={32} />
              </div>
              <h2 className="text-4xl font-black font-heading text-gray-900">{activeReligion.name}</h2>
            </div>
            
            {/* SCRIPTURES SECTION (NEW) */}
            <div className="mb-12">
              <ScripturesSection scriptures={activeScriptures} />
            </div>

            {/* Teachings and Science */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center text-saffron">✨</span>
                  Key Teachings
                </h3>
                {activeReligion.teachings.length > 0 ? (
                  <div className="space-y-6">
                    {activeReligion.teachings.map((t, i) => (
                      <div key={i} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-3xl font-serif mb-3 text-maroon">{t.original}</div>
                        <div className="text-gray-700 mb-5 font-medium text-lg">{t.translation}</div>
                        <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl">
                          <AudioButton text={t.audio} lang="en-IN" />
                          <span className="text-sm text-gray-600 font-bold uppercase tracking-wider">Listen to Pronunciation</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/40 p-8 rounded-2xl border border-white/40 text-center">
                    <p className="text-gray-700 font-medium">Teachings data coming soon...</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indiaGreen/20 flex items-center justify-center text-indiaGreen">🔬</span>
                  Scientific Perspective
                </h3>
                {activeReligion.science.length > 0 ? (
                  <div className="space-y-6">
                    {activeReligion.science.map((s, i) => (
                      <div key={i} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="font-black text-lg mb-3 text-indiaGreen flex items-center gap-2">
                          {s.type}
                        </div>
                        <p className="text-gray-800 mb-5 text-lg leading-relaxed">{s.text}</p>
                        <div className="text-sm text-gray-600 flex items-center gap-2 bg-gray-50/50 p-3 rounded-xl">
                          <span>📚</span> <span className="font-bold uppercase tracking-wider text-xs">Source:</span> <span className="font-semibold">{s.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/40 p-8 rounded-2xl border border-white/40 text-center">
                    <p className="text-gray-700 font-medium">Scientific perspectives coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
