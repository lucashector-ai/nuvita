// @ts-nocheck
'use client';

import { useState } from 'react';

const FASES = [
  {
    num:1, nome:'Adaptação', semanas:'Sem 1–2', status:'concluida',
    objetivo:'Testar tolerância e estabelecer rotina',
    kpis:{ adesao:85, energia:6, sono:7 },
    conquistas:['Primeira aplicação realizada','7 dias consecutivos','Tolerância confirmada'],
    proxima:'Aumentar dose para 75% na semana 3',
  },
  {
    num:2, nome:'Rampa', semanas:'Sem 3–4', status:'concluida',
    objetivo:'Atingir dose alvo com segurança',
    kpis:{ adesao:82, energia:7, sono:7.5 },
    conquistas:['Dose 75% atingida','Peso -1kg','Energia +1 ponto'],
    proxima:'Manter dose plena por 6 semanas',
  },
  {
    num:3, nome:'Pico', semanas:'Sem 5–10', status:'atual',
    objetivo:'Máximo efeito do protocolo — dose plena',
    kpis:{ adesao:73, energia:7.2, sono:7.5 },
    conquistas:['Dose plena atingida','Peso -3kg acumulado','Sequência de 3 semanas ≥70%'],
    proxima:'Iniciar saída gradual na semana 11',
    semanaAtual: 6, totalSemanas: 6,
  },
  {
    num:4, nome:'Saída gradual', semanas:'Sem 11–12', status:'proxima',
    objetivo:'Redução gradual para evitar rebound',
    kpis:null,
    conquistas:[],
    proxima:'Pausa de 4–8 semanas',
  },
  {
    num:5, nome:'Pausa', semanas:'4–8 sem', status:'futura',
    objetivo:'Restaurar sensibilidade receptora',
    kpis:null,
    conquistas:[],
    proxima:'Início do próximo ciclo',
  },
];

const STATUS_STYLE = {
  concluida: { bg:'var(--gp)',   cor:'var(--gm)',   ico:'✓', label:'Concluída' },
  atual:     { bg:'var(--dark)', cor:'white',        ico:'●', label:'Em andamento' },
  proxima:   { bg:'#EEEDFE',     cor:'#3C3489',      ico:'→', label:'Próxima' },
  futura:    { bg:'var(--bg2)',  cor:'var(--ts)',    ico:'○', label:'Futura' },
};

export default function SectionFases() {
  const [faseAberta, setFaseAberta] = useState<number>(3);
  const faseAtual = FASES.find(f=>f.status==='atual')!;

  return (
    <div style={{ maxWidth:700, gridColumn:'1/-1' }}>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Sistema de fases</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Progresso por etapas dentro do ciclo com objetivos por fase</p>
      </div>

      {/* Fase atual destacada */}
      <div style={{ background:'var(--dark)', borderRadius:14, padding:'1.25rem', marginBottom:'1rem', color:'white' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'.75rem' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)' }}/>
          <span style={{ fontSize:11, fontWeight:500, opacity:.7, textTransform:'uppercase', letterSpacing:'.07em' }}>Fase atual</span>
        </div>
        <div style={{ fontSize:'1.3rem', fontWeight:500, marginBottom:'.375rem' }}>Fase {faseAtual.num} — {faseAtual.nome}</div>
        <div style={{ fontSize:13, opacity:.8, marginBottom:'1rem' }}>{faseAtual.objetivo}</div>
        {faseAtual.semanaAtual && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, opacity:.7, marginBottom:5 }}>
              <span>Semana {faseAtual.semanaAtual} de {faseAtual.totalSemanas}</span>
              <span>{Math.round((faseAtual.semanaAtual/faseAtual.totalSemanas)*100)}% concluído</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,.2)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(faseAtual.semanaAtual/faseAtual.totalSemanas)*100}%`, background:'var(--green)', borderRadius:3 }}/>
            </div>
          </>
        )}
        <div style={{ marginTop:'1rem', padding:'8px 12px', background:'rgba(255,255,255,.1)', borderRadius:8, fontSize:12, opacity:.85 }}>
          ▶ Próximo passo: {faseAtual.proxima}
        </div>
      </div>

      {/* Todas as fases */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {FASES.map(fase => {
          const s = STATUS_STYLE[fase.status];
          return (
            <div key={fase.num} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', opacity:fase.status==='futura'?.6:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'1rem 1.25rem', cursor:fase.status!=='futura'?'pointer':'default' }}
                onClick={() => fase.status!=='futura' && setFaseAberta(faseAberta===fase.num?0:fase.num)}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:s.cor, flexShrink:0 }}>
                  {s.ico}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:1 }}>Fase {fase.num} — {fase.nome}</div>
                  <div style={{ fontSize:11, color:'var(--ts)' }}>{fase.semanas} · {fase.objetivo}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:10, padding:'2px 8px', borderRadius:100, background:s.bg, color:s.cor, fontWeight:500 }}>{s.label}</span>
                  {fase.status !== 'futura' && (
                    <svg width="12" height="12" fill="none" viewBox="0 0 12 12" style={{ color:'var(--ts)', transition:'transform .2s', transform:faseAberta===fase.num?'rotate(180deg)':'none' }}>
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>

              {faseAberta === fase.num && fase.status !== 'futura' && (
                <div style={{ padding:'0 1.25rem 1.25rem', borderTop:'1px solid var(--border)' }}>
                  {fase.kpis && (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:'1rem', marginBottom:'1rem' }}>
                      {[
                        { label:'Adesão', val:`${fase.kpis.adesao}%` },
                        { label:'Energia', val:`${fase.kpis.energia}/10` },
                        { label:'Sono', val:`${fase.kpis.sono}/10` },
                      ].map(k => (
                        <div key={k.label} style={{ background:'var(--bg2)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                          <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{k.label}</div>
                          <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{k.val}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {fase.conquistas.length > 0 && (
                    <div style={{ marginBottom:'.875rem' }}>
                      <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:8 }}>Conquistas</div>
                      {fase.conquistas.map((c,i) => (
                        <div key={i} style={{ display:'flex', gap:7, fontSize:12, color:'var(--gm)', marginBottom:5 }}>
                          <span style={{ flexShrink:0 }}>✓</span>{c}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ padding:'8px 12px', background:'var(--bg2)', borderRadius:8, fontSize:12, color:'var(--tm)' }}>
                    ▶ {fase.proxima}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
