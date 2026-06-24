// ─── Local Storage Backend ─────────────────────────────────────────────────────
// This is a zero-config in-browser backend. All data persists in localStorage.
// To migrate to real Firebase later, just replace this file with the original.

export const auth = {
  currentUser: null,
  _listeners: [],
  onAuthStateChanged(cb) {
    this._listeners.push(cb);
    // Fire immediately with current state
    const stored = typeof window !== 'undefined' ? localStorage.getItem('pp_session') : null;
    if (stored) {
      try { cb(JSON.parse(stored)); } catch { cb(null); }
    } else {
      cb(null);
    }
    return () => { this._listeners = this._listeners.filter(l => l !== cb); };
  },
  _notify(user) {
    this.currentUser = user;
    this._listeners.forEach(cb => cb(user));
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('pp_session', JSON.stringify(user));
      else localStorage.removeItem('pp_session');
    }
  },
};

export const db = {}; // Placeholder — real calls go through our helpers below
export const storage = {}; // Placeholder

export default {};
