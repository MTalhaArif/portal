const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Fake user agent to avoid basic blocks
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  
  await page.goto('https://portal.medutur.com/countries/4', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  const html = await page.evaluate(() => document.documentElement.outerHTML);
  fs.writeFileSync('medutur_full.html', html);
  
  await browser.close();
  console.log('Saved medutur_full.html');
})();
