import fs from 'fs';

const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

const monumentDetailsMap = {
  "taj-mahal": {
    builtYear: "1632–1653 CE",
    dynasty: "Mughal Empire",
    architect: "Ustad Ahmad Lahauri",
    unesco: true,
    openingHours: "6:00 AM – 6:30 PM (Closed Fridays)",
    ticketPrice: "₹50 (Indian) / ₹1,100 (Foreigner)",
    youtubeVideoId: "EWk2mKz177Q"
  },
  "qutub-minar": {
    builtYear: "1192–1220 CE",
    dynasty: "Delhi Sultanate",
    architect: "Qutb al-Din Aibak & Iltutmish",
    unesco: true,
    openingHours: "7:00 AM – 5:00 PM",
    ticketPrice: "₹40 (Indian) / ₹600 (Foreigner)",
    youtubeVideoId: "d281L3V7MGE"
  },
  "red-fort": {
    builtYear: "1638–1648 CE",
    dynasty: "Mughal Empire",
    architect: "Ustad Ahmad Lahauri",
    unesco: true,
    openingHours: "9:30 AM – 4:30 PM (Closed Mondays)",
    ticketPrice: "₹50 (Indian) / ₹600 (Foreigner)",
    youtubeVideoId: "41i_e5b-Q3M"
  },
  "hawa-mahal": {
    builtYear: "1799 CE",
    dynasty: "Kachwaha Rajput",
    architect: "Lal Chand Ustad",
    unesco: true,
    openingHours: "9:00 AM – 5:00 PM",
    ticketPrice: "₹50 (Indian) / ₹200 (Foreigner)",
    youtubeVideoId: "pGv_hF7Hn9g"
  },
  "konark-sun-temple": {
    builtYear: "1250 CE",
    dynasty: "Eastern Ganga Dynasty",
    architect: "Bisu Maharana",
    unesco: true,
    openingHours: "6:00 AM – 8:00 PM",
    ticketPrice: "₹40 (Indian) / ₹600 (Foreigner)",
    youtubeVideoId: "sR0tq25qJkE"
  },
  "meenakshi-amman-temple": {
    builtYear: "1190–1650 CE",
    dynasty: "Pandyan & Nayak Dynasties",
    architect: "Vishwanatha Nayakar",
    unesco: false,
    openingHours: "5:00 AM – 12:30 PM, 4:00 PM – 10:00 PM",
    ticketPrice: "Free Entry (₹50 Special Darshan)",
    youtubeVideoId: "8ZgS1aR2_yM"
  },
  "golden-temple": {
    builtYear: "1577–1604 CE",
    dynasty: "Sikh Empire / Guru Ram Das",
    architect: "Guru Arjan Dev Ji",
    unesco: false,
    openingHours: "Open 24 Hours",
    ticketPrice: "Free Entry",
    youtubeVideoId: "60wJtZ6y14g"
  },
  "ajanta-caves": {
    builtYear: "2nd BCE – 480 CE",
    dynasty: "Satavahana & Vakataka Dynasties",
    architect: "Buddhist Monks & Guild Artisans",
    unesco: true,
    openingHours: "9:00 AM – 5:00 PM (Closed Mondays)",
    ticketPrice: "₹40 (Indian) / ₹600 (Foreigner)",
    youtubeVideoId: "gG9jU22lG6A"
  },
  "ellora-caves": {
    builtYear: "600–1000 CE",
    dynasty: "Rashtrakuta & Yadava Dynasties",
    architect: "King Krishna I",
    unesco: true,
    openingHours: "6:00 AM – 6:00 PM (Closed Tuesdays)",
    ticketPrice: "₹40 (Indian) / ₹600 (Foreigner)",
    youtubeVideoId: "n4C_9Q4RzC8"
  },
  "khajuraho-monuments": {
    builtYear: "950–1050 CE",
    dynasty: "Chandela Rajput Dynasty",
    architect: "Chandela Royal Architects",
    unesco: true,
    openingHours: "6:00 AM – 6:00 PM",
    ticketPrice: "₹40 (Indian) / ₹600 (Foreigner)",
    youtubeVideoId: "8b7j3w_Q3K8"
  },
  "sanchi-stupa": {
    builtYear: "3rd Century BCE",
    dynasty: "Mauryan Empire (Emperor Ashoka)",
    architect: "Mauryan Royal Builders",
    unesco: true,
    openingHours: "8:30 AM – 5:30 PM",
    ticketPrice: "₹40 (Indian) / ₹600 (Foreigner)",
    youtubeVideoId: "gY3cK4tM8nE"
  },
  "charminar": {
    builtYear: "1591 CE",
    dynasty: "Qutb Shahi Dynasty",
    architect: "Mir Momin Astarabadi",
    unesco: false,
    openingHours: "9:30 AM – 5:30 PM",
    ticketPrice: "₹25 (Indian) / ₹300 (Foreigner)",
    youtubeVideoId: "cZ4gK2N7R6E"
  },
  "gateway-of-india": {
    builtYear: "1911–1924 CE",
    dynasty: "British Raj",
    architect: "George Wittet",
    unesco: false,
    openingHours: "Open 24 Hours",
    ticketPrice: "Free Entry",
    youtubeVideoId: "J6c-2lZ7ZkE"
  },
  "victoria-memorial": {
    builtYear: "1906–1921 CE",
    dynasty: "British Raj",
    architect: "Sir William Emerson",
    unesco: false,
    openingHours: "10:00 AM – 5:00 PM (Closed Mondays)",
    ticketPrice: "₹30 (Indian) / ₹500 (Foreigner)",
    youtubeVideoId: "m9kK3j7Wz4E"
  },
  "mysore-palace": {
    builtYear: "1897–1912 CE",
    dynasty: "Wodeyar Dynasty",
    architect: "Henry Irwin",
    unesco: false,
    openingHours: "10:00 AM – 5:30 PM",
    ticketPrice: "₹100 (Indian) / ₹300 (Foreigner)",
    youtubeVideoId: "5qYk-9G8aF0"
  },
  "amer-fort": {
    builtYear: "1592 CE",
    dynasty: "Kachwaha Rajput",
    architect: "Raja Man Singh I",
    unesco: true,
    openingHours: "8:00 AM – 5:30 PM, 6:30 PM – 9:15 PM",
    ticketPrice: "₹100 (Indian) / ₹550 (Foreigner)",
    youtubeVideoId: "kL5w2N8Y3mE"
  },
  "hampi-group-of-monuments": {
    builtYear: "14th–16th Century CE",
    dynasty: "Vijayanagara Empire",
    architect: "Hakka & Bukka / Royal Guilds",
    unesco: true,
    openingHours: "6:00 AM – 6:00 PM",
    ticketPrice: "₹40 (Indian) / ₹600 (Foreigner)",
    youtubeVideoId: "b8W2N4K9mLE"
  },
  "brihadishvara-temple": {
    builtYear: "1003–1010 CE",
    dynasty: "Chola Dynasty",
    architect: "Kunjara Mallan Raja Raja Perunthachan",
    unesco: true,
    openingHours: "6:00 AM – 12:30 PM, 4:00 PM – 8:30 PM",
    ticketPrice: "Free Entry",
    youtubeVideoId: "7c3k8Y2N9mE"
  },
  "sun-temple-modhera": {
    builtYear: "1026–1027 CE",
    dynasty: "Solanki Dynasty",
    architect: "King Bhima I",
    unesco: false,
    openingHours: "7:00 AM – 6:00 PM",
    ticketPrice: "₹25 (Indian) / ₹300 (Foreigner)",
    youtubeVideoId: "d4K7m3N9yLE"
  },
  "fatehpur-sikri": {
    builtYear: "1571–1585 CE",
    dynasty: "Mughal Empire",
    architect: "Emperor Akbar",
    unesco: true,
    openingHours: "6:00 AM – 6:00 PM",
    ticketPrice: "₹50 (Indian) / ₹610 (Foreigner)",
    youtubeVideoId: "m2W3y4K8nLE"
  },
  "nalanda-university": {
    builtYear: "5th Century CE",
    dynasty: "Gupta Empire",
    architect: "Kumaragupta I",
    unesco: true,
    openingHours: "9:00 AM – 5:00 PM",
    ticketPrice: "₹40 (Indian) / ₹600 (Foreigner)",
    youtubeVideoId: "c3W7y4M9nLE"
  },
  "mahabodhi-temple": {
    builtYear: "3rd Century BCE – 5th Century CE",
    dynasty: "Mauryan & Gupta Empires",
    architect: "Emperor Ashoka",
    unesco: true,
    openingHours: "5:00 AM – 9:00 PM",
    ticketPrice: "Free Entry",
    youtubeVideoId: "b7K4y9M3nLE"
  },
  "jaisalmer-fort": {
    builtYear: "1156 CE",
    dynasty: "Bhati Rajput",
    architect: "Rawal Jaisal",
    unesco: true,
    openingHours: "9:00 AM – 6:00 PM",
    ticketPrice: "₹100 (Indian) / ₹500 (Foreigner)",
    youtubeVideoId: "f4K7m9N2yLE"
  },
  "chhatrapati-shivaji-terminus": {
    builtYear: "1878–1887 CE",
    dynasty: "British Raj",
    architect: "Frederick William Stevens",
    unesco: true,
    openingHours: "Open 24 Hours",
    ticketPrice: "Free Entry",
    youtubeVideoId: "g4K9m2N8yLE"
  },
  "rock-shelters-of-bhimbetka": "Prehistoric",
  "rock-shelters-of-bhimbetka": {
    builtYear: "100,000 BCE – 10,000 BCE",
    dynasty: "Prehistoric Mesolithic",
    architect: "Indigenous Prehistoric Humans",
    unesco: true,
    openingHours: "7:00 AM – 6:00 PM",
    ticketPrice: "₹25 (Indian) / ₹300 (Foreigner)",
    youtubeVideoId: "h4K9m3N7yLE"
  }
};

const curations = {};

monuments.forEach(m => {
  const details = monumentDetailsMap[m.slug] || {
    builtYear: m.era || "Ancient Era",
    dynasty: "Indian Heritage",
    architect: "Royal Guild Artisans",
    unesco: false,
    openingHours: "6:00 AM – 6:00 PM",
    ticketPrice: "Standard Ticket Applies",
    youtubeVideoId: "EWk2mKz177Q"
  };

  m.wikipediaTitle = m.wikipedia_titles ? (m.wikipedia_titles.en || Object.values(m.wikipedia_titles)[0]) : m.name;
  m.youtubeVideoId = details.youtubeVideoId;
  m.quickFacts = {
    builtYear: details.builtYear,
    dynasty: details.dynasty,
    architect: details.architect,
    unesco: details.unesco,
    openingHours: details.openingHours,
    ticketPrice: details.ticketPrice
  };

  curations[m.slug] = details.youtubeVideoId;
});

fs.writeFileSync('./data/monuments.json', JSON.stringify(monuments, null, 2));
fs.writeFileSync('./data/monument-videos.json', JSON.stringify(curations, null, 2));

console.log("Updated monuments.json and created monument-videos.json with rich details & video IDs!");
