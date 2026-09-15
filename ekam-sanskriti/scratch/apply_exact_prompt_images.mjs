import fs from 'fs';

const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

const PROMPT_EXACT_MAP = {
  "taj-mahal": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg",
  "qutub-minar": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Qutb_Minar_2022.jpg/800px-Qutb_Minar_2022.jpg",
  "qutb-minar": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Qutb_Minar_2022.jpg/800px-Qutb_Minar_2022.jpg",
  "red-fort": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Red_Fort_in_Delhi_03-2016_img3.jpg/1280px-Red_Fort_in_Delhi_03-2016_img3.jpg",
  "hawa-mahal": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/1280px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg"
};

for (const m of monuments) {
  if (PROMPT_EXACT_MAP[m.slug]) {
    m.image = PROMPT_EXACT_MAP[m.slug];
    m.imageUrl = PROMPT_EXACT_MAP[m.slug];
  }
}

fs.writeFileSync('./data/monuments.json', JSON.stringify(monuments, null, 2), 'utf8');

console.log('Applied exact prompt URLs for taj-mahal, qutub-minar, red-fort, hawa-mahal.');
const set = new Set(monuments.map(x => x.imageUrl));
console.log(`Total: ${monuments.length}, Unique URLs: ${set.size}`);
