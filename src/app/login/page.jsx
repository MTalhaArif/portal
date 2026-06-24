'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, FileText, Shield, Users } from 'lucide-react';
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
      if (profile?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
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
          Streamlining client admissions and document management — fast, reliable, and smart.
        </p>
        <div className={styles.dividerLine} />
        <ul className={styles.featureList}>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><Users size={16} /></span>
            Manage all your clients in one place
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><FileText size={16} /></span>
            Secure document upload & tracking
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><Shield size={16} /></span>
            Admin review & approval workflow
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
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>

          <div className={styles.linkRow}>
            <span className="text-sm text-muted">Don&apos;t have an account?</span>
            <Link href="/signup" className={styles.link}>Sign up</Link>
          </div>
          <div className={styles.linkRow}>
            <span />
            <Link href="/forgot-password" className={styles.link}>Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFriendlyError(code) {
  switch (code) {
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    default: return 'Sign in failed. Please try again.';
  }
}
