// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const PEPTIDEOS = ['Semaglutide','AOD-9604','Ipamorelin','Semax','BPC-157','Todos'];

const EFEITOS = {
  positivos: ['Mais energia','Sono melhor','Humor elevado','Mais força','Libido aumentada','Foco melhorado','Recuperação rápida','Menos apetite'],
  neutros:   ['Sono agitado','Retenção leve','Cansaço','Fome aumentada','Alteração humor'],
  negativos: ['Dor no local','Vermelhidão','Náusea','Dor de cabeça','Formigamento','Tontura'],
};

const COR = {
  positivos: { text:'#0F6E56', bg:'#E1F5EE', border:'#9FE1CB' },
  neutros:   { text:'#633806', bg:'#FAEEDA', border:'#FAC775' },
  negativos: { text:'#4A1B0C', bg:'#FAECE7', border:'#F5C4B3' },
};

function tipoDeEfeito(ef: string) {
  if (EFEITOS.positivos.includes(ef)) return 'positivos';
  if (EFEITOS.neutros.includes(ef))   return 'neutros';
  return 'negativos';
}

function hoje() { return new Date().toISOString().split('T')[0]; }

export default function SectionDiario({ userId }: { userId: string | null }) {
  const [step,     setStep]     = useState<1|2|3|4>(1);
  const [peptideo, setPeptideo] = useState('');
  const [selEf,    setSelEf]    = useState<string[]>([]);
  const [intens,   setIntens]   = useState(5);
  const [nota,     setNota]     = useState('');
  const [entries,  setEntries]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [filtro,   setFiltro]   = useState('');

  useEffect(() => {
    if (!userId) return;
    carregarEntries();
  }, [userId]);

  const carregarEntries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('diario_entries')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const toggleEf = (t: string) => setSelEf(p => p.includes(t)?p.filter(x=>x!==t):[...p,t]);

  const salvar = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from('diario_entries').insert({
      user_id: userId,
      data: hoje(),
      peptideo,
      efeitos: selEf,
      intensidade: intens,
      nota: nota || null,
    });
    if (!error) {
      setSaved(true); setTimeout(()=>setSaved(false), 3000);
      setStep(1); setPeptideo(''); setSelEf([]); setIntens(5); setNota('');
      carregarEntries();
    }
    setSaving(false);
  };

  const filtered = filtro ? entries.filter(e=>e.efeitos?.includes(filtro)||e.peptideo===filtro) : entries;

  return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Diário de sintomas</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Registre efeitos percebidos ao longo do ciclo</p>
      </div>

      {/* Fluxo de registro */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.5rem', marginBottom:'1.25rem' }}>
        {/* Steps */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:'1.5rem' }}>
          {[['1','Peptídeo'],['2','Efeitos'],['3','Intensidade'],['4','Nota']].map(([n,l],i) => (
            <div key={n} style={{ display:'flex', alignItems:'center', flex:i<3?1:'auto' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:500, background:Number(n)<=step?'var(--dark)':'var(--bg2)', color:Number(n)<=step?'white':'var(--ts)', transition:'all .2s' }}>
                  {Number(n)<step?'✓':n}
                </div>
                <div style={{ fontSize:10, color:Number(n)===step?'var(--tx)':'var(--ts)', fontWeight:Number(n)===step?500:400, whiteSpace:'nowrap' }}>{l}</div>
              </div>
              {i<3 && <div style={{ flex:1, height:1, background:Number(n)<step?'var(--dark)':'var(--border)', margin:'0 8px', marginBottom:16, transition:'background .2s' }}/>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'1rem' }}>Qual peptídeo você aplicou hoje?</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:'1.25rem' }}>
              {PEPTIDEOS.map(p => (
                <div key={p} onClick={() => setPeptideo(p)}
                  style={{ padding:'8px 16px', borderRadius:100, fontSize:13, fontWeight:500, cursor:'pointer', transition:'all .15s', background:peptideo===p?'var(--dark)':'var(--bg2)', color:peptideo===p?'white':'var(--tm)', border:`1px solid ${peptideo===p?'var(--dark)':'var(--border)'}` }}>
                  {p}
                </div>
              ))}
            </div>
            <button className="btn btn-d" onClick={() => peptideo && setStep(2)} disabled={!peptideo}>Próximo →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'1rem' }}>Quais efeitos você percebeu?</div>
            {Object.entries(EFEITOS).map(([tipo, tags]) => (
              <div key={tipo} style={{ marginBottom:'1rem' }}>
                <div style={{ fontSize:11, fontWeight:500, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>
                  {tipo==='positivos'?'✅ Positivos':tipo==='neutros'?'➡️ Neutros':'⚠️ Atenção'}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {tags.map(t => (
                    <div key={t} onClick={() => toggleEf(t)}
                      style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .13s', background:selEf.includes(t)?COR[tipo as keyof typeof COR].bg:'var(--bg2)', color:selEf.includes(t)?COR[tipo as keyof typeof COR].text:'var(--tm)', border:`1px solid ${selEf.includes(t)?COR[tipo as keyof typeof COR].border:'var(--border)'}` }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-o" onClick={() => setStep(1)}>← Voltar</button>
              <button className="btn btn-d" onClick={() => setStep(3)}>Próximo →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Como você está se sentindo no geral? — {intens}/10</div>
            <div style={{ display:'flex', gap:8, marginBottom:'1.5rem' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <div key={n} onClick={() => setIntens(n)}
                  style={{ flex:1, height:44, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:500, background:n===intens?'var(--dark)':'var(--bg2)', color:n===intens?'white':'var(--ts)', border:`1px solid ${n===intens?'var(--dark)':'var(--border)'}`, transition:'all .1s' }}>
                  {n}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-o" onClick={() => setStep(2)}>← Voltar</button>
              <button className="btn btn-d" onClick={() => setStep(4)}>Próximo →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Alguma observação adicional? <span style={{ fontSize:11, color:'var(--ts)', fontWeight:400 }}>(opcional)</span></div>
            <textarea className="inp" rows={3} placeholder="ex: Acordei mais disposto, sono excelente, sem efeitos negativos..." value={nota} onChange={e=>setNota(e.target.value)} style={{ resize:'none', fontFamily:'inherit', fontSize:13, marginBottom:'1rem' }}/>
            <div style={{ background:'var(--bg2)', borderRadius:10, padding:'1rem', marginBottom:'1rem' }}>
              <div style={{ fontSize:11, fontWeight:500, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Resumo</div>
              <div style={{ fontSize:12, color:'var(--tm)', marginBottom:4 }}><strong>Peptídeo:</strong> {peptideo} · <strong>Intensidade:</strong> {intens}/10</div>
              {selEf.length > 0 && (
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {selEf.map(ef => { const t = tipoDeEfeito(ef); return (
                    <span key={ef} style={{ fontSize:11, padding:'2px 8px', borderRadius:100, background:COR[t as keyof typeof COR].bg, color:COR[t as keyof typeof COR].text, fontWeight:500 }}>{ef}</span>
                  );})}
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-o" onClick={() => setStep(3)}>← Voltar</button>
              <button className="btn btn-d" onClick={salvar} disabled={saving}>{saving?'Salvando...':'💾 Salvar no diário'}</button>
            </div>
          </div>
        )}
      </div>

      {saved && <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:10, padding:'10px 14px', marginBottom:'1rem', fontSize:13, color:'var(--gm)' }}>✅ Registro salvo!</div>}

      {/* Histórico */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Histórico</div>
          {filtro && <button onClick={()=>setFiltro('')} style={{ fontSize:11, color:'var(--gm)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>× Limpar filtro</button>}
        </div>
        {loading ? (
          <div style={{ padding:'2rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'2.5rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>
            {entries.length === 0 ? 'Nenhum registro ainda — comece agora!' : 'Nenhum resultado para este filtro'}
          </div>
        ) : filtered.map((e,i) => (
          <div key={e.id||i} style={{ padding:'1rem 1.25rem', borderBottom:i<filtered.length-1?'1px solid var(--border)':'none' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, color:'var(--ts)' }}>{new Date(e.data).toLocaleDateString('pt-BR')}</span>
                <span style={{ fontSize:11, background:'var(--gp)', color:'var(--gm)', padding:'1px 8px', borderRadius:100, fontWeight:500, cursor:'pointer' }} onClick={()=>setFiltro(e.peptideo)}>{e.peptideo}</span>
              </div>
              <span style={{ fontSize:11, color:'var(--ts)' }}>Intensidade {e.intensidade}/10</span>
            </div>
            {e.efeitos?.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:e.nota?6:0 }}>
                {e.efeitos.map((ef: string) => { const t = tipoDeEfeito(ef); return (
                  <span key={ef} onClick={()=>setFiltro(ef)}
                    style={{ fontSize:11, padding:'2px 8px', borderRadius:100, fontWeight:500, cursor:'pointer', background:COR[t as keyof typeof COR].bg, color:COR[t as keyof typeof COR].text }}>
                    {ef}
                  </span>
                );})}
              </div>
            )}
            {e.nota && <div style={{ fontSize:12, color:'var(--tm)', fontStyle:'italic' }}>{e.nota}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
