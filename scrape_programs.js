const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('https://www.partnersportaltr.com/login', { waitUntil: 'networkidle2' });

  // Fill in login
  await page.type('input[type="email"]', 'talhaarif31@gmail.com');
  await page.type('input[type="password"]', 'Talhaarif31');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]')
  ]);

  console.log('Logged in!');
  
  // Go to Programs page
  await page.goto('https://www.partnersportaltr.com/agency/programs', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  
  // Try to find the exact network request for programs to get pure JSON
  // Since we missed it on load, let's refresh and intercept
  let programsData = null;
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('programs') || url.includes('firestore') || url.includes('googleapis')) {
      // Just log that we saw a request
      console.log('Saw request to:', url);
    }
  });

  // Instead of waiting for json, let's just extract all the table rows from DOM
  const extractTable = async () => {
    return await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      return rows.map(r => r.innerText).join('\n---\n');
    });
  };
  
  let allData = await extractTable();
  fs.writeFileSync('programs_page_1.txt', allData);
  
  await browser.close();
  console.log('Scrape programs finished.');
})();
