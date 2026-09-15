import fs from 'fs';

const festivals = JSON.parse(fs.readFileSync('./data/festivals.json', 'utf8'));
const arts = JSON.parse(fs.readFileSync('./data/arts.json', 'utf8'));

const promptUrls = [
  // Monuments
  { id: 'taj-mahal', category: 'monument', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/640px-Taj_Mahal_%28Edited%29.jpeg' },
  { id: 'qutb-minar', category: 'monument', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Qutb_Minar_2022.jpg/480px-Qutb_Minar_2022.jpg' },
  { id: 'red-fort', category: 'monument', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Red_Fort_in_Delhi_03-2016_img3.jpg/640px-Red_Fort_in_Delhi_03-2016_img3.jpg' },
  { id: 'hawa-mahal', category: 'monument', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/640px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg' },
  
  // Festivals
  { id: 'diwali', category: 'festival', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Deepavali_Festival_of_Lights_2023.jpg/640px-Deepavali_Festival_of_Lights_2023.jpg' },
  { id: 'holi', category: 'festival', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Holi_Festival_of_Colors_2023.jpg/640px-Holi_Festival_of_Colors_2023.jpg' },
  { id: 'durga-puja', category: 'festival', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Durga_Puja_Kolkata_2022.jpg/640px-Durga_Puja_Kolkata_2022.jpg' },
  { id: 'ganesh-chaturthi', category: 'festival', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ganesh_Chaturthi_Mumbai_2023.jpg/640px-Ganesh_Chaturthi_Mumbai_2023.jpg' },

  // Arts
  { id: 'madhubani', category: 'art', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Madhubani_painting.jpg/640px-Madhubani_painting.jpg' },
  { id: 'pashmina', category: 'art', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Pashmina_Shawl.jpg/640px-Pashmina_Shawl.jpg' },
  { id: 'kanchipuram', category: 'art', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Kanchipuram_silk_saree.jpg/640px-Kanchipuram_silk_saree.jpg' }
];

async function checkUrl(item) {
  try {
    const res = await fetch(item.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    return { id: item.id || item.slug, ok: res.ok, status: res.status, url: item.url };
  } catch (err) {
    return { id: item.id || item.slug, ok: false, error: err.message, url: item.url };
  }
}

async function run() {
  console.log('--- CHECKING PROMPT SPECIFIED URLS ---');
  for (const item of promptUrls) {
    const res = await checkUrl(item);
    console.log(`${res.id}: ${res.ok ? 'OK (200)' : 'FAILED (' + res.status + ')'} -> ${res.url}`);
  }

  console.log('\n--- CHECKING FESTIVALS JSON URLS ---');
  for (const item of festivals) {
    const res = await checkUrl({ id: item.slug, url: item.image });
    console.log(`${res.id}: ${res.ok ? 'OK (200)' : 'FAILED (' + res.status + ')'} -> ${res.url}`);
  }

  console.log('\n--- CHECKING ARTS JSON URLS ---');
  for (const item of arts) {
    const res = await checkUrl({ id: item.slug, url: item.image });
    console.log(`${res.id}: ${res.ok ? 'OK (200)' : 'FAILED (' + res.status + ')'} -> ${res.url}`);
  }
}

run();
