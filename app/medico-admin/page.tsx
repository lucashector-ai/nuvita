// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase com service role para acesso total
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SENHA_MEDICO = process.env.NEXT_PUBLIC_MEDICO_TOKEN || 'nuvita_medico_2026';
const HORARIOS_PADRAO = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00'];
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function MedicoAdmin() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [senhaErro, setSenhaErro] = useState(false);
  const [aba, setAba] = useState<'agenda'|'consultas'>('consultas');
  const [consultas, setConsultas] = useState<any[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<Record<string,string[]>>({});
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [diaSel, setDiaSel] = useState<string|null>(null);
  const [horariosEdit, setHorariosEdit] = useState<string[]>([]);
  const [salvandoDisp, setSalvandoDisp] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [notaEdit, setNotaEdit] = useState<{id:string,nota:string}|null>(null);
  const [linkEdit, setLinkEdit] = useState<{id:string,link:string}|null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('nv_medico_auth');
      if (auth === 'true') setAutenticado(true);
    }
  }, []);

  useEffect(() => {
    if (autenticado) {
      carregarConsultas();
      carregarDisponibilidade();
    }
  }, [autenticado, mes, ano]);

  const login = () => {
    if (senha === SENHA_MEDICO) {
      setAutenticado(true);
      sessionStorage.setItem('nv_medico_auth', 'true');
    } else {
      setSenhaErro(true);
      setTimeout(() => setSenhaErro(false), 2000);
    }
  };

  const carregarConsultas = async () => {
    const { data } = await supabase.from('agendamentos').select('*')
      .order('data', { ascending: true });
    setConsultas(data || []);
  };

  const carregarDisponibilidade = async () => {
    const inicio = `${ano}-${String(mes+1).padStart(2,'0')}-01`;
    const fim = `${ano}-${String(mes+1).padStart(2,'0')}-31`;
    const { data } = await supabase.from('disponibilidade_medico')
      .select('*').gte('data', inicio).lte('data', fim);
    const map: Record<string,string[]> = {};
    data?.forEach(d => { map[d.data] = d.horarios; });
    setDisponibilidade(map);
  };

  const selecionarDia = (ds: string) => {
    setDiaSel(ds);
    setHorariosEdit(disponibilidade[ds] || []);
  };

  const toggleHorario = (h: string) => {
    setHorariosEdit(p => p.includes(h) ? p.filter(x => x!==h) : [...p, h].sort());
  };

  const salvarDisponibilidade = async () => {
    if (!diaSel) return;
    setSalvandoDisp(true);
    await supabase.from('disponibilidade_medico').upsert(
      { data: diaSel, horarios: horariosEdit },
      { onConflict: 'data' }
    );
    await carregarDisponibilidade();
    setSalvandoDisp(false);
    setDiaSel(null);
  };

  const atualizarStatus = async (id: string, status: string) => {
    await supabase.from('agendamentos').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    // Notifica paciente
    const c = consultas.find(x => x.id === id);
    if (c?.user_id) {
      await supabase.from('notificacoes').insert({
        user_id: c.user_id, icon: status === 'confirmado' ? '✅' : '❌',
        titulo: status === 'confirmado' ? 'Consulta confirmada!' : 'Consulta cancelada',
        texto: status === 'confirmado'
          ? `Sua consulta de ${c.tipo_label} em ${c.data} às ${c.horario} foi confirmada.`
          : `Sua consulta de ${c.tipo_label} em ${c.data} foi cancelada pelo médico.`,
        action: 'consultas',
      });
    }
    carregarConsultas();
  };

  const salvarNota = async () => {
    if (!notaEdit) return;
    await supabase.from('agendamentos').update({ notas_medico: notaEdit.nota }).eq('id', notaEdit.id);
    setNotaEdit(null);
    carregarConsultas();
  };

  const salvarLink = async () => {
    if (!linkEdit) return;
    await supabase.from('agendamentos').update({ link_videochamada: linkEdit.link }).eq('id', linkEdit.id);
    // Notifica paciente
    const c = consultas.find(x => x.id === linkEdit.id);
    if (c?.user_id) {
      await supabase.from('notificacoes').insert({
        user_id: c.user_id, icon: '📹',
        titulo: 'Link da consulta disponível!',
        texto: `O link para sua consulta de ${c.tipo_label} em ${c.data} às ${c.horario} está pronto.`,
        action: 'consultas',
      });
    }
    setLinkEdit(null);
    carregarConsultas();
  };

  const hoje = new Date().toISOString().split('T')[0];
  const primeiro = new Date(ano, mes, 1).getDay();
  const total = new Date(ano, mes+1, 0).getDate();

  const consultasFiltradas = consultas.filter(c => {
    if (filtroStatus === 'pendente') return c.status === 'pendente';
    if (filtroStatus === 'confirmado') return c.status === 'confirmado';
    if (filtroStatus === 'concluido') return c.status === 'concluido';
    if (filtroStatus === 'cancelado') return c.status === 'cancelado';
    return true;
  });

  const CARD = { background:'#FFFFFF', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', marginBottom:12 };
  const STATUS_COLOR: Record<string,{bg:string,color:string}> = {
    pendente:   { bg:'#FFF7ED', color:'#C2410C' },
    confirmado: { bg:'#DCFCE7', color:'#15803D' },
    concluido:  { bg:'#F0F9FF', color:'#0369A1' },
    cancelado:  { bg:'#F3F4F6', color:'#6B7280' },
  };

  // ── Tela de login ──
  if (!autenticado) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F7F7' }}>
      <div style={{ background:'white', borderRadius:20, padding:'2.5rem', width:360, boxShadow:'0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2rem', marginBottom:8 }}>🩺</div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500 }}>Painel do Médico</h2>
          <p style={{ fontSize:13, color:'#6B7280', marginTop:4 }}>Acesso exclusivo Nuvita</p>
        </div>
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key==='Enter' && login()}
          className="inp" placeholder="Senha de acesso"
          style={{ marginBottom:12, borderColor: senhaErro ? '#FECACA' : undefined }}/>
        {senhaErro && <div style={{ fontSize:12, color:'#D85A30', marginBottom:8, textAlign:'center' }}>Senha incorreta</div>}
        <button onClick={login} className="btn btn-d" style={{ width:'100%', justifyContent:'center' }}>
          Entrar
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F7F7F7' }}>
      {/* Header */}
      <div style={{ background:'white', borderBottom:'1px solid #E5E7EB', padding:'0 2rem', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:'1.2rem' }}>🩺</span>
          <span style={{ fontSize:14, fontWeight:500 }}>Painel Médico — Nuvita</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {(['consultas','agenda'] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              style={{ padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500,
                background: aba===a ? 'var(--dark)' : '#F3F4F6', color: aba===a ? 'white' : '#374151' }}>
              {a === 'consultas' ? '📋 Consultas' : '📅 Agenda'}
            </button>
          ))}
          <button onClick={() => { sessionStorage.removeItem('nv_medico_auth'); setAutenticado(false); }}
            style={{ padding:'6px 16px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:13, fontFamily:'inherit', color:'#6B7280' }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'2rem' }}>

        {/* ── ABA CONSULTAS ── */}
        {aba === 'consultas' && (
          <>
            {/* Resumo */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:'1.5rem' }}>
              {[
                { label:'Pendentes', val: consultas.filter(c=>c.status==='pendente').length, color:'#C2410C', bg:'#FFF7ED' },
                { label:'Confirmadas', val: consultas.filter(c=>c.status==='confirmado').length, color:'#15803D', bg:'#DCFCE7' },
                { label:'Concluídas', val: consultas.filter(c=>c.status==='concluido').length, color:'#0369A1', bg:'#F0F9FF' },
                { label:'Total', val: consultas.length, color:'#374151', bg:'#F3F4F6' },
              ].map(s => (
                <div key={s.label} style={{ ...CARD, marginBottom:0, background:s.bg, textAlign:'center', padding:'1rem' }}>
                  <div style={{ fontSize:28, fontWeight:700, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:12, color:s.color, opacity:.8 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div style={{ display:'flex', gap:8, marginBottom:'1rem' }}>
              {['todas','pendente','confirmado','concluido','cancelado'].map(f => (
                <button key={f} onClick={() => setFiltroStatus(f)}
                  style={{ padding:'5px 14px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12,
                    background: filtroStatus===f ? 'var(--dark)' : '#F3F4F6', color: filtroStatus===f ? 'white' : '#374151' }}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>

            {/* Lista de consultas */}
            {consultasFiltradas.map(c => {
              const st = STATUS_COLOR[c.status] || STATUS_COLOR.pendente;
              return (
                <div key={c.id} style={CARD}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                        <div style={{ fontSize:14, fontWeight:500 }}>{c.nome_paciente || 'Paciente'}</div>
                        <span style={{ fontSize:11, fontWeight:500, padding:'2px 10px', borderRadius:100, background:st.bg, color:st.color }}>
                          {c.status}
                        </span>
                        <span style={{ fontSize:11, color:'var(--ts)' }}>{c.tipo_label} · {c.duracao_min}min</span>
                      </div>
                      <div style={{ fontSize:12, color:'var(--ts)', marginBottom:8 }}>
                        📅 {new Date(c.data+'T12:00').toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })} às {c.horario}
                        {c.email_paciente && <span> · ✉️ {c.email_paciente}</span>}
                      </div>
                      {c.observacoes && (
                        <div style={{ fontSize:12, color:'#374151', background:'#F9FAFB', borderRadius:8, padding:'6px 10px', marginBottom:8 }}>
                          <strong>Observações:</strong> {c.observacoes}
                        </div>
                      )}
                      {c.notas_medico && (
                        <div style={{ fontSize:12, color:'#0369A1', background:'#F0F9FF', borderRadius:8, padding:'6px 10px', marginBottom:8 }}>
                          <strong>Sua nota:</strong> {c.notas_medico}
                        </div>
                      )}
                      {c.link_videochamada && (
                        <div style={{ fontSize:12, color:'#15803D', marginBottom:8 }}>
                          📹 {c.link_videochamada}
                        </div>
                      )}
                    </div>
                    {/* Ações */}
                    <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end', flexShrink:0 }}>
                      {c.status === 'pendente' && (
                        <>
                          <button onClick={() => atualizarStatus(c.id, 'confirmado')}
                            style={{ fontSize:12, fontWeight:500, padding:'6px 14px', borderRadius:8, border:'none', background:'#DCFCE7', color:'#15803D', cursor:'pointer', fontFamily:'inherit' }}>
                            ✓ Confirmar
                          </button>
                          <button onClick={() => atualizarStatus(c.id, 'cancelado')}
                            style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:'none', background:'#FEE2E2', color:'#D85A30', cursor:'pointer', fontFamily:'inherit' }}>
                            ✗ Cancelar
                          </button>
                        </>
                      )}
                      {c.status === 'confirmado' && (
                        <button onClick={() => atualizarStatus(c.id, 'concluido')}
                          style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:'none', background:'#F0F9FF', color:'#0369A1', cursor:'pointer', fontFamily:'inherit' }}>
                          ✓ Concluído
                        </button>
                      )}
                      <button onClick={() => setLinkEdit({ id: c.id, link: c.link_videochamada || '' })}
                        style={{ fontSize:12, padding:'5px 12px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#374151' }}>
                        📹 Link
                      </button>
                      <button onClick={() => setNotaEdit({ id: c.id, nota: c.notas_medico || '' })}
                        style={{ fontSize:12, padding:'5px 12px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#374151' }}>
                        📝 Nota
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── ABA AGENDA ── */}
        {aba === 'agenda' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Calendário */}
            <div style={CARD}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <button onClick={() => { if(mes===0){setMes(11);setAno(a=>a-1);}else setMes(m=>m-1); setDiaSel(null); }}
                  style={{ width:28,height:28,borderRadius:7,border:'1px solid #E5E7EB',background:'white',cursor:'pointer',fontSize:14 }}>‹</button>
                <div style={{ fontSize:13, fontWeight:500 }}>{['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][mes]} {ano}</div>
                <button onClick={() => { if(mes===11){setMes(0);setAno(a=>a+1);}else setMes(m=>m+1); setDiaSel(null); }}
                  style={{ width:28,height:28,borderRadius:7,border:'1px solid #E5E7EB',background:'white',cursor:'pointer',fontSize:14 }}>›</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
                {['D','S','T','Q','Q','S','S'].map((d,i) => <div key={i} style={{ textAlign:'center', fontSize:10, fontWeight:600, color:'#9CA3AF' }}>{d}</div>)}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
                {Array.from({length:primeiro}).map((_,i) => <div key={`e${i}`}/>)}
                {Array.from({length:total}).map((_,i) => {
                  const d = i+1;
                  const ds = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                  const temSlots = (disponibilidade[ds]||[]).length > 0;
                  const consultas_dia = consultas.filter(c => c.data===ds && c.status!=='cancelado').length;
                  const sel = diaSel === ds;
                  return (
                    <button key={d} onClick={() => selecionarDia(ds)}
                      style={{ height:32, borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:sel?600:400, position:'relative',
                        background: sel ? 'var(--dark)' : 'transparent', color: sel ? 'white' : 'var(--tx)', transition:'all .12s' }}
                      onMouseEnter={e => { if(!sel) e.currentTarget.style.background='#F3F4F6'; }}
                      onMouseLeave={e => { if(!sel) e.currentTarget.style.background='transparent'; }}>
                      {d}
                      {temSlots && !sel && <div style={{ position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:4,height:4,borderRadius:'50%',background:'var(--green)' }}/>}
                      {consultas_dia > 0 && <div style={{ position:'absolute', top:2, right:4, fontSize:9, fontWeight:700, color: sel?'rgba(255,255,255,.8)':'var(--gm)' }}>{consultas_dia}</div>}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop:12, display:'flex', gap:12, fontSize:11, color:'var(--ts)' }}>
                <span>● Disponível</span>
                <span style={{ color:'var(--gm)' }}>N Consultas</span>
              </div>
            </div>

            {/* Editor de horários */}
            <div style={CARD}>
              {!diaSel ? (
                <div style={{ textAlign:'center', padding:'2rem', color:'var(--ts)', fontSize:13 }}>
                  ← Selecione um dia para editar horários disponíveis
                </div>
              ) : (
                <>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:'1rem' }}>
                    Horários — {new Date(diaSel+'T12:00').toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:'1rem' }}>
                    {HORARIOS_PADRAO.map(h => {
                      const ativo = horariosEdit.includes(h);
                      const ocupado = consultas.filter(c => c.data===diaSel && c.horario===h && c.status!=='cancelado').length > 0;
                      return (
                        <button key={h} onClick={() => !ocupado && toggleHorario(h)}
                          disabled={ocupado}
                          style={{ padding:'10px', borderRadius:9, fontFamily:'inherit', fontSize:13, fontWeight:500, cursor: ocupado?'not-allowed':'pointer', transition:'all .12s',
                            border: ativo ? '2px solid var(--dark)' : '1px solid #E5E7EB',
                            background: ocupado ? '#FEF3C7' : ativo ? 'var(--dark)' : 'white',
                            color: ocupado ? '#92400E' : ativo ? 'white' : 'var(--tx)',
                            position:'relative' }}>
                          {h}
                          {ocupado && <div style={{ fontSize:9, color:'#92400E' }}>ocupado</div>}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={salvarDisponibilidade} disabled={salvandoDisp} className="btn btn-d"
                    style={{ width:'100%', justifyContent:'center' }}>
                    {salvandoDisp ? 'Salvando...' : '✓ Salvar disponibilidade'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal nota */}
      {notaEdit && (
        <div className="overlay" onClick={e => { if(e.target===e.currentTarget) setNotaEdit(null); }}>
          <div className="modal" style={{ maxWidth:400 }}>
            <h3 style={{ fontSize:14, fontWeight:600, marginBottom:'1rem' }}>Nota do médico</h3>
            <textarea value={notaEdit.nota} onChange={e => setNotaEdit(p => p ? {...p, nota: e.target.value} : null)}
              className="inp" style={{ resize:'vertical', minHeight:100, marginBottom:12, fontSize:13 }}
              placeholder="Observações, diagnóstico, recomendações..."/>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={salvarNota} className="btn btn-d" style={{ flex:1 }}>Salvar</button>
              <button onClick={() => setNotaEdit(null)} style={{ padding:'10px 16px', borderRadius:10, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal link videochamada */}
      {linkEdit && (
        <div className="overlay" onClick={e => { if(e.target===e.currentTarget) setLinkEdit(null); }}>
          <div className="modal" style={{ maxWidth:400 }}>
            <h3 style={{ fontSize:14, fontWeight:600, marginBottom:'1rem' }}>Link da videochamada</h3>
            <input value={linkEdit.link} onChange={e => setLinkEdit(p => p ? {...p, link: e.target.value} : null)}
              className="inp" style={{ marginBottom:12 }}
              placeholder="https://meet.google.com/xxx ou https://zoom.us/j/xxx"/>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={salvarLink} className="btn btn-d" style={{ flex:1 }}>Salvar e notificar</button>
              <button onClick={() => setLinkEdit(null)} style={{ padding:'10px 16px', borderRadius:10, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
