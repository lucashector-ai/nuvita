// @ts-nocheck
'use client';
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import NuvitaLogo from '@/components/ui/NuvitaLogo';

export default function CadastroPage() {
  const router = useRouter();

  useEffect(() => {
    getSession().then(s => { if (s) router.replace('/dashboard'); });
  }, []);

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg2)' }}>
      {/* Lado esquerdo */}
      <div style={{ flex:1, background:'linear-gradient(135deg, #0F6E56 0%, #1D9E75 50%, #5EC991 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem' }}>
        <div style={{ color:'white', maxWidth:360 }}>
          <div style={{ marginBottom:'2rem' }}>
            <NuvitaLogo size={36} white/>
          </div>
          <h1 style={{ fontSize:'2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'1rem', lineHeight:1.2 }}>
            Comece com um diagnóstico gratuito
          </h1>
          <p style={{ fontSize:14, opacity:.85, lineHeight:1.7, marginBottom:'2rem' }}>
            Responda 11 perguntas e receba um protocolo personalizado gerado pela nossa IA especializada em peptídeos.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {['✓ Diagnóstico completo em 3 minutos', '✓ Protocolo gerado por IA', '✓ Revisão peptídeo a peptídeo', '✓ Acesso gratuito ao dashboard'].map(item => (
              <div key={item} style={{ fontSize:13, opacity:.9 }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado direito */}
      <div style={{ width:440, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--bg)' }}>
        <div style={{ width:'100%', maxWidth:360, textAlign:'center' }}>
          <h2 style={{ fontSize:'1.3rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.5rem' }}>Criar conta</h2>
          <p style={{ fontSize:13, color:'var(--ts)', marginBottom:'2rem', lineHeight:1.6 }}>
            Comece pelo diagnóstico. No final, você cria sua conta com e-mail + código.
          </p>
          <button className="btn btn-d fw" style={{ fontSize:15, padding:'14px' }} onClick={()=>router.push('/diagnostico')}>
            Iniciar diagnóstico gratuito →
          </button>
          <div style={{ textAlign:'center', marginTop:'1.25rem', fontSize:13, color:'var(--ts)' }}>
            Já tem conta?{' '}
            <span style={{ color:'var(--gm)', cursor:'pointer', fontWeight:500 }} onClick={()=>router.push('/login')}>
              Entrar
            </span>
          </div>
          <div style={{ marginTop:'2rem', padding:'1rem', background:'var(--bg2)', borderRadius:12, fontSize:12, color:'var(--ts)', lineHeight:1.6 }}>
            A criação de conta acontece automaticamente ao final do diagnóstico, quando você confirma seu e-mail.
          </div>
        </div>
      </div>
    </div>
  );
}
