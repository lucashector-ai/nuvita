// @ts-nocheck
'use client';
import React from 'react';
// CSS animation injected at runtime
if (typeof document !== 'undefined' && !document.getElementById('nv-fade')) {
  const s = document.createElement('style');
  s.id = 'nv-fade';
  s.textContent = '@keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }';
  document.head.appendChild(s);
}
import PeptideTooltip from '@/components/ui/PeptideTooltip';

import { useState } from 'react';
import type { QuizAnswers, Peptide, ObjectiveKey } from '@/types';
import { OBJECTIVE_LABELS, DURACAO_LABELS, NIVEL_LABELS } from '@/types';
import { apiFetch } from '@/lib/apiClient';

interface Props {
  answers: QuizAnswers; items: Peptide[]; peso: number;
  objs: ObjectiveKey[]; dur: string; nivel: string; plan: string;
}

const TURNO_ORDER = ['Manhã', 'Tarde', 'Noite', 'Qualquer horário'];

function classificarTurno(timing: string): string {
  const t = timing.toLowerCase();
  if (t.includes('manhã') || t.includes('manha') || t.includes('jejum') || t.includes('acordar')) return 'Manhã';
  if (t.includes('tarde') || t.includes('pós-treino') || t.includes('pos-treino')) return 'Tarde';
  if (t.includes('dormir') || t.includes('noite')) return 'Noite';
  return 'Qualquer horário';
}

const TURNO_ICON = { 'Manhã':'🌅', 'Tarde':'☀️', 'Noite':'🌙', 'Qualquer horário':'🕐' };
const TURNO_COLOR = { 'Manhã':'#EF9F27', 'Tarde':'#1D9E75', 'Noite':'#7F77DD', 'Qualquer horário':'#888780' };
const TURNO_BG = { 'Manhã':'#FAEEDA', 'Tarde':'#E1F5EE', 'Noite':'#EEEDFE', 'Qualquer horário':'var(--bg2)' };

export default function SectionProtocolo({ answers, items, peso, objs, dur, nivel, plan, userId }: Props) {
  const [compartilhando, setCompartilhando] = React.useState(false);
  const [linkCopiado, setLinkCopiado] = React.useState(false);

  const compartilhar = async () => {
    setCompartilhando(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const res = await apiFetch('/api/compartilhar', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        setLinkCopiado(true);
        setTimeout(() => setLinkCopiado(false), 3000);
      }
    } catch(e) {} finally { setCompartilhando(false); }
  };
  const isFree = !plan || plan === 'free';
  const [modo,     setModo]     = useState<'timeline'|'lista'|'guia'>('timeline');
  const [expanded, setExpanded] = useState(new Set<string>());
  const nome = answers.nome?.toString() ?? '';

  // Toggle: fecha todos ao abrir um novo (accordion)
  const toggle = (key: string) => {
    setExpanded(p => {
      const s = new Set(p);
      if (s.has(key)) { s.delete(key); }
      else { s.clear(); s.add(key); }
      return s;
    });
  };

  const porTurno = TURNO_ORDER.reduce((acc, turno) => {
    const peps = items.filter(item => classificarTurno(item.timing) === turno);
    if (peps.length > 0) acc[turno] = peps;
    return acc;
  }, {} as Record<string, Peptide[]>);

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'var(--gp)', color:'var(--gm)', fontSize:10, fontWeight:500, padding:'3px 10px', borderRadius:100, marginBottom:'.5rem', textTransform:'uppercase', letterSpacing:'.06em' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)' }}/>
            Gerado por IA Nuvita
          </div>
          <h2 style={{ fontSize:'1.3rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>
            {nome ? `Protocolo de ${nome}` : 'Seu protocolo'}
          </h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>
            {objs.map(o => OBJECTIVE_LABELS[o]).join(', ')} · {DURACAO_LABELS[dur]??dur} · {NIVEL_LABELS[nivel]??nivel}
          </p>
        </div>
        {/* Toggle de modo */}
        <div style={{ display:'flex', gap:4, background:'#FFFFFF', borderRadius:10, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:4 }}>
          {[['timeline','⏱ Timeline'],['lista','📋 Lista'],['guia','📖 Guia rápido']].map(([v,l]) => (
            <button key={v} onClick={() => setModo(v as any)}
              style={{ padding:'6px 12px', borderRadius:7, border:'none', fontFamily:'inherit', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .15s', background:modo===v?'var(--bg)':'transparent', color:modo===v?'var(--tx)':'var(--ts)', boxShadow:modo===v?'0 1px 3px rgba(0,0,0,.08)':'none' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.5rem' }}>
        {[
          { label:'Peptídeos', val:items.length.toString() },
          { label:'Duração',   val:DURACAO_LABELS[dur]??dur },
          { label:'Nível',     val:NIVEL_LABELS[nivel]??nivel },
          { label:'Peso',      val:`${peso} kg` },
        ].map(s => (
          <div key={s.label} style={{ background:'#F7F7F7', border:'none', borderRadius:12, padding:'.875rem 1rem' }}>
            <div style={{ fontSize:10, fontWeight:500, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ══ CRONOGRAMA DO CICLO ══ */}
      {(() => {
        const protIA = answers._protocoloIA ? (() => { try { return JSON.parse(answers._protocoloIA); } catch { return null; } })() : null;
        const totalSemanas = dur === '4sem' ? 4 : dur === '8sem' ? 8 : dur === '12sem' ? 12 : 24;
        const fases = [
          { semanas: [1, Math.floor(totalSemanas * 0.2)], titulo: 'Adaptação', cor: '#F59E0B', bg: '#FEF3C7', desc: 'O corpo se ajusta ao peptídeo. Possível leve desconforto ou variação de energia.' },
          { semanas: [Math.floor(totalSemanas * 0.2) + 1, Math.floor(totalSemanas * 0.5)], titulo: 'Ativação', cor: '#0EA5E9', bg: '#E0F2FE', desc: 'O protocolo começa a agir. Primeiros sinais de resposta — mais disposição, menos apetite.' },
          { semanas: [Math.floor(totalSemanas * 0.5) + 1, Math.floor(totalSemanas * 0.8)], titulo: 'Resultado', cor: '#1D9E75', bg: '#E1F5EE', desc: 'Fase principal de resultados. O corpo está respondendo plenamente ao protocolo.' },
          { semanas: [Math.floor(totalSemanas * 0.8) + 1, totalSemanas], titulo: 'Consolidação', cor: '#7C3AED', bg: '#EDE9FE', desc: 'Resultados se consolidam. Planeje a pausa para manter a sensibilidade.' },
        ];
        return (
          <div style={{ background:'white', borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>
              📅 Cronograma do ciclo — {totalSemanas} semanas
            </div>
            {/* Barra visual */}
            <div style={{ display:'flex', gap:2, marginBottom:'1rem', borderRadius:8, overflow:'hidden', height:12 }}>
              {fases.map((f, i) => (
                <div key={i} style={{ flex: f.semanas[1] - f.semanas[0] + 1, background: f.cor, opacity:.8 }}/>
              ))}
            </div>
            {/* Fases */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {fases.map((f, i) => (
                <div key={i} style={{ background:f.bg, borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:f.cor, marginBottom:3 }}>
                    Sem {f.semanas[0]}–{f.semanas[1]}
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--tx)', marginBottom:4 }}>{f.titulo}</div>
                  <div style={{ fontSize:11, color:'var(--tm)', lineHeight:1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
            {/* Orientações do protocolo IA */}
            {protIA && (protIA.orientacaoAlimentar || protIA.orientacaoTreino) && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:'1rem' }}>
                {protIA.orientacaoAlimentar && (
                  <div style={{ background:'#F0FDF4', borderRadius:10, padding:'1rem' }}>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'#1D9E75', marginBottom:6 }}>🥗 Alimentação</div>
                    <div style={{ fontSize:12, color:'#065F46', lineHeight:1.6 }}>{protIA.orientacaoAlimentar}</div>
                  </div>
                )}
                {protIA.orientacaoTreino && (
                  <div style={{ background:'#EFF6FF', borderRadius:10, padding:'1rem' }}>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'#1D40AF', marginBottom:6 }}>🏋️ Treino</div>
                    <div style={{ fontSize:12, color:'#1E40AF', lineHeight:1.6 }}>{protIA.orientacaoTreino}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ══ O QUE ESPERAR ══ */}
      {(() => {
        const OBJ_EXPECT: Record<string, { semana: string; item: string }[]> = {
          gordura: [
            { semana: 'Semana 1-2', item: 'Redução do apetite — começa a sentir saciedade mais rápido' },
            { semana: 'Semana 3-4', item: 'Primeiros resultados na balança — 1-3 kg dependendo da dieta' },
            { semana: 'Semana 5-8', item: 'Perda consistente — 0.5-1 kg por semana com déficit calórico' },
            { semana: 'Semana 8+', item: 'Recomposição corporal visível — menos gordura, mais definição' },
          ],
          massa: [
            { semana: 'Semana 1-2', item: 'Melhora do sono — sono mais profundo e reparador' },
            { semana: 'Semana 2-4', item: 'Recuperação mais rápida após treinos' },
            { semana: 'Semana 4-8', item: 'Ganho de força e resistência mensurável' },
            { semana: 'Semana 8+', item: 'Ganho de massa magra visível com treino adequado' },
          ],
          recuperacao: [
            { semana: 'Semana 1', item: 'Redução da inflamação e dor crônica' },
            { semana: 'Semana 2-3', item: 'Melhora da mobilidade e amplitude de movimento' },
            { semana: 'Semana 3-6', item: 'Regeneração de tecidos — tendões, ligamentos, músculos' },
            { semana: 'Semana 6+', item: 'Funcionalidade restaurada e proteção contra novas lesões' },
          ],
        };
        const expectativas = OBJ_EXPECT[objs[0]] || OBJ_EXPECT.gordura;
        return (
          <div style={{ background:'white', borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>
              📈 O que esperar ao longo do ciclo
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {expectativas.map((e, i) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'10px 14px', background:'#F9FAFB', borderRadius:10, alignItems:'flex-start' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#1D9E75', minWidth:90, paddingTop:1 }}>{e.semana}</div>
                  <div style={{ fontSize:13, color:'var(--tx)', lineHeight:1.5 }}>{e.item}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* MODO TIMELINE */}
      {modo === 'timeline' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {Object.entries(porTurno).map(([turno, peps]) => (
            <div key={turno}>
              {/* Header do turno */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'.875rem' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:TURNO_BG[turno], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                  {TURNO_ICON[turno]}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{turno}</div>
                  <div style={{ fontSize:11, color:'var(--ts)' }}>{peps.length} peptídeo{peps.length>1?'s':''}</div>
                </div>
                <div style={{ flex:1, height:1, background:'var(--border)', marginLeft:8 }}/>
              </div>

              {/* Cards dos peptídeos */}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {peps.map((item, i) => (
                  <div key={`${turno}_${item.n}_${i}`}
                    style={{ background:'#FFFFFF', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', borderRadius:14, overflow:'hidden', borderLeft:`3px solid ${TURNO_COLOR[turno]}`, cursor:'pointer', transition:'all .18s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F7F7F7'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'none'; }}
                    onClick={() => toggle(`${turno}_${item.n}`)}>
                    <div style={{ padding:'1rem' }}>
                      {/* Header do card — sempre visível */}
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36, height:36, background:TURNO_BG[turno], borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>
                          {item.e}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:2 }}><PeptideTooltip nome={item.n} emoji={item.e}>{item.n}</PeptideTooltip></div>
                          <div style={{ fontSize:12, color:'var(--ts)', lineHeight:1.5 }}>{item.m}</div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>{item.doseStr(peso)}</div>
                          <div style={{ fontSize:10, color:'var(--ts)', marginTop:1 }}>{item.route}</div>
                        </div>
                      </div>

                      {(expanded.has(`${turno}_${item.n}`) || expanded.has(`lista_${item.n}`)) && (
                        <div style={{ borderTop:'1px solid var(--border)', paddingTop:'.875rem' }}>
                          {item.why && (
                            <div style={{ background:TURNO_BG[turno], borderRadius:8, padding:'8px 10px', marginBottom:'.75rem', fontSize:12, color:TURNO_COLOR[turno], lineHeight:1.55 }}>
                              💡 {item.why}
                            </div>
                          )}
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                            {[['Timing',item.timing],['Frequência',item.freq],['Ciclo',item.cycle],['Pausa',item.rest]].map(([l,v]) => (
                              <div key={l} style={{ background:'#FFFFFF', borderRadius:7, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'6px 8px' }}>
                                <div style={{ fontSize:9, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:1 }}>{l}</div>
                                <div style={{ fontSize:11, fontWeight:500, color:'var(--tx)', lineHeight:1.3 }}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODO LISTA */}
      {modo === 'lista' && (
        <div style={{ background:'#FFFFFF', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Peptídeos do protocolo</div>
            <div style={{ fontSize:11, color:'var(--gm)', fontWeight:500 }}>{items.length} compostos</div>
          </div>
          {items.map((item, i) => (
            <div key=<PeptideTooltip nome={item.n} emoji={item.e}>{item.n}</PeptideTooltip> style={{ borderBottom:i<items.length-1?'1px solid var(--border)':'none', ...(isFree && i > 0 ? { filter:'blur(4px)', pointerEvents:'none', userSelect:'none', opacity:.7 } : {}) }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'1rem 1.25rem', cursor:'pointer' }}
                onClick={() => toggle(`lista_${item.n}`)}>
                <div style={{ width:40, height:40, background:'var(--gp)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                  {item.e}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:2 }}><PeptideTooltip nome={item.n} emoji={item.e}>{item.n}</PeptideTooltip></div>
                  <div style={{ fontSize:12, color:'var(--ts)' }}>{item.timing} · {item.freq}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0, marginRight:8 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>{item.doseStr(peso)}</div>
                  <div style={{ fontSize:10, color:'var(--ts)', marginTop:1 }}>{item.route}</div>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14" style={{ color:'var(--ts)', transition:'transform .2s', transform:expanded.has(`lista_${item.n}`)?'rotate(180deg)':'none', flexShrink:0 }}>
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {expanded.has(`lista_${item.n}`) && (
                <div style={{ padding:'0 1.25rem 1.25rem', borderTop:'1px solid var(--border)' }}>
                  {item.why && (
                    <div style={{ background:'var(--gp)', borderRadius:10, padding:'.875rem 1rem', margin:'1rem 0 .875rem' }}>
                      <div style={{ fontSize:10, fontWeight:500, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--gm)', marginBottom:'.375rem' }}>Por que está no seu protocolo</div>
                      <p style={{ fontSize:13, color:'var(--gm)', lineHeight:1.65, margin:0 }}>{item.why}</p>
                    </div>
                  )}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {[['Frequência',item.freq],['Timing',item.timing],['Via',item.route],['Ciclo',item.cycle],['Pausa',item.rest],['Como usar',item.how]].map(([l,v]) => (
                      <div key={l} style={{ background:'#FFFFFF', borderRadius:8, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'8px 10px' }}>
                        <div style={{ fontSize:9, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:12, color:'var(--tx)', fontWeight:500, lineHeight:1.3 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODO GUIA RÁPIDO */}
      {modo === 'guia' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {items.map(item => (
            <div key=<PeptideTooltip nome={item.n} emoji={item.e}>{item.n}</PeptideTooltip> style={{ background:'#FFFFFF', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', borderRadius:14, padding:'1.25rem', ...(isFree && i > 0 ? { filter:'blur(4px)', pointerEvents:'none', userSelect:'none', opacity:.7 } : {}) }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'.875rem' }}>
                <span style={{ fontSize:'1.5rem' }}>{item.e}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}><PeptideTooltip nome={item.n} emoji={item.e}>{item.n}</PeptideTooltip></div>
                  <div style={{ fontSize:10, color:'var(--ts)' }}>{classificarTurno(item.timing)}</div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'var(--ts)' }}>Dose</span>
                  <span style={{ fontWeight:500, color:'var(--tx)' }}>{item.doseStr(peso)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'var(--ts)' }}>Quando</span>
                  <span style={{ fontWeight:500, color:'var(--tx)', textAlign:'right', maxWidth:120, lineHeight:1.3 }}>{item.timing}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'var(--ts)' }}>Frequência</span>
                  <span style={{ fontWeight:500, color:'var(--tx)' }}>{item.freq}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'var(--ts)' }}>Via</span>
                  <span style={{ fontWeight:500, color:'var(--tx)' }}>{item.route}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="disc" style={{ marginTop:'1.25rem', display:'flex', alignItems:'flex-start', gap:9 }}>
        <svg width="15" height="15" fill="none" viewBox="0 0 15 15" style={{ flexShrink:0, marginTop:1 }}>
          <path d="M7.5 1.5L1 13h13L7.5 1.5z" stroke="var(--am)" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M7.5 5.5v3.5M7.5 11v.5" stroke="var(--am)" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span>Protocolo educativo gerado por IA. Não substitui avaliação médica profissional.</span>
      </div>
    </div>
  );
}
