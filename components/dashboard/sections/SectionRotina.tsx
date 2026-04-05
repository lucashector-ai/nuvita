// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const SECOES = [
  { id:'manha',   label:'🌅  Manhã',         sub:'Ao acordar e em jejum' },
  { id:'treino',  label:'🏋️  Treino',         sub:'Pré e pós-treino' },
  { id:'tarde',   label:'☀️  Tarde',           sub:'Período da tarde' },
  { id:'noite',   label:'🌙  Noite',           sub:'Antes de dormir' },
  { id:'outro',   label:'🕐  A qualquer hora', sub:'Sem horário fixo' },
];

type Item = {
  id: string;
  nome: string;
  emoji: string;
  secao: string;
  dose: string;
  via: string;
  feito: boolean;
  nota: string;
  custom: boolean; // item adicionado manualmente
};

function inferirSecao(timing: string): string {
  const t = timing.toLowerCase();
  if (t.includes('acordar')||t.includes('jejum')||t.includes('manhã')||t.includes('manha')) return 'manha';
  if (t.includes('pré')||t.includes('pre')||t.includes('treino')||t.includes('pós')||t.includes('pos')) return 'treino';
  if (t.includes('tarde')) return 'tarde';
  if (t.includes('dormir')||t.includes('noite')) return 'noite';
  return 'outro';
}

interface Props { answers: any; userId: string; }

export default function SectionRotina({ answers, userId }: Props) {
  const [itens,    setItens]    = useState<Item[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo,    setSalvo]    = useState(false);
  const [drag,     setDrag]     = useState<string|null>(null);
  const [dragOver, setDragOver] = useState<string|null>(null);
  const [editando, setEditando] = useState<string|null>(null);
  // Adicionar novo item
  const [adicionando, setAdicionando] = useState<string|null>(null); // secao id
  const [novoNome,    setNovoNome]    = useState('');
  const [novaDose,    setNovaDose]    = useState('');
  const [novaVia,     setNovaVia]     = useState('SC');
  const [novoEmoji,   setNovoEmoji]   = useState('💊');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (userId) carregar(); }, [userId]);
  useEffect(() => { if (adicionando) setTimeout(() => inputRef.current?.focus(), 50); }, [adicionando]);

  const carregar = async () => {
    setLoading(true);
    const { data: r } = await supabase.from('rotina_personalizada').select('itens').eq('user_id', userId).maybeSingle();
    if (r?.itens?.length > 0) { setItens(r.itens); setLoading(false); return; }

    // Monta rotina do protocolo
    const { data: u } = await supabase.from('usuarios').select('diagnostico').eq('id', userId).single();
    let peps: any[] = [];
    try { const p = JSON.parse(u?.diagnostico?._protocoloIA||'{}'); peps = p.peptideos||[]; } catch {}
    const defaults: Item[] = peps.map((p:any, i:number) => ({
      id:`p${i}`, nome:p.nome, emoji:p.emoji||'💊',
      secao:inferirSecao(p.timing||p.frequencia||''),
      dose:p.dose_calculada||`${p.dose_min||''}${p.unidade||'mcg'}`,
      via:p.via||'SC', feito:false, nota:'', custom:false,
    }));
    setItens(defaults);
    setLoading(false);
  };

  const salvar = async (novosItens?: Item[]) => {
    setSalvando(true);
    const dados = novosItens || itens;
    await supabase.from('rotina_personalizada').upsert({ user_id:userId, itens:dados, updated_at:new Date().toISOString() });
    setSalvando(false); setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  const toggleFeito = (id: string) => {
    const novos = itens.map(it => it.id===id ? {...it, feito:!it.feito} : it);
    setItens(novos); salvar(novos);
  };

  const removerItem = (id: string) => {
    const novos = itens.filter(it => it.id!==id);
    setItens(novos); salvar(novos);
  };

  const adicionarItem = (secaoId: string) => {
    if (!novoNome.trim()) { setAdicionando(null); return; }
    const novo: Item = {
      id:`custom-${Date.now()}`, nome:novoNome.trim(), emoji:novoEmoji,
      secao:secaoId, dose:novaDose, via:novaVia, feito:false, nota:'', custom:true,
    };
    const novos = [...itens, novo];
    setItens(novos); salvar(novos);
    setNovoNome(''); setNovaDose(''); setNovaVia('SC'); setNovoEmoji('💊');
    setAdicionando(null);
  };

  const moverSecao = (id: string, secao: string) => {
    const novos = itens.map(it => it.id===id ? {...it, secao} : it);
    setItens(novos);
  };

  // Drag and drop
  const onDragStart = (id: string) => setDrag(id);
  const onDragEnd   = () => { setDrag(null); setDragOver(null); };
  const onDrop      = (secaoId: string) => {
    if (!drag) return;
    moverSecao(drag, secaoId);
    setDrag(null); setDragOver(null);
    setTimeout(() => salvar(), 100);
  };

  const resetarDia = () => {
    const novos = itens.map(it => ({...it, feito:false}));
    setItens(novos); salvar(novos);
  };

  const totalFeito = itens.filter(it => it.feito).length;
  const pct = itens.length > 0 ? Math.round((totalFeito/itens.length)*100) : 0;

  if (loading) return <div style={{padding:'3rem',textAlign:'center',color:'var(--ts)',fontSize:13}}>Carregando rotina...</div>;

  return (
    <div style={{ maxWidth:700 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.2rem' }}>Rotina diária</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>
            {totalFeito}/{itens.length} concluídos · Arraste para reorganizar
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={resetarDia} style={{ fontSize:12, padding:'6px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', fontFamily:'inherit', color:'var(--tm)' }}>
            Resetar dia
          </button>
          <button onClick={() => salvar()} disabled={salvando} className="btn btn-d" style={{ fontSize:12 }}>
            {salvando?'Salvando...':salvo?'✓ Salvo':'Salvar'}
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      {itens.length > 0 && (
        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ts)', marginBottom:4 }}>
            <span>Progresso de hoje</span>
            <span style={{ fontWeight:600, color: pct===100?'var(--gm)':'var(--tx)' }}>{pct}%</span>
          </div>
          <div style={{ height:4, background:'var(--border)', borderRadius:100, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:pct===100?'var(--green)':'var(--dark)', borderRadius:100, transition:'width .4s ease' }}/>
          </div>
        </div>
      )}

      {/* Seções */}
      {SECOES.map(sec => {
        const itensSecao = itens.filter(it => it.secao===sec.id);
        const isDragOver = dragOver===sec.id;

        return (
          <div key={sec.id}
            onDragOver={e => { e.preventDefault(); setDragOver(sec.id); }}
            onDrop={() => onDrop(sec.id)}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
            style={{ marginBottom:8 }}>

            {/* Título da seção */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'6px 8px', borderRadius:8,
              background: isDragOver ? 'var(--bg2)' : 'transparent',
              border: isDragOver ? '1.5px dashed var(--dark)' : '1.5px solid transparent',
              transition:'all .12s',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>{sec.label}</span>
                <span style={{ fontSize:11, color:'var(--ts)' }}>{sec.sub}</span>
                {itensSecao.length > 0 && (
                  <span style={{ fontSize:10, color:'var(--ts)', background:'var(--bg2)', padding:'1px 7px', borderRadius:100, border:'1px solid var(--border)' }}>
                    {itensSecao.filter(it=>it.feito).length}/{itensSecao.length}
                  </span>
                )}
              </div>
              {isDragOver && <span style={{ fontSize:11, color:'var(--dark)' }}>Soltar aqui</span>}
            </div>

            {/* Itens da seção */}
            <div style={{ paddingLeft:16 }}>
              {itensSecao.map(it => (
                <div key={it.id}
                  draggable
                  onDragStart={() => onDragStart(it.id)}
                  onDragEnd={onDragEnd}
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'7px 8px', borderRadius:8,
                    background:drag===it.id?'var(--bg2)':'transparent',
                    opacity:drag===it.id?0.4:1,
                    transition:'all .1s',
                    cursor:'default',
                    borderBottom:'1px solid var(--border)',
                  }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg2)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=drag===it.id?'var(--bg2)':'transparent'}>

                  {/* Drag handle */}
                  <span style={{ fontSize:12, color:'var(--ts)', cursor:'grab', flexShrink:0, opacity:0.5 }}>⠿</span>

                  {/* Checkbox */}
                  <div onClick={() => toggleFeito(it.id)}
                    style={{
                      width:18, height:18, borderRadius:4, flexShrink:0, cursor:'pointer',
                      border:`1.5px solid ${it.feito?'var(--green)':'var(--border)'}`,
                      background:it.feito?'var(--green)':'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all .1s',
                    }}>
                    {it.feito && <span style={{fontSize:10,color:'white',lineHeight:1}}>✓</span>}
                  </div>

                  {/* Emoji */}
                  <span style={{ fontSize:'1rem', flexShrink:0 }}>{it.emoji}</span>

                  {/* Nome */}
                  <div style={{ flex:1 }}>
                    <span style={{
                      fontSize:13, color:it.feito?'var(--ts)':'var(--tx)',
                      textDecoration:it.feito?'line-through':'none',
                      transition:'color .1s',
                    }}>{it.nome}</span>
                    {it.dose && (
                      <span style={{ fontSize:11, color:'var(--ts)', marginLeft:8 }}>
                        {it.dose} · {it.via}
                      </span>
                    )}
                  </div>

                  {/* Actions ao hover */}
                  <div style={{ display:'flex', gap:4, opacity:0.6 }}>
                    {/* Mover para outra seção */}
                    <select
                      value={it.secao}
                      onChange={e => { moverSecao(it.id, e.target.value); setTimeout(()=>salvar(),100); }}
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize:10, background:'transparent', border:'none', color:'var(--ts)', cursor:'pointer', fontFamily:'inherit' }}>
                      {SECOES.map(s => <option key={s.id} value={s.id}>{s.label.split('  ')[1]}</option>)}
                    </select>
                    {/* Remover (só custom) */}
                    {it.custom && (
                      <button onClick={() => removerItem(it.id)}
                        style={{ fontSize:12, background:'none', border:'none', color:'var(--ts)', cursor:'pointer', padding:'0 4px' }}>
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Formulário de novo item */}
              {adicionando === sec.id ? (
                <div style={{ display:'flex', gap:8, padding:'8px', background:'var(--bg2)', borderRadius:8, marginTop:4, border:'1px solid var(--border)', alignItems:'flex-start', flexWrap:'wrap' }}>
                  <input value={novoEmoji} onChange={e=>setNovoEmoji(e.target.value)}
                    style={{ width:36, padding:'5px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg)', fontSize:14, textAlign:'center', fontFamily:'inherit' }}/>
                  <input ref={inputRef} value={novoNome} onChange={e=>setNovoNome(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter') adicionarItem(sec.id); if(e.key==='Escape') setAdicionando(null); }}
                    placeholder="Nome do peptídeo ou atividade..."
                    style={{ flex:1, minWidth:150, padding:'5px 10px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg)', fontSize:13, fontFamily:'inherit', color:'var(--tx)' }}/>
                  <input value={novaDose} onChange={e=>setNovaDose(e.target.value)}
                    placeholder="Dose (ex: 500mcg)"
                    style={{ width:110, padding:'5px 10px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg)', fontSize:12, fontFamily:'inherit', color:'var(--tx)' }}/>
                  <select value={novaVia} onChange={e=>setNovaVia(e.target.value)}
                    style={{ padding:'5px 8px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg)', fontSize:12, fontFamily:'inherit', color:'var(--tx)' }}>
                    {['SC','IM','IV','Oral','Tópico'].map(v=><option key={v}>{v}</option>)}
                  </select>
                  <button onClick={() => adicionarItem(sec.id)} className="btn btn-d" style={{ fontSize:12, padding:'5px 14px' }}>Adicionar</button>
                  <button onClick={() => setAdicionando(null)} style={{ fontSize:12, padding:'5px 10px', background:'none', border:'none', color:'var(--ts)', cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
                </div>
              ) : (
                /* Botão + adicionar */
                <button
                  onClick={() => setAdicionando(sec.id)}
                  style={{
                    display:'flex', alignItems:'center', gap:6, padding:'6px 8px',
                    borderRadius:8, border:'none', background:'transparent',
                    color:'var(--ts)', fontSize:12, cursor:'pointer', fontFamily:'inherit',
                    marginTop:2, width:'100%', textAlign:'left',
                  }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg2)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <span style={{ fontSize:14, fontWeight:400, color:'var(--ts)' }}>+</span>
                  Adicionar item
                </button>
              )}
            </div>
          </div>
        );
      })}

      {itens.length === 0 && !SECOES.some(s => adicionando===s.id) && (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)' }}>
          <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>📋</div>
          <div style={{ fontSize:13, marginBottom:'1rem' }}>Nenhuma rotina configurada ainda.</div>
          <div style={{ fontSize:12 }}>Clique em "+ Adicionar item" em qualquer seção para começar.</div>
        </div>
      )}
    </div>
  );
}
