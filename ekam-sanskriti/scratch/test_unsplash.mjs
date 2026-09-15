const unsplashTest = [
  // Monuments
  { name: 'taj-mahal', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop' },
  { name: 'qutub-minar', url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop' },
  { name: 'red-fort', url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&auto=format&fit=crop' },
  { name: 'hawa-mahal', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop' },

  // Festivals
  { name: 'diwali', url: 'https://images.unsplash.com/photo-1605840243467-33e8ca7eb366?w=800&auto=format&fit=crop' },
  { name: 'holi', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop' },
  { name: 'durga-puja', url: 'https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?w=800&auto=format&fit=crop' },
  { name: 'ganesh-chaturthi', url: 'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&auto=format&fit=crop' },

  // Arts & Crafts
  { name: 'madhubani', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop' },
  { name: 'pashmina', url: 'https://images.unsplash.com/photo-1606760227091-3dd858d492be?w=800&auto=format&fit=crop' },
  { name: 'kanchipuram', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop' },
  { name: 'blue-pottery', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop' }
];

async function run() {
  for (const item of unsplashTest) {
    try {
      const res = await fetch(item.url);
      console.log(`${item.name}: ${res.status} ${res.ok ? 'OK' : 'FAIL'}`);
    } catch(e) {
      console.log(`${item.name}: ERROR ${e.message}`);
    }
  }
}

run();
