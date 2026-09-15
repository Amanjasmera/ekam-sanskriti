import fs from 'fs';

const i18nFile = 'lib/i18n.ts';
let content = fs.readFileSync(i18nFile, 'utf8');

const translations = {
  en: `
  monumentDetail: {
    backToExplore: 'Back to Explore',
    unescoHeritage: 'UNESCO World Heritage',
    listen: 'Listen',
    watch: 'Watch',
    read: 'Read',
    audioNarration: 'Audio Narration',
    playingNarration: 'Playing Web Speech API narration...',
    clickToListen: 'Click play to listen to monument history.',
    speed: 'Speed:',
    narrationScriptText: 'Narration Script Text:',
    loadingSummary: 'Loading audio summary from Wikipedia...',
    summaryPrepared: 'Historical summary is being prepared.',
    documentarySlideshow: 'Documentary Slideshow',
    mute: 'Mute',
    unmute: 'Unmute',
    expandArticle: 'Expand Article',
    collapseArticle: 'Collapse Article',
    wikiSections: 'Wikipedia Article Sections',
    monumentNotFound: 'Monument Not Found',
    monumentNotFoundDesc: 'The requested monument details could not be located.',
    returnToExplore: 'Return to Explore Monuments',
    youMightAlsoLike: 'You Might Also Like',
    addedToJourney: 'added to your Journey!',
    saveToJourney: 'Save to Journey',
    shareViaWhatsApp: 'Share via WhatsApp',
    share: 'Share'
  },
  languageSelect: {
    chooseYourLanguage: 'Choose Your Language',
    selectLanguageDesc: 'Select the language you prefer for your Ekam Sanskriti experience.',
    saving: 'Saving...',
    continueToDashboard: 'Continue to Dashboard'
  },`,
  hi: `
  monumentDetail: {
    backToExplore: 'खोज पर वापस जाएं',
    unescoHeritage: 'यूनेस्को विश्व धरोहर',
    listen: 'सुनें',
    watch: 'देखें',
    read: 'पढ़ें',
    audioNarration: 'ऑडियो कथन',
    playingNarration: 'ऑडियो चल रहा है...',
    clickToListen: 'स्मारक का इतिहास सुनने के लिए प्ले पर क्लिक करें।',
    speed: 'गति:',
    narrationScriptText: 'कथन की स्क्रिप्ट:',
    loadingSummary: 'विकिपीडिया से सारांश लोड हो रहा है...',
    summaryPrepared: 'ऐतिहासिक सारांश तैयार किया जा रहा है।',
    documentarySlideshow: 'डॉक्यूमेंट्री स्लाइड शो',
    mute: 'म्यूट',
    unmute: 'अनम्यूट',
    expandArticle: 'लेख का विस्तार करें',
    collapseArticle: 'लेख संक्षिप्त करें',
    wikiSections: 'विकिपीडिया लेख अनुभाग',
    monumentNotFound: 'स्मारक नहीं मिला',
    monumentNotFoundDesc: 'अनुरोधित स्मारक का विवरण नहीं मिल सका।',
    returnToExplore: 'स्मारकों की खोज पर लौटें',
    youMightAlsoLike: 'आपको यह भी पसंद आ सकता है',
    addedToJourney: 'आपकी यात्रा में जोड़ा गया!',
    saveToJourney: 'यात्रा में सहेजें',
    shareViaWhatsApp: 'व्हाट्सएप के माध्यम से साझा करें',
    share: 'साझा करें'
  },
  languageSelect: {
    chooseYourLanguage: 'अपनी भाषा चुनें',
    selectLanguageDesc: 'एकं संस्कृति अनुभव के लिए अपनी पसंदीदा भाषा चुनें।',
    saving: 'सहेजा जा रहा है...',
    continueToDashboard: 'डैशबोर्ड पर जारी रखें'
  },`,
  ta: `
  monumentDetail: {
    backToExplore: 'ஆய்வுக்குத் திரும்பு',
    unescoHeritage: 'யுனெஸ்கோ உலக மரபு',
    listen: 'கேட்க',
    watch: 'பார்க்க',
    read: 'படிக்க',
    audioNarration: 'ஆடியோ வர்ணனை',
    playingNarration: 'ஆடியோ ஒலிக்கிறது...',
    clickToListen: 'நினைவுச்சின்னத்தின் வரலாற்றைக் கேட்க பிளே என்பதைக் கிளிக் செய்யவும்.',
    speed: 'வேகம்:',
    narrationScriptText: 'வர்ணனை உரை:',
    loadingSummary: 'விக்கிபீடியாவில் இருந்து சுருக்கம் ஏற்றப்படுகிறது...',
    summaryPrepared: 'வரலாற்று சுருக்கம் தயாராகிறது.',
    documentarySlideshow: 'ஆவணப் படவில்லைகள்',
    mute: 'ஒலி அடக்கு',
    unmute: 'ஒலி இயக்கு',
    expandArticle: 'கட்டுரையை விரிவாக்கு',
    collapseArticle: 'கட்டுரையை சுருக்கு',
    wikiSections: 'விக்கிபீடியா கட்டுரை பிரிவுகள்',
    monumentNotFound: 'நினைவுச்சின்னம் கிடைக்கவில்லை',
    monumentNotFoundDesc: 'கோரப்பட்ட நினைவுச்சின்னத்தின் விவரங்களைக் காணவில்லை.',
    returnToExplore: 'நினைவுச்சின்னங்கள் ஆய்வுக்குத் திரும்பு',
    youMightAlsoLike: 'உங்களுக்கும் இது பிடிக்கலாம்',
    addedToJourney: 'உங்கள் பயணத்தில் சேர்க்கப்பட்டது!',
    saveToJourney: 'பயணத்தில் சேமி',
    shareViaWhatsApp: 'வாட்ஸ்அப் மூலம் பகிரவும்',
    share: 'பகிரவும்'
  },
  languageSelect: {
    chooseYourLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    selectLanguageDesc: 'ஏகம் சமஸ்கிருதி அனுபவத்திற்கு நீங்கள் விரும்பும் மொழியைத் தேர்ந்தெடுக்கவும்.',
    saving: 'சேமிக்கிறது...',
    continueToDashboard: 'டாஷ்போர்டுக்குத் தொடரவும்'
  },`,
  te: `
  monumentDetail: {
    backToExplore: 'అన్వేషణకు తిరిగి వెళ్లండి',
    unescoHeritage: 'యునెస్కో ప్రపంచ వారసత్వం',
    listen: 'వినండి',
    watch: 'చూడండి',
    read: 'చదవండి',
    audioNarration: 'ఆడియో వ్యాఖ్యానం',
    playingNarration: 'ఆడియో ప్లే అవుతోంది...',
    clickToListen: 'స్మారక చిహ్నం చరిత్రను వినడానికి ప్లే క్లిక్ చేయండి.',
    speed: 'వేగం:',
    narrationScriptText: 'వ్యాఖ్యానం వచనం:',
    loadingSummary: 'వికీపీడియా నుండి సారాంశం లోడ్ అవుతోంది...',
    summaryPrepared: 'చారిత్రక సారాంశం సిద్ధమవుతోంది.',
    documentarySlideshow: 'డాక్యుమెంటరీ స్లైడ్‌షో',
    mute: 'మ్యూట్',
    unmute: 'అన్‌మ్యూట్',
    expandArticle: 'వ్యాసాన్ని విస్తరించండి',
    collapseArticle: 'వ్యాసాన్ని కుదించండి',
    wikiSections: 'వికీపీడియా వ్యాస విభాగాలు',
    monumentNotFound: 'స్మారక చిహ్నం కనుగొనబడలేదు',
    monumentNotFoundDesc: 'అభ్యర్థించిన స్మారక చిహ్నం వివరాలు కనుగొనబడలేదు.',
    returnToExplore: 'స్మారక చిహ్నాల అన్వేషణకు తిరిగి వెళ్లండి',
    youMightAlsoLike: 'మీకు ఇది కూడా నచ్చవచ్చు',
    addedToJourney: 'మీ ప్రయాణంలో జోడించబడింది!',
    saveToJourney: 'ప్రయాణంలో సేవ్ చేయండి',
    shareViaWhatsApp: 'వాట్సాప్ ద్వారా పంచుకోండి',
    share: 'పంచుకోండి'
  },
  languageSelect: {
    chooseYourLanguage: 'మీ భాషను ఎంచుకోండి',
    selectLanguageDesc: 'ఏకం సంస్కృతి అనుభవం కోసం మీకు ఇష్టమైన భాషను ఎంచుకోండి.',
    saving: 'సేవ్ అవుతోంది...',
    continueToDashboard: 'డాష్‌బోర్డ్‌కు కొనసాగండి'
  },`,
  bn: `
  monumentDetail: {
    backToExplore: 'অনুসন্ধানে ফিরে যান',
    unescoHeritage: 'ইউনেস্কো বিশ্ব ঐতিহ্য',
    listen: 'শুনুন',
    watch: 'দেখুন',
    read: 'পড়ুন',
    audioNarration: 'অডিও বর্ণনা',
    playingNarration: 'অডিও চলছে...',
    clickToListen: 'স্মৃতিস্তম্ভের ইতিহাস শুনতে প্লে ক্লিক করুন।',
    speed: 'গতি:',
    narrationScriptText: 'বর্ণনা পাঠ্য:',
    loadingSummary: 'উইকিপিডিয়া থেকে সারাংশ লোড হচ্ছে...',
    summaryPrepared: 'ঐতিহাসিক সারাংশ প্রস্তুত করা হচ্ছে।',
    documentarySlideshow: 'তথ্যচিত্র স্লাইডশো',
    mute: 'মিউট',
    unmute: 'আনমিউট',
    expandArticle: 'নিবন্ধ প্রসারিত করুন',
    collapseArticle: 'নিবন্ধ সঙ্কুচিত করুন',
    wikiSections: 'উইকিপিডিয়া নিবন্ধ বিভাগ',
    monumentNotFound: 'স্মৃতিস্তম্ভ পাওয়া যায়নি',
    monumentNotFoundDesc: 'অনুরোধকৃত স্মৃতিস্তম্ভের বিবরণ পাওয়া যায়নি।',
    returnToExplore: 'স্মৃতিস্তম্ভ অনুসন্ধানে ফিরে যান',
    youMightAlsoLike: 'আপনার এটাও পছন্দ হতে পারে',
    addedToJourney: 'আপনার যাত্রায় যোগ করা হয়েছে!',
    saveToJourney: 'যাত্রায় সংরক্ষণ করুন',
    shareViaWhatsApp: 'হোয়াটসঅ্যাপের মাধ্যমে শেয়ার করুন',
    share: 'শেয়ার করুন'
  },
  languageSelect: {
    chooseYourLanguage: 'আপনার ভাষা নির্বাচন করুন',
    selectLanguageDesc: 'একম সংস্কৃতি অভিজ্ঞতার জন্য আপনার পছন্দের ভাষা নির্বাচন করুন।',
    saving: 'সংরক্ষণ করা হচ্ছে...',
    continueToDashboard: 'ড্যাশবোর্ডে চালিয়ে যান'
  },`
};

for (const lang of Object.keys(translations)) {
  const marker = `const ${lang}: Dictionary = {`;
  const insertIndex = content.indexOf(marker);
  if (insertIndex !== -1) {
    const afterMarker = insertIndex + marker.length;
    content = content.slice(0, afterMarker) + translations[lang] + content.slice(afterMarker);
  }
}

fs.writeFileSync(i18nFile, content);
console.log('Translations added successfully.');
