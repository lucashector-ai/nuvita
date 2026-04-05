// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const MESES   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DS      = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

// Determina em quais dias da semana cada peptídeo deve ser aplicado
function diasAplicacao(p: any): number[] {
  const f = (p.frequencia || p.timing || '').toLowerCase();
  if (f.includes('semanal') || f.includes('1x')) return [1]; // segunda
  if (f.includes('2x') || f.includes('2 x')) return [1, 4]; // seg + qui
  if (f.includes('3x')) return [1, 3, 5]; // seg + qua + sex
  if (f.includes('5x') || f.includes('5-6x') || f.includes('6x')) return [1,2,3,4,5];
  return [0,1,2,3,4,5,6]; // diário
}

interface Props { items: any[]; peso: number; protoAtivo: boolean; }

export default function SectionCalendario({ items = [], protoAtivo }: Props) {
  const hoje     = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [tracker, setTracker]   = useState<any[]>([]);
  const [adesao,  setAdesao]    = useState<any[]>([]);
  const [diaAtivo, setDiaAtivo] = useState<string|null>(null);

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

  const diasNoMes  = new Date(ano, mes + 1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const hojeStr    = hoje.toISOString().split('T')[0];

  const infoDia = (dia: number) => {
    const data  = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const dow   = new Date(data).getDay();
    const isFut = data > hojeStr;
    const isHoj = data === hojeStr;
    const t     = tracker.find(x => x.data === data);
    const a     = adesao.find(x => x.data === data);
    const peps  = items.filter(p => diasAplicacao(p).includes(dow));
    return { data, dow, isFut, isHoj, t, a, peps };
  };

  const corBorda = (info: any) => {
    if (info.isHoj) return '#111';
    if (info.a?.completo) return '#0F6E56';
    return 'var(--border)';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.2rem' }}>Calendário do ciclo</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>Dias de aplicação de cada peptídeo do protocolo</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => { const d = new Date(ano, mes-1); setMes(d.getMonth()); setAno(d.getFullYear()); setDiaAtivo(null); }}
            style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
          <span style={{ fontSize:14, fontWeight:500, minWidth:140, textAlign:'center' }}>{MESES[mes]} {ano}</span>
          <button onClick={() => { const d = new Date(ano, mes+1); setMes(d.getMonth()); setAno(d.getFullYear()); setDiaAtivo(null); }}
            style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
        </div>
      </div>

      {/* Legenda */}
      <div style={{ display:'flex', gap:16, marginBottom:'1rem', flexWrap:'wrap' }}>
        {[['#111','Hoje'],['#0F6E56','Adesão completa'],['#EF9F27','Registro feito'],['var(--border)','Aplicação programada']].map(([c,l]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--ts)' }}>
            <div style={{ width:8, height:8, borderRadius:2, background:c, border:`1px solid ${c}` }}/>
            {l}
          </div>
        ))}
      </div>

      {/* Dias da semana */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
        {DS.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'var(--ts)', padding:'4px 0' }}>{d}</div>)}
      </div>

      {/* Grade */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {Array.from({ length: primeiroDia }).map((_,i) => <div key={`e${i}`}/>)}
        {Array.from({ length: diasNoMes }).map((_,i) => {
          const dia  = i + 1;
          const info = infoDia(dia);
          const open = diaAtivo === info.data;

          return (
            <div key={dia}
              onClick={() => setDiaAtivo(open ? null : info.data)}
              style={{
                borderRadius:10, padding:'8px 6px', minHeight:72, cursor:'pointer',
                background: info.isHoj ? '#111' : info.a?.completo ? '#0F6E5608' : info.t ? '#EF9F2708' : 'var(--bg)',
                border:`1.5px solid ${corBorda(info)}`,
                outline: open ? '2px solid var(--dark)' : 'none',
                transition:'all .12s',
              }}>
              {/* Número do dia */}
              <div style={{ fontSize:12, fontWeight:info.isHoj ? 700 : 400, color:info.isHoj ? 'white' : 'var(--tx)', marginBottom:4 }}>{dia}</div>

              {/* Emojis dos peptídeos deste dia */}
              {!info.isFut && info.peps.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:1, marginBottom:3 }}>
                  {info.peps.slice(0,4).map((p:any,idx:number) => (
                    <span key={idx} style={{ fontSize:10, lineHeight:1, filter: info.isHoj ? 'brightness(10)' : 'none' }}>{p.emoji||'💊'}</span>
                  ))}
                  {info.peps.length > 4 && <span style={{ fontSize:8, color:info.isHoj?'rgba(255,255,255,.6)':'var(--ts)' }}>+{info.peps.length-4}</span>}
                </div>
              )}

              {/* Badges de status */}
              <div style={{ display:'flex', gap:2, flexWrap:'wrap' }}>
                {info.a?.completo && <div style={{ width:6, height:6, borderRadius:'50%', background:'#0F6E56', flexShrink:0 }}/>}
                {info.t && <div style={{ width:6, height:6, borderRadius:'50%', background:'#EF9F27', flexShrink:0 }}/>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel lateral do dia clicado */}
      {diaAtivo && (() => {
        const [y,m,d] = diaAtivo.split('-').map(Number);
        const info = infoDia(d);
        return (
          <div style={{ marginTop:'1.25rem', background:'var(--bg2)', borderRadius:16, padding:'1.25rem', border:'1px solid var(--border)', animation:'fadeIn .15s' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <span style={{ fontSize:14, fontWeight:600 }}>{d} de {MESES[m-1]} de {y}</span>
              <button onClick={() => setDiaAtivo(null)} style={{ background:'none', border:'none', fontSize:16, cursor:'pointer', color:'var(--ts)' }}>✕</button>
            </div>

            {/* Peptídeos do dia */}
            {info.peps.length > 0 && (
              <div style={{ marginBottom:'1rem' }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:8 }}>
                  💊 Aplicações programadas
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {info.peps.map((p:any, i:number) => (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'center', background:'var(--bg)', borderRadius:10, padding:'9px 12px', border:'1px solid var(--border)' }}>
                      <span style={{ fontSize:'1.1rem' }}>{p.emoji||'💊'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:500 }}>{p.nome}</div>
                        <div style={{ fontSize:11, color:'var(--ts)' }}>{p.timing || p.dose_calculada || ''}</div>
                      </div>
                      {info.a?.completo && <span style={{ fontSize:11, color:'var(--gm)', fontWeight:600 }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registro do dia */}
            {info.t && (
              <div>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:8 }}>📊 Registro do dia</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {[['⚡','Energia',info.t.energia],['😴','Sono',info.t.sono],['⚖️','Peso',info.t.peso?`${info.t.peso}kg`:'—']].map(([ico,lbl,val]) => (
                    <div key={lbl} style={{ background:'var(--bg)', borderRadius:10, padding:'10px', textAlign:'center' }}>
                      <div style={{ fontSize:'1rem' }}>{ico}</div>
                      <div style={{ fontSize:10, color:'var(--ts)', marginBottom:2 }}>{lbl}</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{val||'—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {info.peps.length === 0 && !info.t && (
              <div style={{ textAlign:'center', color:'var(--ts)', fontSize:13, padding:'1rem 0' }}>
                {info.isFut ? '📅 Dia futuro' : 'Nenhuma aplicação programada neste dia'}
              </div>
            )}
          </div>
        );
      })()}

      {/* Estado vazio */}
      {items.length === 0 && (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13, marginTop:'1rem' }}>
          <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>📅</div>
          Gere seu protocolo para ver as aplicações no calendário
        </div>
      )}
    </div>
  );
}
