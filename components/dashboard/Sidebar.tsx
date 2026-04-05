// @ts-nocheck
'use client';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import type { DashSection } from './DashboardShell';

interface Props {
  active: DashSection;
  onNavigate: (s: DashSection) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

// Ícones SVG inline — mesma abordagem da referência
const Icon = ({ path, size = 16 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={path}/>
  </svg>
);

const SECTIONS = [
  {
    label: null,
    items: [
      { id:'inicio',      icon:'M2 6.5L8 2l6 4.5V13a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z', label:'Início' },
      { id:'protocolo',   icon:'M2 4h12M2 7h8M2 10h5', label:'Protocolo' },
    ]
  },
  {
    label: 'Progresso',
    items: [
      { id:'diario',      icon:'M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM5 6h6M5 9h4', label:'Diário' },
      { id:'consistencia',icon:'M2 10l3-3 3 3 4-5 2 2', label:'Consistência' },
      { id:'analise',     icon:'M2 12h2v-3H2v3zM6 12h2V7H6v5zM10 12h2V4h-2v8zM1 13h14', label:'Análise' },
      { id:'historico',   icon:'M8 1v6l3 3M8 1a7 7 0 100 14A7 7 0 008 1', label:'Histórico' },
      { id:'calendario',  icon:'M1 5h14v9a1 1 0 01-1 1H2a1 1 0 01-1-1V5zM1 5V4a1 1 0 011-1h12a1 1 0 011 1v1M5 3V1M11 3V1', label:'Calendário' },
    ]
  },
  {
    label: 'Ferramentas',
    items: [
      { id:'coach',       icon:'M8 2a3 3 0 100 6 3 3 0 000-6zM2.5 14a5.5 5.5 0 0111 0', label:'Coach IA' },
      { id:'ajuste',      icon:'M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M10.4 10.4l1.4 1.4M3.2 12.8l1.4-1.4M10.4 5.6l1.4-1.4M8 5a3 3 0 100 6', label:'Ajuste Auto' },
      { id:'detector',    icon:'M8 2L2 14h12L8 2zM8 7v3M8 11.5v.5', label:'Detector' },
      { id:'simulador',   icon:'M8 1a7 7 0 100 14A7 7 0 008 1zM8 5v4l2 2', label:'Simulador' },
    ]
  },
  {
    label: 'Gestão',
    items: [
      { id:'rotina',      icon:'M3 5h10M3 8h7M3 11h4M1 2h14a1 1 0 011 1v11a1 1 0 01-1 1H1a1 1 0 01-1-1V3a1 1 0 011-1', label:'Rotina' },
      { id:'estoque',     icon:'M3 2h10l2 3v9a1 1 0 01-1 1H2a1 1 0 01-1-1V5L3 2zM2 5h12M8 8v5M6 10h4', label:'Estoque' },
      { id:'exportacao',  icon:'M8 2v9M5 8l3 3 3-3M2 13h12', label:'Exportar' },
    ]
  },
  {
    label: 'Biblioteca',
    items: [
      { id:'lib',         icon:'M3 2h10a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM6 2v13M6 7h6', label:'Biblioteca' },
      { id:'calc',        icon:'M3 2h10a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM5 6h2M9 6h2M5 9h2M9 9h2M5 12h2M9 12h2', label:'Calculadora' },
      { id:'mapa',        icon:'M8 2C5.2 2 3 4.2 3 7c0 4 5 9 5 9s5-5 5-9c0-2.8-2.2-5-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z', label:'Mapa' },
    ]
  },
  {
    label: 'Conta',
    items: [
      { id:'medico',      icon:'M8 2a3 3 0 100 6A3 3 0 008 2zM2.5 14a5.5 5.5 0 0111 0M8 10v4M6 12h4', label:'Médico', proOnly: true },
      { id:'perfil',      icon:'M8 2a3 3 0 100 6A3 3 0 008 2zM2.5 14a5.5 5.5 0 0111 0', label:'Perfil' },
      { id:'planos',      icon:'M1 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zM1 7h14', label:'Planos' },
      { id:'conta',       icon:'M8 1a7 7 0 100 14A7 7 0 008 1zM5 8h6M8 5v6', label:'Conta' },
      { id:'config',      icon:'M8 5a3 3 0 100 6 3 3 0 000-6zM8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1 1M11.8 11.8l1 1M3.2 12.8l1-1M11.8 4.2l1-1', label:'Config' },
    ]
  },
];

// Cores por categoria — estilo da referência
const ICON_COLORS: Record<string,{bg:string;color:string}> = {
  inicio:       { bg:'#EDE9FE', color:'#7C3AED' },
  protocolo:    { bg:'#DBEAFE', color:'#2563EB' },
  diario:       { bg:'#DCFCE7', color:'#15803D' },
  consistencia: { bg:'#FEF3C7', color:'#D97706' },
  analise:      { bg:'#DBEAFE', color:'#1D4ED8' },
  historico:    { bg:'#FCE7F3', color:'#BE185D' },
  calendario:   { bg:'#CCFBF1', color:'#0F766E' },
  coach:        { bg:'#EDE9FE', color:'#6D28D9' },
  ajuste:       { bg:'#FEF3C7', color:'#B45309' },
  detector:     { bg:'#FEE2E2', color:'#B91C1C' },
  simulador:    { bg:'#CCFBF1', color:'#0E7490' },
  rotina:       { bg:'#DCFCE7', color:'#166534' },
  estoque:      { bg:'#FEF3C7', color:'#92400E' },
  exportacao:   { bg:'#DBEAFE', color:'#1E40AF' },
  lib:          { bg:'#EDE9FE', color:'#5B21B6' },
  calc:         { bg:'#F3F4F6', color:'#374151' },
  mapa:         { bg:'#DCFCE7', color:'#065F46' },
  medico:       { bg:'#FCE7F3', color:'#9D174D' },
  perfil:       { bg:'#F3F4F6', color:'#374151' },
  planos:       { bg:'#FEF3C7', color:'#78350F' },
  conta:        { bg:'#F3F4F6', color:'#1F2937' },
  config:       { bg:'#F3F4F6', color:'#4B5563' },
};

export default function Sidebar({ active, onNavigate, mobileOpen, onMobileClose, expanded, onToggleExpand }: Props) {
  const nav = (s: DashSection) => { onNavigate(s); onMobileClose(); };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={onMobileClose}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:199, backdropFilter:'blur(2px)' }}/>
      )}

      <aside style={{
        position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 200,
        display: 'flex', flexDirection: 'column',
        background: '#0F1115',
        borderRight: '1px solid rgba(255,255,255,.06)',
        width: expanded ? 'var(--sb-wx)' : 'var(--sb-w)',
        transition: 'width .2s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 10px', minHeight:56, borderBottom:'1px solid rgba(255,255,255,.06)', flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#22C55E,#15803D)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}
            onClick={() => nav('inicio')}>
            <span style={{ color:'white', fontWeight:800, fontSize:13, letterSpacing:'-.05em' }}>N</span>
          </div>
          {expanded && (
            <div style={{ flex:1, overflow:'hidden', cursor:'pointer' }} onClick={() => nav('inicio')}>
              <div style={{ fontSize:14, fontWeight:700, color:'white', letterSpacing:'-.04em' }}>Nuvita</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:1 }}>Protocolo ativo</div>
            </div>
          )}
          {expanded && (
            <button onClick={onToggleExpand}
              style={{ width:24, height:24, borderRadius:6, border:'none', background:'rgba(255,255,255,.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.4)', flexShrink:0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2L4 6l4 4"/>
              </svg>
            </button>
          )}
          {!expanded && (
            <button onClick={onToggleExpand}
              style={{ position:'absolute', right:0, width:'100%', height:56, border:'none', background:'transparent', cursor:'pointer' }}/>
          )}
        </div>

        {/* Nav */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'8px 8px' }}>
          {SECTIONS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: gi < SECTIONS.length-1 ? 4 : 0 }}>
              {/* Group label */}
              {group.label && expanded && (
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.25)', padding:'8px 10px 4px', whiteSpace:'nowrap' }}>
                  {group.label}
                </div>
              )}
              {group.label && !expanded && <div style={{ height:8 }}/>}

              {/* Items */}
              {group.items.map(item => {
                const isActive = active === item.id;
                const colors = ICON_COLORS[item.id] || { bg:'#F3F4F6', color:'#374151' };
                return (
                  <button key={item.id}
                    onClick={() => nav(item.id as DashSection)}
                    title={!expanded ? item.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: expanded ? '7px 10px' : '7px',
                      borderRadius: 9, cursor: 'pointer', width: '100%',
                      border: 'none', background: isActive ? 'rgba(255,255,255,.1)' : 'transparent',
                      color: isActive ? 'white' : 'rgba(255,255,255,.5)',
                      fontSize: 13, fontWeight: isActive ? 500 : 400,
                      fontFamily: 'inherit', letterSpacing: '-.01em',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                      transition: 'all .12s', textAlign: 'left',
                      justifyContent: expanded ? 'flex-start' : 'center',
                      marginBottom: 1,
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.85)'; }}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.5)'; } }}>
                    {/* Icon box colorido */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? colors.bg : 'rgba(255,255,255,.06)',
                      transition: 'background .12s',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                        stroke={isActive ? colors.color : 'currentColor'}
                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon}/>
                      </svg>
                    </div>
                    {/* Label */}
                    {expanded && (
                      <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis' }}>
                        {item.label}
                        {item.proOnly && <span style={{ marginLeft:6, fontSize:9, background:'#EDE9FE', color:'#7C3AED', padding:'1px 5px', borderRadius:100, fontWeight:700 }}>PRO</span>}
                      </span>
                    )}
                    {/* Dot ativo quando collapsed */}
                    {!expanded && isActive && (
                      <div style={{ position:'absolute', right:6, width:4, height:4, borderRadius:'50%', background:'white' }}/>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Expand toggle quando collapsed */}
        {!expanded && (
          <div style={{ padding:'8px', borderTop:'1px solid rgba(255,255,255,.06)', flexShrink:0 }}>
            <button onClick={onToggleExpand}
              style={{ width:'100%', height:32, borderRadius:8, border:'none', background:'rgba(255,255,255,.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.4)' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 2l4 4-4 4"/>
              </svg>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
