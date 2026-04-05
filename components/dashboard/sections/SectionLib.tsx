// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIAS = ['Todos','Emagrecimento','GH/Composição','Recuperação','Anti-aging','Gut/Inflamação','Longevidade','Sexual','Experimental'];
const NIVEIS = ['Todos','iniciante','intermediario','avancado'];
const NIVEL_LABEL: any = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado' };
const NIVEL_COR: any = { iniciante:'#0F6E56', intermediario:'#EF9F27', avancado:'#D85A30' };

export default function SectionLib() {
  const [peptideos, setPeptideos] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [busca,     setBusca]     = useState('');
  const [catFiltro, setCatFiltro] = useState('Todos');
  const [nivFiltro, setNivFiltro] = useState('Todos');
  const [aberto,    setAberto]    = useState<string | null>(null);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('peptideos')
      .select('*')
      .order('categoria', { ascending: true });
    setPeptideos(data || []);
    setLoading(false);
  };

  const filtrados = peptideos.filter(p => {
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.resumo?.toLowerCase().includes(busca.toLowerCase()) || p.tags?.some((t: string) => t.includes(busca.toLowerCase()));
    const matchCat = catFiltro === 'Todos' || p.categoria === catFiltro;
    const matchNiv = nivFiltro === 'Todos' || p.nivel === nivFiltro;
    return matchBusca && matchCat && matchNiv;
  });

  return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Biblioteca de peptídeos</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>{peptideos.length} peptídeos disponíveis · Clique para ver detalhes completos</p>
      </div>

      {/* Busca e filtros */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:'1.5rem' }}>
        <input className="inp" placeholder="🔍 Buscar por nome, categoria ou efeito..." value={busca} onChange={e=>setBusca(e.target.value)} style={{ marginBottom:0, fontSize:13 }}/>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {CATEGORIAS.map(c => (
            <button key={c} onClick={()=>setCatFiltro(c)}
              style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', border:'1px solid var(--border)', background:catFiltro===c?'var(--dark)':'var(--bg2)', color:catFiltro===c?'white':'var(--tm)', transition:'all .13s' }}>
              {c}
            </button>
          ))}
          <div style={{ height:1, width:'100%', background:'var(--border)' }}/>
          {NIVEIS.map(n => (
            <button key={n} onClick={()=>setNivFiltro(n)}
              style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', border:'1px solid var(--border)', background:nivFiltro===n?'var(--dark)':'var(--bg2)', color:nivFiltro===n?'white':'var(--tm)', transition:'all .13s' }}>
              {n === 'Todos' ? 'Todos os níveis' : NIVEL_LABEL[n]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13 }}>Carregando biblioteca...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13 }}>
          Nenhum peptídeo encontrado para "{busca}"
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtrados.map(p => {
            const open = aberto === p.slug;
            return (
              <div key={p.slug} style={{ background:'var(--bg)', border:`1px solid ${open ? 'var(--dark)' : 'var(--border)'}`, borderRadius:14, overflow:'hidden', transition:'border-color .15s' }}>
                {/* Header clicável */}
                <div style={{ display:'flex', alignItems:'center', gap:14, padding:'1rem 1.25rem', cursor:'pointer' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg2)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}
                  onClick={()=>setAberto(open ? null : p.slug)}>
                  <div style={{ width:42, height:42, borderRadius:11, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>
                    {p.emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{p.nome}</span>
                      <span style={{ fontSize:10, padding:'2px 8px', borderRadius:100, background:'var(--bg2)', color:'var(--ts)', fontWeight:500 }}>{p.categoria}</span>
                      {p.nivel && (
                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:100, fontWeight:500, background:NIVEL_COR[p.nivel]+'20', color:NIVEL_COR[p.nivel] }}>
                          {NIVEL_LABEL[p.nivel]}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:12, color:'var(--ts)', lineHeight:1.5 }}>{p.resumo}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    {p.dose_max > 0 && (
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--tx)' }}>{p.dose_min}–{p.dose_max} {p.unidade}</div>
                    )}
                    <div style={{ fontSize:10, color:'var(--ts)', marginTop:2 }}>{p.via}</div>
                    <div style={{ fontSize:10, color:'var(--ts)', marginTop:4, transition:'transform .15s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</div>
                  </div>
                </div>

                {/* Conteúdo expandido */}
                {open && (
                  <div style={{ borderTop:'1px solid var(--border)', padding:'1.25rem' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
                      {/* Coluna esquerda */}
                      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        {p.mecanismo && (
                          <div>
                            <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:6 }}>Como funciona</div>
                            <div style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7 }}>{p.mecanismo}</div>
                          </div>
                        )}
                        {p.beneficios?.length > 0 && (
                          <div>
                            <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:6 }}>✅ Benefícios</div>
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              {p.beneficios.map((b: string, i: number) => (
                                <div key={i} style={{ fontSize:12, color:'var(--tm)', display:'flex', gap:6, alignItems:'flex-start' }}>
                                  <span style={{ color:'var(--gm)', flexShrink:0, marginTop:1 }}>•</span>
                                  {b}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {p.efeitos_colaterais?.length > 0 && (
                          <div>
                            <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:6 }}>⚠️ Efeitos colaterais</div>
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              {p.efeitos_colaterais.map((e: string, i: number) => (
                                <div key={i} style={{ fontSize:12, color:'var(--tm)', display:'flex', gap:6, alignItems:'flex-start' }}>
                                  <span style={{ color:'var(--am)', flexShrink:0, marginTop:1 }}>•</span>
                                  {e}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Coluna direita */}
                      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        {/* Protocolo */}
                        <div style={{ background:'var(--bg2)', borderRadius:12, padding:'1rem' }}>
                          <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:10 }}>Protocolo típico</div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                            {p.dose_max > 0 && <div><div style={{ fontSize:10, color:'var(--ts)' }}>Dose</div><div style={{ fontSize:12, fontWeight:500 }}>{p.dose_min}–{p.dose_max} {p.unidade}</div></div>}
                            {p.frequencia && <div><div style={{ fontSize:10, color:'var(--ts)' }}>Frequência</div><div style={{ fontSize:12, fontWeight:500 }}>{p.frequencia}</div></div>}
                            {p.timing && <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:10, color:'var(--ts)' }}>Timing</div><div style={{ fontSize:12, fontWeight:500 }}>{p.timing}</div></div>}
                            {p.via && <div><div style={{ fontSize:10, color:'var(--ts)' }}>Via</div><div style={{ fontSize:12, fontWeight:500 }}>{p.via}</div></div>}
                            {p.ciclo_semanas > 0 && <div><div style={{ fontSize:10, color:'var(--ts)' }}>Ciclo</div><div style={{ fontSize:12, fontWeight:500 }}>{p.ciclo_semanas} sem + {p.pausa_semanas} pausa</div></div>}
                          </div>
                        </div>

                        {/* Sinergias */}
                        {p.sinergias?.length > 0 && (
                          <div>
                            <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:6 }}>🔗 Sinergias</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                              {p.sinergias.map((s: string, i: number) => (
                                <span key={i} style={{ fontSize:11, padding:'3px 10px', borderRadius:100, background:'var(--gp)', color:'var(--gm)', fontWeight:500 }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Contraindicações */}
                        {p.contraindicacoes?.length > 0 && (
                          <div>
                            <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:6 }}>🚫 Contraindicações</div>
                            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                              {p.contraindicacoes.map((c: string, i: number) => (
                                <div key={i} style={{ fontSize:11, color:'#D85A30' }}>• {c}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pesquisas */}
                        {p.pesquisas?.length > 0 && (
                          <div>
                            <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:6 }}>🔬 Evidências</div>
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              {p.pesquisas.map((r: string, i: number) => (
                                <div key={i} style={{ fontSize:11, color:'var(--tm)', display:'flex', gap:6, lineHeight:1.5 }}>
                                  <span style={{ flexShrink:0 }}>📄</span>
                                  {r}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
