import fs from 'fs';

const i18nFile = 'lib/i18n.ts';
let i18nContent = fs.readFileSync(i18nFile, 'utf8');

if (!i18nContent.includes('monumentDetail: {')) {
  i18nContent = i18nContent.replace('export interface Dictionary {', `export interface Dictionary {
  monumentDetail: {
    backToExplore: string
    unescoHeritage: string
    listen: string
    watch: string
    read: string
    audioNarration: string
    playingNarration: string
    clickToListen: string
    speed: string
    narrationScriptText: string
    loadingSummary: string
    summaryPrepared: string
    documentarySlideshow: string
    mute: string
    unmute: string
    expandArticle: string
    collapseArticle: string
    wikiSections: string
    monumentNotFound: string
    monumentNotFoundDesc: string
    returnToExplore: string
    youMightAlsoLike: string
    addedToJourney: string
    saveToJourney: string
    shareViaWhatsApp: string
    share: string
  }`);
}

if (!i18nContent.includes('languageSelect: {')) {
  i18nContent = i18nContent.replace('export interface Dictionary {', `export interface Dictionary {
  languageSelect: {
    chooseYourLanguage: string
    selectLanguageDesc: string
    saving: string
    continueToDashboard: string
  }`);
}

fs.writeFileSync(i18nFile, i18nContent);
console.log('Interfaces added');
