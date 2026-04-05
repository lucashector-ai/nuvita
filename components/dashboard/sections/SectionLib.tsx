// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CATEGORIAS = ['Todos','Emagrecimento','GH/Composição','Recuperação','Anti-aging','Gut/Inflamação','Longevidade','Sexual','Experimental'];
const NIVEL_LABEL: any = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado' };
const NIVEL_COR: any  = { iniciante:'#0F6E56', intermediario:'#EF9F27', avancado:'#D85A30' };

export default function SectionLib() {
  const router = useRouter();
  const [peptideos, setPeptideos] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [busca,     setBusca]     = useState('');
  const [catFiltro, setCatFiltro] = useState('Todos');
  const [nivFiltro, setNivFiltro] = useState('Todos');

  useEffect(() => {
    supabase.from('peptideos').select('*').order('categoria').then(({ data }) => {
      setPeptideos(data || []);
      setLoading(false);
    });
  }, []);

  const filtrados = peptideos.filter(p => {
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.resumo?.toLowerCase().includes(busca.toLowerCase()) || p.tags?.some((t: string) => t.includes(busca.toLowerCase()));
    const matchCat = catFiltro === 'Todos' || p.categoria === catFiltro;
    const matchNiv = nivFiltro === 'Todos' || p.nivel === nivFiltro;
    return matchBusca && matchCat && matchNiv;
  });

  return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Biblioteca de peptídeos</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>{peptideos.length} peptídeos · Clique para ver ficha completa</p>
      </div>

      {/* Busca */}
      <input className="inp" placeholder="🔍 Buscar por nome, categoria ou efeito..." value={busca} onChange={e=>setBusca(e.target.value)} style={{ marginBottom:'1rem', fontSize:13 }}/>

      {/* Filtros categoria */}
      <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:8 }}>
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => setCatFiltro(c)}
            style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', border:'1px solid var(--border)', background:catFiltro===c?'var(--dark)':'var(--bg2)', color:catFiltro===c?'white':'var(--tm)', transition:'all .13s' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Filtros nível */}
      <div style={{ display:'flex', gap:7, marginBottom:'1.5rem' }}>
        {['Todos','iniciante','intermediario','avancado'].map(n => (
          <button key={n} onClick={() => setNivFiltro(n)}
            style={{ padding:'4px 11px', borderRadius:100, fontSize:11, fontWeight:500, cursor:'pointer', border:'1px solid var(--border)', background:nivFiltro===n?'var(--dark)':'var(--bg2)', color:nivFiltro===n?'white':'var(--tm)', transition:'all .13s' }}>
            {n === 'Todos' ? 'Todos os níveis' : NIVEL_LABEL[n]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando biblioteca...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Nenhum resultado para "{busca}"</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtrados.map(p => (
            <div key={p.slug}
              style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1rem 1.25rem', cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'all .15s' }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='var(--dark)'; (e.currentTarget as HTMLElement).style.background='var(--bg2)'; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.background='var(--bg)'; }}
              onClick={() => router.push(`/biblioteca/${p.slug}`)}>

              <div style={{ width:44, height:44, borderRadius:12, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>
                {p.emoji}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                  <span style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{p.nome}</span>
                  <span style={{ fontSize:10, padding:'2px 7px', borderRadius:100, background:'var(--bg2)', color:'var(--ts)', fontWeight:500 }}>{p.categoria}</span>
                  {p.nivel && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:100, fontWeight:600, background:NIVEL_COR[p.nivel]+'20', color:NIVEL_COR[p.nivel] }}>{NIVEL_LABEL[p.nivel]}</span>}
                </div>
                <div style={{ fontSize:12, color:'var(--ts)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.resumo}</div>
              </div>

              <div style={{ textAlign:'right', flexShrink:0 }}>
                {p.dose_max > 0 && <div style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>{p.dose_min}–{p.dose_max} {p.unidade}</div>}
                <div style={{ fontSize:10, color:'var(--ts)', marginTop:2 }}>{p.via}</div>
                <div style={{ fontSize:11, color:'var(--ts)', marginTop:4 }}>Ver ficha →</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
