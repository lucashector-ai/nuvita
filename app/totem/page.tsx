// ════════════════════════════════════════════════
//  NUVITA — app/totem/page.tsx
//  Versão TOTEM (self-service) do balcão: a pessoa chega, toca em
//  "Começar diagnóstico" e preenche tudo sozinha numa tela vertical grande.
//  Reaproveita o motor de IA e as APIs de envio (WhatsApp/e-mail) do balcão.
//  Auto-reinicia por inatividade (privacidade em totem público).
// ════════════════════════════════════════════════

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ObjectiveKey } from '@/types';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import Icon from '@/components/farmacia/Icon';
import { tf, IDIOMA_KEY, type Lang } from '@/lib/farmaciaI18n';
import { OBJ_IMG, pepImg } from '@/lib/farmaciaAssets';
import { CODE_KEY, ESTOQUE_KEY } from '@/components/farmacia/PinGate';
import { doseUISeringa } from '@/lib/quantidadeProtocolo';
import {
  diagnosticarComIA,
  recomendarPeptideos,
  montarMensagemWhatsApp,
  calcularIMC,
  type RespostasFarmacia,
  type NivelFarmacia,
  type AtividadeFarmacia,
  type SonoFarmacia,
  type CondicaoSaude,
  type Recomendacao,
} from '@/lib/recomendarPeptideos';

type Tela = 'atracao' | 'wizard' | 'analisando' | 'resultado';
type Pais = 'BR' | 'PY';
const PASSOS = 5;

const PAISES: Record<Pais, { ddi: string; flag: string; max: number }> = {
  BR: { ddi: '55', flag: '🇧🇷', max: 11 },
  PY: { ddi: '595', flag: '🇵🇾', max: 10 },
};

const OBJETIVOS: { key: ObjectiveKey; label: string; le: string; desc: string; de: string; cor: string }[] = [
  { key: 'gordura', label: 'Emagrecer', le: 'Adelgazar', desc: 'Perder gordura e controlar o apetite', de: 'Perder grasa y controlar el apetito', cor: '#EA580C' },
  { key: 'massa', label: 'Ganhar massa', le: 'Ganar masa', desc: 'Mais músculo e força', de: 'Más músculo y fuerza', cor: '#2563EB' },
  { key: 'pele', label: 'Pele / anti-idade', le: 'Piel / antiedad', desc: 'Colágeno, viço e rejuvenescimento', de: 'Colágeno y rejuvenecimiento', cor: '#EC4899' },
  { key: 'cognitivo', label: 'Foco / cognição', le: 'Enfoque / cognición', desc: 'Memória, concentração e clareza', de: 'Memoria, concentración y claridad', cor: '#7C3AED' },
  { key: 'longevidade', label: 'Energia / longevidade', le: 'Energía / longevidad', desc: 'Mais disposição e vitalidade', de: 'Más disposición y vitalidad', cor: '#16A34A' },
  { key: 'sono', label: 'Dormir melhor', le: 'Dormir mejor', desc: 'Sono profundo e recuperação', de: 'Sueño profundo y recuperación', cor: '#4F46E5' },
  { key: 'recuperacao', label: 'Recuperação / lesões', le: 'Recuperación / lesiones', desc: 'Acelerar o reparo e reduzir a dor', de: 'Acelerar la reparación y reducir el dolor', cor: '#0EA5E9' },
  { key: 'hormonal', label: 'Libido / hormonal', le: 'Libido / hormonal', desc: 'Libido e equilíbrio hormonal', de: 'Libido y equilibrio hormonal', cor: '#E11D48' },
];

const NIVEIS: { key: NivelFarmacia; label: string; le: string; sub: string; se: string; icon: string; cor: string }[] = [
  { key: 'iniciante', label: 'Nunca usei', le: 'Nunca usé', sub: 'Primeira vez', se: 'Primera vez', icon: 'sparkle', cor: '#16A34A' },
  { key: 'intermediario', label: 'Já usei', le: 'Ya usé', sub: 'Alguma experiência', se: 'Algo de experiencia', icon: 'refresh', cor: '#2563EB' },
  { key: 'avancado', label: 'Uso sempre', le: 'Uso siempre', sub: 'Experiente', se: 'Experto', icon: 'bolt', cor: '#7C3AED' },
];

const ATIVIDADES: { key: AtividadeFarmacia; label: string; le: string; sub: string; se: string; icon: string; cor: string }[] = [
  { key: 'sedentario', label: 'Sedentário', le: 'Sedentario', sub: 'Pouco exercício', se: 'Poco ejercicio', icon: 'moon', cor: '#D97706' },
  { key: 'moderado', label: 'Moderado', le: 'Moderado', sub: 'Treino 1–3x/sem', se: 'Entreno 1–3x/sem', icon: 'dumbbell', cor: '#16A34A' },
  { key: 'ativo', label: 'Ativo', le: 'Activo', sub: 'Treino 4–5x/sem', se: 'Entreno 4–5x/sem', icon: 'pulse', cor: '#2563EB' },
  { key: 'muito_ativo', label: 'Muito ativo', le: 'Muy activo', sub: 'Treino 6–7x/sem', se: 'Entreno 6–7x/sem', icon: 'bolt', cor: '#EA580C' },
];

const SONOS: { key: SonoFarmacia; label: string; le: string; sub: string; se: string; icon: string; cor: string }[] = [
  { key: 'ruim', label: 'Ruim', le: 'Malo', sub: 'Custa dormir', se: 'Cuesta dormir', icon: 'drop', cor: '#EC4899' },
  { key: 'regular', label: 'Regular', le: 'Regular', sub: 'Dá pra melhorar', se: 'Se puede mejorar', icon: 'pulse', cor: '#16A34A' },
  { key: 'bom', label: 'Bom', le: 'Bueno', sub: 'Acordo disposto', se: 'Despierto descansado', icon: 'moon', cor: '#4F46E5' },
];

const CONDICOES: { key: CondicaoSaude; label: string; le: string; icon: string; cor: string }[] = [
  { key: 'nenhuma', label: 'Nenhuma', le: 'Ninguna', icon: 'check', cor: '#16A34A' },
  { key: 'diabetes', label: 'Diabetes', le: 'Diabetes', icon: 'drop', cor: '#2563EB' },
  { key: 'hipertensao', label: 'Pressão alta', le: 'Presión alta', icon: 'heart', cor: '#E11D48' },
  { key: 'tireoide', label: 'Tireoide', le: 'Tiroides', icon: 'pulse', cor: '#0EA5E9' },
  { key: 'cancer', label: 'Histórico de câncer', le: 'Antecedente de cáncer', icon: 'ribbon', cor: '#7C3AED' },
  { key: 'gestacao', label: 'Gestante / amamentando', le: 'Embarazo / lactancia', icon: 'person', cor: '#D97706' },
];

const PRIO = {
  essencial: { bg: '#DCFCE7', tx: '#15803D', label: 'Essencial', le: 'Esencial' },
  recomendado: { bg: '#FEF3C7', tx: '#B45309', label: 'Recomendado', le: 'Recomendado' },
  opcional: { bg: '#F1F1F1', tx: '#6B7280', label: 'Opcional', le: 'Opcional' },
} as const;

// Frases fortes que giram na tela de atração.
const HOOKS: { pt: string; es: string }[] = [
  { pt: 'Descubra o peptídeo ideal para o SEU corpo', es: 'Descubre el péptido ideal para TU cuerpo' },
  { pt: 'Emagrecer, ganhar massa, dormir melhor — comece agora', es: 'Adelgazar, ganar masa, dormir mejor — empieza ahora' },
  { pt: 'Um protocolo feito para você em 2 minutos', es: 'Un protocolo hecho para ti en 2 minutos' },
];

function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// Dados estruturados para o PDF (mesmo formato do balcão).
function montarDadosPdf(r: RespostasFarmacia, rec: Recomendacao, idioma: Lang) {
  const es = idioma === 'es';
  const tr = (pt: string, esp: string) => (es ? esp : pt);
  const imc = calcularIMC(r.peso, r.altura);
  const objLabels = r.objetivos.map((k) => { const o = OBJETIVOS.find((x) => x.key === k); return o ? (es ? o.le : o.label) : k; });
  const ativ = ATIVIDADES.find((a) => a.key === r.atividade);
  const perfil = [
    r.idade ? `${r.idade} ${tr('anos', 'años')}` : '',
    imc ? `IMC ${imc.valor} (${imc.classe})` : '',
    ativ ? (es ? ativ.le : ativ.label) : '',
    objLabels.length ? `${tr('Objetivo', 'Objetivo')}: ${objLabels.join(', ')}` : '',
  ].filter(Boolean).join(' · ');
  return {
    nome: r.nome, idioma, perfil, resumo: rec.resumo,
    itens: rec.itens.map((it) => {
      const ui = doseUISeringa(it.peptide.n, it.dose, it.peptide.route);
      return {
        nome: it.peptide.n, mecanismo: it.peptide.m, dose: it.dose,
        doseUI: ui ? ui.texto : undefined, doseUIBase: ui ? ui.base : undefined,
        prioridade: it.prioridade, freq: it.peptide.freq, timing: it.peptide.timing,
        route: it.peptide.route, cycle: it.peptide.cycle, rest: it.peptide.rest,
        motivo: it.motivo, comoUsar: it.comoUsar, alternativa: it.alternativa,
      };
    }),
    orientacaoAlimentar: rec.orientacaoAlimentar, orientacaoTreino: rec.orientacaoTreino,
    observacoes: rec.observacoes, avisoMedico: rec.avisoMedico, avisos: rec.avisos,
  };
}

export default function TotemPage() {
  const [tela, setTela] = useState<Tela>('atracao');
  const [idioma, setIdioma] = useState<Lang>('pt');
  const [passo, setPasso] = useState(1);

  const [objetivos, setObjetivos] = useState<ObjectiveKey[]>([]);
  const [nivel, setNivel] = useState<NivelFarmacia | ''>('');
  const [sexo, setSexo] = useState<'masculino' | 'feminino' | 'ni' | ''>('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [atividade, setAtividade] = useState<AtividadeFarmacia | ''>('');
  const [sono, setSono] = useState<SonoFarmacia | ''>('');
  const [condicoes, setCondicoes] = useState<CondicaoSaude[]>([]);

  const [estoque, setEstoque] = useState<string[] | null>(null);
  const [rec, setRec] = useState<Recomendacao | null>(null);
  const [erro, setErro] = useState('');

  const t = (pt: string, es: string) => tf(idioma, pt, es);

  useEffect(() => {
    try {
      const idi = sessionStorage.getItem(IDIOMA_KEY);
      if (idi === 'es' || idi === 'pt') setIdioma(idi);
      const raw = sessionStorage.getItem(ESTOQUE_KEY);
      if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr)) setEstoque(arr); }
    } catch { /* */ }
  }, []);

  const trocarIdioma = (l: Lang) => { setIdioma(l); try { sessionStorage.setItem(IDIOMA_KEY, l); } catch { /* */ } };

  const respostas = useMemo<RespostasFarmacia | null>(() => {
    if (!objetivos.length || !nivel) return null;
    return {
      nome: 'Cliente', telefone: '', sexo: sexo || undefined,
      objetivos, nivel: nivel as NivelFarmacia,
      condicoes: condicoes.length ? condicoes : ['nenhuma'],
      peso: peso ? Number(peso) : undefined, altura: altura ? Number(altura) : undefined,
      idade: idade ? Number(idade) : undefined,
      atividade: atividade || undefined, sono: sono || undefined,
    };
  }, [objetivos, nivel, sexo, condicoes, peso, altura, idade, atividade, sono]);

  const imc = useMemo(() => calcularIMC(Number(peso), Number(altura)), [peso, altura]);

  // Volta ao início SOMENTE por ação explícita (Voltar na etapa 1, Encerrar ou
  // Novo diagnóstico). Nunca reinicia sozinho — o fluxo vai até o fim.
  const reiniciar = useCallback(() => {
    setObjetivos([]); setNivel(''); setSexo(''); setIdade(''); setPeso(''); setAltura('');
    setAtividade(''); setSono(''); setCondicoes([]); setRec(null); setErro(''); setPasso(1);
    setTela('atracao');
  }, []);

  const comecar = () => { reiniciar(); setTela('wizard'); setPasso(1); };

  const gerar = async () => {
    if (!respostas) return;
    setErro(''); setTela('analisando');
    let estoqueAtual = estoque;
    try {
      const codigo = sessionStorage.getItem(CODE_KEY);
      if (codigo) {
        const res = await fetch('/api/farmacia/estoque', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get', codigo }) });
        const data = await res.json().catch(() => ({}));
        if (data?.found && Array.isArray(data.peptideos)) { estoqueAtual = data.peptideos; setEstoque(data.peptideos); }
      }
    } catch { /* cache */ }
    let resultado: Recomendacao | null = null;
    try {
      resultado = await diagnosticarComIA(respostas, estoqueAtual, idioma);
      if (!resultado || (resultado.itens.length === 0 && !resultado.bloqueado)) resultado = recomendarPeptideos(respostas, estoqueAtual);
    } catch { resultado = recomendarPeptideos(respostas, estoqueAtual); }
    setRec(resultado);
    setTela('resultado');
    window.scrollTo({ top: 0 });
  };

  // Validação por passo → habilita "Continuar".
  const podeAvancar = (): boolean => {
    if (passo === 1) return objetivos.length > 0;
    if (passo === 2) return !!nivel;
    if (passo === 3) return !!idade && !!peso && !!altura;
    if (passo === 4) return !!atividade && !!sono;
    if (passo === 5) return condicoes.length > 0;
    return false;
  };

  const avancar = () => {
    if (!podeAvancar()) return;
    if (passo < PASSOS) { setPasso((p) => p + 1); window.scrollTo({ top: 0 }); }
    else gerar();
  };
  const voltar = () => { if (passo > 1) setPasso((p) => p - 1); else setTela('atracao'); };

  const toggleObjetivo = (k: ObjectiveKey) => {
    setObjetivos((cur) => cur.includes(k) ? cur.filter((x) => x !== k) : (cur.length >= 3 ? cur : [...cur, k]));
  };
  const toggleCondicao = (k: CondicaoSaude) => {
    if (k === 'nenhuma') { setCondicoes(['nenhuma']); return; }
    setCondicoes((cur) => {
      const semNenhuma = cur.filter((x) => x !== 'nenhuma');
      return semNenhuma.includes(k) ? semNenhuma.filter((x) => x !== k) : [...semNenhuma, k];
    });
  };

  const pct = Math.round((passo / PASSOS) * 100);

  return (
    <div style={S.root}>
      <style>{ESTILO}</style>

      {tela === 'atracao' && <Atracao t={t} idioma={idioma} trocarIdioma={trocarIdioma} onComecar={comecar} />}

      {tela === 'wizard' && (
        <div style={S.tela}>
          <Topo t={t} pct={pct} passo={passo} onVoltar={voltar} />
          <div style={S.conteudo}>
            {passo === 1 && (
              <Passo titulo={t('Qual é o seu objetivo?', '¿Cuál es tu objetivo?')} sub={t('Escolha até 3.', 'Elige hasta 3.')}>
                <div style={S.objGrid}>
                  {OBJETIVOS.map((o) => {
                    const on = objetivos.includes(o.key);
                    return (
                      <button key={o.key} onClick={() => toggleObjetivo(o.key)} style={{ ...S.objCard, ...(on ? { borderColor: o.cor, boxShadow: `0 0 0 4px ${alpha(o.cor, 0.15)}` } : {}) }}>
                        <span style={{ ...S.objImgWrap, background: alpha(o.cor, 0.1) }}>
                          <img src={OBJ_IMG[o.key]} alt="" style={S.objImg} />
                          {on && <span style={{ ...S.objCheck, background: o.cor }}><Icon name="check" size={20} /></span>}
                        </span>
                        <span style={S.objLabel}>{idioma === 'es' ? o.le : o.label}</span>
                        <span style={S.objDesc}>{idioma === 'es' ? o.de : o.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </Passo>
            )}

            {passo === 2 && (
              <Passo titulo={t('Você já usou peptídeos?', '¿Ya usaste péptidos?')} sub={t('Para ajustar as doses.', 'Para ajustar las dosis.')}>
                <div style={S.optCol}>
                  {NIVEIS.map((n) => (
                    <OptRow key={n.key} ativo={nivel === n.key} cor={n.cor} icon={n.icon}
                      label={idioma === 'es' ? n.le : n.label} sub={idioma === 'es' ? n.se : n.sub}
                      onClick={() => setNivel(n.key)} />
                  ))}
                </div>
              </Passo>
            )}

            {passo === 3 && (
              <Passo titulo={t('Seus dados', 'Tus datos')} sub={t('Para calcular as doses certas.', 'Para calcular las dosis correctas.')}>
                <div style={S.sexoRow}>
                  {([['masculino', t('Masculino', 'Masculino'), 'person'], ['feminino', t('Feminino', 'Femenino'), 'person'], ['ni', t('Prefiro não dizer', 'Prefiero no decir'), 'person']] as const).map(([k, lbl]) => (
                    <button key={k} onClick={() => setSexo(k)} style={{ ...S.sexoBtn, ...(sexo === k ? S.sexoBtnOn : {}) }}>{lbl}</button>
                  ))}
                </div>
                <Medidas idade={idade} peso={peso} altura={altura} setIdade={setIdade} setPeso={setPeso} setAltura={setAltura} imc={imc} t={t} />
              </Passo>
            )}

            {passo === 4 && (
              <Passo titulo={t('Sua rotina', 'Tu rutina')} sub={t('Atividade física e sono.', 'Actividad física y sueño.')}>
                <div style={S.blocoLabel}>{t('Atividade física', 'Actividad física')}</div>
                <div style={S.optCol}>
                  {ATIVIDADES.map((a) => (
                    <OptRow key={a.key} ativo={atividade === a.key} cor={a.cor} icon={a.icon}
                      label={idioma === 'es' ? a.le : a.label} sub={idioma === 'es' ? a.se : a.sub}
                      onClick={() => setAtividade(a.key)} />
                  ))}
                </div>
                <div style={{ ...S.blocoLabel, marginTop: 26 }}>{t('Como é o seu sono?', '¿Cómo es tu sueño?')}</div>
                <div style={S.optCol}>
                  {SONOS.map((s) => (
                    <OptRow key={s.key} ativo={sono === s.key} cor={s.cor} icon={s.icon}
                      label={idioma === 'es' ? s.le : s.label} sub={idioma === 'es' ? s.se : s.sub}
                      onClick={() => setSono(s.key)} />
                  ))}
                </div>
              </Passo>
            )}

            {passo === 5 && (
              <Passo titulo={t('Alguma condição de saúde?', '¿Alguna condición de salud?')} sub={t('Sua segurança em primeiro lugar.', 'Tu seguridad primero.')}>
                <div style={S.condGrid}>
                  {CONDICOES.map((c) => {
                    const on = condicoes.includes(c.key);
                    return (
                      <button key={c.key} onClick={() => toggleCondicao(c.key)} style={{ ...S.condCard, ...(on ? { borderColor: c.cor, background: alpha(c.cor, 0.08) } : {}) }}>
                        <span style={{ ...S.condIcon, background: alpha(c.cor, 0.14), color: c.cor }}><Icon name={c.icon} size={22} /></span>
                        <span style={S.condLabel}>{idioma === 'es' ? c.le : c.label}</span>
                        {on && <span style={{ ...S.condCheck, color: c.cor }}><Icon name="check" size={18} /></span>}
                      </button>
                    );
                  })}
                </div>
              </Passo>
            )}
          </div>

          <div style={S.rodape}>
            <button onClick={avancar} disabled={!podeAvancar()} style={{ ...S.btnPrimario, opacity: podeAvancar() ? 1 : 0.4 }}>
              {passo < PASSOS ? t('Continuar', 'Continuar') : t('Ver meu protocolo', 'Ver mi protocolo')} ›
            </button>
          </div>
        </div>
      )}

      {tela === 'analisando' && <Analisando t={t} />}

      {tela === 'resultado' && rec && (
        <Resultado rec={rec} idioma={idioma} t={t} respostas={respostas} imc={imc}
          onReiniciar={reiniciar} montarDados={(r: RespostasFarmacia) => montarDadosPdf(r, rec, idioma)}
          montarMensagem={(r: RespostasFarmacia) => montarMensagemWhatsApp(r, rec)} erro={erro} setErro={setErro} />
      )}
    </div>
  );
}

// ─── Tela de atração ───
function Atracao({ t, idioma, trocarIdioma, onComecar }: { t: (a: string, b: string) => string; idioma: Lang; trocarIdioma: (l: Lang) => void; onComecar: () => void }) {
  const [hook, setHook] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHook((h) => (h + 1) % HOOKS.length), 4500);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={S.atracao} className="grad">
      <div style={S.langTop}>
        <button onClick={() => trocarIdioma('pt')} style={{ ...S.langBtn, ...(idioma === 'pt' ? S.langOn : {}) }}>PT</button>
        <button onClick={() => trocarIdioma('es')} style={{ ...S.langBtn, ...(idioma === 'es' ? S.langOn : {}) }}>ES</button>
      </div>

      <div style={S.atracaoMid}>
        <NuvitaLogo width={220} height={48} />
        <div style={S.selo}>{t('DIAGNÓSTICO INTELIGENTE DE PEPTÍDEOS', 'DIAGNÓSTICO INTELIGENTE DE PÉPTIDOS')}</div>
        <h1 key={hook} style={S.hook} className="fade">{idioma === 'es' ? HOOKS[hook].es : HOOKS[hook].pt}</h1>
        <p style={S.atracaoSub}>{t('Responda algumas perguntas e receba um protocolo feito só para você — grátis e em 2 minutos.', 'Responde algunas preguntas y recibe un protocolo hecho solo para ti — gratis y en 2 minutos.')}</p>
      </div>

      <div style={S.atracaoBottom}>
        <button onClick={onComecar} style={S.cta} className="pulse">
          {t('Começar diagnóstico', 'Comenzar diagnóstico')} ›
        </button>
        <div style={S.toque}>{t('Toque para começar', 'Toca para comenzar')}</div>
      </div>
    </div>
  );
}

// ─── Topo do wizard ───
function Topo({ t, pct, passo, onVoltar }: { t: (a: string, b: string) => string; pct: number; passo: number; onVoltar: () => void }) {
  return (
    <div style={S.topo}>
      <div style={S.topoRow}>
        <button onClick={onVoltar} style={S.voltarBtn}>‹ {t('Voltar', 'Volver')}</button>
        <NuvitaLogo width={92} height={20} />
        <span style={S.passoNum}>{passo}/{PASSOS}</span>
      </div>
      <div style={S.barra}><div style={{ ...S.barraFill, width: `${pct}%` }} /></div>
    </div>
  );
}

function Passo({ titulo, sub, children }: { titulo: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 style={S.passoTitulo}>{titulo}</h1>
      <p style={S.passoSub}>{sub}</p>
      <div style={{ marginTop: 26 }}>{children}</div>
    </div>
  );
}

function OptRow({ ativo, cor, icon, label, sub, onClick }: { ativo: boolean; cor: string; icon: string; label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ ...S.optRow, ...(ativo ? { borderColor: cor, background: alpha(cor, 0.07) } : {}) }}>
      <span style={{ ...S.optIcon, background: alpha(cor, 0.14), color: cor }}><Icon name={icon} size={26} /></span>
      <span style={{ flex: 1, textAlign: 'left' }}>
        <span style={S.optLabel}>{label}</span>
        <span style={S.optSub}>{sub}</span>
      </span>
      <span style={{ ...S.radio, ...(ativo ? { borderColor: cor, background: cor } : {}) }}>{ativo && <Icon name="check" size={18} />}</span>
    </button>
  );
}

// ─── Medidas com teclado numérico ───
function Medidas({ idade, peso, altura, setIdade, setPeso, setAltura, imc, t }: any) {
  const [campo, setCampo] = useState<'idade' | 'peso' | 'altura'>('idade');
  const val = campo === 'idade' ? idade : campo === 'peso' ? peso : altura;
  const setVal = (v: string) => { if (campo === 'idade') setIdade(v); else if (campo === 'peso') setPeso(v); else setAltura(v); };
  const maxLen = campo === 'idade' ? 3 : 3;

  const digitar = (d: string) => { if (String(val).length >= maxLen) return; setVal(String(val) + d); };
  const apagar = () => setVal(String(val).slice(0, -1));

  const Campo = ({ k, label, sufixo }: { k: 'idade' | 'peso' | 'altura'; label: string; sufixo: string }) => {
    const v = k === 'idade' ? idade : k === 'peso' ? peso : altura;
    const on = campo === k;
    return (
      <button onClick={() => setCampo(k)} style={{ ...S.medCampo, ...(on ? S.medCampoOn : {}) }}>
        <span style={S.medLabel}>{label}</span>
        <span style={S.medValor}>{v || <span style={{ color: '#C4CBD4' }}>—</span>} <span style={S.medSuf}>{v ? sufixo : ''}</span></span>
      </button>
    );
  };

  return (
    <div style={{ marginTop: 18 }}>
      <div style={S.medRow}>
        <Campo k="idade" label={t('Idade', 'Edad')} sufixo={t('anos', 'años')} />
        <Campo k="peso" label={t('Peso', 'Peso')} sufixo="kg" />
        <Campo k="altura" label={t('Altura', 'Altura')} sufixo="cm" />
      </div>
      {imc && idade && peso && altura && (
        <div style={S.imcRow}>IMC <b>{imc.valor}</b> · {imc.classe}</div>
      )}
      <div style={S.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} onClick={() => digitar(d)} style={S.key}>{d}</button>
        ))}
        <div />
        <button onClick={() => digitar('0')} style={S.key}>0</button>
        <button onClick={apagar} style={{ ...S.key, fontSize: 30 }}>⌫</button>
      </div>
    </div>
  );
}

// ─── Analisando ───
function Analisando({ t }: { t: (a: string, b: string) => string }) {
  return (
    <div style={S.analisando} className="grad">
      <div style={S.spinner} className="spin" />
      <div style={S.analiseTit}>{t('Analisando o seu perfil…', 'Analizando tu perfil…')}</div>
      <div style={S.analiseSub}>{t('Montando um protocolo feito para você.', 'Armando un protocolo hecho para ti.')}</div>
    </div>
  );
}

// ─── Resultado ───
function Resultado({ rec, idioma, t, respostas, imc, onReiniciar, montarDados, montarMensagem, erro, setErro }: any) {
  const perfil = [respostas?.idade && `${respostas.idade} ${t('anos', 'años')}`, imc && `IMC ${imc.valor}`].filter(Boolean).join(' · ');
  return (
    <div style={S.tela}>
      <div style={S.topo}>
        <div style={S.topoRow}>
          <NuvitaLogo width={92} height={20} />
          <button onClick={onReiniciar} style={S.voltarBtn}>✕ {t('Encerrar', 'Cerrar')}</button>
        </div>
      </div>
      <div style={S.conteudo}>
        <div style={S.resHead}>
          <div style={S.resBadge}><span style={{ ...S.dot, background: '#7C3AED' }} /> {t('SEU PROTOCOLO', 'TU PROTOCOLO')}</div>
          <h1 style={S.passoTitulo}>{t('Feito para você', 'Hecho para ti')}</h1>
          {perfil && <p style={{ ...S.passoSub, marginTop: 4 }}>{perfil}</p>}
          {rec.resumo && <p style={S.resResumo}>{rec.resumo}</p>}
        </div>

        {rec.avisos?.map((a: string, i: number) => <div key={i} style={S.aviso}>{a}</div>)}

        {rec.bloqueado || rec.itens.length === 0 ? (
          <div style={S.bloqueado}>
            <Icon name="pulse" size={44} />
            <p style={{ marginTop: 12, lineHeight: 1.5 }}>{t('Neste caso o ideal é procurar acompanhamento médico antes de qualquer uso.', 'En este caso lo ideal es buscar acompañamiento médico antes de cualquier uso.')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {rec.itens.map((it: any) => {
              const img = pepImg(it.peptide.n);
              const ui = doseUISeringa(it.peptide.n, it.dose, it.peptide.route);
              const pr = PRIO[it.prioridade as keyof typeof PRIO] || PRIO.opcional;
              return (
                <div key={it.peptide.n} style={S.pepCard}>
                  <div style={S.pepHead}>
                    <span style={S.pepIcon}>{img ? <img src={img} alt="" style={S.pepIconImg} /> : <Icon name="pill" size={28} />}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.pepNome}>{it.peptide.n}</div>
                      <div style={S.pepMec}>{it.peptide.m}</div>
                    </div>
                    <span style={{ ...S.pepBadge, background: pr.bg, color: pr.tx }}>{idioma === 'es' ? pr.le : pr.label}</span>
                  </div>
                  {it.motivo && <div style={S.pepBloco}><span style={S.pepBlocoTit}><Icon name="bulb" size={14} /> {t('Por que para você', 'Por qué para ti')}</span>{it.motivo}</div>}
                  {it.comoUsar && <div style={{ ...S.pepBloco, background: '#F6F7F9' }}><span style={S.pepBlocoTit}><Icon name="clipboard" size={14} /> {t('Como usar', 'Cómo usar')}</span>{it.comoUsar}</div>}
                  <div style={S.doseRow}>
                    <div>
                      <div style={S.doseLbl}>{t('Dose', 'Dosis')}</div>
                      <div style={S.doseVal}>{it.dose}</div>
                      {ui && <div style={S.doseUI}>≈ {ui.texto} {t('na seringa', 'en la jeringa')}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={S.doseLbl}>{t('Frequência', 'Frecuencia')}</div>
                      <div style={S.doseVal}>{it.peptide.freq}</div>
                      <div style={S.doseUI2}>{it.peptide.route} · {it.peptide.timing}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!rec.bloqueado && rec.itens.length > 0 && (
          <Receber t={t} idioma={idioma} respostas={respostas} montarDados={montarDados} montarMensagem={montarMensagem} erro={erro} setErro={setErro} />
        )}

        <button onClick={onReiniciar} style={S.novoBtn}>↺ {t('Novo diagnóstico', 'Nuevo diagnóstico')}</button>
      </div>
    </div>
  );
}

// ─── Receber (WhatsApp / e-mail, self-service) ───
function Receber({ t, idioma, respostas, montarDados, montarMensagem, erro, setErro }: any) {
  const [canal, setCanal] = useState<'whatsapp' | 'email'>('whatsapp');
  const [nome, setNome] = useState('');
  const [pais, setPais] = useState<Pais>('BR');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [foco, setFoco] = useState<'nome' | 'tel'>('tel');

  const telefoneE164 = () => { let d = telefone.replace(/\D/g, ''); if (pais === 'PY') { d = d.replace(/^0+/, ''); return '595' + d; } if (!d.startsWith('55')) d = '55' + d; return d; };

  const enviar = async () => {
    setErro('');
    const r = { ...respostas, nome: nome.trim() || 'Cliente' };
    const dados = montarDados(r);       // estruturado → PDF rico
    const mensagem = montarMensagem(r); // texto → registro + fallback
    setEnviando(true);
    try {
      if (canal === 'whatsapp') {
        const tel = telefoneE164();
        if (tel.length < 12) { setEnviando(false); return setErro(t('Digite um WhatsApp válido.', 'Ingresa un WhatsApp válido.')); }
        const res = await fetch('/api/farmacia/enviar-whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ telefone: tel, nome: r.nome, dados, mensagem }) });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok) setEnviado(true); else setErro(data?.error || t('Não foi possível enviar.', 'No se pudo enviar.'));
      } else {
        const mail = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { setEnviando(false); return setErro(t('Digite um e-mail válido.', 'Ingresa un e-mail válido.')); }
        const res = await fetch('/api/farmacia/enviar-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: mail, nome: r.nome, dados, mensagem }) });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok) setEnviado(true); else setErro(data?.error || t('Não foi possível enviar.', 'No se pudo enviar.'));
      }
    } catch { setErro(t('Erro de conexão.', 'Error de conexión.')); }
    finally { setEnviando(false); }
  };

  const digitarTel = (d: string) => { setErro(''); if (telefone.replace(/\D/g, '').length >= PAISES[pais].max) return; setTelefone(telefone + d); };

  if (enviado) {
    return (
      <div style={{ ...S.receber, textAlign: 'center' }}>
        <div style={{ color: '#16A34A', display: 'flex', justifyContent: 'center' }}><Icon name="check" size={44} /></div>
        <div style={S.receberTit}>{t('Enviado!', '¡Enviado!')}</div>
        <div style={S.receberSub}>{t('Confira o seu protocolo no', 'Revisa tu protocolo en el')} {canal === 'whatsapp' ? 'WhatsApp' : t('e-mail', 'e-mail')}.</div>
      </div>
    );
  }

  return (
    <div style={S.receber}>
      <div style={S.receberTit}>{t('Receba o seu protocolo', 'Recibe tu protocolo')}</div>
      <div style={S.receberSub}>{t('Enviamos o PDF completo para você guardar.', 'Te enviamos el PDF completo para guardar.')}</div>

      <div style={S.tabs}>
        <button onClick={() => { setCanal('whatsapp'); setErro(''); }} style={{ ...S.tab, ...(canal === 'whatsapp' ? S.tabOn : {}) }}><Icon name="whatsapp" size={18} /> WhatsApp</button>
        <button onClick={() => { setCanal('email'); setErro(''); setFoco('nome'); }} style={{ ...S.tab, ...(canal === 'email' ? S.tabOn : {}) }}><Icon name="mail" size={18} /> {t('E-mail', 'E-mail')}</button>
      </div>

      <input className="inp" placeholder={t('Seu nome', 'Tu nombre')} value={nome} onChange={(e) => { setErro(''); setNome(e.target.value); }} onFocus={() => setFoco('nome')} style={S.inp} />

      {canal === 'whatsapp' ? (
        <>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <div style={S.paisWrap}>
              {(Object.keys(PAISES) as Pais[]).map((p) => (
                <button key={p} onClick={() => { setPais(p); setTelefone(''); }} style={{ ...S.paisBtn, ...(pais === p ? S.paisOn : {}) }}>{PAISES[p].flag} +{PAISES[p].ddi}</button>
              ))}
            </div>
            <div onClick={() => setFoco('tel')} style={{ ...S.telDisplay, ...(foco === 'tel' ? { borderColor: '#16A34A' } : {}) }}>
              {telefone || <span style={{ color: '#C4CBD4' }}>{t('Número do WhatsApp', 'Número de WhatsApp')}</span>}
            </div>
          </div>
          <div style={{ ...S.keypad, marginTop: 12 }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} onClick={() => digitarTel(d)} style={S.key}>{d}</button>)}
            <div />
            <button onClick={() => digitarTel('0')} style={S.key}>0</button>
            <button onClick={() => { setErro(''); setTelefone(telefone.slice(0, -1)); }} style={{ ...S.key, fontSize: 30 }}>⌫</button>
          </div>
        </>
      ) : (
        <input className="inp" type="email" inputMode="email" placeholder={t('seu@email.com', 'tu@email.com')} value={email} onChange={(e) => { setErro(''); setEmail(e.target.value); }} style={{ ...S.inp, marginTop: 12 }} />
      )}

      {erro && <div style={S.receberErro}>{erro}</div>}
      <button onClick={enviar} disabled={enviando} style={{ ...S.btnPrimario, marginTop: 16, opacity: enviando ? 0.6 : 1 }}>
        {enviando ? t('Enviando…', 'Enviando…') : t('Enviar meu protocolo', 'Enviar mi protocolo')}
      </button>
    </div>
  );
}

const VERDE = '#16A34A';
const ESTILO = `
  .fade { animation: fadeUp .5s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  .pulse { animation: pulse 2.2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { transform: scale(1); box-shadow: 0 18px 40px rgba(22,163,74,.35); } 50% { transform: scale(1.03); box-shadow: 0 24px 60px rgba(22,163,74,.5); } }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .totem-root, .totem-root * { -webkit-tap-highlight-color: transparent; }
  .inp:focus { border-color: ${VERDE}; box-shadow: 0 0 0 4px rgba(22,163,74,.12); outline: none; }
`;

const S: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: '#FBFBFA', color: '#0E1113', fontFamily: 'inherit', userSelect: 'none', WebkitUserSelect: 'none' },

  // Atração
  atracao: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 34px 56px', textAlign: 'center' },
  langTop: { alignSelf: 'flex-end', display: 'flex', gap: 8, background: '#fff', border: '1px solid #E7E7E7', borderRadius: 999, padding: 4 },
  langBtn: { padding: '10px 18px', fontSize: 16, fontWeight: 700, border: 'none', background: 'transparent', color: '#98A2B3', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit' },
  langOn: { background: VERDE, color: '#fff' },
  atracaoMid: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, maxWidth: 640 },
  selo: { fontSize: 14, fontWeight: 800, letterSpacing: '.14em', color: '#15803D', background: '#EAF7EE', padding: '9px 18px', borderRadius: 999 },
  hook: { fontSize: 46, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.08, margin: 0, minHeight: 160, display: 'flex', alignItems: 'center' },
  atracaoSub: { fontSize: 20, color: '#667085', lineHeight: 1.5, maxWidth: 540 },
  atracaoBottom: { width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  cta: { width: '100%', padding: '26px', borderRadius: 22, background: VERDE, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 26, fontWeight: 800, cursor: 'pointer' },
  toque: { fontSize: 15, color: '#98A2B3', fontWeight: 600 },

  // Wizard shell
  tela: { minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 680, margin: '0 auto', background: '#FBFBFA' },
  topo: { position: 'sticky', top: 0, zIndex: 20, background: 'rgba(251,251,250,.92)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '16px 22px 12px', borderBottom: '1px solid #EEE' },
  topoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  voltarBtn: { padding: '10px 16px', borderRadius: 999, background: '#fff', border: '1px solid #E4E4E4', color: '#344054', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  passoNum: { fontSize: 15, fontWeight: 700, color: '#98A2B3' },
  barra: { height: 7, background: '#ECECEC', borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  barraFill: { height: 7, background: VERDE, borderRadius: 999, transition: 'width .3s ease' },
  conteudo: { flex: 1, padding: '26px 22px 40px' },
  rodape: { position: 'sticky', bottom: 0, background: 'rgba(251,251,250,.94)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: '1px solid #EDEDED', padding: 18 },
  btnPrimario: { width: '100%', padding: '22px', borderRadius: 18, background: VERDE, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 21, fontWeight: 800, cursor: 'pointer' },

  passoTitulo: { fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', margin: 0, lineHeight: 1.12 },
  passoSub: { fontSize: 17, color: '#667085', marginTop: 8 },
  blocoLabel: { fontSize: 15, fontWeight: 700, color: '#475467', marginBottom: 12 },

  // Objetivos
  objGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  objCard: { background: '#fff', border: '2px solid #ECECEC', borderRadius: 20, padding: 16, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, transition: 'border-color .15s, box-shadow .15s' },
  objImgWrap: { position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  objImg: { width: '78%', height: '78%', objectFit: 'contain' },
  objCheck: { position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  objLabel: { fontWeight: 700, fontSize: 18, letterSpacing: '-.01em' },
  objDesc: { fontSize: 13.5, color: '#98A2B3', lineHeight: 1.35 },

  // Opções em linha
  optCol: { display: 'grid', gap: 12 },
  optRow: { display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '2px solid #ECECEC', borderRadius: 18, padding: '18px 20px', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s, background .15s' },
  optIcon: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optLabel: { display: 'block', fontWeight: 700, fontSize: 19 },
  optSub: { display: 'block', fontSize: 14.5, color: '#98A2B3', marginTop: 2 },
  radio: { width: 30, height: 30, borderRadius: '50%', border: '2px solid #D9DCE1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 },

  // Sexo
  sexoRow: { display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap' },
  sexoBtn: { flex: 1, minWidth: 100, padding: '16px 12px', borderRadius: 14, border: '2px solid #ECECEC', background: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#344054', cursor: 'pointer' },
  sexoBtnOn: { borderColor: VERDE, background: '#F0FAF3', color: '#15803D' },

  // Medidas + keypad
  medRow: { display: 'flex', gap: 10 },
  medCampo: { flex: 1, background: '#fff', border: '2px solid #ECECEC', borderRadius: 16, padding: '14px 12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  medCampoOn: { borderColor: VERDE, boxShadow: '0 0 0 4px rgba(22,163,74,.1)' },
  medLabel: { display: 'block', fontSize: 13, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '.04em' },
  medValor: { display: 'block', fontSize: 26, fontWeight: 800, marginTop: 4 },
  medSuf: { fontSize: 15, fontWeight: 600, color: '#98A2B3' },
  imcRow: { textAlign: 'center', fontSize: 15, color: '#667085', marginTop: 14, background: '#F2F7F4', borderRadius: 10, padding: '8px' },
  keypad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 18 },
  key: { height: 68, borderRadius: 16, border: '1px solid #EAEAEA', background: '#fff', fontFamily: 'inherit', fontSize: 26, fontWeight: 600, color: '#0E1113', cursor: 'pointer' },

  // Condições
  condGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  condCard: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, background: '#fff', border: '2px solid #ECECEC', borderRadius: 16, padding: 16, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  condIcon: { width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  condLabel: { fontWeight: 700, fontSize: 16, lineHeight: 1.25 },
  condCheck: { position: 'absolute', top: 12, right: 12 },

  // Analisando
  analisando: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40, textAlign: 'center' },
  spinner: { width: 72, height: 72, borderRadius: '50%', border: '6px solid #DCFCE7', borderTopColor: VERDE },
  analiseTit: { fontSize: 28, fontWeight: 800, letterSpacing: '-.02em' },
  analiseSub: { fontSize: 18, color: '#667085' },

  // Resultado
  resHead: { marginBottom: 18 },
  resBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 800, letterSpacing: '.1em', color: '#7C3AED', background: '#F3EEFF', padding: '8px 14px', borderRadius: 999 },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  resResumo: { fontSize: 16, color: '#475467', lineHeight: 1.55, marginTop: 12 },
  aviso: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', borderRadius: 14, padding: '14px 16px', fontSize: 15, lineHeight: 1.5, marginBottom: 12 },
  bloqueado: { textAlign: 'center', color: '#16A34A', background: '#fff', border: '1px solid #ECECEC', borderRadius: 18, padding: '36px 24px', fontSize: 16, maxWidth: 460, margin: '0 auto' },

  pepCard: { background: '#fff', border: '1px solid #ECECEC', borderRadius: 20, padding: 18 },
  pepHead: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 },
  pepIcon: { width: 56, height: 56, borderRadius: 14, background: '#F2F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', flexShrink: 0, overflow: 'hidden' },
  pepIconImg: { width: '100%', height: '100%', objectFit: 'cover' },
  pepNome: { fontWeight: 800, fontSize: 21, letterSpacing: '-.02em' },
  pepMec: { fontSize: 14.5, color: '#667085', lineHeight: 1.4 },
  pepBadge: { fontSize: 12.5, fontWeight: 800, padding: '6px 12px', borderRadius: 999, flexShrink: 0 },
  pepBloco: { background: '#F0FAF3', borderRadius: 14, padding: '12px 14px', fontSize: 15, color: '#344054', lineHeight: 1.5, marginTop: 10 },
  pepBlocoTit: { display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '.04em', color: '#15803D', marginBottom: 5 },
  doseRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginTop: 14, background: '#F7FAF8', border: '1px solid #E3F0E8', borderRadius: 14, padding: '14px 16px' },
  doseLbl: { fontSize: 12, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '.04em' },
  doseVal: { fontSize: 19, fontWeight: 800, marginTop: 3 },
  doseUI: { fontSize: 14.5, fontWeight: 800, color: '#0B7A3B', marginTop: 3 },
  doseUI2: { fontSize: 13, color: '#98A2B3', marginTop: 3 },

  novoBtn: { width: '100%', marginTop: 24, padding: '18px', borderRadius: 16, background: '#fff', border: '1px solid #E4E4E4', color: '#344054', fontFamily: 'inherit', fontSize: 17, fontWeight: 700, cursor: 'pointer' },

  // Receber
  receber: { background: '#fff', border: '2px solid #E3F0E8', borderRadius: 22, padding: 22, marginTop: 24 },
  receberTit: { fontWeight: 800, fontSize: 22, letterSpacing: '-.01em' },
  receberSub: { fontSize: 15.5, color: '#667085', marginTop: 4 },
  tabs: { display: 'flex', gap: 10, margin: '16px 0' },
  tab: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, border: '2px solid #ECECEC', background: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#667085', cursor: 'pointer' },
  tabOn: { borderColor: VERDE, background: '#F0FAF3', color: '#15803D' },
  inp: { width: '100%', padding: '16px 18px', fontSize: 18, borderRadius: 14, border: '1.5px solid #E4E4E4', background: '#fff', fontFamily: 'inherit', color: '#0E1113' },
  paisWrap: { display: 'grid', gap: 8 },
  paisBtn: { padding: '12px 14px', borderRadius: 12, border: '2px solid #ECECEC', background: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: '#344054', cursor: 'pointer', whiteSpace: 'nowrap' },
  paisOn: { borderColor: VERDE, background: '#F0FAF3', color: '#15803D' },
  telDisplay: { flex: 1, minHeight: 56, borderRadius: 14, border: '2px solid #E4E4E4', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 22, fontWeight: 700, letterSpacing: '.02em' },
  receberErro: { fontSize: 14.5, color: '#B45309', background: '#FFFBEB', borderRadius: 10, padding: '10px 12px', marginTop: 12 },
};
