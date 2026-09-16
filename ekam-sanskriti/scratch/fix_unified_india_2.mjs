import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const i18nPath = path.join(__dirname, '../lib/i18n.ts');

let content = fs.readFileSync(i18nPath, 'utf8');

const unifiedIndiaProperty = `
    unifiedIndia: {
      scriptures: "Ancient Scriptures",
      readMore: "Read More",
      keyTeachings: "Key Teachings",
      period: "Period",
      language: "Language",
      listenToSummary: "Listen to Summary",
      readFullOnWikipedia: "Read Full on Wikipedia",
    },`;

// Language codes to inject for
const langCodes = ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'ne', 'sa', 'sd', 'ks', 'kok', 'doi', 'mni', 'sat', 'mai'];

for (const lang of langCodes) {
  // Find where this language object starts
  // Usually looks like: `  hi: {\n    landingPage: {`
  const searchStr = `  ${lang}: {\n    landingPage: {`;
  const replaceStr = `  ${lang}: {${unifiedIndiaProperty}\n    landingPage: {`;
  
  if (content.includes(searchStr) && !content.includes(`  ${lang}: {\n    unifiedIndia:`)) {
      content = content.replace(searchStr, replaceStr);
  } else {
      // Maybe different spacing? Let's use regex
      const regex = new RegExp(`  ${lang}: \\{[\\s\\n]*landingPage: \\{`, 'g');
      content = content.replace(regex, (match) => {
          return `  ${lang}: {${unifiedIndiaProperty}\n    landingPage: {`;
      });
  }
}

fs.writeFileSync(i18nPath, content, 'utf8');
console.log("Done");
