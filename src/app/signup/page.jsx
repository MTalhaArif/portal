'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GraduationCap, FileText, Globe } from 'lucide-react';
import { registerUser } from '@/lib/auth';
import styles from '../auth.module.css';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', nationality: '',
    dateOfBirth: '', password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await registerUser({
        email: form.email, password: form.password,
        fullName: form.fullName, phone: form.phone,
        nationality: form.nationality, dateOfBirth: form.dateOfBirth,
        role: 'student',
      });
      router.push('/student/dashboard');
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.split}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>PP</div>
          <div className={styles.brandTitle}>Partners<br /><span>Portal</span></div>
        </div>
        <div style={{ background: 'rgba(232,93,4,.15)', border: '1px solid rgba(232,93,4,.3)', borderRadius: 10, padding: '12px 20px', marginBottom: 20, textAlign: 'center' }}>
          <GraduationCap size={20} color="var(--primary)" style={{ marginBottom: 6 }} />
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Student Registration</p>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '0.8rem' }}>This portal is for students only</p>
        </div>
        <p className={styles.tagline}>
          Apply to top Turkish universities, upload your documents and track your application — all in one place.
        </p>
        <div className={styles.dividerLine} />
        <ul className={styles.featureList}>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><GraduationCap size={16} /></span>
            Browse &amp; apply to universities
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><FileText size={16} /></span>
            Secure document upload
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}><Globe size={16} /></span>
            Track your application status
          </li>
        </ul>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formCard} style={{ maxWidth: 500 }}>
          <h1 className={styles.formTitle}>Student Sign Up</h1>
          <p className={styles.formSubtitle}>Create your student account — it&apos;s free</p>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input id="su-name" type="text" className="form-input" placeholder="John Smith"
                  value={form.fullName} onChange={set('fullName')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nationality *</label>
                <input id="su-nationality" type="text" className="form-input" placeholder="e.g. Pakistani"
                  value={form.nationality} onChange={set('nationality')} required />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Email *</label>
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
              <label className="form-label">Date of Birth</label>
              <input id="su-dob" type="date" className="form-input"
                value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className={styles.passwordWrapper}>
                <input id="su-password" type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input id="su-confirm" type="password" className="form-input"
                placeholder="Repeat password" value={form.confirmPassword}
                onChange={set('confirmPassword')} required />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Student Account'}
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
    case 'auth/weak-password':         return 'Password is too weak.';
    case 'auth/invalid-email':         return 'Please enter a valid email address.';
    default: return 'Registration failed. Please try again.';
  }
}
