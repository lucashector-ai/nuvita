// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export default function SectionCalendario() {
  const [hoje] = useState(new Date());
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [protocolo, setProtocolo] = useState<any>(null);
  const [tracker, setTracker] = useState<any[]>([]);
  const [adesao, setAdesao] = useState<any[]>([]);
  const [diaAberto, setDiaAberto] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: u }, { data: t }, { data: a }] = await Promise.all([
      supabase.from('usuarios').select('protocolo_gerado, data_inicio').eq('id', user.id).single(),
      supabase.from('tracker_entries').select('data, energia, sono, peso').eq('user_id', user.id),
      supabase.from('adesao_diaria').select('data, completo').eq('user_id', user.id),
    ]);
    setProtocolo(u);
    setTracker(t || []);
    setAdesao(a || []);
    setLoading(false);
  };

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const dataInicio = protocolo?.data_inicio ? new Date(protocolo.data_inicio) : null;
  const peptideos = protocolo?.protocolo_gerado?.peptideos || [];

  const getInfoDia = (dia: number) => {
    const data = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const t = tracker.find(x => x.data === data);
    const a = adesao.find(x => x.data === data);
    const isHoje = data === hoje.toISOString().split('T')[0];
    const isFuturo = new Date(data) > hoje;
    const semana = dataInicio ? Math.floor((new Date(data).getTime() - dataInicio.getTime()) / (7*24*60*60*1000)) + 1 : null;
    // Determina quais peptídeos aplicar baseado na frequência
    const peptideosDia = peptideos.filter((p: any) => {
      if (!p.frequencia) return false;
      const f = p.frequencia.toLowerCase();
      if (f.includes('diária') || f.includes('todo')) return true;
      if (f.includes('semanal')) {
        const dow = new Date(data).getDay();
        return dow === 1; // segunda
      }
      if (f.includes('2x') || f.includes('semana')) {
        const dow = new Date(data).getDay();
        return dow === 1 || dow === 4;
      }
      return false;
    });
    return { data, t, a, isHoje, isFuturo, semana, peptideosDia };
  };

  const corDia = (info: any) => {
    if (info.isHoje) return 'var(--dark)';
    if (info.isFuturo) return 'var(--bg)';
    if (info.a?.completo) return '#0F6E5615';
    if (info.t) return '#EF9F2715';
    return 'var(--bg)';
  };

  const pontoDia = (info: any) => {
    if (info.isFuturo) return null;
    if (info.a?.completo) return '#0F6E56';
    if (info.t) return '#EF9F27';
    if (info.peptideosDia.length > 0) return '#D85A30';
    return null;
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Calendário do ciclo</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>Visualize aplicações, check-ins e progresso</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => { const d = new Date(ano, mes-1); setMes(d.getMonth()); setAno(d.getFullYear()); }}
            style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', fontSize:14 }}>‹</button>
          <span style={{ fontSize:14, fontWeight:500, minWidth:130, textAlign:'center' }}>{MESES[mes]} {ano}</span>
          <button onClick={() => { const d = new Date(ano, mes+1); setMes(d.getMonth()); setAno(d.getFullYear()); }}
            style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', fontSize:14 }}>›</button>
        </div>
      </div>

      {/* Legenda */}
      <div style={{ display:'flex', gap:16, marginBottom:'1rem', flexWrap:'wrap' }}>
        {[['#0F6E56','Adesão completa'],['#EF9F27','Registro feito'],['#D85A30','Aplicação pendente']].map(([cor,label]) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--ts)' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:cor }}/>
            {label}
          </div>
        ))}
      </div>

      {/* Grade dos dias da semana */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'var(--ts)', padding:'6px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grade dos dias */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {/* Espaços vazios antes do primeiro dia */}
        {Array.from({ length: primeiroDia }).map((_, i) => <div key={`v${i}`}/>)}

        {Array.from({ length: diasNoMes }).map((_, i) => {
          const dia = i + 1;
          const info = getInfoDia(dia);
          const ponto = pontoDia(info);
          const aberto = diaAberto === info.data;

          return (
            <div key={dia}
              onClick={() => setDiaAberto(aberto ? null : info.data)}
              style={{
                borderRadius:10, padding:'8px 6px', minHeight:64,
                background: corDia(info),
                border: `1px solid ${info.isHoje ? 'var(--dark)' : aberto ? 'var(--tm)' : 'var(--border)'}`,
                cursor: 'pointer', position:'relative', transition:'all .12s',
              }}>
              <div style={{ fontSize:12, fontWeight: info.isHoje ? 700 : 400, color: info.isHoje ? 'white' : 'var(--tx)', marginBottom:4 }}>{dia}</div>
              {/* Ponto de status */}
              {ponto && <div style={{ width:6, height:6, borderRadius:'50%', background:ponto, position:'absolute', top:8, right:8 }}/>}
              {/* Mini emojis dos peptídeos */}
              {!info.isFuturo && info.peptideosDia.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:1 }}>
                  {info.peptideosDia.slice(0,3).map((p: any, idx: number) => (
                    <span key={idx} style={{ fontSize:9 }}>{p.emoji || '💊'}</span>
                  ))}
                </div>
              )}
              {/* Indicadores de dados */}
              <div style={{ display:'flex', gap:3, marginTop:2 }}>
                {info.t && <div style={{ fontSize:8, background:'#EF9F2720', color:'#EF9F27', padding:'1px 4px', borderRadius:4 }}>📊</div>}
                {info.a?.completo && <div style={{ fontSize:8, background:'#0F6E5620', color:'#0F6E56', padding:'1px 4px', borderRadius:4 }}>✓</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel de detalhe do dia */}
      {diaAberto && (() => {
        const [y, m, d] = diaAberto.split('-').map(Number);
        const info = getInfoDia(d);
        return (
          <div style={{ marginTop:'1.25rem', background:'var(--bg2)', borderRadius:14, padding:'1.25rem', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <div style={{ fontSize:14, fontWeight:600 }}>{d} de {MESES[m-1]} de {y}</div>
              {info.semana && info.semana > 0 && <span style={{ fontSize:11, color:'var(--ts)', background:'var(--bg)', padding:'2px 10px', borderRadius:100, border:'1px solid var(--border)' }}>Semana {info.semana} do ciclo</span>}
            </div>
            {info.peptideosDia.length > 0 && (
              <div style={{ marginBottom:'1rem' }}>
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:8 }}>Aplicações do dia</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {info.peptideosDia.map((p: any, i: number) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:'var(--bg)', borderRadius:10, padding:'8px 12px' }}>
                      <span style={{ fontSize:'1.1rem' }}>{p.emoji || '💊'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:500 }}>{p.nome}</div>
                        <div style={{ fontSize:11, color:'var(--ts)' }}>{p.timing || p.frequencia}</div>
                      </div>
                      {info.a?.completo && <span style={{ fontSize:11, color:'var(--gm)' }}>✓ Feito</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {info.t && (
              <div>
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:8 }}>Registro do dia</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {[['⚡','Energia', info.t.energia],['😴','Sono', info.t.sono],['⚖️','Peso', info.t.peso ? `${info.t.peso}kg` : '—']].map(([ico, label, val]) => (
                    <div key={label} style={{ background:'var(--bg)', borderRadius:10, padding:'8px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:'1rem' }}>{ico}</div>
                      <div style={{ fontSize:10, color:'var(--ts)' }}>{label}</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{val || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!info.t && !info.a && !info.isFuturo && (
              <div style={{ textAlign:'center', color:'var(--ts)', fontSize:13, padding:'1rem' }}>Nenhum registro neste dia</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
