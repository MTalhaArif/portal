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

// ─── Clients ───────────────────────────────────────────────────────────────────
export const getClients = async (ownerUid) => {
  const col = getCollection('clients');
  return col.filter(c => c.ownerUid === ownerUid);
};
export const getAllClients = () => getDocuments('clients');
export const addClient = (data) => addDocument('clients', data);
export const updateClient = (id, data) => updateDocument('clients', id, data);
export const deleteClient = (id) => removeDocument('clients', id);

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

// ─── Users ─────────────────────────────────────────────────────────────────────
export const getAllUsers = () => getDocuments('users');
