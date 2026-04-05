// @ts-nocheck
'use client';

import { useState } from 'react';

export default function SectionAjuste({ answers, userId }: any) {
  const [tab,        setTab]        = useState<'sugestoes'|'reajuste'|'historico'>('sugestoes');
  const [motivoForm, setMotivoForm] = useState('');
  const [sintomas,   setSintomas]   = useState<string[]>([]);
  const [loadingIA,  setLoadingIA]  = useState(false);
  const [reajusteSug,setReajusteSug]= useState('');

  const SINTOMAS_OPC = ['Plateau no peso','Fadiga','Fome aumentada','Menos energia','Insônia','Irritabilidade','Resultados estagnados'];

  const pedirReajuste = async () => {
    if (!motivoForm) return;
    setLoadingIA(true);
    try {
      const res = await fetch('/api/ia', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          system:`Você é o Coach IA da Nuvita. Com base nos sintomas e motivo, sugira ajustes específicos no protocolo de peptídeos. Seja direto. Máximo 3 parágrafos.`,
          messages:[{role:'user', content:`Motivo: ${motivoForm}\nSintomas: ${sintomas.join(', ')}`}],
        }),
      });
      const data = await res.json();
      setReajusteSug(data.text || 'Configure ANTHROPIC_API_KEY.');
    } catch { setReajusteSug('Erro ao consultar a IA.'); }
    finally { setLoadingIA(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Ajuste de protocolo</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Solicite um reajuste baseado na sua evolução real</p>
        </div>
        <button className="btn btn-d" onClick={() => setTab('reajuste')} style={{ flexShrink:0 }}>🔄 Pedir reajuste</button>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'1.25rem' }}>
        {[['sugestoes','Sugestões automáticas'],['reajuste','🔄 Pedir reajuste'],['historico','Histórico']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v as any)}
            style={{ padding:'9px 14px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:tab===v?'var(--tx)':'var(--ts)', borderBottom:tab===v?'2px solid var(--dark)':'2px solid transparent' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'sugestoes' && (
        <div style={{ background:'#F7F7F7', border:'1.5px dashed var(--border)', borderRadius:14, padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>🤖</div>
          <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Sem dados suficientes ainda</div>
          <div style={{ fontSize:13, color:'var(--ts)', lineHeight:1.65, maxWidth:380, margin:'0 auto 1.5rem' }}>
            Sugestões automáticas ficam disponíveis após pelo menos 2 semanas de uso com registros diários no tracker e diário.
          </div>
          <button className="btn btn-d" onClick={() => setTab('reajuste')}>Pedir reajuste manual →</button>
        </div>
      )}

      {tab === 'reajuste' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Por que você quer um reajuste?</div>
            <div style={{ fontSize:12, color:'var(--ts)', marginBottom:'1rem' }}>Descreva o que mudou ou como está se sentindo. A IA vai analisar e sugerir alterações.</div>
            <textarea className="inp" rows={3} placeholder="ex: Parei de perder peso nas últimas 2 semanas, estou com menos energia..."
              value={motivoForm} onChange={e=>setMotivoForm(e.target.value)}
              style={{ resize:'none', fontFamily:'inherit', fontSize:13, marginBottom:'1rem' }}/>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--tm)', marginBottom:8 }}>Sintomas observados</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:'1.25rem' }}>
              {SINTOMAS_OPC.map(s=>(
                <div key={s} onClick={()=>setSintomas(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])}
                  style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .13s', background:sintomas.includes(s)?'var(--gp)':'var(--bg2)', color:sintomas.includes(s)?'var(--gm)':'var(--tm)', border:`1px solid ${sintomas.includes(s)?'var(--green)':'var(--border)'}` }}>
                  {s}
                </div>
              ))}
            </div>
            <button className="btn btn-d fw" onClick={pedirReajuste} disabled={!motivoForm||loadingIA}>
              {loadingIA?'⏳ Analisando...':'🤖 Gerar sugestão de reajuste'}
            </button>
          </div>
          {reajusteSug && (
            <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--gm)', marginBottom:'.875rem' }}>🤖 Sugestão de reajuste — Coach Nuvita</div>
              <div style={{ fontSize:13, color:'var(--gm)', lineHeight:1.75, whiteSpace:'pre-wrap', marginBottom:'1rem' }}>{reajusteSug}</div>
              <button className="btn btn-o" onClick={()=>setReajusteSug('')} style={{ fontSize:12 }}>Gerar nova análise</button>
            </div>
          )}
        </div>
      )}

      {tab === 'historico' && (
        <div style={{ background:'#F7F7F7', border:'1.5px dashed var(--border)', borderRadius:14, padding:'2.5rem', textAlign:'center' }}>
          <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>📋</div>
          <div style={{ fontSize:13, color:'var(--ts)' }}>Nenhum ajuste registrado ainda</div>
        </div>
      )}
    </div>
  );
}
