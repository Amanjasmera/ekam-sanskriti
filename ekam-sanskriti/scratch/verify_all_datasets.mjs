import fs from 'fs';

const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));
const foods = JSON.parse(fs.readFileSync('./data/foods.json', 'utf8'));
const festivals = JSON.parse(fs.readFileSync('./data/festivals.json', 'utf8'));
const arts = JSON.parse(fs.readFileSync('./data/arts.json', 'utf8'));
const mapFallback = JSON.parse(fs.readFileSync('./data/map-fallback.json', 'utf8'));

async function checkList(name, items) {
  console.log(`\n=== CHECKING ${name} (${items.length} items) ===`);
  const urls = new Map();
  let duplicates = 0;
  let failures = 0;

  for (const item of items) {
    const id = item.slug || item.id || item.name;
    const img = item.image || item.imageUrl;
    
    if (urls.has(img)) {
      console.log(`[DUPLICATE IMAGE] ${id} shares URL with ${urls.get(img)}`);
      duplicates++;
    } else {
      urls.set(img, id);
    }

    try {
      const res = await fetch(img, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) {
        console.log(`[HTTP ${res.status}] ${id} -> ${img}`);
        failures++;
      }
    } catch(e) {
      console.log(`[ERROR] ${id} -> ${e.message}`);
      failures++;
    }
  }

  console.log(`Result for ${name}: Total: ${items.length}, Duplicates: ${duplicates}, Failures: ${failures}`);
}

async function main() {
  await checkList('MONUMENTS', monuments);
  await checkList('FOODS', foods);
  await checkList('FESTIVALS', festivals);
  await checkList('ARTS', arts);
  await checkList('MAP FALLBACK', mapFallback);
}

main();
