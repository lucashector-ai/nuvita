// @ts-nocheck
'use client';

import { useState } from 'react';

const CICLOS_MOCK = [
  {
    id: 1,
    nome: 'Ciclo 1 — Emagrecimento',
    inicio: '01/01/2025',
    fim: '26/03/2025',
    duracao: '12 semanas',
    status: 'ativo',
    peptideos: ['Semaglutide','AOD-9604','Ipamorelin'],
    adesao: 73,
    resultados: { pesoInicio: 82, pesofim: 77, energiaMedia: 7.2, sonoMedio: 7.5 },
  },
  {
    id: 2,
    nome: 'Ciclo pré — Teste inicial',
    inicio: '01/09/2024',
    fim: '01/11/2024',
    duracao: '8 semanas',
    status: 'concluido',
    peptideos: ['Ipamorelin','BPC-157'],
    adesao: 89,
    resultados: { pesoInicio: 85, pesofim: 82, energiaMedia: 8.1, sonoMedio: 8.0 },
  },
];

export default function SectionHistorico() {
  const [cicloAberto, setCicloAberto] = useState<number|null>(1);

  return (
    <div style={{ maxWidth:700, gridColumn:'1/-1' }}>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Histórico completo</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Todos os ciclos, peptídeos usados e resultados obtidos</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {CICLOS_MOCK.map(ciclo => (
          <div key={ciclo.id} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', cursor:'pointer' }}
              onClick={() => setCicloAberto(cicloAberto===ciclo.id?null:ciclo.id)}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{ciclo.nome}</span>
                  <span style={{ fontSize:10, fontWeight:500, padding:'2px 8px', borderRadius:100,
                    background: ciclo.status==='ativo'?'var(--gp)':'var(--bg2)',
                    color: ciclo.status==='ativo'?'var(--gm)':'var(--ts)' }}>
                    {ciclo.status === 'ativo' ? '● Em andamento' : '✓ Concluído'}
                  </span>
                </div>
                <div style={{ fontSize:12, color:'var(--ts)' }}>{ciclo.inicio} → {ciclo.status==='ativo'?'hoje':ciclo.fim} · {ciclo.duracao}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{ciclo.adesao}%</div>
                  <div style={{ fontSize:10, color:'var(--ts)' }}>Adesão</div>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"
                  style={{ color:'var(--ts)', transition:'transform .2s', transform:cicloAberto===ciclo.id?'rotate(180deg)':'none' }}>
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Detalhes expandidos */}
            {cicloAberto === ciclo.id && (
              <div style={{ borderTop:'1px solid var(--border)', padding:'1.25rem' }}>
                {/* Peptídeos */}
                <div style={{ marginBottom:'1.25rem' }}>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:8 }}>Peptídeos usados</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {ciclo.peptideos.map(p => (
                      <span key={p} style={{ fontSize:12, background:'var(--gp)', color:'var(--gm)', padding:'3px 10px', borderRadius:100, fontWeight:500 }}>{p}</span>
                    ))}
                  </div>
                </div>

                {/* Resultados */}
                <div>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:8 }}>Resultados</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                    {[
                      { label:'Peso inicial', val:`${ciclo.resultados.pesoInicio} kg` },
                      { label: ciclo.status==='ativo'?'Peso atual':'Peso final', val:`${ciclo.resultados.pesofim} kg` },
                      { label:'Energia média', val:`${ciclo.resultados.energiaMedia}/10` },
                      { label:'Sono médio', val:`${ciclo.resultados.sonoMedio}/10` },
                    ].map(r => (
                      <div key={r.label} style={{ background:'var(--bg2)', borderRadius:10, padding:'10px 12px' }}>
                        <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3 }}>{r.label}</div>
                        <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{r.val}</div>
                      </div>
                    ))}
                  </div>
                  {ciclo.status === 'concluido' && (
                    <div style={{ marginTop:10, padding:'10px 12px', background:'var(--gp)', borderRadius:10, fontSize:12, color:'var(--gm)', lineHeight:1.5 }}>
                      🏆 Ciclo concluído com {ciclo.adesao}% de adesão · Perda de {ciclo.resultados.pesoInicio - ciclo.resultados.pesofim} kg
                    </div>
                  )}
                </div>

                {/* Barra de adesão */}
                <div style={{ marginTop:'1.25rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'var(--tm)' }}>Adesão ao protocolo</span>
                    <span style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{ciclo.adesao}%</span>
                  </div>
                  <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${ciclo.adesao}%`, background:'var(--green)', borderRadius:3, transition:'width .6s ease' }}/>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumo geral */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginTop:'1rem' }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Resumo geral</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {[
            { label:'Ciclos totais',  val:'2',     icon:'🔄' },
            { label:'Peptídeos já usados', val:'4', icon:'💉' },
            { label:'Adesão média',   val:'81%',   icon:'📊' },
            { label:'Total de semanas', val:'20',  icon:'📅' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--bg2)', borderRadius:10, padding:'12px', textAlign:'center' }}>
              <div style={{ fontSize:'1.4rem', marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:'1.2rem', fontWeight:500, color:'var(--tx)', letterSpacing:'-.04em' }}>{s.val}</div>
              <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
