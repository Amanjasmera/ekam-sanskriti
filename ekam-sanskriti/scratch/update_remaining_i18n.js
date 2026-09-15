import fs from 'fs';
import path from 'path';

const i18nPath = path.join(process.cwd(), 'lib', 'i18n.ts');
let content = fs.readFileSync(i18nPath, 'utf-8');

// Define the English additions
const additionsEn = {
  scannerPage: {
    title: 'Monument QR Scanner',
    subtitle: 'Scan a QR code at any heritage site to instantly access its history, audio guide, and details.',
    scanSuccess: 'Scan Successful!',
    demoTitle: 'Demo QR Codes (For Testing)',
    demoSubtitle: 'You can test this feature by generating QR codes for:'
  },
  cultureCraftPage: {
    title: 'Culture & Craft',
    subtitle: 'Discover authentic Indian handicrafts sourced directly from verified artisans. Purchase unique pieces or learn the ancient techniques behind them.',
    noProducts: 'No products or courses yet.',
    noProductsSub: 'Artists, upload your first creation and share your heritage with the world!',
    becomeArtist: 'Become an Artist',
    learnArtisans: 'Learn from Master Artisans',
    viewAll: 'View All'
  },
  mapPage: {
    title: 'Interactive Heritage Map',
    allEras: 'All Eras',
    ancient: 'Ancient',
    medieval: 'Medieval',
    modern: 'Modern',
    allTypes: 'All Types',
    monument: 'Monument',
    food: 'Food',
    festival: 'Festival'
  }
};

const additionsHi = {
  scannerPage: {
    title: 'स्मारक क्यूआर स्कैनर',
    subtitle: 'किसी भी विरासत स्थल का इतिहास, ऑडियो गाइड और विवरण तुरंत प्राप्त करने के लिए क्यूआर कोड स्कैन करें।',
    scanSuccess: 'स्कैन सफल!',
    demoTitle: 'डेमो क्यूआर कोड (परीक्षण के लिए)',
    demoSubtitle: 'आप इनके लिए क्यूआर कोड जनरेट करके इस सुविधा का परीक्षण कर सकते हैं:'
  },
  cultureCraftPage: {
    title: 'संस्कृति और शिल्प',
    subtitle: 'सत्यापित कारीगरों से सीधे प्राप्त प्रामाणिक भारतीय हस्तशिल्प खोजें। अद्वितीय टुकड़े खरीदें या उनके पीछे की प्राचीन तकनीक सीखें।',
    noProducts: 'अभी तक कोई उत्पाद या पाठ्यक्रम नहीं।',
    noProductsSub: 'कलाकारों, अपनी पहली रचना अपलोड करें और दुनिया के साथ अपनी विरासत साझा करें!',
    becomeArtist: 'कलाकार बनें',
    learnArtisans: 'मास्टर कारीगरों से सीखें',
    viewAll: 'सभी देखें'
  },
  mapPage: {
    title: 'इंटरएक्टिव विरासत मानचित्र',
    allEras: 'सभी युग',
    ancient: 'प्राचीन',
    medieval: 'मध्यकालीन',
    modern: 'आधुनिक',
    allTypes: 'सभी प्रकार',
    monument: 'स्मारक',
    food: 'भोजन',
    festival: 'त्योहार'
  }
};

const additionsTa = {
  scannerPage: {
    title: 'நினைவுச்சின்னம் கியூஆர் ஸ்கேனர்',
    subtitle: 'எந்தவொரு பாரம்பரிய தளத்திலும் கியூஆர் குறியீட்டை ஸ்கேன் செய்து அதன் வரலாறு, ஆடியோ வழிகாட்டி மற்றும் விவரங்களை உடனடியாக அணுகவும்.',
    scanSuccess: 'ஸ்கேன் வெற்றி!',
    demoTitle: 'டெமோ கியூஆர் குறியீடுகள் (சோதனைக்கு)',
    demoSubtitle: 'இதற்கான கியூஆர் குறியீடுகளை உருவாக்குவதன் மூலம் இந்த அம்சத்தை நீங்கள் சோதிக்கலாம்:'
  },
  cultureCraftPage: {
    title: 'கலாச்சாரம் மற்றும் கைவினை',
    subtitle: 'சரிபார்க்கப்பட்ட கைவினைஞர்களிடமிருந்து நேரடியாக பெறப்பட்ட உண்மையான இந்திய கைவினைப்பொருட்களைக் கண்டறியவும். தனித்துவமான துண்டுகளை வாங்கவும் அல்லது அவற்றின் பின்னால் உள்ள பண்டைய நுட்பங்களை அறியவும்.',
    noProducts: 'இன்னும் தயாரிப்புகள் அல்லது படிப்புகள் இல்லை.',
    noProductsSub: 'கலைஞர்களே, உங்கள் முதல் படைப்பை பதிவேற்றி உங்கள் பாரம்பரியத்தை உலகத்துடன் பகிர்ந்து கொள்ளுங்கள்!',
    becomeArtist: 'கலைஞராகுங்கள்',
    learnArtisans: 'தலைசிறந்த கைவினைஞர்களிடமிருந்து கற்றுக்கொள்ளுங்கள்',
    viewAll: 'அனைத்தையும் காண்க'
  },
  mapPage: {
    title: 'ஊடாடும் பாரம்பரிய வரைபடம்',
    allEras: 'அனைத்து காலங்களும்',
    ancient: 'பண்டைய',
    medieval: 'இடைக்கால',
    modern: 'நவீன',
    allTypes: 'அனைத்து வகைகள்',
    monument: 'நினைவுச்சின்னம்',
    food: 'உணவு',
    festival: 'திருவிழா'
  }
};

const additionsTe = {
  scannerPage: {
    title: 'స్మారక క్యూఆర్ స్కానర్',
    subtitle: 'దాని చరిత్ర, ఆడియో గైడ్ మరియు వివరాలను తక్షణమే యాక్సెస్ చేయడానికి ఏదైనా వారసత్వ ప్రదేశంలో క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.',
    scanSuccess: 'స్కాన్ విజయవంతమైంది!',
    demoTitle: 'డెమో క్యూఆర్ కోడ్‌లు (పరీక్ష కోసం)',
    demoSubtitle: 'దీని కోసం క్యూఆర్ కోడ్‌లను సృష్టించడం ద్వారా మీరు ఈ ఫీచర్‌ను పరీక్షించవచ్చు:'
  },
  cultureCraftPage: {
    title: 'సంస్కృతి మరియు హస్తకళ',
    subtitle: 'ధృవీకరించబడిన కళాకారుల నుండి నేరుగా పొందిన ప్రామాణికమైన భారతీయ హస్తకళలను కనుగొనండి. ప్రత్యేకమైన ముక్కలను కొనుగోలు చేయండి లేదా వాటి వెనుక ఉన్న పురాతన పద్ధతులను నేర్చుకోండి.',
    noProducts: 'ఇంకా ఉత్పత్తులు లేదా కోర్సులు లేవు.',
    noProductsSub: 'కళాకారులారా, మీ మొదటి సృష్టిని అప్‌లోడ్ చేయండి మరియు మీ వారసత్వాన్ని ప్రపంచంతో పంచుకోండి!',
    becomeArtist: 'కళాకారుడిగా మారండి',
    learnArtisans: 'మాస్టర్ ఆర్టిసాన్స్ నుండి నేర్చుకోండి',
    viewAll: 'అన్నీ చూడండి'
  },
  mapPage: {
    title: 'ఇంటరాక్టివ్ హెరిటేజ్ మ్యాప్',
    allEras: 'అన్ని యుగాలు',
    ancient: 'ప్రాచీన',
    medieval: 'మధ్యయుగ',
    modern: 'ఆధునిక',
    allTypes: 'అన్ని రకాలు',
    monument: 'స్మారక చిహ్నం',
    food: 'ఆహారం',
    festival: 'పండుగ'
  }
};

const additionsBn = {
  scannerPage: {
    title: 'স্মৃতিস্তম্ভ কিউআর স্ক্যানার',
    subtitle: 'এর ইতিহাস, অডিও গাইড এবং বিবরণ অবিলম্বে অ্যাক্সেস করতে যেকোনো ঐতিহ্যবাহী স্থানে একটি কিউআর কোড স্ক্যান করুন।',
    scanSuccess: 'স্ক্যান সফল!',
    demoTitle: 'ডেমো কিউআর কোড (পরীক্ষার জন্য)',
    demoSubtitle: 'আপনি এর জন্য কিউআর কোড তৈরি করে এই বৈশিষ্ট্যটি পরীক্ষা করতে পারেন:'
  },
  cultureCraftPage: {
    title: 'সংস্কৃতি এবং হস্তশিল্প',
    subtitle: 'যাচাইকৃত কারিগরদের কাছ থেকে সরাসরি সংগৃহীত খাঁটি ভারতীয় হস্তশিল্প আবিষ্কার করুন। অনন্য টুকরো কিনুন বা তাদের পিছনের প্রাচীন কৌশলগুলি শিখুন।',
    noProducts: 'এখনও কোনও পণ্য বা কোর্স নেই।',
    noProductsSub: 'শিল্পীরা, আপনার প্রথম সৃষ্টি আপলোড করুন এবং বিশ্বের সাথে আপনার ঐতিহ্য শেয়ার করুন!',
    becomeArtist: 'শিল্পী হয়ে উঠুন',
    learnArtisans: 'মাস্টার কারিগরদের কাছ থেকে শিখুন',
    viewAll: 'সব দেখুন'
  },
  mapPage: {
    title: 'ইন্টারেক্টিভ হেরিটেজ ম্যাপ',
    allEras: 'সব যুগ',
    ancient: 'প্রাচীন',
    medieval: 'মধ্যযুগীয়',
    modern: 'আধুনিক',
    allTypes: 'সব ধরনের',
    monument: 'স্মৃতিস্তম্ভ',
    food: 'খাদ্য',
    festival: 'উৎসব'
  }
};

const defaultAdditions = additionsEn; // For other languages

// Step 1: Update the Dictionary Interface
const interfaceRegex = /export interface Dictionary {([\s\S]*?)\n}/;
const match = content.match(interfaceRegex);
if (match) {
  let interfaceBody = match[1];
  if (!interfaceBody.includes('scannerPage:')) {
    interfaceBody += `\n  scannerPage: {\n    title: string\n    subtitle: string\n    scanSuccess: string\n    demoTitle: string\n    demoSubtitle: string\n  }\n  cultureCraftPage: {\n    title: string\n    subtitle: string\n    noProducts: string\n    noProductsSub: string\n    becomeArtist: string\n    learnArtisans: string\n    viewAll: string\n  }\n  mapPage: {\n    title: string\n    allEras: string\n    ancient: string\n    medieval: string\n    modern: string\n    allTypes: string\n    monument: string\n    food: string\n    festival: string\n  }`;
    content = content.replace(interfaceRegex, `export interface Dictionary {${interfaceBody}\n}`);
  }
}

// Step 2: Update each language in DICTIONARIES
const languages = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'ne', 'sa', 'sd', 'ks', 'kok', 'doi', 'mni', 'sat', 'mai', 'bodo'];

const map = {
  en: additionsEn,
  hi: additionsHi,
  ta: additionsTa,
  te: additionsTe,
  bn: additionsBn
};

languages.forEach(lang => {
  const dict = map[lang] || defaultAdditions;
  
  // Find where this language block ends
  const langRegex = new RegExp(`  ${lang}: {([\\s\\S]*?)(?:\\n  },|\\n  })\\n`);
  const langMatch = content.match(langRegex);
  
  if (langMatch) {
    const langBody = langMatch[1];
    if (!langBody.includes('scannerPage:')) {
      const injectString = `
    scannerPage: {
      title: '${dict.scannerPage.title}',
      subtitle: '${dict.scannerPage.subtitle}',
      scanSuccess: '${dict.scannerPage.scanSuccess}',
      demoTitle: '${dict.scannerPage.demoTitle}',
      demoSubtitle: '${dict.scannerPage.demoSubtitle}'
    },
    cultureCraftPage: {
      title: '${dict.cultureCraftPage.title}',
      subtitle: '${dict.cultureCraftPage.subtitle}',
      noProducts: '${dict.cultureCraftPage.noProducts}',
      noProductsSub: '${dict.cultureCraftPage.noProductsSub}',
      becomeArtist: '${dict.cultureCraftPage.becomeArtist}',
      learnArtisans: '${dict.cultureCraftPage.learnArtisans}',
      viewAll: '${dict.cultureCraftPage.viewAll}'
    },
    mapPage: {
      title: '${dict.mapPage.title}',
      allEras: '${dict.mapPage.allEras}',
      ancient: '${dict.mapPage.ancient}',
      medieval: '${dict.mapPage.medieval}',
      modern: '${dict.mapPage.modern}',
      allTypes: '${dict.mapPage.allTypes}',
      monument: '${dict.mapPage.monument}',
      food: '${dict.mapPage.food}',
      festival: '${dict.mapPage.festival}'
    }`;
      content = content.replace(langRegex, `  ${lang}: {${langBody},${injectString}\n  },\n`);
    }
  }
});

fs.writeFileSync(i18nPath, content, 'utf-8');
console.log('Updated lib/i18n.ts with missing translations');
