// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const DIAS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const DIAS_FULL = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];

const TIPO_INFO = {
  peptideo:    { cor:'#1D9E75', bg:'#E1F5EE', label:'Peptídeo'    },
  sono:        { cor:'#7F77DD', bg:'#EEEDFE', label:'Sono'        },
  hidratacao:  { cor:'#378ADD', bg:'#E6F1FB', label:'Hidratação'  },
  alimentacao: { cor:'#EF9F27', bg:'#FAEEDA', label:'Alimentação' },
  exercicio:   { cor:'#D85A30', bg:'#FAECE7', label:'Exercício'   },
  outro:       { cor:'#888780', bg:'var(--bg2)', label:'Outro'    },
};

export default function SectionRotina({ answers, userId }: any) {
  const [diaSel,   setDiaSel]   = useState(DIAS[new Date().getDay() === 0 ? 6 : new Date().getDay()-1]);
  const [rotina,   setRotina]   = useState<Record<string, any[]>>({});
  const [loading,  setLoading]  = useState(true);
  const [loadingIA,setLoadingIA]= useState(false);
  const [modo,     setModo]     = useState<'ver'|'editar'|'adicionar'>('ver');
  const [novoItem, setNovoItem] = useState({ horario:'', acao:'', tipo:'outro' });

  const hoje = DIAS[new Date().getDay() === 0 ? 6 : new Date().getDay()-1];

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase.from('rotina_items').select('*').eq('user_id', userId)
      .then(({ data }) => {
        const agrupado: Record<string, any[]> = {};
        (data || []).forEach(item => {
          if (!agrupado[item.dia_semana]) agrupado[item.dia_semana] = [];
          agrupado[item.dia_semana].push(item);
        });
        setRotina(agrupado);
        setLoading(false);
      });
  }, [userId]);

  const temRotina = Object.keys(rotina).length > 0;
  const diaDia = (rotina[diaSel] || []).sort((a,b)=>a.horario.localeCompare(b.horario));
  const [concluidos, setConcluidos] = useState(new Set<string>());

  const toggleConcluido = (id: string) =>
    setConcluidos(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });

  const gerarComIA = async () => {
    if (!userId) return;
    setLoadingIA(true);
    try {
      const res = await fetch('/api/ia', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          system:`Gere uma rotina semanal complementar ao protocolo. Responda APENAS em JSON: {"Seg":[{"horario":"HH:MM","acao":"descrição","tipo":"peptideo|sono|hidratacao|alimentacao|exercicio|outro"}],...}. Máximo 6 itens por dia, todos os 7 dias.`,
          messages:[{role:'user', content:`Perfil: objetivos=${answers?.q3?.join(',')||'perda de gordura'}, peso=${answers?.peso||75}kg, nível=${answers?.q4||'iniciante'}.`}],
        }),
      });
      const data = await res.json();
      const jsonMatch = (data.text||'').match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const novaRotina = JSON.parse(jsonMatch[0]);
        const inserts: any[] = [];
        Object.entries(novaRotina).forEach(([dia, items]: [string, any]) => {
          (items as any[]).forEach(item => {
            inserts.push({ user_id:userId, dia_semana:dia, horario:item.horario||'08:00', acao:item.acao||'', tipo:item.tipo||'outro' });
          });
        });
        // Deleta rotina antiga e insere nova
        await supabase.from('rotina_items').delete().eq('user_id', userId);
        if (inserts.length > 0) await supabase.from('rotina_items').insert(inserts);
        // Recarrega
        const { data: novaData } = await supabase.from('rotina_items').select('*').eq('user_id', userId);
        const agrupado: Record<string, any[]> = {};
        (novaData || []).forEach(item => {
          if (!agrupado[item.dia_semana]) agrupado[item.dia_semana] = [];
          agrupado[item.dia_semana].push(item);
        });
        setRotina(agrupado);
      }
    } catch(e) { console.error(e); }
    finally { setLoadingIA(false); }
  };

  const adicionarItem = async () => {
    if (!novoItem.horario || !novoItem.acao || !userId) return;
    const { data } = await supabase.from('rotina_items').insert({ user_id:userId, dia_semana:diaSel, ...novoItem }).select().single();
    if (data) {
      setRotina(r => ({ ...r, [diaSel]: [...(r[diaSel]||[]), data].sort((a,b)=>a.horario.localeCompare(b.horario)) }));
      setNovoItem({ horario:'', acao:'', tipo:'outro' });
      setModo('ver');
    }
  };

  const removerItem = async (id: string) => {
    await supabase.from('rotina_items').delete().eq('id', id);
    setRotina(r => ({ ...r, [diaSel]: (r[diaSel]||[]).filter(a=>a.id!==id) }));
  };

  if (loading) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13 }}>Carregando...</div>;

  if (!temRotina) {
    return (
      <div>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Rotina complementar</h2>
            <p style={{ fontSize:13, color:'var(--tm)' }}>Planner semanal de sono, hidratação, alimentação e exercício</p>
          </div>
        </div>
        <div style={{ background:'var(--bg)', border:'1.5px dashed var(--border)', borderRadius:14, padding:'3rem 2rem', textAlign:'center' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📋</div>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Sua rotina está vazia</div>
          <div style={{ fontSize:13, color:'var(--tm)', lineHeight:1.65, marginBottom:'1.5rem', maxWidth:400, margin:'0 auto .875rem' }}>
            Gere uma rotina personalizada com IA baseada no seu protocolo, ou adicione atividades manualmente.
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-d" onClick={gerarComIA} disabled={loadingIA}>
              {loadingIA?'⏳ Gerando...':'🤖 Gerar rotina com IA'}
            </button>
            <button className="btn btn-o" onClick={()=>setModo('adicionar')}>+ Adicionar manualmente</button>
          </div>
        </div>
        {modo === 'adicionar' && (
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginTop:'1rem' }}>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'1rem' }}>Adicionar atividade</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
              {DIAS.map(d=>(
                <button key={d} onClick={()=>setDiaSel(d)}
                  style={{ padding:'5px 10px', borderRadius:8, border:`1px solid ${diaSel===d?'var(--green)':'var(--border)'}`, background:diaSel===d?'var(--gp)':'var(--bg2)', color:diaSel===d?'var(--gm)':'var(--tm)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                  {d}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
              <input className="inp" type="time" value={novoItem.horario} onChange={e=>setNovoItem(p=>({...p,horario:e.target.value}))} style={{ marginBottom:0, width:100 }}/>
              <input className="inp" placeholder="Descrição" value={novoItem.acao} onChange={e=>setNovoItem(p=>({...p,acao:e.target.value}))} style={{ marginBottom:0, flex:1, minWidth:150 }}/>
              <select className="inp" value={novoItem.tipo} onChange={e=>setNovoItem(p=>({...p,tipo:e.target.value}))} style={{ marginBottom:0, width:130 }}>
                {Object.entries(TIPO_INFO).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
              <button className="btn btn-d" onClick={adicionarItem}>Salvar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const pct = diaDia.length > 0 ? Math.round((diaDia.filter(a=>concluidos.has(a.id)).length/diaDia.length)*100) : 0;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Rotina complementar</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Planner semanal de sono, hidratação, alimentação e exercício</p>
        </div>
        <button className="btn btn-o" onClick={gerarComIA} disabled={loadingIA} style={{ fontSize:12 }}>
          {loadingIA?'⏳ Gerando...':'🔄 Regerar com IA'}
        </button>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:'1.25rem', overflowX:'auto', paddingBottom:4 }}>
        {DIAS.map(d => {
          const dRot = rotina[d]||[];
          const isHoje = d === hoje;
          return (
            <div key={d} onClick={() => setDiaSel(d)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 14px', borderRadius:12, cursor:'pointer', flexShrink:0, transition:'all .15s', background:diaSel===d?'var(--dark)':isHoje?'var(--gp)':'var(--bg)', border:`1.5px solid ${diaSel===d?'var(--dark)':isHoje?'var(--green)':'var(--border)'}` }}>
              <div style={{ fontSize:12, fontWeight:500, color:diaSel===d?'white':isHoje?'var(--gm)':'var(--tm)' }}>{d}</div>
              <div style={{ fontSize:10, color:diaSel===d?'rgba(255,255,255,.7)':isHoje?'var(--gm)':'var(--ts)' }}>{dRot.length > 0 ? `${dRot.length} items` : '—'}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:'1.25rem', alignItems:'start' }}>
        <div>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>
                  {DIAS_FULL[DIAS.indexOf(diaSel)]}
                  {diaSel === hoje && <span style={{ fontSize:10, background:'var(--gp)', color:'var(--gm)', borderRadius:100, padding:'1px 7px', marginLeft:8, fontWeight:500 }}>Hoje</span>}
                </div>
                {diaDia.length > 0 && <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{diaDia.filter(a=>concluidos.has(a.id)).length}/{diaDia.length} concluídos</div>}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {modo==='ver'?<>
                  <button onClick={()=>setModo('editar')} className="btn btn-o" style={{ fontSize:11, padding:'4px 10px' }}>✏️ Editar</button>
                  <button onClick={()=>setModo('adicionar')} className="btn btn-d" style={{ fontSize:11, padding:'4px 10px' }}>+ Add</button>
                </>:<button onClick={()=>setModo('ver')} className="btn btn-o" style={{ fontSize:11, padding:'4px 10px' }}>✓ Pronto</button>}
              </div>
            </div>

            {diaDia.length > 0 && <div style={{ height:3, background:'var(--border)' }}><div style={{ height:'100%', width:`${pct}%`, background:'var(--green)', transition:'width .3s' }}/></div>}

            {modo==='adicionar' && (
              <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', background:'var(--bg2)', display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-end' }}>
                <input className="inp" type="time" value={novoItem.horario} onChange={e=>setNovoItem(p=>({...p,horario:e.target.value}))} style={{ marginBottom:0, width:100 }}/>
                <input className="inp" placeholder="Descrição" value={novoItem.acao} onChange={e=>setNovoItem(p=>({...p,acao:e.target.value}))} style={{ marginBottom:0, flex:1, minWidth:150 }}/>
                <select className="inp" value={novoItem.tipo} onChange={e=>setNovoItem(p=>({...p,tipo:e.target.value}))} style={{ marginBottom:0, width:130 }}>
                  {Object.entries(TIPO_INFO).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
                <button className="btn btn-d" onClick={adicionarItem}>Salvar</button>
              </div>
            )}

            {diaDia.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--ts)', fontSize:13 }}>
                Nenhuma atividade para {DIAS_FULL[DIAS.indexOf(diaSel)]}
              </div>
            ) : diaDia.map((a,i) => {
              const t = TIPO_INFO[a.tipo as keyof typeof TIPO_INFO] || TIPO_INFO.outro;
              return (
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 1.25rem', borderBottom:i<diaDia.length-1?'1px solid var(--border)':'none', opacity:concluidos.has(a.id)?.65:1 }}>
                  <div onClick={()=>toggleConcluido(a.id)}
                    style={{ width:20, height:20, borderRadius:6, border:concluidos.has(a.id)?'none':`1.5px solid var(--border)`, background:concluidos.has(a.id)?'var(--green)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                    {concluidos.has(a.id) && <svg width="10" height="10" fill="none" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{ fontSize:11, color:'var(--ts)', width:40, flexShrink:0 }}>{a.horario}</div>
                  <div style={{ flex:1, fontSize:13, color:concluidos.has(a.id)?'var(--ts)':'var(--tx)', textDecoration:concluidos.has(a.id)?'line-through':'none' }}>{a.acao}</div>
                  <span style={{ fontSize:9, padding:'2px 7px', borderRadius:100, background:t.bg, color:t.cor, fontWeight:500, flexShrink:0 }}>{t.label}</span>
                  {modo==='editar' && <button onClick={()=>removerItem(a.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ts)', fontSize:16, lineHeight:1, padding:0, flexShrink:0 }}>×</button>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Progresso hoje</div>
            <div style={{ fontSize:'2rem', fontWeight:500, letterSpacing:'-.06em', marginBottom:4 }}>{pct}%</div>
            <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden', marginBottom:6 }}>
              <div style={{ height:'100%', width:`${pct}%`, background:pct>=80?'var(--green)':pct>=50?'#EF9F27':'var(--border)', borderRadius:3 }}/>
            </div>
            <div style={{ fontSize:11, color:'var(--ts)' }}>{diaDia.filter(a=>concluidos.has(a.id)).length} de {diaDia.length} atividades</div>
          </div>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Categorias</div>
            {Object.entries(TIPO_INFO).map(([k,v])=>(
              <div key={k} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--tm)', marginBottom:7 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:v.cor, flexShrink:0 }}/>
                {v.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
