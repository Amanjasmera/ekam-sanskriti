import fs from 'fs';

const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

const TARGET_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Ellora_Caves_-Aurangabad_-Maharastra_-DSC001.jpg/1280px-Ellora_Caves_-Aurangabad_-Maharastra_-DSC001.jpg';

async function verifyUrl(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function main() {
  const isOk = await verifyUrl(TARGET_URL);
  console.log(`URL HTTP verification: ${isOk ? 'OK (200)' : 'FAILED'}`);

  const item = monuments.find(m => m.slug === 'ellora-caves' || m.slug.includes('ellora'));
  if (item) {
    item.image = TARGET_URL;
    item.imageUrl = TARGET_URL;
    fs.writeFileSync('./data/monuments.json', JSON.stringify(monuments, null, 2), 'utf8');
    console.log(`Updated ${item.slug} imageUrl to: ${TARGET_URL}`);
  } else {
    console.log('Ellora Caves not found in monuments.json');
  }
}

main();
