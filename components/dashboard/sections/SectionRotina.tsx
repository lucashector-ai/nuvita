// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const HORARIOS = [
  'Ao acordar','Manhã em jejum','Café da manhã','Pré-treino',
  'Pós-treino','Almoço','Tarde','Jantar','Antes de dormir','Madrugada'
];

type Item = { id: string; nome: string; emoji: string; horario: string; dose: string; via: string };

export default function SectionRotina() {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [drag, setDrag] = useState<string|null>(null);
  const [dragOver, setDragOver] = useState<string|null>(null);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: u }, { data: r }] = await Promise.all([
      supabase.from('usuarios').select('protocolo_gerado').eq('id', user.id).single(),
      supabase.from('rotina_personalizada').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    if (r?.itens) {
      setItens(r.itens);
    } else if (u?.protocolo_gerado?.peptideos) {
      // Gera rotina padrão a partir do protocolo
      const defaults = u.protocolo_gerado.peptideos.map((p: any, i: number) => ({
        id: `p${i}`,
        nome: p.nome,
        emoji: p.emoji || '💊',
        horario: p.timing?.split(',')[0]?.trim() || 'Manhã em jejum',
        dose: p.dose_calculada || `${p.dose_min || ''}${p.unidade || 'mcg'}`,
        via: p.via || 'SC',
      }));
      setItens(defaults);
    }
    setLoading(false);
  };

  const salvar = async () => {
    setSalvando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('rotina_personalizada').upsert({ user_id: user.id, itens, updated_at: new Date().toISOString() });
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  const moverHorario = (id: string, horario: string) => {
    setItens(prev => prev.map(it => it.id === id ? { ...it, horario } : it));
  };

  const onDragStart = (id: string) => setDrag(id);
  const onDragEnd = () => { setDrag(null); setDragOver(null); };
  const onDrop = (targetHorario: string) => {
    if (!drag) return;
    moverHorario(drag, targetHorario);
    setDrag(null);
    setDragOver(null);
  };

  // Agrupa por horário
  const grupos = HORARIOS.map(h => ({
    horario: h,
    itens: itens.filter(it => it.horario === h),
  })).filter(g => g.itens.length > 0 || ['Ao acordar','Manhã em jejum','Pré-treino','Antes de dormir'].includes(g.horario));

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando rotina...</div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Rotina diária</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>Arraste os peptídeos para reorganizar os horários</p>
        </div>
        <button onClick={salvar} disabled={salvando}
          className="btn btn-d" style={{ fontSize:12 }}>
          {salvando ? 'Salvando...' : salvo ? '✓ Salvo' : 'Salvar rotina'}
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {grupos.map(g => (
          <div key={g.horario}
            onDragOver={e => { e.preventDefault(); setDragOver(g.horario); }}
            onDrop={() => onDrop(g.horario)}
            onDragLeave={() => setDragOver(null)}
            style={{
              borderRadius:14,
              border:`2px dashed ${dragOver === g.horario ? 'var(--dark)' : 'var(--border)'}`,
              background: dragOver === g.horario ? 'var(--bg2)' : 'var(--bg)',
              padding:'1rem', transition:'all .15s',
            }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom: g.itens.length ? '0.75rem' : 0 }}>
              {g.horario}
            </div>
            {g.itens.length === 0 && (
              <div style={{ fontSize:12, color:'var(--ts)', opacity:0.5, fontStyle:'italic' }}>
                Arraste um peptídeo aqui
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {g.itens.map(it => (
                <div key={it.id}
                  draggable
                  onDragStart={() => onDragStart(it.id)}
                  onDragEnd={onDragEnd}
                  style={{
                    display:'flex', alignItems:'center', gap:12,
                    background:'var(--bg2)', borderRadius:10, padding:'10px 14px',
                    cursor:'grab', opacity: drag === it.id ? 0.4 : 1,
                    border:'1px solid var(--border)', transition:'opacity .15s',
                  }}>
                  <span style={{ fontSize:18, userSelect:'none' }}>⠿</span>
                  <span style={{ fontSize:'1.2rem' }}>{it.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500 }}>{it.nome}</div>
                    <div style={{ fontSize:11, color:'var(--ts)' }}>{it.dose} · {it.via}</div>
                  </div>
                  {/* Selector rápido de horário */}
                  <select
                    value={it.horario}
                    onChange={e => moverHorario(it.id, e.target.value)}
                    style={{ fontSize:11, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 6px', color:'var(--tm)', cursor:'pointer', fontFamily:'inherit' }}
                    onClick={e => e.stopPropagation()}>
                    {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {itens.length === 0 && (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13 }}>
          <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>📋</div>
          <div>Nenhum protocolo ativo. Gere seu protocolo primeiro.</div>
        </div>
      )}
    </div>
  );
}
