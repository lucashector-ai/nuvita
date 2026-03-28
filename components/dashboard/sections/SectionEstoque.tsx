// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FrascoEstoque {
  id?: string; nome: string; quantidade_mg: number; unidade: string;
  data_compra: string; validade?: string; observacao?: string;
  analise?: { diasRestantes: number; doseDia: number; status: 'ok'|'atencao'|'critico' };
}

const STATUS_INFO = {
  ok:      { label:'OK',      cor:'#0F6E56', bg:'#E1F5EE', icon:'✓' },
  atencao: { label:'Atenção', cor:'#633806', bg:'#FAEEDA', icon:'⚠' },
  critico: { label:'Crítico', cor:'#4A1B0C', bg:'#FAECE7', icon:'!' },
};

function dataFim(dias: number) {
  const d = new Date(); d.setDate(d.getDate()+dias);
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
}

export default function SectionEstoque({ userId }: { userId: string | null }) {
  const [frascos,   setFrascos]   = useState<FrascoEstoque[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);
  const [analisado, setAnalisado] = useState(false);
  const [toast,     setToast]     = useState('');
  const [form, setForm] = useState({
    nome:'', quantidade_mg:'', unidade:'mg',
    data_compra: new Date().toISOString().split('T')[0],
    validade:'', observacao:'',
  });

  useEffect(() => {
    if (!userId) return;
    carregarFrascos();
  }, [userId]);

  const carregarFrascos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('estoque_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setFrascos(data || []);
    setLoading(false);
  };

  const adicionarFrasco = async () => {
    if (!form.nome || !form.quantidade_mg || !userId) return;
    const { error } = await supabase.from('estoque_items').insert({
      user_id: userId,
      nome: form.nome,
      quantidade_mg: parseFloat(form.quantidade_mg),
      unidade: form.unidade,
      data_compra: form.data_compra,
      validade: form.validade || null,
      observacao: form.observacao || null,
    });
    if (!error) {
      setForm({ nome:'', quantidade_mg:'', unidade:'mg', data_compra:new Date().toISOString().split('T')[0], validade:'', observacao:'' });
      setShowForm(false);
      setAnalisado(false);
      carregarFrascos();
    }
  };

  const removerFrasco = async (id: string) => {
    await supabase.from('estoque_items').delete().eq('id', id);
    setFrascos(p => p.filter(f=>f.id!==id));
  };

  const analisarComIA = async () => {
    if (frascos.length === 0) return;
    setLoadingIA(true);
    try {
      const listaFrascos = frascos.map(f => `${f.nome}: ${f.quantidade_mg}${f.unidade}`).join(', ');
      const res = await fetch('/api/ia', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          system:`Você é o Coach IA da Nuvita. Analise o estoque e calcule a duração. Responda APENAS em JSON: [{"nome":"...","doseDia":NUMERO,"diasRestantes":NUMERO,"status":"ok|atencao|critico"}]. ok=+30 dias, atencao=15-30, critico=-15.`,
          messages:[{role:'user', content:`Estoque: ${listaFrascos}. Protocolo típico: Semaglutide 0.5mg/semana, AOD-9604 300mcg/dia 5x/semana, Ipamorelin 250mcg/dia 5x/semana. Calcule dias de duração.`}],
        }),
      });
      const data = await res.json();
      const jsonMatch = (data.text||'').match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const analises = JSON.parse(jsonMatch[0]);
        setFrascos(p => p.map(f => {
          const a = analises.find((x: any) => x.nome.toLowerCase().includes(f.nome.toLowerCase()) || f.nome.toLowerCase().includes(x.nome.toLowerCase()));
          if (a) return { ...f, analise: { diasRestantes:a.diasRestantes, doseDia:a.doseDia, status:a.status } };
          return f;
        }));
        setAnalisado(true);
      }
    } catch(e) { console.error(e); }
    finally { setLoadingIA(false); }
  };

  const itensCriticos = frascos.filter(f => f.analise?.status==='critico');
  const itensAtencao  = frascos.filter(f => f.analise?.status==='atencao');

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Controle de estoque</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Cadastre seus frascos e a IA calcula quanto tempo vai durar cada um</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {frascos.length > 0 && (
            <button className="btn btn-o" onClick={analisarComIA} disabled={loadingIA} style={{ fontSize:12 }}>
              {loadingIA ? '⏳ Analisando...' : '🤖 Analisar com IA'}
            </button>
          )}
          <button className="btn btn-d" onClick={() => setShowForm(v=>!v)} style={{ fontSize:12 }}>+ Adicionar frasco</button>
        </div>
      </div>

      {toast && <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:10, padding:'10px 14px', marginBottom:'1rem', fontSize:13, color:'var(--gm)' }}>✅ {toast}</div>}

      {itensCriticos.length > 0 && (
        <div style={{ background:'#FAECE7', border:'1px solid rgba(216,90,48,.25)', borderRadius:12, padding:'1rem 1.25rem', marginBottom:'1rem', display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:'1.2rem' }}>🚨</span>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'#4A1B0C' }}>Estoque crítico — menos de 15 dias</div>
            <div style={{ fontSize:12, color:'#712B13' }}>{itensCriticos.map(f=>f.nome).join(', ')}</div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginBottom:'1.25rem' }}>
          <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'1rem' }}>Novo frasco</div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10, marginBottom:10 }}>
            <div><label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>Peptídeo</label>
              <input className="inp" placeholder="ex: Semaglutide" value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))} style={{ marginBottom:0 }}/></div>
            <div><label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>Quantidade</label>
              <input className="inp" type="number" step="0.1" placeholder="ex: 5" value={form.quantidade_mg} onChange={e=>setForm(p=>({...p,quantidade_mg:e.target.value}))} style={{ marginBottom:0 }}/></div>
            <div><label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>Unidade</label>
              <select className="inp" value={form.unidade} onChange={e=>setForm(p=>({...p,unidade:e.target.value}))} style={{ marginBottom:0 }}>
                <option>mg</option><option>mcg</option><option>ml</option>
              </select></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div><label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>Data de compra</label>
              <input className="inp" type="date" value={form.data_compra} onChange={e=>setForm(p=>({...p,data_compra:e.target.value}))} style={{ marginBottom:0 }}/></div>
            <div><label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>Validade (opcional)</label>
              <input className="inp" type="date" value={form.validade} onChange={e=>setForm(p=>({...p,validade:e.target.value}))} style={{ marginBottom:0 }}/></div>
          </div>
          <input className="inp" placeholder="Observação (opcional)" value={form.observacao} onChange={e=>setForm(p=>({...p,observacao:e.target.value}))} style={{ marginBottom:12 }}/>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-d" onClick={adicionarFrasco}>Salvar frasco</button>
            <button className="btn btn-o" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13 }}>Carregando...</div>
      ) : frascos.length === 0 && !showForm ? (
        <div style={{ background:'var(--bg)', border:'1.5px dashed var(--border)', borderRadius:14, padding:'3rem 2rem', textAlign:'center' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🧪</div>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Nenhum frasco cadastrado</div>
          <div style={{ fontSize:13, color:'var(--tm)', lineHeight:1.65, marginBottom:'1.5rem' }}>
            Cadastre os peptídeos que você tem em casa. A IA vai calcular automaticamente quanto tempo cada frasco vai durar.
          </div>
          <button className="btn btn-d" onClick={() => setShowForm(true)}>+ Cadastrar primeiro frasco</button>
        </div>
      ) : frascos.length > 0 && (
        <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Frascos cadastrados</div>
            {!analisado && <div style={{ fontSize:11, color:'var(--am)' }}>⚠️ Clique "Analisar com IA" para calcular duração</div>}
          </div>
          {frascos.map((f,i) => {
            const st = f.analise ? STATUS_INFO[f.analise.status] : null;
            const pct = f.analise ? Math.min(100, Math.round((f.analise.diasRestantes/60)*100)) : null;
            return (
              <div key={f.id||i} style={{ padding:'1rem 1.25rem', borderBottom:i<frascos.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{f.nome}</span>
                      {st && <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:100, background:st.bg, color:st.cor }}>{st.icon} {st.label}</span>}
                    </div>
                    <div style={{ fontSize:12, color:'var(--ts)', marginBottom:f.analise?6:0 }}>
                      {f.quantidade_mg} {f.unidade} · {new Date(f.data_compra).toLocaleDateString('pt-BR')}
                      {f.validade && ` · Val: ${new Date(f.validade).toLocaleDateString('pt-BR')}`}
                    </div>
                    {f.analise && (
                      <>
                        <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden', marginBottom:4 }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:f.analise.status==='critico'?'#D85A30':f.analise.status==='atencao'?'#EF9F27':'var(--green)', borderRadius:3 }}/>
                        </div>
                        <div style={{ fontSize:11, color:st!.cor, fontWeight:500 }}>
                          ~{f.analise.diasRestantes} dias restantes · Acaba em {dataFim(f.analise.diasRestantes)}
                        </div>
                      </>
                    )}
                    {f.observacao && <div style={{ fontSize:11, color:'var(--ts)', marginTop:4, fontStyle:'italic' }}>{f.observacao}</div>}
                  </div>
                  <button onClick={() => removerFrasco(f.id!)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ts)', fontSize:18, lineHeight:1, padding:0, flexShrink:0 }}>×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
