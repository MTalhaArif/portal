'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (profile?.role === 'admin') router.push('/admin/dashboard');
      else router.push('/dashboard');
    }
  }, [user, profile, loading, router]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)'
    }}>
      <span className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
    </div>
  );
}
