'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AgencyLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (profile?.role === 'admin')   router.push('/admin/dashboard');
      else if (profile?.role === 'student') router.push('/student/dashboard');
    }
  }, [user, profile, loading, router]);

  if (loading || !user) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg)' }}>
      <span className="spinner spinner-dark" style={{ width:36, height:36 }} />
    </div>
  );

  return (
    <div style={{ display:'flex' }}>
      <Sidebar role="agency" />
      <div style={{ marginLeft:'var(--sidebar-w)', marginTop:'var(--header-h)', flex:1, minHeight:'calc(100vh - var(--header-h))', padding:'28px', background:'var(--bg)' }}>
        <Header />
        {children}
      </div>
    </div>
  );
}
