// @ts-nocheck
'use client';

import { useState } from 'react';

const FASES_CICLO = [
  {
    id:'introducao', nome:'Fase 1 — Introdução', semanas:'Semanas 1–2', cor:'#EF9F27',
    descricao:'Doses baixas para testar tolerância. Monitorar efeitos colaterais.',
    ações:[
      'Iniciar com 50% da dose alvo',
      'Registrar no diário qualquer sintoma',
      'Check-in diário nos primeiros 7 dias',
      'Estabelecer horário fixo de aplicação',
    ],
    doseMultiplicador: 0.5,
  },
  {
    id:'rampa', nome:'Fase 2 — Rampa', semanas:'Semanas 3–4', cor:'#1D9E75',
    descricao:'Aumento gradual para dose alvo. Corpo já adaptado ao peptídeo.',
    ações:[
      'Aumentar para 75% da dose alvo',
      'Manter registro semanal de peso e medidas',
      'Avaliar qualidade do sono e energia',
      'Confirmar tolerância antes de aumentar',
    ],
    doseMultiplicador: 0.75,
  },
  {
    id:'pico', nome:'Fase 3 — Pico', semanas:'Semanas 5–10', cor:'#5EC991',
    descricao:'Dose plena. Período de maior efeito. Máxima adesão necessária.',
    ações:[
      'Dose alvo completa',
      'Manter rotina sem interrupções',
      'Registrar evolução semanal',
      'Consultar ajuste se plateou resultados',
    ],
    doseMultiplicador: 1.0,
  },
  {
    id:'saida', nome:'Fase 4 — Saída gradual', semanas:'Semanas 11–12', cor:'#7F77DD',
    descricao:'Redução para evitar rebound. Prepare o próximo ciclo ou pausa.',
    ações:[
      'Reduzir para 50% da dose',
      'Aumentar intervalo entre aplicações',
      'Planejar pausa de 4–8 semanas',
      'Registrar resultados finais',
    ],
    doseMultiplicador: 0.5,
  },
  {
    id:'pausa', nome:'Pausa', semanas:'4–8 semanas', cor:'var(--ts)',
    descricao:'Descanso obrigatório para restaurar sensibilidade receptora.',
    ações:[
      'Zero peptídeos durante a pausa',
      'Manter dieta e exercício',
      'Avaliar resultados consolidados',
      'Planejar próximo ciclo',
    ],
    doseMultiplicador: 0,
  },
];

export default function SectionGeradorCiclo({ answers }) {
  const [gerado,      setGerado]      = useState(false);
  const [faseAberta,  setFaseAberta]  = useState<string|null>('introducao');
  const [dataInicio,  setDataInicio]  = useState(() => {
    const d = new Date(); return d.toISOString().split('T')[0];
  });

  const inicioDate = new Date(dataInicio);
  const getFaseDate = (semanaInicio: number) => {
    const d = new Date(inicioDate);
    d.setDate(d.getDate() + semanaInicio * 7);
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
  };

  const FASES_COM_DATAS = FASES_CICLO.map((f, i) => ({
    ...f,
    dataInicio: getFaseDate(i===0?0 : i===1?2 : i===2?4 : i===3?10 : 12),
  }));

  return (
    <div style={{ maxWidth:700, gridColumn:'1/-1' }}>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Gerador de ciclo completo</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Início, meio, fim, pausas e transições gerados automaticamente</p>
      </div>

      {!gerado ? (
        <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.5rem' }}>
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'.75rem' }}>🗓</div>
            <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'.375rem' }}>Gerar plano completo do ciclo</div>
            <div style={{ fontSize:13, color:'var(--tm)' }}>Com base no seu protocolo atual e objetivos</div>
          </div>
          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:5 }}>Data de início</label>
            <input type="date" value={dataInicio} onChange={e=>setDataInicio(e.target.value)}
              className="inp" style={{ marginBottom:0, maxWidth:200 }}/>
          </div>
          <div style={{ background:'#FFFFFF', borderRadius:10, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'1rem', marginBottom:'1.25rem' }}>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', marginBottom:8 }}>O plano incluirá:</div>
            {['5 fases com cronograma preciso','Doses ajustadas por fase','Checklist de ações por semana','Datas de início de cada fase','Protocolo de pausa'].map((item,i) => (
              <div key={i} style={{ display:'flex', gap:7, fontSize:12, color:'var(--tm)', marginBottom:4 }}>
                <span style={{ color:'var(--gm)', flexShrink:0 }}>✓</span>{item}
              </div>
            ))}
          </div>
          <button className="btn btn-d fw" onClick={() => setGerado(true)}>
            🗓 Gerar ciclo completo
          </button>
        </div>
      ) : (
        <>
          {/* Barra de progresso do ciclo */}
          <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Linha do tempo</div>
            <div style={{ display:'flex', gap:0, borderRadius:8, overflow:'hidden', marginBottom:8 }}>
              {[{cor:'#EF9F27',w:'12%'},{cor:'#1D9E75',w:'12%'},{cor:'#5EC991',w:'50%'},{cor:'#7F77DD',w:'12%'},{cor:'var(--border)',w:'14%'}].map((s,i) => (
                <div key={i} style={{ height:10, background:s.cor, width:s.w }}/>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--ts)' }}>
              <span>Intro</span><span>Rampa</span><span style={{ flex:1, textAlign:'center' }}>Pico</span><span>Saída</span><span>Pausa</span>
            </div>
          </div>

          {/* Fases */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {FASES_COM_DATAS.map(fase => (
              <div key={fase.id} style={{ background:'#F7F7F7', border:'none', borderRadius:14, overflow:'hidden', borderLeft:`4px solid ${fase.cor}` }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', cursor:'pointer' }}
                  onClick={() => setFaseAberta(faseAberta===fase.id?null:fase.id)}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                      <span style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{fase.nome}</span>
                      <span style={{ fontSize:10, padding:'2px 7px', borderRadius:100, background:`${fase.cor}22`, color:fase.cor, fontWeight:500 }}>{fase.semanas}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--ts)' }}>A partir de {fase.dataInicio}</div>
                  </div>
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"
                    style={{ color:'var(--ts)', transition:'transform .2s', transform:faseAberta===fase.id?'rotate(180deg)':'none', flexShrink:0 }}>
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {faseAberta === fase.id && (
                  <div style={{ padding:'0 1.25rem 1.25rem', borderTop:'1px solid var(--border)' }}>
                    <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.6, marginTop:'1rem', marginBottom:'1rem' }}>{fase.descricao}</p>
                    <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:8 }}>Checklist</div>
                    {fase.ações.map((ação, i) => (
                      <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:'var(--tx)', marginBottom:7, alignItems:'flex-start' }}>
                        <div style={{ width:18, height:18, borderRadius:5, border:'none', flexShrink:0, marginTop:1 }}/>
                        {ação}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop:'1rem' }}>
            <button className="btn btn-o" onClick={() => setGerado(false)} style={{ fontSize:12 }}>
              Gerar novo ciclo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
