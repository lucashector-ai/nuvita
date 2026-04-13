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


function LineChart({ data, labels, cor, label, unit, height = 120 }: any) {
  if (!data || data.length < 2) return null;
  const w = 600, h = height;
  const pad = { t: 10, r: 20, b: 30, l: 40 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const x = (i: number) => pad.l + (i / (data.length - 1)) * iw;
  const y = (v: number) => pad.t + (1 - (v - min) / range) * ih;
  const pts = data.map((v: number, i: number) => `${x(i)},${y(v)}`).join(' ');

  // Linha de tendência linear
  const n = data.length;
  const sumX = data.reduce((_: any, __: any, i: number) => _ + i, 0);
  const sumY = data.reduce((a: number, v: number) => a + v, 0);
  const sumXY = data.reduce((a: number, v: number, i: number) => a + i * v, 0);
  const sumX2 = data.reduce((a: number, _: any, i: number) => a + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ty1 = intercept;
  const ty2 = slope * (n - 1) + intercept;

  // Projeção (mais 3 pontos)
  const proj = [ty2, slope * n + intercept, slope * (n + 1) + intercept, slope * (n + 2) + intercept];
  const allVals = [...data, ...proj];
  const minAll = Math.min(...allVals);
  const maxAll = Math.max(...allVals);
  const rangeAll = maxAll - minAll || 1;
  const xp = (i: number) => pad.l + (i / (data.length + 2)) * iw;
  const yp = (v: number) => pad.t + (1 - (v - minAll) / rangeAll) * ih;
  const xn = (i: number) => pad.l + (i / (data.length - 1)) * iw;
  const yn = (v: number) => pad.t + (1 - (v - minAll) / rangeAll) * ih;
  const ptsN = data.map((v: number, i: number) => `${xn(i)},${yn(v)}`).join(' ');
  const projPts = proj.map((v, i) => `${xp(data.length - 1 + i)},${yp(v)}`).join(' ');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>{label}</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--ts)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 16, height: 2, background: cor, display: 'inline-block', borderRadius: 1 }}/>Registrado</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 16, height: 2, background: '#D1D5DB', display: 'inline-block', borderRadius: 1, borderTop: '1px dashed #9CA3AF' }}/>Tendência</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <line key={p} x1={pad.l} y1={pad.t + p * ih} x2={pad.l + iw} y2={pad.t + p * ih}
            stroke="#F3F4F6" strokeWidth="1"/>
        ))}
        {/* Área */}
        <defs>
          <linearGradient id={`g${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={cor} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={`${xn(0)},${pad.t + ih} ${ptsN} ${xn(data.length-1)},${pad.t + ih}`}
          fill={`url(#g${label})`}/>
        {/* Linha principal */}
        <polyline points={ptsN} fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Linha de tendência */}
        <line x1={xn(0)} y1={yn(ty1)} x2={xn(data.length-1)} y2={yn(ty2)}
          stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4,3"/>
        {/* Projeção */}
        <polyline points={`${xn(data.length-1)},${yn(ty2)} ${projPts}`}
          fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4,3"/>
        {/* Pontos */}
        {data.map((v: number, i: number) => (
          <g key={i}>
            <circle cx={xn(i)} cy={yn(v)} r="3.5" fill="white" stroke={cor} strokeWidth="2"/>
          </g>
        ))}
        {/* Labels X */}
        {labels && labels.filter((_: any, i: number) => i % Math.ceil(labels.length / 5) === 0 || i === labels.length - 1).map((l: string, idx: number) => {
          const origIdx = labels.indexOf(l);
          return (
            <text key={idx} x={xn(origIdx)} y={pad.t + ih + 18} textAnchor="middle"
              fontSize="9" fill="#9CA3AF">{l}</text>
          );
        })}
        {/* Labels Y */}
        <text x={pad.l - 5} y={pad.t + 4} textAnchor="end" fontSize="9" fill="#9CA3AF">{max.toFixed(unit === 'kg' ? 1 : 0)}{unit}</text>
        <text x={pad.l - 5} y={pad.t + ih} textAnchor="end" fontSize="9" fill="#9CA3AF">{min.toFixed(unit === 'kg' ? 1 : 0)}{unit}</text>
      </svg>
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
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
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
              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                {(() => {
                  const pesosOrdenados = [...entries].reverse().filter(e=>e.peso);
                  const inicial = pesosOrdenados[0]?.peso;
                  const atual = pesosOrdenados[pesosOrdenados.length-1]?.peso;
                  const variacao = inicial && atual ? (atual - inicial) : null;
                  const mediaEnergia = entries.filter(e=>e.energia).length > 0
                    ? (entries.filter(e=>e.energia).reduce((a,e)=>a+(e.energia||0),0)/entries.filter(e=>e.energia).length).toFixed(1)
                    : null;
                  return [
                    { label:'Registros', val:entries.length.toString(), icon:'📝', cor:'#6B7280' },
                    { label:'Peso inicial', val:inicial?`${inicial} kg`:'—', icon:'⚖️', cor:'#6B7280' },
                    { label:'Peso atual', val:atual?`${atual} kg`:'—', icon:'⚖️', cor:'#6B7280' },
                    { label:'Variação total', val:variacao!==null?`${variacao>0?'+':''}${variacao.toFixed(1)} kg`:'—', icon: variacao!==null&&variacao<0?'📉':'📈', cor:variacao!==null&&variacao<0?'#0F6E56':'#D85A30' },
                  ].map(s => (
                    <div key={s.label} style={{ background:'white', borderRadius:12, padding:'1rem', textAlign:'center', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
                      <div style={{ fontSize:'1.3rem', marginBottom:4 }}>{s.icon}</div>
                      <div style={{ fontSize:'1.1rem', fontWeight:600, color:s.cor, letterSpacing:'-.03em' }}>{s.val}</div>
                      <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginTop:2 }}>{s.label}</div>
                    </div>
                  ));
                })()}
              </div>

              {/* Gráficos */}
              {(() => {
                const rev = [...entries].reverse();
                const labels = rev.map(e => new Date(e.data).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'}));
                const pesos = rev.filter(e=>e.peso).map(e=>e.peso!);
                const pesoLabels = rev.filter(e=>e.peso).map(e => new Date(e.data).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'}));
                const energias = rev.filter(e=>e.energia).map(e=>e.energia!);
                const enLabels = rev.filter(e=>e.energia).map(e => new Date(e.data).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'}));
                const sonos = rev.filter(e=>e.sono).map(e=>e.sono!);
                const sonoLabels = rev.filter(e=>e.sono).map(e => new Date(e.data).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'}));
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {pesos.length >= 2 && (
                      <div style={{ background:'white', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
                        <LineChart data={pesos} labels={pesoLabels} cor="#1D9E75" label="Peso (kg)" unit="kg"/>
                      </div>
                    )}
                    {energias.length >= 2 && (
                      <div style={{ background:'white', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
                        <LineChart data={energias} labels={enLabels} cor="#F59E0B" label="Energia (1-10)" unit=""/>
                      </div>
                    )}
                    {sonos.length >= 2 && (
                      <div style={{ background:'white', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
                        <LineChart data={sonos} labels={sonoLabels} cor="#7F77DD" label="Sono (1-10)" unit=""/>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Tabela histórico */}
              <div style={{ background:'white', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Histórico completo</div>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr>
                        {['Data','Peso','Energia','Sono','Nota'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', background:'#F9FAFB' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e,i) => (
                        <tr key={e.id||i} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'10px 14px', color:'var(--ts)' }}>{new Date(e.data).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding:'10px 14px', fontWeight:500, color:'#1D9E75' }}>{e.peso?`${e.peso} kg`:'—'}</td>
                          <td style={{ padding:'10px 14px' }}>{e.energia?<MiniBar val={e.energia} max={10} cor="#F59E0B"/>:'—'}</td>
                          <td style={{ padding:'10px 14px' }}>{e.sono?<MiniBar val={e.sono} max={10} cor="#7F77DD"/>:'—'}</td>
                          <td style={{ padding:'10px 14px', color:'var(--tm)', fontStyle:e.nota?'italic':'normal', maxWidth:200 }}>{e.nota||'—'}</td>
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
