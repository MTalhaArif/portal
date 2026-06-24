import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// ─── Register ──────────────────────────────────────────────────────────────────
export async function registerUser({ email, password, fullName, company, phone, role = 'client' }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: fullName });

  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    fullName,
    company: company || '',
    phone: phone || '',
    role,           // 'client' | 'admin'
    status: 'active',
    photoURL: '',
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

// ─── Login ─────────────────────────────────────────────────────────────────────
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ─── Logout ────────────────────────────────────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
}

// ─── Get user profile from Firestore ──────────────────────────────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ─── Password reset ────────────────────────────────────────────────────────────
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
