'use client';

import type { ChangeEvent, KeyboardEvent } from 'react';
import type { QuizAnswers, ObjectiveKey } from '@/types';
import { OBJECTIVE_LABELS } from '@/types';

interface ScreenProps {
  answers: QuizAnswers;
  setAnswer: (partial: Partial<QuizAnswers>) => void;
  onNext: () => void;
  onPrev: () => void;
}

function NavRow({ onPrev, onNext, disabled }: { onPrev: () => void; onNext: () => void; disabled?: boolean }) {
  return (
    <div className="brow">
      <button className="btn btn-o" onClick={onPrev}>Voltar</button>
      <button className="btn btn-d" onClick={onNext} disabled={disabled}>Continuar</button>
    </div>
  );
}

// SingleOpt: seleciona SEM avançar — usuário clica Continuar
function SingleOpt({ label, desc, icon, selected, onSelect }: {
  value: string; label: string; desc?: string; icon?: string;
  selected: boolean; onSelect: () => void;
}) {
  return (
    <div className={`opt${selected ? ' sel' : ''}`} onClick={onSelect}>
      {icon && <div className="o-ico">{icon}</div>}
      <div className="o-bd">
        <div className="o-t">{label}</div>
        {desc && <div className="o-d">{desc}</div>}
      </div>
      <div className="o-r"><div className="o-rd" /></div>
    </div>
  );
}

// ── Q1 NOME ──────────────────────────────────────
export function ScreenNome({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const ok = !!answers.nome?.toString().trim();
  return (
    <div>
      <div className="q-num">Pergunta 1 de 10</div>
      <h2 className="q-title">Como você se chama?</h2>
      <p className="q-sub">Vamos personalizar toda a experiência com o seu nome.</p>
      <input className="inp" type="text" placeholder="Seu primeiro nome"
        autoComplete="given-name" style={{ marginBottom: '1.75rem' }}
        value={answers.nome?.toString() ?? ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setAnswer({ nome: e.target.value })}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && ok) onNext(); }}
      />
      <NavRow onPrev={onPrev} onNext={onNext} disabled={!ok} />
    </div>
  );
}

// ── Q2 SEXO ──────────────────────────────────────
export function ScreenSexo({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const opts = [
    { v: 'masculino', label: 'Masculino',           icon: '♂' },
    { v: 'feminino',  label: 'Feminino',             icon: '♀' },
    { v: 'ni',        label: 'Prefiro não informar', icon: '○' },
  ];
  return (
    <div>
      <div className="q-num">Pergunta 2 de 10</div>
      <h2 className="q-title">Qual é o seu sexo biológico?</h2>
      <p className="q-sub">Influencia na dosagem e nos compostos indicados.</p>
      <div className="opts c1">
        {opts.map(o => (
          <SingleOpt key={o.v} value={o.v} label={o.label} icon={o.icon}
            selected={answers.q2 === o.v}
            onSelect={() => setAnswer({ q2: o.v as QuizAnswers['q2'] })}
          />
        ))}
      </div>
      <NavRow onPrev={onPrev} onNext={onNext} disabled={!answers.q2} />
    </div>
  );
}

// ── Q3 OBJETIVOS multi-select ─────────────────────
const OBJETIVOS: { v: ObjectiveKey; icon: string; desc: string }[] = [
  { v: 'gordura',     icon: '🔥', desc: 'Lipólise seletiva, controle de apetite' },
  { v: 'massa',       icon: '💪', desc: 'Anabolismo, síntese proteica, GH' },
  { v: 'recuperacao', icon: '🔄', desc: 'Tecidos, tendões, cartilagem' },
  { v: 'sono',        icon: '🌙', desc: 'Qualidade do sono, circadiano' },
  { v: 'pele',        icon: '✨', desc: 'Colágeno, antienvelhecimento, GHK-Cu' },
  { v: 'longevidade', icon: '🌟', desc: 'Telômeros, imunidade, antienvelhecimento' },
  { v: 'cognitivo',   icon: '🧠', desc: 'Foco, memória, redução de estresse' },
  { v: 'hormonal',    icon: '⚗️', desc: 'Testosterona, GH, eixo HPA' },
];

export function ScreenObjetivos({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const sel = answers.q3 ?? [];
  const toggle = (v: ObjectiveKey) => {
    const next = sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v];
    setAnswer({ q3: next });
  };
  return (
    <div>
      <div className="q-num">Pergunta 3 de 10</div>
      <h2 className="q-title">Quais são os seus objetivos?</h2>
      <p className="q-sub">Selecione todos que se aplicam — você pode escolher mais de um.</p>
      <div className="mc-grid">
        {OBJETIVOS.map(o => (
          <div key={o.v} className={`mc-opt${sel.includes(o.v) ? ' sel' : ''}`} onClick={() => toggle(o.v)}>
            <div className="mc-check">
              {sel.includes(o.v) && <svg width="9" height="9" fill="none" viewBox="0 0 9 9"><path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div className="o-ico">{o.icon}</div>
            <div className="mc-bd"><div className="mc-t">{OBJECTIVE_LABELS[o.v]}</div><div className="mc-d">{o.desc}</div></div>
          </div>
        ))}
      </div>
      {sel.length === 0 && <div style={{ fontSize:12, color:'var(--am)', marginBottom:'1rem' }}>Selecione ao menos 1 objetivo.</div>}
      <NavRow onPrev={onPrev} onNext={onNext} disabled={sel.length === 0} />
    </div>
  );
}

// ── Q3b PELE sub ─────────────────────────────────
const PELE_OPTS = [
  { v: 'envelhecimento', label: '✨ Envelhecimento e linhas finas' },
  { v: 'acne',           label: '🔴 Acne e pele inflamatória' },
  { v: 'cicatrizes',     label: '🩹 Cicatrizes e manchas' },
  { v: 'firmeza',        label: '💪 Firmeza e elasticidade' },
  { v: 'ressecamento',   label: '💧 Ressecamento e barreira cutânea' },
];

export function ScreenPeleSub({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  return (
    <div>
      <div className="q-num">Pergunta 3b de 10</div>
      <h2 className="q-title">Qual é o seu principal problema de pele?</h2>
      <p className="q-sub">Isso nos permite montar um protocolo dérmico muito mais certeiro.</p>
      <div className="pele-sub-grid">
        {PELE_OPTS.map(o => (
          <div key={o.v}
            className={`pele-sub-opt${answers.peleProblema === o.v ? ' sel' : ''}`}
            onClick={() => setAnswer({ peleProblema: o.v as QuizAnswers['peleProblema'] })}>
            {o.label}
          </div>
        ))}
      </div>
      <NavRow onPrev={onPrev} onNext={onNext} disabled={!answers.peleProblema} />
    </div>
  );
}

// ── Q4 NÍVEL ─────────────────────────────────────
export function ScreenNivel({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const opts = [
    { v: 'iniciante',     icon: '🌱', label: 'Iniciante',     desc: 'Nunca usei ou comecei há menos de 3 meses' },
    { v: 'intermediario', icon: '📈', label: 'Intermediário',  desc: 'Tenho alguns ciclos de experiência' },
    { v: 'avancado',      icon: '🏆', label: 'Avançado',       desc: 'Uso regularmente e entendo os mecanismos' },
  ];
  return (
    <div>
      <div className="q-num">Pergunta 4 de 10</div>
      <h2 className="q-title">Qual é o seu nível de experiência com peptídeos?</h2>
      <p className="q-sub">Isso calibra as doses e complexidade do protocolo.</p>
      <div className="opts c1">
        {opts.map(o => (
          <SingleOpt key={o.v} value={o.v} label={o.label} desc={o.desc} icon={o.icon}
            selected={answers.q4 === o.v}
            onSelect={() => setAnswer({ q4: o.v as QuizAnswers['q4'] })}
          />
        ))}
      </div>
      <NavRow onPrev={onPrev} onNext={onNext} disabled={!answers.q4} />
    </div>
  );
}

// ── Q5 JÁ USOU ───────────────────────────────────
export function ScreenAtividade({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const opts = [
    { v: 'sedentario',  icon: '🪑', label: 'Sedentário',   desc: 'Menos de 1h de exercício por semana' },
    { v: 'moderado',    icon: '🚶', label: 'Moderado',      desc: '2–3x por semana' },
    { v: 'ativo',       icon: '🏃', label: 'Ativo',         desc: '4–5x por semana' },
    { v: 'muito_ativo', icon: '🏋️', label: 'Muito ativo',   desc: 'Treino diário ou atleta' },
  ];
  return (
    <div>
      <div className="q-num">Pergunta 4 de 10</div>
      <h2 className="q-title">Qual é o seu nível de atividade física?</h2>
      <p className="q-sub">Influencia diretamente nas doses e timing dos peptídeos.</p>
      <div className="opts c2">
        {opts.map(o => (
          <SingleOpt key={o.v} value={o.v} label={o.label} desc={o.desc} icon={o.icon}
            selected={answers.q6 === o.v}
            onSelect={() => setAnswer({ q6: o.v as QuizAnswers['q6'] })}
          />
        ))}
      </div>
      {answers.q6 === 'sedentario' && (
        <div className="health-alert" style={{ marginBottom:'1rem' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" style={{ flexShrink:0, marginTop:2 }}>
            <path d="M8 1.5L1.5 14h13L8 1.5z" stroke="var(--am)" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M8 6v4M8 11.5v.5" stroke="var(--am)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div>
            <div className="ha-title">Sedentarismo é um fator de risco real</div>
            <div className="ha-sub">A inatividade física acelera o envelhecimento e reduz a eficácia dos peptídeos.</div>
          </div>
        </div>
      )}
      <NavRow onPrev={onPrev} onNext={onNext} disabled={!answers.q6} />
    </div>
  );
}

// ── Q7 SONO scale ────────────────────────────────
export function ScreenSono({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const labels: Record<string, string> = { '1':'Péssimo','2':'Ruim','3':'Regular','4':'Bom','5':'Ótimo' };
  return (
    <div>
      <div className="q-num">Pergunta 5 de 9</div>
      <h2 className="q-title">Como você avalia a qualidade do seu sono?</h2>
      <p className="q-sub">O sono profundo é quando ocorre 70% da liberação de GH.</p>
      <div className="scale-row">
        {['1','2','3','4','5'].map(v => (
          <div key={v} className={`sc${answers.q7 === v ? ' sel' : ''}`}
            onClick={() => setAnswer({ q7: v })}>
            {v}<div className="sc-l">{labels[v]}</div>
          </div>
        ))}
      </div>
      {(answers.q7 === '1' || answers.q7 === '2') && (
        <div className="health-alert" style={{ marginBottom:'1rem' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" style={{ flexShrink:0, marginTop:2 }}>
            <path d="M8 1.5L1.5 14h13L8 1.5z" stroke="var(--am)" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M8 6v4M8 11.5v.5" stroke="var(--am)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div>
            <div className="ha-title">Sono ruim compromete tudo</div>
            <div className="ha-sub">Seu protocolo incluirá compostos para melhorar o sono.</div>
          </div>
        </div>
      )}
      <NavRow onPrev={onPrev} onNext={onNext} disabled={!answers.q7} />
    </div>
  );
}

// ── Q8 ESTRESSE ──────────────────────────────────
export function ScreenEstresse({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const opts = [
    { v: 'baixo',    icon: '😌', label: 'Baixo',    desc: 'Me sinto tranquilo na maioria dos dias' },
    { v: 'moderado', icon: '😐', label: 'Moderado',  desc: 'Pressão constante mas gerenciável' },
    { v: 'alto',     icon: '😰', label: 'Alto',       desc: 'Estresse crônico, dificuldade de desligar' },
  ];
  return (
    <div>
      <div className="q-num">Pergunta 6 de 9</div>
      <h2 className="q-title">Como está seu nível de estresse?</h2>
      <p className="q-sub">O cortisol crônico interfere na eficácia dos peptídeos.</p>
      <div className="opts c1">
        {opts.map(o => (
          <SingleOpt key={o.v} value={o.v} label={o.label} desc={o.desc} icon={o.icon}
            selected={answers.q8 === o.v}
            onSelect={() => setAnswer({ q8: o.v as QuizAnswers['q8'] })}
          />
        ))}
      </div>
      <NavRow onPrev={onPrev} onNext={onNext} disabled={!answers.q8} />
    </div>
  );
}

// ── Q9 DURAÇÃO ───────────────────────────────────
export function ScreenDuracao({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const opts = [
    { v: '4sem',   icon: '🗓️', label: '4 semanas',  desc: 'Ciclo curto — ideal para iniciantes' },
    { v: '8sem',   icon: '📅', label: '8 semanas',  desc: 'Duração padrão para a maioria dos objetivos' },
    { v: '12sem',  icon: '🗓️', label: '12 semanas', desc: 'Ciclo estendido para objetivos complexos' },
    { v: '6meses', icon: '🗓️', label: '6 meses',    desc: 'Para longevidade e protocolos de manutenção' },
  ];
  return (
    <div>
      <div className="q-num">Pergunta 7 de 9</div>
      <h2 className="q-title">Por quanto tempo você pretende usar o protocolo?</h2>
      <p className="q-sub">A duração influencia quais peptídeos são indicados e as doses.</p>
      <div className="opts c2">
        {opts.map(o => (
          <SingleOpt key={o.v} value={o.v} label={o.label} desc={o.desc} icon={o.icon}
            selected={answers.q9 === o.v}
            onSelect={() => setAnswer({ q9: o.v as QuizAnswers['q9'] })}
          />
        ))}
      </div>
      <NavRow onPrev={onPrev} onNext={onNext} disabled={!answers.q9} />
    </div>
  );
}

// ── Q10 SAÚDE tags ───────────────────────────────
const SAUDE_TAGS = [
  'Diabetes / pré-diabetes', 'Hipotireoidismo / tireoidite',
  'Câncer ou histórico de câncer', 'Doenças autoimunes',
  'Insuficiência renal ou hepática', 'Gestação ou amamentação',
  'Hipertensão', 'Uso de anticoagulantes',
  'Histórico de apneia do sono', 'Nenhuma das anteriores',
];

export function ScreenSaude({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const sel = answers.q10 ?? [];
  const toggle = (tag: string) => {
    if (tag === 'Nenhuma das anteriores') { setAnswer({ q10: ['nenhuma'] }); return; }
    const without = sel.filter(t => t !== 'nenhuma');
    const next = without.includes(tag) ? without.filter(t => t !== tag) : [...without, tag];
    setAnswer({ q10: next });
  };
  return (
    <div>
      <div className="q-num">Pergunta 8 de 9</div>
      <h2 className="q-title">Você tem alguma condição de saúde relevante?</h2>
      <p className="q-sub">Algumas condições requerem atenção especial ou exclusão de compostos.</p>
      <div className="tags">
        {SAUDE_TAGS.map(tag => (
          <div key={tag}
            className={`tag${sel.includes(tag === 'Nenhuma das anteriores' ? 'nenhuma' : tag) ? ' sel' : ''}`}
            onClick={() => toggle(tag)}>
            {tag}
          </div>
        ))}
      </div>
      {sel.length === 0 && <div style={{ fontSize:12, color:'var(--am)', marginBottom:'1rem' }}>Selecione ao menos uma opção.</div>}
      <div className="disc" style={{ marginBottom:'1.5rem' }}>
        <strong>Aviso:</strong> As informações não substituem avaliação médica.
      </div>
      <NavRow onPrev={onPrev} onNext={onNext} disabled={sel.length === 0} />
    </div>
  );
}

// ── Q11 BIOMETRIA ────────────────────────────────
export function ScreenBiometria({ answers, setAnswer, onNext, onPrev }: ScreenProps) {
  const peso   = Number(answers.peso   ?? 75);
  const altura = Number(answers.altura ?? 170);
  const imc    = (peso / ((altura / 100) ** 2)).toFixed(1);
  const imcLabel = +imc < 18.5 ? 'Abaixo do peso' : +imc < 25 ? 'Normal' : +imc < 30 ? 'Sobrepeso' : 'Obesidade';
  return (
    <div>
      <div className="q-num">Pergunta 11 de 10</div>
      <h2 className="q-title">Informe seu peso e altura</h2>
      <p className="q-sub">Essencial para calcular as doses corretas do seu protocolo.</p>
      <div className="sl-g">
        <div className="sl-row"><span className="sl-l">Peso</span><span className="sl-v">{peso}<span className="sl-u"> kg</span></span></div>
        <input type="range" min={40} max={180} step={1} value={peso}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAnswer({ peso: e.target.value })} />
      </div>
      <div className="sl-g">
        <div className="sl-row"><span className="sl-l">Altura</span><span className="sl-v">{altura}<span className="sl-u"> cm</span></span></div>
        <input type="range" min={140} max={220} step={1} value={altura}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAnswer({ altura: e.target.value })} />
      </div>
      <div className="imc-info">IMC calculado: <strong>{imc}</strong> — {imcLabel}</div>
      <NavRow onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
