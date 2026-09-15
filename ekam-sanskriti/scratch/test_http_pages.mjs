async function checkPages() {
  const urls = [
    'http://localhost:3000/explore',
    'http://localhost:3000/monument/taj-mahal',
    'http://localhost:3000/monument/qutub-minar',
    'http://localhost:3000/monument/red-fort'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`${url}: ${res.status} ${res.ok ? 'OK' : 'FAIL'}`);
    } catch (e) {
      console.log(`${url}: ERROR -> ${e.message}`);
    }
  }
}

checkPages();
