const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('medutur_full.html', 'utf8');
const $ = cheerio.load(html);

const unis = new Set();
$('*:contains("University")').each((i, el) => {
  const text = $(el).text().trim();
  if (text.includes('University') && text.length < 100 && text.length > 5) {
    // Only capture elements that are relatively short, likely titles or links
    unis.add(text);
  }
});

$('*:contains("Üniversitesi")').each((i, el) => {
  const text = $(el).text().trim();
  if (text.includes('Üniversitesi') && text.length < 100 && text.length > 5) {
    unis.add(text);
  }
});

const uniList = Array.from(unis).filter(u => u.split(' ').length < 8);
console.log(`Found ${uniList.length} potential universities.`);
fs.writeFileSync('medutur_cheerio_unis.json', JSON.stringify(uniList, null, 2));
