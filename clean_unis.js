const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('medutur_cheerio_unis.json', 'utf8'));

// Filter and clean the university names
let cleanUnis = new Set();
raw.forEach(u => {
  // Ignore entries that have numbers or "Universities" (plural)
  if (/\d/.test(u) || u.includes('Universities')) return;
  // Ignore short or weird entries
  if (u.length < 10) return;
  
  // Basic cleanup
  let name = u.trim();
  cleanUnis.add(name);
});

let finalUnis = Array.from(cleanUnis);
console.log(`Cleaned down to ${finalUnis.length} universities.`);

// Some might still be missing because they had numbers in them in the raw text, e.g. "19 Mayıs University"
// Let's add back ones that look like legitimate universities even with numbers:
raw.forEach(u => {
  if (u.includes('University') && !u.includes('Universities') && u.length > 10) {
     // Extract the actual name part by removing leading digits and trailing N/A
     let name = u.replace(/^\d+/, '').replace(/N\/A$/, '').replace(/^\d+/, '').trim();
     if (name.endsWith('University') || name.endsWith('Universit') || name.includes('UniversityCampus') === false) {
       if (name && name.length > 5 && !name.startsWith('Universit')) {
         cleanUnis.add(name);
       }
     }
  }
});

finalUnis = Array.from(cleanUnis).sort();

// Let's filter out ones that contain "University Campus" or other weird artifacts
finalUnis = finalUnis.filter(name => !name.includes('Campus') && name !== 'University');

console.log(`After recovery: ${finalUnis.length} universities.`);

// Ensure the original 19 private ones are included perfectly
const existingPrivate = [
  "Istanbul Okan University",
  "Istanbul Medipol University",
  "Istanbul Atlas University",
  "Istanbul Kent University",
  "Istanbul Topkapi University",
  "Istanbul Beykoz University",
  "Istanbul Arel University",
  "Istanbul Yeni Yüzyıl University",
  "Istanbul Beykent University",
  "Istanbul Nişantaşı University",
  "Istanbul Health and Technology University",
  "Istanbul Biruni University",
  "Istanbul Aydin University",
  "Istanbul Gedik University",
  "Istanbul Kültür University",
  "Istanbul Sabahattin Zaim University",
  "Istanbul Gelişim University",
  "Istanbul Uskudar University",
  "Istanbul Fenerbahçe University"
];

existingPrivate.forEach(p => cleanUnis.add(p));

finalUnis = Array.from(cleanUnis).sort();
// Deduplicate similar names (e.g. "Istanbul Aydin University" vs "Aydin University")
// Actually Set handles exact matches. This is good enough.

fs.writeFileSync('cleaned_universities.json', JSON.stringify(finalUnis, null, 2));
