'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, FileText, Shield, Users } from 'lucide-react';
import { registerUser } from '@/lib/auth';
import styles from '../auth.module.css';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', company: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        company: form.company,
        phone: form.phone,
        role: 'client',
      });
      router.push('/dashboard');
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
          Create your account and start managing your clients, documents and applications today.
        </p>
        <div className={styles.dividerLine} />
        <ul className={styles.featureList}>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><Users size={16} /></span>
            Client management dashboard
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><FileText size={16} /></span>
            Secure document vault
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><Shield size={16} /></span>
            Application tracking & approval
          </li>
        </ul>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formCard} style={{ maxWidth: 480 }}>
          <h1 className={styles.formTitle}>Create account</h1>
          <p className={styles.formSubtitle}>Join Partners Portal — it&apos;s free to get started</p>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="su-name" type="text" className="form-input" placeholder="John Smith"
                  value={form.fullName} onChange={set('fullName')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Company / Agency</label>
                <input id="su-company" type="text" className="form-input" placeholder="ABC Agency"
                  value={form.company} onChange={set('company')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input id="su-email" type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={set('email')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input id="su-phone" type="tel" className="form-input" placeholder="+1 234 567 890"
                  value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.passwordWrapper}>
                <input id="su-password" type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input id="su-confirm" type="password" className="form-input"
                placeholder="Repeat password" value={form.confirmPassword}
                onChange={set('confirmPassword')} required />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div className={styles.linkRow}>
            <span className="text-sm text-muted">Already have an account?</span>
            <Link href="/login" className={styles.link}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFriendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'This email is already registered.';
    case 'auth/weak-password': return 'Password is too weak. Use at least 6 characters.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    default: return 'Registration failed. Please try again.';
  }
}
