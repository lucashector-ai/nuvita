// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';

type Msg = { role:'user'|'assistant'; content:string };

const SUGESTOES = [
  'Quais são os efeitos colaterais do BPC-157?',
  'Posso combinar Tirzepatide com AOD-9604?',
  'Como aplicar corretamente via SC?',
  'Qual o melhor horário para o Ipamorelin?',
  'O que fazer se sentir náusea no Tirzepatide?',
  'Como armazenar os peptídeos reconstituídos?',
];

export default function SectionCoach({ answers, objs }: any) {
  const [msgs,     setMsgs]     = useState<Msg[]>([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const nome    = answers?.nome || 'você';
  const objList = (objs || []).join(', ') || 'saúde geral';
  const nivel   = answers?.q4 || 'iniciante';

  const systemPrompt = `Você é o Coach IA da Nuvita, especialista em peptídeos terapêuticos. 
Você está conversando com ${nome}, nível ${nivel}, com objetivos de: ${objList}.
Responda de forma clara, baseada em evidências científicas, mas acessível.
Sempre recomende supervisão médica para decisões clínicas.
Responda em português do Brasil. Seja conciso mas completo.
Máximo de 3-4 parágrafos por resposta.`;

  const enviar = async (texto?: string) => {
    const msg = (texto || input).trim();
    if (!msg || loading) return;
    const novasMsgs: Msg[] = [...msgs, { role:'user', content:msg }];
    setMsgs(novasMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: novasMsgs.map(m=>({ role:m.role, content:m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || data.message || 'Desculpe, ocorreu um erro.';
      setMsgs([...novasMsgs, { role:'assistant', content:reply }]);
    } catch {
      setMsgs([...novasMsgs, { role:'assistant', content:'Ocorreu um erro ao conectar. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'70vh' }}>
      {/* Header */}
      <div style={{ marginBottom:'1rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Coach IA</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Pergunte qualquer coisa sobre seu protocolo e peptídeos</p>
      </div>

      {/* Mensagens */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, paddingRight:4 }}>
        {msgs.length === 0 && (
          <div style={{ textAlign:'center', paddingTop:'2rem' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🧬</div>
            <div style={{ fontSize:14, fontWeight:500, marginBottom:'.5rem' }}>Olá, {nome}!</div>
            <div style={{ fontSize:13, color:'var(--ts)', marginBottom:'1.5rem' }}>
              Sou seu coach especializado em peptídeos. Pergunte o que quiser sobre seu protocolo.
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
              {SUGESTOES.map(s=>(
                <button key={s} onClick={()=>enviar(s)}
                  style={{ padding:'6px 14px', borderRadius:100, border:'none', background:'#FFFFFF', fontSize:12, cursor:'pointer', fontFamily:'inherit', color:'var(--tm)', transition:'all .15s' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--bg2)'}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
            {m.role==='assistant' && (
              <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--dark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, marginRight:8, flexShrink:0, marginTop:2 }}>🧬</div>
            )}
            <div style={{
              maxWidth:'75%', padding:'10px 14px', borderRadius:12,
              background:m.role==='user'?'var(--dark)':'var(--bg2)',
              color:m.role==='user'?'white':'var(--tx)',
              fontSize:13, lineHeight:1.6,
              borderBottomRightRadius:m.role==='user'?4:12,
              borderBottomLeftRadius:m.role==='assistant'?4:12,
            }}>
              {m.content.split('\n').map((line,j)=>(
                <div key={j} style={{ marginBottom:line?2:6 }}>{line}</div>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--dark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🧬</div>
            <div style={{ padding:'10px 14px', borderRadius:12, background:'#FFFFFF', fontSize:13 }}>
              <span style={{ animation:'pulse 1s infinite' }}>Analisando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ display:'flex', gap:8, marginTop:'1rem', background:'#FFFFFF', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'8px', border:'none' }}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); enviar(); }}}
          placeholder="Pergunte sobre seu protocolo, doses, efeitos..."
          rows={1}
          style={{ flex:1, border:'none', background:'transparent', resize:'none', fontSize:13, fontFamily:'inherit', color:'var(--tx)', outline:'none', lineHeight:1.5, paddingTop:2 }}/>
        <button onClick={()=>enviar()} disabled={!input.trim()||loading}
          style={{ width:36, height:36, borderRadius:8, border:'none', background:input.trim()&&!loading?'var(--dark)':'var(--border)', color:'white', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .15s' }}>
          ↑
        </button>
      </div>
      <div style={{ fontSize:11, color:'var(--ts)', textAlign:'center', marginTop:6 }}>
        Enter para enviar · Shift+Enter para nova linha · Consulte sempre um médico
      </div>
    </div>
  );
}
