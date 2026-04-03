// @ts-nocheck
'use client';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import type { DashSection } from './DashboardShell';

interface Props {
  active:DashSection; onNavigate:(s:DashSection)=>void;
  mobileOpen:boolean; onMobileClose:()=>void;
  expanded:boolean; onToggleExpand:()=>void;
  nome:string; planLabel:string; plan:string; onLogout:()=>void;
}

const G = [
  { label:'Principal', items:[
    { id:'inicio',    label:'Início',    ico:'M2 8L8 2.5 14 8V14H10.5V10.5H5.5V14H2V8z' },
    { id:'protocolo', label:'Protocolo', ico:'M3 5h10M3 8h10M3 11h6' },
  ]},
  { label:'Acompanhamento', items:[
    { id:'tracker',      label:'Tracker',     ico:'M2 12L5 9l3 3 4-5 3 2' },
    { id:'diario',       label:'Diário',       ico:'M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zM7 6h4M7 9h4M7 12h2' },
    { id:'consistencia', label:'Consistência', ico:'M2 10l4-4 3 3 4-6 3 3' },
    { id:'analise',      label:'Análise',      ico:'M3 12h2v-2H3v2zM7 12h2V8H7v4zM11 12h2V4h-2v8zM1 13h14' },
    { id:'historico',    label:'Histórico',    ico:'M8 1v7l3 3M8 1a7 7 0 100 14A7 7 0 008 1z' },
    { id:'calendario',   label:'Calendário',   ico:'M2 5h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V5zM2 5V4a1 1 0 011-1h10a1 1 0 011 1v1M5 3V1M11 3V1' },
  ]},
  { label:'Inteligência', items:[
    { id:'coach',    label:'Coach IA',    ico:'M8 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM2.5 15a5.5 5.5 0 0111 0' },
    { id:'ajuste',   label:'Ajuste auto', ico:'M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M10.4 10.4l1.4 1.4M3.2 12.8l1.4-1.4M10.4 5.6l1.4-1.4M8 5a3 3 0 100 6 3 3 0 000-6z' },
    { id:'detector', label:'Detector',    ico:'M8 2L2 14h12L8 2zM8 7v3M8 11.5v.5' },
  ]},
  { label:'Planejamento', items:[
    { id:'simulador',    label:'Simulador',   ico:'M8 1a7 7 0 100 14A7 7 0 008 1zM8 5v4l2.5 2.5' },
    { id:'geradorciclo', label:'Ciclo',       ico:'M2 5h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V5zM6 9h4M8 7v4' },
    { id:'fases',        label:'Fases',       ico:'M2 12h2V8H2v4zM6 12h2V5H6v7zM10 12h2V2h-2v10z' },
    { id:'rotina',       label:'Rotina',      ico:'M4 6h8M4 9h5M4 12h3M2 3h12a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z' },
  ]},
  { label:'Logística', items:[
    { id:'estoque',    label:'Estoque',     ico:'M4 2h8l2 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V5l2-3zM3 5h10M8 8v5M6 10h4' },
    { id:'exportacao', label:'Exportar',    ico:'M8 2v9M5 8l3 3 3-3M2 13h12' },
  ]},
  { label:'Ferramentas', items:[
    { id:'ia',   label:'IA Nuvita',   ico:'M8 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM2.5 15a5.5 5.5 0 0111 0' },
    { id:'calc', label:'Calculadora', ico:'M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zM6 6h1M9 6h1M6 9h1M9 9h1M6 12h1M9 12h1' },
    { id:'lib',  label:'Biblioteca',  ico:'M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zM7 2v12M7 7h5' },
    { id:'mapa', label:'Mapa de aplicação', ico:'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' },
  ]},
  { label:'Conta', items:[
    { id:'medico', label:'Médico',  ico:'M8 2a3.5 3.5 0 100 7A3.5 3.5 0 008 2zM2.5 15a5.5 5.5 0 0111 0M8 11v4M6 13h4', proOnly:true },
    { id:'perfil', label:'Perfil',  ico:'M8 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM2.5 15a5.5 5.5 0 0111 0' },
    { id:'planos', label:'Planos',  ico:'M1 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zM1 7h14' },
    { id:'conta',  label:'Conta',   ico:'M8 1a7 7 0 100 14A7 7 0 008 1zM5 8h6M8 5v6' },
    { id:'config', label:'Config.', ico:'M8 5a3 3 0 100 6 3 3 0 000-6zM8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1 1M11.8 11.8l1 1M3.2 12.8l1-1M11.8 4.2l1-1' },
  ]},
];

const LOGO = () => (
  <svg width="72" height="16" viewBox="0 0 156 34" fill="none">
    <path d="M19.6318 6.74985C21.3477 7.44837 22.8113 8.4565 24.0225 9.76911C25.2337 11.0817 26.1598 12.6784 26.7982 14.5539C27.4366 16.4294 27.7571 18.5275 27.7571 20.8483V33.0789H22.3571V20.5924C22.3571 19.0239 22.1552 17.6422 21.7515 16.4473C21.3477 15.2524 20.785 14.2392 20.0608 13.4025C19.3366 12.5658 18.4459 11.9363 17.386 11.509C16.3262 11.0817 15.1226 10.8694 13.7776 10.8694C12.4327 10.8694 11.229 11.0817 10.1692 11.509C9.10938 11.9363 8.21863 12.5658 7.49442 13.4025C6.77021 14.2392 6.21507 15.2524 5.82899 16.4473C5.44292 17.6422 5.24862 19.0239 5.24862 20.5924V33.0789H0V20.8483C0 18.4943.320468 16.3885.958882 14.5283C1.5973 12.6681 2.5158 11.0817 3.70936 9.76911C4.90291 8.4565 6.35133 7.44837 8.04956 6.74985C9.74779 6.05132 11.6756 5.70078 13.8281 5.70078C15.9805 5.70078 17.916 6.05132 19.6318 6.74985Z" fill="#353B39"/>
    <path d="M36.8413 6.57074V19.2107C36.8413 20.7459 37.0356 22.1097 37.4217 23.3046C37.8078 24.4995 38.3629 25.5051 39.0871 26.3239C39.8113 27.1427 40.6945 27.7644 41.7366 28.1918C42.7788 28.6191 43.9572 28.8314 45.2694 28.8314C46.5815 28.8314 47.7675 28.6191 48.8273 28.1918C49.8871 27.7644 50.7779 27.135 51.5021 26.2983C52.2263 25.4616 52.7815 24.4561 53.1675 23.279C53.5536 22.102 53.7479 20.7459 53.7479 19.2107V6.57074H58.9965V18.9548C58.9965 21.2756 58.6761 23.3635 58.0376 25.2237C57.3992 27.0838 56.4807 28.6626 55.2872 29.9573C54.0936 31.2545 52.6452 32.2524 50.947 32.9509C49.2487 33.6495 47.3385 34 45.2189 34C43.0993 34 41.1891 33.6495 39.4908 32.9509C37.7926 32.2524 36.3442 31.2545 35.1506 29.9573C33.9571 28.6626 33.0386 27.0838 32.4002 25.2237C31.7618 23.3635 31.4413 21.2756 31.4413 18.9548V6.57074H36.8413Z" fill="#353B39"/>
    <path d="M95.8856 11.3811H101.286V33.0789H95.8856V11.3811Z" fill="#353B39"/>
    <path d="M95.8856.481037H101.286V6.57074H95.8856V.481037Z" fill="#353B39"/>
    <path d="M111.48 18.7809C111.48 21.8846 112.187 24.2565 113.6 25.894C115.013 27.5316 116.587 28.2839 119.691 28.2839C120.229 28.2839 122.482 28.2685 122.482 28.2685V33.0789C122.482 33.1531 117.688 33.0789 116.981 33.0789C114.977 33.0789 111.672 32.2319 109.436 29.6553C107.198 27.0787 106.08 23.4889 106.08 18.8832V0H111.48V18.7809ZM109.159 6.0897H122.381V10.9001H109.159V6.0897Z" fill="#353B39"/>
  </svg>
);

export default function Sidebar({ active, onNavigate, mobileOpen, onMobileClose, expanded, onToggleExpand, plan }: Props) {
  const isOpen = mobileOpen || expanded;
  return (
    <>
      {mobileOpen && <div className="sidebar-overlay show" onClick={onMobileClose}/>}
      <aside className={`sidebar visible${isOpen?' open':''}`}>
        <div className="sb-top">
          <div className="sb-logo-row">
            <button className="sb-toggle" onClick={e=>{e.stopPropagation();onToggleExpand();onMobileClose();}}>
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
            <div className="sb-logo-full"><NuvitaLogo width={72} height={16}/></div>
          </div>
        </div>
        <nav className="sb-nav" style={{ overflowY:'auto', flex:1 }}>
          {G.map(group => (
            <div key={group.label}>
              <div className="sb-group-lbl">{group.label}</div>
              {group.items.map(({ id, label, ico, proOnly }) => {
                const bloqueado = !!(proOnly && plan!=='pro');
                return (
                  <div key={id}
                    className={`sb-item${active===id?' on':''}`}
                    onClick={() => onNavigate(id as DashSection)}
                    style={{ opacity: bloqueado ? 0.5 : 1 }}>
                    <div className="sb-ico">
                      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                        <path d={ico} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="sb-lbl">
                      {label}
                      {proOnly && !bloqueado && <span style={{ fontSize:8, background:'var(--green)', color:'var(--dark)', borderRadius:3, padding:'1px 4px', marginLeft:5, fontWeight:700 }}>PRO</span>}
                      {bloqueado && <span style={{ fontSize:8, background:'var(--bg2)', color:'var(--ts)', borderRadius:3, padding:'1px 4px', marginLeft:5, fontWeight:700, border:'1px solid var(--border)' }}>🔒</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
