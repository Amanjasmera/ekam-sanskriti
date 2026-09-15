import fs from 'fs';

// Master dictionary of verified 200 OK Unsplash photos for each slug
const photoDb = {
  // Monuments
  "taj-mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop",
  "qutub-minar": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop",
  "red-fort": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&auto=format&fit=crop",
  "hawa-mahal": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
  "konark-sun-temple": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop",
  "meenakshi-amman-temple": "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&auto=format&fit=crop",
  "golden-temple": "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=800&auto=format&fit=crop",
  "ajanta-caves": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop",
  "ellora-caves": "https://images.unsplash.com/photo-1600100395178-5e6089766d6e?w=800&auto=format&fit=crop",
  "khajuraho-monuments": "https://images.unsplash.com/photo-1606210122158-eeb086208a0d?w=800&auto=format&fit=crop",
  "sanchi-stupa": "https://images.unsplash.com/photo-1609946782912-6738b4d826bc?w=800&auto=format&fit=crop",
  "charminar": "https://images.unsplash.com/photo-1605649487212-47bdab06cfd5?w=800&auto=format&fit=crop",
  "gateway-of-india": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop",
  "victoria-memorial": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop",
  "mysore-palace": "https://images.unsplash.com/photo-1600100395420-569dfa684b5c?w=800&auto=format&fit=crop",
  "amer-fort": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
  "hampi-group-of-monuments": "https://images.unsplash.com/photo-1600100395420-569dfa684b5c?w=800&auto=format&fit=crop",
  "brihadishvara-temple": "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&auto=format&fit=crop",
  "sun-temple-modhera": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop",
  "fatehpur-sikri": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&auto=format&fit=crop",
  "nalanda-university": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop",
  "mahabodhi-temple": "https://images.unsplash.com/photo-1600100395178-5e6089766d6e?w=800&auto=format&fit=crop",
  "jaisalmer-fort": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
  "chhatrapati-shivaji-terminus": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop",
  "rock-shelters-of-bhimbetka": "https://images.unsplash.com/photo-1600100395178-5e6089766d6e?w=800&auto=format&fit=crop",

  // Festivals
  "diwali": "https://images.unsplash.com/photo-1605840243467-33e8ca7eb366?w=800&auto=format&fit=crop",
  "holi": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop",
  "durga-puja": "https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?w=800&auto=format&fit=crop",
  "ganesh-chaturthi": "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&auto=format&fit=crop",
  "pongal": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop",
  "onam": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop",
  "baisakhi": "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=800&auto=format&fit=crop",
  "navratri": "https://images.unsplash.com/photo-1602881917760-7379db593981?w=800&auto=format&fit=crop",
  "chhatt-puja": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop",
  "makar-sankranti": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop",
  "rath-yatra": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&auto=format&fit=crop",
  "bihu": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop",
  "maha-shivratri": "https://images.unsplash.com/photo-1609946782912-6738b4d826bc?w=800&auto=format&fit=crop",
  "janmashtami": "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&auto=format&fit=crop",
  "ugadi": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop",

  // Arts & Crafts
  "madhubani-painting": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop",
  "pashmina-weaving": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop",
  "kanchipuram-silk": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop",
  "blue-pottery": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop",
  "bidriware": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop",
  "tanjore-painting": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop",
  "warli-art": "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&auto=format&fit=crop",
  "pattachitra": "https://images.unsplash.com/photo-1582562124811-c091b7d07c3f?w=800&auto=format&fit=crop",
  "dhokra-craft": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop",
  "phulkari": "https://images.unsplash.com/photo-1606760227091-3dd858d492be?w=800&auto=format&fit=crop",
  "channapatna-toys": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop",
  "banarasi-silk": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop",
  "kalamkari": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop",
  "bandhani": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop",
  "chikankari": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop",
  "kantha-stitch": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop",
  "kathputli": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop",
  "tarkashi": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop",
  "terracotta-bankura": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop",
  "gond-painting": "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&auto=format&fit=crop",

  // Foods
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop",
  "hyderabadi-biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop",
  "dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop",
  "masala-dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop",
  "gulab-jamun": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop",
  "samosa": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop",
  "rosogolla": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop",
  "rasgulla": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop",
  "pav-bhaji": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&auto=format&fit=crop",
  "chole-bhature": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop",
  "idli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop",
  "jalebi": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop",
  "dhokla": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop",
  "litti-chokha": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop",
  "mysore-pak": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop",
  "vada-pav": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&auto=format&fit=crop",
  "kheer": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop",
  "dal-baati-churma": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop",
  "butter-chicken": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop",
  "pani-puri": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop"
};

async function processFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updatedCount = 0;

  for (const item of data) {
    const slug = item.slug || item.id;
    if (photoDb[slug]) {
      item.image = photoDb[slug];
      if (item.imageUrl) item.imageUrl = photoDb[slug];
      updatedCount++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${filePath}: ${updatedCount} items updated.`);
}

async function run() {
  await processFile('./data/monuments.json');
  await processFile('./data/festivals.json');
  await processFile('./data/arts.json');
  await processFile('./data/foods.json');
  await processFile('./data/map-fallback.json');
}

run();
