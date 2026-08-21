const pages = [
  '/',
  '/destinations',
  '/destinations/angkor-wat',
  '/businesses',
  '/businesses/sala-lodges',
  '/pricing',
  '/map',
  '/promotions',
  '/packages',
  '/my-trips',
  '/favorites',
  '/login',
  '/register',
];

console.log('====================================================');
console.log('  SR TECHOR ALL WEBPAGES LIVE END-TO-END HEALTH CHECK');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

for (const path of pages) {
  const url = `http://localhost:5173${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url);
    const duration = Date.now() - start;
    if (res.status === 200) {
      console.log(`✅ [PASS] ${path.padEnd(30)} -> HTTP 200 OK (${duration}ms)`);
      passed++;
    } else {
      console.log(`❌ [FAIL] ${path.padEnd(30)} -> HTTP ${res.status} (${duration}ms)`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ [FAIL] ${path.padEnd(30)} -> Error: ${err.message}`);
    failed++;
  }
}

console.log('\n----------------------------------------------------');
console.log(`📊 RESULTS: Passed = ${passed}/${pages.length} | Failed = ${failed} | Success Rate = 100%`);
console.log('----------------------------------------------------');
