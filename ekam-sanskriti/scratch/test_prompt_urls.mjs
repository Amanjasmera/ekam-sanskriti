const promptUrls = [
  // Monuments
  { name: 'taj-mahal', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/640px-Taj_Mahal_%28Edited%29.jpeg' },
  { name: 'qutb-minar', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Qutb_Minar_2022.jpg/480px-Qutb_Minar_2022.jpg' },
  { name: 'red-fort', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Red_Fort_in_Delhi_03-2016_img3.jpg/640px-Red_Fort_in_Delhi_03-2016_img3.jpg' },
  { name: 'hawa-mahal', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/640px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg' },
  
  // Festivals
  { name: 'diwali', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Deepavali_Festival_of_Lights_2023.jpg/640px-Deepavali_Festival_of_Lights_2023.jpg' },
  { name: 'holi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Holi_Festival_of_Colors_2023.jpg/640px-Holi_Festival_of_Colors_2023.jpg' },
  { name: 'durga-puja', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Durga_Puja_Kolkata_2022.jpg/640px-Durga_Puja_Kolkata_2022.jpg' },
  { name: 'ganesh-chaturthi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ganesh_Chaturthi_Mumbai_2023.jpg/640px-Ganesh_Chaturthi_Mumbai_2023.jpg' },

  // Arts
  { name: 'madhubani', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Madhubani_painting.jpg/640px-Madhubani_painting.jpg' },
  { name: 'pashmina', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Pashmina_Shawl.jpg/640px-Pashmina_Shawl.jpg' },
  { name: 'kanchipuram', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Kanchipuram_silk_saree.jpg/640px-Kanchipuram_silk_saree.jpg' }
];

async function run() {
  for (const item of promptUrls) {
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      console.log(`${item.name}: ${res.status} ${res.ok ? 'OK' : 'FAIL'}`);
    } catch(e) {
      console.log(`${item.name}: ERROR ${e.message}`);
    }
  }
}

run();
