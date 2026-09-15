import fs from 'fs';

const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

async function verifyUrl(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function fetchWikiImage(wikiTitle) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.originalimage?.source || data.thumbnail?.source || null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const TARGETS = [
    {
      slugMatch: 'ellora-caves',
      wikiTitle: 'Ellora_Caves',
      userUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Kailasa_temple_at_Ellora_Caves%2C_India.jpg/1280px-Kailasa_temple_at_Ellora_Caves%2C_India.jpg'
    },
    {
      slugMatch: 'charminar',
      wikiTitle: 'Charminar',
      userUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Charminar_Hyderabad_1.jpg/1280px-Charminar_Hyderabad_1.jpg'
    }
  ];

  for (const t of TARGETS) {
    const item = monuments.find(m => m.slug.toLowerCase().includes(t.slugMatch));
    if (!item) {
      console.log(`[NOT FOUND] ${t.slugMatch}`);
      continue;
    }

    let finalUrl = t.userUrl;
    let ok = await verifyUrl(finalUrl);
    if (!ok) {
      console.log(`User URL failed for ${item.slug}, fetching Wikipedia REST API...`);
      const wikiUrl = await fetchWikiImage(t.wikiTitle);
      if (wikiUrl && (await verifyUrl(wikiUrl))) {
        finalUrl = wikiUrl;
      }
    }

    item.image = finalUrl;
    item.imageUrl = finalUrl;
    console.log(`[UPDATED ${item.slug}] -> ${finalUrl}`);
  }

  fs.writeFileSync('./data/monuments.json', JSON.stringify(monuments, null, 2), 'utf8');
  console.log('Successfully updated data/monuments.json for Ellora Caves & Charminar.');
}

main();
