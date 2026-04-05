// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import type { QuizAnswers, ObjectiveKey } from '@/types';
import { OBJECTIVE_LABELS } from '@/types';

interface Props { answers: QuizAnswers; objs: ObjectiveKey[]; }

const CHIPS = [
  'Onde comprar peptídeos?','Como reconstituir?','Posso combinar dois?',
  'Preciso fazer pausa?','Qual o melhor timing?','Efeitos da 1ª semana?',
];

export default function SectionIA({ answers, objs }: Props) {
  const now = () => new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const [messages, setMessages] = useState([
    { role:'ai', text:`Olá${answers.nome?`, ${answers.nome}`:''}! 👋 Sou a IA Nuvita.\n\nPosso te ajudar com doses, timing, onde comprar, reconstituição e tudo sobre seu protocolo. Como posso ajudar?`, time:now() },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(p => [...p, { role:'user', text:msg, time:now() }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ia', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          system:`Você é a IA Nuvita, especialista em peptídeos. Usuário: objetivos=${objs?.map(o=>OBJECTIVE_LABELS[o]).join(', ')||'perda de gordura'}, peso=${answers.peso??75}kg. Responda em português, seja direto. Sobre onde comprar: pureza ≥98%, laudo COA, farmácia de manipulação. Não substitui avaliação médica.`,
          messages:[{role:'user',content:msg}],
        }),
      });
      const data = await res.json();
      setMessages(p => [...p, { role:'ai', text:data.text??'⚠️ Configure ANTHROPIC_API_KEY no .env.local', time:now() }]);
    } catch {
      setMessages(p => [...p, { role:'ai', text:'⚠️ Configure ANTHROPIC_API_KEY no .env.local para usar a IA.', time:now() }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ width:'100%', height:'calc(100vh - 130px)', display:'flex', flexDirection:'column', gridColumn:'1/-1' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:'1rem', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ width:40, height:40, background:'var(--dark)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>🤖</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)' }}>IA Nuvita</div>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--gm)', marginTop:1 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)' }}/>
            Online · Especialista em peptídeos
          </div>
        </div>
        <div style={{ fontSize:11, color:'var(--ts)' }}>Fins educativos · Não substitui médico</div>
      </div>

      {/* Mensagens */}
      <div ref={msgsRef} style={{ flex:1, overflowY:'auto', padding:'1rem 0', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        {messages.map((m,i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:m.role==='user'?'flex-end':'flex-start', gap:3 }}>
            {m.role==='ai' && (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:2 }}>
                <div style={{ width:22, height:22, background:'var(--dark)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem' }}>🤖</div>
                <span style={{ fontSize:11, color:'var(--ts)', fontWeight:500 }}>IA Nuvita</span>
              </div>
            )}
            <div style={{ maxWidth:'72%', padding:'10px 14px', borderRadius:16, fontSize:14, lineHeight:1.7, whiteSpace:'pre-wrap', background:m.role==='user'?'var(--dark)':'var(--bg)', color:m.role==='user'?'white':'var(--tx)', borderBottomRightRadius:m.role==='user'?4:16, borderBottomLeftRadius:m.role==='ai'?4:16, border:m.role==='ai'?'1px solid var(--border)':'none' }}>
              {m.text}
            </div>
            <div style={{ fontSize:10, color:'var(--ts)', marginLeft:m.role==='ai'?2:0, marginRight:m.role==='user'?2:0 }}>{m.time}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:2 }}>
              <div style={{ width:22, height:22, background:'var(--dark)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem' }}>🤖</div>
              <span style={{ fontSize:11, color:'var(--ts)' }}>digitando...</span>
            </div>
            <div style={{ padding:'12px 16px', background:'#F7F7F7', border:'none', borderRadius:16, borderBottomLeftRadius:4, display:'flex', gap:5 }}>
              {[0,1,2].map(d=><div key={d} style={{ width:7, height:7, borderRadius:'50%', background:'var(--ts)', opacity:.5 }}/>)}
            </div>
          </div>
        )}
      </div>

      {/* Input fixo no bottom */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1rem', flexShrink:0 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'.75rem' }}>
          {CHIPS.map(c => (
            <button key={c} onClick={() => send(c)}
              style={{ padding:'5px 12px', background:'#F7F7F7', border:'none', borderRadius:100, fontSize:12, fontWeight:500, color:'var(--tm)', cursor:'pointer', fontFamily:'inherit', transition:'all .13s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--green)';e.currentTarget.style.color='var(--gm)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--tm)';}}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'flex-end', background:'#F7F7F7', border:'none', borderRadius:14, padding:'10px 12px' }}>
          <textarea placeholder="Pergunte sobre doses, timing, fornecedores..." value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            rows={1}
            style={{ flex:1, background:'none', border:'none', outline:'none', resize:'none', fontFamily:'inherit', fontSize:14, color:'var(--tx)', lineHeight:1.5, maxHeight:120, overflowY:'auto' }}/>
          <button onClick={() => send()} disabled={loading||!input.trim()}
            style={{ width:34, height:34, borderRadius:9, background:input.trim()?'var(--dark)':'var(--border)', border:'none', cursor:input.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .13s' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M2 8h12M8 3l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize:11, color:'var(--ts)', textAlign:'center', marginTop:'.5rem' }}>
          IA Nuvita tem fins educacionais · Para consulta médica use a seção <strong>Médico</strong>
        </div>
      </div>
    </div>
  );
}
