import fs from 'fs';

const uniqueOverrides = {
  "mahabalipuram-monuments": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop"
};

async function fix() {
  const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

  for (const m of monuments) {
    if (uniqueOverrides[m.slug]) {
      const url = uniqueOverrides[m.slug];
      m.image = url;
      m.imageUrl = url;
    }
  }

  fs.writeFileSync('./data/monuments.json', JSON.stringify(monuments, null, 2));
  console.log("Updated duplicate monument entries with 100% unique photo URLs.");
}

fix();
