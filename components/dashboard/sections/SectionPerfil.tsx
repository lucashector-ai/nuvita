// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { OBJECTIVE_LABELS, DURACAO_LABELS, NIVEL_LABELS } from '@/types';

export default function SectionPerfil({ answers, plan, onNavigate, userId, onPlanChange }: any) {
  const [nome, setNome]       = useState(answers?.nome || '');
  const [email, setEmail]     = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo]     = useState(false);
  const [editando, setEditando] = useState(false);
  const [memberSince, setMemberSince] = useState('');

  const inicial = nome ? nome.charAt(0).toUpperCase() : '?';
  const CARD = { background:'#FFFFFF', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', marginBottom:'1rem' };
  const PLAN_COLORS = { free:'#6B7280', essencial:'#0F6E56', pro:'#7C3AED' };
  const PLAN_LABELS = { free:'Conta gratuita', essencial:'Essencial', pro:'Pro' };

  useEffect(() => {
    if (!userId) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || '');
        const created = user.created_at ? new Date(user.created_at) : null;
        if (created) setMemberSince(created.toLocaleDateString('pt-BR', { month:'long', year:'numeric' }));
      }
    });
  }, [userId]);

  const salvar = async () => {
    setSalvando(true);
    await supabase.from('usuarios').update({ nome, updated_at: new Date().toISOString() }).eq('id', userId);
    setSalvando(false); setSalvo(true); setEditando(false);
    setTimeout(() => setSalvo(false), 2000);
  };

  const objs = answers?.q3 || [];
  const objLabel = objs.map(o => OBJECTIVE_LABELS[o] || o).join(', ') || '—';
  const nivelLabel = NIVEL_LABELS?.[answers?.q4] || answers?.q4 || '—';
  const duracaoLabel = DURACAO_LABELS?.[answers?.q9] || answers?.q9 || '—';

  return (
    <div style={{ maxWidth:600 }}>
      {/* Header com avatar */}
      <div style={{ ...CARD, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--dark)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:28, fontWeight:600, color:'white' }}>{inicial}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            {editando ? (
              <input value={nome} onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && salvar()}
                className="inp" autoFocus style={{ fontSize:18, fontWeight:500, padding:'6px 10px', maxWidth:240 }}/>
            ) : (
              <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.03em', color:'var(--tx)' }}>{nome || 'Usuário'}</h2>
            )}
            <span style={{ fontSize:11, fontWeight:600, padding:'2px 10px', borderRadius:100,
              background: plan==='pro' ? '#F5F3FF' : plan==='essencial' ? '#F0FDF4' : '#F3F4F6',
              color: PLAN_COLORS[plan] || '#6B7280' }}>
              {PLAN_LABELS[plan] || 'Free'}
            </span>
          </div>
          <div style={{ fontSize:13, color:'var(--ts)', marginTop:2 }}>{email}</div>
          {memberSince && <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>Membro desde {memberSince}</div>}
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {editando ? (
            <>
              <button onClick={salvar} disabled={salvando} className="btn btn-d" style={{ fontSize:12, padding:'6px 14px' }}>
                {salvando ? '...' : salvo ? '✓' : 'Salvar'}
              </button>
              <button onClick={() => setEditando(false)} style={{ fontSize:12, padding:'6px 12px', borderRadius:8, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontFamily:'inherit' }}>
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={() => setEditando(true)}
              style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontFamily:'inherit', color:'var(--tm)' }}>
              ✎ Editar
            </button>
          )}
        </div>
      </div>

      {/* Stats do protocolo */}
      <div style={{ ...CARD }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Protocolo atual</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { ico:'🎯', lbl:'Objetivo', val:objLabel },
            { ico:'📊', lbl:'Nível', val:nivelLabel },
            { ico:'⚖️', lbl:'Peso', val: answers?.peso ? answers.peso + ' kg' : '—' },
            { ico:'📅', lbl:'Duração do ciclo', val:duracaoLabel },
            { ico:'🧬', lbl:'Sexo', val: answers?.sexo === 'M' ? 'Masculino' : answers?.sexo === 'F' ? 'Feminino' : '—' },
            { ico:'📏', lbl:'Altura', val: answers?.altura ? answers.altura + ' cm' : '—' },
          ].map(({ ico, lbl, val }) => (
            <div key={lbl} style={{ background:'#F7F7F7', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:11, color:'var(--ts)', marginBottom:3 }}>{ico} {lbl}</div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{val}</div>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate && onNavigate('protocolo')}
          style={{ marginTop:'1rem', width:'100%', padding:'9px', borderRadius:10, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'var(--tm)', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          Ver protocolo completo →
        </button>
      </div>

      {/* Plano */}
      <div style={{ ...CARD }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Plano</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{PLAN_LABELS[plan] || 'Free'}</div>
            <div style={{ fontSize:12, color:'var(--ts)', marginTop:2 }}>
              {plan === 'pro' ? 'Acesso completo a todos os recursos' :
               plan === 'essencial' ? 'Coach IA, Tracker e mais' :
               'Protocolo e biblioteca incluídos'}
            </div>
          </div>
          {plan !== 'pro' && (
            <button onClick={() => onNavigate && onNavigate('planos')} className="btn btn-d" style={{ fontSize:12, padding:'8px 16px' }}>
              Fazer upgrade
            </button>
          )}
        </div>
      </div>

      {/* Ações */}
      <div style={{ ...CARD }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Conta</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <button onClick={() => window.location.href = '/diagnostico'}
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'var(--tm)', textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span>🔄 Refazer diagnóstico</span>
            <span style={{ color:'var(--ts)' }}>→</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('conta')}
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'var(--tm)', textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span>⚙️ Configurações da conta</span>
            <span style={{ color:'var(--ts)' }}>→</span>
          </button>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #FECACA', background:'#FFF5F5', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'#D85A30', textAlign:'left', fontWeight:500 }}>
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
