// @ts-nocheck
// ════════════════════════════════════════════════
//  NUVITA — components/quiz/screens/ScreenPricing.tsx
//  Tela de planos / pricing
// ════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import type { QuizAnswers } from '@/types';
import EmailModal from '@/components/modals/EmailModal';

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
        <EmailModal
          plan={selectedPlan}
          onSubmit={handleEmailSubmit}
          onClose={() => setEmailOpen(false)}
        />
      )}
    </div>
  );
}
