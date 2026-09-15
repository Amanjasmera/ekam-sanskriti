import fs from 'fs';

const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

// Verify unique photos
const seenUrls = new Map();
let updated = 0;

for (const m of monuments) {
  const img = m.imageUrl || m.image;
  m.image = img;
  m.imageUrl = img;
  updated++;
  if (seenUrls.has(img)) {
    console.log(`[DUPLICATE DETECTED] ${m.slug} shares image with ${seenUrls.get(img)}`);
  } else {
    seenUrls.set(img, m.slug);
  }
}

fs.writeFileSync('./data/monuments.json', JSON.stringify(monuments, null, 2));
console.log(`Successfully updated ${updated} monuments in data/monuments.json with imageUrl & image properties.`);
