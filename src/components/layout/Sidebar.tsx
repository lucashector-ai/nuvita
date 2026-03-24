"use client";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  userName: string;
  planLabel: string;
  onProfile: () => void;
  onLogout: () => void;
}

export function Sidebar({ items, userName, planLabel, onProfile, onLogout }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const initial = userName ? userName.charAt(0).toUpperCase() : "—";

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-[199] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={[
          "sidebar fixed top-0 left-0 h-screen border-r border-[var(--border)] z-[200]",
          "flex flex-col bg-white transition-all duration-[220ms]",
          open ? "open" : "",
        ].join(" ")}
        onClick={() => !open && setOpen(true)}
      >
        {/* Top */}
        <div className="flex flex-col items-center gap-1 py-2">
          <div className="flex items-center gap-2 px-2 w-full">
            <button
              onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--tm)] hover:bg-[var(--bg2)] hover:text-[var(--tx)] transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <div
              className={[
                "overflow-hidden whitespace-nowrap transition-all duration-[220ms]",
                open ? "opacity-100 w-28" : "opacity-0 w-0",
              ].join(" ")}
            >
              <Logo width={80} />
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 flex flex-col gap-px">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={(e) => { e.stopPropagation(); item.onClick(); }}
              className={[
                "flex items-center gap-0 py-[9px] w-full cursor-pointer relative",
                "transition-colors duration-150 group",
                item.active
                  ? "text-[var(--gm)]"
                  : "text-[var(--tm)] hover:bg-[var(--bg2)] hover:text-[var(--tx)]",
              ].join(" ")}
            >
              {item.active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--green)] rounded-r-sm" />
              )}
              <span className="w-[52px] flex items-center justify-center flex-shrink-0">
                {item.icon}
              </span>
              <span
                className={[
                  "text-[13px] font-medium tracking-[-0.02em] whitespace-nowrap",
                  "transition-all duration-[220ms]",
                  open ? "opacity-100 w-36" : "opacity-0 w-0 overflow-hidden",
                ].join(" ")}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom: avatar compacto quando fechado, perfil quando aberto */}
        <div className="py-2">
          {/* Avatar compacto (só quando fechado) */}
          {!open && (
            <button
              onClick={(e) => { e.stopPropagation(); onProfile(); }}
              className="w-[34px] h-[34px] rounded-full bg-[var(--gp)] flex items-center justify-center text-xs font-medium text-[var(--gm)] mx-auto mb-1 hover:bg-[var(--bg3)] transition-colors"
            >
              {initial}
            </button>
          )}

          {/* Linha de perfil (quando aberto) */}
          <div className={["flex items-center w-full", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")}>
            <button
              onClick={(e) => { e.stopPropagation(); onProfile(); }}
              className="flex-1 flex items-center gap-0 py-2 group"
            >
              <span className="w-[52px] flex items-center justify-center flex-shrink-0">
                <span className="w-[34px] h-[34px] rounded-full bg-[var(--gp)] flex items-center justify-center text-xs font-medium text-[var(--gm)] group-hover:bg-[var(--bg3)] transition-colors">
                  {initial}
                </span>
              </span>
              <div className="overflow-hidden whitespace-nowrap">
                <span className="block text-[12px] font-medium text-[var(--tx)] tracking-[-0.02em]">
                  {userName || "—"}
                </span>
                <span className="block text-[10px] text-[var(--ts)]">{planLabel}</span>
              </div>
            </button>
            {/* Botão sair */}
            <button
              onClick={(e) => { e.stopPropagation(); onLogout(); }}
              title="Sair"
              className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-[var(--ts)] hover:text-[var(--am)] hover:bg-[var(--bg2)] rounded-lg transition-colors mr-1"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M6 13H4a1 1 0 01-1-1V4a1 1 0 011-1h2M10.5 11l4-3-4-3M14.5 8H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
