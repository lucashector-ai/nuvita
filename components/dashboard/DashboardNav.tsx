// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import type { DashSection } from './DashboardShell';
import { supabase } from '@/lib/supabase';

interface Notif {
  id: string;
  icon: string;
  text: string;
  sub: string;
  time: string;
  read: boolean;
  action?: string;
}

function gerarNotificacoes(userId: string, answers: any): Promise<Notif[]> {
  return new Promise(async (resolve) => {
    const notifs: Notif[] = [];
    const hoje = new Date().toISOString().split('T')[0];

    try {
      // Verifica check-in de hoje
      const { data: checkin } = await supabase
        .from('check_ins').select('id').eq('user_id', userId).eq('data', hoje).single();
      if (!checkin) {
        notifs.push({ id:'checkin', icon:'✅', text:'Check-in de hoje pendente', sub:'Como você está se sentindo hoje?', time:'Agora', read:false, action:'inicio' });
      }

      // Verifica adesão de hoje
      const { data: adesao } = await supabase
        .from('adesao_diaria').select('id,aplicado').eq('user_id', userId).eq('data', hoje).single();
      if (!adesao || !adesao.aplicado) {
        notifs.push({ id:'adesao', icon:'💉', text:'Protocolo de hoje não registrado', sub:'Registre suas aplicações para manter a adesão', time:'Hoje', read:false, action:'tracker' });
      }

      // Verifica estoque crítico
      const { data: estoque } = await supabase
        .from('estoque_items').select('nome').eq('user_id', userId);
      if (estoque && estoque.length === 0) {
        notifs.push({ id:'estoque', icon:'🧪', text:'Cadastre seu estoque', sub:'Controle quando seus peptídeos vão acabar', time:'Hoje', read:false, action:'estoque' });
      }

      // Verifica tracker — sem registros?
      const { data: tracker } = await supabase
        .from('tracker_entries').select('id').eq('user_id', userId).limit(1);
      if (!tracker || tracker.length === 0) {
        notifs.push({ id:'tracker', icon:'📊', text:'Comece a registrar sua evolução', sub:'Peso, energia e sono no Tracker', time:'Hoje', read:false, action:'tracker' });
      }

      // Notificação de boas-vindas sempre
      notifs.push({ id:'bv', icon:'🎉', text:'Bem-vindo à Nuvita!', sub:'Seu protocolo está pronto. Comece hoje.', time:'Hoje', read:true, action:'inicio' });

    } catch(e) {}

    resolve(notifs.slice(0, 6));
  });
}

export default function DashboardNav({ section = 'inicio', section = 'inicio', section, planLabel, section, nome, planId, onMenuOpen, onNavigate, onLogout, onOpenPerfil, onOpenConfig, userId, answers, onOpenPlanos }) {
  const isHome = section === 'inicio';
  const [notifs,       setNotifs]       = useState<Notif[]>([]);
  const [showNotifs,   setShowNotifs]   = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifsRef  = useRef(null);
  const userRef    = useRef(null);
  const unread     = notifs.filter(n => !n.read).length;
  const initial    = nome && nome !== '—' ? nome.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    if (!userId) return;
    // Sempre recarrega notificações frescas do banco
    setNotifs([]);
    gerarNotificacoes(userId, answers).then(notifs => {
      setNotifs(notifs);
    });
  }, [userId, section]); // Recarrega ao mudar de seção também

  const marcarLidas = () => setNotifs(p => p.map(n => ({ ...n, read:true })));

  const handleNotifClick = (n: Notif) => {
    setNotifs(p => p.map(x => x.id===n.id?{...x,read:true}:x));
    if (n.action) onNavigate(n.action as DashSection);
    setShowNotifs(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !(notifsRef.current as any).contains(e.target)) setShowNotifs(false);
      if (userRef.current && !(userRef.current as any).contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="dash-nav">
      <div className="dash-nav-in">
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {!isHome && (
            <button onClick={() => onNavigate('inicio')}
              style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'var(--tm)', fontSize:13, fontWeight:500, padding:'4px 8px', borderRadius:8, fontFamily:'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg2)'}
              onMouseLeave={e => e.currentTarget.style.background='none'}>
              ← Início
            </button>
          )}
          {isHome && planLabel && (
            <span style={{ fontSize:12, fontWeight:500, background:'var(--gp)', color:'var(--gm)', padding:'3px 10px', borderRadius:100 }}>{planLabel}</span>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Notificações */}
          <div ref={notifsRef} style={{ position:'relative' }}>
            <button onClick={() => { setShowNotifs(v=>!v); if (!showNotifs) marcarLidas(); }}
              style={{ position:'relative', width:36, height:36, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
              🔔
              {unread > 0 && (
                <div style={{ position:'absolute', top:-4, right:-4, width:16, height:16, background:'#D85A30', borderRadius:'50%', fontSize:9, fontWeight:700, color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {unread}
                </div>
              )}
            </button>

            {showNotifs && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:320, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,.12)', zIndex:200, overflow:'hidden' }}>
                <div style={{ padding:'12px 1rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>Notificações</div>
                  {unread > 0 && <button onClick={marcarLidas} style={{ fontSize:11, color:'var(--gm)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Marcar todas como lidas</button>}
                </div>
                {notifs.length === 0 ? (
                  <div style={{ padding:'1.5rem', textAlign:'center', fontSize:13, color:'var(--ts)' }}>Nenhuma notificação</div>
                ) : notifs.map(n => (
                  <div key={n.id} onClick={() => handleNotifClick(n)}
                    style={{ display:'flex', gap:10, padding:'10px 1rem', cursor:'pointer', background:n.read?'transparent':'rgba(29,158,117,.04)', borderBottom:'1px solid var(--border)', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
                    onMouseLeave={e=>e.currentTarget.style.background=n.read?'transparent':'rgba(29,158,117,.04)'}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{n.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:n.read?400:500, color:'var(--tx)', marginBottom:2 }}>{n.text}</div>
                      <div style={{ fontSize:11, color:'var(--ts)', lineHeight:1.4 }}>{n.sub}</div>
                    </div>
                    <div style={{ fontSize:10, color:'var(--ts)', flexShrink:0, marginTop:2 }}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div ref={userRef} style={{ position:'relative' }}>
            <div onClick={() => setShowUserMenu(v=>!v)}
              style={{ width:32, height:32, borderRadius:'50%', background:'var(--dark)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, cursor:'pointer', userSelect:'none' }}>
              {initial}
            </div>
            {showUserMenu && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:200, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,.12)', zIndex:200, overflow:'hidden' }}>
                <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{nome}</div>
                  <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{planLabel}</div>
                </div>
                {[
                  { label:'Meu perfil',      action: () => { onOpenPerfil?.(); setShowUserMenu(false); } },
                  { label:'Configurações',   action: () => { onOpenConfig?.(); setShowUserMenu(false); } },
                  ...(planId !== 'pro' ? [{ label:'Ver planos', action: () => { onOpenPlanos?.(); setShowUserMenu(false); } }] : []),
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    style={{ width:'100%', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit', fontSize:13, color:'var(--tx)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop:'1px solid var(--border)' }}>
                  <button onClick={() => { onLogout(); setShowUserMenu(false); }}
                    style={{ width:'100%', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit', fontSize:13, color:'#D85A30' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
