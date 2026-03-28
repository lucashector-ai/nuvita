// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function DashboardPage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    getSession().then(session => {
      if (!session) {
        router.replace('/login');
      } else {
        setOk(true);
      }
    });
  }, []);

  if (!ok) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:13, color:'var(--ts)' }}>Carregando...</div>
    </div>
  );

  return <DashboardShell/>;
}
