const fs = require('fs');
const html = fs.readFileSync('medutur_full.html', 'utf8');

// Find a known university name to see its JSON structure
const idx = html.indexOf('Aydın');
if (idx > -1) {
  console.log('Found Aydın at', idx);
  console.log(html.substring(idx - 200, idx + 200));
}

const idx2 = html.indexOf('Istanbul');
if (idx2 > -1) {
  console.log('Found Istanbul at', idx2);
  console.log(html.substring(idx2 - 200, idx2 + 200));
}
