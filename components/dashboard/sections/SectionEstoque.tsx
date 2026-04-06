// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type ItemEstoque = {
  id?: string; nome: string; emoji: string; slug: string;
  quantidade_mg: number; dose_dia_mg: number; unidade: string; via: string;
  data_compra?: string; lote?: string;
};

const DOSES: Record<string,number> = {
  tirzepatide:0.714, retatrutide:0.571, 'aod9604':0.214, ipamorelin:0.25,
  'cjc-ipamorelin':0.1, 'bpc157':0.25, tb500:0.714, 'ghk-cu':1.0,
  semax:0.214, nad:0.25, pt141:2.0, tesamorelin:2.0, kpv:0.3,
  motsc:0.005, 'hgh-fragment':0.3, 'ss31':0.25,
};

export default function SectionEstoque({ userId, items = [], answers }: any) {
  const [itens, setItens]   = useState<ItemEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string|null>(null);
  const [adicionando, setAdicionando] = useState(false);
  const [novoItem, setNovoItem] = useState({ nome:'', emoji:'💊', quantidade_mg:0, dose_dia_mg:0.25 });

  useEffect(() => { if (userId) carregar(); }, [userId, items]);

  const carregar = async () => {
    setLoading(true);
    const { data: e } = await supabase
      .from('estoque_usuario').select('*').eq('user_id', userId);

    // Usa items do protocolo como base
    const protocolo = items || [];

    const merged: ItemEstoque[] = protocolo.map((p: any) => {
      const slug = p.slug || p.n?.toLowerCase().replace(/\s+/g,'-') || p.n;
      const est = e?.find((x: any) => x.slug === slug || x.nome === p.n);
      return {
        id: est?.id,
        nome: p.n || p.nome,
        emoji: p.e || p.emoji || '💊',
        slug,
        quantidade_mg: est?.quantidade_mg ?? 0,
        dose_dia_mg: est?.dose_dia_mg ?? DOSES[slug] ?? 0.25,
        unidade: 'mg',
        via: p.route || p.via || 'SC',
        data_compra: est?.data_compra,
        lote: est?.lote,
      };
    });

    // Adiciona itens do banco que não estão no protocolo
    const extra = e?.filter(x => !merged.find(m => m.slug === x.slug)) || [];
    extra.forEach(x => merged.push({
      id: x.id, nome: x.nome, emoji: x.emoji || '💊', slug: x.slug,
      quantidade_mg: x.quantidade_mg || 0, dose_dia_mg: x.dose_dia_mg || 0.25,
      unidade: 'mg', via: x.via || 'SC',
    }));

    setItens(merged);
    setLoading(false);
  };

  const salvarItem = async (item: ItemEstoque) => {
    await supabase.from('estoque_usuario').upsert({
      id: item.id, user_id: userId, slug: item.slug, nome: item.nome,
      emoji: item.emoji, quantidade_mg: item.quantidade_mg,
      dose_dia_mg: item.dose_dia_mg, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,slug' });
    setEditando(null);
    carregar();
  };

  const adicionarManual = async () => {
    if (!novoItem.nome.trim()) return;
    const slug = novoItem.nome.toLowerCase().replace(/\s+/g,'-');
    await supabase.from('estoque_usuario').upsert({
      user_id: userId, slug, nome: novoItem.nome.trim(),
      emoji: novoItem.emoji, quantidade_mg: novoItem.quantidade_mg,
      dose_dia_mg: novoItem.dose_dia_mg, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,slug' });
    setNovoItem({ nome:'', emoji:'💊', quantidade_mg:0, dose_dia_mg:0.25 });
    setAdicionando(false);
    carregar();
  };

  const updateItem = (slug: string, field: string, value: any) =>
    setItens(p => p.map(it => it.slug === slug ? { ...it, [field]: value } : it));

  const diasRestantes = (item: ItemEstoque) => {
    if (!item.dose_dia_mg) return null;
    return Math.floor(item.quantidade_mg / item.dose_dia_mg);
  };
  const corStatus = (d: number|null) =>
    d === null ? 'var(--ts)' : d <= 7 ? '#D85A30' : d <= 21 ? '#EF9F27' : '#0F6E56';

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando...</div>;

  const alertas = itens.filter(it => { const d = diasRestantes(it); return d !== null && d <= 14; });
  const CARD = { background:'#FFFFFF', borderRadius:14, boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)' };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Estoque</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>Acompanhe quantidade e duração de cada peptídeo</p>
        </div>
        <button onClick={() => setAdicionando(true)}
          style={{ fontSize:12, padding:'7px 14px', borderRadius:9, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontFamily:'inherit', color:'var(--tm)', fontWeight:500 }}>
          + Adicionar
        </button>
      </div>

      {alertas.length > 0 && (
        <div style={{ background:'#FAECE7', borderRadius:12, padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', gap:10 }}>
          <span style={{ fontSize:'1.2rem' }}>⚠️</span>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#D85A30', marginBottom:4 }}>Estoque baixo</div>
            <div style={{ fontSize:12, color:'#D85A30' }}>
              {alertas.map(it => `${it.nome} (${diasRestantes(it)} dias)`).join(' · ')}
            </div>
          </div>
        </div>
      )}

      {itens.length === 0 && (
        <div style={{ ...CARD, padding:'3rem', textAlign:'center', color:'var(--ts)' }}>
          <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>📦</div>
          <div style={{ fontSize:13, marginBottom:'1rem' }}>
            {items.length === 0 ? 'Gere seu protocolo para ver os peptídeos aqui.' : 'Nenhum item no estoque ainda.'}
          </div>
          <button onClick={() => setAdicionando(true)} className="btn btn-d" style={{ fontSize:13 }}>
            + Adicionar manualmente
          </button>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {itens.map(item => {
          const dias = diasRestantes(item);
          const cor  = corStatus(dias);
          const pct  = dias !== null ? Math.min(100,(dias/60)*100) : 0;
          const emEdicao = editando === item.slug;

          return (
            <div key={item.slug} style={{ ...CARD, padding:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#F7F7F7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>
                  {item.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:500 }}>{item.nome}</div>
                      <div style={{ fontSize:11, color:'var(--ts)' }}>{item.dose_dia_mg} mg/dia · {item.via}</div>
                    </div>
                    {dias !== null && (
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:20, fontWeight:700, color:cor, lineHeight:1 }}>{dias}</div>
                        <div style={{ fontSize:10, color:'var(--ts)' }}>dias</div>
                      </div>
                    )}
                  </div>

                  <div style={{ height:4, background:'#F3F4F6', borderRadius:100, marginBottom:10, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:cor, borderRadius:100, transition:'width .3s' }}/>
                  </div>

                  {emEdicao ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <input type="number" value={item.quantidade_mg}
                        onChange={e => updateItem(item.slug,'quantidade_mg',parseFloat(e.target.value)||0)}
                        style={{ width:100, padding:'6px 10px', borderRadius:8, border:'1px solid var(--border)', fontSize:13, fontFamily:'inherit' }}
                        placeholder="mg total"/>
                      <span style={{ fontSize:12, color:'var(--ts)' }}>mg em estoque</span>
                      <button onClick={() => salvarItem(item)} className="btn btn-d" style={{ fontSize:11, padding:'5px 12px' }}>Salvar</button>
                      <button onClick={() => setEditando(null)} style={{ fontSize:11, background:'none', border:'none', color:'var(--ts)', cursor:'pointer' }}>Cancelar</button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:13, fontWeight:600 }}>{item.quantidade_mg} mg</span>
                      <span style={{ fontSize:12, color:'var(--ts)' }}>em estoque</span>
                      <button onClick={() => setEditando(item.slug)}
                        style={{ marginLeft:'auto', fontSize:11, background:'#F7F7F7', border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontFamily:'inherit', color:'var(--tm)' }}>
                        ✏️ Atualizar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal adicionar */}
      {adicionando && (
        <div className="overlay" onClick={e => { if (e.target===e.currentTarget) setAdicionando(false); }}>
          <div className="modal" style={{ maxWidth:360 }}>
            <h3 style={{ fontSize:14, fontWeight:600, marginBottom:'1rem' }}>Adicionar peptídeo</h3>
            <div style={{ display:'flex', flex:'column', gap:10 }}>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:12, color:'var(--tm)', display:'block', marginBottom:4 }}>Nome</label>
                <input className="inp" value={novoItem.nome} onChange={e => setNovoItem(p=>({...p,nome:e.target.value}))} placeholder="ex: BPC-157"/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div>
                  <label style={{ fontSize:12, color:'var(--tm)', display:'block', marginBottom:4 }}>Quantidade (mg)</label>
                  <input type="number" className="inp" value={novoItem.quantidade_mg} onChange={e => setNovoItem(p=>({...p,quantidade_mg:parseFloat(e.target.value)||0}))}/>
                </div>
                <div>
                  <label style={{ fontSize:12, color:'var(--tm)', display:'block', marginBottom:4 }}>Dose/dia (mg)</label>
                  <input type="number" className="inp" value={novoItem.dose_dia_mg} onChange={e => setNovoItem(p=>({...p,dose_dia_mg:parseFloat(e.target.value)||0}))}/>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-d" onClick={adicionarManual} disabled={!novoItem.nome.trim()} style={{ flex:1 }}>Adicionar</button>
              <button onClick={() => setAdicionando(false)} style={{ padding:'10px 16px', borderRadius:10, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
