// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const NIVEL_COR: any = { iniciante:'#0F6E56', intermediario:'#EF9F27', avancado:'#D85A30' };
const NIVEL_LABEL: any = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado' };

export default function PeptideoDetalhe({ slug }: { slug: string }) {
  const router = useRouter();
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<'visao'|'protocolo'|'pesquisa'|'sinergia'>('visao');

  useEffect(() => {
    supabase.from('peptideos').select('*').eq('slug', slug).single().then(({ data }) => {
      setP(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:13, color:'var(--ts)' }}>Carregando...</div>
    </div>
  );

  if (!p) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>🔬</div>
        <div style={{ fontSize:14, color:'var(--tx)' }}>Peptídeo não encontrado</div>
        <button onClick={() => router.back()} style={{ marginTop:'1rem', padding:'8px 20px', borderRadius:100, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>← Voltar</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Hero escuro */}
      <div style={{ background:'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 60%, #16213e 100%)', padding:'0 0 0', position:'relative' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 2rem 0' }}>
          <button onClick={() => router.back()}
            style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.7)', padding:'6px 14px', borderRadius:100, fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:'1.5rem' }}>
            ← Biblioteca
          </button>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'1rem' }}>
            <span style={{ fontSize:11, padding:'4px 12px', borderRadius:100, background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.8)', fontWeight:500 }}>{p.categoria}</span>
            {p.subcategoria && <span style={{ fontSize:11, padding:'4px 12px', borderRadius:100, background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.5)' }}>{p.subcategoria}</span>}
            {p.nivel && <span style={{ fontSize:11, padding:'4px 12px', borderRadius:100, fontWeight:600, background:NIVEL_COR[p.nivel]+'30', color:NIVEL_COR[p.nivel] }}>{NIVEL_LABEL[p.nivel]}</span>}
            {p.nivel_evidencia && <span style={{ fontSize:11, padding:'4px 12px', borderRadius:100, background:'#16a34a30', color:'#4ade80', fontWeight:500 }}>{p.nivel_evidencia}</span>}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'2rem', alignItems:'start' }}>
            <div>
              <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>{p.emoji}</div>
              <h1 style={{ fontSize:'2.5rem', fontWeight:700, color:'white', letterSpacing:'-.04em', marginBottom:'.5rem', lineHeight:1.1 }}>{p.nome}</h1>
              <p style={{ fontSize:14, color:'rgba(255,255,255,.55)', lineHeight:1.7, marginBottom:'1rem', maxWidth:580 }}>{p.resumo}</p>
              {p.nomes_alternativos?.length > 0 && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>Também conhecido como:</span>
                  {p.nomes_alternativos.map((n: string) => (
                    <span key={n} style={{ fontSize:11, padding:'2px 8px', borderRadius:100, background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.55)' }}>{n}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Fatos rápidos no hero */}
            <div style={{ background:'rgba(255,255,255,.05)', borderRadius:16, padding:'1.25rem', border:'1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'rgba(255,255,255,.35)', marginBottom:'1rem' }}>Fatos Rápidos</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { label:'Classificação', val: p.subcategoria || p.categoria },
                  { label:'Nível de evidência', val: p.nivel_evidencia, cor:'#4ade80' },
                  { label:'Meia-vida', val: p.meia_vida },
                  { label:'Reconstituição', val: p.reconstituicao },
                  { label:'Via', val: p.via },
                  { label:'Ciclo', val: p.ciclo_semanas > 0 ? `${p.ciclo_semanas} semanas` : null },
                ].filter(s => s.val).map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{s.label}</div>
                    <div style={{ fontSize:13, fontWeight:500, color: s.cor || 'rgba(255,255,255,.8)' }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Abas */}
          <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,.1)', marginTop:'2rem' }}>
            {[['visao','📋 Visão Geral'],['protocolo','💉 Protocolo'],['pesquisa','🔬 Pesquisa'],['sinergia','🔗 Sinergia']].map(([v,l]) => (
              <button key={v} onClick={() => setAba(v as any)}
                style={{ padding:'12px 20px', background:'none', border:'none', color:aba===v?'white':'rgba(255,255,255,.4)', fontSize:13, fontWeight:aba===v?600:400, cursor:'pointer', fontFamily:'inherit', borderBottom:aba===v?'2px solid #4ade80':'2px solid transparent', transition:'all .15s' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo das abas */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'2rem', alignItems:'start' }}>
          <div>
            {/* VISÃO GERAL */}
            {aba === 'visao' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                <div className="dc">
                  <h2 style={{ fontSize:16, fontWeight:600, marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>🧬 O que é {p.nome}</h2>
                  <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.85 }}>{p.mecanismo}</p>
                </div>

                {p.beneficios?.length > 0 && (
                  <div className="dc">
                    <h2 style={{ fontSize:16, fontWeight:600, marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>✨ Benefícios Comprovados</h2>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {p.beneficios.map((b: string, i: number) => (
                        <div key={i} style={{ background:'var(--bg2)', borderRadius:12, padding:'1rem', display:'flex', gap:10, alignItems:'flex-start' }}>
                          <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--gp)', color:'var(--gm)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</div>
                          <span style={{ fontSize:13, color:'var(--tx)', lineHeight:1.5 }}>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {p.linha_do_tempo && Object.keys(p.linha_do_tempo).length > 0 && (
                  <div className="dc">
                    <h2 style={{ fontSize:16, fontWeight:600, marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:8 }}>⏱ Linha do Tempo de Resultados</h2>
                    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                      {Object.entries(p.linha_do_tempo).map(([periodo, desc]: any, i, arr) => (
                        <div key={i} style={{ display:'flex', gap:16 }}>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:90, flexShrink:0 }}>
                            <span style={{ fontSize:10, fontWeight:700, color:'var(--gm)', background:'var(--gp)', padding:'3px 8px', borderRadius:100, whiteSpace:'nowrap', textAlign:'center' }}>{periodo}</span>
                            {i < arr.length-1 && <div style={{ width:2, flex:1, background:'var(--border)', minHeight:24, margin:'6px 0' }}/>}
                          </div>
                          <div style={{ paddingBottom: i < arr.length-1 ? '1.25rem' : 0 }}>
                            <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7, margin:0, paddingTop:2 }}>{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {p.efeitos_colaterais?.length > 0 && (
                  <div className="dc" style={{ borderLeft:'3px solid #EF9F27' }}>
                    <h2 style={{ fontSize:16, fontWeight:600, marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>⚠️ Efeitos Colaterais</h2>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {p.efeitos_colaterais.map((e: string, i: number) => (
                        <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:'var(--tm)' }}>
                          <span style={{ color:'#EF9F27', flexShrink:0 }}>•</span>{e}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {p.contraindicacoes?.length > 0 && (
                  <div className="dc" style={{ borderLeft:'3px solid #D85A30' }}>
                    <h2 style={{ fontSize:16, fontWeight:600, marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>🚫 Contraindicações</h2>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {p.contraindicacoes.map((c: string, i: number) => (
                        <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:'#D85A30' }}>
                          <span style={{ flexShrink:0 }}>✕</span>{c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROTOCOLO */}
            {aba === 'protocolo' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                <div className="dc">
                  <h2 style={{ fontSize:16, fontWeight:600, marginBottom:'1.25rem' }}>💉 Protocolo Padrão</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { icon:'⚖️', label:'Dose', val: p.dose_max > 0 ? `${p.dose_min}–${p.dose_max} ${p.unidade}` : 'Ver titulação' },
                      { icon:'📅', label:'Frequência', val: p.frequencia },
                      { icon:'⏰', label:'Timing', val: p.timing },
                      { icon:'💉', label:'Via', val: p.via },
                      { icon:'🔄', label:'Duração do ciclo', val: p.ciclo_semanas > 0 ? `${p.ciclo_semanas} semanas` : null },
                      { icon:'⏸️', label:'Pausa', val: p.pausa_semanas > 0 ? `${p.pausa_semanas} semanas` : null },
                    ].filter(s => s.val).map(s => (
                      <div key={s.label} style={{ background:'var(--bg2)', borderRadius:12, padding:'1rem' }}>
                        <div style={{ fontSize:11, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>{s.icon} {s.label}</div>
                        <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {p.protocolo_titulacao && (
                  <div className="dc">
                    <h2 style={{ fontSize:16, fontWeight:600, marginBottom:'1rem' }}>📈 Protocolo de Titulação</h2>
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead>
                          <tr style={{ background:'var(--bg2)' }}>
                            {['Etapa','Dose','Duração','Critério'].map(h => (
                              <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(p.protocolo_titulacao as any[]).map((row: any, i: number) => (
                            <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                              <td style={{ padding:'10px 14px', fontWeight:600, color:'var(--gm)' }}>{row.etapa}</td>
                              <td style={{ padding:'10px 14px', fontWeight:500 }}>{row.dose}</td>
                              <td style={{ padding:'10px 14px', color:'var(--ts)' }}>{row.duracao}</td>
                              <td style={{ padding:'10px 14px', color:'var(--ts)' }}>{row.criterio}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PESQUISA */}
            {aba === 'pesquisa' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {p.pesquisas?.length > 0 ? p.pesquisas.map((r: string, i: number) => (
                  <div key={i} className="dc" style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>📄</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'var(--tx)', lineHeight:1.75 }}>{r}</div>
                    </div>
                  </div>
                )) : (
                  <div className="dc" style={{ textAlign:'center', padding:'3rem' }}>
                    <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>🔬</div>
                    <div style={{ fontSize:13, color:'var(--ts)' }}>Dados de pesquisa em compilação</div>
                  </div>
                )}
              </div>
            )}

            {/* SINERGIA */}
            {aba === 'sinergia' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {p.sinergias?.length > 0 ? (
                  <>
                    <p style={{ fontSize:13, color:'var(--ts)', lineHeight:1.7 }}>
                      {p.nome} funciona bem em combinação com os seguintes peptídeos:
                    </p>
                    {p.sinergias.map((s: string, i: number) => (
                      <div key={i} className="dc" style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:'var(--gp)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>🔗</div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{s}</div>
                          <div style={{ fontSize:12, color:'var(--gm)' }}>Sinergia confirmada</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="dc" style={{ textAlign:'center', padding:'3rem' }}>
                    <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>🔗</div>
                    <div style={{ fontSize:13, color:'var(--ts)' }}>Dados de sinergia em compilação</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:80 }}>
            {p.tags?.length > 0 && (
              <div className="dc">
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--ts)', marginBottom:'1rem' }}>Tags</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {p.tags.map((t: string) => (
                    <span key={t} style={{ fontSize:11, padding:'3px 10px', borderRadius:100, background:'var(--bg2)', color:'var(--ts)', fontWeight:500 }}>#{t}</span>
                  ))}
                </div>
              </div>
            )}

            {p.nivel && (
              <div className="dc">
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--ts)', marginBottom:'1rem' }}>Adequado para</div>
                {[['iniciante','Iniciante'],['intermediario','Intermediário'],['avancado','Avançado']].map(([n,l]) => {
                  const niveis = ['iniciante','intermediario','avancado'];
                  const ativo = niveis.indexOf(n) <= niveis.indexOf(p.nivel);
                  return (
                    <div key={n} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background: ativo ? NIVEL_COR[p.nivel] : 'var(--border)' }}/>
                      <span style={{ fontSize:13, color: ativo ? 'var(--tx)' : 'var(--ts)' }}>{l}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
