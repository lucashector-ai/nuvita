// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SectionConsistencia({ userId }: { userId?: string | null }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase.from('adesao_diaria').select('*').eq('user_id', userId).order('data', { ascending: true })
      .then(({ data }) => { setEntries(data || []); setLoading(false); });
  }, [userId]);

  const semanas = entries.reduce((acc: any[], entry) => {
    const date = new Date(entry.data);
    const week = Math.floor((Date.now() - date.getTime()) / (7 * 86400000));
    const idx = acc.findIndex(s => s.week === week);
    if (idx === -1) acc.push({ week, dias: [entry] });
    else acc[idx].dias.push(entry);
    return acc;
  }, []).reverse().slice(0, 8);

  const totalDias   = entries.length;
  const diasFeitos  = entries.filter(e => e.aplicado).length;
  const adesaoGeral = totalDias > 0 ? Math.round((diasFeitos / totalDias) * 100) : 0;

  if (loading) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13 }}>Carregando...</div>;

  if (entries.length === 0) {
    return (
      <div>
        <div style={{ marginBottom:'1.25rem' }}>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Pontuação de consistência</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Adesão semanal ao protocolo medida em score</p>
        </div>
        <div style={{ background:'var(--bg)', border:'1.5px dashed var(--border)', borderRadius:14, padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📊</div>
          <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Sem dados ainda</div>
          <div style={{ fontSize:13, color:'var(--ts)', lineHeight:1.65, maxWidth:380, margin:'0 auto' }}>
            Inicie o protocolo e registre suas aplicações diárias. A consistência será calculada automaticamente com base nos seus registros.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Pontuação de consistência</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Adesão semanal ao protocolo medida em score</p>
      </div>

      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.5rem', marginBottom:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:'1rem' }}>
          <div>
            <div style={{ fontSize:'3rem', fontWeight:500, letterSpacing:'-.06em', lineHeight:1 }}>{adesaoGeral}</div>
            <div style={{ fontSize:12, color:'var(--ts)', marginTop:4 }}>Score geral</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden', marginBottom:8 }}>
              <div style={{ height:'100%', width:`${adesaoGeral}%`, background:adesaoGeral>=70?'var(--green)':'#EF9F27', borderRadius:4 }}/>
            </div>
            <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--ts)' }}>
              <span>{diasFeitos}/{totalDias} dias registrados</span>
              <span style={{ color:adesaoGeral>=70?'var(--gm)':'#854F0B', fontWeight:500 }}>{adesaoGeral>=70?'Bom':'Regular'}</span>
            </div>
          </div>
        </div>
      </div>

      {semanas.length > 0 && (
        <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Por semana</div>
          {semanas.map((s, i) => {
            const pct = Math.round((s.dias.filter((d: any) => d.aplicado).length / Math.max(s.dias.length, 1)) * 100);
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                <div style={{ fontSize:12, color:'var(--ts)', width:60, flexShrink:0 }}>Sem {semanas.length - i}</div>
                <div style={{ flex:1, height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:pct>=70?'var(--green)':pct>=50?'#EF9F27':'#D85A30', borderRadius:4 }}/>
                </div>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', width:36, textAlign:'right' }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
