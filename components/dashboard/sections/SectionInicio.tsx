// @ts-nocheck
'use client';

import { useState } from 'react';
import type { Peptide, QuizAnswers, ObjectiveKey, DashSection } from '@/types';
import { OBJECTIVE_LABELS, DURACAO_LABELS } from '@/types';
import PeptideTooltip from '@/components/ui/PeptideTooltip';

const FASES = [
  { s:[1,2],   nome:'Adaptação celular',   desc:'Seu corpo está se ajustando. Possível leve cansaço.',          cor:'#EF9F27', bg:'#FAEEDA' },
  { s:[3,4],   nome:'Ativação metabólica', desc:'Primeiros sinais de melhora. Energia e sono tendem a estabilizar.',     cor:'#1D9E75', bg:'#E1F5EE' },
  { s:[5,8],   nome:'Resultados iniciais', desc:'Mudanças perceptíveis. Mantenha a consistência.',              cor:'#1D9E75', bg:'#E1F5EE' },
  { s:[9,16],  nome:'Consolidação',        desc:'Resultados se solidificam. Corpo responde melhor.',            cor:'#7F77DD', bg:'#EEEDFE' },
  { s:[17,99], nome:'Otimização avançada', desc:'Refinamento. Ajustes finos para máximo resultado.',            cor:'#7F77DD', bg:'#EEEDFE' },
];
const MARCOS = [
  { semana:4,  texto:'Primeiros resultados' },
  { semana:8,  texto:'Resultados consolidados' },
  { semana:12, texto:'Análise de meio ciclo' },
  { semana:24, texto:'Conclusão do ciclo' },
];
const INSIGHTS = {
  1: 'Dias difíceis fazem parte. Foque no básico: água, sono e manter o protocolo.',
  2: 'Normal ter dias assim. A consistência gera resultados no longo prazo.',
  3: 'Dia neutro é dia consistente. Continue com sua rotina normal.',
  4: 'Energia positiva potencializa os peptídeos. Registre no tracker.',
  5: 'Excelente! Sinal de que o protocolo está funcionando. Registre no diário.',
};
const HUMOR_LABELS = ['😫','😔','😐','😊','🤩'];
const HUMOR_TEXTOS = ['Péssimo','Ruim','Neutro','Bem','Ótimo'];

function getFase(s) { return FASES.find(f=>s>=f.s[0]&&s<=f.s[1])||FASES[0]; }
function getMarco(s) { return MARCOS.find(m=>m.semana>s)||MARCOS[MARCOS.length-1]; }

// Componente de toast simples
function Toast({ msg, onClose }: any) {
  return (
    <div style={{ position:'fixed', bottom:24, right:24, background:'#111827', color:'white', padding:'12px 20px', borderRadius:12, fontSize:13, fontWeight:500, zIndex:999, display:'flex', alignItems:'center', gap:12, boxShadow:'0 4px 16px rgba(0,0,0,.2)', animation:'slideUp .3s ease' }}>
      <style>{`@keyframes slideUp { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }`}</style>
      {msg}
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', cursor:'pointer', fontSize:16, lineHeight:1 }}>×</button>
    </div>
  );
}

import OnboardingSemana1 from '@/components/dashboard/OnboardingSemana1';

export default function SectionInicio({ answers, items, peso, objs, dur, nivel, plan, protoAtivo, onStartProto, onNavigate }) {
  const nome      = answers.nome?.toString().split(' ')[0] ?? '';
  const semanas   = 1;
  const fase      = getFase(semanas);
  const marco     = getMarco(semanas);
  const imc       = answers.peso && answers.altura ? (Number(answers.peso)/Math.pow(Number(answers.altura)/100,2)).toFixed(1) : null;
  const durLabel  = DURACAO_LABELS[dur] ?? dur;
  const totalSem  = parseInt(durLabel)||24;

  const hoje = new Date().toDateString();
  const [checkInFeito, setCheckInFeito] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = sessionStorage.getItem('nv_checkin');
    if (!saved) return false;
    try { const d = JSON.parse(saved); return d.data === hoje; } catch { return false; }
  });
  const [checkInHumor, setCheckInHumor] = useState(() => {
    if (typeof window === 'undefined') return null;
    const saved = sessionStorage.getItem('nv_checkin');
    if (!saved) return null;
    try { const d = JSON.parse(saved); return d.data === hoje ? d.humor : null; } catch { return null; }
  });
  const [insightIA, setInsightIA] = useState(() => {
    if (typeof window === 'undefined') return '';
    const saved = sessionStorage.getItem('nv_checkin');
    if (!saved) return '';
    try { const d = JSON.parse(saved); return d.data === hoje ? d.insight : ''; } catch { return ''; }
  });
  const [tasksDone, setTasksDone] = useState(() => { if (typeof window === "undefined") return new Set(); try { const k = "nv_tasks_" + new Date().toISOString().split("T")[0]; const s = localStorage.getItem(k); return s ? new Set(JSON.parse(s)) : new Set(); } catch { return new Set(); } });
  const [expandido,    setExpandido]    = useState(null);
  const [starting,     setStarting]     = useState(false);

  const handleCheckIn = (h) => {
    const insight = INSIGHTS[h]||INSIGHTS[3];
    setCheckInHumor(h); setCheckInFeito(true); setInsightIA(insight);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nv_checkin', JSON.stringify({ data: hoje, humor: h, insight }));
    }
  };
  const handleStart   = () => {
    setStarting(true);
    // Salva data_inicio no banco
    (async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data:{ user } } = await supabase.auth.getUser();
      if (user) {
        const hoje = new Date().toISOString().split('T')[0];
        await supabase.from('usuarios').update({
          diagnostico: { ...answers, _dataInicioProtocolo: hoje }
        }).eq('id', user.id);
      }
    })();
    setTimeout(()=>{ onStartProto(); setStarting(false); }, 500);
  };
  const toggleTask = (id) => setTasksDone(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); try { localStorage.setItem("nv_tasks_" + new Date().toISOString().split("T")[0], JSON.stringify([...n])); } catch {} return n; });
  const toggleExpand  = (id) => setExpandido(p=>p===id?null:id);

  const tarefas = items.slice(0,6);
  const feitas  = tarefas.filter(t=>tasksDone.has(t.n)).length;
  const pctHoje = tarefas.length ? Math.round((feitas/tarefas.length)*100) : 0;

  return (
    <>
      <div className="d-banner" style={{ gridColumn:'1/-1', background:'radial-gradient(ellipse 90% 120% at 70% 0%,#B0EDD8 0%,var(--gp) 22%,#E4F9F2 45%,#F7FDFB 70%)', boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--gm)', marginBottom:'.375rem', opacity:.8 }}>
            {protoAtivo ? 'Semana '+semanas+' de '+totalSem : 'Protocolo pronto'}
          </div>
          <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', color:'var(--dark)', marginBottom:'.375rem', lineHeight:1.2 }}>
            {protoAtivo
              ? feitas===tarefas.length && tarefas.length>0
                ? (nome ? nome+', todas as ações concluídas hoje!' : 'Todas as ações concluídas hoje!')
                : (nome ? nome+', você tem '+(tarefas.length-feitas)+' ação'+(tarefas.length-feitas!==1?'oes':'')+' hoje' : 'Você tem '+(tarefas.length-feitas)+' ações hoje')
              : (nome ? nome+', seu protocolo está pronto' : 'Seu protocolo está pronto')}
          </h2>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, background:fase.bg, color:fase.cor, borderRadius:100, padding:'3px 10px', fontWeight:500 }}>
              {'⚡ '+fase.nome}
            </span>
            <span style={{ fontSize:12, color:'var(--gm)', opacity:.8 }}>
              {'Próximo marco: semana '+marco.semana+' — '+marco.texto}
            </span>
          </div>
          {imc && (
            <div style={{ fontSize:11, color:'var(--gm)', marginTop:6, opacity:.7 }}>
              {'Protocolo ajustado para '+objs.map(o=>OBJECTIVE_LABELS[o]).join(' + ')+' · IMC '+imc}
            </div>
          )}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0, alignItems:'flex-end' }}>
          <div style={{ display:'flex', gap:16, textAlign:'center' }}>
            {[{val:pctHoje+'%',label:'Hoje'},{val:''+semanas,label:'Semana'},{val:''+totalSem,label:'Total'}].map(s=>(
              <div key={s.label}>
                <div style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', color:'var(--dark)' }}>{s.val}</div>
                <div style={{ fontSize:10, color:'var(--gm)', textTransform:'uppercase', letterSpacing:'.06em', opacity:.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {protoAtivo && answers._dataInicioProtocolo && (
        <OnboardingSemana1
          dataInicio={answers._dataInicioProtocolo}
          userId={answers._userId || null}
          onNavigate={onNavigate}
        />
      )}

      {!protoAtivo && (
        <div className="start-cta" style={{ gridColumn:'1/-1' }}>
          <div className="sc-l">
            <div className="sc-badge"><div className="pdot"/>Protocolo pronto</div>
            <div className="sc-t">Quando tiver os peptídeos em mãos, dê o start.</div>
            <div className="sc-s">Você pode iniciar a qualquer momento. Seu progresso será acompanhado desde o dia 1.</div>
          </div>
          <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', alignItems:'center' }}>
            <button className="btn btn-d" onClick={handleStart} disabled={starting} style={{ minWidth:156 }}>
              {starting ? '⏳ Iniciando...' : '▶ Iniciar protocolo'}
            </button>
            <button className="btn btn-o" onClick={()=>onNavigate('protocolo')}>Ver protocolo</button>
          </div>
        </div>
      )}

      <div className="d-col-l">
        <div className="dc">
          <div className="dc-h">
            <div>
              <div className="dc-t">Ações de hoje</div>
              {tarefas.length>0 && <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{feitas+'/'+tarefas.length+' concluídas'}</div>}
            </div>
            {protoAtivo && tarefas.length>0 && (
              <div style={{ height:6, width:80, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:pctHoje+'%', background:'var(--green)', borderRadius:3, transition:'width .3s' }}/>
              </div>
            )}
          </div>

      {!protoAtivo && (
            <div style={{ padding:'10px 12px', background:'var(--ab)', borderRadius:9, fontSize:12, color:'var(--am)', display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              Inicie o protocolo para desbloquear as tarefas
            </div>
          )}

          <div className="t-list">
            {tarefas.map(item => {
              const done     = tasksDone.has(item.n);
              const expanded = expandido===item.n;
              return (
                <div key={item.n}
                  style={{
                    opacity: protoAtivo ? 1 : 0.5,
                    background: expanded ? 'var(--gp)' : 'transparent',
                    borderRadius: 12,
                    transition: 'background .2s ease',
                    marginBottom: 2,
                  }}
                  onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = 'var(--bg2)'; }}
                  onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Linha principal */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', cursor:'pointer' }}>
                    {/* Checkbox */}
                    <div
                      className={'t-cb'+(done?' checked':'')}
                      onClick={e => { e.stopPropagation(); protoAtivo && toggleTask(item.n); }}
                      style={{ flexShrink:0 }}
                    >
                      {done && <svg width="10" height="10" fill="none" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>

                    {/* Nome + timing */}
                    <div style={{ flex:1, minWidth:0 }} onClick={() => toggleExpand(item.n)}>
                      <div style={{ fontSize:13, fontWeight:500, color: done ? 'var(--ts)' : 'var(--tx)', textDecoration: done ? 'line-through' : 'none', display:'flex', alignItems:'center', gap:6 }}>
                        <span>{item.e}</span>
                        <span>{item.n}</span>
                      </div>
                      <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{item.timing}</div>
                    </div>

                    {/* Ícone info */}
                    <div
                      onClick={e => { e.stopPropagation(); toggleExpand(item.n); }}
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: expanded ? 'var(--green)' : 'var(--bg2)',
                        border: '1px solid', borderColor: expanded ? 'var(--green)' : 'var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                        transition: 'all .2s ease',
                        fontSize: 11, fontWeight: 700,
                        color: expanded ? 'white' : 'var(--ts)',
                        userSelect: 'none',
                      }}
                    >
                      i
                    </div>
                  </div>

                  {/* Painel de info — animado */}
                  <div style={{
                    overflow: 'hidden',
                    maxHeight: expanded ? 200 : 0,
                    transition: 'max-height .3s cubic-bezier(.4,0,.2,1)',
                  }}>
                    <div style={{ padding: '0 12px 12px 44px' }}>
                      <div style={{ fontSize:11, fontWeight:600, color:'var(--gm)', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em' }}>
                        Por que você está tomando
                      </div>
                      <div style={{ fontSize:12, color:'var(--gm)', lineHeight:1.65, marginBottom:8 }}>
                        {item.why || item.m}
                      </div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:10, background:'rgba(29,158,117,.2)', color:'var(--gm)', borderRadius:100, padding:'2px 8px', fontWeight:500 }}>
                          💊 {item.doseStr(peso)}
                        </span>
                        <span style={{ fontSize:10, background:'rgba(29,158,117,.2)', color:'var(--gm)', borderRadius:100, padding:'2px 8px', fontWeight:500 }}>
                          📍 {item.route}
                        </span>
                        <button onClick={()=>onNavigate('lib')} style={{ fontSize:10, background:'var(--dark)', color:'white', borderRadius:100, padding:'2px 8px', fontWeight:500, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                          Saber mais →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dc">
          <div className="dc-h">
            <div className="dc-t">Sua jornada</div>
            <span style={{ fontSize:11, background:fase.bg, color:fase.cor, borderRadius:100, padding:'2px 8px', fontWeight:500 }}>{fase.nome}</span>
          </div>
          <div style={{ marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ts)', marginBottom:6 }}>
              <span>Semana {semanas}</span><span>Semana {totalSem}</span>
            </div>
            <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden', marginBottom:6 }}>
              <div style={{ height:'100%', width:((semanas/totalSem)*100)+'%', background:'var(--green)', borderRadius:4 }}/>
            </div>
            <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.6 }}>{fase.desc}</div>
          </div>
          <div style={{ background:'#FFFFFF', borderRadius:10, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:'1.2rem' }}>🎯</span>
            <div>
              <div style={{ fontSize:11, fontWeight:500, color:'var(--tx)' }}>Próximo marco — Semana {marco.semana}</div>
              <div style={{ fontSize:11, color:'var(--ts)', marginTop:1 }}>{marco.texto}</div>
            </div>
          </div>
        </div>

        <div className="dc" style={{ cursor:'pointer' }}
          onClick={()=>onNavigate(semanas<=2?'protocolo':semanas<=4?'tracker':'analise')}
          onMouseEnter={e=>e.currentTarget.style.borderColor='var(--green)'}
          onMouseLeave={e=>e.currentTarget.style.borderColor=''}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:3 }}>
                {semanas<=2?'Ver meu protocolo completo':semanas<=4?'Registrar primeira evolução':'Ver analise de evolucao'}
              </div>
              <div style={{ fontSize:12, color:'var(--ts)' }}>
                {semanas<=2?'Entenda cada peptídeo do seu ciclo':semanas<=4?'Peso, energia e sono hoje':'Como seu corpo está respondendo'}
              </div>
            </div>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18" style={{ flexShrink:0 }}><path d="M7 4l5 5-5 5" stroke="var(--ts)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        <div className="dc">
          <div className="dc-h"><div className="dc-t">Acesso rápido</div></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[{ico:'📋',label:'Diário',sec:'diario'},{ico:'🧪',label:'Estoque',sec:'estoque'},{ico:'🔬',label:'Calculadora',sec:'calc'},{ico:'📚',label:'Biblioteca',sec:'lib'}].map(a=>(
              <div key={a.label} onClick={()=>onNavigate(a.sec)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'#FFFFFF', borderRadius:10, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', cursor:'pointer', fontSize:13, color:'var(--tm)', transition:'background .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--border)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--bg2)'}>
                <span style={{ fontSize:'1.1rem' }}>{a.ico}</span>{a.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="d-col-r">
        <div className="dc" style={{ background:'var(--dark)', color:'white', marginBottom:'1rem', padding:'1.25rem' }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', opacity:.6, marginBottom:'.875rem' }}>Check-in diário</div>
          {!checkInFeito ? (
            <>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:'1rem' }}>Como você esta hoje?</div>
              <div style={{ display:'flex', gap:4, marginBottom:'1.25rem' }}>
                {HUMOR_LABELS.map((emoji,i)=>(
                  <button key={i} onClick={()=>handleCheckIn(i+1)}
                    style={{ flex:1, height:42, borderRadius:10, border:'1.5px solid rgba(255,255,255,.15)', background:'rgba(255,255,255,.08)', cursor:'pointer', fontSize:'1.3rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', fontFamily:'inherit', minWidth:0 }}>
                    {emoji}
                  </button>
                ))}
              </div>
              <button onClick={()=>handleCheckIn(3)} style={{ width:'100%', padding:'10px', background:'var(--green)', border:'none', borderRadius:10, color:'white', fontFamily:'inherit', fontSize:13, fontWeight:500, cursor:'pointer' }}>
                Registrar check-in
              </button>
            </>
          ) : (
            <>
              <div style={{ textAlign:'center', marginBottom:'1rem' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'.5rem' }}>{HUMOR_LABELS[(checkInHumor||3)-1]}</div>
                <div style={{ fontSize:13, opacity:.8 }}>{HUMOR_TEXTOS[(checkInHumor||3)-1]+' hoje'}</div>
              </div>
              <div style={{ background:'rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', fontSize:12, lineHeight:1.65, opacity:.9 }}>
                {insightIA}
              </div>
              {checkInHumor && checkInHumor<=2 && (
                <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer"
                  style={{ display:'block', marginTop:'1rem', padding:'10px', background:'#25D366', borderRadius:10, color:'white', textAlign:'center', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                  Falar com a equipe
                </a>
              )}
            </>
          )}
        </div>

        {/* ══ BANNER IA ══ */}
        <div style={{ background:'linear-gradient(135deg, #0F1A2E 0%, #1A2F4A 50%, #0F2A1A 100%)', borderRadius:18, padding:'1.5rem 2rem', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'1rem', boxShadow:'0 4px 20px rgba(0,0,0,.12)', cursor:'pointer', transition:'transform .15s', position:'relative', overflow:'hidden' }}
          onClick={() => onNavigate('ia')}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform='none'}>
          <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,197,94,.25) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ width:56, height:56, borderRadius:16, background:'rgba(34,197,94,.15)', border:'1px solid rgba(34,197,94,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', flexShrink:0 }}>🧬</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#22C55E', background:'rgba(34,197,94,.15)', padding:'2px 8px', borderRadius:100 }}>IA Especialista</div>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E' }}/>
            </div>
            <div style={{ fontSize:15, fontWeight:600, color:'white', marginBottom:4, letterSpacing:'-.02em' }}>Converse com sua IA especialista em peptídeos</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', lineHeight:1.6 }}>Treinada exclusivamente para peptídeos terapêuticos. Tira dúvidas sobre dose, timing, combinações — personalizada para o seu protocolo.</div>
          </div>
          <div style={{ flexShrink:0, fontSize:13, fontWeight:500, color:'#22C55E' }}>Conversar →</div>
        </div>

        {/* ══ BANNER APRENDIZADO ══ */}
        <div style={{ background:'white', borderRadius:18, padding:'1.5rem 2rem', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'1rem', boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', cursor:'pointer', transition:'transform .15s', border:'1px solid var(--border)', position:'relative', overflow:'hidden' }}
          onClick={() => onNavigate('lib')}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform='none'}>
          <div style={{ position:'absolute', top:-20, right:60, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,.08) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ width:56, height:56, borderRadius:16, background:'#F5F3FF', border:'1px solid #DDD6FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', flexShrink:0 }}>📚</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#7C3AED', marginBottom:4 }}>Plataforma de Estudo</div>
            <div style={{ fontSize:15, fontWeight:600, color:'var(--tx)', marginBottom:4, letterSpacing:'-.02em' }}>Aprenda com profundidade sobre peptídeos</div>
            <div style={{ fontSize:12, color:'var(--ts)', lineHeight:1.6 }}>Biblioteca com mais de 20 peptídeos documentados, pesquisas e guias práticos para usar com segurança e estratégia.</div>
          </div>
          <div style={{ flexShrink:0, fontSize:13, fontWeight:500, color:'#7C3AED' }}>Explorar →</div>
        </div>

        <div className="dc" style={{ marginBottom:'1rem' }}>
          <div className="dc-h"><div className="dc-t">Seu perfil</div></div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              {ico:'🎯',val:objs.map(o=>OBJECTIVE_LABELS[o]).join(' + ')||'—',label:'Objetivo'},
              {ico:'⚖️',val:imc?'IMC '+imc:(answers.peso?answers.peso+' kg':'—'),label:'Biometria'},
              {ico:'📅',val:durLabel,label:'Ciclo'},
              {ico:'💊',val:items.length+' peptídeos',label:'Protocolo'},
            ].map(s=>(
              <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid var(--border)' }}>
                <span style={{ fontSize:'1rem', flexShrink:0 }}>{s.ico}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dc" style={{ marginBottom:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'.875rem' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'#E8F9EF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>💬</div>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>Comunidade Nuvita</div>
              <div style={{ fontSize:11, color:'var(--ts)' }}>WhatsApp · Gratuito</div>
            </div>
          </div>
          <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.65, marginBottom:'1rem' }}>
            Conecte-se com outros usuários, troque experiências e receba dicas da comunidade.
          </div>
          <a href="https://wa.me/5500000000000?text=Quero+entrar+na+comunidade+Nuvita" target="_blank" rel="noopener noreferrer"
            style={{ display:'block', padding:'10px', background:'#25D366', borderRadius:9, color:'white', textAlign:'center', fontSize:13, fontWeight:600, textDecoration:'none' }}>
            Entrar no grupo
          </a>
        </div>



              </div>
    </>
  );
}