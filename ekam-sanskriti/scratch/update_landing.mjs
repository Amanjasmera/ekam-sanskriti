import fs from 'fs';

const i18nPath = './lib/i18n.ts';
let content = fs.readFileSync(i18nPath, 'utf-8');

const blocks = {
  landingPage: {
    en: `{
      loginSignUp: "Login / Sign Up",
      heroTitle: "Ekam ",
      heroTitleHighlight: "Sanskriti",
      heroSubtitle: "वसुधैव कुटुम्बकम्",
      heroDesc: "The World Is One Family. Experience the unity in diversity of Indian cultural heritage, monuments, foods, and festivals.",
      startExploring: "Start Exploring",
      exploreTitle: "Explore",
      exploreDesc: "Discover architectural marvels and monuments spanning history.",
      foodTitle: "Food",
      foodDesc: "Taste the rich culinary diversity from every state of India.",
      festivalsTitle: "Festivals",
      festivalsDesc: "Experience the vibrant celebrations that unite the nation.",
      learnTitle: "Art Learn",
      learnDesc: "Master traditional arts and crafts directly from the artisans."
    }`,
    hi: `{
      loginSignUp: "लॉगिन / साइन अप",
      heroTitle: "एकम ",
      heroTitleHighlight: "संस्कृति",
      heroSubtitle: "वसुधैव कुटुम्बकम्",
      heroDesc: "विश्व एक परिवार है। भारतीय सांस्कृतिक विरासत, स्मारकों, खाद्य पदार्थों और त्योहारों की विविधता में एकता का अनुभव करें।",
      startExploring: "अन्वेषण शुरू करें",
      exploreTitle: "अन्वेषण करें",
      exploreDesc: "इतिहास में फैले वास्तुकला के चमत्कार और स्मारकों की खोज करें।",
      foodTitle: "भोजन",
      foodDesc: "भारत के हर राज्य की समृद्ध पाक विविधता का स्वाद लें।",
      festivalsTitle: "त्योहार",
      festivalsDesc: "राष्ट्र को एकजुट करने वाले जीवंत समारोहों का अनुभव करें।",
      learnTitle: "कला सीखें",
      learnDesc: "कारीगरों से सीधे पारंपरिक कला और शिल्प सीखें।"
    }`
  }
};

const languages = ['en', 'hi'];

for (const lang of languages) {
  const dictMatch = new RegExp('const ' + lang + 'Dict = \\\\{([\\\\s\\\\S]*?)\\\\};\\\\n\\\\n');
  const match = content.match(dictMatch);
  
  if (match) {
    const dictContent = match[1];
    
    // Check if landingPage already exists
    if (!dictContent.includes('landingPage:')) {
      const insertionPoint = content.indexOf('}', match.index + match[0].length - 3);
      content = content.slice(0, insertionPoint) + ',\\n    landingPage: ' + blocks.landingPage[lang] + content.slice(insertionPoint);
    }
  }
}

fs.writeFileSync(i18nPath, content, 'utf-8');
console.log('Landing page translations injected successfully.');
