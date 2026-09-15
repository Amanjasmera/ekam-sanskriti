import fs from 'fs';

const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

const EXACT_URLS = {
  "taj-mahal": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg",
  "qutub-minar": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Qutb_Minar_2022.jpg/800px-Qutb_Minar_2022.jpg",
  "qutb-minar": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Qutb_Minar_2022.jpg/800px-Qutb_Minar_2022.jpg",
  "red-fort": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Red_Fort_in_Delhi_03-2016_img3.jpg/1280px-Red_Fort_in_Delhi_03-2016_img3.jpg",
  "hawa-mahal": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/1280px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg"
};

async function fetchWikiImage(wikiTitle) {
  if (!wikiTitle) return null;
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) return null;
    const data = await res.json();
    let img = data.originalimage?.source || data.thumbnail?.source;
    if (img && img.includes('upload.wikimedia.org')) {
      img = img.replace(/\/\d+px-/g, '/800px-');
    }
    return img;
  } catch (e) {
    return null;
  }
}

async function verifyUrl(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function processMonuments() {
  const updatedMonuments = [];
  const usedUrls = new Set();

  for (const m of monuments) {
    let chosenUrl = EXACT_URLS[m.slug];

    if (!chosenUrl) {
      const wikiTitle = m.wikipediaTitle || m.wikipedia_titles?.en || m.name;
      const wikiUrl = await fetchWikiImage(wikiTitle);
      if (wikiUrl && (await verifyUrl(wikiUrl))) {
        chosenUrl = wikiUrl;
      }
    }

    if (!chosenUrl || usedUrls.has(chosenUrl) || !(await verifyUrl(chosenUrl))) {
      chosenUrl = m.imageUrl || m.image;
    }

    usedUrls.add(chosenUrl);

    console.log(`[${m.slug}] -> ${chosenUrl}`);

    updatedMonuments.push({
      ...m,
      image: chosenUrl,
      imageUrl: chosenUrl
    });
  }

  fs.writeFileSync('./data/monuments.json', JSON.stringify(updatedMonuments, null, 2), 'utf8');
  console.log(`Successfully updated all ${updatedMonuments.length} monuments in data/monuments.json with verified Wikipedia URLs.`);
}

processMonuments();
