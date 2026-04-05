// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type ItemEstoque = {
  id?: string;
  nome: string;
  emoji: string;
  slug: string;
  quantidade_mg: number;
  dose_dia_mg: number;
  unidade: string;
  via: string;
  data_compra?: string;
  lote?: string;
};

export default function SectionEstoque() {
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string|null>(null);
  const [novos, setNovos] = useState<Record<string,string>>({});

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: u }, { data: e }] = await Promise.all([
      supabase.from('usuarios').select('protocolo_gerado').eq('id', user.id).single(),
      supabase.from('estoque_usuario').select('*').eq('user_id', user.id),
    ]);

    const protocolo = u?.protocolo_gerado?.peptideos || [];
    
    // Doses diárias padrão por slug (mg/dia)
    const DOSES: Record<string,number> = {
      tirzepatide:0.714, retatrutide:0.571, 'aod9604':0.214, ipamorelin:0.25,
      'cjc-ipamorelin':0.1, 'bpc157':0.25, tb500:0.714, 'ghk-cu':1.0,
      semax:0.214, nad:0.25, pt141:2.0, tesamorelin:2.0, kpv:0.3,
      motsc:0.005, 'hgh-fragment':0.3, 'ss31':0.25,
    };

    const merged: ItemEstoque[] = protocolo.map((p: any) => {
      const est = e?.find((x: any) => x.slug === p.slug);
      return {
        id: est?.id,
        nome: p.nome,
        emoji: p.emoji || '💊',
        slug: p.slug || p.nome.toLowerCase(),
        quantidade_mg: est?.quantidade_mg ?? 0,
        dose_dia_mg: est?.dose_dia_mg ?? DOSES[p.slug] ?? 0.25,
        unidade: p.unidade || 'mg',
        via: p.via || 'SC',
        data_compra: est?.data_compra,
        lote: est?.lote,
      };
    });
    
    setItens(merged);
    setLoading(false);
  };

  const salvarItem = async (item: ItemEstoque) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('estoque_usuario').upsert({
      id: item.id,
      user_id: user.id,
      slug: item.slug,
      nome: item.nome,
      quantidade_mg: item.quantidade_mg,
      dose_dia_mg: item.dose_dia_mg,
      data_compra: item.data_compra,
      lote: item.lote,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,slug' });
    setEditando(null);
    carregar();
  };

  const updateItem = (slug: string, field: string, value: any) => {
    setItens(prev => prev.map(it => it.slug === slug ? { ...it, [field]: value } : it));
  };

  const diasRestantes = (item: ItemEstoque) => {
    if (!item.dose_dia_mg || item.dose_dia_mg === 0) return null;
    return Math.floor(item.quantidade_mg / item.dose_dia_mg);
  };

  const corStatus = (dias: number | null) => {
    if (dias === null) return 'var(--ts)';
    if (dias <= 7) return '#D85A30';
    if (dias <= 21) return '#EF9F27';
    return '#0F6E56';
  };

  const barraPercent = (item: ItemEstoque) => {
    const dias = diasRestantes(item);
    if (dias === null) return 0;
    return Math.min(100, (dias / 60) * 100);
  };

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando estoque...</div>;

  if (itens.length === 0) return (
    <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)' }}>
      <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>📦</div>
      <div style={{ fontSize:13 }}>Nenhum protocolo ativo. Gere seu protocolo para gerenciar o estoque.</div>
    </div>
  );

  const alertas = itens.filter(it => { const d = diasRestantes(it); return d !== null && d <= 14; });

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Estoque</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Acompanhe quantidade e duração de cada peptídeo</p>
      </div>

      {/* Alertas */}
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

      {/* Lista */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {itens.map(item => {
          const dias = diasRestantes(item);
          const cor = corStatus(dias);
          const pct = barraPercent(item);
          const emEdicao = editando === item.slug;

          return (
            <div key={item.slug} style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.25rem', transition:'border-color .15s' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>
                  {item.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:500 }}>{item.nome}</div>
                      <div style={{ fontSize:11, color:'var(--ts)' }}>{item.dose_dia_mg} {item.unidade}/dia · {item.via}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      {dias !== null && (
                        <div style={{ fontSize:20, fontWeight:700, color:cor, lineHeight:1 }}>{dias}</div>
                      )}
                      <div style={{ fontSize:10, color:'var(--ts)' }}>dias restantes</div>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div style={{ height:4, background:'var(--border)', borderRadius:100, marginBottom:10, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:cor, borderRadius:100, transition:'width .3s' }}/>
                  </div>

                  {/* Quantidade atual */}
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {emEdicao ? (
                      <>
                        <input
                          type="number"
                          value={item.quantidade_mg}
                          onChange={e => updateItem(item.slug, 'quantidade_mg', parseFloat(e.target.value) || 0)}
                          style={{ width:90, padding:'6px 10px', borderRadius:8, border:'none', background:'#FFFFFF', fontSize:13, fontFamily:'inherit', color:'var(--tx)' }}
                          placeholder="mg total"
                        />
                        <span style={{ fontSize:12, color:'var(--ts)' }}>mg total em estoque</span>
                        <button onClick={() => salvarItem(item)} className="btn btn-d" style={{ fontSize:11, padding:'5px 12px' }}>Salvar</button>
                        <button onClick={() => setEditando(null)} style={{ fontSize:11, background:'none', border:'none', color:'var(--ts)', cursor:'pointer' }}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize:13, fontWeight:600 }}>{item.quantidade_mg} {item.unidade}</span>
                        <span style={{ fontSize:12, color:'var(--ts)' }}>em estoque</span>
                        <button onClick={() => setEditando(item.slug)}
                          style={{ marginLeft:'auto', fontSize:11, background:'#FFFFFF', border:'none', borderRadius:6, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'4px 10px', cursor:'pointer', fontFamily:'inherit', color:'var(--tm)' }}>
                          ✏️ Atualizar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
