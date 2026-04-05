// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const HORARIOS = ['Ao acordar','Manhã em jejum','Café da manhã','Pré-treino','Pós-treino','Tarde','Jantar','Antes de dormir'];

interface Props { answers: any; userId: string; }

export default function SectionRotina({ answers, userId }: Props) {
  const [itens,     setItens]    = useState<any[]>([]);
  const [loading,   setLoading]  = useState(true);
  const [salvando,  setSalvando] = useState(false);
  const [salvo,     setSalvo]    = useState(false);
  const [drag,      setDrag]     = useState<string|null>(null);
  const [dragOver,  setDragOver] = useState<string|null>(null);

  useEffect(() => { if (userId) carregar(); }, [userId]);

  const carregar = async () => {
    setLoading(true);
    // Tenta carregar rotina salva
    const { data: r } = await supabase.from('rotina_personalizada').select('itens').eq('user_id', userId).maybeSingle();
    if (r?.itens?.length > 0) {
      setItens(r.itens);
      setLoading(false);
      return;
    }
    // Cria rotina padrão do protocolo IA
    const { data: u } = await supabase.from('usuarios').select('diagnostico').eq('id', userId).single();
    let peps: any[] = [];
    try {
      const proto = JSON.parse(u?.diagnostico?._protocoloIA || '{}');
      peps = proto.peptideos || [];
    } catch {}
    const defaults = peps.map((p: any, i: number) => ({
      id: `p${i}`,
      nome: p.nome,
      emoji: p.emoji || '💊',
      horario: inferirHorario(p.timing || p.frequencia || ''),
      dose: p.dose_calculada || `${p.dose_min||''}${p.unidade||'mcg'}`,
      via: p.via || 'SC',
    }));
    setItens(defaults);
    setLoading(false);
  };

  const inferirHorario = (timing: string) => {
    const t = timing.toLowerCase();
    if (t.includes('acordar')) return 'Ao acordar';
    if (t.includes('jejum')) return 'Manhã em jejum';
    if (t.includes('café') || t.includes('manha') || t.includes('manhã')) return 'Café da manhã';
    if (t.includes('pré-treino') || t.includes('pre-treino') || t.includes('treino')) return 'Pré-treino';
    if (t.includes('pós') || t.includes('pos-treino')) return 'Pós-treino';
    if (t.includes('dormir') || t.includes('noite')) return 'Antes de dormir';
    return 'Manhã em jejum';
  };

  const salvar = async () => {
    setSalvando(true);
    await supabase.from('rotina_personalizada').upsert({ user_id: userId, itens, updated_at: new Date().toISOString() });
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  const moverHorario = (id: string, horario: string) =>
    setItens(prev => prev.map(it => it.id === id ? { ...it, horario } : it));

  const onDragStart = (id: string) => setDrag(id);
  const onDragEnd   = () => { setDrag(null); setDragOver(null); };
  const onDrop      = (h: string) => { if (drag) moverHorario(drag, h); setDrag(null); setDragOver(null); };

  const grupos = HORARIOS.map(h => ({ horario: h, itens: itens.filter(it => it.horario === h) }));

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando rotina...</div>;

  if (itens.length === 0) return (
    <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)' }}>
      <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>📋</div>
      <div style={{ fontSize:13 }}>Gere seu protocolo para montar sua rotina de aplicações.</div>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.2rem' }}>Rotina diária</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>Arraste os peptídeos entre os horários para personalizar</p>
        </div>
        <button onClick={salvar} disabled={salvando} className="btn btn-d" style={{ fontSize:12 }}>
          {salvando ? 'Salvando...' : salvo ? '✓ Salvo' : 'Salvar rotina'}
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {grupos.map(g => (
          <div key={g.horario}
            onDragOver={e => { e.preventDefault(); setDragOver(g.horario); }}
            onDrop={() => onDrop(g.horario)}
            onDragLeave={() => setDragOver(null)}
            style={{
              borderRadius:14, padding:'1rem',
              border:`2px ${dragOver===g.horario?'solid var(--dark)':'dashed var(--border)'}`,
              background: dragOver===g.horario ? 'var(--bg2)' : g.itens.length ? 'var(--bg)' : 'transparent',
              transition:'all .12s',
            }}>
            {/* Título do horário */}
            <div style={{ fontSize:12, fontWeight:700, color:'var(--tm)', marginBottom: g.itens.length ? 10 : 0, display:'flex', alignItems:'center', gap:6 }}>
              <span>{['Ao acordar','Manhã em jejum','Café da manhã'].includes(g.horario) ? '🌅' : ['Pré-treino','Pós-treino'].includes(g.horario) ? '🏋️' : g.horario==='Antes de dormir' ? '🌙' : '☀️'}</span>
              {g.horario}
              {g.itens.length > 0 && (
                <span style={{ fontSize:10, color:'var(--ts)', fontWeight:400, marginLeft:'auto' }}>
                  {g.itens.length} peptídeo{g.itens.length>1?'s':''}
                </span>
              )}
            </div>

            {g.itens.length === 0 && (
              <div style={{ fontSize:12, color:'var(--ts)', opacity:0.5, fontStyle:'italic', paddingTop:4 }}>
                Arraste um peptídeo aqui
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {g.itens.map(it => (
                <div key={it.id}
                  draggable
                  onDragStart={() => onDragStart(it.id)}
                  onDragEnd={onDragEnd}
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    background:'var(--bg2)', borderRadius:10, padding:'10px 12px',
                    cursor:'grab', opacity:drag===it.id ? 0.35 : 1,
                    border:'1px solid var(--border)', transition:'opacity .15s',
                    userSelect:'none',
                  }}>
                  <span style={{ fontSize:14, color:'var(--ts)' }}>⠿</span>
                  <span style={{ fontSize:'1.2rem' }}>{it.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500 }}>{it.nome}</div>
                    <div style={{ fontSize:11, color:'var(--ts)' }}>{it.dose} · {it.via}</div>
                  </div>
                  <select
                    value={it.horario}
                    onChange={e => moverHorario(it.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize:11, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 6px', color:'var(--tm)', cursor:'pointer', fontFamily:'inherit', maxWidth:130 }}>
                    {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
