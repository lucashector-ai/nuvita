// @ts-nocheck
'use client';

import { useState } from 'react';
import type { QuizAnswers } from '@/types';
import { OBJECTIVE_LABELS, DURACAO_LABELS, NIVEL_LABELS } from '@/types';
import { trocarPlano } from '@/lib/auth';
import PlanosModal from '@/components/modals/PlanosModal';

interface Props { answers: QuizAnswers; plan: string; onNavigate: (s: any) => void; userId?: string | null; onPlanChange?: (p: string) => void; }

const PLAN_LBL   = { free:'Conta gratuita', essencial:'Essencial', pro:'Pro ✦' };
const PLAN_COLOR = { free:'var(--ts)', essencial:'var(--gm)', pro:'#8B5CF6' };
const PLAN_BG    = { free:'var(--bg2)', essencial:'var(--gp)', pro:'rgba(139,92,246,.1)' };

export default function SectionPerfil({ answers, plan, onNavigate, userId, onPlanChange }: Props) {
  const nome    = answers.nome?.toString() ?? '—';
  const email   = answers.email ?? '—';
  const initial = nome !== '—' ? nome.charAt(0).toUpperCase() : '?';
  const objs    = answers.q3 ?? [];
  const dur     = answers.q9 ?? '8sem';
  const nivel   = answers.q4 ?? 'iniciante';
  const peso    = answers.peso ? Number(answers.peso) : null;
  const altura  = answers.altura ? Number(answers.altura) : null;
  const imc     = peso && altura ? (peso / ((altura/100)**2)).toFixed(1) : null;
  const imcLabel = imc ? (Number(imc)<18.5?'Abaixo do peso':Number(imc)<25?'Normal':Number(imc)<30?'Sobrepeso':'Obesidade') : null;

  const [planosOpen,  setPlanosOpen]  = useState(false);
  const [trocando,    setTrocando]    = useState(false);
  const [planoAtual,  setPlanoAtual]  = useState(plan);
  const [editNome,    setEditNome]    = useState(false);
  const [nomeVal,     setNomeVal]     = useState(nome);
  const [modoTeste,   setModoTeste]   = useState(false);
  const [toast,       setToast]       = useState('');

  const handleTrocarPlano = async (novoPlano: string) => {
    if (!userId || novoPlano === planoAtual) { setPlanosOpen(false); return; }
    setTrocando(true);
    try {
      await trocarPlano(userId, novoPlano);
      setPlanoAtual(novoPlano);
      onPlanChange?.(novoPlano);
      setPlanosOpen(false);
      setToast(`✅ Plano alterado para ${PLAN_LBL[novoPlano as keyof typeof PLAN_LBL] ?? novoPlano}!`);
      setTimeout(() => setToast(''), 4000);
    } catch(e) {
      setToast('Erro ao trocar plano. Tente novamente.');
      setTimeout(() => setToast(''), 3000);
    } finally { setTrocando(false); }
  };

  // Modo teste — troca plano diretamente sem modal
  const trocarPlanoDireto = async (novoPlano: string) => {
    if (!userId) return;
    setTrocando(true);
    try {
      await trocarPlano(userId, novoPlano);
      setPlanoAtual(novoPlano);
      onPlanChange?.(novoPlano);
      setToast(`✅ Plano alterado para ${PLAN_LBL[novoPlano as keyof typeof PLAN_LBL] ?? novoPlano}!`);
      setTimeout(() => setToast(''), 2500);
    } catch { setToast('Erro ao trocar plano.'); setTimeout(()=>setToast(''),3000); }
    finally { setTrocando(false); }
  };

  return (
    <div style={{ width:'100%', gridColumn:'1/-1' }}>
      {toast && (
        <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:10, padding:'10px 14px', marginBottom:'1rem', fontSize:13, color:'var(--gm)' }}>
          {toast}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.25rem', alignItems:'start' }}>
        {/* Coluna principal */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Card principal */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ height:100, background:'linear-gradient(135deg, #2E7A58 0%, #5EC991 100%)' }}/>
            <div style={{ padding:'0 1.5rem 1.5rem' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--gp)', border:'4px solid var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontWeight:600, color:'var(--gm)', marginTop:-36, marginBottom:'.875rem' }}>
                {initial}
              </div>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <div>
                  {editNome ? (
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                      <input value={nomeVal} onChange={e=>setNomeVal(e.target.value)} autoFocus onBlur={()=>setEditNome(false)}
                        style={{ fontSize:'1.2rem', fontWeight:500, border:'none', borderBottom:'2px solid var(--green)', outline:'none', fontFamily:'inherit', color:'var(--tx)', background:'transparent', width:220 }}/>
                      <button onClick={()=>setEditNome(false)} style={{ fontSize:11, color:'var(--gm)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>Salvar</button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', color:'var(--tx)' }}>{nomeVal}</h2>
                      <button onClick={()=>setEditNome(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ts)', padding:0 }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M8.5 2L11 4.5 3.5 12H1V9.5L8.5 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  )}
                  <div style={{ fontSize:12, color:'var(--ts)', marginBottom:8 }}>{email}</div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:PLAN_BG[planoAtual as keyof typeof PLAN_BG]??'var(--bg2)', borderRadius:100, padding:'3px 10px' }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:PLAN_COLOR[planoAtual as keyof typeof PLAN_COLOR]??'var(--ts)' }}/>
                    <span style={{ fontSize:11, fontWeight:500, color:PLAN_COLOR[planoAtual as keyof typeof PLAN_COLOR]??'var(--ts)' }}>{PLAN_LBL[planoAtual as keyof typeof PLAN_LBL]??planoAtual}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {planoAtual !== 'pro' && (
                    <button className="btn btn-d" style={{ fontSize:13, background:'#7F77DD' }} onClick={() => setPlanosOpen(true)} disabled={trocando}>
                      ⚡ Upgrade
                    </button>
                  )}
                  <button className="btn btn-o" onClick={()=>onNavigate('config')} style={{ fontSize:13 }}>⚙️ Config.</button>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do protocolo */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Resumo do protocolo</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <div style={{ fontSize:11, color:'var(--ts)', marginBottom:6 }}>Objetivos</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {objs.length>0 ? objs.map((o: string)=>(
                    <span key={o} style={{ fontSize:11, background:'var(--gp)', color:'var(--gm)', padding:'2px 9px', borderRadius:100, fontWeight:500 }}>{OBJECTIVE_LABELS[o]}</span>
                  )) : <span style={{ fontSize:12, color:'var(--ts)' }}>—</span>}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, color:'var(--ts)', marginBottom:6 }}>Ciclo</div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{DURACAO_LABELS[dur]??dur}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:'var(--ts)', marginBottom:6 }}>Nível</div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{NIVEL_LABELS[nivel]??nivel}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:'var(--ts)', marginBottom:6 }}>Biometria</div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>
                  {peso?`${peso} kg`:'—'} · {altura?`${altura} cm`:'—'}
                  {imc && <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>IMC {imc} ({imcLabel})</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Modo teste */}
          <div style={{ background:'var(--bg)', border:'1px dashed var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: modoTeste?'1rem':0 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--tm)' }}>🧪 Modo teste de planos</div>
                <div style={{ fontSize:11, color:'var(--ts)' }}>Simule diferentes planos para testar a plataforma</div>
              </div>
              <div onClick={()=>setModoTeste(v=>!v)}
                style={{ width:38, height:22, borderRadius:11, background:modoTeste?'var(--green)':'var(--border)', position:'relative', cursor:'pointer', flexShrink:0, transition:'background .2s' }}>
                <div style={{ position:'absolute', top:3, left:modoTeste?19:3, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
              </div>
            </div>
            {modoTeste && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {[
                  { id:'free',      label:'Free',      cor:'var(--ts)',  bg:'var(--bg2)' },
                  { id:'essencial', label:'Essencial', cor:'var(--gm)',  bg:'var(--gp)' },
                  { id:'pro',       label:'Pro ✦',     cor:'#8B5CF6',   bg:'rgba(139,92,246,.1)' },
                ].map(p => (
                  <button key={p.id}
                    disabled={planoAtual === p.id || trocando}
                    onClick={() => trocarPlanoDireto(p.id)}
                    style={{ padding:'10px', borderRadius:10, border:`2px solid ${planoAtual===p.id?p.cor:'var(--border)'}`, background:planoAtual===p.id?p.bg:'var(--bg2)', color:planoAtual===p.id?p.cor:'var(--ts)', fontFamily:'inherit', fontSize:12, fontWeight:500, cursor:planoAtual===p.id?'default':'pointer', opacity:trocando?.6:1 }}>
                    {planoAtual===p.id?'✓ ':''}{p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conta */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Conta</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <a href="/diagnostico" style={{ textDecoration:'none' }}>
                <button className="btn btn-o fw" style={{ fontSize:13 }}>🔄 Refazer diagnóstico</button>
              </a>
              <button className="btn btn-o fw" style={{ fontSize:13, color:'#D85A30', borderColor:'rgba(216,90,48,.3)' }}
                onClick={() => onNavigate('config')}>
                🗑️ Excluir conta (nas configurações)
              </button>
            </div>
          </div>
        </div>

        {/* Coluna lateral */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Stats */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Estatísticas</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Semana atual',  val:'1',           icon:'📅' },
                { label:'Adesão',        val:'0%',          icon:'📊' },
                { label:'Objetivos',     val:objs.length?`${objs.length}`:'—', icon:'🎯' },
                { label:'IMC',           val:imc??'—',      icon:'⚖️' },
              ].map(s => (
                <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{s.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</div>
                    <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{s.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefícios do plano atual */}
          <div style={{ background: planoAtual==='pro'?'rgba(139,92,246,.06)':planoAtual==='essencial'?'var(--gp)':'var(--bg)', border:`1px solid ${planoAtual==='pro'?'rgba(139,92,246,.2)':planoAtual==='essencial'?'rgba(29,158,117,.2)':'var(--border)'}`, borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color: planoAtual==='pro'?'#8B5CF6':planoAtual==='essencial'?'var(--gm)':'var(--ts)', marginBottom:'1rem' }}>
              Seu plano — {PLAN_LBL[planoAtual as keyof typeof PLAN_LBL]}
            </div>
            {planoAtual === 'free' && (
              <>
                <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.65, marginBottom:'1rem' }}>
                  No plano gratuito você tem acesso ao diagnóstico e protocolo básico.
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:'1rem' }}>
                  {['Tracker avançado','Diário de sintomas','Coach IA','Estoque e rotina'].map(f => (
                    <div key={f} style={{ fontSize:12, color:'var(--ts)', display:'flex', gap:6 }}>
                      <span>🔒</span>{f}
                    </div>
                  ))}
                </div>
                <button className="btn btn-d fw" style={{ background:'#1D9E75', fontSize:12 }} onClick={()=>setPlanosOpen(true)}>
                  ⚡ Desbloquear com Essencial — R$39/mês
                </button>
              </>
            )}
            {planoAtual === 'essencial' && (
              <>
                <div style={{ fontSize:12, color:'var(--gm)', lineHeight:1.65, marginBottom:'1rem' }}>
                  Você tem acesso a todas as ferramentas de acompanhamento.
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:'1rem' }}>
                  {['Consulta médica especializada','Revisão do protocolo por médico','Ajustes personalizados'].map(f => (
                    <div key={f} style={{ fontSize:12, color:'var(--gm)', opacity:.7, display:'flex', gap:6 }}>
                      <span>🔒</span>{f}
                    </div>
                  ))}
                </div>
                <button className="btn btn-d fw" style={{ background:'#7F77DD', fontSize:12 }} onClick={()=>setPlanosOpen(true)}>
                  ⚡ Upgrade para Pro — R$79/mês
                </button>
              </>
            )}
            {planoAtual === 'pro' && (
              <div style={{ fontSize:12, color:'#8B5CF6', lineHeight:1.65 }}>
                ✦ Você tem acesso completo a todos os recursos da Nuvita, incluindo consultas médicas especializadas.
              </div>
            )}
          </div>

          {/* Ações rápidas */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Ações rápidas</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="btn btn-o fw" onClick={()=>onNavigate('tracker')} style={{ fontSize:12, textAlign:'left' }}>📊 Ver tracker</button>
              <button className="btn btn-o fw" onClick={()=>onNavigate('historico')} style={{ fontSize:12, textAlign:'left' }}>🗃 Ver histórico</button>
              <button className="btn btn-o fw" onClick={()=>onNavigate('exportacao')} style={{ fontSize:12, textAlign:'left' }}>📄 Exportar protocolo</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de planos */}
      {planosOpen && (
        <PlanosModal
          planoAtual={planoAtual}
          onClose={() => setPlanosOpen(false)}
          onSelect={handleTrocarPlano}
        />
      )}
    </div>
  );
}
