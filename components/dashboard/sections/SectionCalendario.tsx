// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const MESES   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DS      = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DS_FULL = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

const CAT_COLOR: Record<string,string> = {
  'Emagrecimento':'#7C3AED','GH/Composição':'#2563EB','Recuperação':'#059669',
  'Anti-aging':'#D97706','Longevidade':'#8B5CF6','Sexual':'#DB2777',
  'Gut/Inflamação':'#0891B2','Experimental':'#6B7280',
};
const CAT_BG: Record<string,string> = {
  'Emagrecimento':'#F3F0FF','GH/Composição':'#EFF6FF','Recuperação':'#ECFDF5',
  'Anti-aging':'#FFFBEB','Longevidade':'#F3F0FF','Sexual':'#FDF2F8',
  'Gut/Inflamação':'#ECFEFF','Experimental':'#F9FAFB',
};

// Dias da semana que o peptídeo deve ser aplicado
function calcDias(p: any): number[] {
  const f = ((p.frequencia||'')+(p.timing||'')).toLowerCase();
  if (f.includes('2x')) return [1,4];
  if (f.includes('3x')) return [1,3,5];
  if (f.includes('5x')||f.includes('5-6x')||f.includes('6x')) return [1,2,3,4,5];
  if (f.includes('semanal')||f.includes('1x/sem')) return [1];
  return [0,1,2,3,4,5,6]; // diário
}

export default function SectionCalendario({ items, peso, protoAtivo }: any) {
  const peps  = (items||[]);
  const hoje  = new Date();
  const [mes,  setMes]    = useState(hoje.getMonth());
  const [ano,  setAno]    = useState(hoje.getFullYear());
  const [view, setView]   = useState<'mes'|'semana'>('mes');
  const [diaAtivo, setDia]= useState(hoje.getDate());
  const [tracker, setT]   = useState<any[]>([]);
  const [adesao,  setA]   = useState<any[]>([]);
  const hojeStr           = hoje.toISOString().split('T')[0];

  useEffect(() => {
    (async () => {
      try {
        const { data:{user} } = await supabase.auth.getUser();
        if (!user) return;
        const [{ data:t },{ data:a }] = await Promise.all([
          supabase.from('tracker_entries').select('data,energia,sono,peso').eq('user_id',user.id),
          supabase.from('adesao_diaria').select('data,completo').eq('user_id',user.id),
        ]);
        setT(t||[]); setA(a||[]);
      } catch {}
    })();
  }, []);

  const diasNoMes   = new Date(ano,mes+1,0).getDate();
  const primeiroDia = new Date(ano,mes,1).getDay();

  const infoDia = (dia: number) => {
    const data  = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const dow   = new Date(ano,mes,dia).getDay();
    const pDia  = peps.filter((p:any) => calcDias(p).includes(dow));
    const t     = tracker.find((x:any) => x.data===data);
    const a     = adesao.find((x:any) => x.data===data);
    return { data, dow, pDia, t, a, isFut:data>hojeStr, isHoj:data===hojeStr };
  };

  const infoAtivo = infoDia(diaAtivo);

  // Semana do dia ativo
  const semana = (() => {
    const ref = new Date(ano,mes,diaAtivo);
    const dow = ref.getDay();
    return Array.from({length:7},(_,i)=>{ const d=new Date(ref); d.setDate(ref.getDate()-dow+i); return d; });
  })();

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:24, alignItems:'start' }}>
      {/* Calendário */}
      <div>
        {/* Controls */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={()=>{ const d=new Date(ano,mes-1); setMes(d.getMonth()); setAno(d.getFullYear()); }}
              style={{ width:28,height:28,borderRadius:6,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>‹</button>
            <span style={{ fontSize:15,fontWeight:600,minWidth:140,textAlign:'center' }}>{MESES[mes]} {ano}</span>
            <button onClick={()=>{ const d=new Date(ano,mes+1); setMes(d.getMonth()); setAno(d.getFullYear()); }}
              style={{ width:28,height:28,borderRadius:6,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>›</button>
            <button onClick={()=>{ setMes(hoje.getMonth()); setAno(hoje.getFullYear()); setDia(hoje.getDate()); }}
              style={{ padding:'4px 10px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:'var(--tm)' }}>Hoje</button>
          </div>
          <div style={{ display:'flex',background:'var(--bg2)',borderRadius:8,padding:3,gap:2 }}>
            {(['mes','semana'] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                style={{ padding:'4px 12px',borderRadius:5,border:'none',fontSize:12,cursor:'pointer',fontFamily:'inherit',
                  background:view===v?'var(--bg)':'transparent',color:view===v?'var(--tx)':'var(--ts)',fontWeight:view===v?500:400 }}>
                {v==='mes'?'Mês':'Semana'}
              </button>
            ))}
          </div>
        </div>

        {view==='mes' ? (
          <>
            {/* Dias da semana */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:2 }}>
              {DS.map((d,i)=>(
                <div key={d} style={{ textAlign:'center',fontSize:11,fontWeight:600,padding:'5px 0',
                  color:i===0||i===6?'#D85A30':'var(--ts)' }}>{d}</div>
              ))}
            </div>
            {/* Grade */}
            <div style={{ border:'1px solid var(--border)',borderRadius:12,overflow:'hidden' }}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)' }}>
                {Array.from({length:primeiroDia}).map((_,i)=>(
                  <div key={`e${i}`} style={{ minHeight:96,background:'#FAFAFA',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)' }}/>
                ))}
                {Array.from({length:diasNoMes}).map((_,i)=>{
                  const dia  = i+1;
                  const inf  = infoDia(dia);
                  const sel  = diaAtivo===dia;
                  const col  = (primeiroDia+i)%7;
                  const fds  = col===0||col===6;
                  return (
                    <div key={dia} onClick={()=>setDia(dia)}
                      style={{
                        minHeight:96,padding:'7px 5px',cursor:'pointer',
                        background:inf.isHoj?'#F0FDF4':sel?'#F8FAFF':fds?'#FAFAFA':'var(--bg)',
                        borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)',
                        outline:sel?'2px solid #111':'none',outlineOffset:-1,position:'relative',
                        transition:'background .1s',zIndex:sel?1:0,
                      }}>
                      {/* Número */}
                      <div style={{
                        width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                        background:inf.isHoj?'#0F6E56':'transparent',marginBottom:3,
                        fontSize:12,fontWeight:inf.isHoj?700:400,
                        color:inf.isHoj?'white':fds?'#D85A30':'var(--tx)',
                      }}>{dia}</div>
                      {/* Eventos peptídeos */}
                      {!inf.isFut && inf.pDia.slice(0,2).map((p:any,idx:number)=>{
                        const cor=CAT_COLOR[p.categoria]||'#6B7280';
                        const bg=CAT_BG[p.categoria]||'#F3F4F6';
                        return (
                          <div key={idx} style={{ fontSize:9,padding:'1px 5px',borderRadius:3,marginBottom:1,
                            background:bg,color:cor,fontWeight:600,
                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                            display:'flex',alignItems:'center',gap:2 }}>
                            <span style={{flexShrink:0}}>{p.emoji||'💊'}</span>
                            <span style={{overflow:'hidden',textOverflow:'ellipsis'}}>{p.nome?.split(' ')[0]}</span>
                          </div>
                        );
                      })}
                      {!inf.isFut && inf.pDia.length>2 && (
                        <div style={{fontSize:9,color:'var(--ts)',paddingLeft:2}}>+{inf.pDia.length-2} mais</div>
                      )}
                      {/* Dot adesão */}
                      {inf.a?.completo && (
                        <div style={{position:'absolute',top:6,right:6,width:5,height:5,borderRadius:'50%',background:'#0F6E56'}}/>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* VIEW SEMANA */
          <div style={{ border:'1px solid var(--border)',borderRadius:12,overflow:'hidden' }}>
            {/* Header semana */}
            <div style={{ display:'grid',gridTemplateColumns:'52px repeat(7,1fr)',background:'var(--bg2)',borderBottom:'1px solid var(--border)' }}>
              <div/>
              {semana.map((d,i)=>{
                const str=d.toISOString().split('T')[0];
                const isH=str===hojeStr;
                const isSel=d.getDate()===diaAtivo&&d.getMonth()===mes;
                return (
                  <div key={i} style={{ textAlign:'center',padding:'10px 4px',cursor:'pointer' }}
                    onClick={()=>{ setMes(d.getMonth()); setAno(d.getFullYear()); setDia(d.getDate()); }}>
                    <div style={{fontSize:10,color:'var(--ts)',fontWeight:600}}>{DS[d.getDay()]}</div>
                    <div style={{ width:30,height:30,borderRadius:'50%',margin:'4px auto 0',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      background:isH?'#0F6E56':isSel?'#111':'transparent',
                      fontSize:14,fontWeight:700,color:isH||isSel?'white':'var(--tx)' }}>
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Turnos */}
            {[
              { label:'Manhã',   fn:(t:string)=>t.includes('manhã')||t.includes('jejum')||t.includes('acordar')||t.includes('manha') },
              { label:'Treino',  fn:(t:string)=>t.includes('pré')||t.includes('pre')||t.includes('treino')||t.includes('pós')||t.includes('pos') },
              { label:'Tarde',   fn:(t:string)=>t.includes('tarde') },
              { label:'Noite',   fn:(t:string)=>t.includes('dormir')||t.includes('noite') },
            ].map(turno=>(
              <div key={turno.label} style={{ display:'grid',gridTemplateColumns:'52px repeat(7,1fr)',borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:10,color:'var(--ts)',padding:'12px 8px',textAlign:'right',paddingTop:14,fontWeight:500 }}>{turno.label}</div>
                {semana.map((d,i)=>{
                  const dow=d.getDay();
                  const isH=d.toISOString().split('T')[0]===hojeStr;
                  const pDia=peps.filter((p:any)=>calcDias(p).includes(dow));
                  const pT=pDia.filter((p:any)=>{
                    const t=(p.timing||'').toLowerCase();
                    // se timing vazio, põe na Manhã
                    if (!t) return turno.label==='Manhã';
                    return turno.fn(t);
                  });
                  return (
                    <div key={i} onClick={()=>{ setMes(d.getMonth()); setAno(d.getFullYear()); setDia(d.getDate()); }}
                      style={{ borderLeft:'1px solid var(--border)',minHeight:68,padding:4,
                        background:isH?'rgba(15,110,86,.04)':'transparent',cursor:'pointer' }}>
                      {pT.map((p:any,idx:number)=>{
                        const cor=CAT_COLOR[p.categoria]||'#6B7280';
                        const bg=CAT_BG[p.categoria]||'#F3F4F6';
                        return (
                          <div key={idx} style={{ fontSize:9,padding:'2px 5px',borderRadius:4,marginBottom:2,
                            background:bg,color:cor,fontWeight:600,
                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                            {p.emoji||'💊'} {p.nome?.split(' ')[0]}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Legenda */}
        {peps.length>0 && (
          <div style={{ display:'flex',gap:12,marginTop:12,flexWrap:'wrap' }}>
            {Array.from(new Set(peps.map((p:any)=>p.categoria).filter(Boolean))).map(cat=>(
              <div key={cat} style={{ display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--ts)' }}>
                <div style={{ width:8,height:8,borderRadius:2,background:CAT_COLOR[cat as string]||'#6B7280' }}/>
                {cat}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div style={{ borderLeft:'1px solid var(--border)',paddingLeft:20 }}>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:13,fontWeight:600,color:'var(--tx)',marginBottom:2 }}>
            {DS_FULL[infoAtivo.dow]}, {diaAtivo} de {MESES[mes]}
          </div>
          {infoAtivo.isHoj && (
            <span style={{ fontSize:10,color:'var(--gm)',fontWeight:700,background:'var(--gp)',padding:'1px 8px',borderRadius:100 }}>Hoje</span>
          )}
        </div>

        {infoAtivo.pDia.length>0 ? (
          <>
            <div style={{ fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--ts)',marginBottom:10 }}>
              {infoAtivo.pDia.length} peptídeo{infoAtivo.pDia.length>1?'s':''}
            </div>
            {infoAtivo.pDia.map((p:any,i:number)=>{
              const cor=CAT_COLOR[p.categoria]||'#6B7280';
              return (
                <div key={i} style={{ marginBottom:8,background:'var(--bg2)',borderRadius:10,padding:'10px 12px',borderLeft:`3px solid ${cor}` }}>
                  <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                    <span style={{fontSize:'1rem'}}>{p.emoji||'💊'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.nome}</div>
                      <div style={{fontSize:10,color:'var(--ts)',marginTop:1}}>
                        {p.dose_calculada||`${p.dose_min||''}${p.unidade||''}`} · {p.via||'SC'}
                      </div>
                    </div>
                    {infoAtivo.a?.completo && <span style={{fontSize:11,color:'var(--gm)',fontWeight:700}}>✓</span>}
                  </div>
                  {p.timing && (
                    <div style={{fontSize:10,color:'var(--ts)',marginTop:6,paddingTop:6,borderTop:'1px solid var(--border)'}}>
                      🕐 {p.timing}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div style={{fontSize:12,color:'var(--ts)',textAlign:'center',padding:'2rem 0',lineHeight:1.6}}>
            {infoAtivo.isFut ? '📅 Dia futuro' : peps.length===0 ? 'Gere seu protocolo\npara ver aplicações' : 'Sem aplicações\nneste dia'}
          </div>
        )}

        {infoAtivo.t && (
          <div style={{marginTop:16}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--ts)',marginBottom:8}}>Registro</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              {[['⚡','Energia',infoAtivo.t.energia],['😴','Sono',infoAtivo.t.sono],
                ['⚖️','Peso',infoAtivo.t.peso?`${infoAtivo.t.peso}kg`:'—']].map(([ico,lbl,val])=>(
                <div key={lbl} style={{background:'var(--bg2)',borderRadius:8,padding:'8px 10px'}}>
                  <div style={{fontSize:10,color:'var(--ts)'}}>{ico} {lbl}</div>
                  <div style={{fontSize:13,fontWeight:600,marginTop:2}}>{val||'—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumo mês */}
        <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--ts)',marginBottom:10}}>Resumo do mês</div>
          {[
            ['✓ Com adesão', adesao.filter(a=>{const[y,m]=a.data.split('-').map(Number);return y===ano&&m===mes+1&&a.completo;}).length],
            ['📊 Registros', tracker.filter(t=>{const[y,m]=t.data.split('-').map(Number);return y===ano&&m===mes+1;}).length],
            ['💊 Peptídeos', peps.length],
          ].map(([lbl,val])=>(
            <div key={lbl} style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6}}>
              <span style={{color:'var(--ts)'}}>{lbl}</span><span style={{fontWeight:600}}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
