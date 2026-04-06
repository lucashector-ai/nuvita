// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const HORARIOS = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];
const TIPOS = [
  { id:'avaliacao', label:'Avaliação inicial', dur:60, desc:'Revisão completa do protocolo e histórico' },
  { id:'followup',  label:'Acompanhamento',   dur:30, desc:'Check-in de progresso e ajustes finos' },
  { id:'urgencia',  label:'Dúvida urgente',   dur:20, desc:'Sintoma ou questão que precisa de resposta rápida' },
];

function getDiasDoMes(ano: number, mes: number) {
  const primeiro = new Date(ano, mes, 1).getDay();
  const total = new Date(ano, mes + 1, 0).getDate();
  return { primeiro, total };
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function SectionMedico({ userId, answers }: any) {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [diaSel, setDiaSel] = useState<number|null>(null);
  const [horarioSel, setHorarioSel] = useState<string|null>(null);
  const [tipoSel, setTipoSel] = useState(TIPOS[0].id);
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [step, setStep] = useState<'calendario'|'horario'|'tipo'|'confirmar'>('calendario');

  const { primeiro, total } = getDiasDoMes(anoAtual, mesAtual);
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  useEffect(() => {
    if (!userId) return;
    carregarAgendamentos();
  }, [userId]);

  useEffect(() => {
    if (diaSel) carregarHorariosOcupados();
  }, [diaSel, mesAtual, anoAtual]);

  const carregarAgendamentos = async () => {
    const { data } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('user_id', userId)
      .gte('data', formatDate(hoje))
      .order('data', { ascending: true });
    if (data) setAgendamentos(data);
  };

  const carregarHorariosOcupados = async () => {
    if (!diaSel) return;
    const data_str = `${anoAtual}-${String(mesAtual+1).padStart(2,'0')}-${String(diaSel).padStart(2,'0')}`;
    const { data } = await supabase
      .from('agendamentos')
      .select('horario')
      .eq('data', data_str)
      .neq('status', 'cancelado');
    setHorariosOcupados(data?.map(d => d.horario) || []);
  };

  const agendar = async () => {
    if (!diaSel || !horarioSel || !userId) return;
    setSalvando(true);
    const data_str = `${anoAtual}-${String(mesAtual+1).padStart(2,'0')}-${String(diaSel).padStart(2,'0')}`;
    const tipo = TIPOS.find(t => t.id === tipoSel);
    
    await supabase.from('agendamentos').insert({
      user_id: userId,
      data: data_str,
      horario: horarioSel,
      tipo: tipoSel,
      tipo_label: tipo?.label,
      duracao_min: tipo?.dur,
      observacoes: obs,
      status: 'pendente',
      nome_paciente: answers?.nome || '',
    });

    // Notificação de confirmação
    await supabase.from('notificacoes').insert({
      user_id: userId,
      icon: '📅',
      titulo: 'Consulta agendada!',
      texto: `${tipo?.label} em ${data_str} às ${horarioSel}`,
      action: 'medico',
    });

    setSalvando(false);
    setConfirmado(true);
    await carregarAgendamentos();
    setTimeout(() => {
      setConfirmado(false);
      setDiaSel(null);
      setHorarioSel(null);
      setObs('');
      setStep('calendario');
    }, 3000);
  };

  const cancelar = async (id: string) => {
    await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', id);
    await carregarAgendamentos();
  };

  const isPast = (dia: number) => {
    const d = new Date(anoAtual, mesAtual, dia);
    d.setHours(23,59,59);
    return d < hoje;
  };

  const isFds = (dia: number) => {
    const dow = new Date(anoAtual, mesAtual, dia).getDay();
    return dow === 0 || dow === 6;
  };

  const CARD = { background:'#FFFFFF', borderRadius:14, padding:'1.5rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', marginBottom:'1rem' };

  if (confirmado) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:16 }}>
      <div style={{ fontSize:'3rem' }}>✅</div>
      <h3 style={{ fontSize:'1.1rem', fontWeight:500 }}>Consulta agendada!</h3>
      <p style={{ fontSize:13, color:'var(--ts)', textAlign:'center' }}>
        Você receberá uma confirmação em breve. O médico entrará em contato para confirmar o horário.
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Médico parceiro</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Agende uma consulta com nosso médico especialista em peptídeos</p>
      </div>

      {/* Próximos agendamentos */}
      {agendamentos.filter(a => a.status !== 'cancelado').length > 0 && (
        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Suas consultas</div>
          {agendamentos.filter(a => a.status !== 'cancelado').map(a => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #F3F4F6' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>📅</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{a.tipo_label}</div>
                <div style={{ fontSize:12, color:'var(--ts)' }}>
                  {new Date(a.data + 'T12:00').toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })} às {a.horario}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
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

      {/* Steps */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.5rem' }}>
        {[['calendario','📅 Data'],['horario','🕐 Horário'],['tipo','🩺 Tipo'],['confirmar','✅ Confirmar']].map(([s, l], i) => {
          const steps = ['calendario','horario','tipo','confirmar'];
          const idx = steps.indexOf(step);
          const sidx = steps.indexOf(s);
          return (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700,
                background: sidx < idx ? '#DCFCE7' : sidx === idx ? 'var(--dark)' : '#F3F4F6',
                color: sidx < idx ? '#15803D' : sidx === idx ? 'white' : 'var(--ts)' }}>
                {sidx < idx ? '✓' : i+1}
              </div>
              <span style={{ fontSize:12, color: sidx === idx ? 'var(--tx)' : 'var(--ts)', fontWeight: sidx === idx ? 500 : 400 }}>{l}</span>
              {i < 3 && <div style={{ flex:1, height:1, background:'#E5E7EB' }}/>}
            </div>
          );
        })}
      </div>

      {/* Step 1 — Calendário */}
      {step === 'calendario' && (
        <div style={CARD}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
            <button onClick={() => { if (mesAtual === 0) { setMesAtual(11); setAnoAtual(a => a-1); } else setMesAtual(m => m-1); }}
              style={{ width:32, height:32, borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:16 }}>‹</button>
            <div style={{ fontSize:14, fontWeight:500 }}>{MESES[mesAtual]} {anoAtual}</div>
            <button onClick={() => { if (mesAtual === 11) { setMesAtual(0); setAnoAtual(a => a+1); } else setMesAtual(m => m+1); }}
              style={{ width:32, height:32, borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:16 }}>›</button>
          </div>

          {/* Labels dias */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:8 }}>
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'var(--ts)', padding:'4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Grid calendário */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
            {Array.from({ length: primeiro }).map((_, i) => <div key={`e${i}`}/>)}
            {Array.from({ length: total }).map((_, i) => {
              const dia = i + 1;
              const disabled = isPast(dia) || isFds(dia);
              const sel = diaSel === dia;
              return (
                <button key={dia} disabled={disabled}
                  onClick={() => { setDiaSel(dia); }}
                  style={{ aspectRatio:'1', borderRadius:10, border:'none', cursor: disabled ? 'not-allowed' : 'pointer',
                    background: sel ? 'var(--dark)' : 'transparent',
                    color: sel ? 'white' : disabled ? '#D1D5DB' : 'var(--tx)',
                    fontWeight: sel ? 600 : 400, fontSize:13, fontFamily:'inherit',
                    transition:'all .15s',
                    outline: !sel && !disabled && dia === hoje.getDate() && mesAtual === hoje.getMonth() ? '2px solid var(--green)' : 'none',
                  }}
                  onMouseEnter={e => { if (!disabled && !sel) e.currentTarget.style.background = '#F3F4F6'; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>
                  {dia}
                </button>
              );
            })}
          </div>

          <button disabled={!diaSel} onClick={() => setStep('horario')} className="btn btn-d fw"
            style={{ marginTop:'1.25rem', opacity: diaSel ? 1 : 0.4 }}>
            {diaSel ? `Continuar — ${String(diaSel).padStart(2,'0')}/${String(mesAtual+1).padStart(2,'0')}/${anoAtual}` : 'Selecione uma data'}
          </button>
        </div>
      )}

      {/* Step 2 — Horário */}
      {step === 'horario' && (
        <div style={CARD}>
          <div style={{ fontSize:13, fontWeight:500, marginBottom:'1rem', color:'var(--tx)' }}>
            Horários disponíveis — {String(diaSel).padStart(2,'0')}/{String(mesAtual+1).padStart(2,'0')}/{anoAtual}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:'1.25rem' }}>
            {HORARIOS.map(h => {
              const ocupado = horariosOcupados.includes(h);
              const sel = horarioSel === h;
              return (
                <button key={h} disabled={ocupado}
                  onClick={() => setHorarioSel(h)}
                  style={{ padding:'12px', borderRadius:10, border: sel ? '2px solid var(--dark)' : '1px solid #E5E7EB',
                    background: sel ? 'var(--dark)' : ocupado ? '#F9FAFB' : 'white',
                    color: sel ? 'white' : ocupado ? '#D1D5DB' : 'var(--tx)',
                    fontSize:14, fontWeight:500, cursor: ocupado ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                    textDecoration: ocupado ? 'line-through' : 'none' }}>
                  {h}
                </button>
              );
            })}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setStep('calendario')} className="btn btn-o" style={{ flex:1 }}>← Voltar</button>
            <button disabled={!horarioSel} onClick={() => setStep('tipo')} className="btn btn-d" style={{ flex:2, opacity: horarioSel ? 1 : 0.4 }}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Tipo */}
      {step === 'tipo' && (
        <div style={CARD}>
          <div style={{ fontSize:13, fontWeight:500, marginBottom:'1rem' }}>Qual o motivo da consulta?</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:'1.25rem' }}>
            {TIPOS.map(t => (
              <div key={t.id} onClick={() => setTipoSel(t.id)}
                style={{ padding:'14px 16px', borderRadius:12, border: tipoSel===t.id ? '2px solid var(--dark)' : '1px solid #E5E7EB',
                  background: tipoSel===t.id ? '#F9FAFB' : 'white', cursor:'pointer', transition:'all .15s' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{t.label}</div>
                  <span style={{ fontSize:11, color:'var(--ts)' }}>{t.dur}min</span>
                </div>
                <div style={{ fontSize:12, color:'var(--ts)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ fontSize:12, color:'var(--tm)', display:'block', marginBottom:4 }}>Observações (opcional)</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} className="inp"
              placeholder="Descreva sintomas, dúvidas ou informações relevantes..."
              style={{ resize:'vertical', minHeight:80, fontSize:13 }}/>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setStep('horario')} className="btn btn-o" style={{ flex:1 }}>← Voltar</button>
            <button onClick={() => setStep('confirmar')} className="btn btn-d" style={{ flex:2 }}>Continuar</button>
          </div>
        </div>
      )}

      {/* Step 4 — Confirmar */}
      {step === 'confirmar' && (
        <div style={CARD}>
          <div style={{ fontSize:13, fontWeight:500, marginBottom:'1.25rem' }}>Confirme seu agendamento</div>
          <div style={{ background:'#F9FAFB', borderRadius:12, padding:'1.25rem', marginBottom:'1.25rem' }}>
            {[
              ['📅 Data', `${String(diaSel).padStart(2,'0')}/${String(mesAtual+1).padStart(2,'0')}/${anoAtual}`],
              ['🕐 Horário', horarioSel || ''],
              ['🩺 Tipo', TIPOS.find(t => t.id===tipoSel)?.label || ''],
              ['⏱ Duração', `${TIPOS.find(t => t.id===tipoSel)?.dur || 30} minutos`],
              ...(obs ? [['📝 Obs', obs]] : []),
            ].map(([l, v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                <span style={{ color:'var(--ts)' }}>{l}</span>
                <span style={{ fontWeight:500, color:'var(--tx)', maxWidth:200, textAlign:'right' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:'#FFF7ED', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#C2410C', marginBottom:'1.25rem' }}>
            ⚠️ O médico confirmará o horário em até 24h via notificação na plataforma.
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setStep('tipo')} className="btn btn-o" style={{ flex:1 }}>← Voltar</button>
            <button onClick={agendar} disabled={salvando} className="btn btn-d" style={{ flex:2, background:'var(--green)', color:'white' }}>
              {salvando ? 'Agendando...' : '✓ Confirmar agendamento'}
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{ ...CARD, background:'#F0FDF4' }}>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--gm)', marginBottom:8 }}>🩺 Como funciona</div>
        <div style={{ fontSize:12, color:'var(--gm)', lineHeight:1.7 }}>
          Após agendar, nosso médico especialista em peptídeos revisará seu protocolo e entrará em contato para confirmar o horário. 
          A consulta acontece via videochamada. Você receberá o link por e-mail.
        </div>
      </div>
    </div>
  );
}
