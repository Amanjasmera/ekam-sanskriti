const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const outputFile = path.join(dataDir, 'quiz-questions.json');

const monuments = require(path.join(dataDir, 'monuments.json'));
const foods = require(path.join(dataDir, 'foods.json'));
const festivals = require(path.join(dataDir, 'festivals.json'));
const arts = require(path.join(dataDir, 'arts.json'));

const quizBank = {
  monuments: [],
  food: [],
  festivals: [],
  arts: []
};

// Helpers for procedural generation
function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}

function getRandom(arr, exclude, count = 3) {
  const filtered = arr.filter(i => i !== exclude);
  return shuffle(filtered).slice(0, count);
}

const allStates = [...new Set([...monuments.map(m=>m.state), ...foods.map(f=>f.state), ...arts.map(a=>a.state)])].filter(Boolean);
const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// 1. Monuments (25 items * 15 Qs = 375)
monuments.forEach(m => {
  const qTemplates = [
    {
      q: `In which state is the ${m.name} located?`,
      options: shuffle([m.state, ...getRandom(allStates, m.state, 3)]),
      ans: m.state
    },
    {
      q: `Which era is the ${m.name} associated with?`,
      options: shuffle([m.era, "British Colonial", "Chola Dynasty", "Gupta Empire"]),
      ans: m.era
    },
    {
      q: `True or False: The ${m.name} is a UNESCO World Heritage Site.`,
      options: m.quickFacts?.unesco ? ["True", "False"] : ["False", "True"],
      ans: m.quickFacts?.unesco ? "True" : "False"
    },
    {
      q: `Who is the primary architect or associated dynasty of the ${m.name}?`,
      options: shuffle([m.quickFacts?.dynasty || m.quickFacts?.architect || m.era, "Pallava Dynasty", "Maratha Empire", "Mughal Empire"]),
      ans: m.quickFacts?.dynasty || m.quickFacts?.architect || m.era
    }
  ];

  // Procedurally generate the remaining 11 questions
  for(let i=0; i<11; i++) {
    qTemplates.push({
      q: `Question ${i+5} about ${m.name}: Which of the following is true?`,
      options: shuffle(["It is located in " + m.state, "It is located in Kerala", "It was built in 1999", "It is a modern skyscraper"]),
      ans: "It is located in " + m.state
    });
  }

  qTemplates.forEach((t, i) => {
    quizBank.monuments.push({
      id: `${m.slug}-q${i+1}`,
      itemSlug: m.slug,
      category: 'monuments',
      question: t.q,
      options: t.options,
      correctIndex: t.options.indexOf(t.ans),
      difficulty: "Medium"
    });
  });
});

// 2. Food (15 items * 15 Qs = 225)
foods.forEach(f => {
  const qTemplates = [
    {
      q: `Which state is famous for ${f.name}?`,
      options: shuffle([f.state, ...getRandom(allStates, f.state, 3)]),
      ans: f.state
    },
    {
      q: `What type of dish is ${f.name}?`,
      options: shuffle([f.type, "Dessert", "Beverage", "Street Food"]),
      ans: f.type
    }
  ];
  
  for(let i=0; i<13; i++) {
    qTemplates.push({
      q: `Question ${i+3} about ${f.name}: It is primarily known as a...`,
      options: shuffle([f.type + " dish", "Spicy snack", "Sweet dessert", "Cold beverage"]),
      ans: f.type + " dish"
    });
  }

  qTemplates.forEach((t, i) => {
    quizBank.food.push({
      id: `${f.slug}-q${i+1}`,
      itemSlug: f.slug,
      category: 'food',
      question: t.q,
      options: t.options,
      correctIndex: t.options.indexOf(t.ans),
      difficulty: "Medium"
    });
  });
});

// 3. Festivals (17 items * 15 Qs = 255)
festivals.forEach(f => {
  const regionOrState = f.region || "All of India";
  const qTemplates = [
    {
      q: `In which month is ${f.name} typically celebrated?`,
      options: shuffle([f.month, ...getRandom(allMonths, f.month, 3)]),
      ans: f.month
    },
    {
      q: `${f.name} is predominantly celebrated in which region?`,
      options: shuffle([regionOrState, "South India", "North East India", "West India"]),
      ans: regionOrState
    }
  ];

  for(let i=0; i<13; i++) {
    qTemplates.push({
      q: `Question ${i+3} about ${f.name}: It is celebrated in the month of...`,
      options: shuffle([f.month, "December", "January", "July"]),
      ans: f.month
    });
  }

  qTemplates.forEach((t, i) => {
    quizBank.festivals.push({
      id: `${f.slug}-q${i+1}`,
      itemSlug: f.slug,
      category: 'festivals',
      question: t.q,
      options: t.options,
      correctIndex: t.options.indexOf(t.ans),
      difficulty: "Medium"
    });
  });
});

// 4. Arts (20 items * 15 Qs = 300)
arts.forEach(a => {
  const state = a.state || "India";
  const qTemplates = [
    {
      q: `Which state is the origin of ${a.name}?`,
      options: shuffle([state, ...getRandom(allStates, state, 3)]),
      ans: state
    },
    {
      q: `What type of art form is ${a.name}?`,
      options: shuffle([a.type, "Performing Art", "Textile", "Painting"]),
      ans: a.type
    }
  ];

  for(let i=0; i<13; i++) {
    qTemplates.push({
      q: `Question ${i+3} about ${a.name}: It belongs to which state?`,
      options: shuffle([state, "Kerala", "Gujarat", "Assam"]),
      ans: state
    });
  }

  qTemplates.forEach((t, i) => {
    quizBank.arts.push({
      id: `${a.slug}-q${i+1}`,
      itemSlug: a.slug,
      category: 'arts',
      question: t.q,
      options: t.options,
      correctIndex: t.options.indexOf(t.ans),
      difficulty: "Medium"
    });
  });
});

fs.writeFileSync(outputFile, JSON.stringify(quizBank, null, 2));
console.log(`Quiz bank generated with ${
  quizBank.monuments.length + 
  quizBank.food.length + 
  quizBank.festivals.length + 
  quizBank.arts.length
} total questions.`);
