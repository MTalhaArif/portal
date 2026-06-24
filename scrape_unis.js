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
  
  // Navigate to universities list
  // Look for the Universities link in the sidebar
  const urls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href }));
  });
  console.log('Links found:', urls);
  
  const uniUrl = urls.find(u => u.text.toLowerCase().includes('universit'));
  
  if (uniUrl && uniUrl.href) {
    console.log('Navigating to', uniUrl.href);
    await page.goto(uniUrl.href, { waitUntil: 'networkidle2' });
    
    // Wait for content to load
    await new Promise(r => setTimeout(r, 4000));
    
    const uniPageData = await page.evaluate(() => {
      // Find elements that look like cards or rows
      return document.body.innerText;
    });
    
    fs.writeFileSync('uni_page_data.txt', uniPageData);
    
    const uniHtml = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('uni_page.html', uniHtml);
  }

  await browser.close();
  console.log('Scrape universities finished.');
})();
