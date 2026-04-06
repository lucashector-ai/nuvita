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
  const [cards,    setCards]    = useState<Card[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState<{ dia:string }|null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmoji,setNovoEmoji]= useState('💊');
  const [showEmoji,setShowEmoji]= useState(false);
  const [drag,     setDrag]     = useState<string|null>(null);
  const [dragDia,  setDragDia]  = useState<string|null>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
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

  const autoSalvar = (novos: Card[]) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase.from('rotina_personalizada').upsert({
        user_id: userId, itens: novos, updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }, 800);
  };

  const atualizar = (novos: Card[]) => { setCards(novos); autoSalvar(novos); };

  const adicionarCard = () => {
    if (!novoNome.trim() || !modal) return;
    const novo: Card = { id:`c${Date.now()}`, nome:novoNome.trim(), emoji:novoEmoji, dias:[modal.dia] };
    atualizar([...cards, novo]);
    setNovoNome(''); setNovoEmoji('💊'); setShowEmoji(false); setModal(null);
  };

  const removerCard = (id: string) => { atualizar(cards.filter(c => c.id !== id)); };

  const onDrop = (diaId: string) => {
    if (!drag) return;
    const novos = cards.map(c => c.id === drag ? { ...c, dias:[diaId] } : c);
    atualizar(novos);
    setDrag(null); setDragDia(null);
  };

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday:'long' }).toLowerCase();

  if (loading) return (
    <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>
      Carregando...
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Rotina semanal</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Organize sua rotina por dia da semana · salva automaticamente</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8 }}>
        {DIAS.map(dia => {
          const isDia = dia.id === hoje.slice(0,3);
          const dCards = cards.filter(c => c.dias.includes(dia.id));
          return (
            <div key={dia.id}
              onDragOver={e=>{e.preventDefault();setDragDia(dia.id);}}
              onDrop={()=>onDrop(dia.id)}
              style={{
                background: isDia ? '#FFFFFF' : '#FFFFFF',
                borderRadius:12, padding:'10px 8px', minHeight:180,
                boxShadow: isDia
                  ? '0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04),0 0 0 2px #22C55E'
                  : '0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)',
                border:'none',
                outline: dragDia===dia.id ? '2px dashed var(--green)' : 'none',
              }}>
              <div style={{ fontSize:10, fontWeight:700, color:isDia?'var(--gm)':'var(--ts)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>
                {dia.label.slice(0,3)}
              </div>
              {dCards.map(card => (
                <div key={card.id}
                  draggable
                  onDragStart={()=>{setDrag(card.id);setDragDia(dia.id);}}
                  onDragEnd={()=>{setDrag(null);setDragDia(null);}}
                  style={{ background:'#F7F7F7', borderRadius:8, padding:'6px 8px', marginBottom:4, cursor:'grab', display:'flex', alignItems:'flex-start', gap:6, fontSize:12, position:'relative' }}>
                  <span style={{ fontSize:14 }}>{card.emoji}</span>
                  <span style={{ flex:1, wordBreak:'break-word', whiteSpace:'normal', color:'var(--tx)', lineHeight:1.3, fontSize:11 }}>{card.nome}</span>
                  <button onClick={()=>removerCard(card.id)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ts)', fontSize:14, lineHeight:1, padding:0, flexShrink:0 }}>×</button>
                </div>
              ))}
              <button onClick={()=>setModal({dia:dia.id})}
                style={{ width:'100%', marginTop:4, padding:'5px', borderRadius:7, border:'1.5px dashed var(--border)', background:'transparent', cursor:'pointer', fontSize:11, color:'var(--ts)', fontFamily:'inherit', transition:'all .15s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--green)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}>
                + adicionar
              </button>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
          <div className="modal" style={{ maxWidth:340 }}>
            <h3 style={{ fontSize:14, fontWeight:600, marginBottom:'1rem' }}>
              Adicionar em {DIAS.find(d=>d.id===modal.dia)?.label}
            </h3>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <button onClick={()=>setShowEmoji(!showEmoji)}
                style={{ width:42, height:42, borderRadius:10, background:'#F7F7F7', cursor:'pointer', fontSize:20 }}>
                {novoEmoji}
              </button>
              <input ref={inputRef} className="inp" value={novoNome}
                onChange={e=>setNovoNome(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&adicionarCard()}
                placeholder="Nome da atividade..." style={{ flex:1 }}/>
            </div>
            {showEmoji && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12, maxHeight:120, overflowY:'auto' }}>
                {EMOJIS.map(em=>(
                  <button key={em} onClick={()=>{setNovoEmoji(em);setShowEmoji(false);}}
                    style={{ width:32, height:32, borderRadius:6, border:novoEmoji===em?'2px solid var(--green)':'1px solid var(--border)', background:novoEmoji===em?'var(--gp)':'var(--bg)', cursor:'pointer', fontSize:16 }}>
                    {em}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-d" onClick={adicionarCard} disabled={!novoNome.trim()} style={{ flex:1 }}>
                Adicionar
              </button>
              <button onClick={()=>setModal(null)}
                style={{ padding:'10px 16px', borderRadius:10, background:'#F7F7F7', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
