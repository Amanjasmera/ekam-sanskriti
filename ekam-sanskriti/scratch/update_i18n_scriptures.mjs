import fs from 'fs'

const i18nPath = 'd:/HAC/ekam-sanskriti/lib/i18n.ts'
let content = fs.readFileSync(i18nPath, 'utf8')

// 1. Add to Dictionary interface
if (!content.includes('unifiedIndia: {')) {
  content = content.replace('export interface Dictionary {', `export interface Dictionary {
  unifiedIndia: {
    scriptures: string;
    readMore: string;
    keyTeachings: string;
    period: string;
    language: string;
    listenToSummary: string;
    readFullOnWikipedia: string;
  };`)
}

// 2. Add to each language dictionary
const langCodes = [
  'en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu',
  'kn', 'ml', 'or', 'pa', 'as', 'ne', 'sa', 'sd',
  'ks', 'kok', 'doi', 'mni', 'sat', 'mai', 'bodo'
]

const translations = {
  en: {
    scriptures: "Scriptures",
    readMore: "Read More",
    keyTeachings: "Key Teachings",
    period: "Period",
    language: "Language",
    listenToSummary: "Listen to Summary",
    readFullOnWikipedia: "Read Full on Wikipedia"
  },
  hi: {
    scriptures: "धर्मग्रंथ",
    readMore: "और पढ़ें",
    keyTeachings: "प्रमुख शिक्षाएं",
    period: "काल",
    language: "भाषा",
    listenToSummary: "सारांश सुनें",
    readFullOnWikipedia: "विकिपीडिया पर पूरा पढ़ें"
  }
}

// Fallback all others to English
langCodes.forEach(lang => {
  const t = translations[lang] || translations.en
  const block = `  unifiedIndia: {
    scriptures: "${t.scriptures}",
    readMore: "${t.readMore}",
    keyTeachings: "${t.keyTeachings}",
    period: "${t.period}",
    language: "${t.language}",
    listenToSummary: "${t.listenToSummary}",
    readFullOnWikipedia: "${t.readFullOnWikipedia}"
  },`

  const regex = new RegExp(`export const ${lang}: Dictionary = \\{`)
  if (content.match(regex) && !content.includes(`export const ${lang}: Dictionary = {\\n  unifiedIndia`)) {
    content = content.replace(regex, `export const ${lang}: Dictionary = {\n${block}`)
  }
})

fs.writeFileSync(i18nPath, content)
console.log('i18n.ts updated with unifiedIndia translations successfully')
