// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import type { Peptide, QuizAnswers, ObjectiveKey, DashSection } from '@/types';
import { OBJECTIVE_LABELS, DURACAO_LABELS } from '@/types';

const FASES_CICLO = [
  { semana: [1,2],  nome: 'Adaptação celular',    desc: 'Seu corpo está se ajustando. Possível leve cansaço — é normal.', cor:'#EF9F27', bg:'#FAEEDA' },
  { semana: [3,4],  nome: 'Ativação metabólica',  desc: 'Primeiros sinais de melhora. Energia e sono tendem a estabilizar.', cor:'#1D9E75', bg:'#E1F5EE' },
  { semana: [5,8],  nome: 'Resultados iniciais',  desc: 'Mudanças perceptíveis começam aqui. Mantenha a consistência.', cor:'#1D9E75', bg:'#E1F5EE' },
  { semana: [9,16], nome: 'Consolidação',          desc: 'Resultados se solidificam. Corpo responde melhor ao protocolo.', cor:'#7F77DD', bg:'#EEEDFE' },
  { semana: [17,99],'nome': 'Otimização avançada', desc: 'Fase de refinamento. Ajustes finos para máximo resultado.', cor:'#7F77DD', bg:'#EEEDFE' },
];

const MARCOS = [
  { semana: 4,  texto: 'Primeiros resultados visíveis' },
  { semana: 8,  texto: 'Resultados consolidados' },
  { semana: 12, texto: 'Análise de meio ciclo' },
  { semana: 24, texto: 'Conclusão do ciclo completo' },
];

function getFaseCiclo(semana: number) {
  return FASES_CICLO.find(f => semana >= f.semana[0] && semana <= f.semana[1]) || FASES_CICLO[0];
}

function getProximoMarco(semana: number) {
  return MARCOS.find(m => m.semana > semana) || MARCOS[MARCOS.length - 1];
}

interface Props {
  answers: QuizAnswers;
  items: Peptide[];
  peso: number;
  objs: ObjectiveKey[];
  dur: string;
  nivel: string;
  plan: string;
  protoAtivo: boolean;
  onStartProto: () => void;
  onNavigate: (s: DashSection) => void;
}

const CTA_POR_SEMANA: Record<number, { label: string; section: DashSection; desc: string }> = {
  1: { label: 'Ver meu protocolo completo', section: 'protocolo', desc: 'Entenda cada peptídeo do seu ciclo' },
  2: { label: 'Registrar primeira evolução', section: 'tracker', desc: 'Peso, energia e sono hoje' },
  4: { label: 'Ver análise de evolução', section: 'analise', desc: 'Como seu corpo está respondendo' },
  8: { label: 'Ajustar protocolo', section: 'ajuste', desc: 'IA sugere otimizações com base nos seus dados' },
};

function getCTA(semana: number) {
  const keys = Object.keys(CTA_POR_SEMANA).map(Number).sort((a,b)=>b-a);
  const key = keys.find(k => semana >= k) || 1;
  return CTA_POR_SEMANA[key];
}

export default function SectionInicio({ answers, items, peso, objs, dur, nivel, plan, protoAtivo, onStartProto, onNavigate }: Props) {
  const nome    = answers.nome?.toString().split(' ')[0] ?? '—';
  const semanas = 1; // TODO: calcular semanas reais do Supabase
  const fase    = getFaseCiclo(semanas);
  const marco   = getProximoMarco(semanas);
  const cta     = getCTA(semanas);
  const imc     = answers.peso && answers.altura ? (Number(answers.peso) / Math.pow(Number(answers.altura)/100, 2)).toFixed(1) : null;
  const durLabel = DURACAO_LABELS[dur] ?? dur;
  const totalSemanas = parseInt(durLabel) || 24;

  const [checkInFeito,  setCheckInFeito]  = useState(false);
  const [checkInHumor,  setCheckInHumor]  = useState<number|null>(null);
  const [insightIA,     setInsightIA]     = useState('');
  const [loadingInsight,setLoadingInsight]= useState(false);
  const [tasksDone,     setTasksDone]     = useState<Set<string>>(new Set());
  const [expandido,     setExpandido]     = useState<string|null>(null);
  const [starting,      setStarting]      = useState(false);

  const HUMOR_LABELS = ['😫','😔','😐','😊','🤩'];
  const HUMOR_TEXTOS = ['Péssimo','Ruim','Neutro','Bem','Ótimo'];

  const INSIGHTS_FALLBACK: Record<number, string[]> = {
    1: ['Dias difíceis fazem parte da jornada. Seu corpo está trabalhando mesmo quando você não sente.', 'Tente descansar mais hoje e manter a hidratação.'],
    2: ['É normal ter dias assim, especialmente na fase de adaptação.', 'Foque no básico: água, sono e manter o protocolo.'],
    3: ['Dia neutro é dia consistente. A consistência é o que gera resultados.', 'Continue com sua rotina normal.'],
    4: ['Ótimo! Energia positiva potencializa a ação dos peptídeos.', 'Aproveite para fazer check-in no tracker e registrar essa evolução.'],
    5: ['Excelente! Esse nível de bem-estar é um sinal de que o protocolo está funcionando.', 'Registre no diário como você está se sentindo para acompanhar o padrão.'],
  };

  const handleCheckIn = async (humor: number) => {
    setCheckInHumor(humor);
    setCheckInFeito(true);
    setLoadingInsight(true);

    // Timeout de 8s — se a IA demorar, usa fallback
    const timeoutId = setTimeout(() => {
      const fallback = INSIGHTS_FALLBACK[humor] || INSIGHTS_FALLBACK[3];
      setInsightIA(fallback.join(' '));
      setLoadingInsight(false);
    }, 8000);

    try {
      const res = await fetch('/api/ia', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          system: 'Você é o Coach IA da Nuvita. Dê um insight curto (2 frases máximo) + 1 recomendação prática. Tom empático, direto. Responda só o texto, sem formatação.',
          messages: [{
            role:'user',
            content: `Humor: ${HUMOR_TEXTOS[humor-1]} (${humor}/5). Semana ${semanas}. Fase: ${fase.nome}. Objetivos: ${objs.join(', ')}.`
          }]
        })
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      setInsightIA(data.text || INSIGHTS_FALLBACK[humor]?.join(' ') || '');
    } catch {
      clearTimeout(timeoutId);
      const fallback = INSIGHTS_FALLBACK[humor] || INSIGHTS_FALLBACK[3];
      setInsightIA(fallback.join(' '));
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleStart = () => {
    setStarting(true);
    setTimeout(() => { onStartProto(); setStarting(false); }, 500);
  };

  const toggleTask = (id: string) => setTasksDone(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const toggleExpand = (id: string) => setExpandido(p => p===id?null:id);

  const tarefasHoje = items.slice(0, 6);
  const feitas      = tarefasHoje.filter(t => tasksDone.has(t.n)).length;
  const pctTarefas  = tarefasHoje.length ? Math.round((feitas/tarefasHoje.length)*100) : 0;

  return (
    <>
      {/* ── BANNER ACIONÁVEL ─────────────────────────── */}
      <div className="d-banner" style={{
        gridColumn: '1 / -1',
        background: 'radial-gradient(ellipse 90% 120% at 70% 0%,#B0EDD8 0%,var(--gp) 22%,#E4F9F2 45%,#F7FDFB 70%)',
        border: '1px solid #C0EAE0',
      }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--gm)', marginBottom:'.375rem', opacity:.8 }}>
            {protoAtivo ? `Semana ${semanas} de ${totalSemanas}` : 'Protocolo pronto'}
          </div>
          <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', color:'var(--dark)', marginBottom:'.375rem', lineHeight:1.2 }}>
            {protoAtivo
              ? feitas === tarefasHoje.length && tarefasHoje.length > 0
                ? `Parabéns, ${nome}! Todas as ações concluídas hoje.`
                : `${nome}, você tem ${tarefasHoje.length - feitas} ação${tarefasHoje.length-feitas!==1?'ões':''} hoje`
              : `${nome}, seu protocolo está pronto`}
          </h2>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, background:fase.bg, color:fase.cor, borderRadius:100, padding:'3px 10px', fontWeight:500, display:'inline-flex', alignItems:'center', gap:4 }}>
              ⚡ {fase.nome}
            </span>
            <span style={{ fontSize:12, color:'var(--gm)', opacity:.8 }}>
              Próximo marco: semana {marco.semana} — {marco.texto}
            </span>
          </div>
          {imc && (
            <div style={{ fontSize:11, color:'var(--gm)', marginTop:6, opacity:.75 }}>
              Protocolo ajustado para {objs.map(o=>OBJECTIVE_LABELS[o]).join(' + ')} · IMC {imc}
            </div>
          )}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0, alignItems:'flex-end' }}>
          <div style={{ display:'flex', gap:12, textAlign:'center' }}>
            {[
              { val: `${pctTarefas}%`, label:'Hoje' },
              { val: semanas.toString(), label:'Semana' },
              { val: totalSemanas.toString(), label:'Total' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', color:'var(--dark)' }}>{s.val}</div>
                <div style={{ fontSize:10, color:'var(--gm)', textTransform:'uppercase', letterSpacing:'.06em', opacity:.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA INICIAR ─────────────────────────────── */}
      {!protoAtivo && (
        <div className="start-cta" style={{ gridColumn: '1 / -1' }}>
          <div className="sc-l">
            <div className="sc-badge"><div className="pdot" />Protocolo pronto</div>
            <div className="sc-t">Quando tiver os peptídeos em mãos, dê o start.</div>
            <div className="sc-s">Você pode iniciar a qualquer momento. Seu progresso será acompanhado desde o dia 1.</div>
          </div>
          <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', alignItems:'center' }}>
            <button className="btn btn-d" onClick={handleStart} disabled={starting} style={{ minWidth:156 }}>
              {starting ? '⏳ Iniciando...' : '▶ Iniciar protocolo'}
            </button>
            <button className="btn btn-o" onClick={() => onNavigate('protocolo')}>Ver protocolo</button>
          </div>
        </div>
      )}

      {/* ── COLUNA ESQUERDA ─────────────────────────── */}
      <div className="d-col-l">

        {/* Tarefas com contexto */}
        <div className="dc">
          <div className="dc-h">
            <div>
              <div className="dc-t">Ações de hoje</div>
              {tarefasHoje.length > 0 && (
                <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>
                  {feitas}/{tarefasHoje.length} concluídas
                </div>
              )}
            </div>
            {protoAtivo && tarefasHoje.length > 0 && (
              <div style={{ height:6, width:80, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pctTarefas}%`, background:'var(--green)', borderRadius:3, transition:'width .3s' }}/>
              </div>
            )}
          </div>

          {!protoAtivo && (
            <div style={{ padding:'10px 12px', background:'var(--ab)', borderRadius:9, fontSize:12, color:'var(--am)', display:'flex', alignItems:'center', gap:8, margin:'0 0 8px' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><rect x="1.5" y="5" width="10" height="7" rx="1.5" stroke="var(--am)" strokeWidth="1.1"/><path d="M3.5 5V3.5a3 3 0 016 0V5" stroke="var(--am)" strokeWidth="1.1"/></svg>
              Inicie o protocolo para desbloquear as tarefas
            </div>
          )}

          <div className="t-list">
            {tarefasHoje.map(item => {
              const done = tasksDone.has(item.n);
              const expanded = expandido === item.n;
              return (
                <div key={item.n} style={{ opacity: protoAtivo ? 1 : .5 }}>
                  <div className={`t-item${done?' done':''}`} style={{ cursor:'pointer' }}>
                    <div className={`t-cb${done?' checked':''}`} onClick={() => protoAtivo && toggleTask(item.n)}>
                      {done && <svg width="10" height="10" fill="none" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }} onClick={() => toggleExpand(item.n)}>
                      <div className="t-name">
                        <span style={{ marginRight:5 }}>{item.e}</span>
                        {item.n}
                      </div>
                      <div className="t-sub">{item.timing}</div>
                    </div>
                    <div style={{ fontSize:11, color:'var(--ts)', cursor:'pointer', padding:'4px', flexShrink:0 }} onClick={() => toggleExpand(item.n)}>
                      {expanded ? '▲' : '▼'}
                    </div>
                  </div>
                  {/* Contexto educacional */}
                  {expanded && (
                    <div style={{ margin:'0 0 6px 32px', background:'var(--gp)', borderRadius:10, padding:'10px 12px', borderLeft:'3px solid var(--green)' }}>
                      <div style={{ fontSize:11, fontWeight:600, color:'var(--gm)', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em' }}>Por que você está tomando isso</div>
                      <div style={{ fontSize:12, color:'var(--gm)', lineHeight:1.65, marginBottom:6 }}>{item.why || item.m}</div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:10, background:'rgba(29,158,117,.15)', color:'var(--gm)', borderRadius:100, padding:'2px 8px', fontWeight:500 }}>
                          💊 Dose: {item.doseStr(peso)}
                        </span>
                        <span style={{ fontSize:10, background:'rgba(29,158,117,.15)', color:'var(--gm)', borderRadius:100, padding:'2px 8px', fontWeight:500 }}>
                          📍 Via: {item.route}
                        </span>
                        <button onClick={() => onNavigate('lib')} style={{ fontSize:10, background:'var(--dark)', color:'white', borderRadius:100, padding:'2px 8px', fontWeight:500, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                          Aprender mais →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progresso como jornada */}
        <div className="dc">
          <div className="dc-h">
            <div className="dc-t">Sua jornada</div>
            <span style={{ fontSize:11, background:fase.bg, color:fase.cor, borderRadius:100, padding:'2px 8px', fontWeight:500 }}>{fase.nome}</span>
          </div>
          <div style={{ marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ts)', marginBottom:6 }}>
              <span>Semana {semanas}</span>
              <span>Semana {totalSemanas}</span>
            </div>
            <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden', marginBottom:6 }}>
              <div style={{ height:'100%', width:`${(semanas/totalSemanas)*100}%`, background:'var(--green)', borderRadius:4, transition:'width .5s' }}/>
            </div>
            <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.6 }}>{fase.desc}</div>
          </div>
          <div style={{ background:'var(--bg2)', borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:'1.2rem' }}>🎯</span>
            <div>
              <div style={{ fontSize:11, fontWeight:500, color:'var(--tx)' }}>Próximo marco — Semana {marco.semana}</div>
              <div style={{ fontSize:11, color:'var(--ts)', marginTop:1 }}>{marco.texto}</div>
            </div>
          </div>
        </div>

        {/* CTA baseado no estágio */}
        <div className="dc" style={{ cursor:'pointer', transition:'border-color .15s' }}
          onClick={() => onNavigate(cta.section)}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='var(--green)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor=''}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:3 }}>{cta.label}</div>
              <div style={{ fontSize:12, color:'var(--ts)' }}>{cta.desc}</div>
            </div>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18" style={{ flexShrink:0 }}><path d="M7 4l5 5-5 5" stroke="var(--ts)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        {/* Acesso rápido */}
        <div className="dc">
          <div className="dc-h"><div className="dc-t">Acesso rápido</div></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              { ico:'📋', label:'Diário', sec:'diario' },
              { ico:'🧪', label:'Estoque', sec:'estoque' },
              { ico:'🔬', label:'Calculadora', sec:'calc' },
              { ico:'📚', label:'Biblioteca', sec:'lib' },
            ].map(a => (
              <div key={a.label} onClick={() => onNavigate(a.sec as DashSection)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--bg2)', borderRadius:10, cursor:'pointer', fontSize:13, color:'var(--tm)', transition:'background .15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='var(--border)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='var(--bg2)'}>
                <span style={{ fontSize:'1.1rem' }}>{a.ico}</span>{a.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COLUNA DIREITA ─────────────────────────── */}
      <div className="d-col-r">

        {/* Check-in inteligente */}
        <div className="d-mets" style={{ background:'var(--dark)', color:'white', marginBottom:'1rem' }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', opacity:.6, marginBottom:'1rem' }}>Check-in diário</div>
          {!checkInFeito ? (
            <>
              <div style={{ fontSize:14, fontWeight:500, marginBottom:'1rem', lineHeight:1.4 }}>Como você está se sentindo hoje?</div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                {HUMOR_LABELS.map((emoji, i) => (
                  <button key={i} onClick={() => handleCheckIn(i+1)}
                    style={{ width:44, height:44, borderRadius:12, border:'1.5px solid rgba(255,255,255,.15)', background:'rgba(255,255,255,.08)', cursor:'pointer', fontSize:'1.4rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', fontFamily:'inherit' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.2)'; e.currentTarget.style.transform='scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.transform='scale(1)'; }}>
                    {emoji}
                  </button>
                ))}
              </div>
              <button onClick={() => handleCheckIn(3)} style={{ width:'100%', padding:'10px', background:'var(--green)', border:'none', borderRadius:10, color:'white', fontFamily:'inherit', fontSize:13, fontWeight:500, cursor:'pointer' }}>
                Registrar check-in
              </button>
            </>
          ) : (
            <>
              <div style={{ textAlign:'center', marginBottom:'1rem' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'.5rem' }}>{HUMOR_LABELS[(checkInHumor||3)-1]}</div>
                <div style={{ fontSize:13, opacity:.8 }}>{HUMOR_TEXTOS[(checkInHumor||3)-1]} hoje</div>
              </div>
              {loadingInsight ? (
                <div style={{ fontSize:12, opacity:.6, textAlign:'center', padding:'1rem' }}>🤖 Coach IA analisando...</div>
              ) : insightIA ? (
                <div style={{ background:'rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px', fontSize:12, lineHeight:1.65, opacity:.9 }}>
                  {insightIA}
                </div>
              ) : null}
              {checkInHumor && checkInHumor <= 2 && (
                <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer"
                  style={{ display:'block', marginTop:'1rem', padding:'10px', background:'#25D366', borderRadius:10, color:'white', textAlign:'center', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                  💬 Falar com a equipe
                </a>
              )}
            </>
          )}
        </div>

        {/* Personalização perceptível */}
        <div className="dc" style={{ marginBottom:'1rem' }}>
          <div className="dc-h"><div className="dc-t">Seu perfil</div></div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { ico:'🎯', val: objs.map(o => OBJECTIVE_LABELS[o]).join(' + '), label:'Objetivo' },
              { ico:'⚖️', val: imc ? `IMC ${imc}` : `${answers.peso||'—'} kg`, label:'Biometria' },
              { ico:'📅', val: durLabel, label:'Ciclo' },
              { ico:'💊', val: `${items.length} peptídeos`, label:'Protocolo' },
            ].map(s => (
              <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid var(--border)' }}>
                <span style={{ fontSize:'1rem', flexShrink:0 }}>{s.ico}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banner comunidade */}
        <div style={{ background:'#25D366', borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'white', opacity:.8, marginBottom:'.5rem' }}>Comunidade</div>
          <div style={{ fontSize:14, fontWeight:500, color:'white', marginBottom:'.5rem', lineHeight:1.3 }}>Entre na comunidade Nuvita no WhatsApp</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.85)', lineHeight:1.6, marginBottom:'1rem' }}>
            Conecte-se com outros usuários, troque experiências e receba dicas exclusivas.
          </div>
          <a href="https://wa.me/5500000000000?text=Quero+entrar+na+comunidade+Nuvita" target="_blank" rel="noopener noreferrer"
            style={{ display:'block', padding:'10px', background:'white', borderRadius:9, color:'#25D366', textAlign:'center', fontSize:13, fontWeight:600, textDecoration:'none' }}>
            Entrar na comunidade →
          </a>
        </div>

        {/* Loop de retenção */}
        {protoAtivo && (
          <div className="dc">
            <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', marginBottom:8 }}>🔓 Próximo desbloqueio</div>
            <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.65 }}>
              Continue por <strong>{Math.max(1, 3 - semanas)}</strong> semana{Math.max(1,3-semanas)!==1?'s':''} para liberar a análise de resposta do seu corpo.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
