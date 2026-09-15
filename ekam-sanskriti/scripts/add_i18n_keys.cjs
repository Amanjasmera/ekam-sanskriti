const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const lines = content.split('\n');
let result = [];

for (let i = 0; i < lines.length; i++) {
  result.push(lines[i]);
  
  const line = lines[i];
  
  // After artCraft value lines (not the interface definition)
  if (line.includes('artCraft:') && !line.includes('string') && line.includes("'")) {
    // Check if next 3 lines already have 'namaste'
    const nextFew = lines.slice(i+1, i+4).join('\n');
    if (nextFew.includes('namaste')) {
      continue;
    }
    
    // Inject new keys after artCraft
    const extras = [
      "      namaste: 'Namaste',",
      "      explorer: 'Cultural Explorer',",
      "      user: 'User',",
      "      discoverText: \"Discover India's monuments, food, and festivals in your chosen language.\",",
      "      goodMorning: 'Good Morning',",
      "      goodAfternoon: 'Good Afternoon',",
      "      goodEvening: 'Good Evening',",
      "      worldHeritage: 'World Heritage Sites in Wikipedia',",
      "      foodDesc: 'Traditional delicacies & regional recipes',",
      "      festivalsDesc: 'Colors, traditions & vibrant celebrations',",
      "      featuredContent: 'Featured Wikipedia Content',",
      "      loadingSummary: 'Loading summary...',",
      "      today: 'Today',",
      "      yesterday: 'Yesterday',",
      "      twoDaysAgo: '2 days ago',",
      "      threeDaysAgo: '3 days ago',",
      "      lastWeek: 'Last week',",
      "      activeLanguage: 'Active Language',",
      "      noQuizzesTaken: 'Take a quiz to see your progress here!',",
      "      averageScore: 'Average Score',",
    ];
    result.push(...extras);
  }
  
  // For common blocks, add explore after readOnWiki (if not already there)
  if (line.includes("readOnWiki:") && !line.includes('string')) {
    const nextLine = lines[i+1] || '';
    if (!nextLine.includes('explore:')) {
      result.push("      explore: 'Explore',");
    }
  }
}

content = result.join('\n');
fs.writeFileSync('lib/i18n.ts', content);
console.log('i18n.ts updated successfully.');

// Verify
const updated = fs.readFileSync('lib/i18n.ts', 'utf8');
const namesteCount = (updated.match(/namaste:/g) || []).length;
console.log('namaste: count:', namesteCount, '(should be 23+)');
