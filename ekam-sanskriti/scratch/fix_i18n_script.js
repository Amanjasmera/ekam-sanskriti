const fs = require('fs');
let content = fs.readFileSync('lib/i18n.ts', 'utf8');

const unifiedIndiaStr = `  unifiedIndia: {
    scriptures: 'Scriptures',
    readMore: 'Read More',
    keyTeachings: 'Key Teachings',
    period: 'Period',
    language: 'Language',
    listenToSummary: 'Listen to Summary',
    readFullOnWikipedia: 'Read Full Article on Wikipedia'
  },`;

// Replace NAME_TO_CODE which is unused
content = content.replace(/export const NAME_TO_CODE[^;]+;/, '');

// Add unifiedIndia to dictionaries where it's missing.
// A safe way is to split by `landingPage: {` and for each piece except the first, prepend if it doesn't already have it
const parts = content.split('landingPage: {');
let newContent = parts[0];
for (let i = 1; i < parts.length; i++) {
  const prevPart = parts[i - 1];
  if (!prevPart.includes('unifiedIndia: {')) {
    newContent += unifiedIndiaStr + '\n    landingPage: {';
  } else {
    newContent += 'landingPage: {';
  }
  newContent += parts[i];
}

fs.writeFileSync('lib/i18n.ts', newContent);
console.log('Fixed i18n.ts');
