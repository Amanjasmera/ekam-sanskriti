import fs from 'fs';

// Exact original curated Unsplash photo mappings for Monuments
const originalMonumentsMap = {
  "taj-mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop",
  "qutub-minar": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop",
  "red-fort": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&auto=format&fit=crop",
  "hawa-mahal": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
  "konark-sun-temple": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop",
  "meenakshi-amman-temple": "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&auto=format&fit=crop",
  "golden-temple": "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=800&auto=format&fit=crop",
  "ajanta-caves": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop",
  "ellora-caves": "https://images.unsplash.com/photo-1600100397608-f010e423b971?w=800&auto=format&fit=crop",
  "khajuraho-monuments": "https://images.unsplash.com/photo-1606210122158-eeb086208a0d?w=800&auto=format&fit=crop",
  "sanchi-stupa": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop",
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
  "rock-shelters-of-bhimbetka": "https://images.unsplash.com/photo-1600100395178-5e6089766d6e?w=800&auto=format&fit=crop"
};

async function testAndRestore() {
  console.log("Testing original Unsplash monument URLs...");
  for (const [slug, url] of Object.entries(originalMonumentsMap)) {
    try {
      const res = await fetch(url);
      console.log(`${slug}: ${res.status} ${res.ok ? 'OK' : 'FAIL'}`);
    } catch(e) {
      console.log(`${slug}: ERROR -> ${e.message}`);
    }
  }

  const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

  for (const m of monuments) {
    if (originalMonumentsMap[m.slug]) {
      const targetUrl = originalMonumentsMap[m.slug];
      m.image = targetUrl;
      m.imageUrl = targetUrl;
    }
  }

  fs.writeFileSync('./data/monuments.json', JSON.stringify(monuments, null, 2));
  console.log("\nRestored original monument images to data/monuments.json successfully!");
}

testAndRestore();
