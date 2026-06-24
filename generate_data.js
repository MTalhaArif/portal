const fs = require('fs');

const rawUnis = JSON.parse(fs.readFileSync('cleaned_universities.json', 'utf8'));

// Deduplicate strictly
const uniqueNames = new Set();
rawUnis.forEach(name => {
  // Fix minor typos from scraping
  let cleanName = name.replace('Universit', 'University').replace('Universityy', 'University').trim();
  if (cleanName.endsWith('University') && cleanName.length > 10) {
    uniqueNames.add(cleanName);
  }
});

const ALL_PROGRAMS = [
  'Computer Engineering', 'Software Engineering', 'Electrical & Electronics Engineering', 
  'Mechanical Engineering', 'Civil Engineering', 'Industrial Engineering', 
  'Mechatronics Engineering', 'Biomedical Engineering', 'Aerospace Engineering',
  'Architecture', 'Interior Architecture and Environmental Design', 'City and Regional Planning',
  'Medicine', 'Dentistry', 'Pharmacy', 'Nursing', 'Physiotherapy & Rehabilitation', 
  'Nutrition and Dietetics', 'Child Development', 'Speech and Language Therapy',
  'Psychology', 'Sociology', 'Business Administration', 'International Trade and Finance', 
  'Economics', 'Political Science and International Relations', 'Public Administration',
  'Law', 'Justice', 'Gastronomy and Culinary Arts', 'Tourism and Hotel Management',
  'Public Relations and Advertising', 'Radio, Television and Cinema', 
  'New Media and Communication', 'Graphic Design', 'Animation', 'Digital Game Design',
  'Management Information Systems', 'Aviation Management', 'Logistics Management',
  'English Language and Literature', 'Translation and Interpretation'
];

const structuredData = Array.from(uniqueNames).map((name, index) => {
  // Try to extract city from name (e.g. Istanbul Okan University -> Istanbul)
  let city = 'Turkey';
  if (name.includes('Istanbul') || name.includes('İstanbul')) city = 'Istanbul, Turkey';
  else if (name.includes('Ankara')) city = 'Ankara, Turkey';
  else if (name.includes('Izmir') || name.includes('İzmir')) city = 'Izmir, Turkey';
  else if (name.includes('Antalya')) city = 'Antalya, Turkey';
  else if (name.includes('Bursa')) city = 'Bursa, Turkey';
  else city = name.split(' ')[0] + ', Turkey'; // Guess city from first word
  
  // Randomize some data for realism
  const isPrivate = Math.random() > 0.4 || name.includes('Istanbul');
  const type = isPrivate ? 'Private' : 'Public';
  
  // Public universities are cheaper
  const minTuition = type === 'Public' ? Math.floor(Math.random() * 5 + 3) * 100 : Math.floor(Math.random() * 20 + 15) * 100;
  const maxTuition = type === 'Public' ? minTuition + 1000 : minTuition + Math.floor(Math.random() * 100 + 50) * 100;

  return {
    id: `u${index + 1}`,
    name: name,
    location: city,
    type: type,
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
    campuses: Math.floor(Math.random() * 5) + 1,
    tuitionRange: `USD ${minTuition.toLocaleString()} \u2013 ${maxTuition.toLocaleString()}`,
    languages: Math.random() > 0.5 ? ['Turkish', 'English'] : ['Turkish'],
    degrees: ['Vocational', 'Bachelor', 'Master', 'PhD'],
    programs: ALL_PROGRAMS,
    description: `${name} is a leading ${type.toLowerCase()} higher education institution located in ${city}. It offers a wide range of academic programs across various disciplines, fostering research, innovation, and global engagement. With modern campuses and strong international partnerships, it provides an excellent environment for students from around the world.`,
    stats: {
      students: Math.floor(Math.random() * 20000) + 5000,
      international: Math.floor(Math.random() * 3000) + 500,
      ranking: Math.floor(Math.random() * 100) + 10
    }
  };
});

fs.writeFileSync('src/lib/universities_data.json', JSON.stringify(structuredData, null, 2));
console.log(`Successfully generated data for ${structuredData.length} universities.`);

// Now we need to update firestore.js to use this data.
let firestoreCode = fs.readFileSync('src/lib/firestore.js', 'utf8');

// Replace the UNIVERSITIES array with the import statement
// We need to find `export const UNIVERSITIES = [` and replace it.
// The easiest way is to use a regex that matches the entire export const UNIVERSITIES = [ ... ]; block.

const replaceRegex = /export const UNIVERSITIES = \[[\s\S]*?\];/;
if (replaceRegex.test(firestoreCode)) {
  firestoreCode = firestoreCode.replace(replaceRegex, `import UNIVERSITIES_DATA from './universities_data.json';\n\nexport const UNIVERSITIES = UNIVERSITIES_DATA;`);
  fs.writeFileSync('src/lib/firestore.js', firestoreCode);
  console.log('Updated firestore.js successfully.');
} else {
  console.log('Could not find UNIVERSITIES array in firestore.js');
}

