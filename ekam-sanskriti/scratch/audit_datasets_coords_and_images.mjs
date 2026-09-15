import fs from 'fs';

const STATE_CAPITALS = {
  "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
  "Delhi": { lat: 28.6139, lng: 77.2090 },
  "Rajasthan": { lat: 26.9124, lng: 75.7873 },
  "Odisha": { lat: 20.2961, lng: 85.8245 },
  "Tamil Nadu": { lat: 13.0827, lng: 80.2707 },
  "Punjab": { lat: 31.6340, lng: 74.8723 },
  "Maharashtra": { lat: 19.0760, lng: 72.8777 },
  "Madhya Pradesh": { lat: 23.2599, lng: 77.4126 },
  "Telangana": { lat: 17.3850, lng: 78.4867 },
  "Karnataka": { lat: 12.9716, lng: 77.5946 },
  "West Bengal": { lat: 22.5726, lng: 88.3639 },
  "Bihar": { lat: 25.5941, lng: 85.1376 },
  "Gujarat": { lat: 23.2156, lng: 72.6369 },
  "Assam": { lat: 26.1445, lng: 91.7362 },
  "Kerala": { lat: 8.5241, lng: 76.9366 },
  "Jammu and Kashmir": { lat: 34.0837, lng: 74.7973 },
  "Andhra Pradesh": { lat: 16.5062, lng: 80.6480 },
  "Goa": { lat: 15.4989, lng: 73.8278 },
  "Himachal Pradesh": { lat: 31.1048, lng: 77.1734 },
  "Uttarakhand": { lat: 30.3165, lng: 78.0322 },
  "Haryana": { lat: 30.7333, lng: 76.7794 },
  "Jharkhand": { lat: 23.3441, lng: 85.3096 },
  "Chhattisgarh": { lat: 21.2514, lng: 81.6296 },
  "Tripura": { lat: 23.8315, lng: 91.2868 },
  "Meghalaya": { lat: 25.5788, lng: 91.8933 },
  "Manipur": { lat: 24.8170, lng: 93.9368 },
  "Nagaland": { lat: 25.6751, lng: 94.1086 },
  "Mizoram": { lat: 23.7271, lng: 92.7176 },
  "Sikkim": { lat: 27.3389, lng: 88.6065 },
  "Arunachal Pradesh": { lat: 27.0844, lng: 93.6053 }
};

function ensureCoordsAndImage(filePath, categoryName) {
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updatedCount = 0;

  for (const item of items) {
    // 1. Ensure imageUrl exists
    if (!item.imageUrl && item.image) {
      item.imageUrl = item.image;
      updatedCount++;
    } else if (!item.image && item.imageUrl) {
      item.image = item.imageUrl;
      updatedCount++;
    }

    // 2. Ensure lat and lng exist
    if (typeof item.lat !== 'number' || typeof item.lng !== 'number') {
      const stateName = item.state || item.region || item.district || 'Delhi';
      const cap = STATE_CAPITALS[stateName] || STATE_CAPITALS['Delhi'];
      item.lat = cap.lat;
      item.lng = cap.lng;
      updatedCount++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`[${categoryName}] Total: ${items.length}, Updates: ${updatedCount}`);
}

ensureCoordsAndImage('./data/foods.json', 'FOODS');
ensureCoordsAndImage('./data/festivals.json', 'FESTIVALS');
ensureCoordsAndImage('./data/arts.json', 'ARTS');
ensureCoordsAndImage('./data/monuments.json', 'MONUMENTS');
