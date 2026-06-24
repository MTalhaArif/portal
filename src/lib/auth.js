// ─── localStorage Auth (zero-config) ──────────────────────────────────────────
import { auth } from './firebase';

function getUsers() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('pp_users') || '[]'); } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem('pp_users', JSON.stringify(users));
}

// ─── Register (students only — agencies are created by admin) ─────────────────
export async function registerUser({ email, password, fullName, phone, nationality, dateOfBirth, role = 'student' }) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    const err = new Error('Email already in use');
    err.code = 'auth/email-already-in-use';
    throw err;
  }
  const uid = 'uid_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  const user = {
    uid, email, password, fullName,
    phone: phone || '', nationality: nationality || '',
    dateOfBirth: dateOfBirth || '',
    role,   // 'student' | 'agency' | 'admin'
    status: 'active',
    photoURL: '', createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);

  const col = getCollection('users');
  col.push({ ...user, id: uid });
  saveCollection('users', col);

  const sessionUser = { uid, email, displayName: fullName };
  auth._notify(sessionUser);
  return sessionUser;
}

// ─── Create Agency account (admin only) ───────────────────────────────────────
export async function createAgencyAccount({ email, password, fullName, company, phone }) {
  return registerUser({ email, password, fullName, phone, role: 'agency' });
}

// ─── Login ─────────────────────────────────────────────────────────────────────
export async function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    const err = new Error('Invalid credential');
    err.code = 'auth/invalid-credential';
    throw err;
  }
  const sessionUser = { uid: user.uid, email: user.email, displayName: user.fullName };
  auth._notify(sessionUser);
  return sessionUser;
}

// ─── Logout ────────────────────────────────────────────────────────────────────
export async function logoutUser() {
  auth._notify(null);
}

// ─── Get user profile ──────────────────────────────────────────────────────────
export async function getUserProfile(uid) {
  const col = getCollection('users');
  return col.find(u => u.uid === uid || u.id === uid) || null;
}

// ─── Password reset (local — informational only) ───────────────────────────────
export async function resetPassword(email) {
  const users = getUsers();
  if (!users.find(u => u.email === email)) {
    const err = new Error('User not found');
    err.code = 'auth/user-not-found';
    throw err;
  }
  return true;
}

// ─── Helpers used by firestore.js ─────────────────────────────────────────────
export function getCollection(name) {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('pp_col_' + name) || '[]'); } catch { return []; }
}
export function saveCollection(name, data) {
  localStorage.setItem('pp_col_' + name, JSON.stringify(data));
}
