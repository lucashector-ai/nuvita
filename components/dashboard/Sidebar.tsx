// ════════════════════════════════════════════════
//  NUVITA — components/dashboard/Sidebar.tsx
//  Sidebar consolidada com grupos colapsáveis
//  - 3 itens fixos no topo (Início, Protocolo, Calendário)
//  - 3 grupos colapsáveis (Acompanhar, IA, Conhecimento)
//  - Rodapé fixo (Exportar, Configurações)
//  - Cadeado em itens Pro pra usuários não-Pro
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
  /** tier mínimo para acesso */
  tier?: 'free' | 'essencial' | 'pro';
};

type Group = {
  id: string;
  label: string;
  items: Item[];
};

// ─── Estrutura de navegação ──────────────────────
const TOP_ITEMS: Item[] = [
  { id: 'inicio', label: 'Início', icon: '🏠' },
  { id: 'protocolo', label: 'Meu Protocolo', icon: '💊' },
  { id: 'calendario', label: 'Calendário', icon: '📅' },
];

const GROUPS: Group[] = [
  {
    id: 'acompanhar',
    label: 'Acompanhar',
    items: [
      { id: 'analise', label: 'Progresso', icon: '📊' },
      { id: 'diario', label: 'Diário', icon: '📝' },
      { id: 'estoque', label: 'Estoque', icon: '📦' },
      { id: 'historico', label: 'Histórico', icon: '🕐' },
    ],
  },
  {
    id: 'ia',
    label: 'IA',
    items: [
      { id: 'coach', label: 'Coach IA', icon: '🤖', tier: 'essencial' },
      { id: 'detector', label: 'Detector de sintomas', icon: '🚨', tier: 'essencial' },
      { id: 'ajuste', label: 'Ajuste automático', icon: '⚙️', tier: 'pro' },
      { id: 'simulador', label: 'Simulador de ciclos', icon: '🔮', tier: 'pro' },
    ],
  },
  {
    id: 'conhecimento',
    label: 'Conhecimento',
    items: [
      { id: 'lib', label: 'Biblioteca', icon: '📚' },
      { id: 'calc', label: 'Calculadora', icon: '🧮' },
    ],
  },
];

const FOOTER_ITEMS: Item[] = [
  { id: 'exportacao', label: 'Exportar', icon: '📥', tier: 'essencial' },
  { id: 'config', label: 'Configurações', icon: '⚙️' },
];

// ─── Helpers de tier ─────────────────────────────
function hasAccess(itemTier: Item['tier'], userPlano: string): boolean {
  if (!itemTier || itemTier === 'free') return true;
  if (itemTier === 'essencial') return userPlano === 'essencial' || userPlano === 'pro';
  if (itemTier === 'pro') return userPlano === 'pro';
  return true;
}

// ─── Cores (alinhadas ao globals.css) ────────────
const C = {
  bg: '#FFFFFF',
  bg2: '#F7F7F7',
  bg3: '#EFEFEF',
  ink: '#0F1115',
  inkSoft: '#1A1D23',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  border: '#EBEBEB',
  borderStrong: '#D8D8D8',
  green: '#22C55E',
  greenSoft: '#DCFCE7',
  greenInk: '#15803D',
};

// ═══════════════════════════════════════════════
export default function Sidebar({
  active,
  onNavigate,
  mobileOpen,
  onMobileClose,
  expanded,
  onToggleExpand,
  plano = 'free',
}: Props) {
  // Estado de colapso por grupo (default: todos abertos)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    acompanhar: true,
    ia: true,
    conhecimento: true,
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClick = (item: Item) => {
    if (!hasAccess(item.tier, plano)) {
      // Item Pro — leva pra Planos
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

  const mobileOverlayStyle: React.CSSProperties = mobileOpen
    ? {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        zIndex: 40,
        display: 'block',
      }
    : { display: 'none' };

  const mobileSidebarStyle: React.CSSProperties = mobileOpen
    ? {
        position: 'fixed',
        left: 0,
        top: 0,
        width: 240,
        minWidth: 240,
        zIndex: 50,
      }
    : {};

  return (
    <>
      {/* Overlay mobile */}
      <div style={mobileOverlayStyle} onClick={onMobileClose} />

      <aside
        style={{ ...sidebarStyle, ...mobileSidebarStyle }}
        className="nv-sidebar"
      >
        {/* ─── Header: Logo + Toggle ─── */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <NuvitaLogo />
              </div>
              <button
                onClick={onToggleExpand}
                style={iconBtn}
                aria-label="Recolher menu"
                title="Recolher"
              >
                <ChevronLeft />
              </button>
            </>
          ) : (
            <button
              onClick={onToggleExpand}
              style={iconBtn}
              aria-label="Expandir menu"
              title="Expandir"
            >
              <Menu />
            </button>
          )}
        </div>

        {/* ─── Scroll area ─── */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {/* Top items (sempre visíveis) */}
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

          {/* Divider */}
          <div style={{ height: 1, background: C.border, margin: '12px 8px' }} />

          {/* Groups */}
          {GROUPS.map((group) => (
            <div key={group.id} style={{ marginBottom: 4 }}>
              {expanded && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    border: 'none',
                    background: 'transparent',
                    color: C.subtle,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: 6,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = C.bg2)}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>{group.label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      transform: openGroups[group.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s',
                    }}
                  >
                    ▶
                  </span>
                </button>
              )}
              {(openGroups[group.id] || !expanded) &&
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
          ))}
        </nav>

        {/* ─── Footer: Exportar, Configurações ─── */}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
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

          {/* CTA upgrade (se não é Pro) */}
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
              title="Ver planos"
            >
              <span>⭐</span>
              <span>{plano === 'free' ? 'Upgrade' : 'Ir para Pro'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Componente de item ──────────────────────────
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
    position: 'relative',
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
      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
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

// ─── Ícones ──────────────────────────────────────
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <rect x="2" y="5.5" width="9" height="6.5" rx="1.5" stroke={C.subtle} strokeWidth="1.2" />
      <path
        d="M4 5.5V4a2.5 2.5 0 015 0v1.5"
        stroke={C.subtle}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 4L6 8L10 12"
        stroke={C.muted}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Menu() {
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
