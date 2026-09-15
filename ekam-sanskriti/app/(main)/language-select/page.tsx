'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

import { getDictionary } from '@/lib/i18n'
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia'

const INDIAN_LANGUAGES = [
  'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
  'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese',
  'Maithili', 'Sanskrit', 'Nepali', 'Konkani', 'Kashmiri', 'Sindhi',
  'Dogri', 'Manipuri', 'Bodo', 'Santali'
]

export default function LanguageSelectPage() {
  const [selectedLang, setSelectedLang] = useState('Hindi')
  const [loading, setLoading] = useState(false)
  const [langCode, setLangCode] = useState<string>('en')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUserLang() {
      if (typeof window !== 'undefined') {
        const localLang = localStorage.getItem('chosen_language')
        if (localLang) {
          const val = localLang.toLowerCase().trim()
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === val || l.name.toLowerCase() === val
          )
          if (matched) setLangCode(matched.code)
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('chosen_language').eq('id', user.id).maybeSingle()
        if (data?.chosen_language) {
          const val = data.chosen_language.toLowerCase().trim()
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === val || l.name.toLowerCase() === val
          )
          if (matched) {
            setLangCode(matched.code)
          }
        }
      }
    }
    loadUserLang()
  }, [])

  const dict = getDictionary(langCode)


  const handleSave = async () => {
    setLoading(true)
    const val = selectedLang.toLowerCase().trim()
    const matched = SUPPORTED_LANGUAGES.find(
      l => l.code.toLowerCase() === val || l.name.toLowerCase() === val
    )
    const code = matched ? matched.code : 'en'

    if (typeof window !== 'undefined') {
      localStorage.setItem('chosen_language', code)
      document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('profiles')
        .upsert(
          { id: user.id, chosen_language: code },
          { onConflict: 'id' }
        )
      
      router.refresh()
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        <h1 className="text-4xl font-bold mb-4">{dict.languageSelect.chooseYourLanguage}</h1>
        <p className="text-gray-500 mb-10 text-lg">{dict.languageSelect.selectLanguageDesc}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {INDIAN_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedLang === lang 
                  ? 'border-saffron-500 bg-saffron-50 text-saffron-700 font-bold shadow-md' 
                  : 'border-gray-200 hover:border-saffron-300 hover:bg-gray-50'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-saffron-600 text-white font-bold py-4 px-12 rounded-full text-xl hover:bg-saffron-500 transition-transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? dict.languageSelect.saving : dict.languageSelect.continueToDashboard}
        </button>
      </div>
    </div>
  )
}
