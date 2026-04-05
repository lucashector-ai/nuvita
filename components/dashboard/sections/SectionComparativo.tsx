// @ts-nocheck
'use client';

const RECURSOS = [
  { label:'Protocolo personalizado por IA',         nuvita:true,  mercado:false, destaque:true  },
  { label:'Tracker de adesão diária',               nuvita:true,  mercado:false, destaque:true  },
  { label:'Coach IA personalizado',                 nuvita:true,  mercado:false, destaque:false },
  { label:'Consulta médica integrada',              nuvita:true,  mercado:false, destaque:true  },
  { label:'Cronograma personalizado do ciclo',      nuvita:true,  mercado:false, destaque:true  },
  { label:'Calculadora de reconstituição',          nuvita:true,  mercado:true,  destaque:false },
  { label:'Biblioteca de peptídeos',                nuvita:true,  mercado:true,  destaque:false },
  { label:'Mapa de aplicação corporal',             nuvita:true,  mercado:'parcial', destaque:false },
  { label:'Diário de sintomas',                     nuvita:true,  mercado:false, destaque:false },
  { label:'Detector de inconsistências',            nuvita:true,  mercado:false, destaque:false },
  { label:'Controle de estoque',                    nuvita:true,  mercado:false, destaque:false },
  { label:'Ajuste automático do protocolo',         nuvita:true,  mercado:false, destaque:false },
  { label:'Análise de evolução por fase',           nuvita:true,  mercado:false, destaque:false },
  { label:'Estudos científicos resumidos',          nuvita:'em breve', mercado:true, destaque:false },
];

const DEPOIMENTOS = [
  { texto:'Antes eu usava planilha pra controlar meu protocolo. Agora o tracker da Nuvita faz isso automaticamente.', nome:'Ricardo M., 38 anos' },
  { texto:'A IA gerou um protocolo personalizado pro meu objetivo específico — nunca tive isso em outra plataforma.', nome:'Ana P., 31 anos' },
  { texto:'O mapa de aplicação me ajudou a parar de usar sempre o mesmo local. Diferença absurda na absorção.', nome:'Carlos S., 44 anos' },
];

export default function SectionComparativo({ onNavigate }) {
  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.375rem' }}>Por que Nuvita?</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Comparativo completo entre a Nuvita e as alternativas disponíveis no mercado</p>
      </div>

      {/* Hero de diferenciais */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { ico:'🤖', t:'Protocolo por IA', d:'Gerado com base no seu perfil real — não um template genérico. A IA considera seus objetivos, biometria, nível e histórico.' },
          { ico:'📊', t:'Acompanhamento real', d:'Tracker de adesão, diário de sintomas, detector de inconsistências. A plataforma aprende com você ao longo do ciclo.' },
          { ico:'👨‍⚕️', t:'Médico na plataforma', d:'Revisão do protocolo por médico especialista integrada. Sem precisar buscar profissional fora e explicar do zero.' },
          { ico:'📅', t:'Cronograma do seu ciclo', d:'Calendário gerado automaticamente com as fases, marcos e ajustes do seu protocolo específico.' },
        ].map((d,i)=>(
          <div key={i} className="dc" style={{ marginBottom:0 }}>
            <div style={{ fontSize:'1.75rem', marginBottom:'.75rem' }}>{d.ico}</div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:4 }}>{d.t}</div>
            <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.65 }}>{d.d}</div>
          </div>
        ))}
      </div>

      {/* Tabela comparativa */}
      <div className="dc" style={{ marginBottom:'1.5rem', padding:0 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              <th style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em' }}>Recurso</th>
              <th style={{ padding:'12px 16px', textAlign:'center', fontSize:11, fontWeight:600, color:'var(--gm)', textTransform:'uppercase', letterSpacing:'.07em', background:'var(--gp)', width:100 }}>Nuvita</th>
              <th style={{ padding:'12px 16px', textAlign:'center', fontSize:11, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', width:100 }}>Mercado</th>
            </tr>
          </thead>
          <tbody>
            {RECURSOS.map((r,i)=>(
              <tr key={i} style={{ borderBottom:'0.5px solid var(--border)', background:r.destaque?'var(--gp)':'' }}>
                <td style={{ padding:'10px 16px', fontSize:13, color:'var(--tx)', display:'flex', alignItems:'center', gap:8 }}>
                  {r.destaque && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:100, background:'var(--green)', color:'white', fontWeight:600, flexShrink:0 }}>★</span>}
                  {r.label}
                </td>
                <td style={{ padding:'10px 16px', textAlign:'center', background:'var(--gp)' }}>
                  {r.nuvita === true ? <span style={{ color:'var(--green)', fontSize:'1.1rem' }}>✓</span>
                   : r.nuvita === 'em breve' ? <span style={{ fontSize:10, color:'var(--ts)', padding:'2px 6px', borderRadius:100, border:'none' }}>em breve</span>
                   : <span style={{ color:'var(--ts)' }}>—</span>}
                </td>
                <td style={{ padding:'10px 16px', textAlign:'center' }}>
                  {r.mercado === true ? <span style={{ color:'var(--green)', fontSize:'1.1rem' }}>✓</span>
                   : r.mercado === 'parcial' ? <span style={{ fontSize:10, color:'var(--am)', padding:'2px 6px', borderRadius:100, background:'var(--ab)', border:'1px solid var(--ab)' }}>parcial</span>
                   : <span style={{ color:'#D85A30', fontSize:'1.1rem' }}>×</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Depoimentos */}
      <div style={{ marginBottom:'1.5rem' }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>O que os usuários dizem</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:10 }}>
          {DEPOIMENTOS.map((d,i)=>(
            <div key={i} className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7, marginBottom:'.75rem', fontStyle:'italic' }}>"{d.texto}"</div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--tx)' }}>— {d.nome}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:'var(--gp)', border:'1px solid var(--green)', borderRadius:16, padding:'1.5rem', textAlign:'center' }}>
        <div style={{ fontSize:'1.1rem', fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Pronto para o acompanhamento completo?</div>
        <div style={{ fontSize:13, color:'var(--tm)', marginBottom:'1.25rem' }}>Comece com o plano gratuito ou desbloqueie tudo com o Essencial.</div>
        <button onClick={()=>onNavigate('planos')}
          style={{ padding:'12px 24px', background:'var(--green)', color:'white', border:'none', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          Ver planos e preços →
        </button>
      </div>
    </div>
  );
}
