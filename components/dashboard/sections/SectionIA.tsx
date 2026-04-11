// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import type { QuizAnswers, ObjectiveKey } from '@/types';
import { OBJECTIVE_LABELS } from '@/types';
import { apiFetch } from '@/lib/apiClient';

interface Props { answers: QuizAnswers; objs: ObjectiveKey[]; }

const CHIPS = [
  'Como aplicar corretamente?',
  'Quanto tempo para ver resultado?',
  'Preciso fazer pausa?',
  'Como reconstituir o peptídeo?',
  'Posso combinar com suplementos?',
  'O que comer para potencializar?',
];

export default function SectionIA({ answers, objs }: Props) {
  const now = () => new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});

  const systemPrompt = `Você é o Assistente de Inteligência Aplicada a Protocolos de Peptídeos da Nuvita — com a mentalidade de um médico funcional especialista em peptídeos terapêuticos, performance e longevidade.

Sua missão não é dar informação genérica. É dar DIREÇÃO clara e personalizada.

PERFIL DO USUÁRIO:
- Nome: ${answers.nome || 'não informado'}
- Sexo: ${answers.q2 || 'não informado'}
- Objetivos: ${objs?.map(o => OBJECTIVE_LABELS[o]).join(', ') || 'não informado'}
- Peso: ${answers.peso || 'não informado'} kg
- Altura: ${answers.altura || 'não informada'} cm
- Nível de experiência: ${answers.q4 || 'iniciante'}
- Atividade física: ${answers.q6 || 'não informado'}
- Qualidade do sono: ${answers.q7 || 'não informado'}/5
- Nível de estresse: ${answers.q8 || 'não informado'}
- Condições de saúde: ${Array.isArray(answers.q10) ? answers.q10.join(', ') : (answers.q10 || 'nenhuma declarada')}

O QUE VOCÊ FAZ:
✓ Responde dúvidas sobre o protocolo do usuário de forma personalizada
✓ Explica como cada peptídeo funciona no corpo deste usuário específico
✓ Orienta sobre alimentação, treino, sono e recuperação alinhados ao protocolo
✓ Esclarece dúvidas sobre aplicação, reconstituição, timing e doses
✓ Identifica possíveis problemas e sugere ajustes

SEU ESTILO:
- Fale sempre em português brasileiro
- Seja direto, empático e confiante — como um especialista de confiança
- Use linguagem simples, sem jargão técnico desnecessário
- Vá direto ao ponto, sem enrolação
- Personalize sempre para o perfil do usuário acima
- Nunca dê respostas genéricas — sempre conecte com o perfil e objetivos desta pessoa

VERDADE IMPORTANTE:
Peptídeos não fazem milagre. Mas com estratégia e consistência, aceleram muito os resultados.

Você não substitui um profissional de saúde — mas entrega o melhor direcionamento possível.`;

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Olá${answers.nome ? `, ${answers.nome}` : ''}! 👋\n\nSou seu assistente especialista em peptídeos da Nuvita.\n\nAnalisei seu perfil e seus objetivos — estou aqui para te dar direção clara sobre seu protocolo, tirar dúvidas sobre aplicação, timing, alimentação e tudo que você precisar.\n\nPor onde quer começar?`,
      time: now()
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', text: msg, time: now() }];
    setMessages(newMessages);
    setLoading(true);
    try {
      // Monta histórico no formato Anthropic
      const apiMessages = newMessages
        .filter(m => m.role === 'user' || m.role === 'ai')
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

      const res = await apiFetch('/api/ia', {
        method: 'POST',
        body: JSON.stringify({
          system: systemPrompt,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      setMessages(p => [...p, { role: 'ai', text: data.text ?? '⚠️ Erro na IA', time: now() }]);
    } catch {
      setMessages(p => [...p, { role: 'ai', text: '⚠️ Erro ao conectar com a IA. Tente novamente.', time: now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width:'100%', height:'calc(100vh - 130px)', display:'flex', flexDirection:'column', gridColumn:'1/-1' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:'1rem', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ width:40, height:40, background:'var(--dark)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>🧬</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)' }}>Assistente Especialista</div>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--gm)', marginTop:1 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)' }}/>
            Online · Especialista em peptídeos terapêuticos
          </div>
        </div>
        <div style={{ fontSize:11, color:'var(--ts)' }}>Fins educativos · Não substitui médico</div>
      </div>

      {/* Mensagens */}
      <div ref={msgsRef} style={{ flex:1, overflowY:'auto', padding:'1rem 0', display:'flex', flexDirection:'column', gap:'.875rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:m.role==='user'?'flex-end':'flex-start', gap:3 }}>
            {m.role==='ai' && (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:2 }}>
                <div style={{ width:22, height:22, background:'var(--dark)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem' }}>🧬</div>
                <span style={{ fontSize:11, color:'var(--ts)', fontWeight:500 }}>Assistente Nuvita</span>
              </div>
            )}
            <div style={{ maxWidth:'72%', padding:'10px 14px', borderRadius:16, fontSize:14, lineHeight:1.7, whiteSpace:'pre-wrap', background:m.role==='user'?'var(--dark)':'white', color:m.role==='user'?'white':'var(--tx)', borderBottomRightRadius:m.role==='user'?4:16, borderBottomLeftRadius:m.role==='ai'?4:16, boxShadow:m.role==='ai'?'0 1px 4px rgba(0,0,0,.07)':'none' }}>
              {m.text}
            </div>
            <div style={{ fontSize:10, color:'var(--ts)', marginLeft:m.role==='ai'?2:0, marginRight:m.role==='user'?2:0 }}>{m.time}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:2 }}>
              <div style={{ width:22, height:22, background:'var(--dark)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem' }}>🧬</div>
              <span style={{ fontSize:11, color:'var(--ts)' }}>analisando...</span>
            </div>
            <div style={{ padding:'12px 16px', background:'white', borderRadius:16, borderBottomLeftRadius:4, display:'flex', gap:5, boxShadow:'0 1px 4px rgba(0,0,0,.07)' }}>
              {[0,1,2].map(d => (
                <div key={d} style={{ width:7, height:7, borderRadius:'50%', background:'var(--ts)', animation:`bounce 1.2s ease-in-out ${d*0.2}s infinite`, opacity:.6 }}/>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1rem', flexShrink:0 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'.75rem' }}>
          {CHIPS.map(c => (
            <button key={c} onClick={() => send(c)}
              style={{ padding:'5px 12px', background:'white', border:'1px solid var(--border)', borderRadius:100, fontSize:12, fontWeight:500, color:'var(--tm)', cursor:'pointer', fontFamily:'inherit', transition:'all .13s', boxShadow:'0 1px 3px rgba(0,0,0,.05)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.color='var(--gm)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--tm)'; }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'flex-end', background:'white', border:'1px solid var(--border)', borderRadius:14, padding:'10px 12px', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
          <textarea
            placeholder="Pergunte sobre seu protocolo, doses, timing, alimentação..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            style={{ flex:1, background:'none', border:'none', outline:'none', resize:'none', fontFamily:'inherit', fontSize:14, color:'var(--tx)', lineHeight:1.5, maxHeight:120, overflowY:'auto' }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            style={{ width:34, height:34, borderRadius:9, background:input.trim()?'var(--dark)':'#E5E7EB', border:'none', cursor:input.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .13s' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M2 8h12M8 3l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize:11, color:'var(--ts)', textAlign:'center', marginTop:'.5rem' }}>
          Assistente com fins educacionais · Consultas médicas na seção <strong>Médico</strong>
        </div>
      </div>
    </div>
  );
}
