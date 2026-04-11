// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/apiClient';

function SparkLine({ data, cor, label, unidade }: any) {
  if (!data || data.length < 2) return null;
  const w = 400, h = 80, pad = 10;
  const vals = data.map((d: any) => d.val);
  const min = Math.min(...vals) - 0.5;
  const max = Math.max(...vals) + 0.5;
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const pts = data.map((d: any, i: number) => `${x(i)},${y(d.val)}`).join(' ');
  const trend = vals[vals.length - 1] - vals[0];
  return (
    <div className="dc" style={{ marginBottom: 0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>{label}</div>
        <div style={{ fontSize:12, fontWeight:500, color: trend <= 0 ? 'var(--gm)' : 'var(--am)' }}>
          {trend > 0 ? '+' : ''}{trend.toFixed(1)}{unidade}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display:'block', overflow:'visible' }}>
        <defs>
          <linearGradient id={`g_${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={cor} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={`${x(0)},${h} ${pts} ${x(data.length-1)},${h}`} fill={`url(#g_${label})`}/>
        <polyline points={pts} fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {data.map((d: any, i: number) => (
          <circle key={i} cx={x(i)} cy={y(d.val)} r="3" fill={cor} stroke="var(--bg)" strokeWidth="1.5"/>
        ))}
      </svg>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:11, color:'var(--ts)' }}>
        <span>{data[0].label}</span>
        <span style={{ fontWeight:500, color: cor }}>{vals[vals.length-1]}{unidade} atual</span>
      </div>
    </div>
  );
}

export default function SectionAnalise({ userId, answers, objs }: any) {
  const [entries,    setEntries]    = useState<any[]>([]);
  const [adesao,     setAdesao]     = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [analiseIA,  setAnaliseIA]  = useState('');
  const [gerandoIA,  setGerandoIA]  = useState(false);
  const [ultimaAnal, setUltimaAnal] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    carregarDados();
  }, [userId]);

  const carregarDados = async () => {
    setLoading(true);
    const [{ data: tr }, { data: ad }] = await Promise.all([
      supabase.from('tracker_entries').select('*').eq('user_id', userId).order('data', { ascending: true }),
      supabase.from('adesao_diaria').select('*').eq('user_id', userId).order('data', { ascending: false }).limit(30),
    ]);
    setEntries(tr || []);
    setAdesao(ad || []);

    // Verifica se deve gerar análise automática (a cada 2 dias)
    const ultima = localStorage.getItem(`nv_analise_${userId}`);
    setUltimaAnal(ultima);
    if (tr && tr.length >= 3) {
      const agora = Date.now();
      const duasDias = 2 * 24 * 60 * 60 * 1000;
      if (!ultima || agora - Number(ultima) > duasDias) {
        gerarAnalise(tr, ad || []);
      }
    }
    setLoading(false);
  };

  const gerarAnalise = async (tr: any[], ad: any[]) => {
    if (gerandoIA) return;
    setGerandoIA(true);
    try {
      const pesoInicio = tr[0]?.peso;
      const pesoAtual  = tr[tr.length - 1]?.peso;
      const energiaMedia = tr.reduce((s, e) => s + (e.energia || 0), 0) / tr.length;
      const sonoMedio    = tr.reduce((s, e) => s + (e.sono || 0), 0) / tr.length;
      const diasAtivos   = ad.filter(a => a.aplicado).length;
      const adesaoPct    = ad.length > 0 ? Math.round((diasAtivos / ad.length) * 100) : 0;

      const res = await apiFetch('/api/ia', {
        method: 'POST',
        body: JSON.stringify({
          system: 'Você é o Coach IA da Nuvita. Analise o progresso do usuário e forneça insights diretos e personalizados em português. Máximo 3 parágrafos curtos. Seja específico com os números.',
          messages: [{ role: 'user', content: `Dados do usuário:
- Registros: ${tr.length} entradas
- Peso: ${pesoInicio ? pesoInicio + 'kg → ' + pesoAtual + 'kg (' + (pesoAtual - pesoInicio).toFixed(1) + 'kg)' : 'não registrado'}
- Energia média: ${energiaMedia.toFixed(1)}/10
- Sono médio: ${sonoMedio.toFixed(1)}/10
- Adesão ao protocolo: ${adesaoPct}% (${diasAtivos}/${ad.length} dias)
- Objetivos: ${Array.isArray(answers?.q3) ? answers.q3.join(', ') : answers?.q3 || 'não informado'}
Analise o progresso e sugira ajustes específicos.` }],
        }),
      });
      const data = await res.json();
      if (data.text) {
        setAnaliseIA(data.text);
        localStorage.setItem(`nv_analise_${userId}`, String(Date.now()));
        setUltimaAnal(String(Date.now()));
      }
    } catch (e) { console.error(e); }
    setGerandoIA(false);
  };

  const pesoData    = entries.filter(e => e.peso).map((e, i) => ({ val: e.peso, label: new Date(e.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) }));
  const energiaData = entries.filter(e => e.energia).map((e, i) => ({ val: e.energia, label: new Date(e.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) }));
  const sonoData    = entries.filter(e => e.sono).map((e, i) => ({ val: e.sono, label: new Date(e.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) }));
  const adesaoPct   = adesao.length > 0 ? Math.round((adesao.filter(a => a.aplicado).length / adesao.length) * 100) : 0;

  if (loading) return (
    <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando dados...</div>
  );

  if (entries.length < 3) return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Análise de progresso</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>A IA analisa seus dados automaticamente a cada 2 dias</p>
      </div>
      <div style={{ background:'#F7F7F7', border:'1.5px dashed var(--border)', borderRadius:16, padding:'3rem 2rem', textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📊</div>
        <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Ainda sem dados suficientes</div>
        <div style={{ fontSize:13, color:'var(--ts)', lineHeight:1.7, maxWidth:400, margin:'0 auto' }}>
          A análise de progresso será gerada automaticamente após <strong>3 registros no Tracker</strong>. 
          Continue registrando energia, peso e sono diariamente.
        </div>
        <div style={{ marginTop:'1.5rem', fontSize:12, color:'var(--ts)', background:'#FFFFFF', borderRadius:10, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'10px 16px', display:'inline-block' }}>
          {entries.length}/3 registros necessários
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Análise de progresso</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>
            {ultimaAnal ? `Última análise: ${new Date(Number(ultimaAnal)).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}` : 'Análise sendo gerada...'}
          </p>
        </div>
        {gerandoIA && (
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--gm)', background:'var(--gp)', padding:'6px 12px', borderRadius:100 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', animation:'pulse 1s infinite' }}/>
            IA analisando...
          </div>
        )}
      </div>

      {/* Stats rápidos */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.25rem' }}>
        {[
          { label:'Registros', val: entries.length, icon:'📝', cor:'var(--tx)' },
          { label:'Adesão', val: adesaoPct+'%', icon:'✓', cor: adesaoPct >= 70 ? 'var(--gm)' : 'var(--am)' },
          { label:'Energia média', val: entries.length ? (entries.reduce((s,e)=>s+(e.energia||0),0)/entries.length).toFixed(1)+'/10' : '—', icon:'⚡', cor:'#EF9F27' },
          { label:'Peso atual', val: entries.filter(e=>e.peso).length ? entries.filter(e=>e.peso).slice(-1)[0].peso+'kg' : '—', icon:'⚖️', cor:'var(--tx)' },
        ].map(s => (
          <div key={s.label} className="dc" style={{ textAlign:'center', marginBottom:0 }}>
            <div style={{ fontSize:'1.3rem', marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:'1.2rem', fontWeight:500, color:s.cor, letterSpacing:'-.04em' }}>{s.val}</div>
            <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Análise IA */}
      {analiseIA && (
        <div className="dc" style={{ marginBottom:'1.25rem', background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'.75rem' }}>
            <span style={{ fontSize:'1rem' }}>🤖</span>
            <span style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--gm)' }}>Análise da IA Nuvita</span>
          </div>
          <div style={{ fontSize:13, color:'var(--tx)', lineHeight:1.8, whiteSpace:'pre-line' }}>{analiseIA}</div>
        </div>
      )}

      {/* Gráficos */}
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {pesoData.length > 1 && <SparkLine data={pesoData.slice(-10)} cor="#1D9E75" label="Peso" unidade=" kg"/>}
        {energiaData.length > 1 && <SparkLine data={energiaData.slice(-10)} cor="#EF9F27" label="Energia" unidade="/10"/>}
        {sonoData.length > 1 && <SparkLine data={sonoData.slice(-10)} cor="#7F77DD" label="Sono" unidade="/10"/>}
      </div>
    </div>
  );
}
