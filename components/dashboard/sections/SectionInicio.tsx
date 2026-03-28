// @ts-nocheck
'use client';

import { useState } from 'react';
import type { QuizAnswers, Peptide, ObjectiveKey } from '@/types';
import { OBJECTIVE_LABELS, DURACAO_LABELS, SEMANAS_LABELS } from '@/types';
import type { DashSection } from '../DashboardShell';

interface Props {
  answers: QuizAnswers; items: Peptide[]; peso: number;
  objs: ObjectiveKey[]; dur: string; nivel: string; plan: string;
  protoAtivo: boolean; onStartProto: () => void; onNavigate: (s: DashSection) => void;
}

export default function SectionInicio({ answers, items, peso, objs, dur, protoAtivo, onStartProto, onNavigate }: Props) {
  const nome     = answers.nome?.toString() ?? 'você';
  const semanas  = SEMANAS_LABELS[dur as keyof typeof SEMANAS_LABELS] ?? '8';
  const durLabel = DURACAO_LABELS[dur as keyof typeof DURACAO_LABELS] ?? dur;
  const imc      = (peso / ((Number(answers.altura ?? 170) / 100) ** 2)).toFixed(1);
  const imcLabel = +imc < 25 ? 'Normal' : +imc < 30 ? 'Sobrepeso' : 'Obesidade';

  const [tasksChecked, setTasksChecked] = useState<Set<number>>(new Set());
  const [ckVal,   setCkVal]   = useState<number | null>(null);
  const [ckDone,  setCkDone]  = useState(false);
  const [weekDone,setWeekDone]= useState<Set<number>>(new Set());
  const [starting,setStarting]= useState(false);

  const taskItems = items.filter(p => p.ck);
  const adherence = taskItems.length ? Math.round((tasksChecked.size / taskItems.length) * 100) : 0;
  const days      = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const todayIdx  = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();

  const handleStart = () => {
    setStarting(true);
    setTimeout(() => { setStarting(false); onStartProto(); }, 1000);
  };

  return (
    <>
      {/* ── BANNER ─────────────────────────────── */}
      <div className="d-banner" style={{
        gridColumn: '1 / -1',
        background: 'radial-gradient(ellipse 90% 120% at 70% 0%,#B0EDD8 0%,var(--gp) 22%,#E4F9F2 45%,#F7FDFB 70%)',
        border: '1px solid #C0EAE0',
      }}>
        <div className="db-l">
          <div className="db-g">Bem-vindo(a) de volta</div>
          <div className="db-t">Olá, <span className="db-hl">{nome}</span>. Protocolo ativo.</div>
          <div className="db-s">{objs.map(o => OBJECTIVE_LABELS[o]).join(', ')} · {durLabel}</div>
        </div>
        <div className="db-stats">
          <div className="db-st"><div className="db-sv">{adherence}%</div><div className="db-sl">Adesão</div></div>
          <div className="db-st"><div className="db-sv">1</div><div className="db-sl">Semana</div></div>
          <div className="db-st"><div className="db-sv">{semanas}</div><div className="db-sl">Total sem.</div></div>
        </div>
      </div>

      {/* ── CTA INICIAR ────────────────────────── */}
      {!protoAtivo && (
        <div className="start-cta" style={{ gridColumn: '1 / -1' }}>
          <div className="sc-l">
            <div className="sc-badge"><div className="pdot" />Protocolo pronto</div>
            <div className="sc-t">Seu protocolo está configurado e aguardando.</div>
            <div className="sc-s">Quando tiver os peptídeos em mãos, dê o start e comece o acompanhamento.</div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-d" onClick={handleStart} disabled={starting} style={{ minWidth: 156 }}>
              {starting
                ? <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation:'spin 1s linear infinite' }}>
                      <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,.3)" strokeWidth="2" fill="none"/>
                      <path d="M7 2a5 5 0 015 5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </svg>
                    Iniciando...
                  </span>
                : 'Iniciar protocolo'}
            </button>
            <button className="btn btn-o" onClick={() => onNavigate('protocolo')}>Ver protocolo</button>
          </div>
        </div>
      )}

      {/* ── COLUNA ESQUERDA ────────────────────── */}
      <div className="d-col-l">
        {/* Tarefas */}
        <div className="dc">
          <div className="dc-h">
            <div className="dc-t">Tarefas de hoje</div>
            <div className="dc-badge"><div className="bdot" />Dia 1</div>
          </div>
          <div className="t-list">
            {!protoAtivo && (
              <div style={{ padding:'10px 12px', background:'var(--ab)', borderRadius:9, fontSize:12, color:'var(--am)', display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
                  <rect x="1.5" y="5" width="10" height="7" rx="1.5" stroke="var(--am)" strokeWidth="1.1"/>
                  <path d="M3.5 5V3.5a3 3 0 016 0V5" stroke="var(--am)" strokeWidth="1.1"/>
                </svg>
                Inicie o protocolo para desbloquear as tarefas
              </div>
            )}
            {taskItems.map((item, i) => (
              <div key={item.n}
                className={`t-task${tasksChecked.has(i) ? ' dn' : ''}${!protoAtivo ? ' t-locked' : ''}`}
                onClick={() => protoAtivo && setTasksChecked(prev => {
                  const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n;
                })}>
                <div className="t-ck">
                  {tasksChecked.has(i) && (
                    <svg width="9" height="9" fill="none" viewBox="0 0 9 9">
                      <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="t-bd">
                  <div className="t-nm">{item.e} {item.n}</div>
                  <div className="t-s">{item.timing}</div>
                </div>
                <div className="t-tm">{protoAtivo ? item.doseStr(peso) : '🔒'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Adesão semanal */}
        <div className="dc">
          <div className="dc-h">
            <div className="dc-t">Adesão semanal</div>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--gm)' }}>{weekDone.size} / 7 dias</div>
          </div>
          <div className="w-row">
            {days.map((d, i) => (
              <div className="w-b" key={d}>
                <div className="w-n">{d}</div>
                <div
                  className={`w-c${i===todayIdx?' w-today':''}${weekDone.has(i)?' w-done':''}`}
                  onClick={() => setWeekDone(prev => { const n = new Set(prev); n.has(i)?n.delete(i):n.add(i); return n; })}
                >
                  {weekDone.has(i) ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progresso do ciclo */}
        <div className="dc">
          <div className="dc-h">
            <div className="dc-t">Progresso do ciclo</div>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--ts)' }}>Semana 1 de {semanas}</div>
          </div>
          {[
            { nm:'Adesão ao protocolo',  pct: adherence },
            { nm:'Duração do ciclo',     pct: Math.round((1/+semanas)*100) },
            { nm:'Check-ins realizados', pct: ckDone ? Math.round((1/+semanas)*100) : 0 },
          ].map(p => (
            <div className="prg" key={p.nm}>
              <div className="prg-h"><span className="prg-nm">{p.nm}</span><span className="prg-pc">{p.pct}%</span></div>
              <div className="prg-tr"><div className="prg-f" style={{ width: p.pct+'%' }}/></div>
            </div>
          ))}
        </div>

        {/* Acesso rápido */}
        <div className="dc">
          <div className="dc-h"><div className="dc-t">Acesso rápido</div></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {([
              { id:'protocolo' as DashSection, icon:'📋', label:'Protocolo' },
              { id:'ia'        as DashSection, icon:'🤖', label:'IA Nuvita' },
              { id:'calc'      as DashSection, icon:'🧮', label:'Calculadora' },
              { id:'lib'       as DashSection, icon:'📚', label:'Biblioteca' },
            ]).map(item => (
              <div key={item.id} onClick={() => onNavigate(item.id)}
                style={{ padding:'12px', background:'var(--bg2)', borderRadius:10, cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:500, color:'var(--tx)', transition:'background .13s' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--bg3)')}
                onMouseLeave={e=>(e.currentTarget.style.background='var(--bg2)')}>
                <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>{item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COLUNA DIREITA ─────────────────────── */}
      <div className="d-col-r">
        {/* Métricas */}
        <div className="d-mets">
          <div className="d-mt">
            <div className="dm-l">Objetivos</div>
            <div style={{ fontSize:'.85rem', fontWeight:500, color:'var(--tx)', letterSpacing:'-.02em', lineHeight:1.3, marginTop:3 }}>
              {objs.map(o=>OBJECTIVE_LABELS[o]).join(', ')}
            </div>
          </div>
          <div className="d-mt">
            <div className="dm-l">Ciclo</div>
            <div className="dm-v">{semanas}<span style={{ fontSize:'1rem', fontWeight:400 }}> sem</span></div>
            <div className="dm-s">em andamento</div>
          </div>
          <div className="d-mt">
            <div className="dm-l">Peso</div>
            <div className="dm-v">{peso}<span style={{ fontSize:'1rem' }}>kg</span></div>
          </div>
          <div className="d-mt">
            <div className="dm-l">IMC</div>
            <div className="dm-v">{imc}</div>
            <div className="dm-s">{imcLabel}</div>
          </div>
        </div>

        {/* Check-in dark */}
        <div className="ckin">
          <div className="ck-l">Check-in diário</div>
          <div className="ck-q">Como você está se sentindo hoje?</div>
          <div className="ck-sc">
            {['😔','😕','😐','😊','😄'].map((emoji, i) => (
              <div key={i} className={`ck-b${ckVal===i+1?' sel':''}`}
                onClick={() => !ckDone && setCkVal(i+1)}>
                <span style={{ fontSize:'1.3rem' }}>{emoji}</span>
              </div>
            ))}
          </div>
          {ckVal !== null && ckVal <= 2 && !ckDone && (
            <div className="ck-support show">
              <div style={{ fontSize:13, fontWeight:500, color:'white', marginBottom:'.375rem' }}>Está tudo bem?</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.7)', lineHeight:1.55 }}>
                Notamos que você não está se sentindo bem. Quer falar com nossa equipe?
              </div>
            </div>
          )}
          <button className="btn-ck" disabled={ckVal===null||ckDone} onClick={()=>setCkDone(true)}>
            {ckDone ? '✓ Check-in registrado' : 'Registrar check-in'}
          </button>
        </div>

        {/* Upsell */}
        <div className="dc">
          <div style={{ fontSize:10, fontWeight:500, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--gm)', marginBottom:'.625rem' }}>Plano Pro</div>
          <div style={{ fontSize:14, fontWeight:500, color:'var(--dark)', letterSpacing:'-.03em', marginBottom:'.375rem' }}>Agende uma consulta médica</div>
          <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.55, marginBottom:'1rem' }}>
            Médico especialista revisa seu protocolo e faz ajustes personalizados.
          </div>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            <button className="btn btn-d" onClick={() => onNavigate('medico')}>Agendar consulta</button>
            <button className="btn btn-o" onClick={() => onNavigate('planos')}>Ver planos</button>
          </div>
        </div>

        <div className="disc" style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 15 15" style={{ flexShrink:0, marginTop:1 }}>
            <path d="M7.5 1.5L1 13h13L7.5 1.5z" stroke="var(--am)" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M7.5 5.5v3.5M7.5 11v.5" stroke="var(--am)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span>Protocolo informativo. Não substitui orientação médica.</span>
        </div>
      </div>
    </>
  );
}
