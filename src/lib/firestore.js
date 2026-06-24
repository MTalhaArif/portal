import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Generic helpers ───────────────────────────────────────────────────────────
export async function addDocument(collectionName, data) {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getDocuments(collectionName, constraints = []) {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDocumentById(collectionName, id) {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateDocument(collectionName, id, data) {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function removeDocument(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}

// ─── Clients ───────────────────────────────────────────────────────────────────
export const getClients = (ownerUid) =>
  getDocuments('clients', [where('ownerUid', '==', ownerUid), orderBy('createdAt', 'desc')]);

export const getAllClients = () =>
  getDocuments('clients', [orderBy('createdAt', 'desc')]);

export const addClient = (data) => addDocument('clients', data);
export const updateClient = (id, data) => updateDocument('clients', id, data);
export const deleteClient = (id) => removeDocument('clients', id);

// ─── Documents (uploaded files) ────────────────────────────────────────────────
export const getUserDocuments = (ownerUid) =>
  getDocuments('documents', [where('ownerUid', '==', ownerUid), orderBy('createdAt', 'desc')]);

export const getAllDocumentsAdmin = () =>
  getDocuments('documents', [orderBy('createdAt', 'desc')]);

export const addFileRecord = (data) => addDocument('documents', data);
export const updateFileRecord = (id, data) => updateDocument('documents', id, data);
export const deleteFileRecord = (id) => removeDocument('documents', id);

// ─── Applications ──────────────────────────────────────────────────────────────
export const getUserApplications = (ownerUid) =>
  getDocuments('applications', [where('ownerUid', '==', ownerUid), orderBy('createdAt', 'desc')]);

export const getAllApplications = () =>
  getDocuments('applications', [orderBy('createdAt', 'desc')]);

export const addApplication = (data) => addDocument('applications', data);
export const updateApplication = (id, data) => updateDocument('applications', id, data);

// ─── Users (admin) ─────────────────────────────────────────────────────────────
export const getAllUsers = () =>
  getDocuments('users', [orderBy('createdAt', 'desc')]);
