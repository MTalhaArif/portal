'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateDocument } from '@/lib/firestore';

export default function AdminSettingsPage() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState('personal');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (profile) setForm({ fullName: profile.fullName || '', email: profile.email || '', phone: profile.phone || '' });
  }, [profile]);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(''), 3000); };

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDocument('users', user.uid, { fullName: form.fullName, phone: form.phone });
      showToast('Settings saved');
    } catch { showToast('Failed to save', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Settings</h1>
        <p className="page-subtitle">Manage your admin profile</p>
      </div>
      <div className="tabs">
        <button className={`tab-btn ${tab === 'personal' ? 'active' : ''}`} onClick={() => setTab('personal')}>Personal</button>
        <button className={`tab-btn ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Security</button>
      </div>
      {tab === 'personal' && (
        <div className="card" style={{ padding: 28, maxWidth: 500 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Admin Profile</h2>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={form.fullName} onChange={set('fullName')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email (read-only)</label>
              <input type="email" className="form-input" value={form.email} readOnly style={{ opacity: .6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" value={form.phone} onChange={set('phone')} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
      {tab === 'security' && (
        <div className="card" style={{ padding: 28, maxWidth: 500 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Password Reset</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
            Use the link below to send a password reset email to your inbox.
          </p>
          <a href="/forgot-password" className="btn btn-outline">Send Password Reset Email</a>
        </div>
      )}
      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}
    </div>
  );
}
