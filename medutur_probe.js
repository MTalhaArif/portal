const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  const allJson = [];
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') && (url.includes('universities') || url.includes('programs') || url.includes('search') || url.includes('countries'))) {
      try {
        const json = await response.json();
        console.log('Found JSON at:', url);
        allJson.push({ url, data: json });
        fs.writeFileSync('medutur_api_data.json', JSON.stringify(allJson, null, 2));
      } catch (e) {
        // Not JSON
      }
    }
  });

  console.log('Navigating to login...');
  await page.goto('https://portal.medutur.com/login', { waitUntil: 'networkidle2' });

  // Try to find login fields
  try {
    await page.type('input[type="email"], input[name="email"], #email', 'talhaarif31@gmail.com');
    await page.type('input[type="password"], input[name="password"], #password', 'MEDUTALHA123');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
      page.click('button[type="submit"]')
    ]);
    console.log('Logged in successfully.');
  } catch (err) {
    console.log('Login form not found or already logged in:', err.message);
  }

  console.log('Navigating to universities list (countries/4)...');
  await page.goto('https://portal.medutur.com/countries/4', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  
  // If we didn't get API data, we'll try to extract universities from the DOM
  console.log('Extracting from DOM...');
  const domData = await page.evaluate(() => {
    // Look for links to universities
    const links = Array.from(document.querySelectorAll('a[href*="/universities/"]'));
    return links.map(a => ({
      name: a.innerText.trim(),
      href: a.href
    })).filter(u => u.name && u.href);
  });
  
  console.log(`Found ${domData.length} universities in DOM.`);
  fs.writeFileSync('medutur_dom_unis.json', JSON.stringify(domData, null, 2));

  // If there are universities, scrape the first 3 as a test to see structure
  const testScrape = [];
  for (let i = 0; i < Math.min(3, domData.length); i++) {
    const uni = domData[i];
    console.log(`Testing scrape for ${uni.name}...`);
    await page.goto(uni.href, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    const pageHtml = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync(`uni_test_${i}.html`, pageHtml);
    
    // Attempt to extract programs
    const programs = await page.evaluate(() => {
      // Just grab all text from likely program tables or lists
      const trs = Array.from(document.querySelectorAll('tr'));
      if (trs.length > 0) return trs.map(tr => tr.innerText);
      
      const cards = Array.from(document.querySelectorAll('.card, .program, [class*="program"]'));
      if (cards.length > 0) return cards.map(c => c.innerText);
      
      return [document.body.innerText.substring(0, 500)]; // fallback
    });
    
    testScrape.push({ uni, programs });
  }
  fs.writeFileSync('medutur_test_scrape.json', JSON.stringify(testScrape, null, 2));

  await browser.close();
  console.log('Initial probe finished.');
})();
