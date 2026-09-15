import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const targetFile = path.resolve(__dirname, '../lib/i18n.ts')

let content = fs.readFileSync(targetFile, 'utf-8')

const newKeys = `  foodDetail: {
    backToFood: string;
    watchVideo: string;
    stepByStepRecipe: string;
    wikipedia: string;
    noVideo: string;
    prepTime: string;
    cookTime: string;
    servings: string;
    ingredients: string;
    instructions: string;
    stopAudio: string;
    readSteps: string;
    wikiSummary: string;
    loadingWiki: string;
  };
`

const englishValues = `    foodDetail: {
      backToFood: "Back to Food",
      watchVideo: "Watch Video",
      stepByStepRecipe: "Step-by-Step Recipe",
      wikipedia: "Wikipedia",
      noVideo: "No video available for this recipe yet.",
      prepTime: "Prep Time",
      cookTime: "Cook Time",
      servings: "Servings",
      ingredients: "Ingredients",
      instructions: "Instructions",
      stopAudio: "Stop Audio",
      readSteps: "Read Steps",
      wikiSummary: "Wikipedia Summary",
      loadingWiki: "Loading article from Wikipedia...",
    },
`

const hindiValues = `    foodDetail: {
      backToFood: "भोजन पर वापस जाएं",
      watchVideo: "वीडियो देखें",
      stepByStepRecipe: "क्रमबद्ध पकाने की विधि",
      wikipedia: "विकिपीडिया",
      noVideo: "इस नुस्खे के लिए अभी कोई वीडियो उपलब्ध नहीं है।",
      prepTime: "तैयारी का समय",
      cookTime: "पकाने का समय",
      servings: "परोसने की मात्रा",
      ingredients: "सामग्री",
      instructions: "निर्देश",
      stopAudio: "ऑडियो रोकें",
      readSteps: "निर्देश पढ़ें",
      wikiSummary: "विकिपीडिया सारांश",
      loadingWiki: "विकिपीडिया से लेख लोड हो रहा है...",
    },
`

const bengaliValues = `    foodDetail: {
      backToFood: "খাবারে ফিরে যান",
      watchVideo: "ভিডিও দেখুন",
      stepByStepRecipe: "ধাপে ধাপে রেসিপি",
      wikipedia: "উইকিপিডিয়া",
      noVideo: "এই রেসিপির জন্য এখনও কোনো ভিডিও নেই।",
      prepTime: "প্রস্তুতির সময়",
      cookTime: "রান্নার সময়",
      servings: "পরিবেশন",
      ingredients: "উপকরণ",
      instructions: "নির্দেশাবলী",
      stopAudio: "অডিও বন্ধ করুন",
      readSteps: "ধাপগুলো পড়ুন",
      wikiSummary: "উইকিপিডিয়া সারসংক্ষেপ",
      loadingWiki: "উইকিপিডিয়া থেকে নিবন্ধ লোড করা হচ্ছে...",
    },
`

const teluguValues = `    foodDetail: {
      backToFood: "ఆహారం వద్దకు తిరిగి వెళ్ళండి",
      watchVideo: "వీడియో చూడండి",
      stepByStepRecipe: "దశల వారీ వంటకం",
      wikipedia: "వికీపీడియా",
      noVideo: "ఈ వంటకానికి ఇంకా వీడియో అందుబాటులో లేదు.",
      prepTime: "సిద్ధం చేసే సమయం",
      cookTime: "వంట సమయం",
      servings: "వడ్డించే పరిమాణం",
      ingredients: "పదార్థాలు",
      instructions: "సూచనలు",
      stopAudio: "ఆడియో ఆపండి",
      readSteps: "దశలను చదవండి",
      wikiSummary: "వికీపీడియా సారాంశం",
      loadingWiki: "వికీపీడియా నుండి వ్యాసం లోడ్ అవుతోంది...",
    },
`

const marathiValues = `    foodDetail: {
      backToFood: "जेवणाकडे परत जा",
      watchVideo: "व्हिडिओ पहा",
      stepByStepRecipe: "टप्प्याटप्प्याने कृती",
      wikipedia: "विकिपीडिया",
      noVideo: "या कृतीसाठी अद्याप कोणताही व्हिडिओ उपलब्ध नाही.",
      prepTime: "तयारीची वेळ",
      cookTime: "स्वयंपाकाची वेळ",
      servings: "सर्व्हिंग",
      ingredients: "साहित्य",
      instructions: "सूचना",
      stopAudio: "ऑडिओ थांबवा",
      readSteps: "टप्पे वाचा",
      wikiSummary: "विकिपीडिया सारांश",
      loadingWiki: "विकिपीडियावरून लेख लोड करत आहे...",
    },
`

const tamilValues = `    foodDetail: {
      backToFood: "உணவுக்குத் திரும்பு",
      watchVideo: "வீடியோவைப் பார்",
      stepByStepRecipe: "படிப்படியான செய்முறை",
      wikipedia: "விக்கிபீடியா",
      noVideo: "இந்த செய்முறைக்கு இன்னும் வீடியோ கிடைக்கவில்லை.",
      prepTime: "தயாரிப்பு நேரம்",
      cookTime: "சமையல் நேரம்",
      servings: "பரிமாறல்கள்",
      ingredients: "தேவையான பொருட்கள்",
      instructions: "வழிமுறைகள்",
      stopAudio: "ஆடியோவை நிறுத்து",
      readSteps: "படிகளைப் படி",
      wikiSummary: "விக்கிபீடியா சுருக்கம்",
      loadingWiki: "விக்கிபீடியாவில் இருந்து கட்டுரை ஏற்றப்படுகிறது...",
    },
`

// Inject interface
if (!content.includes('foodDetail: {')) {
  content = content.replace('festivalDetail?: {', newKeys + '  festivalDetail?: {')
}

// Inject EN
if (!content.includes('foodDetail: {', content.indexOf('en: {'))) {
  content = content.replace(/en: {\s*sidebar: {/, englishValues + '\n    sidebar: {')
}
// Inject HI
if (!content.includes('foodDetail: {', content.indexOf('hi: {'))) {
  content = content.replace(/hi: {\s*sidebar: {/, hindiValues + '\n    sidebar: {')
}
// Inject BN
if (!content.includes('foodDetail: {', content.indexOf('bn: {'))) {
  content = content.replace(/bn: {\s*sidebar: {/, bengaliValues + '\n    sidebar: {')
}
// Inject TE
if (!content.includes('foodDetail: {', content.indexOf('te: {'))) {
  content = content.replace(/te: {\s*sidebar: {/, teluguValues + '\n    sidebar: {')
}
// Inject MR
if (!content.includes('foodDetail: {', content.indexOf('mr: {'))) {
  content = content.replace(/mr: {\s*sidebar: {/, marathiValues + '\n    sidebar: {')
}
// Inject TA
if (!content.includes('foodDetail: {', content.indexOf('ta: {'))) {
  content = content.replace(/ta: {\s*sidebar: {/, tamilValues + '\n    sidebar: {')
}

fs.writeFileSync(targetFile, content, 'utf-8')
console.log('Successfully added foodDetail translations!')
