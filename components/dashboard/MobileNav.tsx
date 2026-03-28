// @ts-nocheck
'use client';

import { useState } from 'react';
import type { DashSection } from './DashboardShell';

interface Props {
  active: DashSection;
  onNavigate: (s: DashSection) => void;
  plan: string;
}

const MAIS_ITEMS = [
  { grupo:'Acompanhamento', items:[
    { id:'tracker',      label:'Tracker',        ico:'📈' },
    { id:'diario',       label:'Diário',          ico:'📋' },
    { id:'consistencia', label:'Consistência',    ico:'📊' },
    { id:'analise',      label:'Análise',         ico:'🔍' },
    { id:'historico',    label:'Histórico',       ico:'🗃️' },
    { id:'calendario',   label:'Calendário',      ico:'📅' },
  ]},
  { grupo:'Inteligência', items:[
    { id:'ia',           label:'IA Nuvita',       ico:'🤖' },
    { id:'coach',        label:'Coach IA',        ico:'👤' },
    { id:'ajuste',       label:'Ajuste auto',     ico:'⚙️' },
    { id:'detector',     label:'Detector',        ico:'⚠️' },
  ]},
  { grupo:'Planejamento', items:[
    { id:'simulador',    label:'Simulador',       ico:'🧪' },
    { id:'fases',        label:'Fases',           ico:'📊' },
    { id:'rotina',       label:'Rotina',          ico:'🗓️' },
    { id:'geradorciclo', label:'Ciclo',           ico:'🔄' },
  ]},
  { grupo:'Logística', items:[
    { id:'estoque',      label:'Estoque',         ico:'🧪' },
    { id:'calc',         label:'Calculadora',     ico:'🔬' },
    { id:'lib',          label:'Biblioteca',      ico:'📚' },
    { id:'exportacao',   label:'Exportar',        ico:'📤' },
  ]},
  { grupo:'Conta', items:[
    { id:'medico',       label:'Médico',          ico:'👨‍⚕️', proOnly:true },
    { id:'planos',       label:'Planos',          ico:'⚡' },
    { id:'conta',        label:'Conta',           ico:'💳' },
    { id:'perfil',       label:'Perfil',          ico:'👤' },
    { id:'config',       label:'Config.',         ico:'⚙️' },
  ]},
];

const NAV_ITEMS = [
  { id:'inicio',    label:'Início',    ico: (active: boolean) => (
    <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
      <path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth={active?2:1.4} fill={active?"currentColor":"none"} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id:'protocolo', label:'Protocolo', ico: (active: boolean) => (
    <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
      <rect x="4" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth={active?2:1.4}/>
      <path d="M8 8h6M8 12h6M8 16h4" stroke="currentColor" strokeWidth={active?2:1.4} strokeLinecap="round"/>
    </svg>
  )},
  { id:'tracker',   label:'Tracker',   ico: (active: boolean) => (
    <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
      <polyline points="3,17 8,10 12,14 16,7 20,10" stroke="currentColor" strokeWidth={active?2:1.4} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )},
  { id:'ia',        label:'IA',        ico: (active: boolean) => (
    <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth={active?2:1.4}/>
      <path d="M8 11c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3" stroke="currentColor" strokeWidth={active?2:1.4} strokeLinecap="round"/>
      <circle cx="11" cy="11" r="1" fill="currentColor"/>
    </svg>
  )},
];

export default function MobileNav({ active, onNavigate, plan }: Props) {
  const [showMais, setShowMais] = useState(false);

  const handleNav = (id: DashSection) => {
    setShowMais(false);
    onNavigate(id);
  };

  return (
    <>
      {/* Drawer — menu completo */}
      {showMais && (
        <>
          <div
            onClick={() => setShowMais(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:998 }}
          />
          <div style={{ position:'fixed', bottom:64, left:0, right:0, background:'var(--bg)', borderRadius:'20px 20px 0 0', zIndex:999, maxHeight:'70vh', overflowY:'auto', paddingBottom:16 }}>
            <div style={{ width:36, height:4, background:'var(--border)', borderRadius:2, margin:'12px auto 16px' }}/>
            {MAIS_ITEMS.map(grupo => (
              <div key={grupo.grupo}>
                <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', padding:'8px 20px 4px' }}>
                  {grupo.grupo}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4, padding:'0 12px' }}>
                  {grupo.items.map(item => {
                    const bloqueado = (item as any).proOnly && plan !== 'pro';
                    const isActive = active === item.id;
                    return (
                      <div key={item.id}
                        onClick={() => handleNav(item.id as DashSection)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:12, cursor:'pointer', background:isActive?'var(--gp)':'transparent', opacity:bloqueado?.6:1 }}>
                        <span style={{ fontSize:20 }}>{item.ico}</span>
                        <span style={{ fontSize:10, fontWeight:500, color:isActive?'var(--gm)':'var(--tm)', textAlign:'center', lineHeight:1.2 }}>
                          {item.label}{bloqueado?' 🔒':''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, height:64, background:'var(--bg)', borderTop:'1px solid var(--border)', display:'flex', zIndex:997, paddingBottom:'env(safe-area-inset-bottom)' }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id}
              onClick={() => handleNav(item.id as DashSection)}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, background:'none', border:'none', cursor:'pointer', color:isActive?'var(--green)':'var(--ts)', fontFamily:'inherit', padding:'4px 0' }}>
              {item.ico(isActive)}
              <span style={{ fontSize:10, fontWeight:isActive?600:400 }}>{item.label}</span>
            </button>
          );
        })}
        {/* Botão Mais */}
        <button
          onClick={() => setShowMais(v => !v)}
          style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, background:'none', border:'none', cursor:'pointer', color:showMais?'var(--green)':'var(--ts)', fontFamily:'inherit', padding:'4px 0' }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
            <circle cx="6"  cy="11" r={showMais?2.5:1.8} fill="currentColor"/>
            <circle cx="11" cy="11" r={showMais?2.5:1.8} fill="currentColor"/>
            <circle cx="16" cy="11" r={showMais?2.5:1.8} fill="currentColor"/>
          </svg>
          <span style={{ fontSize:10, fontWeight:showMais?600:400 }}>Mais</span>
        </button>
      </div>
    </>
  );
}
