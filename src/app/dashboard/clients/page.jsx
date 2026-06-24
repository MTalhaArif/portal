'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Clients page is replaced by Students in the new role structure
export default function ClientsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/students'); }, [router]);
  return null;
}
