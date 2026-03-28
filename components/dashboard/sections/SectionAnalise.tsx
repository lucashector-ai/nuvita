// @ts-nocheck
'use client';

import { useState } from 'react';

const PESO_DATA = [
  { sem:1, peso:82.0 }, { sem:2, peso:81.4 }, { sem:3, peso:80.9 },
  { sem:4, peso:80.3 }, { sem:5, peso:79.8 }, { sem:6, peso:79.3 },
  { sem:7, peso:79.0 }, { sem:8, peso:79.0 },
];

const ENERGIA_DATA = [
  { sem:1, val:5.5 }, { sem:2, val:6.0 }, { sem:3, val:6.8 },
  { sem:4, val:7.0 }, { sem:5, val:7.2 }, { sem:6, val:7.4 },
  { sem:7, val:7.2 }, { sem:8, val:7.0 },
];

function MiniChart({ data, cor, minVal, maxVal, label, unidade }: any) {
  const w = 320, h = 80, pad = 8;
  const xScale = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const yScale = (v: number) => h - pad - ((v - minVal) / (maxVal - minVal)) * (h - pad * 2);
  const points = data.map((d: any, i: number) => `${xScale(i)},${yScale(d.val ?? d.peso)}`).join(' ');
  return (
    <div style={{ background:'var(--bg2)', borderRadius:10, padding:'10px 12px' }}>
      <div style={{ fontSize:10, fontWeight:500, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>{label}</div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display:'block', overflow:'visible' }}>
        {[0,.5,1].map(t => (
          <line key={t} x1={pad} y1={pad + t*(h-pad*2)} x2={w-pad} y2={pad + t*(h-pad*2)} stroke="var(--border)" strokeWidth="0.5"/>
        ))}
        <polyline points={points} fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {data.map((d: any, i: number) => (
          <circle key={i} cx={xScale(i)} cy={yScale(d.val ?? d.peso)} r="3" fill={cor} stroke="var(--bg)" strokeWidth="1.5"/>
        ))}
        {data.map((d: any, i: number) => (
          i % 2 === 0 && <text key={i} x={xScale(i)} y={h+2} textAnchor="middle" fontSize="8" fill="var(--ts)">S{d.sem}</text>
        ))}
      </svg>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
        <div style={{ fontSize:11, color:'var(--ts)' }}>Início: {(data[0].val ?? data[0].peso)}{unidade}</div>
        <div style={{ fontSize:11, fontWeight:500, color:cor }}>Atual: {(data[data.length-1].val ?? data[data.length-1].peso)}{unidade}</div>
      </div>
    </div>
  );
}

export default function SectionAnalise({ answers, objs }) {
  const [loading,  setLoading]  = useState(false);
  const [analise,  setAnalise]  = useState('');
  const [gerado,   setGerado]   = useState(false);
  const [chartTab, setChartTab] = useState<'peso'|'energia'>('peso');

  const gerar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ia', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          system:`Você é o Coach IA da Nuvita. Analise o progresso e forneça insights em português. Seja direto e específico. Máximo 4 parágrafos.`,
          messages:[{role:'user', content:`Dados: perda de 3kg em 8 semanas, adesão 73%, energia média 7.2/10, sono 7.5/10. Analise se está funcionando e sugira próximos passos.`}],
        }),
      });
      const data = await res.json();
      setAnalise(data.text || 'Configure ANTHROPIC_API_KEY no .env.local para usar a análise.');
      setGerado(true);
    } catch {
      setAnalise('Configure ANTHROPIC_API_KEY no .env.local para usar a análise de IA.');
      setGerado(true);
    } finally { setLoading(false); }
  };

  const METRICAS = [
    { label:'Perda de peso', val:'-3 kg',   sub:'em 8 semanas',        cor:'var(--gm)' },
    { label:'Adesão média',  val:'73%',      sub:'acima de 70% = bom',  cor:'var(--gm)' },
    { label:'Energia',       val:'+0.8',     sub:'vs. início do ciclo', cor:'var(--gm)' },
    { label:'Sono',          val:'7.5/10',   sub:'qualidade geral',     cor:'var(--tm)' },
  ];

  const INSIGHTS = [
    { tipo:'positivo', icon:'✅', texto:'Perda de ~375g/semana — dentro da faixa ideal para preservação de massa muscular' },
    { tipo:'positivo', icon:'📈', texto:'Energia melhorou 27% da semana 1 para a semana 6 do ciclo' },
    { tipo:'atencao',  icon:'⚠️', texto:'Semana 8 com 43% de adesão — queda. Risco de rebound. Considere modo simplificado' },
    { tipo:'sugestao', icon:'💡', texto:'Tendência de peso estabilizando. Pode ser hora de ajustar a dose do Semaglutide' },
  ];

  const TIPO_STYLE = {
    positivo: { bg:'var(--gp)',  border:'rgba(29,158,117,.2)', color:'var(--gm)' },
    atencao:  { bg:'#FAEEDA',    border:'rgba(239,159,39,.2)', color:'#633806'   },
    sugestao: { bg:'var(--bg2)', border:'var(--border)',       color:'var(--tm)' },
  };

  return (
    <div>
      {/* Header com botão no topo */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem', gap:16, flexWrap:'wrap' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Análise de progresso</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Avaliação automática do seu protocolo com insights e gráficos</p>
        </div>
        {!gerado ? (
          <button className="btn btn-d" onClick={gerar} disabled={loading} style={{ flexShrink:0 }}>
            {loading ? '⏳ Analisando...' : '🤖 Gerar análise com IA'}
          </button>
        ) : (
          <button className="btn btn-o" onClick={() => { setGerado(false); setAnalise(''); }} style={{ flexShrink:0, fontSize:12 }}>
            Gerar nova análise
          </button>
        )}
      </div>

      {/* Resultado da IA — aparece logo abaixo do título quando gerado */}
      {gerado && (
        <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:14, padding:'1.25rem', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'.875rem' }}>
            <div style={{ width:28, height:28, background:'var(--dark)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', flexShrink:0 }}>🤖</div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--gm)' }}>Análise personalizada — Coach Nuvita</div>
          </div>
          <div style={{ fontSize:13, color:'var(--gm)', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{analise}</div>
        </div>
      )}

      {/* Métricas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1rem' }}>
        {METRICAS.map(m => (
          <div key={m.label} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem' }}>
            <div style={{ fontSize:10, fontWeight:500, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:'1.3rem', fontWeight:500, color:m.cor, letterSpacing:'-.04em', marginBottom:2 }}>{m.val}</div>
            <div style={{ fontSize:11, color:'var(--ts)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Evolução ao longo do ciclo</div>
          <div style={{ display:'flex', gap:4 }}>
            {[['peso','Peso'],['energia','Energia']].map(([v,l]) => (
              <button key={v} onClick={() => setChartTab(v as any)}
                style={{ padding:'4px 10px', borderRadius:7, border:`1px solid ${chartTab===v?'var(--green)':'var(--border)'}`, background:chartTab===v?'#F2FCF7':'var(--bg2)', color:chartTab===v?'var(--gm)':'var(--tm)', fontSize:11, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {chartTab === 'peso'
          ? <MiniChart data={PESO_DATA.map(d=>({...d,val:d.peso}))} cor="#1D9E75" minVal={78} maxVal={83} label="Peso corporal (kg)" unidade=" kg"/>
          : <MiniChart data={ENERGIA_DATA} cor="#7F77DD" minVal={4} maxVal={10} label="Energia percebida (1–10)" unidade="/10"/>
        }
      </div>

      {/* Insights automáticos */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Insights automáticos</div>
        </div>
        <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:8 }}>
          {INSIGHTS.map((ins, i) => (
            <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:10, background:TIPO_STYLE[ins.tipo].bg, border:`1px solid ${TIPO_STYLE[ins.tipo].border}` }}>
              <span style={{ fontSize:'1rem', flexShrink:0 }}>{ins.icon}</span>
              <span style={{ fontSize:13, color:TIPO_STYLE[ins.tipo].color, lineHeight:1.5 }}>{ins.texto}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
