import fs from 'fs';

const diwaliCandidates = [
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605840243467-33e8ca7eb366?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=800&auto=format&fit=crop"
];

async function fix() {
  let chosenUrl = null;
  for (const url of diwaliCandidates) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        chosenUrl = url;
        console.log(`Found working Diwali URL: ${url}`);
        break;
      }
    } catch(e) {}
  }

  if (chosenUrl) {
    const festivals = JSON.parse(fs.readFileSync('./data/festivals.json', 'utf8'));
    const item = festivals.find(f => f.slug === 'diwali');
    if (item) {
      item.image = chosenUrl;
      item.imageUrl = chosenUrl;
    }
    fs.writeFileSync('./data/festivals.json', JSON.stringify(festivals, null, 2));

    const fallback = JSON.parse(fs.readFileSync('./data/map-fallback.json', 'utf8'));
    const fItem = fallback.find(f => f.id === 'diwali');
    if (fItem) {
      fItem.image = chosenUrl;
      fItem.imageUrl = chosenUrl;
    }
    fs.writeFileSync('./data/map-fallback.json', JSON.stringify(fallback, null, 2));
  }
}

fix();
