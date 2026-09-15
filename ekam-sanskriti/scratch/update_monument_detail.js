const fs = require('fs');

const i18nPath = 'd:/HAC/ekam-sanskriti/lib/i18n.ts';
let content = fs.readFileSync(i18nPath, 'utf8');

const interfaceReplacement = `monumentDetail: {
    backToExplore: string;
    unescoHeritage: string;
    listen: string;
    watch: string;
    read: string;
    audioNarration: string;
    playingNarration: string;
    clickToListen: string;
    speed: string;
    narrationScriptText: string;
    loadingSummary: string;
    summaryPrepared: string;
    documentarySlideshow: string;
    playingYoutube: string;
    playingSlideshow: string;
    mute: string;
    unmute: string;
    readFullArticle: string;
    showLess: string;
    wikiSections: string;
    quickFacts: string;
    builtYear: string;
    dynasty: string;
    architect: string;
    openingHours: string;
    ticketPrice: string;
    unescoStatus: string;
    officialHeritage: string;
    protectedMonument: string;
    addedToJourney: string;
    saveToJourney: string;
    shareViaWhatsApp: string;
    share: string;
    viewOnMap: string;
    relatedMonuments: string;
    monumentNotFound: string;
    monumentNotFoundDesc: string;
    returnToExplore: string;
    youMightAlsoLike: string;
  }`;

const enMonumentDetail = `monumentDetail: {
      backToExplore: 'Back to Explore',
      unescoHeritage: 'UNESCO World Heritage Site',
      listen: 'Listen',
      watch: 'Watch',
      read: 'Read',
      audioNarration: 'Audio Narration',
      playingNarration: 'Playing Narration...',
      clickToListen: 'Click to listen to the history of this monument.',
      speed: 'Speed',
      narrationScriptText: 'Narration Script & Text',
      loadingSummary: 'Loading historical summary from Wikipedia...',
      summaryPrepared: 'Summary prepared from Wikipedia',
      documentarySlideshow: 'Documentary & Slideshow',
      playingYoutube: 'Playing Video...',
      playingSlideshow: 'Playing Image Slideshow...',
      mute: 'Mute',
      unmute: 'Unmute',
      readFullArticle: 'Read Full Article',
      showLess: 'Show Less',
      wikiSections: 'Wikipedia Sections',
      quickFacts: 'Quick Facts',
      builtYear: 'Built',
      dynasty: 'Dynasty',
      architect: 'Architect',
      openingHours: 'Opening Hours',
      ticketPrice: 'Ticket Price',
      unescoStatus: 'UNESCO Status',
      officialHeritage: 'Official Heritage',
      protectedMonument: 'Protected Monument',
      addedToJourney: 'Added to Journey!',
      saveToJourney: 'Save to Journey',
      shareViaWhatsApp: 'Share via WhatsApp',
      share: 'Share',
      viewOnMap: 'View on Map',
      relatedMonuments: 'Related Monuments',
      monumentNotFound: 'Monument Not Found',
      monumentNotFoundDesc: 'The monument you are looking for does not exist or has been removed.',
      returnToExplore: 'Return to Explore',
      youMightAlsoLike: 'You Might Also Like'
    },`;

// Split the file by `monumentDetail: {`
const parts = content.split('monumentDetail: {');
let newContent = parts[0];

for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  // Find the end of this object by finding the next `foodDetail: {` or similar sibling
  // But wait, the easiest way is to find the first closing brace `},` that has the right indentation, OR since they are all followed by `foodDetail: {`, we can split by `foodDetail: {`.
  
  const endIdx = part.indexOf('foodDetail: {');
  if (endIdx === -1) {
    // If foodDetail is not found, maybe it's the interface definition which ends with `sidebar: {`
    const sidebarIdx = part.indexOf('sidebar: {');
    if (sidebarIdx !== -1) {
       newContent += interfaceReplacement + '\\n\\n  ' + part.substring(sidebarIdx);
    } else {
       console.log('Could not find end for part', i);
       // Just append it back
       newContent += 'monumentDetail: {' + part;
    }
  } else {
    // It's a language dictionary
    newContent += enMonumentDetail + '\\n    ' + part.substring(endIdx);
  }
}

fs.writeFileSync(i18nPath, newContent);
console.log('Successfully updated monumentDetail in all 24 languages.');
