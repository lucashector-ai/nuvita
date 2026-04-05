// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SectionHistorico({ userId, answers }: any) {
  const [entries,   setEntries]   = useState<any[]>([]);
  const [adesao,    setAdesao]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [resumoIA,  setResumoIA]  = useState('');
  const [gerandoIA, setGerandoIA] = useState(false);

  useEffect(() => {
    if (!userId) return;
    carregarHistorico();
  }, [userId]);

  const carregarHistorico = async () => {
    setLoading(true);
    const [{ data: tr }, { data: ad }, { data: ci }] = await Promise.all([
      supabase.from('tracker_entries').select('*').eq('user_id', userId).order('data', { ascending: false }),
      supabase.from('adesao_diaria').select('*').eq('user_id', userId).order('data', { ascending: false }),
      supabase.from('check_ins').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(30),
    ]);
    setEntries(tr || []);
    setAdesao(ad || []);
    setLoading(false);

    // Gera resumo IA se tiver dados suficientes e não gerou ainda hoje
    if (tr && tr.length >= 5) {
      const hoje = new Date().toISOString().split('T')[0];
      const ultimoResumo = localStorage.getItem(`nv_historico_ia_${userId}`);
      if (ultimoResumo !== hoje) {
        gerarResumoIA(tr, ad || []);
      } else {
        const resumoSalvo = localStorage.getItem(`nv_historico_texto_${userId}`);
        if (resumoSalvo) setResumoIA(resumoSalvo);
      }
    }
  };

  const gerarResumoIA = async (tr: any[], ad: any[]) => {
    setGerandoIA(true);
    try {
      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'Você é o Coach IA da Nuvita. Crie um resumo conciso do histórico do usuário em 2 parágrafos. Destaque padrões, conquistas e áreas de melhoria.',
          messages: [{ role: 'user', content: `Histórico: ${tr.length} registros de tracker, ${ad.filter(a=>a.aplicado).length}/${ad.length} dias de adesão ao protocolo. Peso: ${tr.filter(e=>e.peso)[0]?.peso || 'não registrado'}kg inicial, ${tr.filter(e=>e.peso).slice(-1)[0]?.peso || 'não registrado'}kg atual. Energia média: ${tr.length ? (tr.reduce((s,e)=>s+(e.energia||0),0)/tr.length).toFixed(1) : '?'}/10.` }],
        }),
      });
      const data = await res.json();
      if (data.text) {
        setResumoIA(data.text);
        const hoje = new Date().toISOString().split('T')[0];
        localStorage.setItem(`nv_historico_ia_${userId}`, hoje);
        localStorage.setItem(`nv_historico_texto_${userId}`, data.text);
      }
    } catch(e) {}
    setGerandoIA(false);
  };

  const diasAdesao = adesao.filter(a => a.aplicado).length;
  const pctAdesao  = adesao.length > 0 ? Math.round((diasAdesao / adesao.length) * 100) : 0;

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando...</div>;

  if (entries.length === 0) return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Histórico completo</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Tudo que você registrou desde o início do protocolo</p>
      </div>
      <div style={{ background:'var(--bg)', border:'1.5px dashed var(--border)', borderRadius:16, padding:'3rem 2rem', textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📋</div>
        <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Histórico vazio por enquanto</div>
        <div style={{ fontSize:13, color:'var(--ts)', lineHeight:1.7, maxWidth:420, margin:'0 auto' }}>
          Seu histórico completo aparecerá aqui conforme você registrar dados no Diário — peso, energia, sono e adesão ao protocolo.
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Histórico completo</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>{entries.length} registros · {adesao.length} dias monitorados</p>
        </div>
      </div>

      {/* Resumo IA */}
      {(resumoIA || gerandoIA) && (
        <div className="dc" style={{ marginBottom:'1.25rem', background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'.625rem' }}>
            <span>🤖</span>
            <span style={{ fontSize:11, fontWeight:600, color:'var(--gm)', textTransform:'uppercase', letterSpacing:'.07em' }}>
              {gerandoIA ? 'IA analisando...' : 'Resumo da IA'}
            </span>
          </div>
          <div style={{ fontSize:13, color:'var(--tx)', lineHeight:1.75 }}>{resumoIA}</div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:'1.25rem' }}>
        {[
          { label:'Registros total', val: entries.length, icon:'📝' },
          { label:'Adesão geral', val: pctAdesao+'%', icon:'💊' },
          { label:'Dias monitorados', val: adesao.length, icon:'📅' },
        ].map(s => (
          <div key={s.label} className="dc" style={{ textAlign:'center', marginBottom:0 }}>
            <div style={{ fontSize:'1.3rem', marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:'1.3rem', fontWeight:500, color:'var(--tx)', letterSpacing:'-.04em' }}>{s.val}</div>
            <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabela de registros */}
      <div className="dc" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)', fontSize:11, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em' }}>
          Registros do Diário
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--bg2)' }}>
                {['Data','Peso','Energia','Sono','Nota'].map(h=>(
                  <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 30).map((e,i) => (
                <tr key={e.id||i} style={{ borderBottom:'0.5px solid var(--border)' }}>
                  <td style={{ padding:'9px 14px', color:'var(--ts)', fontSize:12 }}>{new Date(e.data).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding:'9px 14px', fontWeight:500 }}>{e.peso ? e.peso+' kg' : '—'}</td>
                  <td style={{ padding:'9px 14px', color:'#EF9F27' }}>{e.energia ? e.energia+'/10' : '—'}</td>
                  <td style={{ padding:'9px 14px', color:'#7F77DD' }}>{e.sono ? e.sono+'/10' : '—'}</td>
                  <td style={{ padding:'9px 14px', color:'var(--tm)', fontStyle:e.nota?'italic':'normal', fontSize:12 }}>{e.nota||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
