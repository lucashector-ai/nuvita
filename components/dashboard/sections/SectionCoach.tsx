// @ts-nocheck
'use client';
import { useState, useRef, useEffect } from 'react';

const SUGESTOES = [
  'Quais são os efeitos colaterais do BPC-157?',
  'Posso combinar Tirzepatide com AOD-9604?',
  'Como aplicar corretamente via SC?',
  'Qual o melhor horário para o Ipamorelin?',
  'O que fazer se sentir náusea no Tirzepatide?',
  'Como armazenar os peptídeos reconstituídos?',
];

export default function SectionCoach({ answers, items, userId }: any) {
  const [msgs, setMsgs]     = useState<{role:string;text:string}[]>([]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const nome = answers?.nome?.toString().split(' ')[0] || '';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [msgs, loading]);

  const enviar = async (texto?: string) => {
    const msg = (texto || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMsgs(p => [...p, { role:'user', text:msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          message: msg,
          context: {
            nome,
            objetivo: answers?.q3,
            nivel: answers?.q4,
            protocolo: items?.map(i => i.n).join(', '),
          }
        })
      });
      const data = await res.json();
      setMsgs(p => [...p, { role:'assistant', text: data.response || 'Erro ao obter resposta.' }]);
    } catch {
      setMsgs(p => [...p, { role:'assistant', text:'Ocorreu um erro. Tente novamente.' }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 120px)', maxWidth:800 }}>

      {/* Mensagens */}
      <div style={{ flex:1, overflowY:'auto', paddingBottom:'1rem' }}>
        {msgs.length === 0 ? (
          /* Estado vazio */
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:24, paddingTop:'2rem' }}>
            <div style={{ width:60, height:60, borderRadius:16, background:'linear-gradient(135deg,#22C55E,#15803D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>
              🧬
            </div>
            <div style={{ textAlign:'center' }}>
              <h3 style={{ fontSize:'1.1rem', fontWeight:500, letterSpacing:'-.03em', marginBottom:6 }}>
                {nome ? `Olá, ${nome}!` : 'Coach IA'}
              </h3>
              <p style={{ fontSize:13, color:'var(--ts)', maxWidth:360, lineHeight:1.6 }}>
                Sou especializado em peptídeos. Pergunte sobre seu protocolo, doses, efeitos e muito mais.
              </p>
            </div>
            {/* Sugestões */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', maxWidth:560 }}>
              {SUGESTOES.map(s => (
                <button key={s} onClick={() => enviar(s)}
                  style={{ padding:'8px 14px', borderRadius:100, border:'1px solid var(--border)', background:'#FFFFFF',
                    boxShadow:'0 1px 2px rgba(0,0,0,.04)', cursor:'pointer', fontSize:12, color:'var(--tm)',
                    fontFamily:'inherit', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--gm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--tm)'; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Mensagens */
          <div style={{ display:'flex', flexDirection:'column', gap:16, padding:'1rem 0' }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                {/* Avatar */}
                <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
                  background: m.role === 'user' ? 'var(--dark)' : 'linear-gradient(135deg,#22C55E,#15803D)',
                  color:'white', fontWeight:600 }}>
                  {m.role === 'user' ? (nome?.charAt(0)?.toUpperCase() || 'U') : '🧬'}
                </div>
                {/* Balão */}
                <div style={{ maxWidth:'75%', padding:'10px 14px', borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  background: m.role === 'user' ? 'var(--dark)' : '#FFFFFF',
                  color: m.role === 'user' ? 'white' : 'var(--tx)',
                  boxShadow: m.role === 'assistant' ? '0 1px 2px rgba(0,0,0,.06),0 2px 6px rgba(0,0,0,.04)' : 'none',
                  fontSize:13, lineHeight:1.65, whiteSpace:'pre-wrap' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#22C55E,#15803D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🧬</div>
                <div style={{ padding:'12px 16px', borderRadius:'4px 14px 14px 14px', background:'#FFFFFF',
                  boxShadow:'0 1px 2px rgba(0,0,0,.06)', display:'flex', gap:4, alignItems:'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--ts)',
                      animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        )}
      </div>

      {/* Input fixo no rodapé */}
      <div style={{ background:'#F7F7F7', paddingTop:'12px', borderTop:'1px solid #E5E7EB' }}>
        <div style={{ display:'flex', gap:8, alignItems:'flex-end', background:'#FFFFFF',
          borderRadius:14, padding:'10px 10px 10px 16px',
          boxShadow:'0 1px 2px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Pergunte sobre seu protocolo, doses, efeitos..."
            rows={1}
            style={{ flex:1, border:'none', outline:'none', resize:'none', fontFamily:'inherit',
              fontSize:13, color:'var(--tx)', background:'transparent', lineHeight:1.5,
              maxHeight:120, overflowY:'auto' }}
          />
          <button onClick={() => enviar()} disabled={!input.trim() || loading}
            style={{ width:36, height:36, borderRadius:10, border:'none', flexShrink:0,
              background: input.trim() && !loading ? 'var(--dark)' : '#E5E7EB',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path d="M13 1L1 7l5 2m7-8L8 13 6 9m7-8L6 9" stroke={input.trim() && !loading ? 'white' : '#9CA3AF'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div style={{ textAlign:'center', fontSize:11, color:'var(--ts)', marginTop:8 }}>
          Enter para enviar · Shift+Enter para nova linha · Consulte sempre um médico
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: .5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
