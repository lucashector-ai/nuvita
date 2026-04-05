// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Entry {
  id?: string; data: string; peso?: number; cintura?: number;
  energia?: number; sono?: number; nota?: string;
}

function hoje() { return new Date().toISOString().split('T')[0]; }

function hojeLabel() { return new Date().toLocaleDateString('pt-BR'); }

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
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const w = 120, h = 32;
  const x = (i: number) => (i / (data.length-1)) * w;
  const y = (v: number) => h - ((v-min)/(max-min)) * h;
  const pts = data.map((v: number, i: number) => `${x(i)},${y(v)}`).join(' ');
  const trend = data[data.length-1] - data[0];
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

export default function SectionTracker({ userId }: { userId: string | null }) {
  const [tab,     setTab]     = useState<'registrar'|'evolucao'|'fotos'>('registrar');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [peso,    setPeso]    = useState('');
  const [cintura, setCintura] = useState('');
  const [energia, setEnergia] = useState(7);
  const [sono,    setSono]    = useState(7);
  const [nota,    setNota]    = useState('');

  useEffect(() => {
    if (!userId) return;
    carregarEntries();
  }, [userId]);

  const carregarEntries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tracker_entries')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const [erroSave, setErroSave] = useState('');

  const salvar = async () => {
    if (!userId) return;
    setSaving(true);
    setErroSave('');
    const entry = {
      user_id: userId,
      data: hoje(),
      peso:    peso    ? parseFloat(peso)    : null,
      cintura: cintura ? parseFloat(cintura) : null,
      energia, sono,
      nota: nota || null,
    };

    // Tenta upsert primeiro, se falhar faz insert/update manual
    let { error } = await supabase
      .from('tracker_entries')
      .upsert(entry, { onConflict: 'user_id,data' });

    if (error) {
      // Fallback: verifica se já existe e faz update ou insert
      const { data: existe } = await supabase
        .from('tracker_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('data', hoje())
        .maybeSingle();

      if (existe) {
        const { error: errUp } = await supabase
          .from('tracker_entries')
          .update({ peso: entry.peso, cintura: entry.cintura, energia, sono, nota: entry.nota })
          .eq('user_id', userId)
          .eq('data', hoje());
        error = errUp;
      } else {
        const { error: errIn } = await supabase
          .from('tracker_entries')
          .insert(entry);
        error = errIn;
      }
    }

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setPeso(''); setCintura(''); setNota('');
      carregarEntries();
    } else {
      setErroSave(error.message);
    }
    setSaving(false);
  };

  const ultimo   = entries[0];
  const anterior = entries[1];
  const diffPeso = ultimo?.peso && anterior?.peso ? (ultimo.peso - anterior.peso).toFixed(1) : null;
  const pesoData    = [...entries].reverse().filter(e=>e.peso).map(e=>e.peso!);
  const energiaData = [...entries].reverse().filter(e=>e.energia).map(e=>e.energia!);
  const sonoData    = [...entries].reverse().filter(e=>e.sono).map(e=>e.sono!);

  return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Tracker de evolução</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Registre sua evolução diária e acompanhe o progresso</p>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'1.5rem' }}>
        {[['registrar','✏️ Registrar hoje'],['evolucao','📈 Ver evolução'],['fotos','📸 Fotos']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v as any)}
            style={{ padding:'10px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:tab===v?'var(--tx)':'var(--ts)', borderBottom:tab===v?'2px solid var(--dark)':'2px solid transparent' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'registrar' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Medidas — {hojeLabel()}</div>
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

            <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Energia — {energia}/10</div>
              <div style={{ display:'flex', gap:5 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div key={n} onClick={() => setEnergia(n)}
                    style={{ flex:1, height:32, borderRadius:6, cursor:'pointer', background:n<=energia?'var(--green)':'var(--bg2)', border:`1px solid ${n<=energia?'var(--green)':'var(--border)'}`, transition:'all .1s' }}/>
                ))}
              </div>
            </div>

            <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Sono — {sono}/10</div>
              <div style={{ display:'flex', gap:5 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div key={n} onClick={() => setSono(n)}
                    style={{ flex:1, height:32, borderRadius:6, cursor:'pointer', background:n<=sono?'#7F77DD':'var(--bg2)', border:`1px solid ${n<=sono?'#7F77DD':'var(--border)'}`, transition:'all .1s' }}/>
                ))}
              </div>
            </div>

            <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.25rem' }}>
              <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:5 }}>Nota do dia</label>
              <textarea className="inp" rows={2} placeholder="Como você está se sentindo?" value={nota} onChange={e=>setNota(e.target.value)} style={{ resize:'none', fontFamily:'inherit', fontSize:13, marginBottom:0 }}/>
            </div>

            {erroSave && (
              <div style={{ background:'#FAECE7', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#D85A30', marginBottom:8 }}>
                Erro ao salvar: {erroSave}
              </div>
            )}
            <button className="btn btn-d fw" onClick={salvar} disabled={saving}>
              {saved ? '✅ Salvo!' : saving ? 'Salvando...' : '💾 Salvar registro de hoje'}
            </button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Último registro</div>
              {loading ? (
                <div style={{ fontSize:12, color:'var(--ts)' }}>Carregando...</div>
              ) : ultimo ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ fontSize:12, color:'var(--ts)', marginBottom:4 }}>{new Date(ultimo.data).toLocaleDateString('pt-BR')}</div>
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
                <div style={{ textAlign:'center', padding:'1.5rem 0', color:'var(--ts)', fontSize:13 }}>
                  Nenhum registro ainda.<br/>
                  <span style={{ fontSize:12 }}>Comece registrando hoje!</span>
                </div>
              )}
            </div>

            {entries.length > 1 && (
              <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, padding:'1.25rem' }}>
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

      {tab === 'evolucao' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13 }}>Carregando registros...</div>
          ) : entries.length === 0 ? (
            <div style={{ background:'#F7F7F7', border:'1.5px dashed var(--border)', borderRadius:14, padding:'3rem', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>📊</div>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'.375rem' }}>Sem registros ainda</div>
              <div style={{ fontSize:13, color:'var(--ts)' }}>Comece registrando na aba "Registrar hoje"</div>
            </div>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                {[
                  { label:'Registros', val:entries.length.toString(), icon:'📝' },
                  { label:'Peso inicial', val:entries[entries.length-1]?.peso?`${entries[entries.length-1].peso} kg`:'—', icon:'⚖️' },
                  { label:'Peso atual', val:entries[0]?.peso?`${entries[0].peso} kg`:'—', icon:'⚖️' },
                  { label:'Variação', val:entries[0]?.peso&&entries[entries.length-1]?.peso?`${(entries[0].peso-entries[entries.length-1].peso).toFixed(1)} kg`:'—', icon:'📉' },
                ].map(s => (
                  <div key={s.label} style={{ background:'#F7F7F7', border:'none', borderRadius:12, padding:'1rem', textAlign:'center' }}>
                    <div style={{ fontSize:'1.3rem', marginBottom:4 }}>{s.icon}</div>
                    <div style={{ fontSize:'1.2rem', fontWeight:500, color:'var(--tx)', letterSpacing:'-.04em' }}>{s.val}</div>
                    <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#F7F7F7', border:'none', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Histórico completo</div>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ background:'#FFFFFF' }}>
                        {['Data','Peso','Cintura','Energia','Sono','Nota'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e,i) => (
                        <tr key={e.id||i} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'10px 14px', color:'var(--ts)' }}>{new Date(e.data).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding:'10px 14px', fontWeight:500 }}>{e.peso?`${e.peso} kg`:'—'}</td>
                          <td style={{ padding:'10px 14px', color:'var(--tm)' }}>{e.cintura?`${e.cintura} cm`:'—'}</td>
                          <td style={{ padding:'10px 14px' }}>{e.energia?<MiniBar val={e.energia} max={10} cor="#1D9E75"/>:'—'}</td>
                          <td style={{ padding:'10px 14px' }}>{e.sono?<MiniBar val={e.sono} max={10} cor="#7F77DD"/>:'—'}</td>
                          <td style={{ padding:'10px 14px', color:'var(--tm)', fontStyle:e.nota?'italic':'normal' }}>{e.nota||'—'}</td>
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

      {tab === 'fotos' && (
        <div style={{ background:'#F7F7F7', border:'1.5px dashed var(--border)', borderRadius:14, padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'.875rem' }}>📸</div>
          <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'.375rem' }}>Registro fotográfico</div>
          <div style={{ fontSize:13, color:'var(--ts)', marginBottom:'1.5rem' }}>Em breve — fotos antes/depois ao longo do ciclo</div>
        </div>
      )}
    </div>
  );
}
