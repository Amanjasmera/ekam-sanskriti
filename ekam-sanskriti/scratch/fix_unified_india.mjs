import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const i18nPath = path.join(__dirname, '../lib/i18n.ts');

let content = fs.readFileSync(i18nPath, 'utf8');

// The missing property is:
const unifiedIndiaProperty = `
  unifiedIndia: {
    scriptures: "Ancient Scriptures",
    readMore: "Read More",
    keyTeachings: "Key Teachings",
    period: "Period",
    language: "Language",
    listenToSummary: "Listen to Summary",
    readFullOnWikipedia: "Read Full on Wikipedia",
  },
`;

// regex to find all `landingPage:` that do not have `unifiedIndia:` before them (we need to inject it)
// we can just replace `landingPage: {` with the `unifiedIndia` object + `landingPage: {` for those languages that don't have it
// but let's be careful. Let's find all occurrences of `landingPage: {` which are top-level properties of a language dictionary.

// Since there are 22 languages, and we know the exact TS errors from line numbers:
// lib/i18n.ts(810,3) - hi
// lib/i18n.ts(1077,3) - bn
// lib/i18n.ts(1327,3) - te
// lib/i18n.ts(1577,3) - mr
// lib/i18n.ts(1827,3) - ta
// lib/i18n.ts(2077,3) - ur
// lib/i18n.ts(2327,3) - gu
// lib/i18n.ts(2577,3) - kn
// lib/i18n.ts(2827,3) - ml
// lib/i18n.ts(3077,3) - or
// lib/i18n.ts(3327,3) - pa
// lib/i18n.ts(3577,3) - as
// lib/i18n.ts(3827,3) - ne
// lib/i18n.ts(4077,3) - sa
// lib/i18n.ts(4327,3) - sd
// lib/i18n.ts(4577,3) - ks
// lib/i18n.ts(4827,3) - kok
// lib/i18n.ts(5077,3) - doi
// lib/i18n.ts(5327,3) - mni
// lib/i18n.ts(5577,3) - sat
// lib/i18n.ts(5827,3) - mai

// So we can just replace every `landingPage: {` inside the dictionaries.
// English (en) dictionary starts around line 550, and might already have it?
// Let's just do a global replace of `landingPage: {` with `unifiedIndiaProperty + landingPage: {`, but only if `unifiedIndia:` is not already there right before it.

let newContent = content;
const languageRegex = /(export const \w+ = \{[\s\S]*?)(landingPage: \{)/g;

newContent = content.replace(languageRegex, (match, before, landingPageStr) => {
  if (before.includes('unifiedIndia:')) {
    return match; // Already has it
  }
  return before + unifiedIndiaProperty.trimStart() + landingPageStr;
});

fs.writeFileSync(i18nPath, newContent, 'utf8');
console.log('Done replacing unifiedIndia missing properties');
