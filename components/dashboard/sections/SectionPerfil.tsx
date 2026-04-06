// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SectionPerfil({ answers, plan, onNavigate, userId, onPlanChange }: any) {
  const [nome, setNome] = useState(answers?.nome || '');
  const [email, setEmail] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.auth.getUser().then(({ data:{ user } }) => setEmail(user?.email || ''));
  }, [userId]);

  const salvar = async () => {
    setSalvando(true);
    await supabase.from('usuarios').update({ nome, updated_at: new Date().toISOString() }).eq('id', userId);
    setSalvando(false); setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  const CARD = { background:'#FFFFFF', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', marginBottom:'1rem' };

  return (
    <div style={{ maxWidth:560 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Meu perfil</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Informações da sua conta Nuvita</p>
      </div>

      <div style={CARD}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Informações</div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, color:'var(--tm)', display:'block', marginBottom:4 }}>Nome</label>
          <input value={nome} onChange={e => setNome(e.target.value)} className="inp"
            placeholder="Seu nome" style={{ fontSize:14 }}/>
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, color:'var(--tm)', display:'block', marginBottom:4 }}>E-mail</label>
          <input value={email} disabled className="inp" style={{ fontSize:14, opacity:.6 }}/>
        </div>
        <button onClick={salvar} disabled={salvando} className="btn btn-d">
          {salvando ? 'Salvando...' : salvo ? '✓ Salvo' : 'Salvar'}
        </button>
      </div>

      <div style={CARD}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Diagnóstico</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            ['🎯 Objetivo', answers?.q3?.join(', ') || '—'],
            ['📊 Nível', answers?.q4 || '—'],
            ['⚖️ Peso', answers?.peso ? answers.peso + ' kg' : '—'],
            ['🔄 Ciclo', answers?.q9 || '—'],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ background:'#F7F7F7', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:11, color:'var(--ts)', marginBottom:2 }}>{lbl}</div>
              <div style={{ fontSize:13, fontWeight:500 }}>{val}</div>
            </div>
          ))}
        </div>
        <button onClick={() => window.location.href='/diagnostico'}
          style={{ marginTop:'1rem', fontSize:12, padding:'6px 14px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', cursor:'pointer', fontFamily:'inherit', color:'var(--tm)' }}>
          Refazer diagnóstico
        </button>
      </div>

      <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/login'; }}
        style={{ width:'100%', padding:'10px', borderRadius:10, border:'1.5px solid #FECACA', background:'#FFF5F5', color:'#D85A30', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
        Sair da conta
      </button>
    </div>
  );
}
