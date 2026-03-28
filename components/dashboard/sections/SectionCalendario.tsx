// @ts-nocheck
'use client';

import { useState } from 'react';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DS = ['D','S','T','Q','Q','S','S'];
const DS_FULL = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const PEPTIDEO_CORES = [
  { nome:'Semaglutide', cor:'#EF9F27', bg:'#FAEEDA', freq:'1x/semana',  dow:[1] },
  { nome:'AOD-9604',    cor:'#1D9E75', bg:'#E1F5EE', freq:'diário',     dow:[0,1,2,3,4,5,6] },
  { nome:'Ipamorelin',  cor:'#7F77DD', bg:'#EEEDFE', freq:'5x/semana',  dow:[1,2,3,4,5] },
  { nome:'Semax',       cor:'#D85A30', bg:'#FAECE7', freq:'5x/semana',  dow:[1,2,3,4,5] },
  { nome:'BPC-157',     cor:'#378ADD', bg:'#E6F1FB', freq:'2x/semana',  dow:[1,4] },
];

export default function SectionCalendario({ items, peso, protoAtivo }) {
  const hoje = new Date();
  const [ano,  setAno]  = useState(hoje.getFullYear());
  const [mes,  setMes]  = useState(hoje.getMonth());
  const [diaSel, setDiaSel] = useState(hoje.getDate());
  const [done, setDone]  = useState(new Set<string>());
  const [view, setView]  = useState<'mes'|'semana'>('mes');

  const diasNoMes   = new Date(ano, mes+1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const key = (d: number) => `${ano}-${mes}-${d}`;

  const navMes = (dir: number) => {
    let nm = mes+dir, na = ano;
    if (nm<0){nm=11;na--;} if(nm>11){nm=0;na++;}
    setMes(nm); setAno(na);
  };

  const toggleDone = (d: number) => {
    const futuro = new Date(ano,mes,d) > hoje;
    if (!protoAtivo || futuro) return;
    setDone(p => { const n=new Set(p); n.has(key(d))?n.delete(key(d)):n.add(key(d)); return n; });
  };

  const pepsDoDia = (dow: number) => PEPTIDEO_CORES.filter(p => p.dow.includes(dow));

  // Semana atual
  const domSem = new Date(ano,mes,diaSel);
  domSem.setDate(domSem.getDate()-domSem.getDay());
  const semana = Array.from({length:7},(_,i)=>{ const d=new Date(domSem); d.setDate(d.getDate()+i); return d; });

  const diaSelecionado = new Date(ano, mes, diaSel);
  const pepsDiaSel = pepsDoDia(diaSelecionado.getDay());
  const totalPossivel = diasNoMes;
  const feitos = Array.from({length:diasNoMes},(_,i)=>i+1).filter(d=>done.has(key(d))).length;
  const adesao = totalPossivel ? Math.round((feitos/totalPossivel)*100) : 0;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Calendário do protocolo</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Veja quando tomar cada peptídeo e registre suas aplicações</p>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[['mes','Mês'],['semana','Semana']].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v as any)}
              style={{ padding:'6px 14px', borderRadius:8, border:'1px solid var(--border)', fontFamily:'inherit', background:view===v?'var(--dark)':'var(--bg)', color:view===v?'white':'var(--tm)', fontSize:12, fontWeight:500, cursor:'pointer' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.25rem', alignItems:'start' }}>

        {/* Calendário */}
        <div>
          {view === 'mes' && (
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <button onClick={()=>navMes(-1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--tm)', padding:'4px 10px' }}>‹</button>
                <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)' }}>{MESES[mes]} {ano}</div>
                <button onClick={()=>navMes(1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--tm)', padding:'4px 10px' }}>›</button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
                {DS.map((d,i)=>(
                  <div key={i} style={{ textAlign:'center', fontSize:10, fontWeight:500, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', padding:'4px 0' }}>{d}</div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
                {Array.from({length:primeiroDia}).map((_,i)=><div key={`e${i}`}/>)}
                {Array.from({length:diasNoMes},(_,i)=>i+1).map(d=>{
                  const isHoje = d===hoje.getDate()&&mes===hoje.getMonth()&&ano===hoje.getFullYear();
                  const isSel  = d===diaSel&&!isHoje;
                  const feito  = done.has(key(d));
                  const futuro = new Date(ano,mes,d)>hoje;
                  const dow    = new Date(ano,mes,d).getDay();
                  const peps   = pepsDoDia(dow);
                  return (
                    <div key={d}
                      onClick={()=>{ setDiaSel(d); toggleDone(d); }}
                      style={{ aspectRatio:'1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:500, background:feito?'var(--green)':isHoje?'var(--dark)':isSel?'rgba(29,158,117,.1)':'transparent', color:feito||isHoje?'white':'var(--tx)', border:isSel?'1.5px solid var(--green)':'1.5px solid transparent', opacity:futuro?.5:1, position:'relative', gap:2 }}>
                      <span>{d}</span>
                      {!feito && peps.length>0 && (
                        <div style={{ display:'flex', gap:1 }}>
                          {peps.slice(0,3).map(p=>(
                            <div key={p.nome} style={{ width:4, height:4, borderRadius:'50%', background:isHoje?'white':p.cor }}/>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legenda */}
              <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
                <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:8 }}>Peptídeos do ciclo</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {PEPTIDEO_CORES.map(p=>(
                    <div key={p.nome} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--tm)' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:p.cor, flexShrink:0 }}/>
                      {p.nome}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'semana' && (
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <button onClick={()=>{ const d=new Date(ano,mes,diaSel-7); setDiaSel(d.getDate()); setMes(d.getMonth()); setAno(d.getFullYear()); }}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--tm)', padding:'4px 10px' }}>‹</button>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>
                  {semana[0].toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} — {semana[6].toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}
                </div>
                <button onClick={()=>{ const d=new Date(ano,mes,diaSel+7); setDiaSel(d.getDate()); setMes(d.getMonth()); setAno(d.getFullYear()); }}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'var(--tm)', padding:'4px 10px' }}>›</button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8 }}>
                {semana.map(d=>{
                  const isHoje = d.toDateString()===hoje.toDateString();
                  const peps   = pepsDoDia(d.getDay());
                  return (
                    <div key={d.toISOString()} onClick={()=>setDiaSel(d.getDate())}
                      style={{ background:isHoje?'var(--dark)':'var(--bg2)', borderRadius:10, padding:'10px 6px', minHeight:120, border:`1.5px solid ${isHoje?'var(--dark)':'var(--border)'}`, cursor:'pointer' }}>
                      <div style={{ textAlign:'center', marginBottom:8 }}>
                        <div style={{ fontSize:9, color:isHoje?'rgba(255,255,255,.7)':'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em' }}>{DS_FULL[d.getDay()]}</div>
                        <div style={{ fontSize:15, fontWeight:500, color:isHoje?'white':'var(--tx)' }}>{d.getDate()}</div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                        {peps.map(p=>(
                          <div key={p.nome} style={{ fontSize:9, padding:'2px 5px', borderRadius:4, background:isHoje?'rgba(255,255,255,.15)':p.bg, color:isHoje?'white':p.cor, fontWeight:500, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                            {p.nome}
                          </div>
                        ))}
                        {peps.length===0 && <div style={{ fontSize:9, color:isHoje?'rgba(255,255,255,.5)':'var(--ts)', textAlign:'center', marginTop:8 }}>Descanso</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Painel direito — dia selecionado + resumo */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Dia selecionado */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.875rem' }}>
              {diaSelecionado.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}
            </div>
            {pepsDiaSel.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {pepsDiaSel.map(p=>(
                  <div key={p.nome} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:p.bg, borderRadius:9, border:`1px solid ${p.cor}33` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:p.cor, flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:p.cor }}>{p.nome}</div>
                      <div style={{ fontSize:10, color:`${p.cor}99` }}>{p.freq}</div>
                    </div>
                  </div>
                ))}
                {protoAtivo && diaSelecionado<=hoje && (
                  <button onClick={()=>toggleDone(diaSel)}
                    className="btn btn-d fw" style={{ fontSize:12, marginTop:4 }}>
                    {done.has(key(diaSel)) ? '✓ Aplicações registradas' : '+ Registrar aplicações'}
                  </button>
                )}
                {!protoAtivo && (
                  <div style={{ fontSize:11, color:'var(--am)', textAlign:'center', padding:'8px', background:'var(--ab)', borderRadius:7 }}>
                    Inicie o protocolo para registrar
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'1rem 0', color:'var(--ts)', fontSize:12 }}>
                Nenhum peptídeo neste dia
              </div>
            )}
          </div>

          {/* Resumo do mês */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Resumo do mês</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Dias registrados', val:`${feitos}/${totalPossivel}` },
                { label:'Adesão do mês',    val:`${adesao}%` },
              ].map(s=>(
                <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:'var(--tm)' }}>{s.label}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{s.val}</span>
                </div>
              ))}
              <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${adesao}%`, background:adesao>=70?'var(--green)':'#EF9F27', borderRadius:3 }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
