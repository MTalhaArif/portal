// ─── localStorage Firestore mock ───────────────────────────────────────────────
import { getCollection, saveCollection } from './auth';

function newId() {
  return 'doc_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

function nowTs() {
  const d = new Date();
  return { toDate: () => d, seconds: Math.floor(d.getTime() / 1000) };
}

// ─── Generic CRUD ──────────────────────────────────────────────────────────────
export async function addDocument(collectionName, data) {
  const col = getCollection(collectionName);
  const id = newId();
  col.unshift({ ...data, id, createdAt: nowTs(), updatedAt: nowTs() });
  saveCollection(collectionName, col);
  return id;
}

export async function getDocuments(collectionName) {
  return getCollection(collectionName);
}

export async function getDocumentById(collectionName, id) {
  const col = getCollection(collectionName);
  return col.find(d => d.id === id) || null;
}

export async function updateDocument(collectionName, id, data) {
  const col = getCollection(collectionName);
  const idx = col.findIndex(d => d.id === id || d.uid === id);
  if (idx !== -1) {
    col[idx] = { ...col[idx], ...data, updatedAt: nowTs() };
    saveCollection(collectionName, col);
  }
}

export async function removeDocument(collectionName, id) {
  let col = getCollection(collectionName);
  col = col.filter(d => d.id !== id);
  saveCollection(collectionName, col);
}

// ─── Students (all users with role=student) ────────────────────────────────────
export const getAllStudents = async () => {
  const col = getCollection('users');
  return col.filter(u => u.role === 'student');
};

// ─── Documents ─────────────────────────────────────────────────────────────────
export const getUserDocuments = async (ownerUid) => {
  const col = getCollection('documents');
  return col.filter(d => d.ownerUid === ownerUid);
};
export const getAllDocumentsAdmin = () => getDocuments('documents');
export const addFileRecord = (data) => addDocument('documents', data);
export const updateFileRecord = (id, data) => updateDocument('documents', id, data);
export const deleteFileRecord = (id) => removeDocument('documents', id);

// ─── Applications ──────────────────────────────────────────────────────────────
export const getUserApplications = async (ownerUid) => {
  const col = getCollection('applications');
  return col.filter(a => a.ownerUid === ownerUid);
};
export const getAllApplications = () => getDocuments('applications');
export const addApplication = (data) => addDocument('applications', data);
export const updateApplication = (id, data) => updateDocument('applications', id, data);

// ─── Users / agencies ──────────────────────────────────────────────────────────
export const getAllUsers = () => getDocuments('users');
export const getAllAgencies = async () => {
  const col = getCollection('users');
  return col.filter(u => u.role === 'agency');
};

// ─── Universities — 19 real partner universities from partnersportaltr.com ─────
export const UNIVERSITIES = [
  {
    id: 'u1', logo: '🏥',
    name: 'Istanbul Okan University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 4, totalPrograms: 245,
    programs: ['Nursing','Physiotherapy & Rehabilitation','Child Development','Medicine','Engineering','Business Administration','Law','Architecture','Dentistry','Pharmacy','Psychology'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'],
    tuitionRange: 'USD 3,500 – 10,000',
    languages: ['Turkish','English'],
    description: 'One of Istanbul\'s largest private universities with 4 campuses across the city and over 245 programs spanning health sciences, engineering, and business.',
  },
  {
    id: 'u2', logo: '🏥',
    name: 'Istanbul Medipol University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 4, totalPrograms: 166,
    programs: ['Medicine','Dentistry','Pharmacy','Nursing','Biomedical Engineering','Industrial Engineering','Physiotherapy','Psychology','Architecture','Law'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'],
    tuitionRange: 'USD 4,750 – 21,000',
    languages: ['Turkish','English'],
    description: 'A leading health-focused private university with campuses at Kavacık North & South, renowned for medicine, dentistry, and biomedical sciences.',
  },
  {
    id: 'u3', logo: '🎓',
    name: 'Istanbul Atlas University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 2, totalPrograms: 90,
    programs: ['Computer Engineering','Physiotherapy','Elderly Care','Nursing','Business Administration','Psychology','Interior Design','Architecture','Law','Medicine'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)'],
    tuitionRange: 'USD 2,900 – 10,000',
    languages: ['Turkish','English'],
    description: 'A growing private university in Kağıthane with strong programs in health sciences, engineering, and social sciences.',
  },
  {
    id: 'u4', logo: '🏙️',
    name: 'Istanbul Kent University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 2, totalPrograms: 88,
    programs: ['International Trade & Business','Computer Programming','Information Security Technology','Law','Architecture','Psychology','Design','Media & Communication'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)'],
    tuitionRange: 'USD 1,300 – 5,800',
    languages: ['Turkish','English'],
    description: 'Located in Kağıthane, Istanbul Kent University offers affordable programs with strong discounts and a wide variety of vocational and bachelor degrees.',
  },
  {
    id: 'u5', logo: '🕌',
    name: 'Istanbul Topkapi University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 8, totalPrograms: 148,
    programs: ['Digital Game Design','Tourism & Hospitality','Architecture','Engineering','Law','Nursing','Health Sciences','Media','Business Administration','Green Building Technology'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'],
    tuitionRange: 'USD 1,500 – 8,000',
    languages: ['Turkish','English'],
    description: 'With 8 campuses across Istanbul including Altunizade, Bahçeşehir, and Kazlıçeşme, Topkapi is one of the most accessible private universities in Turkey.',
  },
  {
    id: 'u6', logo: '⚽',
    name: 'Istanbul Beykoz University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 7, totalPrograms: 61,
    programs: ['Cartoon & Animation','Public Relations & Advertising','Rail Systems Management','Sports Management','Graphic Design','Communication','Film & TV'],
    degrees: ['Vocational','Bachelor','Master (Non-Thesis)'],
    tuitionRange: 'USD 1,700 – 5,000',
    languages: ['Turkish'],
    description: 'Specialising in creative arts, media, and communication, Istanbul Beykoz University has 7 campuses in the Beykoz district of Istanbul.',
  },
  {
    id: 'u7', logo: '🎓',
    name: 'Istanbul Arel University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 3, totalPrograms: 117,
    programs: ['Business Management','Graphic Design','Child Development','Psychology','Law','Engineering','Nursing','Health Sciences','Architecture'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)'],
    tuitionRange: 'USD 1,500 – 6,000',
    languages: ['Turkish','English'],
    description: 'Istanbul Arel University operates across 3 campuses in Sefaköy and Cevizlibağ, offering a broad range of programs at competitive tuition rates.',
  },
  {
    id: 'u8', logo: '🌟',
    name: 'Istanbul Yeni Yüzyıl University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 5, totalPrograms: 76,
    programs: ['Political Science & International Relations','Economy & Finance','Painting Restoration & Technology','Nursing','Medicine','Dentistry','Health Sciences'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)'],
    tuitionRange: 'USD 1,250 – 7,000',
    languages: ['Turkish'],
    description: 'With 5 campuses across Istanbul, Yeni Yüzyıl University combines health sciences with social sciences and arts restoration programs.',
  },
  {
    id: 'u9', logo: '🏢',
    name: 'Istanbul Beykent University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 4, totalPrograms: 202,
    programs: ['Management Information Systems','Artificial Intelligence','Economics & Finance','Law','Architecture','Engineering','Design','Health Sciences','Business Administration','Nursing'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'],
    tuitionRange: 'USD 1,600 – 8,000',
    languages: ['Turkish','English'],
    description: 'One of Istanbul\'s largest private universities by programs (202+), Beykent has campuses in Hadımköy and Taksim with strong focus on technology and business.',
  },
  {
    id: 'u10', logo: '✨',
    name: 'Istanbul Nişantaşı University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 3, totalPrograms: 202,
    programs: ['Human Resources Management','Justice','Interior Design','Fashion Design','Psychology','Business Administration','Architecture','Health Sciences','Social Work'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)'],
    tuitionRange: 'USD 1,900 – 6,000',
    languages: ['Turkish','English'],
    description: 'Located in the upscale Kağıthane district, Nişantaşı University is known for design, fashion, and business programs with a modern campus environment.',
  },
  {
    id: 'u11', logo: '🔬',
    name: 'Istanbul Health and Technology University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 1, totalPrograms: 28,
    programs: ['Mechatronics Engineering','Dentistry','Pharmacy','Nursing','Physiotherapy','Health Management','Biomedical Engineering'],
    degrees: ['Bachelor','Master (Thesis)','Master (Non-Thesis)'],
    tuitionRange: 'USD 3,000 – 13,000',
    languages: ['Turkish'],
    description: 'A specialist health and technology university in Beyoğlu with a focused curriculum centred on medical and engineering sciences.',
  },
  {
    id: 'u12', logo: '🔬',
    name: 'Istanbul Biruni University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 1, totalPrograms: 91,
    programs: ['Medicine','Dentistry','Pharmacy','Biomedical Engineering','Speech & Language Therapy','Nursing','Physiotherapy','Psychology','Law'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'],
    tuitionRange: 'USD 2,700 – 21,000',
    languages: ['Turkish','English'],
    description: 'Biruni University in Cevizlibağ specialises in medical and health sciences. Its English-medium Medicine program is one of the most sought-after in Turkey.',
  },
  {
    id: 'u13', logo: '🏭',
    name: 'Istanbul Gedik University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 5, totalPrograms: 117,
    programs: ['Business Administration','Materials Engineering & Nanotechnology','Medical Documentation','Nursing','Engineering','Architecture','Law','Social Sciences'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)'],
    tuitionRange: 'USD 1,400 – 6,000',
    languages: ['Turkish'],
    description: 'With 5 campuses including Kartal and Pendik, Gedik University focuses on technical and health programs at affordable price points.',
  },
  {
    id: 'u14', logo: '🎭',
    name: 'Istanbul Kültür University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 7, totalPrograms: 138,
    programs: ['Radio, TV & Cinema','Education Management','Architecture','Engineering','Law','Psychology','Business','International Relations','Fine Arts'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'],
    tuitionRange: 'USD 3,000 – 9,000',
    languages: ['Turkish','English'],
    description: 'Istanbul Kültür University operates 7 campuses including Yenibosna and is well-regarded for arts, architecture, and media programs.',
  },
  {
    id: 'u15', logo: '☪️',
    name: 'Istanbul Sabahattin Zaim University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 4, totalPrograms: 120,
    programs: ['Electrical & Electronics Engineering','Islamic Economics & Finance','Islamic Studies','Business Administration','Engineering','Health Sciences','Education','Social Sciences'],
    degrees: ['Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'],
    tuitionRange: 'USD 8,000 – 12,000',
    languages: ['Turkish','English'],
    description: 'Based in the Halkalı Central Campus, Sabahattin Zaim University is known for Islamic economics, engineering, and social science programs in English and Turkish.',
  },
  {
    id: 'u16', logo: '🌱',
    name: 'Istanbul Gelişim University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 3, totalPrograms: 172,
    programs: ['Occupational Therapy','Banking & Insurance','Electronic Commerce & Management','Nursing','Engineering','Architecture','Law','Psychology','Design'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'],
    tuitionRange: 'USD 2,000 – 9,000',
    languages: ['Turkish','English'],
    description: 'Istanbul Gelişim University in Avcılar is one of the fastest-growing private universities, offering 172+ programs with generous scholarship discounts.',
  },
  {
    id: 'u17', logo: '🧠',
    name: 'Istanbul Üsküdar University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 3, totalPrograms: 160,
    programs: ['Sociology','Engineering Management','Medicinal & Aromatic Plants','Psychology','Neuroscience','Nursing','Physiotherapy','Film & TV','Social Services'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'],
    tuitionRange: 'USD 1,400 – 9,000',
    languages: ['Turkish','English'],
    description: 'Üsküdar University is Turkey\'s first university focused on neuroscience and psychology, with campuses in Altunizade offering 160 programs.',
  },
  {
    id: 'u18', logo: '⚽',
    name: 'Istanbul Fenerbahçe University',
    city: 'Istanbul', country: 'Turkey',
    type: 'Private', campuses: 3, totalPrograms: 67,
    programs: ['Physiotherapy & Rehabilitation','Pharmacy','Business Administration','Sports Sciences','Nutrition & Dietetics','Nursing','Engineering','Psychology'],
    degrees: ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)'],
    tuitionRange: 'USD 3,000 – 20,000',
    languages: ['Turkish','English'],
    description: 'Associated with the iconic Fenerbahçe Sports Club, this university in Ataşehir offers health, sports, and business programs in both Turkish and English.',
  },
  {
    id: 'u19', logo: '🏙️',
    name: 'Tokat Gaziosmanpaşa University',
    city: 'Tokat', country: 'Turkey',
    type: 'Public', campuses: 1, totalPrograms: 0,
    programs: ['Engineering','Agriculture','Medicine','Education','Economics','Arts & Sciences'],
    degrees: ['Bachelor','Master','PhD'],
    tuitionRange: 'Public – Low tuition',
    languages: ['Turkish'],
    description: 'A public university in Tokat currently listed as inactive on the partners portal. Contact admin for availability.',
  },
];

export const getUniversities = async () => UNIVERSITIES;
