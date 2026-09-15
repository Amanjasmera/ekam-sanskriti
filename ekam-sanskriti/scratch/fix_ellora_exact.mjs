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

async function getElloraImage() {
  // 1. Try MediaWiki API
  try {
    const api1 = 'https://en.wikipedia.org/w/api.php?action=query&titles=Ellora_Caves&prop=pageimages&pithumbsize=1200&format=json&origin=*';
    const res1 = await fetch(api1, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (res1.ok) {
      const d1 = await res1.json();
      const pages = d1?.query?.pages || {};
      const pageKey = Object.keys(pages)[0];
      const src1 = pages[pageKey]?.thumbnail?.source;
      if (src1 && (await verifyUrl(src1))) {
        console.log('Got valid image from MediaWiki API:', src1);
        return src1;
      }
    }
  } catch (e) {
    console.log('MediaWiki API error:', e.message);
  }

  // 2. Try REST API
  try {
    const api2 = 'https://en.wikipedia.org/api/rest_v1/page/summary/Ellora_Caves';
    const res2 = await fetch(api2, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (res2.ok) {
      const d2 = await res2.json();
      const src2 = d2.originalimage?.source || d2.thumbnail?.source;
      if (src2 && (await verifyUrl(src2))) {
        console.log('Got valid image from REST API:', src2);
        return src2;
      }
    }
  } catch (e) {
    console.log('REST API error:', e.message);
  }

  // 3. Fallback
  const fallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Kailasa_temple_at_Ellora_Caves%2C_India.jpg/1280px-Kailasa_temple_at_Ellora_Caves%2C_India.jpg';
  console.log('Using fallback URL:', fallback);
  return fallback;
}

async function main() {
  const elloraImg = await getElloraImage();
  const elloraItem = monuments.find(m => m.slug === 'ellora-caves' || m.slug.includes('ellora'));

  if (!elloraItem) {
    console.log('Ellora Caves not found in monuments.json');
    return;
  }

  elloraItem.image = elloraImg;
  elloraItem.imageUrl = elloraImg;

  fs.writeFileSync('./data/monuments.json', JSON.stringify(monuments, null, 2), 'utf8');
  console.log(`Updated Ellora Caves in data/monuments.json: ${elloraImg}`);
}

main();
