const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to login...');
  await page.goto('https://portal.medutur.com/login', { waitUntil: 'networkidle2' });

  // Try to find login fields
  await page.type('input[type="email"]', 'talhaarif31@gmail.com');
  await page.type('input[type="password"]', 'MEDUTALHA123');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]')
  ]);
  
  console.log('Logged in successfully. Taking screenshot of dashboard...');
  await page.screenshot({ path: 'medutur_dashboard.png' });

  // Get all links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href }));
  });
  fs.writeFileSync('medutur_links.json', JSON.stringify(links, null, 2));

  // Find universities link
  const uniLink = links.find(l => l.href.includes('universities') || l.text.toLowerCase().includes('universit'));
  if (uniLink) {
    console.log(`Navigating to ${uniLink.href}...`);
    await page.goto(uniLink.href, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: 'medutur_universities.png' });
    
    // Dump HTML
    const html = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('medutur_universities_dom.html', html);
  } else {
    console.log('No universities link found.');
  }

  await browser.close();
  console.log('Scrape attempt 2 finished.');
})();
