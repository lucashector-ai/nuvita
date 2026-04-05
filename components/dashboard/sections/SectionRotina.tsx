// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const DIAS = [
  { id:'seg', label:'Segunda',   num:1 },
  { id:'ter', label:'Terça',     num:2 },
  { id:'qua', label:'Quarta',    num:3 },
  { id:'qui', label:'Quinta',    num:4 },
  { id:'sex', label:'Sexta',     num:5 },
  { id:'sab', label:'Sábado',    num:6 },
  { id:'dom', label:'Domingo',   num:0 },
];

const CATEGORIAS = ['Café da manhã','Manhã','Pré-treino','Pós-treino','Tarde','Noite','A qualquer hora'];

const CAT_COLOR: Record<string,string> = {
  'Café da manhã':'#F59E0B','Manhã':'#3B82F6','Pré-treino':'#10B981',
  'Pós-treino':'#8B5CF6','Tarde':'#F97316','Noite':'#6366F1','A qualquer hora':'#6B7280',
};

function inferirCategoria(timing: string): string {
  const t = (timing||'').toLowerCase();
  if (t.includes('café')||t.includes('cafe')) return 'Café da manhã';
  if (t.includes('jejum')||t.includes('acordar')) return 'Manhã';
  if (t.includes('pré')||t.includes('pre-treino')) return 'Pré-treino';
  if (t.includes('pós')||t.includes('pos-treino')) return 'Pós-treino';
  if (t.includes('tarde')) return 'Tarde';
  if (t.includes('dormir')||t.includes('noite')) return 'Noite';
  return 'Manhã';
}

function inferirDias(freq: string): string[] {
  const f = (freq||'').toLowerCase();
  if (f.includes('diária')||f.includes('todo')) return DIAS.map(d=>d.id);
  if (f.includes('semanal')||f.includes('1x')) return ['seg'];
  if (f.includes('2x')) return ['seg','qui'];
  if (f.includes('3x')) return ['seg','qua','sex'];
  if (f.includes('5x')||f.includes('5-6x')||f.includes('6x')) return ['seg','ter','qua','qui','sex'];
  return DIAS.map(d=>d.id);
}

type Card = {
  id: string;
  nome: string;
  emoji: string;
  categoria: string;
  dose: string;
  via: string;
  dias: string[]; // quais dias aparecem
  custom: boolean;
};

interface Props { answers: any; userId: string; }

export default function SectionRotina({ answers, userId }: Props) {
  const [cards,    setCards]    = useState<Card[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo,    setSalvo]    = useState(false);
  // Novo card
  const [addDia,   setAddDia]   = useState<string|null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [novaCat,  setNovaCat]  = useState('Manhã');
  const [novaDose, setNovaDose] = useState('');
  const [novaVia,  setNovaVia]  = useState('SC');
  const [novoEmoji,setNovoEmoji]= useState('💊');
  // Drag
  const [drag,     setDrag]     = useState<string|null>(null);
  const [dragDia,  setDragDia]  = useState<string|null>(null);
  const [view,     setView]     = useState<'semana'|'categoria'>('semana');

  useEffect(() => { if (userId) carregar(); }, [userId]);

  const carregar = async () => {
    setLoading(true);
    const { data: r } = await supabase.from('rotina_personalizada').select('itens').eq('user_id', userId).maybeSingle();
    if (r?.itens?.length > 0) { setCards(r.itens); setLoading(false); return; }

    // Gera do protocolo
    const { data: u } = await supabase.from('usuarios').select('diagnostico').eq('id', userId).single();
    let peps: any[] = [];
    try { const p = JSON.parse(u?.diagnostico?._protocoloIA||'{}'); peps = p.peptideos||[]; } catch {}

    const defaults: Card[] = peps.map((p:any,i:number) => ({
      id:`p${i}`, nome:p.nome, emoji:p.emoji||'💊',
      categoria:inferirCategoria(p.timing||''),
      dose:p.dose_calculada||`${p.dose_min||''}${p.unidade||'mcg'}`,
      via:p.via||'SC',
      dias:inferirDias(p.frequencia||''),
      custom:false,
    }));
    setCards(defaults);
    setLoading(false);
  };

  const salvar = async (novos?: Card[]) => {
    setSalvando(true);
    await supabase.from('rotina_personalizada').upsert({ user_id:userId, itens:novos||cards, updated_at:new Date().toISOString() });
    setSalvando(false); setSalvo(true);
    setTimeout(()=>setSalvo(false), 2000);
  };

  const adicionarCard = (diaId: string) => {
    if (!novoNome.trim()) { setAddDia(null); return; }
    const novo: Card = {
      id:`c${Date.now()}`, nome:novoNome.trim(), emoji:novoEmoji,
      categoria:novaCat, dose:novaDose, via:novaVia,
      dias:[diaId], custom:true,
    };
    const novos = [...cards, novo];
    setCards(novos); salvar(novos);
    setNovoNome(''); setNovaDose(''); setNovaCat('Manhã'); setNovoEmoji('💊');
    setAddDia(null);
  };

  const removerCard = (id: string) => {
    const novos = cards.filter(c=>c.id!==id);
    setCards(novos); salvar(novos);
  };

  const toggleDia = (cardId: string, diaId: string) => {
    const novos = cards.map(c => {
      if (c.id!==cardId) return c;
      const dias = c.dias.includes(diaId) ? c.dias.filter(d=>d!==diaId) : [...c.dias, diaId];
      return {...c, dias};
    });
    setCards(novos); salvar(novos);
  };

  // Quantos cards por dia
  const countDia = (diaId: string) => cards.filter(c=>c.dias.includes(diaId)).length;
  const hoje = new Date().getDay(); // 0=dom, 1=seg...

  if (loading) return <div style={{padding:'3rem',textAlign:'center',color:'var(--ts)',fontSize:13}}>Carregando rotina...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.2rem' }}>Rotina semanal</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>{cards.length} atividades · clique no dia para ativar/desativar</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ display:'flex', background:'var(--bg2)', borderRadius:8, padding:3, gap:2 }}>
            {[['semana','Por dia'],['categoria','Por categoria']].map(([v,l]) => (
              <button key={v} onClick={()=>setView(v as any)}
                style={{ padding:'4px 10px', borderRadius:5, border:'none', fontSize:12, cursor:'pointer', fontFamily:'inherit',
                  background:view===v?'var(--bg)':'transparent', color:view===v?'var(--tx)':'var(--ts)', fontWeight:view===v?500:400 }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={()=>salvar()} disabled={salvando} className="btn btn-d" style={{fontSize:12}}>
            {salvando?'Salvando...':salvo?'✓ Salvo':'Salvar'}
          </button>
        </div>
      </div>

      {view === 'semana' ? (
        /* ═══ VIEW POR DIA — estilo Notion Board ═══ */
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, overflowX:'auto', minWidth:0 }}>
          {DIAS.map(dia => {
            const diaCards = cards.filter(c=>c.dias.includes(dia.id));
            const isHoje   = dia.num === hoje;

            return (
              <div key={dia.id}
                onDragOver={e=>{ e.preventDefault(); setDragDia(dia.id); }}
                onDrop={()=>{
                  if (drag) {
                    const novos = cards.map(c=>c.id===drag ? {...c, dias:Array.from(new Set([...c.dias, dia.id]))} : c);
                    setCards(novos); salvar(novos);
                  }
                  setDrag(null); setDragDia(null);
                }}
                onDragLeave={()=>setDragDia(null)}
                style={{ minWidth:0 }}>

                {/* Cabeçalho da coluna */}
                <div style={{
                  padding:'8px 6px', marginBottom:8,
                  borderBottom:`2px solid ${isHoje?'var(--dark)':'var(--border)'}`,
                }}>
                  <div style={{ fontSize:11, fontWeight:700, color:isHoje?'var(--tx)':'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                    {dia.label}
                  </div>
                  <div style={{ fontSize:18, fontWeight:700, color:isHoje?'var(--tx)':'var(--ts)', marginTop:2 }}>
                    {countDia(dia.id)}
                  </div>
                </div>

                {/* Cards do dia */}
                <div style={{ display:'flex', flexDirection:'column', gap:6, minHeight:120,
                  background:dragDia===dia.id?'var(--bg2)':'transparent',
                  borderRadius:8, padding:dragDia===dia.id?4:0, transition:'all .1s' }}>

                  {/* Agrupa por categoria */}
                  {CATEGORIAS.filter(cat=>diaCards.some(c=>c.categoria===cat)).map(cat => (
                    <div key={cat}>
                      <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em',
                        color:CAT_COLOR[cat]||'var(--ts)', marginBottom:3, paddingLeft:2 }}>
                        {cat}
                      </div>
                      {diaCards.filter(c=>c.categoria===cat).map(card => (
                        <div key={card.id}
                          draggable
                          onDragStart={()=>setDrag(card.id)}
                          onDragEnd={()=>{ setDrag(null); setDragDia(null); }}
                          style={{
                            background:'var(--bg)', borderRadius:8, padding:'8px 10px',
                            border:`1px solid var(--border)`,
                            borderLeft:`3px solid ${CAT_COLOR[card.categoria]||'var(--border)'}`,
                            cursor:'grab', opacity:drag===card.id?0.4:1,
                            marginBottom:4, transition:'opacity .1s',
                          }}>
                          <div style={{ display:'flex', gap:6, alignItems:'flex-start' }}>
                            <span style={{fontSize:'1rem',flexShrink:0}}>{card.emoji}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:11, fontWeight:600, color:'var(--tx)', lineHeight:1.3,
                                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {card.nome}
                              </div>
                              {card.dose && <div style={{ fontSize:9, color:'var(--ts)', marginTop:2 }}>{card.dose} · {card.via}</div>}
                            </div>
                            {card.custom && (
                              <button onClick={()=>removerCard(card.id)}
                                style={{ fontSize:10, color:'var(--ts)', background:'none', border:'none', cursor:'pointer', padding:0, flexShrink:0 }}>×</button>
                            )}
                          </div>
                          {/* Toggle dias */}
                          <div style={{ display:'flex', gap:2, marginTop:6, flexWrap:'wrap' }}>
                            {DIAS.map(d=>(
                              <div key={d.id}
                                onClick={()=>toggleDia(card.id, d.id)}
                                title={d.label}
                                style={{
                                  width:14, height:14, borderRadius:3, cursor:'pointer', fontSize:7, fontWeight:700,
                                  display:'flex', alignItems:'center', justifyContent:'center',
                                  background:card.dias.includes(d.id)?'var(--dark)':'var(--bg2)',
                                  color:card.dias.includes(d.id)?'white':'var(--ts)',
                                  border:`1px solid ${card.dias.includes(d.id)?'var(--dark)':'var(--border)'}`,
                                  transition:'all .1s',
                                }}>
                                {d.label[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Botão Nova atividade */}
                  {addDia === dia.id ? (
                    <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'10px', marginTop:4 }}>
                      <div style={{ display:'flex', gap:4, marginBottom:6 }}>
                        <input value={novoEmoji} onChange={e=>setNovoEmoji(e.target.value)}
                          style={{ width:30, padding:'3px', borderRadius:5, border:'1px solid var(--border)', background:'var(--bg2)', fontSize:13, textAlign:'center', fontFamily:'inherit' }}/>
                        <input autoFocus value={novoNome} onChange={e=>setNovoNome(e.target.value)}
                          onKeyDown={e=>{ if(e.key==='Enter') adicionarCard(dia.id); if(e.key==='Escape') setAddDia(null); }}
                          placeholder="Nome..."
                          style={{ flex:1, padding:'3px 6px', borderRadius:5, border:'1px solid var(--border)', background:'var(--bg2)', fontSize:11, fontFamily:'inherit', color:'var(--tx)' }}/>
                      </div>
                      <div style={{ display:'flex', gap:4, marginBottom:6 }}>
                        <input value={novaDose} onChange={e=>setNovaDose(e.target.value)}
                          placeholder="Dose" style={{ flex:1, padding:'3px 6px', borderRadius:5, border:'1px solid var(--border)', background:'var(--bg2)', fontSize:11, fontFamily:'inherit', color:'var(--tx)' }}/>
                        <select value={novaCat} onChange={e=>setNovaCat(e.target.value)}
                          style={{ flex:1, padding:'3px', borderRadius:5, border:'1px solid var(--border)', background:'var(--bg2)', fontSize:10, fontFamily:'inherit', color:'var(--tx)' }}>
                          {CATEGORIAS.map(c=><option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={()=>adicionarCard(dia.id)}
                          style={{ flex:1, padding:'4px', borderRadius:5, border:'none', background:'var(--dark)', color:'white', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>
                          Adicionar
                        </button>
                        <button onClick={()=>setAddDia(null)}
                          style={{ padding:'4px 8px', borderRadius:5, border:'1px solid var(--border)', background:'var(--bg2)', fontSize:11, cursor:'pointer', fontFamily:'inherit', color:'var(--tm)' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={()=>setAddDia(dia.id)}
                      style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 6px', borderRadius:6,
                        border:'none', background:'transparent', color:'var(--ts)', fontSize:11,
                        cursor:'pointer', fontFamily:'inherit', width:'100%', textAlign:'left', marginTop:2 }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg2)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <span style={{fontSize:14}}>+</span> Nova atividade
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ═══ VIEW POR CATEGORIA ═══ */
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {CATEGORIAS.filter(cat=>cards.some(c=>c.categoria===cat)).map(cat => (
            <div key={cat}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:CAT_COLOR[cat]||'var(--ts)' }}/>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>{cat}</span>
                <span style={{ fontSize:11, color:'var(--ts)' }}>{cards.filter(c=>c.categoria===cat).length} atividades</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, paddingLeft:18 }}>
                {cards.filter(c=>c.categoria===cat).map(card=>(
                  <div key={card.id} style={{ background:'var(--bg2)', borderRadius:10, padding:'10px 14px',
                    border:'1px solid var(--border)', borderLeft:`3px solid ${CAT_COLOR[card.categoria]||'var(--border)'}` }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <span style={{fontSize:'1.1rem'}}>{card.emoji}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500}}>{card.nome}</div>
                        {card.dose && <div style={{fontSize:11,color:'var(--ts)'}}>{card.dose} · {card.via}</div>}
                      </div>
                      <div style={{display:'flex',gap:3}}>
                        {DIAS.map(d=>(
                          <div key={d.id} onClick={()=>toggleDia(card.id,d.id)}
                            title={d.label}
                            style={{ width:20, height:20, borderRadius:4, cursor:'pointer', fontSize:9, fontWeight:700,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              background:card.dias.includes(d.id)?'var(--dark)':'var(--bg)',
                              color:card.dias.includes(d.id)?'white':'var(--ts)',
                              border:`1px solid ${card.dias.includes(d.id)?'var(--dark)':'var(--border)'}`,
                            }}>
                            {d.label[0]}
                          </div>
                        ))}
                      </div>
                      {card.custom && (
                        <button onClick={()=>removerCard(card.id)}
                          style={{background:'none',border:'none',color:'var(--ts)',cursor:'pointer',fontSize:14}}>×</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {cards.length===0 && (
            <div style={{textAlign:'center',padding:'3rem',color:'var(--ts)',fontSize:13}}>
              <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📋</div>
              Gere seu protocolo ou adicione atividades manualmente em cada dia.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
