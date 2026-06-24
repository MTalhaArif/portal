'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { resetPassword } from '@/lib/auth';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.split}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>PP</div>
          <div className={styles.brandTitle}>Partners<br /><span>Portal</span></div>
        </div>
        <p className={styles.tagline}>Reset your password and get back to managing your portal.</p>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Reset Password</h1>
          <p className={styles.formSubtitle}>We&apos;ll send a reset link to your email</p>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Mail size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Request received</p>
              <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
                Account found for <strong>{email}</strong>.
              </p>
              <p className="text-sm text-muted">
                In local mode, to reset your password please sign up again with a new account or contact your admin.
              </p>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, color: 'var(--primary)', fontWeight: 600 }}>
                <ArrowLeft size={16} /> Back to Sign in
              </Link>
            </div>
          ) : (
            <>
              {error && <div className={styles.errorMsg}>{error}</div>}
              <form className={styles.formGrid} onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input type="email" className="form-input" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Send Reset Link'}
                </button>
              </form>
              <div className={styles.linkRow}>
                <Link href="/login" className={styles.link} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={14} /> Back to Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
