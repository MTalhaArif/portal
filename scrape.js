const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Intercept requests to capture the universities data
  const data = { universities: [], programs: [] };
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('universities') || url.includes('programs')) {
      try {
        const json = await response.json();
        console.log(`Intercepted JSON from ${url}`);
        fs.appendFileSync('scrape_log.txt', `\n\n--- ${url} ---\n${JSON.stringify(json, null, 2)}`);
      } catch (e) {
        // Not JSON
      }
    }
  });

  await page.goto('https://www.partnersportaltr.com/login', { waitUntil: 'networkidle2' });

  // Fill in login
  await page.type('input[type="email"]', 'talhaarif31@gmail.com');
  await page.type('input[type="password"]', 'Talhaarif31');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]')
  ]);

  console.log('Logged in!');
  
  // Find a link to universities or programs
  // Click on "Universities" if exists
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const uniLink = links.find(l => l.innerText.toLowerCase().includes('universit'));
    if (uniLink) uniLink.click();
  });
  
  await new Promise(r => setTimeout(r, 5000));
  
  // Extract data from DOM if API didn't return anything obvious
  const domData = await page.evaluate(() => {
    return document.body.innerText;
  });
  
  fs.writeFileSync('dom_data.txt', domData);
  
  // Try to find applications page, might have universities dropdown
  await page.goto('https://www.partnersportaltr.com/applications', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  const formsData = await page.evaluate(() => {
    return document.body.innerText;
  });
  fs.appendFileSync('dom_data.txt', '\n\n=== APPLICATIONS PAGE ===\n\n' + formsData);

  await browser.close();
  console.log('Scrape finished.');
})();
