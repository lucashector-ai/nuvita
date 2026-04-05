// @ts-nocheck
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props { answers: any; userId: string; onNavigate: (s: any) => void; }

export default function SectionConfig({ answers, userId, onNavigate }: Props) {
  const [tema,      setTema]      = useState<'light'|'dark'>('light');
  const [notif,     setNotif]     = useState(true);
  const [salvando,  setSalvando]  = useState(false);
  const [salvo,     setSalvo]     = useState(false);

  const salvar = async () => {
    setSalvando(true);
    await supabase.from('usuarios').update({
      preferencias: { tema, notificacoes: notif },
      updated_at: new Date().toISOString(),
    }).eq('id', userId);
    setSalvando(false); setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
    if (tema === 'dark') {
      document.documentElement.setAttribute('data-theme','dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  return (
    <div style={{ maxWidth:560 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Configurações</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Preferências da plataforma</p>
      </div>

      {/* Aparência */}
      <div style={{ background:'#FFFFFF', borderRadius:14, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'1.25rem', marginBottom:'1rem', border:'none' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Aparência</div>
        <div style={{ display:'flex', gap:10 }}>
          {[['light','☀️ Claro'],['dark','🌙 Escuro']].map(([v,l]) => (
            <button key={v} onClick={() => setTema(v as any)}
              style={{ flex:1, padding:'10px', borderRadius:10, border:`1.5px solid ${tema===v?'var(--dark)':'var(--border)'}`, background:tema===v?'var(--dark)':'var(--bg)', color:tema===v?'white':'var(--tm)', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:tema===v?600:400 }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Notificações */}
      <div style={{ background:'#FFFFFF', borderRadius:14, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'1.25rem', marginBottom:'1rem', border:'none' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Notificações</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
          <span>Lembretes de aplicação</span>
          <div onClick={() => setNotif(!notif)}
            style={{ width:40, height:22, borderRadius:100, background:notif?'var(--green)':'var(--border)', cursor:'pointer', position:'relative', transition:'background .2s' }}>
            <div style={{ position:'absolute', top:2, left:notif?'calc(100% - 20px)':2, width:18, height:18, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
          </div>
        </div>
      </div>

      {/* Salvar */}
      <button onClick={salvar} disabled={salvando} className="btn btn-d"
        style={{ width:'100%', justifyContent:'center', fontSize:14 }}>
        {salvando ? 'Salvando...' : salvo ? '✓ Salvo' : 'Salvar configurações'}
      </button>
    </div>
  );
}
