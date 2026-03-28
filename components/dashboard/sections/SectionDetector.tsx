// @ts-nocheck
'use client';

import { useState } from 'react';

const REATIVACOES = [
  { tipo:'push',    icon:'🔔', titulo:'Lembrete push',         desc:'Notificação no horário da aplicação',       ativo:true  },
  { tipo:'email',   icon:'📧', titulo:'E-mail de retorno',      desc:'Mensagem após 2+ dias sem registro',        ativo:true  },
  { tipo:'simplif', icon:'⚡', titulo:'Modo fácil automático',  desc:'Simplifica após 3 falhas consecutivas',     ativo:false },
  { tipo:'coach',   icon:'🎯', titulo:'Coach IA proativo',      desc:'Sugestão quando detecta queda',             ativo:true  },
];

export default function SectionDetector({ userId }: { userId?: string | null }) {
  const [tab,         setTab]         = useState<'como'|'alertas'|'reativacao'>('como');
  const [reativacoes, setReativacoes] = useState(REATIVACOES);

  const toggleReativacao = (tipo: string) =>
    setReativacoes(p => p.map(r => r.tipo===tipo?{...r,ativo:!r.ativo}:r));

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Detector de inconsistência</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Identifica padrões de falha e ativa reativação automática</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--gp)', borderRadius:100, padding:'5px 12px' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)' }}/>
          <span style={{ fontSize:11, fontWeight:500, color:'var(--gm)' }}>Monitorando</span>
        </div>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'1.5rem' }}>
        {[['como','📖 Como funciona'],['alertas','⚠️ Alertas'],['reativacao','🔔 Reativação']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v as any)}
            style={{ padding:'9px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:tab===v?'var(--tx)':'var(--ts)', borderBottom:tab===v?'2px solid var(--dark)':'2px solid transparent' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'como' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.5rem' }}>
            <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'1rem' }}>O que é o Detector de Inconsistência?</div>
            <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.75, marginBottom:'1.25rem' }}>
              O Detector analisa automaticamente seus registros de adesão e identifica padrões que podem prejudicar seus resultados — antes que virem um problema maior.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[
                { icon:'📊', titulo:'Analisa adesão', desc:'Compara sua adesão semanal e detecta quedas abruptas' },
                { icon:'🔍', titulo:'Encontra padrões', desc:'Identifica em quais dias as falhas se concentram' },
                { icon:'💡', titulo:'Sugere ações', desc:'Propõe ajustes simples para cada padrão detectado' },
              ].map(c => (
                <div key={c.titulo} style={{ background:'var(--bg2)', borderRadius:12, padding:'1rem', textAlign:'center' }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{c.icon}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:6 }}>{c.titulo}</div>
                  <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.5 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-d" onClick={() => setTab('alertas')}>Ver alertas →</button>
        </div>
      )}

      {tab === 'alertas' && (
        <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:14, padding:'1.5rem', textAlign:'center' }}>
          <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>✅</div>
          <div style={{ fontSize:14, fontWeight:500, color:'var(--gm)', marginBottom:'.5rem' }}>Protocolo consistente</div>
          <div style={{ fontSize:13, color:'var(--gm)', opacity:.85 }}>
            Nenhuma inconsistência detectada. Continue assim!<br/>
            Alertas aparecerão aqui quando o detector identificar padrões de falha.
          </div>
        </div>
      )}

      {tab === 'reativacao' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:13, color:'var(--tm)', lineHeight:1.65, marginBottom:'1.25rem' }}>
              Configure como a Nuvita deve agir automaticamente quando detectar que você está deixando de executar o protocolo.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {reativacoes.map(r=>(
                <div key={r.tipo} style={{ display:'flex', alignItems:'center', gap:12, padding:'1rem', background:'var(--bg2)', borderRadius:12 }}>
                  <span style={{ fontSize:'1.2rem', flexShrink:0 }}>{r.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:2 }}>{r.titulo}</div>
                    <div style={{ fontSize:12, color:'var(--ts)' }}>{r.desc}</div>
                  </div>
                  <div onClick={() => toggleReativacao(r.tipo)}
                    style={{ width:40, height:22, borderRadius:11, background:r.ativo?'var(--green)':'var(--border)', position:'relative', cursor:'pointer', flexShrink:0, transition:'background .2s' }}>
                    <div style={{ position:'absolute', top:3, left:r.ativo?21:3, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
