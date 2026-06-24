'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateDocument } from '@/lib/firestore';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState('personal');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', company: '', country: '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({ fullName: profile.fullName || '', email: profile.email || '',
        phone: profile.phone || '', company: profile.company || '', country: profile.country || '' });
    }
  }, [profile]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3000);
  };

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const setPw = (f) => (e) => setPwForm(p => ({ ...p, [f]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDocument('users', user.uid, { fullName: form.fullName, phone: form.phone, company: form.company, country: form.country });
      showToast('Profile updated successfully');
    } catch {
      showToast('Update failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Tab bar */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'personal' ? 'active' : ''}`} onClick={() => setTab('personal')}>
          Personal Details
        </button>
        <button className={`tab-btn ${tab === 'company' ? 'active' : ''}`} onClick={() => setTab('company')}>
          Company Details
        </button>
        <button className={`tab-btn ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>
          Security
        </button>
      </div>

      {tab === 'personal' && (
        <div className="card" style={{ padding: 28, maxWidth: 600 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Personal Information</h2>
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
              <div className="form-group">
                <label className="form-label">Country</label>
                <input type="text" className="form-input" value={form.country} onChange={set('country')} />
              </div>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'company' && (
        <div className="card" style={{ padding: 28, maxWidth: 600 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Company / Agency Details</h2>
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Company / Agency Name</label>
              <input type="text" className="form-input" value={form.company} onChange={set('company')} />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input type="text" className="form-input" value={form.country} onChange={set('country')} />
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Save Company Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card" style={{ padding: 28, maxWidth: 600 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Change Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
            Use the Forgot Password link on the login page to receive a secure reset email.
          </p>
          <a href="/forgot-password" className="btn btn-outline">
            Send Password Reset Email
          </a>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}
