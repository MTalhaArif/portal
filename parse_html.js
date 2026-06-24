const fs = require('fs');
const html = fs.readFileSync('medutur_full.html', 'utf8');

// The data is inside the next.js flight payload
// Let's try a regex to find university names
const uniMatches = [...html.matchAll(/"name":"([^"]+University[^"]*)"/gi)];
const unis = [...new Set(uniMatches.map(m => m[1]))];

console.log(`Found ${unis.length} unique universities in HTML string.`);
fs.writeFileSync('medutur_extracted_unis.json', JSON.stringify(unis, null, 2));

// Let's also look for programs
const progMatches = [...html.matchAll(/"programName":"([^"]+)"/gi)];
const progs = [...new Set(progMatches.map(m => m[1]))];
console.log(`Found ${progs.length} unique programs in HTML string.`);
