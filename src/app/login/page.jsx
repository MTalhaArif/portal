'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GraduationCap, FileText, Shield, Building2 } from 'lucide-react';
import { loginUser } from '@/lib/auth';
import { getUserProfile } from '@/lib/auth';
import styles from '../auth.module.css';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      const profile = await getUserProfile(user.uid);
      if (profile?.role === 'admin')  router.push('/admin/dashboard');
      else if (profile?.role === 'agency') router.push('/dashboard');
      else router.push('/student/dashboard');
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.split}>
      {/* Left branding panel */}
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>PP</div>
          <div className={styles.brandTitle}>Partners<br /><span>Portal</span></div>
        </div>
        <p className={styles.tagline}>
          Your gateway to Turkish universities — students, agencies, and admins in one place.
        </p>
        <div className={styles.dividerLine} />
        <ul className={styles.featureList}>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><GraduationCap size={16} /></span>
            Students — apply &amp; upload documents
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><Building2 size={16} /></span>
            Agencies — manage applicants
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><Shield size={16} /></span>
            Admins — full platform control
          </li>
        </ul>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Welcome back</h1>
          <p className={styles.formSubtitle}>Sign in to your Partners Portal account</p>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input id="login-email" type="email" className="form-input"
                placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.passwordWrapper}>
                <input id="login-password" type={showPass ? 'text' : 'password'}
                  className="form-input" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>

          {/* Student signup only */}
          <div style={{ marginTop: 20, padding: '16px', background: '#f8f9fa', borderRadius: 10, textAlign: 'center', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              <GraduationCap size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Are you a <strong>student</strong>?
            </p>
            <Link href="/signup" className={styles.link} style={{ fontSize: '0.9rem' }}>
              Create a student account →
            </Link>
          </div>

          <div className={styles.linkRow} style={{ marginTop: 12, justifyContent: 'center' }}>
            <Link href="/forgot-password" className={styles.link} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFriendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':    return 'No account found with this email.';
    case 'auth/wrong-password':    return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    default: return 'Sign in failed. Please try again.';
  }
}
