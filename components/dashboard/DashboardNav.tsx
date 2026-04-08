// @ts-nocheck
'use client';
import { useState, useRef, useEffect } from 'react';
import type { DashSection } from './DashboardShell';
import { supabase } from '@/lib/supabase';

export default function DashboardNav({
  section='inicio', planLabel, nome, planId, onMenuOpen,
  onNavigate, onLogout, onOpenPerfil, onOpenConfig, userId, answers, onOpenPlanos
}) {
  const isHome = section === 'inicio';
  const [notifs, setNotifs]         = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifsRef = useRef(null);
  const userRef   = useRef(null);
  const unread    = notifs.filter(n => !n.lida).length;
  const initial   = nome && nome !== '—' ? nome.charAt(0).toUpperCase() : '?';

  const carregarNotifs = async () => {
    if (!userId) return;
    const { data } = await supabase.from('notificacoes')
      .select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(20);
    if (data) setNotifs(data);
  };

  const gerarNotifsDiarias = async () => {
    if (!userId) return;
    const hoje = new Date().toISOString().split('T')[0];
    const { data: adesao } = await supabase.from('adesao_diaria')
      .select('id,completo').eq('user_id', userId).eq('data', hoje).maybeSingle();
    if (!adesao?.completo) {
      const { data: existe } = await supabase.from('notificacoes').select('id')
        .eq('user_id', userId).eq('titulo', 'Protocolo de hoje')
        .gte('created_at', hoje + 'T00:00:00').maybeSingle();
      if (!existe) {
        await supabase.from('notificacoes').insert({
          user_id: userId, icon: '💉', titulo: 'Protocolo de hoje',
          texto: 'Você ainda não registrou as aplicações de hoje.', action: 'diario',
        });
      }
    }
    const { data: bv } = await supabase.from('notificacoes').select('id')
      .eq('user_id', userId).eq('titulo', 'Bem-vindo à Nuvita!').maybeSingle();
    if (!bv) {
      await supabase.from('notificacoes').insert({
        user_id: userId, icon: '🎉', titulo: 'Bem-vindo à Nuvita!',
        texto: 'Seu protocolo personalizado está pronto. Comece hoje!', action: 'inicio',
      });
    }
    await carregarNotifs();
  };

  useEffect(() => { if (!userId) return; gerarNotifsDiarias(); }, [userId, section]);

  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const marcarTodasLidas = async () => {
    await supabase.from('notificacoes').update({ lida: true })
      .eq('user_id', userId).eq('lida', false);
    setNotifs(p => p.map(n => ({ ...n, lida: true })));
  };

  const handleNotifClick = async (n) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', n.id);
    setNotifs(p => p.map(x => x.id === n.id ? { ...x, lida: true } : x));
    if (n.action) onNavigate(n.action);
    setShowNotifs(false);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Agora';
    if (diff < 3600) return Math.floor(diff/60) + 'min atrás';
    if (diff < 86400) return Math.floor(diff/3600) + 'h atrás';
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
  };

  return (
    <nav className="dash-nav">
      <div className="dash-nav-in">
        {/* Esquerda */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {!isHome && (
            <button onClick={() => onNavigate('inicio')}
              style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'var(--tm)', fontSize:13, fontWeight:500, padding:'4px 8px', borderRadius:8, fontFamily:'inherit' }}>
              ← Início
            </button>
          )}
          {isHome && planLabel && (
            <span style={{ fontSize:12, fontWeight:500, background:'var(--gp)', color:'var(--gm)', padding:'3px 10px', borderRadius:100 }}>{planLabel}</span>
          )}
        </div>

        {/* Direita */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>

          {/* Notificações */}
          <div ref={notifsRef} style={{ position:'relative' }}>
            <button onClick={() => { setShowNotifs(v => !v); if (!showNotifs) marcarTodasLidas(); }}
              style={{ position:'relative', width:36, height:36, borderRadius:10, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
              🔔
              {unread > 0 && (
                <div style={{ position:'absolute', top:-2, right:-2, width:16, height:16, background:'#D85A30', borderRadius:'50%', fontSize:9, fontWeight:700, color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {unread > 9 ? '9+' : unread}
                </div>
              )}
            </button>

            {showNotifs && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:340, background:'#FFFFFF', borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,.12)', zIndex:300, overflow:'hidden' }}>
                {/* Header */}
                <div style={{ padding:'12px 16px', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>Notificações</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {unread > 0 && (
                      <button onClick={marcarTodasLidas} style={{ fontSize:11, color:'var(--gm)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                        Marcar lidas
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)} style={{ fontSize:16, color:'var(--ts)', background:'none', border:'none', cursor:'pointer', lineHeight:1 }}>×</button>
                  </div>
                </div>

                {/* Lista — máximo 5 */}
                <div style={{ maxHeight:360, overflowY:'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Nenhuma notificação</div>
                  ) : notifs.slice(0, 5).map(n => (
                    <div key={n.id} onClick={() => handleNotifClick(n)}
                      style={{ display:'flex', gap:12, padding:'12px 16px', cursor:'pointer', transition:'background .1s', background: n.lida ? 'transparent' : 'rgba(29,158,117,.04)', borderBottom:'1px solid #F3F4F6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = n.lida ? 'transparent' : 'rgba(29,158,117,.04)'}>
                      <div style={{ width:36, height:36, borderRadius:10, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                        {n.icon}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight: n.lida ? 400 : 600, color:'var(--tx)', marginBottom:2 }}>{n.titulo}</div>
                        <div style={{ fontSize:12, color:'var(--ts)', lineHeight:1.4, marginBottom:4 }}>{n.texto}</div>
                        <div style={{ fontSize:11, color:'var(--ts)' }}>{formatDate(n.created_at)}</div>
                      </div>
                      {!n.lida && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', flexShrink:0, marginTop:4 }}/>}
                    </div>
                  ))}
                </div>

                {/* Ver todas */}
                {notifs.length > 5 && (
                  <div style={{ padding:'10px 16px', borderTop:'1px solid #F3F4F6', textAlign:'center' }}>
                    <button onClick={() => { setShowNotifs(false); onNavigate && onNavigate('notificacoes'); }}
                      style={{ fontSize:12, color:'var(--gm)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>
                      Ver todas as notificações →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div ref={userRef} style={{ position:'relative' }}>
            <div onClick={() => setShowUserMenu(v => !v)}
              style={{ width:32, height:32, borderRadius:'50%', background:'var(--dark)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, cursor:'pointer', userSelect:'none' }}>
              {initial}
            </div>
            {showUserMenu && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:200, background:'#FFFFFF', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,.12)', zIndex:300, overflow:'hidden' }}>
                <div style={{ padding:'10px 14px', borderBottom:'1px solid #E5E7EB' }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{nome}</div>
                  <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{planLabel}</div>
                </div>
                {[
                  { label:'Meu perfil', fn: () => { onOpenPerfil?.(); setShowUserMenu(false); } },
                  { label:'Configurações', fn: () => { onOpenConfig?.(); setShowUserMenu(false); } },
                  ...(planId !== 'pro' ? [{ label:'Ver planos', fn: () => { onOpenPlanos?.(); setShowUserMenu(false); } }] : []),
                ].map(item => (
                  <button key={item.label} onClick={item.fn}
                    style={{ width:'100%', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit', fontSize:13, color:'var(--tx)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop:'1px solid #E5E7EB' }}>
                  <button onClick={() => { onLogout(); setShowUserMenu(false); }}
                    style={{ width:'100%', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit', fontSize:13, color:'#D85A30' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
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
