// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import type { QuizAnswers, ObjectiveKey } from '@/types';
import { OBJECTIVE_LABELS } from '@/types';

interface Props { answers: QuizAnswers; objs: ObjectiveKey[]; }

const SUGESTOES_CHIPS = [
  'Meu protocolo está funcionando?',
  'Como ajustar minha dose de Semaglutide?',
  'Devo fazer uma pausa no ciclo?',
  'Quais resultados esperar na semana 4?',
];

const PROATIVAS = [
  { tipo:'ajuste',   icon:'⚙️', titulo:'Sugestão de ajuste',  texto:'Com base na sua adesão de 73%, reduza o Ipamorelin para 5x/semana. Facilita a aderência sem perda de resultado.', acao:'Como fazer esse ajuste?' },
  { tipo:'alerta',   icon:'⚠️', titulo:'Atenção no ciclo',    texto:'Semana 8 — reta final. Planeje a saída gradual agora para evitar rebound. Inicie redução nos próximos 7 dias.', acao:'Me explica o protocolo de saída' },
  { tipo:'positivo', icon:'✅', titulo:'Resultado confirmado', texto:'3kg em 8 semanas está dentro da faixa ideal para preservação de massa muscular. Continue o protocolo atual.', acao:'O que fazer para manter?' },
];

const TIPO_STYLE = {
  ajuste:   { bg:'var(--bg2)', border:'var(--border)',           cor:'var(--tm)'  },
  alerta:   { bg:'#FAEEDA',    border:'rgba(239,159,39,.2)',    cor:'#633806'    },
  positivo: { bg:'var(--gp)',  border:'rgba(29,158,117,.2)',    cor:'var(--gm)'  },
};

export default function SectionCoach({ answers, objs }: Props) {
  const now = () => new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const [msgs, setMsgs] = useState([
    { role:'ai', text:`Olá${answers.nome?`, ${answers.nome}`:''}! 👋 Sou o seu Coach IA.\n\nAnalisei seu histórico e tenho observações sobre seu protocolo. Pode me perguntar sobre ajustes de dose, timing, estratégia de ciclo ou interpretação dos seus resultados.`, time:now() },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState<'coach'|'sugestoes'>('coach');
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMsgs(p => [...p, { role:'user', text:msg, time:now() }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ia', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          system:`Você é o Coach IA da Nuvita, especialista em protocolos de peptídeos. Contexto: objetivos=${objs?.map(o=>OBJECTIVE_LABELS[o]).join(', ')||'perda de gordura'}, peso=${answers.peso||75}kg, semana 8/8, adesão 73%, resultado -3kg. Responda em português, seja direto e específico. Não seja genérico.`,
          messages:[{role:'user',content:msg}],
        }),
      });
      const data = await res.json();
      setMsgs(p=>[...p,{role:'ai',text:data.text||'⚠️ Configure ANTHROPIC_API_KEY no .env.local',time:now()}]);
    } catch {
      setMsgs(p=>[...p,{role:'ai',text:'⚠️ Configure ANTHROPIC_API_KEY no .env.local para usar o Coach.',time:now()}]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:760, gridColumn:'1/-1', margin:'0 auto' }}>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Coach IA</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Análise personalizada, ajustes e orientação sobre o seu protocolo</p>
      </div>

      {/* Tabs com badge */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'1.25rem' }}>
        <button onClick={() => setTab('coach')}
          style={{ padding:'9px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:tab==='coach'?'var(--tx)':'var(--ts)', borderBottom:tab==='coach'?'2px solid var(--dark)':'2px solid transparent' }}>
          💬 Chat com o Coach
        </button>
        <button onClick={() => setTab('sugestoes')}
          style={{ padding:'9px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:tab==='sugestoes'?'var(--tx)':'var(--ts)', borderBottom:tab==='sugestoes'?'2px solid var(--dark)':'2px solid transparent', display:'flex', alignItems:'center', gap:6 }}>
          ⚡ Sugestões proativas
          <span style={{ fontSize:10, background:'#D85A30', color:'white', borderRadius:100, padding:'1px 6px', fontWeight:600 }}>
            {PROATIVAS.length}
          </span>
        </button>
      </div>

      {tab === 'coach' && (
        <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:40, height:40, background:'var(--dark)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>🎯</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>Coach Nuvita</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--gm)', marginTop:1 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)' }}/>
                Analisa seus dados em tempo real
              </div>
            </div>
            <div style={{ fontSize:10, color:'var(--ts)', textAlign:'right' }}>Semana 8/8<br/>Adesão 73%</div>
          </div>

          <div ref={msgsRef} style={{ height:320, overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:'.875rem', background:'var(--bg2)' }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:m.role==='user'?'flex-end':'flex-start', gap:3 }}>
                {m.role==='ai' && (
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginLeft:2 }}>
                    <div style={{ width:20, height:20, background:'var(--dark)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem' }}>🎯</div>
                    <span style={{ fontSize:11, color:'var(--ts)', fontWeight:500 }}>Coach Nuvita</span>
                  </div>
                )}
                <div style={{ maxWidth:'82%', padding:'10px 14px', borderRadius:14, fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap', background:m.role==='user'?'var(--dark)':'var(--bg)', color:m.role==='user'?'white':'var(--tx)', borderBottomRightRadius:m.role==='user'?4:14, borderBottomLeftRadius:m.role==='ai'?4:14, border:m.role==='ai'?'1px solid var(--border)':'none' }}>
                  {m.text}
                </div>
                <div style={{ fontSize:10, color:'var(--ts)', marginLeft:m.role==='ai'?2:0, marginRight:m.role==='user'?2:0 }}>{m.time}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:4 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginLeft:2 }}>
                  <div style={{ width:20, height:20, background:'var(--dark)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem' }}>🎯</div>
                  <span style={{ fontSize:11, color:'var(--ts)' }}>analisando...</span>
                </div>
                <div style={{ padding:'10px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, borderBottomLeftRadius:4, display:'flex', gap:4 }}>
                  {[0,1,2].map(d=><div key={d} style={{ width:6, height:6, borderRadius:'50%', background:'var(--ts)', opacity:.5 }}/>)}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding:'.75rem 1rem', borderTop:'1px solid var(--border)', display:'flex', gap:6, flexWrap:'wrap' }}>
            {SUGESTOES_CHIPS.map(s => (
              <button key={s} onClick={() => send(s)}
                style={{ padding:'5px 11px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:100, fontSize:11, fontWeight:500, color:'var(--tm)', cursor:'pointer', fontFamily:'inherit' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--green)';e.currentTarget.style.color='var(--gm)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--tm)';}}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ padding:'.875rem 1rem', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'flex-end' }}>
            <textarea rows={1} placeholder="Pergunte sobre ajustes, resultados, próximos passos..."
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
              style={{ flex:1, background:'none', border:'none', outline:'none', resize:'none', fontFamily:'inherit', fontSize:13, color:'var(--tx)', lineHeight:1.5, maxHeight:100, overflowY:'auto' }}/>
            <button onClick={()=>send()} disabled={loading||!input.trim()}
              style={{ width:34, height:34, borderRadius:9, background:input.trim()?'var(--dark)':'var(--border)', border:'none', cursor:input.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .13s' }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
                <path d="M2 7.5h11M8 3l4.5 4.5L8 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {tab === 'sugestoes' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {PROATIVAS.map((p,i) => (
            <div key={i} style={{ background:TIPO_STYLE[p.tipo].bg, border:`1px solid ${TIPO_STYLE[p.tipo].border}`, borderRadius:14, padding:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'.625rem' }}>
                <span style={{ fontSize:'1.1rem' }}>{p.icon}</span>
                <span style={{ fontSize:13, fontWeight:500, color:TIPO_STYLE[p.tipo].cor }}>{p.titulo}</span>
              </div>
              <p style={{ fontSize:13, color:TIPO_STYLE[p.tipo].cor, lineHeight:1.65, marginBottom:'.875rem' }}>{p.texto}</p>
              <button onClick={() => { setTab('coach'); setTimeout(()=>send(p.acao),100); }}
                style={{ padding:'6px 14px', background:'var(--dark)', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                {p.acao} →
              </button>
            </div>
          ))}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', fontSize:11, color:'var(--ts)', textAlign:'center' }}>
            Sugestões baseadas nos seus dados de adesão, tracker e diário · Fins educacionais
          </div>
        </div>
      )}
    </div>
  );
}
