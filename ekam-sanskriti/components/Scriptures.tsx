'use client';
import { useState, useEffect } from 'react';
import AudioButton from '@/components/AudioButton';
import { X, BookOpen, Clock, Globe } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia';

interface Scripture {
  id: string;
  name: string;
  nameNative: string;
  religion: string;
  period: string;
  language: string;
  wikipediaTitle: string;
  summary: string;
  keyTeachings: string[];
}

const globalWikiCache: Record<string, string> = {};

function useLanguageDict() {
  const [langCode, setLangCode] = useState('en');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localLang = localStorage.getItem('chosen_language');
      if (localLang) {
        const val = localLang.toLowerCase().trim();
        const matched = SUPPORTED_LANGUAGES.find(
          l => l.code.toLowerCase() === val || l.name.toLowerCase() === val
        );
        if (matched) setLangCode(matched.code);
      }
    }
  }, []);
  return getDictionary(langCode as any);
}

export function ScripturesSection({ scriptures }: { scriptures: Scripture[] }) {
  const dict = useLanguageDict();

  if (!scriptures || scriptures.length === 0) return null;
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold mb-6 text-saffron-600 flex items-center gap-2">
        <BookOpen className="w-6 h-6" /> {dict.unifiedIndia?.scriptures || 'Scriptures'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scriptures.map(s => (
          <ScriptureCard key={s.id} scripture={s} dict={dict} />
        ))}
      </div>
    </div>
  );
}

function ScriptureCard({ scripture, dict }: { scripture: Scripture, dict: any }) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchImage() {
      if (globalWikiCache[scripture.wikipediaTitle]) {
        setImageUrl(globalWikiCache[scripture.wikipediaTitle]);
        return;
      }
      try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${scripture.wikipediaTitle}&prop=pageimages&pithumbsize=800&format=json&origin=*`);
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pages[pageId].thumbnail) {
          const url = pages[pageId].thumbnail.source;
          globalWikiCache[scripture.wikipediaTitle] = url;
          setImageUrl(url);
        }
      } catch (err) {
        console.error("Failed to fetch image for", scripture.wikipediaTitle, err);
      }
    }
    fetchImage();
  }, [scripture.wikipediaTitle]);

  return (
    <>
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
        <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={scripture.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <BookOpen className="w-12 h-12 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              {scripture.name}
            </h4>
            <p className="text-white/80 text-sm font-medium font-serif">{scripture.nameNative}</p>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
            {scripture.summary}
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-saffron-50 text-saffron-700 font-semibold hover:bg-saffron-600 hover:text-white transition-colors"
          >
            {dict.unifiedIndia?.readMore || 'Read More'}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ScriptureModal 
          scripture={scripture} 
          imageUrl={imageUrl} 
          onClose={() => setIsModalOpen(false)}
          dict={dict} 
        />
      )}
    </>
  );
}

function ScriptureModal({ scripture, imageUrl, onClose, dict }: { scripture: Scripture; imageUrl: string; onClose: () => void; dict: any }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-600 hover:bg-gray-100 z-10 transition-colors shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>

        {imageUrl && (
          <div className="w-full h-64 sm:h-80 relative">
            <img src={imageUrl} alt={scripture.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">{scripture.name}</h2>
              <p className="text-xl text-white/90 font-serif">{scripture.nameNative}</p>
            </div>
          </div>
        )}

        <div className={`p-6 sm:p-8 ${!imageUrl ? 'pt-16' : ''}`}>
          {!imageUrl && (
             <div className="mb-6">
               <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">{scripture.name}</h2>
               <p className="text-xl text-gray-600 font-serif">{scripture.nameNative}</p>
             </div>
          )}
          
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 bg-saffron-50 text-saffron-800 px-4 py-2 rounded-full text-sm font-medium border border-saffron-100">
              <Clock className="w-4 h-4" />
              <span>{scripture.period}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-100">
              <Globe className="w-4 h-4" />
              <span>{scripture.language}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900 m-0">{dict.unifiedIndia?.scriptures || 'Summary'}</h3>
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full shadow-inner">
                <AudioButton text={scripture.summary} lang="en-IN" />
                <span className="text-sm font-medium text-gray-700">{dict.unifiedIndia?.listenToSummary || 'Listen to Summary'}</span>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">{scripture.summary}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-saffron-600" />
              {dict.unifiedIndia?.keyTeachings || 'Key Teachings'}
            </h3>
            <ul className="space-y-4">
              {scripture.keyTeachings.map((teaching, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-saffron-100 text-saffron-700 font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-gray-700 text-lg leading-relaxed mt-0.5">{teaching}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <a 
              href={`https://en.wikipedia.org/wiki/${scripture.wikipediaTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Globe className="w-5 h-5" />
              {dict.unifiedIndia?.readFullOnWikipedia || 'Read Full on Wikipedia'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
