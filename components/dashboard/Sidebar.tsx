// ════════════════════════════════════════════════
//  NUVITA — components/dashboard/Sidebar.tsx
//  Mantém todos os 24 itens originais com seus ícones SVG,
//  organizados em grupos colapsáveis.
// ════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import type { DashSection } from './DashboardShell';

interface Props {
  active: DashSection;
  onNavigate: (s: DashSection) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
  plano?: 'free' | 'essencial' | 'pro' | string;
}

type Item = {
  id: DashSection;
  label: string;
  icon: string;
  tier?: 'free' | 'essencial' | 'pro';
};

type Group = {
  id: string;
  label: string;
  items: Item[];
};

const C = {
  bg: '#FFFFFF',
  bg2: '#F7F7F7',
  bg3: '#EFEFEF',
  ink: '#0F1115',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  border: '#EBEBEB',
  green: '#22C55E',
  greenSoft: '#DCFCE7',
  greenInk: '#15803D',
};

const TOP_ITEMS: Item[] = [
  { id: 'inicio', label: 'Início', icon: 'M2 6.5L8 2l6 4.5V13a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z' },
  { id: 'protocolo', label: 'Protocolo', icon: 'M2 4h12M2 7h8M2 10h5' },
  {
    id: 'calendario',
    label: 'Calendário',
    icon: 'M1 5h14v9a1 1 0 01-1 1H2a1 1 0 01-1-1V5zM1 5V4a1 1 0 011-1h12a1 1 0 011 1v1M5 3V1M11 3V1',
  },
];

const GROUPS: Group[] = [
  {
    id: 'progresso',
    label: 'Progresso',
    items: [
      { id: 'diario', label: 'Diário', icon: 'M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM5 6h6M5 9h4' },
      { id: 'consistencia', label: 'Consistência', icon: 'M2 10l3-3 3 3 4-5 2 2' },
      { id: 'analise', label: 'Análise', icon: 'M2 12h2v-3H2v3zM6 12h2V7H6v5zM10 12h2V4h-2v8zM1 13h14' },
      { id: 'historico', label: 'Histórico', icon: 'M8 1v6l3 3M8 1a7 7 0 100 14A7 7 0 008 1' },
      { id: 'estoque', label: 'Estoque', icon: 'M3 2h10l2 3v9a1 1 0 01-1 1H2a1 1 0 01-1-1V5L3 2zM2 5h12M8 8v5M6 10h4' },
    ],
  },
  {
    id: 'ia',
    label: 'Ferramentas IA',
    items: [
      { id: 'ia', label: 'IA', icon: 'M8 2a3 3 0 100 6 3 3 0 000-6zM2.5 14a5.5 5.5 0 0111 0' },
      {
        id: 'coach',
        label: 'Coach IA',
        icon: 'M2 2h12a1 1 0 011 1v7a1 1 0 01-1 1H8l-3 3V11H3a1 1 0 01-1-1V3a1 1 0 011-1',
        tier: 'essencial',
      },
      {
        id: 'detector',
        label: 'Detector',
        icon: 'M8 2L2 14h12L8 2zM8 7v3M8 11.5v.5',
        tier: 'essencial',
      },
      {
        id: 'ajuste',
        label: 'Ajuste Auto',
        icon: 'M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M10.4 10.4l1.4 1.4M3.2 12.8l1.4-1.4M10.4 5.6l1.4-1.4M8 5a3 3 0 100 6',
        tier: 'pro',
      },
      { id: 'simulador', label: 'Simulador', icon: 'M8 1a7 7 0 100 14A7 7 0 008 1zM8 5v4l2 2', tier: 'pro' },
    ],
  },
  {
    id: 'conhecimento',
    label: 'Conhecimento',
    items: [
      { id: 'lib', label: 'Biblioteca', icon: 'M3 2h10a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM6 2v13M6 7h6' },
      { id: 'educacao', label: 'Educação', icon: 'M2 2h12a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1zM5 6h6M5 9h4M5 12h2' },
      {
        id: 'calc',
        label: 'Calculadora',
        icon: 'M3 2h10a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM5 6h2M9 6h2M5 9h2M9 9h2M5 12h2M9 12h2',
      },
    ],
  },
  {
    id: 'medico',
    label: 'Médico',
    items: [
      {
        id: 'medico',
        label: 'Médico Parceiro',
        icon: 'M8 2a3 3 0 100 6A3 3 0 008 2zM2.5 14a5.5 5.5 0 0111 0M8 10v4M6 12h4',
        tier: 'pro',
      },
      {
        id: 'consultas',
        label: 'Consultas',
        icon: 'M1 3h14a1 1 0 011 1v8a1 1 0 01-1 1H1a1 1 0 01-1-1V4a1 1 0 011-1zM5 7h6M5 10h3',
        tier: 'pro',
      },
    ],
  },
  {
    id: 'rotina',
    label: 'Rotina e Export',
    items: [
      { id: 'rotina', label: 'Rotina', icon: 'M3 5h10M3 8h7M3 11h4M1 2h14a1 1 0 011 1v11a1 1 0 01-1 1H1a1 1 0 01-1-1V3a1 1 0 011-1' },
      { id: 'exportacao', label: 'Exportar', icon: 'M8 2v9M5 8l3 3 3-3M2 13h12', tier: 'essencial' },
    ],
  },
];

const FOOTER_ITEMS: Item[] = [
  { id: 'planos', label: 'Planos', icon: 'M1 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zM1 7h14' },
  { id: 'conta', label: 'Conta', icon: 'M8 2a3 3 0 100 6 3 3 0 000-6zM2.5 14a5.5 5.5 0 0111 0' },
  { id: 'ajuda', label: 'Ajuda', icon: 'M8 1a7 7 0 100 14A7 7 0 008 1zM8 11v1M8 5a2 2 0 011.73 3C9 9 8 9.5 8 10' },
  {
    id: 'config',
    label: 'Configurações',
    icon: 'M8 5a3 3 0 100 6 3 3 0 000-6zM8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1 1M11.8 11.8l1 1M3.2 12.8l1-1M11.8 4.2l1-1',
  },
];

function hasAccess(itemTier: Item['tier'], userPlano: string): boolean {
  if (!itemTier || itemTier === 'free') return true;
  if (itemTier === 'essencial') return userPlano === 'essencial' || userPlano === 'pro';
  if (itemTier === 'pro') return userPlano === 'pro';
  return true;
}

export default function Sidebar({
  active,
  onNavigate,
  mobileOpen,
  onMobileClose,
  expanded,
  onToggleExpand,
  plano = 'free',
}: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    progresso: true,
    ia: true,
    conhecimento: false,
    medico: false,
    rotina: false,
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClick = (item: Item) => {
    if (!hasAccess(item.tier, plano)) {
      onNavigate('planos');
      if (mobileOpen) onMobileClose();
      return;
    }
    onNavigate(item.id);
    if (mobileOpen) onMobileClose();
  };

  const width = expanded ? 240 : 64;

  const sidebarStyle: React.CSSProperties = {
    width,
    minWidth: width,
    height: '100vh',
    position: 'sticky',
    top: 0,
    background: '#fff',
    borderRight: `1px solid ${C.border}`,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease',
    flexShrink: 0,
    overflow: 'hidden',
  };

  const mobileOverlay: React.CSSProperties = mobileOpen
    ? { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }
    : { display: 'none' };

  const mobileSidebar: React.CSSProperties = mobileOpen
    ? { position: 'fixed', left: 0, top: 0, width: 260, minWidth: 260, zIndex: 50 }
    : {};

  return (
    <>
      <div style={mobileOverlay} onClick={onMobileClose} />
      <aside style={{ ...sidebarStyle, ...mobileSidebar }} className="nv-sidebar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'space-between' : 'center',
            padding: '18px 16px',
            borderBottom: `1px solid ${C.border}`,
            minHeight: 64,
          }}
        >
          {expanded ? (
            <>
              <NuvitaLogo />
              <button onClick={onToggleExpand} style={iconBtn} aria-label="Recolher">
                <ChevronLeft />
              </button>
            </>
          ) : (
            <button onClick={onToggleExpand} style={iconBtn} aria-label="Expandir">
              <MenuIcon />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TOP_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={active === item.id}
              expanded={expanded}
              locked={!hasAccess(item.tier, plano)}
              onClick={() => handleClick(item)}
            />
          ))}

          <div style={{ height: 1, background: C.border, margin: '10px 8px' }} />

          {GROUPS.map((group) => {
            const isOpen = openGroups[group.id] ?? false;
            return (
              <div key={group.id} style={{ marginBottom: 2 }}>
                {expanded && (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      color: C.muted,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: 6,
                      marginTop: 6,
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = C.bg2)}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{group.label}</span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                    >
                      <path d="M3 2l3 3-3 3" stroke={C.subtle} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                {(isOpen || !expanded) &&
                  group.items.map((item) => (
                    <NavItem
                      key={item.id}
                      item={item}
                      active={active === item.id}
                      expanded={expanded}
                      locked={!hasAccess(item.tier, plano)}
                      onClick={() => handleClick(item)}
                    />
                  ))}
              </div>
            );
          })}
        </nav>

        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            padding: '10px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {FOOTER_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={active === item.id}
              expanded={expanded}
              locked={!hasAccess(item.tier, plano)}
              onClick={() => handleClick(item)}
            />
          ))}

          {expanded && plano !== 'pro' && (
            <button
              onClick={() => onNavigate('planos')}
              style={{
                marginTop: 8,
                padding: '10px 12px',
                background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenInk} 100%)`,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 1l1.5 3.5L12 5l-3 3 1 4-3-2-3 2 1-4-3-3 3.5-.5L7 1z" />
              </svg>
              <span>{plano === 'free' ? 'Fazer upgrade' : 'Ir para Pro'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function NavItem({
  item,
  active,
  expanded,
  locked,
  onClick,
}: {
  item: Item;
  active: boolean;
  expanded: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  const iconColor = active ? C.greenInk : locked ? C.subtle : C.muted;

  const btnStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: expanded ? '9px 12px' : '9px 0',
    justifyContent: expanded ? 'flex-start' : 'center',
    background: active ? C.greenSoft : 'transparent',
    color: active ? C.greenInk : locked ? C.subtle : C.ink,
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    letterSpacing: '-0.005em',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.12s',
  };

  return (
    <button
      onClick={onClick}
      style={btnStyle}
      title={!expanded ? item.label : undefined}
      onMouseOver={(e) => {
        if (!active) e.currentTarget.style.background = C.bg2;
      }}
      onMouseOut={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke={iconColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
        aria-hidden
      >
        <path d={item.icon} />
      </svg>
      {expanded && (
        <>
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>
          {locked && <LockIcon />}
        </>
      )}
    </button>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect x="2" y="5.5" width="8" height="5" rx="1" stroke={C.subtle} strokeWidth="1.2" />
      <path d="M4 5.5V4a2 2 0 014 0v1.5" stroke={C.subtle} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 4L6 8L10 12" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 5H15M3 9H15M3 13H15" stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const iconBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  border: 'none',
  background: 'transparent',
  borderRadius: 8,
  cursor: 'pointer',
};
