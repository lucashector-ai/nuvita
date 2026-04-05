// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const MESES   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DS_FULL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const DS      = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

// Cor por categoria do peptídeo
const CAT_COLOR: Record<string,string> = {
  'Emagrecimento': '#7C3AED',
  'GH/Composição': '#2563EB',
  'Recuperação':   '#059669',
  'Anti-aging':    '#D97706',
  'Longevidade':   '#8B5CF6',
  'Sexual':        '#DB2777',
  'Gut/Inflamação':'#0891B2',
  'Experimental':  '#6B7280',
};
const CAT_BG: Record<string,string> = {
  'Emagrecimento': '#EDE9FE',
  'GH/Composição': '#DBEAFE',
  'Recuperação':   '#D1FAE5',
  'Anti-aging':    '#FEF3C7',
  'Longevidade':   '#EDE9FE',
  'Sexual':        '#FCE7F3',
  'Gut/Inflamação':'#CFFAFE',
  'Experimental':  '#F3F4F6',
};

function diasSemana(p: any): number[] {
  const f = (p.frequencia || p.timing || '').toLowerCase();
  if (f.includes('semanal') || f.includes('1x/sem')) return [1];
  if (f.includes('2x')) return [1,4];
  if (f.includes('3x')) return [1,3,5];
  if (f.includes('5x') || f.includes('5-6x') || f.includes('6x')) return [1,2,3,4,5];
  return [0,1,2,3,4,5,6]; // diário
}

interface Props { items: any[]; }

export default function SectionCalendario({ items = [] }: Props) {
  const hoje      = new Date();
  const [mes,  setMes]  = useState(hoje.getMonth());
  const [ano,  setAno]  = useState(hoje.getFullYear());
  const [tracker, setTracker] = useState<any[]>([]);
  const [adesao,  setAdesao]  = useState<any[]>([]);
  const [diaAtivo, setDia]    = useState<number|null>(hoje.getDate());
  const [view, setView]       = useState<'mes'|'semana'>('mes');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: t }, { data: a }] = await Promise.all([
        supabase.from('tracker_entries').select('data,energia,sono,peso').eq('user_id', user.id),
        supabase.from('adesao_diaria').select('data,completo').eq('user_id', user.id),
      ]);
      setTracker(t || []);
      setAdesao(a || []);
    })();
  }, []);

  const diasNoMes   = new Date(ano, mes+1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const hojeStr     = hoje.toISOString().split('T')[0];

  const getEventosDia = (dia: number) => {
    const dow   = new Date(ano, mes, dia).getDay();
    const data  = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const peps  = items.filter(p => diasSemana(p).includes(dow));
    const t     = tracker.find(x => x.data === data);
    const a     = adesao.find(x => x.data === data);
    const isFut = data > hojeStr;
    const isHoj = data === hojeStr;
    return { data, peps, t, a, isFut, isHoj, dow };
  };

  // Calcula semana atual para view semanal
  const semanaAtual = () => {
    const ref   = diaAtivo ? new Date(ano, mes, diaAtivo) : hoje;
    const dow   = ref.getDay();
    const inicio = new Date(ref); inicio.setDate(ref.getDate() - dow);
    return Array.from({length:7}, (_,i) => { const d = new Date(inicio); d.setDate(inicio.getDate()+i); return d; });
  };

  const diaAtivoInfo = diaAtivo ? getEventosDia(diaAtivo) : null;

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, minHeight:500 }}>
      {/* CALENDÁRIO PRINCIPAL */}
      <div>
        {/* Header do calendário */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:16, fontWeight:600, color:'var(--tx)' }}>
              {MESES[mes]} {ano}
            </span>
            <button onClick={() => { const d=new Date(ano,mes-1); setMes(d.getMonth()); setAno(d.getFullYear()); }}
              style={{ width:28, height:28, borderRadius:6, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>‹</button>
            <button onClick={() => { const d=new Date(ano,mes+1); setMes(d.getMonth()); setAno(d.getFullYear()); }}
              style={{ width:28, height:28, borderRadius:6, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>›</button>
            <button onClick={() => { setMes(hoje.getMonth()); setAno(hoje.getFullYear()); setDia(hoje.getDate()); }}
              style={{ padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', fontSize:12, color:'var(--tm)', fontFamily:'inherit' }}>
              Hoje
            </button>
          </div>
          {/* Toggle de view */}
          <div style={{ display:'flex', background:'var(--bg2)', borderRadius:8, padding:3, gap:2 }}>
            {[['mes','Mês'],['semana','Semana']].map(([v,l]) => (
              <button key={v} onClick={() => setView(v as any)}
                style={{ padding:'4px 10px', borderRadius:5, border:'none', fontSize:12, cursor:'pointer', fontFamily:'inherit',
                  background:view===v?'var(--bg)':'transparent', color:view===v?'var(--tx)':'var(--ts)',
                  fontWeight:view===v?500:400 }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {view === 'mes' ? (
          <>
            {/* Cabeçalho dos dias da semana */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1, marginBottom:1 }}>
              {DS.map((d,i) => (
                <div key={d} style={{ padding:'6px 8px', fontSize:11, fontWeight:600, color: i===0||i===6 ? '#D85A30' : 'var(--ts)', textAlign:'center' }}>{d}</div>
              ))}
            </div>

            {/* Grade dos dias */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1, border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
              {Array.from({length:primeiroDia}).map((_,i) => (
                <div key={`e${i}`} style={{ minHeight:90, background:'var(--bg2)', padding:6 }}/>
              ))}
              {Array.from({length:diasNoMes}).map((_,i) => {
                const dia  = i+1;
                const info = getEventosDia(dia);
                const ativo = diaAtivo === dia;
                const dow   = (primeiroDia+i) % 7;
                const fimDeSemana = dow===0 || dow===6;

                return (
                  <div key={dia}
                    onClick={() => setDia(ativo ? null : dia)}
                    style={{
                      minHeight:90, padding:'6px 4px', cursor:'pointer',
                      background: info.isHoj ? '#F0FDF4' : ativo ? '#F8FAFF' : fimDeSemana ? '#FAFAFA' : 'var(--bg)',
                      borderTop: `1px solid var(--border)`,
                      borderLeft: `1px solid var(--border)`,
                      outline: ativo ? '2px solid var(--dark)' : 'none',
                      outlineOffset: -1,
                      transition:'background .1s',
                      position:'relative',
                    }}>
                    {/* Número do dia */}
                    <div style={{
                      width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                      background: info.isHoj ? '#0F6E56' : 'transparent',
                      fontSize:12, fontWeight:info.isHoj?700:400,
                      color: info.isHoj ? 'white' : fimDeSemana ? '#D85A30' : 'var(--tx)',
                      marginBottom:3,
                    }}>{dia}</div>

                    {/* Eventos do dia — estilo Notion */}
                    {!info.isFut && info.peps.slice(0,3).map((p:any,idx:number) => {
                      const cor = CAT_COLOR[p.categoria||''] || '#6B7280';
                      const bg  = CAT_BG[p.categoria||''] || '#F3F4F6';
                      return (
                        <div key={idx} style={{
                          fontSize:9, padding:'1px 4px', borderRadius:3, marginBottom:1,
                          background:bg, color:cor, fontWeight:500,
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                          display:'flex', alignItems:'center', gap:2,
                        }}>
                          <span style={{flexShrink:0,fontSize:8}}>{p.emoji||'💊'}</span>
                          {p.nome.split(' ')[0]}
                        </div>
                      );
                    })}
                    {!info.isFut && info.peps.length > 3 && (
                      <div style={{ fontSize:9, color:'var(--ts)', paddingLeft:2 }}>+{info.peps.length-3} mais</div>
                    )}
                    {/* Dot de adesão */}
                    {info.a?.completo && (
                      <div style={{ position:'absolute', top:4, right:4, width:5, height:5, borderRadius:'50%', background:'#0F6E56' }}/>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* VIEW SEMANA */
          <>
            <div style={{ display:'grid', gridTemplateColumns:'50px repeat(7,1fr)', gap:1, marginBottom:1 }}>
              <div/>
              {semanaAtual().map((d,i) => {
                const isHoj = d.toISOString().split('T')[0] === hojeStr;
                return (
                  <div key={i} style={{ textAlign:'center', padding:'8px 4px' }}>
                    <div style={{ fontSize:11, color:'var(--ts)' }}>{DS[d.getDay()]}</div>
                    <div style={{
                      width:30, height:30, borderRadius:'50%', margin:'4px auto 0',
                      background:isHoj?'#0F6E56':'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, fontWeight:isHoj?700:400, color:isHoj?'white':'var(--tx)',
                    }}>{d.getDate()}</div>
                  </div>
                );
              })}
            </div>
            {/* Linhas de horário */}
            {['Manhã','Tarde','Noite'].map(turno => (
              <div key={turno} style={{ display:'grid', gridTemplateColumns:'50px repeat(7,1fr)', gap:1, borderTop:'1px solid var(--border)' }}>
                <div style={{ fontSize:10, color:'var(--ts)', padding:'8px 4px', textAlign:'right', paddingRight:8 }}>{turno}</div>
                {semanaAtual().map((d,i) => {
                  const dia  = d.getDate();
                  const m    = d.getMonth();
                  const y    = d.getFullYear();
                  if (m !== mes || y !== ano) return <div key={i} style={{ background:'#FAFAFA', minHeight:60 }}/>;
                  const info = getEventosDia(dia);
                  const pepsDoTurno = info.peps.filter((p:any) => {
                    const t = (p.timing||'').toLowerCase();
                    if (turno==='Manhã') return t.includes('manhã')||t.includes('jejum')||t.includes('acordar')||t.includes('manha');
                    if (turno==='Tarde') return t.includes('tarde')||t.includes('pré')||t.includes('pre')||t.includes('treino');
                    return t.includes('dormir')||t.includes('noite');
                  });
                  return (
                    <div key={i} style={{ minHeight:60, padding:3, borderLeft:'1px solid var(--border)' }}>
                      {pepsDoTurno.map((p:any,idx:number) => {
                        const cor = CAT_COLOR[p.categoria||''] || '#6B7280';
                        const bg  = CAT_BG[p.categoria||''] || '#F3F4F6';
                        return (
                          <div key={idx} style={{ fontSize:9, padding:'2px 4px', borderRadius:3, marginBottom:2, background:bg, color:cor, fontWeight:500 }}>
                            {p.emoji||'💊'} {p.nome.split(' ')[0]}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}

        {/* Legenda de categorias */}
        <div style={{ display:'flex', gap:10, marginTop:12, flexWrap:'wrap' }}>
          {Object.entries(CAT_COLOR).filter(([cat]) => items.some(p => p.categoria===cat)).map(([cat,cor]) => (
            <div key={cat} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--ts)' }}>
              <div style={{ width:8, height:8, borderRadius:2, background:cor }}/>
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* SIDEBAR — Painel do dia */}
      <div style={{ borderLeft:'1px solid var(--border)', paddingLeft:20 }}>
        {diaAtivoInfo ? (
          <>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>
                {DS_FULL[diaAtivoInfo.dow]}, {diaAtivo} de {MESES[mes]}
              </div>
              {diaAtivoInfo.isHoj && (
                <span style={{ fontSize:10, color:'var(--gm)', fontWeight:600, background:'var(--gp)', padding:'1px 8px', borderRadius:100 }}>Hoje</span>
              )}
            </div>

            {/* Aplicações do dia */}
            {diaAtivoInfo.peps.length > 0 ? (
              <div>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:8 }}>
                  {diaAtivoInfo.peps.length} aplicação{diaAtivoInfo.peps.length>1?'s':''}
                </div>
                {diaAtivoInfo.peps.map((p:any, i:number) => {
                  const cor = CAT_COLOR[p.categoria||''] || '#6B7280';
                  const bg  = CAT_BG[p.categoria||''] || '#F3F4F6';
                  return (
                    <div key={i} style={{ marginBottom:8, background:'var(--bg2)', borderRadius:10, padding:'10px 12px', borderLeft:`3px solid ${cor}` }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:'1rem' }}>{p.emoji||'💊'}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--tx)' }}>{p.nome}</div>
                          <div style={{ fontSize:10, color:'var(--ts)', marginTop:1 }}>
                            {p.dose_calculada||`${p.dose_min||''}${p.unidade||'mcg'}`} · {p.via||'SC'}
                          </div>
                        </div>
                        {diaAtivoInfo.a?.completo && <span style={{ fontSize:12, color:'var(--gm)' }}>✓</span>}
                      </div>
                      {p.timing && (
                        <div style={{ fontSize:10, color:'var(--ts)', marginTop:6, paddingTop:6, borderTop:'1px solid var(--border)' }}>
                          🕐 {p.timing}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize:12, color:'var(--ts)', textAlign:'center', padding:'2rem 0' }}>
                {diaAtivoInfo.isFut ? '📅 Dia futuro' : 'Dia sem aplicações'}
              </div>
            )}

            {/* Registro do dia */}
            {diaAtivoInfo.t && (
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:8 }}>Registro</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {[['⚡','Energia',diaAtivoInfo.t.energia],['😴','Sono',diaAtivoInfo.t.sono],
                    ['⚖️','Peso',diaAtivoInfo.t.peso?`${diaAtivoInfo.t.peso}kg`:'—']].map(([ico,lbl,val]) => (
                    <div key={lbl} style={{ background:'var(--bg2)', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:10, color:'var(--ts)' }}>{ico} {lbl}</div>
                      <div style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{val||'—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize:12, color:'var(--ts)', textAlign:'center', paddingTop:'3rem' }}>
            Clique em um dia para ver os detalhes
          </div>
        )}

        {/* Resumo do mês */}
        <div style={{ marginTop:24, paddingTop:16, borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:10 }}>Resumo do mês</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'var(--ts)' }}>✓ Dias com adesão</span>
              <span style={{ fontWeight:600 }}>{adesao.filter(a => { const [y,m] = a.data.split('-').map(Number); return y===ano && m===mes+1 && a.completo; }).length}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'var(--ts)' }}>📊 Registros</span>
              <span style={{ fontWeight:600 }}>{tracker.filter(t => { const [y,m] = t.data.split('-').map(Number); return y===ano && m===mes+1; }).length}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'var(--ts)' }}>💊 Peptídeos ativos</span>
              <span style={{ fontWeight:600 }}>{items.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
