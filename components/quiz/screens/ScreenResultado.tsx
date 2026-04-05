// @ts-nocheck
'use client';

import { useMemo, useState, useEffect } from 'react';
import type { QuizAnswers } from '@/types';
import { buildProtocol } from '@/lib/peptides';
import { saveSession } from '@/lib/session';
import { getSession, salvarDiagnostico } from '@/lib/auth';
import { gerarProtocoloComIA } from '@/lib/gerarProtocolo';
import type { ProtocoloIA } from '@/lib/gerarProtocolo';
import EmailModal from '@/components/modals/EmailModal';
import PlanosModal from '@/components/modals/PlanosModal';

interface Props {
  answers:   QuizAnswers;
  setAnswer: (p: Partial<QuizAnswers>) => void;
  onUpgrade: () => void;
  onLogin:   () => void;
  onRevisao: () => void;
}

const PHASES = [
  { text: 'Analisando seus objetivos...', icon: '🎯' },
  { text: 'Avaliando seu perfil completo...', icon: '🔬' },
  { text: 'Consultando base de peptídeos...', icon: '⚗️' },
  { text: 'IA gerando protocolo personalizado...', icon: '🤖' },
  { text: 'Finalizando recomendações...', icon: '✨' },
];

const PRIO_STYLE = {
  essencial:   { bg:'#E1F5EE', cor:'#0F6E56', label:'Essencial'   },
  recomendado: { bg:'#FAEEDA', cor:'#633806', label:'Recomendado' },
  opcional:    { bg:'var(--bg2)', cor:'var(--ts)', label:'Opcional' },
};

export default function ScreenResultado({ answers, setAnswer, onLogin, onRevisao }: Props) {
  const [phaseIdx,    setPhaseIdx]    = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [visible,     setVisible]     = useState(false);
  const [planosOpen,  setPlanosOpen]  = useState(false);
  const [emailOpen,   setEmailOpen]   = useState(false);
  const [pendingPlan, setPendingPlan] = useState<'free'|'essencial'|'pro'>('free');
  const [protIA,      setProtIA]      = useState<ProtocoloIA|null>(null);
  const [hasSession,  setHasSession]  = useState(false);

  const peso = Number(answers.peso ?? 75);
  const objs = answers.q3 ?? ['gordura'];
  const nome = answers.nome ?? '';
  const { items } = useMemo(() => buildProtocol(objs, peso, 1, false), [objs, peso]);

  useEffect(() => {
    // Verifica sessão ativa ao carregar
    getSession().then(session => { if (session) setHasSession(true); });

    let i = 0;
    const iv = setInterval(() => { i++; if (i < PHASES.length) setPhaseIdx(i); else clearInterval(iv); }, 900);

    gerarProtocoloComIA(answers).then(resultado => {
      clearInterval(iv);
      if (resultado) {
        setProtIA(resultado);
        setAnswer({ _protocoloIA: JSON.stringify(resultado) });
        saveSession({ ...answers, _protocoloIA: JSON.stringify(resultado) });
      }
      setPhaseIdx(PHASES.length - 1);
      setTimeout(() => { setLoading(false); setTimeout(() => setVisible(true), 100); }, 400);
    });

    return () => clearInterval(iv);
  }, []);

  // Fluxo: planos → email → revisão
  const handleSelecionarPlano = (plano: 'free'|'essencial'|'pro') => {
    setPendingPlan(plano);
    setPlanosOpen(false);
    setEmailOpen(true);
  };

  const handleEmailSubmit = (email: string) => {
    const updated = { ...answers, email, plano: pendingPlan, _activePlan: pendingPlan };
    setAnswer({ email, plano: pendingPlan, _activePlan: pendingPlan });
    saveSession(updated);
    setEmailOpen(false);
    setTimeout(() => onRevisao(), 200);
  };

  const peptideos = protIA?.peptideos || items.slice(0, 4).map(item => ({
    nome: item.n, emoji: item.e, motivo: item.why || item.m,
    dose: item.doseStr(peso), timing: item.timing,
    frequencia: item.freq, via: item.route, ciclo: item.cycle,
    prioridade: 'recomendado' as const,
  }));

  if (loading) {
    return (
      <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1.5rem' }}>
        <div style={{ fontSize:'3rem' }}>{PHASES[phaseIdx]?.icon}</div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>{PHASES[phaseIdx]?.text}</div>
          <div style={{ fontSize:12, color:'var(--ts)' }}>A IA está analisando seu perfil completo...</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {PHASES.map((_, i) => (
            <div key={i} style={{ width:i===phaseIdx?20:6, height:6, borderRadius:3, background:i<=phaseIdx?'var(--green)':'var(--border)', transition:'all .3s' }}/>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ opacity:visible?1:0, transition:'opacity .4s', width:'100%' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--gp)', color:'var(--gm)', fontSize:11, fontWeight:500, padding:'4px 12px', borderRadius:100, marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'.06em' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)' }}/>
          Protocolo gerado por IA
        </div>
        <h1 style={{ fontSize:'1.8rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.5rem' }}>
          {nome ? `${nome}, seu protocolo está pronto.` : 'Seu protocolo está pronto.'}
        </h1>
        <p style={{ fontSize:14, color:'var(--tm)', maxWidth:560, margin:'0 auto' }}>
          {protIA?.resumo || `Selecionamos ${peptideos?.length} peptídeos para seus objetivos.`}
        </p>
      </div>

      {/* Grid principal — peptídeos + CTA desbloqueio */}
      <div style={{ display:'grid', gridTemplateColumns:'min(100%, calc(100vw - 2rem)) > 600px ? "1fr 340px" : "1fr"', gap:'1.5rem', alignItems:'start', marginBottom:'1.5rem' }} className="resultado-grid">

        {/* Coluna esquerda — lista de peptídeos */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {peptideos?.map((p, i) => {
            const ps = PRIO_STYLE[p.prioridade as keyof typeof PRIO_STYLE] || PRIO_STYLE.recomendado;
            const borrado = hasSession ? false : i > 0; // sem blur para quem já tem conta
            return (
              <div key={i} style={{ background:'#F7F7F7', borderRadius:14, padding:'1.25rem', borderLeft:`4px solid ${borrado?'var(--border)':ps.cor}`, filter:borrado?'blur(5px)':'none', userSelect:borrado?'none':'auto', pointerEvents:borrado?'none':'auto' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:'.75rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:'1.5rem' }}>{borrado?'🔒':p.emoji}</span>
                    <div>
                      <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)', marginBottom:2 }}>{borrado?'Peptídeo bloqueado':p.nome}</div>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:100, background:borrado?'var(--bg2)':ps.bg, color:borrado?'var(--ts)':ps.cor }}>{borrado?'Bloqueado':ps.label}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{borrado?'••• mcg':p.dose}</div>
                    <div style={{ fontSize:10, color:'var(--ts)' }}>{borrado?'SC':p.via}</div>
                  </div>
                </div>
                <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.6, marginBottom:'.75rem' }}>
                  {borrado ? 'Crie sua conta para ver o motivo e detalhes deste peptídeo.' : p.motivo}
                </p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {[['Timing', borrado?'•••':p.timing],['Freq.', borrado?'•••':p.frequencia],['Ciclo', borrado?'•••':p.ciclo]].map(([l,v]) => (
                    <div key={l} style={{ fontSize:11, background:'#FFFFFF', borderRadius:6, padding:'3px 9px', color:'var(--tm)' , boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)' }}>
                      <span style={{ color:'var(--ts)' }}>{l}:</span> {v}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coluna direita — CTA desbloqueio */}
        <div style={{ position:'sticky', top:24 }}>
          <div style={{ background:'var(--dark)', borderRadius:20, padding:'2rem', color:'white', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🔓</div>
            <div style={{ fontSize:18, fontWeight:500, letterSpacing:'-.03em', marginBottom:'.75rem', lineHeight:1.3 }}>
              {(peptideos?.length||0) - 1} peptídeos bloqueados
            </div>
            <p style={{ fontSize:13, opacity:.8, lineHeight:1.65, marginBottom:'1.5rem' }}>
              {hasSession ? 'Seu protocolo foi atualizado. Clique para acessar o dashboard.' : 'Crie sua conta para ver o protocolo completo — doses exatas, timing, justificativa da IA e acesso ao dashboard.'}
            </p>
            <button
              onClick={async () => {
                if (hasSession) {
                  const session = await getSession();
                  if (session) {
                    await salvarDiagnostico(session.user.id, { ...answers, _protocoloIA: protIA ? JSON.stringify(protIA) : answers._protocoloIA });
                    // Limpa session cache para forçar DashboardShell reler do banco
                    sessionStorage.removeItem('nv_quiz');
                    sessionStorage.setItem('nv_diagnostico_atualizado', '1');
                    onLogin(); // vai para o dashboard
                    return;
                  }
                }
                setPlanosOpen(true);
              }}
              style={{ width:'100%', padding:'14px', background:'var(--green)', border:'none', borderRadius:12, color:'white', fontFamily:'inherit', fontSize:15, fontWeight:500, cursor:'pointer', transition:'opacity .15s', marginBottom:8 }}
              onMouseEnter={e=>e.currentTarget.style.opacity='.9'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              {hasSession ? '→ Acessar meu protocolo' : '🚀 Desbloquear protocolo'}
            </button>
            <div style={{ fontSize:11, opacity:.5 }}>Gratuito, Essencial R$39 ou Pro R$79/mês</div>
          </div>

          {/* Observações da IA */}
          {protIA?.observacoes && (
            <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:14, padding:'1.25rem', marginTop:'1rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--gm)', marginBottom:'.5rem' }}>💡 Recomendações</div>
              <p style={{ fontSize:13, color:'var(--gm)', lineHeight:1.65, margin:0 }}>{protIA.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Aviso médico */}
      <div style={{ fontSize:12, color:'var(--ts)', textAlign:'center', lineHeight:1.6, padding:'1rem', background:'#FFFFFF', borderRadius:10 , boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)' }}>
        ⚠️ {protIA?.avisoMedico || 'Este protocolo tem fins educacionais. Não substitui avaliação médica profissional.'}
      </div>

      {/* Modal de planos */}
      {planosOpen && (
        <PlanosModal
          planoAtual="none"
          onClose={() => setPlanosOpen(false)}
          onSelect={handleSelecionarPlano}
        />
      )}

      {/* Modal de email/login */}
      {emailOpen && (
        <EmailModal
          plan={pendingPlan}
          answers={answers}
          onSubmit={handleEmailSubmit}
          onClose={() => setEmailOpen(false)}
        />
      )}
    </div>
  );
}
