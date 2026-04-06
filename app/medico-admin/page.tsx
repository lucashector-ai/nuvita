// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SENHA = process.env.NEXT_PUBLIC_MEDICO_TOKEN || 'nuvita_medico_2026';

const DIAS_CONFIG = [
  { id:0, label:'Domingo' },
  { id:1, label:'Segunda' },
  { id:2, label:'Terça' },
  { id:3, label:'Quarta' },
  { id:4, label:'Quinta' },
  { id:5, label:'Sexta' },
  { id:6, label:'Sábado' },
];

const HORAS = [
  '06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30',
  '10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30','20:00',
];

const STATUS_COLOR: Record<string,{bg:string,color:string}> = {
  pendente:   { bg:'#FFF7ED', color:'#C2410C' },
  confirmado: { bg:'#DCFCE7', color:'#15803D' },
  concluido:  { bg:'#F0F9FF', color:'#0369A1' },
  cancelado:  { bg:'#F3F4F6', color:'#6B7280' },
};

type Faixa = { inicio: string; fim: string };
type DiaConfig = { ativo: boolean; faixas: Faixa[] };
type Excecao = { data: string; horarios: string[] };

const DEFAULT_CONFIG: DiaConfig[] = DIAS_CONFIG.map(d => ({
  ativo: d.id >= 1 && d.id <= 5,
  faixas: [{ inicio: '09:00', fim: '17:00' }],
}));

export default function MedicoAdmin() {
  const [auth, setAuth]             = useState(false);
  const [senha, setSenha]           = useState('');
  const [senhaErro, setSenhaErro]   = useState(false);
  const [aba, setAba]               = useState<'consultas'|'agenda'>('consultas');
  const [consultas, setConsultas]   = useState<any[]>([]);
  const [filtro, setFiltro]         = useState('todas');
  const [notaEdit, setNotaEdit]     = useState<{id:string,nota:string}|null>(null);
  const [linkEdit, setLinkEdit]     = useState<{id:string,link:string}|null>(null);
  const [confirmDel, setConfirmDel] = useState<string|null>(null);

  // Agenda
  const [semana, setSemana]         = useState<DiaConfig[]>(DEFAULT_CONFIG);
  const [excecoes, setExcecoes]     = useState<Excecao[]>([]);
  const [salvando, setSalvando]     = useState(false);
  const [salvo, setSalvo]           = useState(false);
  const [showExcecao, setShowExcecao] = useState(false);
  const [novaExcecao, setNovaExcecao] = useState({ data:'', horarios:[] as string[] });

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('nv_medico') === '1') {
      setAuth(true);
    }
  }, []);

  useEffect(() => {
    if (auth) { carregarConsultas(); carregarDisponibilidade(); }
  }, [auth]);

  const login = () => {
    if (senha === SENHA) { setAuth(true); sessionStorage.setItem('nv_medico','1'); }
    else { setSenhaErro(true); setTimeout(() => setSenhaErro(false), 2000); }
  };

  const carregarConsultas = async () => {
    const { data } = await supabase.from('agendamentos').select('*').order('data');
    setConsultas(data || []);
  };

  const carregarDisponibilidade = async () => {
    const { data } = await supabase.from('disponibilidade_semanal').select('*').order('dia_semana');
    if (data && data.length > 0) {
      const cfg = [...DEFAULT_CONFIG];
      // Agrupa por dia
      const porDia: Record<number, {inicio:string,fim:string}[]> = {};
      data.forEach(d => {
        if (!porDia[d.dia_semana]) porDia[d.dia_semana] = [];
        porDia[d.dia_semana].push({ inicio: d.inicio.slice(0,5), fim: d.fim.slice(0,5) });
      });
      DIAS_CONFIG.forEach(d => {
        cfg[d.id].ativo = !!(porDia[d.id] && porDia[d.id].length > 0);
        cfg[d.id].faixas = porDia[d.id] || [{ inicio:'09:00', fim:'17:00' }];
      });
      setSemana(cfg);
    }
  };

  const toggleDia = (idx: number) => {
    setSemana(p => p.map((d,i) => i===idx ? {...d, ativo:!d.ativo} : d));
  };

  const atualizarFaixa = (diaIdx: number, faixaIdx: number, campo: 'inicio'|'fim', val: string) => {
    setSemana(p => p.map((d,i) => i===diaIdx ? {
      ...d, faixas: d.faixas.map((f,fi) => fi===faixaIdx ? {...f,[campo]:val} : f)
    } : d));
  };

  const adicionarFaixa = (diaIdx: number) => {
    setSemana(p => p.map((d,i) => i===diaIdx ? {
      ...d, faixas: [...d.faixas, { inicio:'09:00', fim:'17:00' }]
    } : d));
  };

  const removerFaixa = (diaIdx: number, faixaIdx: number) => {
    setSemana(p => p.map((d,i) => i===diaIdx ? {
      ...d, faixas: d.faixas.filter((_,fi) => fi!==faixaIdx)
    } : d));
  };

  const copiarParaTodos = (diaIdx: number) => {
    const faixas = semana[diaIdx].faixas;
    setSemana(p => p.map((d,i) => d.ativo && i!==diaIdx ? {...d, faixas} : d));
  };

  const salvarDisponibilidade = async () => {
    setSalvando(true);
    // Apaga e reinseriu
    await supabase.from('disponibilidade_semanal').delete().neq('id','00000000-0000-0000-0000-000000000000');
    const rows: any[] = [];
    semana.forEach((d, idx) => {
      if (d.ativo) {
        d.faixas.forEach(f => {
          rows.push({ dia_semana: idx, inicio: f.inicio, fim: f.fim, ativo: true });
        });
      }
    });
    if (rows.length > 0) await supabase.from('disponibilidade_semanal').insert(rows);
    // Gera slots para os próximos 60 dias
    await gerarSlots();
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  const gerarSlots = async () => {
    // Gera disponibilidade_medico para os próximos 60 dias com base na config semanal
    const hoje = new Date();
    const rows: any[] = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      const dow = d.getDay();
      const cfg = semana[dow];
      if (!cfg.ativo) continue;
      const ds = d.toISOString().split('T')[0];
      const slots: string[] = [];
      cfg.faixas.forEach(f => {
        let cur = f.inicio;
        while (cur < f.fim) {
          slots.push(cur);
          const [h,m] = cur.split(':').map(Number);
          const next = m === 30 ? `${String(h+1).padStart(2,'0')}:00` : `${String(h).padStart(2,'0')}:30`;
          cur = next;
        }
      });
      if (slots.length > 0) rows.push({ data: ds, horarios: slots });
    }
    if (rows.length > 0) {
      await supabase.from('disponibilidade_medico').upsert(rows, { onConflict: 'data' });
    }
  };

  const atualizarStatus = async (id: string, status: string) => {
    await supabase.from('agendamentos').update({ status }).eq('id', id);
    const c = consultas.find(x => x.id===id);
    if (c?.user_id) {
      await supabase.from('notificacoes').insert({
        user_id: c.user_id, icon: status==='confirmado'?'✅':'❌',
        titulo: status==='confirmado' ? 'Consulta confirmada!' : 'Consulta cancelada',
        texto: status==='confirmado'
          ? `Sua consulta de ${c.tipo_label} em ${c.data} às ${c.horario} foi confirmada.`
          : `Sua consulta de ${c.tipo_label} em ${c.data} foi cancelada.`,
        action: 'consultas',
      });
    }
    carregarConsultas();
  };

  const salvarNota = async () => {
    if (!notaEdit) return;
    await supabase.from('agendamentos').update({ notas_medico: notaEdit.nota }).eq('id', notaEdit.id);
    setNotaEdit(null); carregarConsultas();
  };

  const salvarLink = async () => {
    if (!linkEdit) return;
    await supabase.from('agendamentos').update({ link_videochamada: linkEdit.link }).eq('id', linkEdit.id);
    const c = consultas.find(x => x.id===linkEdit.id);
    if (c?.user_id) {
      await supabase.from('notificacoes').insert({
        user_id: c.user_id, icon:'📹',
        titulo: 'Link da consulta pronto!',
        texto: `Link disponível para sua consulta de ${c.tipo_label} em ${c.data} às ${c.horario}.`,
        action: 'consultas',
      });
    }
    setLinkEdit(null); carregarConsultas();
  };

  const deletarConsulta = async (id: string) => {
    await supabase.from('agendamentos').delete().eq('id', id);
    setConfirmDel(null);
    carregarConsultas();
  };

  const filtradas = consultas.filter(c => filtro==='todas' || c.status===filtro);
  const CARD = { background:'#FFFFFF', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', marginBottom:12 };

  if (!auth) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F7F7' }}>
      <div style={{ background:'white', borderRadius:20, padding:'2.5rem', width:360, boxShadow:'0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2rem', marginBottom:8 }}>🩺</div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500 }}>Painel do Médico</h2>
          <p style={{ fontSize:13, color:'#6B7280', marginTop:4 }}>Acesso exclusivo Nuvita</p>
        </div>
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key==='Enter' && login()}
          style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1.5px solid ${senhaErro?'#FECACA':'#E5E7EB'}`, fontSize:14, fontFamily:'inherit', outline:'none', marginBottom:12, boxSizing:'border-box' }}
          placeholder="Senha de acesso"/>
        {senhaErro && <div style={{ fontSize:12, color:'#D85A30', marginBottom:8, textAlign:'center' }}>Senha incorreta</div>}
        <button onClick={login}
          style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background:'#111827', color:'white', fontFamily:'inherit', fontSize:14, fontWeight:500, cursor:'pointer' }}>
          Entrar
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F7F7F7' }}>
      {/* Nav */}
      <div style={{ background:'white', borderBottom:'1px solid #E5E7EB', padding:'0 2rem', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'1.1rem' }}>🩺</span>
          <span style={{ fontSize:14, fontWeight:600 }}>Nuvita — Painel Médico</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {(['consultas','agenda'] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              style={{ padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500,
                background: aba===a ? '#111827' : '#F3F4F6', color: aba===a ? 'white' : '#374151' }}>
              {a==='consultas' ? '📋 Consultas' : '📅 Disponibilidade'}
            </button>
          ))}
          <button onClick={() => { sessionStorage.removeItem('nv_medico'); setAuth(false); }}
            style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'#6B7280' }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'2rem' }}>

        {/* ══ ABA CONSULTAS ══ */}
        {aba === 'consultas' && <>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:'1.5rem' }}>
            {[
              { l:'Pendentes', v:consultas.filter(c=>c.status==='pendente').length, bg:'#FFF7ED', col:'#C2410C' },
              { l:'Confirmadas', v:consultas.filter(c=>c.status==='confirmado').length, bg:'#DCFCE7', col:'#15803D' },
              { l:'Concluídas', v:consultas.filter(c=>c.status==='concluido').length, bg:'#F0F9FF', col:'#0369A1' },
              { l:'Total', v:consultas.length, bg:'#F3F4F6', col:'#374151' },
            ].map(s => (
              <div key={s.l} style={{ background:s.bg, borderRadius:12, padding:'1rem', textAlign:'center', boxShadow:'0 1px 2px rgba(0,0,0,.04)' }}>
                <div style={{ fontSize:26, fontWeight:700, color:s.col }}>{s.v}</div>
                <div style={{ fontSize:12, color:s.col, opacity:.8 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div style={{ display:'flex', gap:8, marginBottom:'1rem' }}>
            {['todas','pendente','confirmado','concluido','cancelado'].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                style={{ padding:'5px 14px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12,
                  background: filtro===f ? '#111827' : '#F3F4F6', color: filtro===f ? 'white' : '#374151' }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>

          {filtradas.length === 0 && (
            <div style={{ ...CARD, textAlign:'center', padding:'3rem', color:'#6B7280' }}>Nenhuma consulta encontrada.</div>
          )}

          {filtradas.map(c => {
            const st = STATUS_COLOR[c.status] || STATUS_COLOR.pendente;
            return (
              <div key={c.id} style={CARD}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                      <span style={{ fontSize:14, fontWeight:600 }}>{c.nome_paciente || 'Paciente'}</span>
                      <span style={{ fontSize:11, fontWeight:500, padding:'2px 10px', borderRadius:100, background:st.bg, color:st.color }}>{c.status}</span>
                      <span style={{ fontSize:11, color:'#6B7280' }}>{c.tipo_label} · {c.duracao_min}min</span>
                    </div>
                    <div style={{ fontSize:12, color:'#6B7280', marginBottom:6 }}>
                      📅 {new Date(c.data+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})} às {c.horario}
                      {c.email_paciente && <span> &nbsp;·&nbsp; ✉️ {c.email_paciente}</span>}
                    </div>
                    {c.observacoes && (
                      <div style={{ fontSize:12, background:'#F9FAFB', borderRadius:8, padding:'6px 10px', marginBottom:6 }}>
                        <strong>Obs:</strong> {c.observacoes}
                      </div>
                    )}
                    {c.notas_medico && (
                      <div style={{ fontSize:12, background:'#F0F9FF', borderRadius:8, padding:'6px 10px', color:'#0369A1', marginBottom:6 }}>
                        <strong>Nota:</strong> {c.notas_medico}
                      </div>
                    )}
                    {c.link_videochamada && (
                      <div style={{ fontSize:12, color:'#15803D' }}>📹 {c.link_videochamada}</div>
                    )}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                    {c.status==='pendente' && <>
                      <button onClick={() => atualizarStatus(c.id,'confirmado')}
                        style={{ fontSize:12, fontWeight:500, padding:'6px 14px', borderRadius:8, border:'none', background:'#DCFCE7', color:'#15803D', cursor:'pointer', fontFamily:'inherit' }}>
                        ✓ Confirmar
                      </button>
                      <button onClick={() => atualizarStatus(c.id,'cancelado')}
                        style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:'none', background:'#FEE2E2', color:'#D85A30', cursor:'pointer', fontFamily:'inherit' }}>
                        ✗ Cancelar
                      </button>
                    </>}
                    {c.status==='confirmado' && (
                      <button onClick={() => atualizarStatus(c.id,'concluido')}
                        style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:'none', background:'#F0F9FF', color:'#0369A1', cursor:'pointer', fontFamily:'inherit' }}>
                        ✓ Concluído
                      </button>
                    )}
                    <button onClick={() => setLinkEdit({id:c.id, link:c.link_videochamada||''})}
                      style={{ fontSize:12, padding:'5px 12px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#374151' }}>
                      📹 Link
                    </button>
                    <button onClick={() => setNotaEdit({id:c.id, nota:c.notas_medico||''})}
                      style={{ fontSize:12, padding:'5px 12px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#374151' }}>
                      📝 Nota
                    </button>
                    {confirmDel === c.id ? (
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => deletarConsulta(c.id)}
                          style={{ fontSize:11, padding:'4px 10px', borderRadius:8, border:'none', background:'#D85A30', color:'white', cursor:'pointer', fontFamily:'inherit' }}>
                          Confirmar
                        </button>
                        <button onClick={() => setConfirmDel(null)}
                          style={{ fontSize:11, padding:'4px 8px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#6B7280' }}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel(c.id)}
                        style={{ fontSize:12, padding:'5px 12px', borderRadius:8, border:'1px solid #FECACA', background:'#FFF5F5', cursor:'pointer', fontFamily:'inherit', color:'#D85A30' }}>
                        🗑 Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>}

        {/* ══ ABA DISPONIBILIDADE — estilo cal.com ══ */}
        {aba === 'agenda' && <>
          <div style={{ ...CARD, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
              <div>
                <div style={{ fontSize:15, fontWeight:600 }}>Horas de trabalho</div>
                <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>Configure os dias e horários disponíveis para consultas</div>
              </div>
              <button onClick={salvarDisponibilidade} disabled={salvando}
                style={{ padding:'8px 24px', borderRadius:8, border:'none', background:'#111827', color:'white', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', minWidth:80 }}>
                {salvando ? '...' : salvo ? '✓ Salvo' : 'Salvar'}
              </button>
            </div>

            {DIAS_CONFIG.map((dia, idx) => {
              const cfg = semana[idx];
              return (
                <div key={dia.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 0', borderBottom: idx<6 ? '1px solid #F3F4F6' : 'none', minHeight:56 }}>
                  {/* Toggle */}
                  <div onClick={() => toggleDia(idx)}
                    style={{ width:38, height:22, borderRadius:100, cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0,
                      background: cfg.ativo ? '#111827' : '#D1D5DB' }}>
                    <div style={{ position:'absolute', top:3, left:cfg.ativo?'calc(100% - 19px)':3, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.25)' }}/>
                  </div>

                  {/* Nome */}
                  <div style={{ width:80, fontSize:14, fontWeight:500, color:cfg.ativo?'#111827':'#9CA3AF', flexShrink:0 }}>
                    {dia.label}
                  </div>

                  {/* Faixas de horário */}
                  {cfg.ativo ? (
                    <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, flexWrap:'wrap' }}>
                      {cfg.faixas.map((faixa, fi) => (
                        <div key={fi} style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <select value={faixa.inicio} onChange={e => atualizarFaixa(idx,fi,'inicio',e.target.value)}
                            style={{ padding:'6px 8px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, fontFamily:'inherit', background:'white', cursor:'pointer', color:'#111827' }}>
                            {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <span style={{ fontSize:13, color:'#9CA3AF' }}>–</span>
                          <select value={faixa.fim} onChange={e => atualizarFaixa(idx,fi,'fim',e.target.value)}
                            style={{ padding:'6px 8px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:13, fontFamily:'inherit', background:'white', cursor:'pointer', color:'#111827' }}>
                            {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          {fi > 0 && (
                            <button onClick={() => removerFaixa(idx,fi)}
                              style={{ width:24, height:24, borderRadius:6, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:16, lineHeight:1 }}>
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => adicionarFaixa(idx)}
                        style={{ width:28, height:28, borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151', fontSize:18, lineHeight:1 }}>
                        +
                      </button>
                      <button onClick={() => copiarParaTodos(idx)} title="Copiar para todos os dias ativos"
                        style={{ width:28, height:28, borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#6B7280' }}>
                        ⧉
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize:13, color:'#9CA3AF' }}>Indisponível</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Date overrides */}
          <div style={CARD}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Exceções por data</div>
            <div style={{ fontSize:12, color:'#6B7280', marginBottom:'1rem' }}>
              Adicione datas com horários diferentes do padrão semanal
            </div>
            {excecoes.length === 0 && (
              <div style={{ fontSize:13, color:'#9CA3AF', marginBottom:12 }}>Nenhuma exceção cadastrada.</div>
            )}
            {excecoes.map((ex,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #F3F4F6' }}>
                <div style={{ fontSize:13, fontWeight:500, minWidth:110 }}>
                  {new Date(ex.data+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}
                </div>
                <div style={{ fontSize:12, color:'#6B7280', flex:1 }}>
                  {ex.horarios.length===0 ? 'Sem atendimento' : ex.horarios.join(', ')}
                </div>
                <button onClick={() => setExcecoes(p => p.filter((_,j)=>j!==i))}
                  style={{ fontSize:12, color:'#D85A30', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                  Remover
                </button>
              </div>
            ))}
            <button onClick={() => setShowExcecao(true)}
              style={{ display:'flex', alignItems:'center', gap:6, marginTop:12, padding:'8px 14px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'#374151' }}>
              + Adicionar exceção
            </button>
          </div>
        </>}
      </div>

      {/* Modal nota */}
      {notaEdit && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300 }}
          onClick={e => { if(e.target===e.currentTarget)setNotaEdit(null); }}>
          <div style={{ background:'white',borderRadius:16,padding:'1.5rem',maxWidth:420,width:'100%',boxShadow:'0 8px 32px rgba(0,0,0,.15)' }}>
            <h3 style={{ fontSize:14,fontWeight:600,marginBottom:'1rem' }}>Nota do médico</h3>
            <textarea value={notaEdit.nota} onChange={e=>setNotaEdit(p=>p?{...p,nota:e.target.value}:null)}
              style={{ width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #E5E7EB',fontSize:13,fontFamily:'inherit',resize:'vertical',minHeight:100,marginBottom:12,boxSizing:'border-box',outline:'none' }}
              placeholder="Observações, diagnóstico, recomendações..."/>
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={salvarNota} style={{ flex:1,padding:'10px',borderRadius:10,border:'none',background:'#111827',color:'white',fontFamily:'inherit',fontSize:13,fontWeight:500,cursor:'pointer' }}>Salvar</button>
              <button onClick={()=>setNotaEdit(null)} style={{ padding:'10px 16px',borderRadius:10,border:'1px solid #E5E7EB',background:'white',cursor:'pointer',fontFamily:'inherit',fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal link */}
      {linkEdit && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300 }}
          onClick={e => { if(e.target===e.currentTarget)setLinkEdit(null); }}>
          <div style={{ background:'white',borderRadius:16,padding:'1.5rem',maxWidth:420,width:'100%',boxShadow:'0 8px 32px rgba(0,0,0,.15)' }}>
            <h3 style={{ fontSize:14,fontWeight:600,marginBottom:'1rem' }}>Link da videochamada</h3>
            <input value={linkEdit.link} onChange={e=>setLinkEdit(p=>p?{...p,link:e.target.value}:null)}
              style={{ width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #E5E7EB',fontSize:13,fontFamily:'inherit',marginBottom:12,boxSizing:'border-box',outline:'none' }}
              placeholder="https://meet.google.com/xxx"/>
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={salvarLink} style={{ flex:1,padding:'10px',borderRadius:10,border:'none',background:'#111827',color:'white',fontFamily:'inherit',fontSize:13,fontWeight:500,cursor:'pointer' }}>Salvar e notificar</button>
              <button onClick={()=>setLinkEdit(null)} style={{ padding:'10px 16px',borderRadius:10,border:'1px solid #E5E7EB',background:'white',cursor:'pointer',fontFamily:'inherit',fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal exceção */}
      {showExcecao && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300 }}
          onClick={e => { if(e.target===e.currentTarget)setShowExcecao(false); }}>
          <div style={{ background:'white',borderRadius:16,padding:'1.5rem',maxWidth:380,width:'100%',boxShadow:'0 8px 32px rgba(0,0,0,.15)' }}>
            <h3 style={{ fontSize:14,fontWeight:600,marginBottom:'1rem' }}>Adicionar exceção</h3>
            <label style={{ fontSize:12,color:'#6B7280',display:'block',marginBottom:4 }}>Data</label>
            <input type="date" value={novaExcecao.data} onChange={e=>setNovaExcecao(p=>({...p,data:e.target.value}))}
              style={{ width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #E5E7EB',fontSize:13,fontFamily:'inherit',marginBottom:12,boxSizing:'border-box' }}/>
            <label style={{ fontSize:12,color:'#6B7280',display:'block',marginBottom:4 }}>Marcar como</label>
            <div style={{ display:'flex',gap:8,marginBottom:12 }}>
              <button onClick={()=>setNovaExcecao(p=>({...p,horarios:[]}))}
                style={{ flex:1,padding:'8px',borderRadius:8,border:`2px solid ${novaExcecao.horarios.length===0?'#111827':'#E5E7EB'}`,background:novaExcecao.horarios.length===0?'#111827':'white',color:novaExcecao.horarios.length===0?'white':'#374151',cursor:'pointer',fontFamily:'inherit',fontSize:12 }}>
                Sem atendimento
              </button>
            </div>
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={()=>{
                if(!novaExcecao.data)return;
                setExcecoes(p=>[...p,novaExcecao]);
                setNovaExcecao({data:'',horarios:[]});
                setShowExcecao(false);
              }} style={{ flex:1,padding:'10px',borderRadius:10,border:'none',background:'#111827',color:'white',fontFamily:'inherit',fontSize:13,fontWeight:500,cursor:'pointer' }}>
                Adicionar
              </button>
              <button onClick={()=>setShowExcecao(false)} style={{ padding:'10px 16px',borderRadius:10,border:'1px solid #E5E7EB',background:'white',cursor:'pointer',fontFamily:'inherit',fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
