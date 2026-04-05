// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const DIAS = [
  { id:'seg', label:'Segunda' },
  { id:'ter', label:'Terça'   },
  { id:'qua', label:'Quarta'  },
  { id:'qui', label:'Quinta'  },
  { id:'sex', label:'Sexta'   },
  { id:'sab', label:'Sábado'  },
  { id:'dom', label:'Domingo' },
];

const EMOJIS = [
  '💊','🏃','🧘','💪','🛌','🥗','💧','☕','🧴','🩺','⚡','🔥','🌿',
  '🎯','📋','🏋️','🚴','🧬','💉','🌅','🌙','⏰','🍎','🥦','🫀',
  '🧠','🦷','👁️','🫁','🦴','🩻','💆','🏊','🤸','🧪','📍','✅',
];

type Card = { id:string; nome:string; emoji:string; dias:string[] };

interface Props { answers:any; userId:string }

export default function SectionRotina({ answers, userId }: Props) {
  const [cards,   setCards]   = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<{ dia:string }|null>(null);
  const [novoNome,setNovoNome]= useState('');
  const [novoEmoji,setNovoEmoji]= useState('💊');
  const [showEmoji,setShowEmoji]= useState(false);
  const [drag,    setDrag]    = useState<string|null>(null);
  const [dragDia, setDragDia] = useState<string|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<any>(null);

  useEffect(() => { if (userId) carregar(); }, [userId]);
  useEffect(() => { if (modal) setTimeout(()=>inputRef.current?.focus(),80); }, [modal]);

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('rotina_personalizada')
      .select('itens')
      .eq('user_id', userId)
      .maybeSingle();
    setCards(data?.itens || []);
    setLoading(false);
  };

  // Salva automaticamente com debounce de 800ms
  const autoSalvar = (novos: Card[]) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase.from('rotina_personalizada').upsert({
        user_id: userId,
        itens: novos,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }, 800);
  };

  const atualizar = (novos: Card[]) => {
    setCards(novos);
    autoSalvar(novos);
  };

  const adicionarCard = () => {
    if (!novoNome.trim() || !modal) return;
    const novo: Card = {
      id: `c${Date.now()}`,
      nome: novoNome.trim(),
      emoji: novoEmoji,
      dias: [modal.dia],
    };
    atualizar([...cards, novo]);
    setNovoNome('');
    setNovoEmoji('💊');
    setShowEmoji(false);
    setModal(null);
  };

  const removerCard = (id: string) => {
    atualizar(cards.filter(c => c.id !== id));
  };

  const onDrop = (diaId: string) => {
    if (!drag) return;
    const novos = cards.map(c =>
      c.id === drag
        ? { ...c, dias: [diaId] }
        : c
    );
    atualizar(novos);
    setDrag(null);
    setDragDia(null);
  };

  if (loading) return (
    <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>
      Carregando...
    </div>
  );

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday:'long' }).toLowerCase();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Rotina semanal</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Organize sua rotina por dia da semana · salva automaticamente</p>
      </div>

      {/* Board Kanban */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:12 }}>
        {DIAS.map(dia => {
          const diaCards = cards.filter(c => c.dias.includes(dia.id));
          const isDragOver = dragDia === dia.id;
          const isHoje = dia.label.toLowerCase().startsWith(hoje.substring(0,3)) ||
            (dia.id==='seg'&&hoje.includes('segunda')) || (dia.id==='ter'&&hoje.includes('terça')) ||
            (dia.id==='qua'&&hoje.includes('quarta')) || (dia.id==='qui'&&hoje.includes('quinta')) ||
            (dia.id==='sex'&&hoje.includes('sexta'))  || (dia.id==='sab'&&hoje.includes('sábado')) ||
            (dia.id==='dom'&&hoje.includes('domingo'));

          return (
            <div key={dia.id}
              onDragOver={e => { e.preventDefault(); setDragDia(dia.id); }}
              onDrop={() => onDrop(dia.id)}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragDia(null); }}
              style={{ minHeight:400, display:'flex', flexDirection:'column' }}>

              {/* Cabeçalho do dia */}
              <div style={{
                marginBottom:10, paddingBottom:10,
                borderBottom: `2px solid ${isHoje ? 'var(--dark)' : 'var(--border)'}`,
              }}>
                <div style={{
                  fontSize:11, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'.08em',
                  color: isHoje ? 'var(--tx)' : 'var(--ts)',
                }}>
                  {dia.label}
                </div>
              </div>

              {/* Cards */}
              <div style={{
                flex:1, display:'flex', flexDirection:'column', gap:6,
                background: isDragOver ? 'var(--bg2)' : 'transparent',
                borderRadius:10, padding: isDragOver ? 6 : 0,
                transition:'all .15s', minHeight:60,
                outline: isDragOver ? '2px dashed var(--border)' : 'none',
              }}>
                {diaCards.map(card => (
                  <div key={card.id}
                    draggable
                    onDragStart={() => setDrag(card.id)}
                    onDragEnd={() => { setDrag(null); setDragDia(null); }}
                    style={{
                      background:'#F7F7F7', borderRadius:10,
                      padding:'10px 10px',
                      border:'none',
                      cursor:'grab',
                      opacity: drag===card.id ? 0.35 : 1,
                      transition:'opacity .12s, box-shadow .12s',
                      boxShadow: drag===card.id ? 'none' : '0 1px 3px rgba(0,0,0,.06)',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow='0 2px 8px rgba(0,0,0,.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow='0 1px 3px rgba(0,0,0,.06)'}>

                    <div style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
                      <span style={{ fontSize:'1.1rem', flexShrink:0, marginTop:1 }}>{card.emoji}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', lineHeight:1.4, wordBreak:'break-word' }}>
                          {card.nome}
                        </div>
                      </div>
                      <button
                        onClick={() => removerCard(card.id)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ts)', fontSize:13, padding:0, flexShrink:0, opacity:0.5, lineHeight:1 }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity='1'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity='0.5'}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {/* Botão adicionar */}
                <button
                  onClick={() => setModal({ dia: dia.id })}
                  style={{
                    display:'flex', alignItems:'center', gap:5, padding:'6px 4px',
                    borderRadius:8, border:'none', background:'transparent',
                    color:'var(--ts)', fontSize:12, cursor:'pointer',
                    fontFamily:'inherit', width:'100%', textAlign:'left',
                    marginTop: diaCards.length > 0 ? 2 : 0,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='var(--tx)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='var(--ts)'}>
                  <span style={{ fontSize:16, fontWeight:300 }}>+</span>
                  <span>Novo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de adicionar */}
      {modal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:9999,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}
          onClick={e => { if (e.target===e.currentTarget) { setModal(null); setShowEmoji(false); } }}>
          <div style={{
            background:'#F7F7F7', borderRadius:16, padding:'1.5rem',
            width:340, boxShadow:'0 20px 60px rgba(0,0,0,.3)',
          }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:'1rem' }}>
              Nova atividade — {DIAS.find(d=>d.id===modal.dia)?.label}
            </div>

            {/* Input com emoji */}
            <div style={{ display:'flex', gap:8, marginBottom:'1rem' }}>
              {/* Botão emoji */}
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                style={{
                  width:44, height:44, borderRadius:10, border:'none',
                  background:'#FFFFFF', cursor:'pointer', fontSize:'1.3rem',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                {novoEmoji}
              </button>
              {/* Input texto */}
              <input
                ref={inputRef}
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') adicionarCard(); if (e.key==='Escape') { setModal(null); setShowEmoji(false); }}}
                placeholder="Meditação, academia, vitamina D..."
                style={{
                  flex:1, padding:'10px 14px', borderRadius:10,
                  border:'none', background:'#FFFFFF',
                  fontSize:13, fontFamily:'inherit', color:'var(--tx)',
                  outline:'none',
                }}
              />
            </div>

            {/* Emoji picker */}
            {showEmoji && (
              <div style={{
                background:'#FFFFFF', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'0.75rem',
                marginBottom:'1rem', border:'none',
              }}>
                <div style={{ fontSize:11, color:'var(--ts)', marginBottom:8, fontWeight:500 }}>Escolha um emoji</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {EMOJIS.map(em => (
                    <button key={em}
                      onClick={() => { setNovoEmoji(em); setShowEmoji(false); }}
                      style={{
                        width:34, height:34, borderRadius:8, border:'none',
                        background: novoEmoji===em ? 'var(--dark)' : 'var(--bg)',
                        cursor:'pointer', fontSize:'1.1rem', display:'flex',
                        alignItems:'center', justifyContent:'center', transition:'all .1s',
                      }}
                      onMouseEnter={e => { if (novoEmoji!==em) (e.currentTarget as HTMLElement).style.background='var(--border)'; }}
                      onMouseLeave={e => { if (novoEmoji!==em) (e.currentTarget as HTMLElement).style.background='var(--bg)'; }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botões */}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={adicionarCard} className="btn btn-d"
                style={{ flex:1, justifyContent:'center', fontSize:13 }}
                disabled={!novoNome.trim()}>
                Adicionar
              </button>
              <button onClick={() => { setModal(null); setShowEmoji(false); }}
                style={{ padding:'10px 16px', borderRadius:10, border:'none', background:'#FFFFFF', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'var(--tm)' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
