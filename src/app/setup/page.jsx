'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { registerUser, getCollection } from '@/lib/auth';
import styles from '../auth.module.css';

export default function SetupPage() {
  const router = useRouter();
  const [adminExists, setAdminExists] = useState(false);
  const [checking, setChecking] = useState(true);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirm: '',
  });

  useEffect(() => {
    // Check if an admin already exists
    const users = getCollection('users');
    const existingAdmin = users.find(u => u.role === 'admin');
    if (existingAdmin) setAdminExists(true);
    setChecking(false);
  }, []);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await registerUser({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: 'admin',
      });
      setDone(true);
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : err.message || 'Setup failed.');
    } finally { setLoading(false); }
  };

  if (checking) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg)' }}>
      <span className="spinner spinner-dark" style={{ width:36, height:36 }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #0d1b2a 0%, #1a2f4a 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:20, padding:40, width:'100%', maxWidth:460, boxShadow:'0 25px 60px rgba(0,0,0,.35)' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:60, height:60, background:'var(--primary)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:'1.4rem', fontWeight:900, color:'#fff', boxShadow:'0 6px 20px rgba(232,93,4,.4)' }}>
            PP
          </div>
          <h1 style={{ fontWeight:800, fontSize:'1.4rem', marginBottom:6 }}>Admin Setup</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>
            Create the first administrator account for Partners Portal
          </p>
        </div>

        {/* Admin already exists */}
        {adminExists && (
          <div style={{ background:'#fef3c7', border:'1px solid #f59e0b', borderRadius:10, padding:16, textAlign:'center' }}>
            <Shield size={24} color="#f59e0b" style={{ margin:'0 auto 10px', display:'block' }} />
            <p style={{ fontWeight:700, color:'#92400e', marginBottom:6 }}>Admin already configured</p>
            <p style={{ color:'#92400e', fontSize:'0.875rem', marginBottom:14 }}>
              An admin account already exists. This setup page is disabled.
            </p>
            <a href="/login" style={{ display:'inline-block', background:'var(--primary)', color:'#fff', padding:'10px 24px', borderRadius:8, fontWeight:600, fontSize:'0.875rem', textDecoration:'none' }}>
              Go to Login
            </a>
          </div>
        )}

        {/* Success state */}
        {!adminExists && done && (
          <div style={{ textAlign:'center' }}>
            <CheckCircle size={52} color="var(--success)" style={{ margin:'0 auto 14px', display:'block' }} />
            <h2 style={{ fontWeight:800, marginBottom:8 }}>Admin Account Created!</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem', marginBottom:6 }}>
              You are now logged in as <strong>{form.fullName}</strong>.
            </p>
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginBottom:24 }}>
              Use your email <strong>{form.email}</strong> and your chosen password to log in.
            </p>
            <a href="/admin/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--primary)', color:'#fff', padding:'12px 28px', borderRadius:10, fontWeight:700, textDecoration:'none', fontSize:'0.9rem' }}>
              <Shield size={16} /> Go to Admin Dashboard →
            </a>
          </div>
        )}

        {/* Setup form */}
        {!adminExists && !done && (
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', color:'#dc2626', fontSize:'0.875rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" placeholder="e.g. Talha Arif"
                value={form.fullName} onChange={set('fullName')} required id="setup-name" />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" placeholder="admin@yourcompany.com"
                value={form.email} onChange={set('email')} required id="setup-email" />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position:'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')} required
                  style={{ paddingRight:44 }} id="setup-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex', padding:0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className="form-input" placeholder="Repeat password"
                value={form.confirm} onChange={set('confirm')} required id="setup-confirm" />
            </div>

            <div style={{ background:'rgba(232,93,4,.06)', border:'1px solid rgba(232,93,4,.2)', borderRadius:8, padding:'10px 14px', fontSize:'0.8rem', color:'var(--text-secondary)' }}>
              <Shield size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:6, color:'var(--primary)' }} />
              This creates a <strong>super-admin</strong> account. This page will be disabled after setup.
            </div>

            <button type="submit" id="setup-submit"
              style={{ background:'var(--primary)', color:'#fff', border:'none', borderRadius:10, padding:'13px', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
              disabled={loading}>
              {loading ? <span className="spinner" /> : <><Shield size={16} /> Create Admin Account</>}
            </button>

            <div style={{ textAlign:'center' }}>
              <a href="/login" style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                Already have an account? Sign in →
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
