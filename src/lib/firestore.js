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
import UNIVERSITIES_DATA from './universities_data.json';

function initUniversities() {
  if (typeof window === 'undefined') return UNIVERSITIES_DATA;
  const cached = localStorage.getItem('pp_col_universities_v2');
  if (!cached || cached === '[]') {
    localStorage.setItem('pp_col_universities_v2', JSON.stringify(UNIVERSITIES_DATA));
    return UNIVERSITIES_DATA;
  }
  try {
    return JSON.parse(cached);
  } catch (e) {
    return UNIVERSITIES_DATA;
  }
}

// We mutate this array for in-memory updates without reload
export const UNIVERSITIES = initUniversities();

export const getUniversities = async () => getCollection('universities');

export const addUniversity = async (data) => {
  const id = await addDocument('universities', data);
  UNIVERSITIES.unshift({ ...data, id });
  return id;
};

export const updateUniversity = async (id, data) => {
  await updateDocument('universities', id, data);
  const idx = UNIVERSITIES.findIndex(u => u.id === id);
  if (idx !== -1) Object.assign(UNIVERSITIES[idx], data);
};

export const removeUniversity = async (id) => {
  await removeDocument('universities', id);
  const idx = UNIVERSITIES.findIndex(u => u.id === id);
  if (idx !== -1) UNIVERSITIES.splice(idx, 1);
};
