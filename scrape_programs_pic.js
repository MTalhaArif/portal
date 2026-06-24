const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  await page.goto('https://www.partnersportaltr.com/login', { waitUntil: 'networkidle2' });

  // Fill in login
  await page.type('input[type="email"]', 'talhaarif31@gmail.com');
  await page.type('input[type="password"]', 'Talhaarif31');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]')
  ]);

  console.log('Logged in!');
  
  await page.goto('https://www.partnersportaltr.com/agency/programs', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 6000));
  
  await page.screenshot({ path: 'programs_page.png' });
  
  const domContent = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('programs_dom.html', domContent);
  
  await browser.close();
  console.log('Programs page screenshot saved.');
})();
