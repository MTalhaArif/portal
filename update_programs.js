const fs = require('fs');

const content = fs.readFileSync('src/lib/firestore.js', 'utf8');

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

let updatedContent = content;

// Use regex to find and replace the programs array for each university
const regex = /programs:\s*\[([^\]]*)\]/g;
updatedContent = updatedContent.replace(regex, (match, currentProgramsStr) => {
  // Extract existing programs by doing some string cleanup
  let existing = [];
  try {
    // A bit hacky but works for the format we have: 'Medicine','Nursing'
    existing = currentProgramsStr
      .split(',')
      .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(s => s.length > 0);
  } catch(e) {}
  
  // Merge and deduplicate
  const merged = [...new Set([...existing, ...ALL_PROGRAMS])];
  const mergedFormatted = merged.map(p => `'${p}'`).join(',');
  return `programs: [${mergedFormatted}]`;
});

fs.writeFileSync('src/lib/firestore.js', updatedContent);
console.log('Programs updated successfully');
