'use client';
import { useState } from 'react';
import AudioButton from '@/components/AudioButton';
import { ScripturesSection } from '@/components/Scriptures';
import scripturesData from '@/data/scriptures.json';

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
    <div className="max-w-6xl mx-auto p-8 min-h-[calc(100vh-4rem)]">
      <h1 className="text-4xl font-bold mb-4 text-center text-saffron-600">Unified India</h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Explore the diverse faiths that co-exist in harmony. Learn about their core scriptures, profound teachings, and the scientific perspectives behind their ancient wisdom.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {religions.map((r, i) => (
          <button
            key={r.name}
            onClick={() => setActiveTab(i)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === i ? 'bg-saffron-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 border-b pb-4">{activeReligion.name}</h2>
        
        {/* SCRIPTURES SECTION (NEW) */}
        <ScripturesSection scriptures={activeScriptures} />

        {/* Teachings and Science */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3 text-saffron-600">Key Teachings</h3>
            {activeReligion.teachings.length > 0 ? (
              <div className="space-y-4">
                {activeReligion.teachings.map((t, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-2xl font-serif mb-2 text-gray-800">{t.original}</div>
                    <div className="text-gray-600 mb-3">{t.translation}</div>
                    <div className="flex items-center gap-2">
                      <AudioButton text={t.audio} lang="en-IN" />
                      <span className="text-sm text-gray-500 font-medium">Listen to Pronunciation</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Teachings data coming soon...</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3 text-saffron-600">Scientific Perspective</h3>
            {activeReligion.science.length > 0 ? (
              <div className="space-y-4">
                {activeReligion.science.map((s, i) => (
                  <div key={i} className="border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-bold text-lg mb-2">{s.type}</div>
                    <p className="text-gray-700 mb-3">{s.text}</p>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <span>📚 Source:</span> <span className="font-medium">{s.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Scientific perspectives coming soon...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
