// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const TIPOS = [
  { id:'avaliacao', label:'Avaliação inicial', dur:60, desc:'Revisão completa do protocolo' },
  { id:'followup',  label:'Acompanhamento',   dur:30, desc:'Check-in e ajustes finos' },
  { id:'urgencia',  label:'Dúvida urgente',   dur:20, desc:'Sintoma ou dúvida rápida' },
];

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export default function SectionMedico({ userId, answers, plan, onNavigate }: any) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [diaSel, setDiaSel] = useState<number|null>(null);
  const [horarioSel, setHorarioSel] = useState<string|null>(null);
  const [tipoSel, setTipoSel] = useState('avaliacao');
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<Record<string,string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => { if (userId) carregarAgendamentos(); }, [userId]);
  useEffect(() => { carregarDisponibilidade(); }, [mes, ano]);

  const carregarAgendamentos = async () => {
    const { data } = await supabase.from('agendamentos').select('*')
      .eq('user_id', userId).order('data', { ascending: true });
    setAgendamentos(data || []);
  };

  const carregarDisponibilidade = async () => {
    setLoadingSlots(true);
    // Calcula primeiro e último dia do mês corretamente
    const inicio = `${ano}-${String(mes+1).padStart(2,'0')}-01`;
    const ultimoDia = new Date(ano, mes+1, 0).getDate();
    const fim = `${ano}-${String(mes+1).padStart(2,'0')}-${String(ultimoDia).padStart(2,'0')}`;
    const { data } = await supabase.from('disponibilidade_medico')
      .select('data,horarios').gte('data', inicio).lte('data', fim);
    const map: Record<string,string[]> = {};
    // Filtra apenas slots que têm horários disponíveis
    data?.forEach(d => {
      if (d.horarios && d.horarios.length > 0) {
        map[d.data] = d.horarios;
      }
    });
    setDisponibilidade(map);
    setLoadingSlots(false);
  };

  const dataStr = diaSel
    ? `${ano}-${String(mes+1).padStart(2,'0')}-${String(diaSel).padStart(2,'0')}`
    : null;
  // Pega slots disponíveis — filtra apenas horários cheios (ex: 09:00, 10:00)
  // ou mostra todos os disponíveis
  const todosSlots = dataStr ? (disponibilidade[dataStr] || []) : [];
  const slotsDisponiveis = todosSlots;

  // Filtra horários já agendados
  const horariosOcupados = agendamentos
    .filter(a => a.data === dataStr && a.status !== 'cancelado')
    .map(a => a.horario);
  const slotsLivres = slotsDisponiveis.filter(h => !horariosOcupados.includes(h));

  const confirmar = async () => {
    if (!diaSel || !horarioSel || !userId) return;
    setSalvando(true);
    const tipo = TIPOS.find(t => t.id === tipoSel);
    await supabase.from('agendamentos').insert({
      user_id: userId,
      nome: answers?.nome || 'Paciente',
      email: answers?.email || '',
      data: dataStr, horario: horarioSel,
      tipo: tipoSel, tipo_label: tipo?.label, duracao_min: tipo?.dur,
      observacoes: obs, status: 'pendente',
      nome_paciente: answers?.nome || 'Paciente',
      email_paciente: answers?.email || '',
    });
    await supabase.from('notificacoes').insert({
      user_id: userId, icon: '📅',
      titulo: 'Consulta agendada!',
      texto: `${tipo?.label} em ${dataStr} às ${horarioSel}. O médico confirmará em breve.`,
      action: 'consultas',
    });
    setSalvando(false);
    setConfirmado(true);
    await carregarAgendamentos();
    setTimeout(() => {
      setConfirmado(false);
      setDiaSel(null); setHorarioSel(null); setObs('');
    }, 3000);
  };

  const cancelar = async (id: string) => {
    await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', id);
    carregarAgendamentos();
  };

  const primeiro = new Date(ano, mes, 1).getDay();
  const total = new Date(ano, mes+1, 0).getDate();
  const isPast = (d: number) => new Date(ano, mes, d) < new Date(hoje.toDateString());
  const temSlots = (d: number) => {
    const ds = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return (disponibilidade[ds] || []).length > 0;
  };

  const CARD = { background:'#FFFFFF', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)' };

  if (confirmado) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:16 }}>
      <div style={{ fontSize:'3rem' }}>✅</div>
      <h3 style={{ fontSize:'1.1rem', fontWeight:500 }}>Consulta solicitada!</h3>
      <p style={{ fontSize:13, color:'var(--ts)', textAlign:'center', maxWidth:320 }}>
        O médico revisará sua solicitação e confirmará o horário. Você receberá uma notificação.
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Médico parceiro</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Agende uma consulta com nosso especialista em peptídeos</p>
      </div>

      {/* Consultas futuras */}
      {agendamentos.filter(a => a.status !== 'cancelado' && a.data >= new Date().toISOString().split('T')[0]).length > 0 && (
        <div style={{ ...CARD, marginBottom:'1.5rem' }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Próximas consultas</div>
          {agendamentos.filter(a => a.status !== 'cancelado' && a.data >= new Date().toISOString().split('T')[0]).map(a => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #F3F4F6' }}>
              <div style={{ width:42, height:42, borderRadius:10, background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>📅</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{a.tipo_label}</div>
                <div style={{ fontSize:12, color:'var(--ts)' }}>
                  {new Date(a.data+'T12:00').toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })} às {a.horario}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {a.link_videochamada && (
                  <a href={a.link_videochamada} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:8, background:'#0F6E56', color:'white', textDecoration:'none' }}>
                    📹 Entrar
                  </a>
                )}
                <span style={{ fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:100,
                  background: a.status==='confirmado' ? '#DCFCE7' : '#FFF7ED',
                  color: a.status==='confirmado' ? '#15803D' : '#C2410C' }}>
                  {a.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                </span>
                <button onClick={() => cancelar(a.id)}
                  style={{ fontSize:11, color:'var(--ts)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Layout cal.com — calendário + slots lado a lado */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:'1.5rem' }}>

        {/* Coluna esquerda — calendário + tipo */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Calendário compacto */}
          <div style={CARD}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <button onClick={() => { if (mes===0){setMes(11);setAno(a=>a-1);}else setMes(m=>m-1); setDiaSel(null); setHorarioSel(null); }}
                style={{ width:28, height:28, borderRadius:7, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:14 }}>‹</button>
              <div style={{ fontSize:13, fontWeight:500 }}>{MESES[mes]} {ano}</div>
              <button onClick={() => { if (mes===11){setMes(0);setAno(a=>a+1);}else setMes(m=>m+1); setDiaSel(null); setHorarioSel(null); }}
                style={{ width:28, height:28, borderRadius:7, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:14 }}>›</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
              {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:600, color:'var(--ts)', padding:'2px 0' }}>{d}</div>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
              {Array.from({length:primeiro}).map((_,i) => <div key={`e${i}`}/>)}
              {Array.from({length:total}).map((_,i) => {
                const d = i+1;
                const past = isPast(d);
                const hasSlots = temSlots(d);
                const sel = diaSel === d;
                return (
                  <button key={d} disabled={past || !hasSlots}
                    onClick={() => { setDiaSel(d); setHorarioSel(null); }}
                    style={{ height:32, borderRadius:8, border:'none', cursor: past||!hasSlots ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                      fontSize:12, fontWeight: sel ? 600 : 400,
                      background: sel ? 'var(--dark)' : hasSlots && !past ? 'transparent' : 'transparent',
                      color: sel ? 'white' : past ? '#D1D5DB' : hasSlots ? 'var(--tx)' : '#D1D5DB',
                      position:'relative', transition:'all .12s',
                      outline: !sel && !past && d===hoje.getDate()&&mes===hoje.getMonth() ? '2px solid var(--green)' : 'none',
                    }}
                    onMouseEnter={e => { if (!past&&hasSlots&&!sel) e.currentTarget.style.background='#F3F4F6'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background='transparent'; }}>
                    {d}
                    {hasSlots && !past && !sel && (
                      <div style={{ position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:'var(--green)' }}/>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tipo de consulta */}
          <div style={CARD}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:10 }}>Tipo de consulta</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {TIPOS.map(t => (
                <div key={t.id} onClick={() => setTipoSel(t.id)}
                  style={{ padding:'10px 12px', borderRadius:10, cursor:'pointer', transition:'all .12s',
                    border: tipoSel===t.id ? '2px solid var(--dark)' : '1px solid #E5E7EB',
                    background: tipoSel===t.id ? '#F9FAFB' : 'white' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontSize:13, fontWeight:500 }}>{t.label}</div>
                    <span style={{ fontSize:11, color:'var(--ts)' }}>{t.dur}min</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna direita — slots + confirmação */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Slots de horário */}
          <div style={CARD}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:10 }}>
              {diaSel ? `${String(diaSel).padStart(2,'0')}/${String(mes+1).padStart(2,'0')} — Horários disponíveis` : 'Selecione uma data'}
            </div>
            {!diaSel && (
              <div style={{ padding:'2rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>
                ← Escolha uma data no calendário
              </div>
            )}
            {diaSel && loadingSlots && (
              <div style={{ padding:'1rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando...</div>
            )}
            {diaSel && !loadingSlots && slotsLivres.length === 0 && (
              <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>
                Nenhum horário disponível nesta data. Escolha outra.
              </div>
            )}
            {diaSel && !loadingSlots && slotsLivres.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {slotsLivres.map(h => (
                  <button key={h} onClick={() => setHorarioSel(h)}
                    style={{ padding:'12px', borderRadius:10, fontFamily:'inherit', fontSize:14, fontWeight:500, cursor:'pointer', transition:'all .12s',
                      border: horarioSel===h ? '2px solid var(--dark)' : '1px solid #E5E7EB',
                      background: horarioSel===h ? 'var(--dark)' : 'white',
                      color: horarioSel===h ? 'white' : 'var(--tx)' }}>
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Confirmação */}
          {diaSel && horarioSel && (
            <div style={CARD}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:10 }}>Confirmar agendamento</div>
              <div style={{ background:'#F9FAFB', borderRadius:10, padding:'12px', marginBottom:12, fontSize:13 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ color:'var(--ts)' }}>Data</span>
                  <span style={{ fontWeight:500 }}>{String(diaSel).padStart(2,'0')}/{String(mes+1).padStart(2,'0')}/{ano}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ color:'var(--ts)' }}>Horário</span>
                  <span style={{ fontWeight:500 }}>{horarioSel}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--ts)' }}>Tipo</span>
                  <span style={{ fontWeight:500 }}>{TIPOS.find(t=>t.id===tipoSel)?.label}</span>
                </div>
              </div>
              <textarea value={obs} onChange={e => setObs(e.target.value)} className="inp"
                placeholder="Observações para o médico (opcional)..."
                style={{ marginBottom:12, resize:'vertical', minHeight:60, fontSize:12 }}/>
              <button onClick={confirmar} disabled={salvando} className="btn btn-d"
                style={{ width:'100%', justifyContent:'center', background:'var(--green)', color:'white' }}>
                {salvando ? 'Agendando...' : '✓ Confirmar consulta'}
              </button>
            </div>
          )}

          {/* Link para histórico */}
          <div style={{ ...CARD, display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}
            onClick={() => onNavigate && onNavigate('consultas')}>
            <div style={{ fontSize:'1.5rem' }}>📋</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500 }}>Histórico de consultas</div>
              <div style={{ fontSize:11, color:'var(--ts)' }}>Ver todas as consultas anteriores</div>
            </div>
            <span style={{ color:'var(--ts)' }}>→</span>
          </div>

          {/* Info */}
          <div style={{ ...CARD, background:'#F0FDF4' }}>
            <div style={{ fontSize:12, color:'var(--gm)', lineHeight:1.7 }}>
              🩺 Após agendar, o médico confirmará o horário e enviará o link da videochamada por notificação.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
