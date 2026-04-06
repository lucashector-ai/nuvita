// @ts-nocheck
'use client';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import type { DashSection } from './DashboardShell';

interface Props {
  active: DashSection; onNavigate: (s: DashSection) => void;
  mobileOpen: boolean; onMobileClose: () => void;
  expanded: boolean; onToggleExpand: () => void;
  nome?: string; planLabel?: string; plan?: string; onLogout?: () => void;
}

const SECTIONS = [
  { label: null, items: [
    { id:'inicio',      icon:'M2 6.5L8 2l6 4.5V13a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z', label:'Início',       accent:'#7C3AED', accentBg:'#EDE9FE' },
    { id:'protocolo',   icon:'M2 4h12M2 7h8M2 10h5',                                   label:'Protocolo',    accent:'#2563EB', accentBg:'#DBEAFE' },
  ]},
  { label: 'Progresso', items: [
    { id:'diario',      icon:'M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM5 6h6M5 9h4', label:'Diário',    accent:'#059669', accentBg:'#D1FAE5' },
    { id:'consistencia',icon:'M2 10l3-3 3 3 4-5 2 2',                                  label:'Consistência', accent:'#D97706', accentBg:'#FEF3C7' },
    { id:'analise',     icon:'M2 12h2v-3H2v3zM6 12h2V7H6v5zM10 12h2V4h-2v8zM1 13h14', label:'Análise',      accent:'#2563EB', accentBg:'#DBEAFE' },
    { id:'historico',   icon:'M8 1v6l3 3M8 1a7 7 0 100 14A7 7 0 008 1',               label:'Histórico',    accent:'#BE185D', accentBg:'#FCE7F3' },
    { id:'calendario',  icon:'M1 5h14v9a1 1 0 01-1 1H2a1 1 0 01-1-1V5zM1 5V4a1 1 0 011-1h12a1 1 0 011 1v1M5 3V1M11 3V1', label:'Calendário', accent:'#0E7490', accentBg:'#CCFBF1' },
  ]},
  { label: 'Ferramentas', items: [
    { id:'coach',       icon:'M8 2a3 3 0 100 6 3 3 0 000-6zM2.5 14a5.5 5.5 0 0111 0', label:'Coach IA',     accent:'#6D28D9', accentBg:'#EDE9FE' },
    { id:'ajuste',      icon:'M8 5a3 3 0 100 6 3 3 0 000-6zM8 1v2M8 13v2M1 8h2M13 8h2', label:'Ajuste Auto',accent:'#B45309', accentBg:'#FEF3C7' },
    { id:'simulador',   icon:'M8 1a7 7 0 100 14A7 7 0 008 1zM8 5v4l2 2',              label:'Simulador',    accent:'#0E7490', accentBg:'#CCFBF1' },
  ]},
  { label: 'Gestão', items: [
    { id:'rotina',      icon:'M3 5h10M3 8h7M3 11h4M1 2h14a1 1 0 011 1v11a1 1 0 01-1 1H1a1 1 0 01-1-1V3a1 1 0 011-1', label:'Rotina', accent:'#166534', accentBg:'#DCFCE7' },
    { id:'estoque',     icon:'M3 2h10l2 3v9a1 1 0 01-1 1H2a1 1 0 01-1-1V5L3 2zM2 5h12M8 8v5M6 10h4', label:'Estoque', accent:'#92400E', accentBg:'#FEF3C7' },
    { id:'exportacao',  icon:'M8 2v9M5 8l3 3 3-3M2 13h12',                            label:'Exportar',     accent:'#1E40AF', accentBg:'#DBEAFE' },
  ]},
  { label: 'Biblioteca', items: [
    { id:'lib',         icon:'M3 2h10a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM6 2v13M6 7h6', label:'Biblioteca', accent:'#5B21B6', accentBg:'#EDE9FE' },
    { id:'calc',        icon:'M3 2h10a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM5 6h2M9 6h2M5 9h2M9 9h2M5 12h2M9 12h2', label:'Calculadora', accent:'#374151', accentBg:'#F3F4F6' },
    { id:'mapa',        icon:'M8 2C5.2 2 3 4.2 3 7c0 4 5 9 5 9s5-5 5-9c0-2.8-2.2-5-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z', label:'Mapa', accent:'#065F46', accentBg:'#DCFCE7' },
  ]},
  { label: 'Conta', items: [
    { id:'perfil',      icon:'M8 2a3 3 0 100 6A3 3 0 008 2zM2.5 14a5.5 5.5 0 0111 0', label:'Perfil',      accent:'#374151', accentBg:'#F3F4F6' },
    { id:'planos',      icon:'M1 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zM1 7h14', label:'Planos', accent:'#78350F', accentBg:'#FEF3C7' },
    { id:'conta',       icon:'M8 1a7 7 0 100 14A7 7 0 008 1zM5 8h6',                  label:'Conta',        accent:'#1F2937', accentBg:'#F3F4F6' },
    { id:'config',      icon:'M8 5a3 3 0 100 6 3 3 0 000-6zM8 1v2M8 13v2M1 8h2M13 8h2', label:'Config',   accent:'#4B5563', accentBg:'#F3F4F6' },
  ]},
];

export default function Sidebar({ active, onNavigate, mobileOpen, onMobileClose, expanded, onToggleExpand, nome, planLabel, plan, onLogout }: Props) {
  const nav = (s: DashSection) => { onNavigate(s); onMobileClose(); };

  return (
    <>
      {mobileOpen && (
        <div onClick={onMobileClose}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.3)',zIndex:199,backdropFilter:'blur(2px)' }}/>
      )}

      <aside style={{
        position:'fixed', left:0, top:0, height:'100vh', zIndex:200,
        display:'flex', flexDirection:'column',
        background:'#F7F7F7',
        borderRight:'1px solid #E5E7EB',
        width: expanded ? 'var(--sb-wx)' : 'var(--sb-w)',
        transition:'width .2s ease',
        overflow:'hidden',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 14px', minHeight:56, borderBottom:'1px solid #E5E7EB', flexShrink:0, cursor:'pointer' }}
          onClick={() => nav('inicio')}>
          {expanded
            ? <NuvitaLogo width={72} height={16}/>
            : <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#22C55E,#15803D)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'white', fontWeight:800, fontSize:12 }}>N</span>
              </div>
          }
          {expanded && (
            <button onClick={e=>{ e.stopPropagation(); onToggleExpand(); }}
              style={{ marginLeft:'auto', width:24, height:24, borderRadius:6, border:'none', background:'#EBEBEB', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6B7280', flexShrink:0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2L4 6l4 4"/></svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'8px 8px' }}>
          {SECTIONS.map((group, gi) => (
            <div key={gi} style={{ marginBottom:2 }}>
              {group.label && expanded && (
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#9CA3AF', padding:'8px 10px 4px' }}>
                  {group.label}
                </div>
              )}
              {group.label && !expanded && <div style={{ height:4 }}/>}

              {group.items.map(item => {
                const isActive = active === item.id;
                return (
                  <button key={item.id}
                    onClick={() => nav(item.id as DashSection)}
                    title={!expanded ? item.label : undefined}
                    style={{
                      display:'flex', alignItems:'center', gap:9,
                      padding: expanded ? '6px 10px' : '6px',
                      borderRadius:8, cursor:'pointer', width:'100%',
                      border:'none',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)' : 'none',
                      color: isActive ? '#111827' : '#6B7280',
                      fontSize:13, fontWeight: isActive ? 500 : 400,
                      fontFamily:'inherit', letterSpacing:'-.01em',
                      whiteSpace:'nowrap', overflow:'hidden',
                      transition:'all .12s', textAlign:'left',
                      justifyContent: expanded ? 'flex-start' : 'center',
                      marginBottom:1,
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                        (e.currentTarget as HTMLElement).style.color = '#111827';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = '#6B7280';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }
                    }}>
                    {/* Icon box */}
                    <div style={{
                      width:28, height:28, borderRadius:7, flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background: isActive ? item.accentBg : '#EBEBEB',
                      transition:'background .12s',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                        stroke={isActive ? item.accent : '#9CA3AF'}
                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon}/>
                      </svg>
                    </div>
                    {expanded && (
                      <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Expand toggle */}
        {!expanded && (
          <div style={{ padding:'8px', borderTop:'1px solid #E5E7EB', flexShrink:0 }}>
            <button onClick={onToggleExpand}
              style={{ width:'100%', height:30, borderRadius:8, border:'none', background:'#EBEBEB', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6B7280' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2l4 4-4 4"/></svg>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
