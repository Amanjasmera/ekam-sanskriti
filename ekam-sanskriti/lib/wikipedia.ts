export interface WikiSummary {
  title: string
  displaytitle?: string
  extract: string
  description?: string
  thumbnail?: {
    source: string
    width: number
    height: number
  }
  originalimage?: {
    source: string
    width: number
    height: number
  }
  content_urls?: {
    desktop: {
      page: string
    }
  }
  lang?: string
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', speechTag: 'en-IN' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speechTag: 'hi-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speechTag: 'bn-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speechTag: 'te-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speechTag: 'mr-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechTag: 'ta-IN' },
  { code: 'ur', name: 'Urdu', native: 'اردو', speechTag: 'ur-PK' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechTag: 'gu-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speechTag: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', speechTag: 'ml-IN' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', speechTag: 'or-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', speechTag: 'pa-IN' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', speechTag: 'as-IN' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', speechTag: 'ne-NP' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', speechTag: 'sa-IN' },
  { code: 'sd', name: 'Sindhi', native: 'सिन्धी', speechTag: 'sd-IN' },
  { code: 'ks', name: 'Kashmiri', native: 'कश्मीरी', speechTag: 'ks-IN' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', speechTag: 'kok-IN' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', speechTag: 'doi-IN' },
  { code: 'mni', name: 'Manipuri', native: 'मणिपुरी', speechTag: 'mni-IN' },
  { code: 'sat', name: 'Santali', native: 'সংতালী', speechTag: 'sat-IN' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', speechTag: 'mai-IN' },
  { code: 'bodo', name: 'Bodo', native: 'बोडो', speechTag: 'bodo-IN' },
]

export function getLanguageSpeechTag(langCode: string): string {
  const found = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
  return found ? found.speechTag : 'en-IN'
}

/**
 * Transforms any image URL into a high-res image URL with category fallbacks.
 */
export function getHighResImageUrl(url: string | null | undefined, category?: string): string {
  const cat = (category || '').toLowerCase()
  const defaultFallback = cat.includes('food') 
    ? '/images/fallback-food.jpg' 
    : cat.includes('fest') 
    ? '/images/fallback-festival.jpg' 
    : '/images/fallback-monument.jpg'

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return defaultFallback
  }
  let cleanUrl = url.trim()

  if (cleanUrl.length < 10) {
    return defaultFallback
  }

  // Fix Wikipedia thumbnail URLs (/50px-, /100px-, /200px-, /300px- to /800px-)
  if (cleanUrl.includes('upload.wikimedia.org')) {
    cleanUrl = cleanUrl.replace(/\/\d+px-/g, '/800px-')
  }

  // Ensure Unsplash images request high width & quality
  if (cleanUrl.includes('images.unsplash.com')) {
    if (!cleanUrl.includes('w=')) {
      cleanUrl = cleanUrl.includes('?') 
        ? `${cleanUrl}&w=800&q=80&auto=format&fit=crop`
        : `${cleanUrl}?w=800&q=80&auto=format&fit=crop`
    }
  }

  return cleanUrl
}

/**
 * Fetches Wikipedia Summary REST API
 */
export async function getWikiContent(title: string, lang = 'en'): Promise<WikiSummary | null> {
  if (!title) return null
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = await res.json()
    const imageUrl = data.originalimage?.source || data.thumbnail?.source || null
    console.log("Fetched image URL for Wikipedia title:", title, imageUrl)
    return { ...data, lang }
  } catch (error) {
    console.error(`Wikipedia API error for ${title} (${lang}):`, error)
    return null
  }
}

/**
 * Fetches Wikipedia Full Details API with 800px high-resolution thumbnail request
 */
export async function getWikiDetails(title: string, lang = 'en') {
  if (!title) return null
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|coordinates&titles=${encodeURIComponent(title)}&pithumbsize=800&format=json&origin=*&exintro=1&explaintext=1`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = await res.json()
    console.log("Fetched WikiDetails for title:", title, data)
    return data
  } catch (error) {
    console.error(`Wikipedia Details API error for ${title} (${lang}):`, error)
    return null
  }
}

/**
 * Client-side cached fetch from localStorage (30 days TTL)
 */
export async function getWikiSummaryWithCache(
  wikipediaTitles: Record<string, string> = {},
  lang = 'en'
): Promise<WikiSummary | null> {
  // Normalize language input (e.g. 'Marathi' -> 'mr', 'Hindi' -> 'hi')
  let langCode = (lang || 'en').toLowerCase().trim()
  const matched = SUPPORTED_LANGUAGES.find(
    l => l.code === langCode || l.name.toLowerCase() === langCode
  )
  if (matched) {
    langCode = matched.code
  }

  // Determine target Wikipedia article title
  const targetTitle = wikipediaTitles[langCode] || wikipediaTitles['en'] || Object.values(wikipediaTitles)[0]

  if (!targetTitle) return null

  const cacheKey = `wiki_${langCode}_${targetTitle}`

  if (typeof window !== 'undefined') {
    try {
      const cachedStr = localStorage.getItem(cacheKey)
      if (cachedStr) {
        const cached = JSON.parse(cachedStr)
        const age = Date.now() - cached.timestamp
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
        if (age < thirtyDaysMs && cached.data) {
          return cached.data
        }
      }
    } catch (e) {
      console.warn('localStorage read error:', e)
    }
  }

  // 1. Try live fetch from target language Wikipedia subdomain
  let summary = await getWikiContent(targetTitle, langCode)

  // 2. If target language Wikipedia fetch fails and language is not English, fallback to English Wikipedia
  if (!summary && langCode !== 'en') {
    const enTitle = wikipediaTitles['en'] || targetTitle
    summary = await getWikiContent(enTitle, 'en')
  }

  if (summary && typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data: summary, timestamp: Date.now() })
      )
    } catch (e) {
      console.warn('localStorage write error:', e)
    }
  }

  return summary
}
