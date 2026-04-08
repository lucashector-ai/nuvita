// @ts-nocheck
'use client';

export const metadata = {
  title: 'Dashboard — Nuvita',
  description: 'Plataforma de protocolos personalizados de peptídeos com diagnóstico por IA.',
};

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
export const dynamic = 'force-dynamic'
