const { performance } = require('perf_hooks');

const scrapers = require('./scrapers.js');

async function run() {
  const startTime = performance.now();
  await scrapers.run();
  const endTime = performance.now();

  console.log(`Scraping took ${endTime - startTime} milliseconds`);
  console.log('Done');
  console.log('Done');
}

run();
