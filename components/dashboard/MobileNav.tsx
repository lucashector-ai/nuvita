// @ts-nocheck
'use client';

import { useState } from 'react';
import type { DashSection } from './DashboardShell';

interface Props {
  active: DashSection;
  onNavigate: (s: DashSection) => void;
  plan: string;
  nome?: string;
}

const MAIS_ITEMS = [
  { grupo:'Acompanhamento', items:[
    { id:'tracker',      label:'Tracker de evolução',    ico:'📈', desc:'Peso, energia e sono' },
    { id:'diario',       label:'Diário de sintomas',     ico:'📋', desc:'Registre efeitos' },
    { id:'consistencia', label:'Consistência',           ico:'📊', desc:'Score de adesão' },
    { id:'analise',      label:'Análise',                ico:'🔍', desc:'Insights do ciclo' },
    { id:'historico',    label:'Histórico',              ico:'🗃️', desc:'Ciclos anteriores' },
    { id:'calendario',   label:'Calendário',             ico:'📅', desc:'Cronograma' },
  ]},
  { grupo:'Inteligência', items:[
    { id:'ia',           label:'IA Nuvita',              ico:'🤖', desc:'Chat especializado' },
    { id:'coach',        label:'Coach IA',               ico:'👤', desc:'Orientação pessoal' },
    { id:'ajuste',       label:'Ajuste automático',      ico:'⚙️', desc:'Reajuste de doses' },
    { id:'detector',     label:'Detector',               ico:'⚠️', desc:'Alerta de falhas' },
  ]},
  { grupo:'Planejamento', items:[
    { id:'simulador',    label:'Simulador',              ico:'🧪', desc:'Simule ciclos' },
    { id:'fases',        label:'Fases',                  ico:'📊', desc:'Etapas do protocolo' },
    { id:'rotina',       label:'Rotina complementar',    ico:'🗓️', desc:'Planner semanal' },
    { id:'geradorciclo', label:'Gerador de ciclo',       ico:'🔄', desc:'Crie ciclos' },
  ]},
  { grupo:'Logística', items:[
    { id:'estoque',      label:'Estoque',                ico:'🧪', desc:'Controle de frascos' },
    { id:'calc',         label:'Calculadora',            ico:'🔬', desc:'Doses e volumes' },
    { id:'lib',          label:'Biblioteca',             ico:'📚', desc:'25+ peptídeos' },
    { id:'exportacao',   label:'Exportar protocolo',     ico:'📤', desc:'PDF e WhatsApp' },
  ]},
  { grupo:'Conta', items:[
    { id:'medico',       label:'Consulta médica',        ico:'👨‍⚕️', desc:'Especialista Pro', proOnly:true },
    { id:'planos',       label:'Planos',                 ico:'⚡', desc:'Free · Essencial · Pro' },
    { id:'conta',        label:'Minha conta',            ico:'💳', desc:'Assinatura e faturas' },
    { id:'perfil',       label:'Perfil',                 ico:'👤', desc:'Seus dados' },
    { id:'config',       label:'Configurações',          ico:'⚙️', desc:'Notificações e email' },
  ]},
];

const NAV_ITEMS: { id: DashSection; label: string; ico: (a: boolean) => JSX.Element }[] = [
  { id:'inicio',    label:'Início',
    ico: (a) => <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth={a?2:1.4} fill={a?"currentColor":"none"} strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id:'protocolo', label:'Protocolo',
    ico: (a) => <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="4" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth={a?2:1.4}/><path d="M8 8h6M8 12h6M8 16h4" stroke="currentColor" strokeWidth={a?2:1.4} strokeLinecap="round"/></svg> },
  { id:'tracker',   label:'Tracker',
    ico: (a) => <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><polyline points="3,17 8,10 12,14 16,7 20,10" stroke="currentColor" strokeWidth={a?2:1.4} strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg> },
  { id:'ia',        label:'IA',
    ico: (a) => <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth={a?2:1.4}/><circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth={a?2:1.4}/><circle cx="11" cy="11" r="1" fill="currentColor"/></svg> },
];

export default function MobileNav({ active, onNavigate, plan, nome }: Props) {
  const [showMais, setShowMais] = useState(false);

  const handleNav = (id: DashSection) => {
    setShowMais(false);
    onNavigate(id);
  };

  return (
    <>
      {/* Tela cheia do menu "Mais" */}
      {showMais && (
        <div style={{ position:'fixed', inset:0, background:'var(--bg2)', zIndex:998, display:'flex', flexDirection:'column', overflowY:'auto', paddingBottom:80 }}>
          {/* Header */}
          <div style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)', padding:'16px 20px 12px', flexShrink:0 }}>
            <div style={{ fontSize:11, color:'var(--ts)', marginBottom:2 }}>Menu</div>
            <div style={{ fontSize:18, fontWeight:500, color:'var(--tx)', letterSpacing:'-.03em' }}>Nuvita</div>
          </div>

          {/* Grupos */}
          {MAIS_ITEMS.map(grupo => (
            <div key={grupo.grupo} style={{ marginTop:8 }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', padding:'8px 20px 4px' }}>
                {grupo.grupo}
              </div>
              <div style={{ background:'var(--bg)', marginHorizontal:0 }}>
                {grupo.items.map((item, i) => {
                  const bloqueado = (item as any).proOnly && plan !== 'pro';
                  const isActive  = active === item.id;
                  return (
                    <div key={item.id}
                      onClick={() => handleNav(item.id as DashSection)}
                      style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', cursor:'pointer', background:isActive?'var(--gp)':'var(--bg)', borderBottom: i < grupo.items.length-1 ? '0.5px solid var(--border)' : 'none', transition:'background .1s' }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:isActive?'rgba(29,158,117,.15)':'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                        {item.ico}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:isActive?500:400, color:isActive?'var(--gm)':'var(--tx)', marginBottom:1 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize:12, color:'var(--ts)' }}>{(item as any).desc}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                        {bloqueado && <span style={{ fontSize:10, color:'#7F77DD', background:'#EEEDFE', padding:'2px 7px', borderRadius:100, fontWeight:500 }}>Pro</span>}
                        {isActive && <span style={{ color:'var(--gm)', fontSize:16 }}>✓</span>}
                        {!isActive && <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M6 4l4 4-4 4" stroke="var(--ts)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom nav bar */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, height:60, background:'var(--bg)', borderTop:'1px solid var(--border)', display:'flex', zIndex:999, paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id && !showMais;
          return (
            <button key={item.id}
              onClick={() => { setShowMais(false); onNavigate(item.id); }}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, background:'none', border:'none', cursor:'pointer', color:isActive?'var(--green)':'var(--ts)', fontFamily:'inherit', padding:0 }}>
              {item.ico(isActive)}
              <span style={{ fontSize:10, fontWeight:isActive?600:400, letterSpacing:'-.01em' }}>{item.label}</span>
            </button>
          );
        })}
        {/* Botão Mais */}
        <button
          onClick={() => setShowMais(v => !v)}
          style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, background:'none', border:'none', cursor:'pointer', color:showMais?'var(--green)':'var(--ts)', fontFamily:'inherit', padding:0 }}>
          {showMais ? (
            <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><path d="M6 6l10 10M16 6L6 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="6" cy="11" r="1.8" fill="currentColor"/><circle cx="11" cy="11" r="1.8" fill="currentColor"/><circle cx="16" cy="11" r="1.8" fill="currentColor"/></svg>
          )}
          <span style={{ fontSize:10, fontWeight:showMais?600:400, letterSpacing:'-.01em' }}>{showMais?'Fechar':'Mais'}</span>
        </button>
      </div>
    </>
  );
}
