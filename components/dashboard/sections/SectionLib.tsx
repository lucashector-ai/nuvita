// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const NIVEIS = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado' };
const NIVEL_COR = { iniciante:'#1D9E75', intermediario:'#EF9F27', avancado:'#D85A30' };
const NIVEL_BG  = { iniciante:'#E1F5EE', intermediario:'#FAEEDA', avancado:'#FAECE7' };
const EV_COR = {
  'Aprovado (FDA/ANVISA)':'#1D9E75','Aprovado (FDA/EMA)':'#1D9E75','Aprovado (Rússia)':'#378ADD',
  'Fase II/III':'#EF9F27','Fase II (Clínico)':'#EF9F27','Estudos Clínicos':'#EF9F27',
  'Pré-clínico / Fase I':'#D85A30','Fase I/II (Cardíaco)':'#D85A30','Estudos Clínicos / In Vitro':'#EF9F27'
};
const EV_BG = {
  'Aprovado (FDA/ANVISA)':'#E1F5EE','Aprovado (FDA/EMA)':'#E1F5EE','Aprovado (Rússia)':'#E6F1FB',
  'Fase II/III':'#FAEEDA','Fase II (Clínico)':'#FAEEDA','Estudos Clínicos':'#FAEEDA',
  'Pré-clínico / Fase I':'#FAECE7','Fase I/II (Cardíaco)':'#FAECE7','Estudos Clínicos / In Vitro':'#FAEEDA'
};

export default function SectionLib() {
  const [peptideos, setPeptideos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState(null);
  const [busca,     setBusca]     = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [ativo,     setAtivo]     = useState(null);
  const [aba,       setAba]       = useState('visao');

  useEffect(() => {
    supabase
      .from('peptideos')
      .select('*')
      .eq('ativo', true)
      .order('ordem')
      .then(({ data, error }) => {
        if (error) setErro(error.message);
        else setPeptideos(data || []);
        setLoading(false);
      });
  }, []);

  const categorias = ['Todos', ...Array.from(new Set(peptideos.map(p => p.categoria)))];

  const filtrado = peptideos.filter(p => {
    const bOk = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.categoria.toLowerCase().includes(busca.toLowerCase()) || p.tagline.toLowerCase().includes(busca.toLowerCase());
    const cOk = categoria === 'Todos' || p.categoria === categoria;
    return bOk && cOk;
  });

  const P = peptideos.find(p => p.id === ativo);

  // ─── Loading ───────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{ height:100, background:'var(--bg2)', borderRadius:14, animation:'pulse 1.5s ease infinite' }}/>
      ))}
    </div>
  );

  if (erro) return (
    <div style={{ padding:'2rem', textAlign:'center', color:'#D85A30', fontSize:13 }}>
      Erro ao carregar a biblioteca: {erro}
    </div>
  );

  // ─── Detalhe do peptídeo ──────────────────────────
  if (P) return (
    <div style={{ maxWidth:900 }}>
      <button onClick={()=>setAtivo(null)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', fontSize:13, color:'var(--ts)', fontFamily:'inherit', marginBottom:'1.25rem', padding:0 }}>
        ← Biblioteca
      </button>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${P.bg} 0%, var(--bg) 60%)`, border:`1px solid ${P.cor}30`, borderRadius:16, padding:'1.5rem', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
          <div style={{ width:56, height:56, background:'white', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0, boxShadow:`0 2px 12px ${P.cor}20` }}>
            {P.emoji}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:6 }}>
              <span style={{ fontSize:11, padding:'2px 9px', borderRadius:100, background:P.bg, color:P.cor, fontWeight:600, border:`1px solid ${P.cor}30` }}>{P.categoria}</span>
              <span style={{ fontSize:11, padding:'2px 9px', borderRadius:100, background:NIVEL_BG[P.nivel]||'#FAEEDA', color:NIVEL_COR[P.nivel]||'#EF9F27', fontWeight:600 }}>{NIVEIS[P.nivel]||P.nivel}</span>
              {(P.nomes_alt||[]).slice(0,2).map(n=>(
                <span key={n} style={{ fontSize:11, padding:'2px 9px', borderRadius:100, background:'var(--bg2)', color:'var(--ts)', border:'1px solid var(--border)' }}>{n}</span>
              ))}
            </div>
            <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', color:'var(--tx)', marginBottom:4 }}>{P.nome}</h2>
            <p style={{ fontSize:13, color:P.cor, fontWeight:500, margin:0 }}>{P.tagline}</p>
          </div>
        </div>
      </div>

      {/* 2 colunas: conteúdo + fatos rápidos */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:'1.25rem', alignItems:'start' }}>
        <div>
          {/* Abas */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'1.25rem', overflowX:'auto' }}>
            {[['visao','Visão Geral'],['protocolo','Protocolo'],['seguranca','Segurança'],['faq','FAQ']].map(([v,l])=>(
              <button key={v} onClick={()=>setAba(v)}
                style={{ padding:'10px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:aba===v?'var(--tx)':'var(--ts)', borderBottom:aba===v?`2px solid ${P.cor}`:'2px solid transparent', whiteSpace:'nowrap', flexShrink:0 }}>
                {l}
              </button>
            ))}
          </div>

          {/* Aba Visão Geral */}
          {aba==='visao' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="dc">
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Como funciona</div>
                <p style={{ fontSize:13, color:'var(--tx)', lineHeight:1.8, margin:0 }}>{P.mecanismo}</p>
              </div>
              <div className="dc">
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Benefícios documentados</div>
                {(P.beneficios||[]).map((b,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:'var(--tx)', lineHeight:1.5, marginBottom:8 }}>
                    <span style={{ color:P.cor, flexShrink:0 }}>✓</span>{b}
                  </div>
                ))}
              </div>
              {/* Timeline */}
              {(P.timeline||[]).length > 0 && (
                <div className="dc">
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Linha do tempo de resultados</div>
                  {(P.timeline||[]).map((t,i)=>(
                    <div key={i} style={{ display:'flex', gap:12, paddingBottom: i<P.timeline.length-1?'1rem':0 }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                        <div style={{ width:10, height:10, borderRadius:'50%', background:P.cor, flexShrink:0, marginTop:3 }}/>
                        {i<P.timeline.length-1 && <div style={{ width:2, flex:1, background:`${P.cor}30`, marginTop:4 }}/>}
                      </div>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:P.cor, marginBottom:2 }}>{t.fase}</div>
                        <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.6 }}>{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="dc">
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.75rem' }}>Base de evidências</div>
                <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7, margin:0 }}>{P.evidencias}</p>
              </div>
            </div>
          )}

          {/* Aba Protocolo */}
          {aba==='protocolo' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                {[['Dose',P.protocolo?.dose],['Frequência',P.protocolo?.freq],['Via de aplicação',P.protocolo?.via],['Timing',P.protocolo?.timing],['Duração do ciclo',P.protocolo?.ciclo],['Pausa entre ciclos',P.protocolo?.pausa]].map(([l,v])=>(
                  <div key={l} className="dc" style={{ marginBottom:0 }}>
                    <div style={{ fontSize:10, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>{l}</div>
                    <div style={{ fontSize:13, color:'var(--tx)', lineHeight:1.4 }}>{v||'—'}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:`${P.cor}10`, border:`1px solid ${P.cor}25`, borderRadius:12, padding:'1rem 1.25rem', fontSize:12, color:P.cor, lineHeight:1.65 }}>
                ⚠️ Protocolo educativo. Doses individuais variam. Consulte um médico especializado antes de iniciar qualquer protocolo de peptídeos.
              </div>
            </div>
          )}

          {/* Aba Segurança */}
          {aba==='seguranca' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {(P.efeitos||[]).length > 0 && (
                <div className="dc">
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>
                    Efeitos colaterais
                    <span style={{ marginLeft:8, fontWeight:400, color:'var(--ts)' }}>
                      {(P.efeitos||[]).filter(e=>e.tipo==='comum').length} comuns · {(P.efeitos||[]).filter(e=>e.tipo==='raro').length} raros
                    </span>
                  </div>
                  {(P.efeitos||[]).map((e,i)=>(
                    <div key={i} style={{ background:'var(--bg2)', borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{e.nome}</span>
                        <span style={{ fontSize:9, padding:'1px 6px', borderRadius:100, background:e.tipo==='comum'?'#FAEEDA':'#FAECE7', color:e.tipo==='comum'?'#BA7517':'#993C1D', fontWeight:600 }}>
                          {e.tipo==='comum'?'Comum':'Raro'}
                        </span>
                      </div>
                      <div style={{ fontSize:11, color:'var(--ts)' }}>Mitigação: {e.mitigacao}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="dc">
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'#D85A30', marginBottom:'1rem' }}>Contraindicações</div>
                {(P.contraindicacoes||[]).map((c,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:'var(--tx)', marginBottom:8, lineHeight:1.5 }}>
                    <span style={{ color:'#D85A30', flexShrink:0 }}>×</span>{c}
                  </div>
                ))}
              </div>
              <div className="dc">
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'#EF9F27', marginBottom:'1rem' }}>Interações relevantes</div>
                {(P.interacoes||[]).map((int,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:'var(--tx)', marginBottom:8, lineHeight:1.5 }}>
                    <span style={{ color:'#EF9F27', flexShrink:0 }}>⚡</span>{int}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aba FAQ */}
          {aba==='faq' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {(P.faq||[]).map((item,i)=>(
                <div key={i} className="dc">
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'.625rem' }}>❓ {item.p}</div>
                  <div style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7 }}>{item.r}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Fatos Rápidos */}
        <div style={{ position:'sticky', top:'1rem' }}>
          <div className="dc" style={{ marginBottom:0 }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Fatos Rápidos</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                ['Classificação', P.classificacao, null],
                ['Nível de evidência', P.evidencia, { bg: EV_BG[P.evidencia]||'#FAEEDA', cor: EV_COR[P.evidencia]||'#EF9F27' }],
                ['Meia-vida', P.meia_vida, null],
                ['Reconstituição', P.reconstituicao, null],
              ].map(([l,v,badge])=>(
                <div key={l} style={{ borderBottom:'0.5px solid var(--border)', paddingBottom:12 }}>
                  <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{l}</div>
                  {badge ? (
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:100, background:badge.bg, color:badge.cor, fontWeight:600 }}>{v}</span>
                  ) : (
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{v||'—'}</div>
                  )}
                </div>
              ))}
              {(P.nomes_alt||[]).length > 0 && (
                <div style={{ borderBottom:'0.5px solid var(--border)', paddingBottom:12 }}>
                  <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Nomes alternativos</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {(P.nomes_alt||[]).map(n=>(
                      <span key={n} style={{ fontSize:10, padding:'2px 7px', borderRadius:100, background:'var(--bg2)', color:'var(--tm)', border:'1px solid var(--border)' }}>{n}</span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Categoria</div>
                <span style={{ fontSize:11, padding:'2px 9px', borderRadius:100, background:P.bg, color:P.cor, fontWeight:600, border:`1px solid ${P.cor}30` }}>{P.categoria}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Lista de peptídeos ───────────────────────────
  return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Biblioteca de peptídeos</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Conteúdo educacional completo — mecanismo, protocolo e segurança</p>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:'1rem', flexWrap:'wrap' }}>
        <input className="inp" placeholder="🔍 Buscar peptídeo ou categoria..." value={busca} onChange={e=>setBusca(e.target.value)} style={{ flex:1, minWidth:200, marginBottom:0 }}/>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {categorias.map(c=>(
          <button key={c} onClick={()=>setCategoria(c)}
            style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .13s', border:`1px solid ${categoria===c?'var(--green)':'var(--border)'}`, background:categoria===c?'var(--gp)':'var(--bg2)', color:categoria===c?'var(--gm)':'var(--tm)', fontFamily:'inherit' }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
        {filtrado.map(p=>(
          <div key={p.id}
            style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', cursor:'pointer', transition:'border-color .15s, transform .15s, box-shadow .15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=p.cor; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 4px 20px ${p.cor}15`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
            onClick={()=>{ setAtivo(p.id); setAba('visao'); }}>
            <div style={{ height:4, background:p.cor }}/>
            <div style={{ padding:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'.875rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, background:p.bg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>{p.emoji}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:2 }}>{p.nome}</div>
                    <div style={{ fontSize:10, color:p.cor, fontWeight:500 }}>{p.categoria}</div>
                  </div>
                </div>
                <span style={{ fontSize:9, padding:'2px 7px', borderRadius:100, background:NIVEL_BG[p.nivel]||'#FAEEDA', color:NIVEL_COR[p.nivel]||'#EF9F27', fontWeight:600, flexShrink:0 }}>
                  {NIVEIS[p.nivel]||p.nivel}
                </span>
              </div>
              <p style={{ fontSize:12, color:'var(--tm)', lineHeight:1.55, margin:'0 0 10px' }}>{p.tagline}</p>
              {p.evidencia && (
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:100, background:EV_BG[p.evidencia]||'#FAEEDA', color:EV_COR[p.evidencia]||'#EF9F27', fontWeight:600 }}>
                  {p.evidencia}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtrado.length === 0 && busca && (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13 }}>
          Nenhum peptídeo encontrado para "{busca}"
        </div>
      )}

      <div style={{ marginTop:'1.25rem', fontSize:11, color:'var(--ts)', textAlign:'center' }}>
        {peptideos.length} peptídeos · Conteúdo educacional · Não substitui avaliação médica
      </div>
    </div>
  );
}
