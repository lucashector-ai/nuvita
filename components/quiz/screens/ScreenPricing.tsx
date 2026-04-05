// @ts-nocheck
// ════════════════════════════════════════════════
//  NUVITA — components/quiz/screens/ScreenPricing.tsx
//  Tela de planos / pricing
// ════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import type { QuizAnswers } from '@/types';

interface Props {
  answers:   QuizAnswers;
  setAnswer: (p: Partial<QuizAnswers>) => void;
  onLogin:   () => void;
  onRevisao?: () => void;
  onBack:    () => void;
}

const PLANS = [
  {
    id: 'free' as const,
    tag: 'Grátis',
    name: 'Conta gratuita',
    price: '0',
    per: '',
    desc: 'Para quem quer ver o protocolo básico e explorar a plataforma.',
    features: [
      { label: 'Protocolo com 1 peptídeo visível' },
      { label: 'Acesso ao quiz completo' },
      { label: 'Biblioteca de peptídeos' },
      { label: 'Calculadora de doses' },
    ],
    cta: 'Começar grátis',
    feat: false,
  },
  {
    id: 'essencial' as const,
    tag: 'Mais popular',
    name: 'Essencial',
    price: '29',
    per: '/mês',
    desc: 'Para quem quer seguir o protocolo completo com acompanhamento.',
    features: [
      { label: 'Protocolo completo desbloqueado' },
      { label: 'Tracker semanal de aplicações' },
      { label: 'IA Nuvita (chat)' },
      { label: 'Histórico de ciclos' },
      { label: 'Calculadora avançada' },
    ],
    cta: 'Assinar Essencial',
    feat: true,
  },
  {
    id: 'pro' as const,
    tag: 'Completo',
    name: 'Pro',
    price: '59',
    per: '/mês',
    desc: 'Para quem quer revisão médica e suporte especializado.',
    features: [
      { label: 'Tudo do Essencial' },
      { label: 'Revisão médica do protocolo' },
      { label: 'Consultas mensais' },
      { label: 'Ajuste de doses personalizado' },
      { label: 'Suporte prioritário 24h' },
    ],
    cta: 'Assinar Pro',
    feat: false,
  },
];

export default function ScreenPricing({ setAnswer, onLogin, onRevisao, onBack }: Props) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'essencial' | 'pro'>('essencial');

  const openEmail = (plan: typeof selectedPlan) => {
    setSelectedPlan(plan);
    setEmailOpen(true);
  };

  const handleEmailSubmit = (email: string) => {
    setAnswer({ email, plano: selectedPlan, _activePlan: selectedPlan });
    setEmailOpen(false);
    setTimeout(() => onRevisao ? onRevisao() : onLogin(), 400);
  };

  const handleGoogle = async () => {
    const { supabase } = await import('@/lib/supabase');
    setAnswer({ plano: selectedPlan, _activePlan: selectedPlan });
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ts)', fontSize: 13, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto 1.5rem' }}
        >
          ← Voltar ao resultado
        </button>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', letterSpacing: '-.05em', marginBottom: '.5rem' }}>
          Escolha seu plano
        </h2>
        <p style={{ fontSize: 14, color: 'var(--tm)', maxWidth: 420, margin: '0 auto' }}>
          Comece grátis ou desbloqueie o protocolo completo com rastreamento e suporte médico.
        </p>
      </div>

      {/* Grid de planos */}
      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`plan${plan.feat ? ' feat' : ''}`}>
            <div className="plan-tag">{plan.tag}</div>
            <div className="plan-nm">{plan.name}</div>
            <div className="plan-pr">
              <span className="p-cur">R$</span>
              <span className="p-amt">{plan.price}</span>
              {plan.per && <span className="p-per">{plan.per}</span>}
            </div>
            <div className="plan-desc">{plan.desc}</div>
            <ul className="plan-fl">
              {plan.features.map((f, i) => (
                <li key={i} className="pf">
                  <div className="pf-c">
                    <svg width="9" height="9" fill="none" viewBox="0 0 9 9">
                      <path d="M1.5 4.5l2 2L7.5 2" stroke={plan.feat ? 'var(--green)' : 'var(--gm)'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>
            <button className="plan-btn" onClick={() => openEmail(plan.id)}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p style={{ fontSize: 11, color: 'var(--ts)', lineHeight: 1.6 }}>
          Cancele quando quiser. Sem fidelidade. Os peptídeos não estão inclusos nos planos — apenas o acesso à plataforma.
        </p>
      </div>

      {emailOpen && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center' }}
          onClick={e=>{ if(e.target===e.currentTarget) setEmailOpen(false); }}>
          <div style={{ background:'#F7F7F7',borderRadius:16,padding:'2rem',width:380,boxShadow:'0 20px 60px rgba(0,0,0,.3)' }}>
            <div style={{ fontSize:15,fontWeight:600,marginBottom:'1.25rem' }}>Criar conta — {selectedPlan}</div>
            {/* Google */}
            <button onClick={handleGoogle}
              style={{ width:'100%',padding:'11px',borderRadius:10,background:'#F7F7F7',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
              <div style={{ flex:1,height:1,background:'var(--border)' }}/>
              <span style={{ fontSize:11,color:'var(--ts)' }}>ou com e-mail</span>
              <div style={{ flex:1,height:1,background:'var(--border)' }}/>
            </div>
            <input
              type="email"
              placeholder="seu@email.com"
              id="pricing-email"
              style={{ width:'100%',padding:'10px 14px',borderRadius:10,background:'#FFFFFF',fontSize:13,fontFamily:'inherit',color:'var(--tx)',marginBottom:10,boxSizing:'border-box' , boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)' }}
            />
            <button
              onClick={() => {
                const el = document.getElementById('pricing-email') as HTMLInputElement;
                if (el?.value?.includes('@')) handleEmailSubmit(el.value);
              }}
              style={{ width:'100%',padding:'11px',borderRadius:10,border:'none',background:'var(--dark)',color:'white',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
              Continuar com e-mail →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
