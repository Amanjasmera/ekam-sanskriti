import fs from 'fs';

const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

const USER_URL_MAP = {
  "jallianwala-bagh": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Jallianwala_Bagh%2C_Amritsar.jpg/1280px-Jallianwala_Bagh%2C_Amritsar.jpg",
  "mahabaleshwar-temple": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Mahabaleshwar_Temple_1.jpg/1280px-Mahabaleshwar_Temple_1.jpg",
  "mahabalipuram-monuments": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Shore_Temple_Mahabalipuram.jpg/1280px-Shore_Temple_Mahabalipuram.jpg",
  "elephanta-caves": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Elephanta_Caves_Trimurti.jpg/800px-Elephanta_Caves_Trimurti.jpg",
  "tripura-sundari-temple": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Tripura_Sundari_Temple.jpg/1280px-Tripura_Sundari_Temple.jpg",
  "sun-temple-modhera": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sun_Temple_Modhera_Gujarat.jpg/1280px-Sun_Temple_Modhera_Gujarat.jpg",
  "somnath-temple": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Somnath_temple.jpg/1280px-Somnath_temple.jpg",
  "nalanda": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Nalanda_University_Ruins.jpg/1280px-Nalanda_University_Ruins.jpg",
  "fatehpur-sikri": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Fatehpur_Sikri_Buland_Darwaza.jpg/1280px-Fatehpur_Sikri_Buland_Darwaza.jpg",
  "ellora-caves": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kailasa_temple_at_Ellora.jpg/1280px-Kailasa_temple_at_Ellora.jpg",
  "konark-sun-temple": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Konark_Sun_Temple.jpg/1280px-Konark_Sun_Temple.jpg",
  "red-fort": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Red_Fort_in_Delhi_03-2016_img3.jpg/1280px-Red_Fort_in_Delhi_03-2016_img3.jpg",
  "qutub-minar": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Qutb_Minar_2022.jpg/800px-Qutb_Minar_2022.jpg",
  "qutb-minar": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Qutb_Minar_2022.jpg/800px-Qutb_Minar_2022.jpg",
  "hawa-mahal": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/1280px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg"
};

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

async function main() {
  const updatedMonuments = [];
  const used = new Set();

  for (const m of monuments) {
    let chosenUrl = USER_URL_MAP[m.slug];

    if (chosenUrl) {
      const isOk = await verifyUrl(chosenUrl);
      if (!isOk) {
        console.log(`[USER URL FAIL] ${m.slug}: ${chosenUrl}`);
        chosenUrl = null;
      }
    }

    if (!chosenUrl) {
      const wikiTitle = m.wikipediaTitle || m.wikipedia_titles?.en || m.name;
      const wikiImg = await fetchWikiImage(wikiTitle);
      if (wikiImg && (await verifyUrl(wikiImg))) {
        chosenUrl = wikiImg;
      }
    }

    if (!chosenUrl || used.has(chosenUrl)) {
      chosenUrl = m.imageUrl || m.image;
    }

    used.add(chosenUrl);

    console.log(`[${m.slug}] -> ${chosenUrl}`);
    updatedMonuments.push({
      ...m,
      image: chosenUrl,
      imageUrl: chosenUrl
    });
  }

  fs.writeFileSync('./data/monuments.json', JSON.stringify(updatedMonuments, null, 2), 'utf8');
  console.log(`Updated data/monuments.json for all ${updatedMonuments.length} monuments.`);
}

main();
