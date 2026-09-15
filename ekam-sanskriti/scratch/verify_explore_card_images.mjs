import fs from 'fs';

const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

console.log(`Auditing ${monuments.length} monuments in data/monuments.json...`);
const urls = new Map();
let duplicateCount = 0;

for (const m of monuments) {
  const img = m.imageUrl || m.image;
  if (!img || img.trim() === '') {
    console.log(`[MISSING IMAGE] ${m.slug}`);
  } else if (urls.has(img)) {
    console.log(`[DUPLICATE IMAGE] ${m.slug} shares URL with ${urls.get(img)}`);
    duplicateCount++;
  } else {
    urls.set(img, m.slug);
  }
}

console.log(`Audit Finished. Total: ${monuments.length}, Unique Images: ${urls.size}, Duplicates: ${duplicateCount}`);
