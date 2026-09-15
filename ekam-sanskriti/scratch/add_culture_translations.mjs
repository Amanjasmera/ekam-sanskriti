import fs from 'fs';
import path from 'path';

const i18nPath = path.join(process.cwd(), 'lib', 'i18n.ts');
let content = fs.readFileSync(i18nPath, 'utf8');

const translations = {
  en: {
    cultureCraftPage: `
      launchingIn: 'Launching in {days} days',
      launchingTomorrow: 'Launching Tomorrow',
      launching: 'Launching {date}',
      lessons: 'Lessons',
      lesson: 'Lesson',
      beginner: 'Beginner',
      by: 'By',
      verifiedArtisan: 'Verified Artisan',
      free: 'Free',
      comingSoon: 'Coming Soon',
      startLearning: 'Start Learning',
      handcraftedBy: 'Handcrafted by Artisans',
      viewAll: 'View All',
      viewDetails: 'View Details',
      whatsapp: 'WhatsApp',
      india: 'India',
      enquireWhatsapp: 'Enquire on WhatsApp'
    `
  },
  hi: {
    cultureCraftPage: `
      launchingIn: 'लॉन्च हो रहा है {days} दिनों में',
      launchingTomorrow: 'कल लॉन्च हो रहा है',
      launching: 'लॉन्च हो रहा है {date}',
      lessons: 'पाठ',
      lesson: 'पाठ',
      beginner: 'शुरुआती',
      by: 'द्वारा',
      verifiedArtisan: 'सत्यापित कारीगर',
      free: 'मुफ़्त',
      comingSoon: 'जल्द आ रहा है',
      startLearning: 'सीखना शुरू करें',
      handcraftedBy: 'कारीगरों द्वारा हस्तनिर्मित',
      viewAll: 'सभी देखें',
      viewDetails: 'विवरण देखें',
      whatsapp: 'व्हाट्सएप',
      india: 'भारत',
      enquireWhatsapp: 'व्हाट्सएप पर पूछताछ करें'
    `
  },
  ta: {
    cultureCraftPage: `
      launchingIn: '{days} நாட்களில் தொடங்குகிறது',
      launchingTomorrow: 'நாளை தொடங்குகிறது',
      launching: '{date} அன்று தொடங்குகிறது',
      lessons: 'பாடங்கள்',
      lesson: 'பாடம்',
      beginner: 'தொடக்கக்காரர்',
      by: 'வழங்குபவர்',
      verifiedArtisan: 'சரிபார்க்கப்பட்ட கைவினைஞர்',
      free: 'இலவசம்',
      comingSoon: 'விரைவில் வருகிறது',
      startLearning: 'கற்கத் தொடங்கு',
      handcraftedBy: 'கைவினைஞர்களால் கையால் செய்யப்பட்டது',
      viewAll: 'அனைத்தையும் காண்க',
      viewDetails: 'விவரங்களைக் காண்க',
      whatsapp: 'வாட்ஸ்அப்',
      india: 'இந்தியா',
      enquireWhatsapp: 'வாட்ஸ்அப்பில் விசாரிக்கவும்'
    `
  },
  te: {
    cultureCraftPage: `
      launchingIn: '{days} రోజుల్లో ప్రారంభమవుతుంది',
      launchingTomorrow: 'రేపు ప్రారంభమవుతుంది',
      launching: '{date} న ప్రారంభమవుతుంది',
      lessons: 'పాఠాలు',
      lesson: 'పాఠం',
      beginner: 'ప్రారంభకుడు',
      by: 'ద్వారా',
      verifiedArtisan: 'ధృవీకరించబడిన కళాకారుడు',
      free: 'ఉచితం',
      comingSoon: 'త్వరలో వస్తుంది',
      startLearning: 'నేర్చుకోవడం ప్రారంభించండి',
      handcraftedBy: 'కళాకారులచే చేతితో తయారు చేయబడింది',
      viewAll: 'అన్నింటినీ చూడండి',
      viewDetails: 'వివరాలు చూడండి',
      whatsapp: 'వాట్సాప్',
      india: 'భారతదేశం',
      enquireWhatsapp: 'వాట్సాప్‌లో విచారించండి'
    `
  }
};

for (const [lang, blocks] of Object.entries(translations)) {
  const marker = `${lang}: {`;
  const index = content.indexOf(marker);
  if (index !== -1) {
    const cultureBlockIndex = content.indexOf('cultureCraftPage:', index);
    if (cultureBlockIndex !== -1) {
      const endBrace = content.indexOf('}', cultureBlockIndex);
      content = content.slice(0, endBrace) + ',' + blocks.cultureCraftPage + content.slice(endBrace);
    } else {
      console.log('Could not find cultureCraftPage for ' + lang);
    }
  }
}

fs.writeFileSync(i18nPath, content);
console.log('Done!');
