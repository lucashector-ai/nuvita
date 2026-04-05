'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Esta página captura qualquer /dashboard/SLUG e redireciona
// para o DashboardShell com a seção correta ativada
export default function DashboardSecaoPage() {
  const router = useRouter();
  const params = useParams();
  const secao = params?.secao as string;

  useEffect(() => {
    // Redireciona para /dashboard com o hash da seção
    // O DashboardShell lê o pathname e ativa a seção
    router.replace(`/dashboard#${secao}`);
  }, [secao]);

  return null;
}
