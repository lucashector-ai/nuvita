// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Constantes ──────────────────────────────────────
const EFEITOS = {
  positivos: ['Mais energia','Sono melhor','Humor elevado','Mais força','Libido aumentada','Foco melhorado','Recuperação rápida','Menos apetite'],
  neutros:   ['Sono agitado','Retenção leve','Cansaço','Fome aumentada','Alteração humor'],
  negativos: ['Dor no local','Vermelhidão','Náusea','Dor de cabeça','Formigamento','Tontura'],
};
const COR_EF = {
  positivos: { text:'#0F6E56', bg:'#E1F5EE', border:'#9FE1CB' },
  neutros:   { text:'#633806', bg:'#FAEEDA', border:'#FAC775' },
  negativos: { text:'#4A1B0C', bg:'#FAECE7', border:'#F5C4B3' },
};
function tipoEf(ef: string) {
  if (EFEITOS.positivos.includes(ef)) return 'positivos';
  if (EFEITOS.neutros.includes(ef))   return 'neutros';
  return 'negativos';
}
function hoje() { return new Date().toISOString().split('T')[0]; }

// ─── Subcomponentes ───────────────────────────────────
function MiniBar({ val, max, cor }: any) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${(val/max)*100}%`, background:cor, borderRadius:3 }}/>
      </div>
      <span style={{ fontSize:11, fontWeight:500, color:'var(--tx)', width:28, textAlign:'right' }}>{val}</span>
    </div>
  );
}
function SparkLine({ data, cor }: any) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data) - 0.5, max = Math.max(...data) + 0.5;
  const w = 120, h = 32;
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / (max - min)) * h;
  const pts = data.map((v: number, i: number) => `${x(i)},${y(v)}`).join(' ');
  const trend = data[data.length - 1] - data[0];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <svg width={w} height={h} style={{ overflow:'visible' }}>
        <polyline points={pts} fill="none" stroke={cor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={x(data.length-1)} cy={y(data[data.length-1])} r="2.5" fill={cor}/>
      </svg>
      <span style={{ fontSize:10, fontWeight:500, color:trend<=0?'var(--gm)':'var(--am)' }}>
        {trend>0?'+':''}{trend.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────
export default function SectionDiario({ userId }: { userId: string | null }) {
  const [aba,       setAba]       = useState<'registrar'|'sintomas'|'evolucao'|'fotos'>('registrar');
  const [tracker,   setTracker]   = useState<any[]>([]);
  const [diario,    setDiario]    = useState<any[]>([]);
  const [fotos,     setFotos]     = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [erroSave,  setErroSave]  = useState('');

  // Tracker
  const [peso,      setPeso]      = useState('');
  const [cintura,   setCintura]   = useState('');
  const [energia,   setEnergia]   = useState(7);
  const [sono,      setSono]      = useState(7);
  const [notaTrack, setNotaTrack] = useState('');

  // Diário de sintomas
  const [stepD,     setStepD]     = useState<1|2|3|4>(1);
  const [peptideo,  setPeptideo]  = useState('');
  const [selEf,     setSelEf]     = useState<string[]>([]);
  const [intens,    setIntens]    = useState(5);
  const [notaD,     setNotaD]     = useState('');

  // Fotos
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadando, setUploadando] = useState(false);

  useEffect(() => { if (!userId) return; carregarTudo(); }, [userId]);

  const carregarTudo = async () => {
    setLoading(true);
    const [{ data: tr }, { data: di }, { data: ft }] = await Promise.all([
      supabase.from('tracker_entries').select('*').eq('user_id', userId).order('data', { ascending:false }),
      supabase.from('diario_entries').select('*').eq('user_id', userId).order('data', { ascending:false }),
      supabase.from('tracker_fotos').select('*').eq('user_id', userId).order('created_at', { ascending:false }),
    ]);
    setTracker(tr || []);
    setDiario(di || []);
    setFotos(ft || []);
    setLoading(false);
  };

  // ─── Salvar tracker ──────────────────────────────────
  const salvarTracker = async () => {
    if (!userId) return;
    setSaving(true); setErroSave('');
    const entry = { user_id:userId, data:hoje(), peso:peso?parseFloat(peso):null, cintura:cintura?parseFloat(cintura):null, energia, sono, nota:notaTrack||null };

    let { error } = await supabase.from('tracker_entries').upsert(entry, { onConflict:'user_id,data' });
    if (error) {
      const { data:existe } = await supabase.from('tracker_entries').select('id').eq('user_id',userId).eq('data',hoje()).maybeSingle();
      if (existe) { ({ error } = await supabase.from('tracker_entries').update({ peso:entry.peso, cintura:entry.cintura, energia, sono, nota:entry.nota }).eq('user_id',userId).eq('data',hoje())); }
      else        { ({ error } = await supabase.from('tracker_entries').insert(entry)); }
    }
    if (!error) { setSaved(true); setTimeout(()=>setSaved(false),2500); setPeso(''); setCintura(''); setNotaTrack(''); carregarTudo(); }
    else setErroSave(error.message);
    setSaving(false);
  };

  // ─── Salvar diário ───────────────────────────────────
  const salvarDiario = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from('diario_entries').insert({ user_id:userId, data:hoje(), peptideo, efeitos:selEf, intensidade:intens, nota:notaD||null });
    if (!error) { setSaved(true); setTimeout(()=>setSaved(false),3000); setStepD(1); setPeptideo(''); setSelEf([]); setIntens(5); setNotaD(''); carregarTudo(); }
    setSaving(false);
  };

  // ─── Upload de foto ──────────────────────────────────
  const [erroFoto,    setErroFoto]    = useState('');
  const [fotoViewer,  setFotoViewer]  = useState<any>(null);
  const [comparar,    setComparar]    = useState<any[]>([]);
  const [modoCompar,  setModoCompar]  = useState(false);
  
  const handleFoto = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadando(true);
    setErroFoto('');
    try {
      // Resize para max 1MB antes de upload
      const path = `${userId}/${hoje()}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: upData, error: upErr } = await supabase.storage
        .from('tracker-fotos')
        .upload(path, file, { upsert: true, contentType: file.type });
      
      if (upErr) {
        setErroFoto('Erro no upload: ' + upErr.message);
        setUploadando(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('tracker-fotos').getPublicUrl(path);
      
      const { error: dbErr } = await supabase.from('tracker_fotos').insert({
        user_id: userId,
        data: hoje(),
        url: publicUrl,
        descricao: '',
      });
      
      if (dbErr) {
        setErroFoto('Foto enviada mas erro ao salvar: ' + dbErr.message);
      } else {
        await carregarTudo();
      }
    } catch(err: any) {
      setErroFoto('Erro: ' + (err.message || 'tente novamente'));
    }
    setUploadando(false);
  };

  const ultimo = tracker[0];
  const ant    = tracker[1];
  const diffPeso = ultimo?.peso && ant?.peso ? (ultimo.peso - ant.peso).toFixed(1) : null;
  const pesoData    = [...tracker].reverse().filter(e=>e.peso).map(e=>e.peso!);
  const energiaData = [...tracker].reverse().filter(e=>e.energia).map(e=>e.energia!);
  const sonoData    = [...tracker].reverse().filter(e=>e.sono).map(e=>e.sono!);

  // Lista de peptídeos do protocolo (para seleção no diário)
  const PEPTIDEOS_LISTA = ['Tirzepatide','Semaglutide','AOD-9604','Ipamorelin','CJC-1295','BPC-157','TB-500','GHK-Cu','Semax','MK-677','NAD+','PT-141','KPV','MOTS-C','Outro'];

  return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Diário</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Registros diários, sintomas, evolução e fotos do ciclo</p>
      </div>

      {/* Abas */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'1.5rem', overflowX:'auto' }}>
        {[['registrar','📋 Registro diário'],['sintomas','💊 Sintomas'],['evolucao','📈 Evolução'],['fotos','📸 Fotos']].map(([v,l])=>(
          <button key={v} onClick={()=>setAba(v as any)}
            style={{ padding:'10px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:aba===v?'var(--tx)':'var(--ts)', borderBottom:aba===v?'2px solid var(--dark)':'2px solid transparent', whiteSpace:'nowrap', flexShrink:0 }}>
            {l}
          </button>
        ))}
      </div>

      {saved && <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:10, padding:'10px 14px', marginBottom:'1rem', fontSize:13, color:'var(--gm)' }}>✅ Salvo com sucesso!</div>}
      {erroSave && <div style={{ background:'#FAECE7', borderRadius:10, padding:'10px 14px', marginBottom:'1rem', fontSize:12, color:'#D85A30' }}>Erro: {erroSave}</div>}

      {/* ─── ABA REGISTRO DIÁRIO ─────────────────────── */}
      {aba === 'registrar' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
          {/* Esquerda — inputs */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Medidas — {new Date().toLocaleDateString('pt-BR')}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:5 }}>Peso (kg)</label>
                  <input className="inp" type="number" step="0.1" placeholder={ultimo?.peso?`Último: ${ultimo.peso}`:'ex: 78.5'} value={peso} onChange={e=>setPeso(e.target.value)} style={{ marginBottom:0 }}/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:5 }}>Cintura (cm)</label>
                  <input className="inp" type="number" step="0.5" placeholder={ultimo?.cintura?`Último: ${ultimo.cintura}`:'ex: 85'} value={cintura} onChange={e=>setCintura(e.target.value)} style={{ marginBottom:0 }}/>
                </div>
              </div>
            </div>

            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Energia — {energia}/10</div>
              <div style={{ display:'flex', gap:5 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                  <div key={n} onClick={()=>setEnergia(n)} style={{ flex:1, height:32, borderRadius:6, cursor:'pointer', background:n<=energia?'var(--green)':'var(--bg2)', border:`1px solid ${n<=energia?'var(--green)':'var(--border)'}`, transition:'all .1s' }}/>
                ))}
              </div>
            </div>

            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Sono — {sono}/10</div>
              <div style={{ display:'flex', gap:5 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                  <div key={n} onClick={()=>setSono(n)} style={{ flex:1, height:32, borderRadius:6, cursor:'pointer', background:n<=sono?'#7F77DD':'var(--bg2)', border:`1px solid ${n<=sono?'#7F77DD':'var(--border)'}`, transition:'all .1s' }}/>
                ))}
              </div>
            </div>

            <div className="dc" style={{ marginBottom:0 }}>
              <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:5 }}>Nota do dia</label>
              <textarea className="inp" rows={2} placeholder="Como você está se sentindo?" value={notaTrack} onChange={e=>setNotaTrack(e.target.value)} style={{ resize:'none', fontFamily:'inherit', fontSize:13, marginBottom:0 }}/>
            </div>

            <button className="btn btn-d fw" onClick={salvarTracker} disabled={saving}>
              {saved?'✅ Salvo!':saving?'Salvando...':'💾 Salvar registro de hoje'}
            </button>
          </div>

          {/* Direita — último registro e tendências */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Último registro</div>
              {loading ? <div style={{ fontSize:12, color:'var(--ts)' }}>Carregando...</div>
              : ultimo ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ fontSize:12, color:'var(--ts)', marginBottom:4 }}>{new Date(ultimo.data+'T12:00:00').toLocaleDateString('pt-BR')}</div>
                  {ultimo.peso && (
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:12, color:'var(--tm)' }}>Peso</span>
                        <span style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>
                          {ultimo.peso} kg
                          {diffPeso && <span style={{ fontSize:11, color:Number(diffPeso)<0?'var(--gm)':'var(--am)', marginLeft:5 }}>{Number(diffPeso)>0?'+':''}{diffPeso}</span>}
                        </span>
                      </div>
                      <SparkLine data={pesoData.slice(-7)} cor="#1D9E75"/>
                    </div>
                  )}
                  {ultimo.energia && (
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:12, color:'var(--tm)' }}>Energia</span>
                        <span style={{ fontSize:13, fontWeight:500 }}>{ultimo.energia}/10</span>
                      </div>
                      <MiniBar val={ultimo.energia} max={10} cor="#1D9E75"/>
                    </div>
                  )}
                  {ultimo.sono && (
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:12, color:'var(--tm)' }}>Sono</span>
                        <span style={{ fontSize:13, fontWeight:500 }}>{ultimo.sono}/10</span>
                      </div>
                      <MiniBar val={ultimo.sono} max={10} cor="#7F77DD"/>
                    </div>
                  )}
                  {ultimo.nota && <div style={{ background:'#FFFFFF', borderRadius:8, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'8px 10px', fontSize:12, color:'var(--tm)', fontStyle:'italic' }}>"{ultimo.nota}"</div>}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'1.5rem 0', color:'var(--ts)', fontSize:13 }}>Nenhum registro ainda.<br/><span style={{ fontSize:12 }}>Comece hoje!</span></div>
              )}
            </div>

            {tracker.length > 1 && (
              <div className="dc" style={{ marginBottom:0 }}>
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Tendências (7 dias)</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {pesoData.length > 1 && <div><div style={{ fontSize:12, color:'var(--tm)', marginBottom:4 }}>Peso</div><SparkLine data={pesoData.slice(-7)} cor="#1D9E75"/></div>}
                  {energiaData.length > 1 && <div><div style={{ fontSize:12, color:'var(--tm)', marginBottom:4 }}>Energia</div><SparkLine data={energiaData.slice(-7)} cor="#1D9E75"/></div>}
                  {sonoData.length > 1 && <div><div style={{ fontSize:12, color:'var(--tm)', marginBottom:4 }}>Sono</div><SparkLine data={sonoData.slice(-7)} cor="#7F77DD"/></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── ABA SINTOMAS ────────────────────────────── */}
      {aba === 'sintomas' && (
        <div>
          {/* Formulário de registro */}
          <div className="dc" style={{ marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
              {[['1','Peptídeo'],['2','Efeitos'],['3','Intensidade'],['4','Nota']].map(([n,l],i)=>(
                <div key={n} style={{ display:'flex', alignItems:'center', flex:i<3?1:'auto' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, background:Number(n)<=stepD?'var(--dark)':'var(--bg2)', color:Number(n)<=stepD?'white':'var(--ts)' }}>
                      {Number(n)<stepD?'✓':n}
                    </div>
                    <div style={{ fontSize:10, color:Number(n)===stepD?'var(--tx)':'var(--ts)', whiteSpace:'nowrap' }}>{l}</div>
                  </div>
                  {i<3 && <div style={{ flex:1, height:1, background:Number(n)<stepD?'var(--dark)':'var(--border)', margin:'0 6px', marginBottom:16 }}/>}
                </div>
              ))}
            </div>

            {stepD===1 && (
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'1rem' }}>Qual peptídeo você aplicou hoje?</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:'1.25rem' }}>
                  {PEPTIDEOS_LISTA.map(p=>(
                    <div key={p} onClick={()=>setPeptideo(p)}
                      style={{ padding:'7px 14px', borderRadius:100, fontSize:13, fontWeight:500, cursor:'pointer', background:peptideo===p?'var(--dark)':'var(--bg2)', color:peptideo===p?'white':'var(--tm)', border:`1px solid ${peptideo===p?'var(--dark)':'var(--border)'}`, transition:'all .13s' }}>
                      {p}
                    </div>
                  ))}
                </div>
                <button className="btn btn-d" onClick={()=>peptideo&&setStepD(2)} disabled={!peptideo}>Próximo →</button>
              </div>
            )}

            {stepD===2 && (
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'1rem' }}>Quais efeitos você percebeu com <strong>{peptideo}</strong>?</div>
                {Object.entries(EFEITOS).map(([tipo,tags])=>(
                  <div key={tipo} style={{ marginBottom:'1rem' }}>
                    <div style={{ fontSize:11, fontWeight:500, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>
                      {tipo==='positivos'?'✅ Positivos':tipo==='neutros'?'➡️ Neutros':'⚠️ Atenção'}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {tags.map(t=>(
                        <div key={t} onClick={()=>setSelEf(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t])}
                          style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', background:selEf.includes(t)?COR_EF[tipo as keyof typeof COR_EF].bg:'var(--bg2)', color:selEf.includes(t)?COR_EF[tipo as keyof typeof COR_EF].text:'var(--tm)', border:`1px solid ${selEf.includes(t)?COR_EF[tipo as keyof typeof COR_EF].border:'var(--border)'}`, transition:'all .13s' }}>
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-o" onClick={()=>setStepD(1)}>← Voltar</button>
                  <button className="btn btn-d" onClick={()=>setStepD(3)}>Próximo →</button>
                </div>
              </div>
            )}

            {stepD===3 && (
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Como você está se sentindo no geral? — {intens}/10</div>
                <div style={{ display:'flex', gap:6, marginBottom:'1.5rem' }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                    <div key={n} onClick={()=>setIntens(n)}
                      style={{ flex:1, height:40, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:500, background:n===intens?'var(--dark)':'var(--bg2)', color:n===intens?'white':'var(--ts)', border:`1px solid ${n===intens?'var(--dark)':'var(--border)'}`, transition:'all .1s' }}>
                      {n}
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-o" onClick={()=>setStepD(2)}>← Voltar</button>
                  <button className="btn btn-d" onClick={()=>setStepD(4)}>Próximo →</button>
                </div>
              </div>
            )}

            {stepD===4 && (
              <div>
                <textarea className="inp" rows={3} placeholder="Alguma observação? (opcional)" value={notaD} onChange={e=>setNotaD(e.target.value)} style={{ resize:'none', fontFamily:'inherit', fontSize:13, marginBottom:'1rem' }}/>
                <div style={{ background:'#FFFFFF', borderRadius:10, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'1rem', marginBottom:'1rem', fontSize:12, color:'var(--tm)' }}>
                  <strong>{peptideo}</strong> · Intensidade {intens}/10
                  {selEf.length>0 && <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:4 }}>
                    {selEf.map(ef=>{ const t=tipoEf(ef); return <span key={ef} style={{ fontSize:11, padding:'2px 8px', borderRadius:100, background:COR_EF[t as keyof typeof COR_EF].bg, color:COR_EF[t as keyof typeof COR_EF].text, fontWeight:500 }}>{ef}</span>; })}
                  </div>}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-o" onClick={()=>setStepD(3)}>← Voltar</button>
                  <button className="btn btn-d" onClick={salvarDiario} disabled={saving}>{saving?'Salvando...':'💾 Salvar no diário'}</button>
                </div>
              </div>
            )}
          </div>

          {/* Histórico de sintomas */}
          {diario.length > 0 && (
            <div className="dc" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)', fontSize:11, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em' }}>Registros de sintomas</div>
              {diario.slice(0,10).map((e,i)=>(
                <div key={e.id||i} style={{ padding:'1rem 1.25rem', borderBottom:i<Math.min(diario.length,10)-1?'1px solid var(--border)':'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:12, color:'var(--ts)' }}>{new Date(e.data+'T12:00:00').toLocaleDateString('pt-BR')}</span>
                      <span style={{ fontSize:11, background:'var(--gp)', color:'var(--gm)', padding:'1px 8px', borderRadius:100, fontWeight:500 }}>{e.peptideo}</span>
                    </div>
                    <span style={{ fontSize:11, color:'var(--ts)' }}>{e.intensidade}/10</span>
                  </div>
                  {e.efeitos?.length>0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {e.efeitos.map((ef: string)=>{ const t=tipoEf(ef); return <span key={ef} style={{ fontSize:11, padding:'2px 7px', borderRadius:100, background:COR_EF[t as keyof typeof COR_EF].bg, color:COR_EF[t as keyof typeof COR_EF].text, fontWeight:500 }}>{ef}</span>; })}
                    </div>
                  )}
                  {e.nota && <div style={{ fontSize:12, color:'var(--tm)', fontStyle:'italic', marginTop:4 }}>{e.nota}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── ABA EVOLUÇÃO ────────────────────────────── */}
      {aba === 'evolucao' && (
        <div>
          {tracker.length === 0 ? (
            <div style={{ background:'#F7F7F7', border:'1.5px dashed var(--border)', borderRadius:14, padding:'3rem', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>📈</div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'.375rem' }}>Sem registros ainda</div>
              <div style={{ fontSize:13, color:'var(--ts)' }}>Comece registrando na aba "Registro diário"</div>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.25rem' }}>
                {[
                  { label:'Registros', val:tracker.length, icon:'📝' },
                  { label:'Peso inicial', val:tracker.filter(e=>e.peso).slice(-1)[0]?.peso?`${tracker.filter(e=>e.peso).slice(-1)[0].peso} kg`:'—', icon:'⚖️' },
                  { label:'Peso atual',  val:tracker.filter(e=>e.peso)[0]?.peso?`${tracker.filter(e=>e.peso)[0].peso} kg`:'—', icon:'⚖️' },
                  { label:'Variação',   val:tracker.filter(e=>e.peso)[0]?.peso&&tracker.filter(e=>e.peso).slice(-1)[0]?.peso?`${(tracker.filter(e=>e.peso)[0].peso-tracker.filter(e=>e.peso).slice(-1)[0].peso).toFixed(1)} kg`:'—', icon:'📉' },
                ].map(s=>(
                  <div key={s.label} className="dc" style={{ textAlign:'center', marginBottom:0 }}>
                    <div style={{ fontSize:'1.2rem', marginBottom:4 }}>{s.icon}</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:500, color:'var(--tx)', letterSpacing:'-.04em' }}>{s.val}</div>
                    <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="dc" style={{ padding:0, overflow:'hidden' }}>
                <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)', fontSize:11, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em' }}>Histórico completo</div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ background:'#FFFFFF' }}>
                        {['Data','Peso','Cintura','Energia','Sono','Nota'].map(h=>(
                          <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tracker.map((e,i)=>(
                        <tr key={e.id||i} style={{ borderBottom:'0.5px solid var(--border)' }}>
                          <td style={{ padding:'9px 14px', color:'var(--ts)' }}>{new Date(e.data+'T12:00:00').toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding:'9px 14px', fontWeight:500 }}>{e.peso?`${e.peso} kg`:'—'}</td>
                          <td style={{ padding:'9px 14px', color:'var(--tm)' }}>{e.cintura?`${e.cintura} cm`:'—'}</td>
                          <td style={{ padding:'9px 14px' }}>{e.energia?<MiniBar val={e.energia} max={10} cor="#1D9E75"/>:'—'}</td>
                          <td style={{ padding:'9px 14px' }}>{e.sono?<MiniBar val={e.sono} max={10} cor="#7F77DD"/>:'—'}</td>
                          <td style={{ padding:'9px 14px', color:'var(--tm)', fontStyle:e.nota?'italic':'normal' }}>{e.nota||'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── ABA FOTOS ───────────────────────────────── */}
      {aba === 'fotos' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
            <div style={{ fontSize:13, color:'var(--ts)' }}>
              {modoCompar ? `${comparar.length}/2 selecionadas — clique para marcar` : 'Clique para ampliar · Selecione 2 para comparar'}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {fotos.length >= 2 && (
                <button className="btn btn-o" style={{ fontSize:12 }}
                  onClick={()=>{ setModoCompar(v=>!v); setComparar([]); }}>
                  {modoCompar ? '✕ Cancelar' : '⬜ Comparar'}
                </button>
              )}
              {modoCompar && comparar.length === 2 && (
                <button className="btn btn-d" style={{ fontSize:12 }}
                  onClick={()=>setFotoViewer({ comparacao:true })}>
                  Ver comparação →
                </button>
              )}
              <button className="btn btn-d" style={{ fontSize:12 }}
                onClick={()=>fileRef.current?.click()} disabled={uploadando}>
                {uploadando ? 'Enviando...' : '📷 Adicionar foto'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFoto}/>
          </div>

          {erroFoto && (
            <div style={{ background:'#FAECE7', borderRadius:10, padding:'10px 14px', marginBottom:'1rem', fontSize:12, color:'#D85A30' }}>
              ⚠️ {erroFoto}
            </div>
          )}

          {fotos.length === 0 ? (
            <div style={{ background:'#F7F7F7', border:'1.5px dashed var(--border)', borderRadius:14, padding:'3rem', textAlign:'center', cursor:'pointer' }}
              onClick={()=>fileRef.current?.click()}>
              <div style={{ fontSize:'2.5rem', marginBottom:'.875rem' }}>📸</div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'.375rem' }}>Adicione sua primeira foto</div>
              <div style={{ fontSize:13, color:'var(--ts)' }}>Clique para fazer upload · Compare sua evolução ao longo do ciclo</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
              {fotos.map((f: any, i: number) => {
                const sel = comparar.some((x:any) => x.id === f.id);
                return (
                  <div key={f.id||i}
                    style={{ borderRadius:12, overflow:'hidden', border:`2px solid ${sel ? 'var(--green)' : 'var(--border)'}`, background:'#F7F7F7', cursor:'pointer', position:'relative', transition:'all .15s', transform: sel ? 'scale(1.02)' : 'none' }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.opacity = '0.92'; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    onClick={()=>{
                      if (modoCompar) {
                        if (sel) { setComparar((p:any[])=>p.filter((x:any)=>x.id!==f.id)); }
                        else if (comparar.length < 2) { setComparar((p:any[])=>[...p, f]); }
                      } else {
                        setFotoViewer(f);
                      }
                    }}>
                    {sel && (
                      <div style={{ position:'absolute', top:8, right:8, width:24, height:24, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'white', fontWeight:700, zIndex:2 }}>
                        {comparar.findIndex((x:any)=>x.id===f.id)+1}
                      </div>
                    )}
                    <img src={f.url} alt="" style={{ width:'100%', aspectRatio:'1/1', objectFit:'cover', display:'block' }}/>
                    <div style={{ padding:'7px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:11, color:'var(--ts)' }}>{new Date(f.created_at).toLocaleDateString('pt-BR')}</span>
                      {!modoCompar && <span style={{ fontSize:11, color:'var(--ts)' }}>🔍</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── LIGHTBOX ─────────────────────────────────── */}
      {fotoViewer && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.88)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
          onClick={e=>{ if(e.target===e.currentTarget){ setFotoViewer(null); setComparar([]); setModoCompar(false); }}}>

          <button style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,.15)', border:'none', color:'white', width:40, height:40, borderRadius:'50%', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000 }}
            onClick={()=>{ setFotoViewer(null); setComparar([]); setModoCompar(false); }}>
            ✕
          </button>

          {fotoViewer.comparacao ? (
            <div style={{ width:'100%', maxWidth:1000 }}>
              <div style={{ textAlign:'center', color:'rgba(255,255,255,.7)', fontSize:13, marginBottom:'1rem' }}>
                Comparação de evolução
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {comparar.map((f:any, i:number)=>(
                  <div key={f.id} style={{ borderRadius:12, overflow:'hidden', background:'rgba(255,255,255,.05)' }}>
                    <img src={f.url} alt="" style={{ width:'100%', maxHeight:'65vh', objectFit:'contain', display:'block' }}/>
                    <div style={{ padding:'10px', textAlign:'center', color:'rgba(255,255,255,.6)', fontSize:12 }}>
                      {i===0 ? '📅 Antes' : '📅 Depois'} · {new Date(f.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth:700, width:'100%' }}>
              <img src={fotoViewer.url} alt="" style={{ width:'100%', maxHeight:'78vh', objectFit:'contain', borderRadius:12, display:'block' }}/>
              <div style={{ textAlign:'center', color:'rgba(255,255,255,.6)', fontSize:12, marginTop:12 }}>
                {new Date(fotoViewer.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
              </div>
              {fotos.length > 1 && (
                <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:16 }}>
                  <button style={{ background:'rgba(255,255,255,.15)', border:'none', color:'white', padding:'8px 20px', borderRadius:100, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}
                    onClick={e=>{ e.stopPropagation(); const i=fotos.findIndex((f:any)=>f.id===fotoViewer.id); setFotoViewer(fotos[(i-1+fotos.length)%fotos.length]); }}>
                    ← Anterior
                  </button>
                  <span style={{ color:'rgba(255,255,255,.4)', fontSize:12, display:'flex', alignItems:'center' }}>
                    {fotos.findIndex((f:any)=>f.id===fotoViewer.id)+1} / {fotos.length}
                  </span>
                  <button style={{ background:'rgba(255,255,255,.15)', border:'none', color:'white', padding:'8px 20px', borderRadius:100, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}
                    onClick={e=>{ e.stopPropagation(); const i=fotos.findIndex((f:any)=>f.id===fotoViewer.id); setFotoViewer(fotos[(i+1)%fotos.length]); }}>
                    Próxima →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
