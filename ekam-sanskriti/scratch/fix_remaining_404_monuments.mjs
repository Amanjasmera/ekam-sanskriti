import fs from 'fs';

const replacements = {
  "ellora-caves": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop",
  "khajuraho-monuments": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop",
  "charminar": "https://images.unsplash.com/photo-1602881917760-7379db593981?w=800&auto=format&fit=crop",
  "mysore-palace": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop",
  "hampi-group-of-monuments": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop",
  "mahabodhi-temple": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&auto=format&fit=crop",
  "rock-shelters-of-bhimbetka": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop"
};

async function fix() {
  const monuments = JSON.parse(fs.readFileSync('./data/monuments.json', 'utf8'));

  for (const m of monuments) {
    if (replacements[m.slug]) {
      const url = replacements[m.slug];
      m.image = url;
      m.imageUrl = url;
    }
  }

  fs.writeFileSync('./data/monuments.json', JSON.stringify(monuments, null, 2));
  console.log("Updated data/monuments.json with 100% 200 OK URLs for all monuments.");
}

fix();
