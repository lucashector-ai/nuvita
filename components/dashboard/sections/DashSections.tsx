// @ts-nocheck
'use client';

import { useState } from 'react';
import type { QuizAnswers, ObjectiveKey } from '@/types';
import { OBJECTIVE_LABELS } from '@/types';
import { CALC_PEPTIDES } from '@/lib/peptides';

/* ── Sugestões IA ── */
const IA_SUGGESTIONS = [
  'Onde comprar peptídeos com qualidade?',
  'Como reconstituir corretamente?',
  'Posso combinar dois peptídeos?',
  'Preciso fazer pausas no ciclo?',
  'Como reconstituir corretamente?',
];

/* ══ SectionIA ══════════════════════════════════ */
interface IAProps { answers: QuizAnswers; objs: ObjectiveKey[]; }

export function SectionIA({ answers, objs }: IAProps) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Olá${answers.nome ? `, ${answers.nome}` : ''}! 👋 Sou a IA Nuvita.\n\nPosso te ajudar com doses, timing, onde comprar, como reconstituir e tudo sobre o seu protocolo. Como posso ajudar?`, time: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const now = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    setInput('');
    setMessages(p => [...p, { role:'user', text:msg, time:now }]);
    setLoading(true);
    try {
      const objetivos = objs.map(o => OBJECTIVE_LABELS[o]).join(', ');
      const res = await fetch('/api/ia', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          system:`Você é a IA Nuvita, especialista em peptídeos. Usuário: objetivos=${objetivos}, peso=${answers.peso ?? 75}kg. Responda em português, seja direto e útil. Sobre onde comprar: fale sobre pureza ≥98%, laudo COA, farmácia de manipulação. Não indique marcas. Não substitui avaliação médica.`,
          messages:[{role:'user',content:msg}],
        }),
      });
      const data = await res.json();
      const t = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      setMessages(p => [...p, { role:'ai', text: data.text ?? 'Erro ao responder. Configure ANTHROPIC_API_KEY no .env.local', time:t }]);
    } catch {
      const t = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      setMessages(p => [...p, { role:'ai', text:'⚠️ Configure ANTHROPIC_API_KEY no .env.local para usar a IA.', time:t }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ gridColumn:'1/-1', maxWidth:720 }}>
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
          <div style={{ width:44, height:44, background:'var(--dark)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)' }}>IA Nuvita</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--gm)', marginTop:1 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)' }}/>
              Online · Especialista em peptídeos
            </div>
          </div>
          <div style={{ fontSize:11, color:'var(--ts)' }}>Fins educativos</div>
        </div>

        <div style={{ height:380, overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:'.875rem', background:'var(--bg2)' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: m.role==='user'?'flex-end':'flex-start', gap:3 }}>
              {m.role === 'ai' && (
                <div style={{ display:'flex', alignItems:'center', gap:5, marginLeft:4 }}>
                  <div style={{ width:20, height:20, background:'var(--dark)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem' }}>🤖</div>
                  <span style={{ fontSize:11, color:'var(--ts)', fontWeight:500 }}>IA Nuvita</span>
                </div>
              )}
              <div style={{ maxWidth:'82%', padding:'10px 14px', borderRadius:14, fontSize:13, lineHeight:1.65, background: m.role==='user'?'var(--dark)':'var(--bg)', color: m.role==='user'?'white':'var(--tx)', borderBottomRightRadius: m.role==='user'?4:14, borderBottomLeftRadius: m.role==='ai'?4:14, border: m.role==='ai'?'1px solid var(--border)':'none', whiteSpace:'pre-wrap' }}>
                {m.text}
              </div>
              <div style={{ fontSize:10, color:'var(--ts)', marginLeft: m.role==='ai'?4:0, marginRight: m.role==='user'?4:0 }}>{m.time}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:3 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginLeft:4 }}>
                <div style={{ width:20, height:20, background:'var(--dark)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem' }}>🤖</div>
                <span style={{ fontSize:11, color:'var(--ts)' }}>digitando...</span>
              </div>
              <div style={{ padding:'10px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, borderBottomLeftRadius:4, display:'flex', gap:4 }}>
                {[0,1,2].map(d => <div key={d} style={{ width:6, height:6, borderRadius:'50%', background:'var(--ts)', opacity:.5 }}/>)}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:'.75rem 1rem', borderTop:'1px solid var(--border)', background:'var(--bg)', display:'flex', gap:6, flexWrap:'wrap' }}>
          {IA_SUGGESTIONS.slice(0,4).map(s => (
            <button key={s} onClick={() => send(s)}
              style={{ padding:'5px 11px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:100, fontSize:11, fontWeight:500, color:'var(--tm)', cursor:'pointer', fontFamily:'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.color='var(--gm)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--tm)'; }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ padding:'.875rem 1rem', borderTop:'1px solid var(--border)', background:'var(--bg)', display:'flex', gap:8, alignItems:'flex-end' }}>
          <textarea className="inp" rows={2} placeholder="Pergunte sobre doses, timing, fornecedores..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
            style={{ resize:'none', fontFamily:'inherit', fontSize:13, marginBottom:0, flex:1 }}/>
          <button className="btn btn-d" onClick={() => send()} disabled={loading||!input.trim()} style={{ height:42, paddingLeft:16, paddingRight:16, flexShrink:0 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M2 8h12M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div style={{ fontSize:11, color:'var(--ts)', textAlign:'center', marginTop:'.75rem' }}>
        IA Nuvita tem fins educacionais. Para consulta médica use a seção <strong>Médico</strong>.
      </div>
    </div>
  );
}

/* ══ SectionCalc ════════════════════════════════ */
interface CalcProps { peso: number; }

export function SectionCalc({ peso: initialPeso }: CalcProps) {
  const [idx, setIdx] = useState(0);
  const [peso, setPeso] = useState(initialPeso);
  const pep = CALC_PEPTIDES[idx];
  const dose = pep ? (pep.base * (pep.byWeight ? peso : 1)).toFixed(pep.dec ?? 0) : '—';

  return (
    <div style={{ maxWidth:480 }}>
      <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'1.25rem' }}>Calculadora de doses</h2>
      <div className="dc" style={{ marginBottom:'1rem' }}>
        <div className="dc-h"><div className="dc-t">Peptídeo</div></div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {CALC_PEPTIDES.map((p, i) => (
            <div key={p.n} onClick={() => setIdx(i)}
              style={{ padding:'10px 12px', borderRadius:9, cursor:'pointer', border: i===idx?'1.5px solid var(--green)':'1.5px solid var(--border)', background: i===idx?'#F2FCF7':'var(--bg2)', fontSize:13, fontWeight: i===idx?500:400, color: i===idx?'var(--gm)':'var(--tm)' }}>
              {p.e} {p.n}
            </div>
          ))}
        </div>
      </div>
      <div className="dc" style={{ marginBottom:'1rem' }}>
        <div className="dc-h"><div className="dc-t">Seu peso</div><div style={{ fontSize:13, fontWeight:500 }}>{peso} kg</div></div>
        <input type="range" min={40} max={180} step={1} value={peso} onChange={e => setPeso(Number(e.target.value))} style={{ width:'100%' }}/>
      </div>
      {pep && (
        <div className="dc">
          <div className="dc-h"><div className="dc-t">Dose calculada</div></div>
          <div style={{ fontSize:'2rem', fontWeight:500, color:'var(--tx)', letterSpacing:'-.05em', marginBottom:'.25rem' }}>{dose} <span style={{ fontSize:14, color:'var(--ts)' }}>{pep.unit}</span></div>
          <div style={{ fontSize:12, color:'var(--ts)', marginBottom:'.75rem' }}>{pep.note}</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[['Via', pep.route], ['Frequência', pep.freq]].map(([l,v]) => (
              <div key={l} style={{ background:'var(--bg2)', borderRadius:8, padding:'8px 10px' }}>
                <div style={{ fontSize:9, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ SectionLib ═════════════════════════════════ */
const LIB_CATS = ['Todos','Recuperação','GH / Sono','GH / Massa','Emagrecimento','Longevidade','Imunidade','Pele','Cognitivo','Sono','Hormonal'];

const LIB_FULL = [
  { n:'BPC-157',     cat:'Recuperação',   e:'🔄', dose:'250–500 mcg/dia',    via:'SC ou oral',      timing:'Manhã, em jejum',          ciclo:'4–12 sem', pausa:'4 sem', why:'Regeneração tecidual, gut health, tendões e ligamentos. Reduz inflamação sistêmica.' },
  { n:'TB-500',      cat:'Recuperação',   e:'💪', dose:'2–5 mg 2x/semana',   via:'SC ou IM',        timing:'Qualquer horário',         ciclo:'4–8 sem',  pausa:'4 sem', why:'Reparo muscular acelerado, redução de inflamação. Muito usado em lesões crônicas.' },
  { n:'Ipamorelin',  cat:'GH / Sono',     e:'🌙', dose:'200–300 mcg/dose',   via:'SC',              timing:'Antes de dormir',          ciclo:'8–12 sem', pausa:'4 sem', why:'Secretagogo seletivo de GH. Melhora sono profundo e composição corporal.' },
  { n:'CJC-1295',    cat:'GH / Sono',     e:'⚗️', dose:'100–200 mcg/dose',   via:'SC',              timing:'Junto com Ipamorelin',     ciclo:'8–12 sem', pausa:'4 sem', why:'Amplifica picos de GH. Stack clássico com Ipamorelin.' },
  { n:'Semaglutide', cat:'Emagrecimento', e:'🔥', dose:'0,25–2,4 mg/semana', via:'SC',              timing:'Mesmo dia da semana',      ciclo:'Contínuo', pausa:'—',     why:'Agonista GLP-1. Redução média de 15–20% do peso corporal.' },
  { n:'AOD-9604',    cat:'Emagrecimento', e:'🏃', dose:'300 mcg/dia',         via:'SC',              timing:'Manhã, em jejum',          ciclo:'8–12 sem', pausa:'4 sem', why:'Lipólise seletiva sem impacto no eixo GH ou glicemia.' },
  { n:'MK-677',      cat:'GH / Massa',    e:'💊', dose:'15–25 mg/dia',        via:'Oral',            timing:'Antes de dormir',          ciclo:'3–6 m',    pausa:'8 sem', why:'Único secretagogo oral eficaz. Aumenta IGF-1 em 40–90%.' },
  { n:'IGF-1 LR3',   cat:'GH / Massa',    e:'🏋️', dose:'50–100 mcg/dose',    via:'SC pós-treino',   timing:'Imediatamente pós-treino', ciclo:'4–6 sem',  pausa:'8 sem', why:'Hipertrofia direta via mTOR. Ciclos curtos obrigatórios.' },
  { n:'Epitalon',    cat:'Longevidade',   e:'🌟', dose:'5–10 mg/dia',         via:'SC',              timing:'À noite',                  ciclo:'10–20d',   pausa:'6 m',   why:'Estimula telomerase. Único peptídeo com evidências de elongação de telômeros.' },
  { n:'Thymosin α1', cat:'Imunidade',     e:'🛡️', dose:'1,6 mg 2x/semana',   via:'SC',              timing:'Qualquer horário',         ciclo:'4–6 sem',  pausa:'4 sem', why:'Imunomodulador. Aprovado em 35+ países para imunodeficiência.' },
  { n:'GHK-Cu',      cat:'Pele',          e:'✨', dose:'1–2 mg/dia',          via:'SC ou tópico',    timing:'Qualquer horário',         ciclo:'8–12 sem', pausa:'4 sem', why:'Estimula colágeno e elastina. Melhora firmeza e cicatrização.' },
  { n:'SNAP-8',      cat:'Pele',          e:'💆', dose:'Tópico 4–10%',        via:'Creme ou sérum',  timing:'2x ao dia',                ciclo:'Contínuo', pausa:'—',     why:'Botox peptídeo. Relaxa músculos de expressão sem injeção.' },
  { n:'Semax',       cat:'Cognitivo',     e:'🧠', dose:'200–600 mcg/dia',     via:'Intranasal',      timing:'Manhã',                    ciclo:'2–4 sem',  pausa:'2 sem', why:'Aumenta BDNF. Melhora foco e memória. Aprovado na Rússia.' },
  { n:'Selank',      cat:'Cognitivo',     e:'🧘', dose:'250–500 mcg/dia',     via:'Intranasal',      timing:'Manhã ou tarde',           ciclo:'2–4 sem',  pausa:'2 sem', why:'Ansiolítico sem sedação. Melhora memória e reduz estresse.' },
  { n:'DSIP',        cat:'Sono',          e:'😴', dose:'0,5–1 mg/dose',       via:'SC ou intranasal', timing:'30 min antes de dormir',  ciclo:'5–10d',    pausa:'2 sem', why:'Aumenta sono delta. Para insônia e jetlag.' },
  { n:'PT-141',      cat:'Hormonal',      e:'🌡️', dose:'0,5–2 mg/dose',       via:'SC ou intranasal', timing:'1–2h antes',              ciclo:'Pontual',  pausa:'—',     why:'Único FDA-aprovado para disfunção sexual feminina (Bremelanotide).' },
];

const STACKS = [
  { nome:'GH Clássico',      icon:'🌙', items:['Ipamorelin','CJC-1295'],    obj:'Sono, composição corporal, recuperação' },
  { nome:'Emagrecimento',    icon:'🔥', items:['Semaglutide','AOD-9604'],   obj:'Lipólise seletiva sem anabolismo' },
  { nome:'Hipertrofia',      icon:'💪', items:['IGF-1 LR3','MK-677'],       obj:'Síntese proteica e IGF-1 elevado' },
  { nome:'Recuperação',      icon:'🔄', items:['BPC-157','TB-500'],         obj:'Lesões, tendões, gut health' },
  { nome:'Longevidade',      icon:'🌟', items:['Epitalon','Thymosin α1'],   obj:'Telômeros, imunidade, sono profundo' },
  { nome:'Neuro',            icon:'🧠', items:['Semax','Selank'],           obj:'Foco, memória, redução de ansiedade' },
];

export function SectionLib() {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [open,   setOpen]   = useState(null);
  const [tab,    setTab]    = useState('guia');

  const filtered = LIB_FULL.filter(p => {
    const mc = filter === 'Todos' || p.cat === filter;
    const ms = !search || p.n.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  return (
    <div style={{ gridColumn:'1/-1' }}>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Biblioteca de peptídeos</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Base científica completa — mecanismos, doses, stacks e segurança</p>
      </div>

      <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:'1.25rem' }}>
        {[['guia','Guia completo'],['stacks','Stacks populares'],['comparar','Comparar']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ padding:'9px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:tab===v?'var(--tx)':'var(--ts)', borderBottom:tab===v?'2px solid var(--dark)':'2px solid transparent' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'guia' && (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
            <input className="inp" placeholder="Buscar peptídeo..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex:1, minWidth:200, marginBottom:0, fontSize:13 }}/>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1.25rem' }}>
            {LIB_CATS.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', border: filter===cat?'1px solid var(--green)':'1px solid var(--border)', background: filter===cat?'#F2FCF7':'var(--bg2)', color: filter===cat?'var(--gm)':'var(--tm)' }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map(p => (
              <div key={p.n} onClick={() => setOpen(open===p.n?null:p.n)}
                style={{ background:'var(--bg)', borderRadius:12, padding:'1rem 1.25rem', cursor:'pointer', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                    <span style={{ fontSize:'1.4rem', flexShrink:0 }}>{p.e}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{p.n}</div>
                      <div style={{ fontSize:11, color:'var(--ts)', marginTop:1 }}>{p.why.slice(0,60)}...</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    <span style={{ fontSize:10, background:'var(--gp)', color:'var(--gm)', padding:'2px 9px', borderRadius:100, fontWeight:500 }}>{p.cat}</span>
                    <svg width="14" height="14" fill="none" viewBox="0 0 14 14" style={{ transform: open===p.n?'rotate(180deg)':'none', transition:'transform .2s', color:'var(--ts)' }}>
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {open === p.n && (
                  <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
                    <div style={{ background:'var(--gp)', borderRadius:10, padding:'.875rem 1rem', marginBottom:'.875rem' }}>
                      <div style={{ fontSize:10, fontWeight:500, color:'var(--gm)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.375rem' }}>Por que usar</div>
                      <p style={{ fontSize:13, color:'var(--gm)', lineHeight:1.65, margin:0 }}>{p.why}</p>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                      {[['Dose',p.dose],['Via',p.via],['Timing',p.timing],['Ciclo',p.ciclo],['Pausa',p.pausa]].map(([l,v]) => (
                        <div key={l} style={{ background:'var(--bg2)', borderRadius:8, padding:'8px 10px' }}>
                          <div style={{ fontSize:9, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{l}</div>
                          <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'stacks' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
          {STACKS.map(s => (
            <div key={s.nome} style={{ background:'var(--bg)', borderRadius:12, padding:'1.25rem', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'1.8rem', marginBottom:'.625rem' }}>{s.icon}</div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'.25rem' }}>{s.nome}</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'.75rem' }}>
                {s.items.map(item => (
                  <span key={item} style={{ fontSize:11, background:'var(--gp)', color:'var(--gm)', padding:'3px 9px', borderRadius:100, fontWeight:500 }}>{item}</span>
                ))}
              </div>
              <div style={{ fontSize:11, color:'var(--tm)', background:'var(--bg2)', borderRadius:8, padding:'7px 10px' }}>🎯 {s.obj}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'comparar' && (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:'var(--bg2)', borderBottom:'2px solid var(--border)' }}>
                {['Peptídeo','Categoria','Via','Dose','Timing','Ciclo'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:600, color:'var(--ts)', fontSize:10, textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LIB_FULL.map((p, i) => (
                <tr key={p.n} style={{ borderBottom:'1px solid var(--border)', background: i%2===0?'transparent':'var(--bg2)' }}>
                  <td style={{ padding:'10px 12px', fontWeight:500, color:'var(--tx)', whiteSpace:'nowrap' }}>{p.e} {p.n}</td>
                  <td style={{ padding:'10px 12px' }}><span style={{ background:'var(--gp)', color:'var(--gm)', borderRadius:100, padding:'2px 8px', fontSize:10, fontWeight:500 }}>{p.cat}</span></td>
                  <td style={{ padding:'10px 12px', color:'var(--tm)', whiteSpace:'nowrap' }}>{p.via}</td>
                  <td style={{ padding:'10px 12px', color:'var(--tm)', whiteSpace:'nowrap' }}>{p.dose}</td>
                  <td style={{ padding:'10px 12px', color:'var(--tm)', whiteSpace:'nowrap' }}>{p.timing}</td>
                  <td style={{ padding:'10px 12px', color:'var(--tm)', whiteSpace:'nowrap' }}>{p.ciclo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══ SectionConfig ══════════════════════════════ */
interface CfgProps { answers: QuizAnswers; plan: string; }
const PLAN_LBL = { free:'Conta gratuita', essencial:'Essencial', pro:'Pro ✦' };

export function SectionConfig({ answers, plan }: CfgProps) {
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifPush,  setNotifPush]  = useState(true);
  const [notifSms,   setNotifSms]   = useState(false);
  const [unidade,    setUnidade]    = useState('mcg');
  const [saved,      setSaved]      = useState(false);

  const salvar = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ maxWidth:520, gridColumn:'1/-1' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Configurações</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Personalize sua experiência</p>
        </div>
        <button className="btn btn-d" onClick={salvar}>{saved ? '✓ Salvo!' : 'Salvar'}</button>
      </div>

      <div className="dc" style={{ marginBottom:'1rem' }}>
        <div className="dc-h"><div className="dc-t">Notificações</div></div>
        {[
          { label:'Lembrete por e-mail',    sub:'Resumo diário das aplicações', val:notifEmail, set:setNotifEmail },
          { label:'Notificação push',        sub:'Alerta no horário de aplicação', val:notifPush, set:setNotifPush },
          { label:'Alerta por SMS/WhatsApp', sub:'Mensagem para aplicações críticas', val:notifSms, set:setNotifSms },
        ].map(n => (
          <div key={n.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.75rem 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{n.label}</div>
              <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{n.sub}</div>
            </div>
            <div onClick={() => n.set(!n.val)}
              style={{ width:38, height:22, borderRadius:11, background: n.val?'var(--green)':'var(--border)', position:'relative', cursor:'pointer', flexShrink:0, transition:'background .2s' }}>
              <div style={{ position:'absolute', top:3, left: n.val?19:3, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
            </div>
          </div>
        ))}
      </div>

      <div className="dc" style={{ marginBottom:'1rem' }}>
        <div className="dc-h"><div className="dc-t">Unidade de dose</div></div>
        <div style={{ display:'flex', gap:8 }}>
          {['mcg','mg'].map(u => (
            <button key={u} onClick={() => setUnidade(u)}
              style={{ padding:'7px 18px', borderRadius:8, border: unidade===u?'1.5px solid var(--green)':'1.5px solid var(--border)', background: unidade===u?'#F2FCF7':'var(--bg2)', color: unidade===u?'var(--gm)':'var(--tm)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="dc" style={{ marginBottom:'1rem' }}>
        <div className="dc-h"><div className="dc-t">Plano atual</div><span style={{ fontSize:11, background:'var(--gp)', color:'var(--gm)', borderRadius:100, padding:'2px 10px', fontWeight:500 }}>{PLAN_LBL[plan]??plan}</span></div>
        {plan !== 'pro' && <button className="btn btn-d fw" style={{ marginBottom:8 }}>⚡ Fazer upgrade para Pro — R$59/mês</button>}
        {plan !== 'free' && <button className="btn btn-o fw" style={{ color:'var(--am)', borderColor:'rgba(212,137,58,.3)', fontSize:13 }}>Cancelar plano</button>}
      </div>

      <div className="dc">
        <div className="dc-h"><div className="dc-t">Diagnóstico</div></div>
        <p style={{ fontSize:13, color:'var(--tm)', marginBottom:'1rem', lineHeight:1.55 }}>Seus objetivos mudaram? Refaça o diagnóstico para atualizar seu protocolo.</p>
        <a href="/diagnostico" style={{ textDecoration:'none' }}><button className="btn btn-o fw">Refazer diagnóstico</button></a>
      </div>
    </div>
  );
}
