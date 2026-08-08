// ════════════════════════════════════════════════
//  NUVITA — app/totem/page.tsx
//  Versão TOTEM (self-service) do balcão: a pessoa chega, toca em
//  "Começar diagnóstico" e preenche tudo sozinha numa tela vertical grande.
//  Reaproveita o motor de IA e as APIs de envio (WhatsApp/e-mail) do balcão.
//  NÃO reinicia sozinho — o fluxo vai até o fim; só volta pelo "Voltar".
// ════════════════════════════════════════════════

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
const PASSOS = 6;

const PAISES: Record<Pais, { ddi: string; flag: string; max: number }> = {
  BR: { ddi: '55', flag: '🇧🇷', max: 11 },
  PY: { ddi: '595', flag: '🇵🇾', max: 10 },
};

const OBJETIVOS: { key: ObjectiveKey; label: string; le: string; cor: string }[] = [
  { key: 'gordura', label: 'Emagrecer', le: 'Adelgazar', cor: '#EA580C' },
  { key: 'massa', label: 'Ganhar massa', le: 'Ganar masa', cor: '#2563EB' },
  { key: 'pele', label: 'Pele / anti-idade', le: 'Piel / antiedad', cor: '#EC4899' },
  { key: 'cognitivo', label: 'Foco / cognição', le: 'Enfoque', cor: '#7C3AED' },
  { key: 'longevidade', label: 'Energia', le: 'Energía', cor: '#16A34A' },
  { key: 'sono', label: 'Dormir melhor', le: 'Dormir mejor', cor: '#4F46E5' },
  { key: 'recuperacao', label: 'Recuperação', le: 'Recuperación', cor: '#0EA5E9' },
  { key: 'hormonal', label: 'Libido / hormonal', le: 'Libido', cor: '#E11D48' },
];

const NIVEIS: { key: NivelFarmacia; label: string; le: string; sub: string; se: string; icon: string; cor: string }[] = [
  { key: 'iniciante', label: 'Nunca usei', le: 'Nunca usé', sub: 'É a minha primeira vez', se: 'Es mi primera vez', icon: 'sparkle', cor: '#16A34A' },
  { key: 'intermediario', label: 'Já usei', le: 'Ya usé', sub: 'Tenho alguma experiência', se: 'Tengo algo de experiencia', icon: 'refresh', cor: '#2563EB' },
  { key: 'avancado', label: 'Uso sempre', le: 'Uso siempre', sub: 'Já sou experiente', se: 'Ya soy experto', icon: 'bolt', cor: '#7C3AED' },
];

const ATIVIDADES: { key: AtividadeFarmacia; label: string; le: string; sub: string; se: string; icon: string; cor: string }[] = [
  { key: 'sedentario', label: 'Sedentário', le: 'Sedentario', sub: 'Pouco exercício', se: 'Poco ejercicio', icon: 'moon', cor: '#D97706' },
  { key: 'moderado', label: 'Moderado', le: 'Moderado', sub: 'Treino 1 a 3 vezes por semana', se: 'Entreno 1 a 3 veces por semana', icon: 'dumbbell', cor: '#16A34A' },
  { key: 'ativo', label: 'Ativo', le: 'Activo', sub: 'Treino 4 a 5 vezes por semana', se: 'Entreno 4 a 5 veces por semana', icon: 'pulse', cor: '#2563EB' },
  { key: 'muito_ativo', label: 'Muito ativo', le: 'Muy activo', sub: 'Treino quase todo dia', se: 'Entreno casi todos los días', icon: 'bolt', cor: '#EA580C' },
];

const SONOS: { key: SonoFarmacia; label: string; le: string; sub: string; se: string; icon: string; cor: string }[] = [
  { key: 'ruim', label: 'Ruim', le: 'Malo', sub: 'Custo pra dormir', se: 'Me cuesta dormir', icon: 'drop', cor: '#EC4899' },
  { key: 'regular', label: 'Regular', le: 'Regular', sub: 'Dá pra melhorar', se: 'Se puede mejorar', icon: 'pulse', cor: '#16A34A' },
  { key: 'bom', label: 'Bom', le: 'Bueno', sub: 'Acordo bem disposto', se: 'Despierto descansado', icon: 'moon', cor: '#4F46E5' },
];

const CONDICOES: { key: CondicaoSaude; label: string; le: string; icon: string; cor: string }[] = [
  { key: 'nenhuma', label: 'Nenhuma', le: 'Ninguna', icon: 'check', cor: '#16A34A' },
  { key: 'diabetes', label: 'Diabetes', le: 'Diabetes', icon: 'drop', cor: '#2563EB' },
  { key: 'hipertensao', label: 'Pressão alta', le: 'Presión alta', icon: 'heart', cor: '#E11D48' },
  { key: 'tireoide', label: 'Tireoide', le: 'Tiroides', icon: 'pulse', cor: '#0EA5E9' },
  { key: 'cancer', label: 'Histórico de câncer', le: 'Antecedente de cáncer', icon: 'ribbon', cor: '#7C3AED' },
  { key: 'gestacao', label: 'Gestante', le: 'Embarazo', icon: 'person', cor: '#D97706' },
];

const PRIO = {
  essencial: { bg: '#DCFCE7', tx: '#15803D', label: 'Essencial', le: 'Esencial' },
  recomendado: { bg: '#FEF3C7', tx: '#B45309', label: 'Recomendado', le: 'Recomendado' },
  opcional: { bg: '#F1F1F1', tx: '#6B7280', label: 'Opcional', le: 'Opcional' },
} as const;

// Frases fortes que giram na tela de atração (naturais, sem travessão).
const HOOKS: { pt: string; es: string }[] = [
  { pt: 'Descubra o peptídeo ideal para o seu corpo', es: 'Descubre el péptido ideal para tu cuerpo' },
  { pt: 'Emagrecer, ganhar massa ou dormir melhor começa aqui', es: 'Adelgazar, ganar masa o dormir mejor empieza aquí' },
  { pt: 'Seu protocolo personalizado em 2 minutos', es: 'Tu protocolo personalizado en 2 minutos' },
];

function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}


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
  const [sexo, setSexo] = useState<'masculino' | 'feminino' | ''>('');
  const [idade, setIdade] = useState(30);
  const [peso, setPeso] = useState(75);
  const [altura, setAltura] = useState(170);
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
      peso, altura, idade,
      atividade: atividade || undefined, sono: sono || undefined,
    };
  }, [objetivos, nivel, sexo, condicoes, peso, altura, idade, atividade, sono]);

  const imc = useMemo(() => calcularIMC(peso, altura), [peso, altura]);

  const reiniciar = useCallback(() => {
    setObjetivos([]); setNivel(''); setSexo(''); setIdade(30); setPeso(75); setAltura(170);
    setAtividade(''); setSono(''); setCondicoes([]); setRec(null); setErro(''); setPasso(1);
    setTela('atracao');
  }, []);

  const comecar = () => { reiniciar(); setTela('wizard'); setPasso(1); };

  // Gera a recomendação (busca estoque fresco + IA com fallback). Não mexe na UI.
  const gerarInterno = async (r: RespostasFarmacia): Promise<Recomendacao | null> => {
    let estoqueAtual = estoque;
    try {
      const codigo = sessionStorage.getItem(CODE_KEY);
      if (codigo) {
        const res = await fetch('/api/farmacia/estoque', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get', codigo }) });
        const data = await res.json().catch(() => ({}));
        if (data?.found && Array.isArray(data.peptideos)) { estoqueAtual = data.peptideos; setEstoque(data.peptideos); }
      }
    } catch { /* cache */ }
    try {
      let res = await diagnosticarComIA(r, estoqueAtual, idioma);
      if (!res || (res.itens.length === 0 && !res.bloqueado)) res = recomendarPeptideos(r, estoqueAtual);
      return res;
    } catch { return recomendarPeptideos(r, estoqueAtual); }
  };

  // Prefetch: começa a gerar já na última etapa, enquanto a pessoa escolhe a
  // condição de saúde. Ao clicar, o resultado já costuma estar pronto.
  const chaveAtual = () => JSON.stringify({ objetivos, nivel, sexo, idade, peso, altura, atividade, sono, condicoes, idioma });
  const prefetch = useRef<{ chave: string; p: Promise<Recomendacao | null> } | null>(null);
  useEffect(() => {
    if (passo === PASSOS && respostas) {
      const chave = chaveAtual();
      if (prefetch.current?.chave !== chave) prefetch.current = { chave, p: gerarInterno(respostas).catch(() => null) };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo, condicoes]);

  const gerar = async () => {
    if (!respostas) return;
    setErro(''); setTela('analisando');
    const chave = chaveAtual();
    const p = prefetch.current?.chave === chave ? prefetch.current.p : gerarInterno(respostas).catch(() => null);
    let resultado = await p;
    if (!resultado) resultado = await gerarInterno(respostas);
    prefetch.current = null;
    setRec(resultado);
    setTela('resultado');
    window.scrollTo({ top: 0 });
  };

  const podeAvancar = (): boolean => {
    if (passo === 1) return objetivos.length > 0;
    if (passo === 2) return !!nivel;
    if (passo === 3) return !!sexo;
    if (passo === 4) return !!atividade;
    if (passo === 5) return !!sono;
    if (passo === 6) return condicoes.length > 0;
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
                      <button key={o.key} onClick={() => toggleObjetivo(o.key)} style={{ ...S.objCard, ...(on ? { borderColor: o.cor, background: alpha(o.cor, 0.06) } : {}) }}>
                        <span style={{ ...S.objImgWrap, background: alpha(o.cor, 0.1) }}>
                          <img src={OBJ_IMG[o.key]} alt="" style={S.objImg} />
                          {on && <span style={{ ...S.objCheck, background: o.cor }}><Icon name="check" size={16} /></span>}
                        </span>
                        <span style={S.objLabel}>{idioma === 'es' ? o.le : o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Passo>
            )}

            {passo === 2 && (
              <Passo titulo={t('Você já usou peptídeos?', '¿Ya usaste péptidos?')} sub={t('Isso ajuda a ajustar as doses.', 'Esto ayuda a ajustar las dosis.')}>
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
              <Passo titulo={t('Sobre você', 'Sobre ti')} sub={t('Para calcular as doses certas.', 'Para calcular las dosis correctas.')}>
                <div style={S.sexoRow}>
                  {([['masculino', t('Masculino', 'Masculino'), 'person'], ['feminino', t('Feminino', 'Femenino'), 'person']] as const).map(([k, lbl, ic]) => (
                    <button key={k} onClick={() => setSexo(k)} style={{ ...S.sexoBtn, ...(sexo === k ? S.sexoBtnOn : {}) }}>
                      <Icon name={ic} size={26} /> {lbl}
                    </button>
                  ))}
                </div>
                <Slider label={t('Idade', 'Edad')} valor={idade} setValor={setIdade} min={16} max={90} sufixo={t('anos', 'años')} />
                <Slider label={t('Peso', 'Peso')} valor={peso} setValor={setPeso} min={40} max={180} sufixo="kg" />
                <Slider label={t('Altura', 'Altura')} valor={altura} setValor={setAltura} min={130} max={210} sufixo="cm" />
                {imc && <div style={S.imcRow}>{t('Seu IMC', 'Tu IMC')}: <b>{imc.valor}</b> · {imc.classe}</div>}
              </Passo>
            )}

            {passo === 4 && (
              <Passo titulo={t('Como é a sua atividade física?', '¿Cómo es tu actividad física?')} sub={t('Com que frequência você treina.', 'Con qué frecuencia entrenas.')}>
                <div style={S.optCol}>
                  {ATIVIDADES.map((a) => (
                    <OptRow key={a.key} ativo={atividade === a.key} cor={a.cor} icon={a.icon}
                      label={idioma === 'es' ? a.le : a.label} sub={idioma === 'es' ? a.se : a.sub}
                      onClick={() => setAtividade(a.key)} />
                  ))}
                </div>
              </Passo>
            )}

            {passo === 5 && (
              <Passo titulo={t('Como é o seu sono?', '¿Cómo es tu sueño?')} sub={t('Qualidade do descanso.', 'Calidad del descanso.')}>
                <div style={S.optCol}>
                  {SONOS.map((s) => (
                    <OptRow key={s.key} ativo={sono === s.key} cor={s.cor} icon={s.icon}
                      label={idioma === 'es' ? s.le : s.label} sub={idioma === 'es' ? s.se : s.sub}
                      onClick={() => setSono(s.key)} />
                  ))}
                </div>
              </Passo>
            )}

            {passo === 6 && (
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
    <div style={S.atracao} className="grad" onClick={onComecar}>
      <div style={S.langTop} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => trocarIdioma('pt')} style={{ ...S.langBtn, ...(idioma === 'pt' ? S.langOn : {}) }}>PT</button>
        <button onClick={() => trocarIdioma('es')} style={{ ...S.langBtn, ...(idioma === 'es' ? S.langOn : {}) }}>ES</button>
      </div>

      <div style={S.atracaoMid}>
        <NuvitaLogo width={200} height={44} />
        <div style={S.selo}>{t('DIAGNÓSTICO INTELIGENTE DE PEPTÍDEOS', 'DIAGNÓSTICO INTELIGENTE DE PÉPTIDOS')}</div>
        <h1 key={hook} style={S.hook} className="fade">{idioma === 'es' ? HOOKS[hook].es : HOOKS[hook].pt}</h1>
        <p style={S.atracaoSub}>{t('Responda algumas perguntas e receba um protocolo feito para você. É grátis e leva 2 minutos.', 'Responde algunas preguntas y recibe un protocolo hecho para ti. Es gratis y toma 2 minutos.')}</p>
        <div style={S.hookDots}>
          {HOOKS.map((_, i) => <span key={i} style={{ ...S.hookDot, ...(i === hook ? S.hookDotOn : {}) }} />)}
        </div>
      </div>

      <div style={S.atracaoBottom} onClick={(e) => e.stopPropagation()}>
        <button onClick={onComecar} style={S.cta} className="pulse">
          {t('Começar diagnóstico', 'Comenzar diagnóstico')} ›
        </button>
        <div style={S.toque}>{t('Toque em qualquer lugar para começar', 'Toca en cualquier lugar para comenzar')}</div>
      </div>
    </div>
  );
}

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
    <div style={S.passoWrap}>
      <h1 style={S.passoTitulo}>{titulo}</h1>
      <p style={S.passoSub}>{sub}</p>
      <div style={{ marginTop: 22, flex: 1 }}>{children}</div>
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

// ─── Slider grande para idade / peso / altura ───
function Slider({ label, valor, setValor, min, max, sufixo }: { label: string; valor: number; setValor: (n: number) => void; min: number; max: number; sufixo: string }) {
  const p = ((valor - min) / (max - min)) * 100;
  return (
    <div style={S.sliderCard}>
      <div style={S.sliderTop}>
        <span style={S.sliderLabel}>{label}</span>
        <span style={S.sliderVal}>{valor}<span style={S.sliderSuf}> {sufixo}</span></span>
      </div>
      <input
        type="range" min={min} max={max} value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        className="totem-range"
        style={{ ['--p' as string]: `${p}%` } as React.CSSProperties}
      />
    </div>
  );
}

function Analisando({ t }: { t: (a: string, b: string) => string }) {
  return (
    <div style={S.analisando} className="grad">
      <div style={S.spinner} className="spin" />
      <div style={S.analiseTit}>{t('Analisando o seu perfil', 'Analizando tu perfil')}</div>
      <div style={S.analiseSub}>{t('Montando um protocolo feito para você.', 'Armando un protocolo hecho para ti.')}</div>
    </div>
  );
}

// ─── Resultado: carrossel horizontal (passa pro lado, um peptídeo por slide) ───
//  Usa o scroll NATIVO do navegador com snap por slide (robusto, não trava).
function Resultado({ rec, idioma, t, respostas, imc, onReiniciar, montarDados, montarMensagem, erro, setErro }: any) {
  const perfil = [respostas?.idade && `${respostas.idade} ${t('anos', 'años')}`, imc && `IMC ${imc.valor} (${imc.classe})`].filter(Boolean).join(' · ');
  const bloqueado = rec.bloqueado || rec.itens.length === 0;
  const temOrient = rec.orientacaoAlimentar || rec.orientacaoTreino || rec.observacoes;
  const itens: any[] = bloqueado ? [] : rec.itens;
  const totalSlides = bloqueado ? 1 : itens.length + 2 + (temOrient ? 1 : 0); // intro + peptídeos + [orientações] + receber

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = useState(0);
  // Botões: posiciona direto no slide (robusto). O swipe é o scroll nativo.
  const irPara = (i: number) => {
    const el = scrollRef.current; if (!el) return;
    const alvo = Math.max(0, Math.min(totalSlides - 1, i));
    el.scrollLeft = alvo * el.clientWidth;
    setIdx(alvo);
  };
  const onScroll = () => {
    const el = scrollRef.current; if (!el) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div style={S.tela}>
      <div style={S.topo}>
        <div style={S.topoRow}>
          <NuvitaLogo width={92} height={20} />
          <button onClick={onReiniciar} style={S.voltarBtn}>✕ {t('Encerrar', 'Cerrar')}</button>
        </div>
        {!bloqueado && (
          <div style={S.dotsRow}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <span key={i} style={{ ...S.dot2, ...(i === idx ? S.dot2On : {}) }} />
            ))}
          </div>
        )}
      </div>

      {bloqueado ? (
        <div style={S.resScroll} className="hidescroll">
          {rec.avisos?.map((a: string, i: number) => <div key={i} style={S.aviso}>{a}</div>)}
          <div style={S.bloqueado}>
            <Icon name="pulse" size={44} />
            <p style={{ marginTop: 12, lineHeight: 1.5 }}>{t('Neste caso o ideal é procurar acompanhamento médico antes de qualquer uso.', 'En este caso lo ideal es buscar acompañamiento médico antes de cualquier uso.')}</p>
          </div>
          <button onClick={onReiniciar} style={S.novoBtn}>↺ {t('Novo diagnóstico', 'Nuevo diagnóstico')}</button>
        </div>
      ) : (
        <>
          <div ref={scrollRef} onScroll={onScroll} style={S.carrossel} className="hidescroll">
            {/* Slide intro */}
            <div style={S.slide}>
              <div style={S.slideInner}>
                <div style={S.resBadge}><span style={{ ...S.dot, background: '#7C3AED' }} /> {t('SEU PROTOCOLO', 'TU PROTOCOLO')}</div>
                <h1 style={S.introTit}>{t('Está pronto!', '¡Está listo!')}</h1>
                {perfil && <p style={S.introPerfil}>{perfil}</p>}
                {rec.resumo && <p style={S.introResumo}>{rec.resumo}</p>}
                <div style={S.introCount}>{itens.length} {itens.length === 1 ? t('peptídeo recomendado', 'péptido recomendado') : t('peptídeos recomendados', 'péptidos recomendados')}</div>
                <div style={S.swipeHint}><Icon name="refresh" size={16} /> {t('Deslize para o lado para ver cada um', 'Desliza al lado para ver cada uno')} ›</div>
              </div>
            </div>

            {/* Um slide por peptídeo (conteúdo completo) */}
            {itens.map((it: any, i: number) => {
              const img = pepImg(it.peptide.n);
              const ui = doseUISeringa(it.peptide.n, it.dose, it.peptide.route);
              const pr = PRIO[it.prioridade as keyof typeof PRIO] || PRIO.opcional;
              const specs = [
                [t('Quando', 'Cuándo'), it.peptide.timing],
                [t('Via', 'Vía'), it.peptide.route],
                [t('Ciclo', 'Ciclo'), it.peptide.cycle],
                [t('Descanso', 'Descanso'), it.peptide.rest],
              ].filter(([, v]) => v);
              return (
                <div key={it.peptide.n} style={S.slide}>
                  <div style={S.slideScroll} className="hidescroll">
                    <div style={S.pepNumero}>{i + 1} / {itens.length}</div>
                    <div style={S.pepTopoV}>
                      <span style={S.pepIcon}>{img ? <img src={img} alt="" style={S.pepIconImg} /> : <Icon name="pill" size={30} />}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={S.pepNomeV}>{it.peptide.n}</div>
                        <div style={S.pepMecV}>{it.peptide.m}</div>
                      </div>
                      <span style={{ ...S.pepBadge, background: pr.bg, color: pr.tx }}>{idioma === 'es' ? pr.le : pr.label}</span>
                    </div>

                    <div style={S.doseGrande}>
                      <div style={S.doseLbl}>{t('Dose', 'Dosis')}</div>
                      <div style={S.doseVal}>{it.dose}</div>
                      {ui && <div style={S.doseUI}>≈ {ui.texto} {t('na seringa', 'en la jeringa')}</div>}
                      <div style={S.doseInfo}>{it.peptide.freq} · {it.peptide.route}</div>
                    </div>

                    {specs.length > 0 && (
                      <div style={S.specsGrid}>
                        {specs.map(([l, v]) => (
                          <div key={l} style={S.specCell}><div style={S.specL}>{l}</div><div style={S.specV}>{v}</div></div>
                        ))}
                      </div>
                    )}

                    {it.motivo && <div style={S.pepBloco}><span style={S.pepBlocoTit}><Icon name="bulb" size={13} /> {t('Por que para você', 'Por qué para ti')}</span>{it.motivo}</div>}
                    {it.comoUsar && <div style={{ ...S.pepBloco, background: '#F6F7F9' }}><span style={{ ...S.pepBlocoTit, color: '#475467' }}><Icon name="clipboard" size={13} /> {t('Como usar', 'Cómo usar')}</span>{it.comoUsar}</div>}
                    {it.alternativa && <div style={{ ...S.pepBloco, background: '#F6F7F9' }}><span style={{ ...S.pepBlocoTit, color: '#475467' }}><Icon name="refresh" size={13} /> {t('Comparação', 'Comparación')}</span>{it.alternativa}</div>}
                  </div>
                </div>
              );
            })}

            {/* Slide de orientações */}
            {temOrient && (
              <div style={S.slide}>
                <div style={S.slideScroll} className="hidescroll">
                  <div style={S.orientTit}>{t('Orientações', 'Orientaciones')}</div>
                  {rec.orientacaoAlimentar && <div style={S.pepBloco}><span style={{ ...S.pepBlocoTit, color: '#475467' }}><Icon name="fork" size={13} /> {t('Alimentação', 'Alimentación')}</span>{rec.orientacaoAlimentar}</div>}
                  {rec.orientacaoTreino && <div style={S.pepBloco}><span style={{ ...S.pepBlocoTit, color: '#475467' }}><Icon name="dumbbell" size={13} /> {t('Treino', 'Entrenamiento')}</span>{rec.orientacaoTreino}</div>}
                  {rec.observacoes && <div style={S.pepBloco}><span style={{ ...S.pepBlocoTit, color: '#475467' }}><Icon name="eye" size={13} /> {t('O que observar', 'Qué observar')}</span>{rec.observacoes}</div>}
                </div>
              </div>
            )}

            {/* Slide final: receber */}
            <div style={S.slide}>
              <div style={S.slideScroll} className="hidescroll">
                <Receber t={t} idioma={idioma} respostas={respostas} montarDados={montarDados} montarMensagem={montarMensagem} erro={erro} setErro={setErro} />
              </div>
            </div>
          </div>

          {/* Navegação */}
          <div style={S.navRow}>
            <button onClick={() => irPara(idx - 1)} disabled={idx === 0} style={{ ...S.navBtn, opacity: idx === 0 ? 0.35 : 1 }}>‹</button>
            {idx < totalSlides - 1 ? (
              <button onClick={() => irPara(idx + 1)} style={S.navProximo}>
                {idx === 0 ? t('Ver os peptídeos', 'Ver los péptidos') : idx === totalSlides - 2 ? t('Enviar meu protocolo', 'Enviar mi protocolo') : t('Próximo', 'Siguiente')} ›
              </button>
            ) : (
              <button onClick={onReiniciar} style={S.navProximo}>↺ {t('Novo diagnóstico', 'Nuevo diagnóstico')}</button>
            )}
            <button onClick={() => irPara(idx + 1)} disabled={idx >= totalSlides - 1} style={{ ...S.navBtn, opacity: idx >= totalSlides - 1 ? 0.35 : 1 }}>›</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Receber (WhatsApp / e-mail) ───
function Receber({ t, idioma, respostas, montarDados, montarMensagem, erro, setErro }: any) {
  const [canal, setCanal] = useState<'whatsapp' | 'email'>('whatsapp');
  const [nome, setNome] = useState('');
  const [pais, setPais] = useState<Pais>('BR');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const telefoneE164 = () => { let d = telefone.replace(/\D/g, ''); if (pais === 'PY') { d = d.replace(/^0+/, ''); return '595' + d; } if (!d.startsWith('55')) d = '55' + d; return d; };

  const enviar = async () => {
    setErro('');
    const r = { ...respostas, nome: nome.trim() || 'Cliente' };
    const dados = montarDados(r);
    const mensagem = montarMensagem(r);
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
      <div style={{ textAlign: 'center', padding: '30px 10px' }}>
        <div style={{ color: '#16A34A', display: 'flex', justifyContent: 'center' }}><Icon name="check" size={54} /></div>
        <div style={{ ...S.receberTit, marginTop: 12 }}>{t('Enviado!', '¡Enviado!')}</div>
        <div style={S.receberSub}>{t('Confira o seu protocolo no', 'Revisa tu protocolo en el')} {canal === 'whatsapp' ? 'WhatsApp' : t('e-mail', 'e-mail')}.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={S.receberTit}>{t('Leve o seu protocolo', 'Llévate tu protocolo')}</div>
        <div style={S.receberSub}>{t('Enviamos o PDF completo para você guardar.', 'Te enviamos el PDF completo para guardar.')}</div>
      </div>

      <div style={S.tabs}>
        <button onClick={() => { setCanal('whatsapp'); setErro(''); }} style={{ ...S.tab, ...(canal === 'whatsapp' ? S.tabOn : {}) }}><Icon name="whatsapp" size={18} /> WhatsApp</button>
        <button onClick={() => { setCanal('email'); setErro(''); }} style={{ ...S.tab, ...(canal === 'email' ? S.tabOn : {}) }}><Icon name="mail" size={18} /> {t('E-mail', 'E-mail')}</button>
      </div>

      <input className="inp" placeholder={t('Seu nome', 'Tu nombre')} value={nome} onChange={(e) => { setErro(''); setNome(e.target.value); }} style={S.inp} />

      {canal === 'whatsapp' ? (
        <>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <div style={S.paisWrap}>
              {(Object.keys(PAISES) as Pais[]).map((p) => (
                <button key={p} onClick={() => { setPais(p); setTelefone(''); }} style={{ ...S.paisBtn, ...(pais === p ? S.paisOn : {}) }}>{PAISES[p].flag} +{PAISES[p].ddi}</button>
              ))}
            </div>
            <div style={S.telDisplay}>{telefone || <span style={{ color: '#C4CBD4' }}>{t('WhatsApp', 'WhatsApp')}</span>}</div>
          </div>
          <div style={{ ...S.keypad, marginTop: 12 }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} onClick={() => digitarTel(d)} style={S.key}>{d}</button>)}
            <div />
            <button onClick={() => digitarTel('0')} style={S.key}>0</button>
            <button onClick={() => { setErro(''); setTelefone(telefone.slice(0, -1)); }} style={{ ...S.key, fontSize: 28 }}>⌫</button>
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
  @keyframes pulse { 0%,100% { transform: scale(1); box-shadow: 0 16px 36px rgba(22,163,74,.32); } 50% { transform: scale(1.03); box-shadow: 0 22px 54px rgba(22,163,74,.48); } }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .hidescroll::-webkit-scrollbar { display: none; }
  .hidescroll { scrollbar-width: none; -ms-overflow-style: none; }
  .inp:focus { border-color: ${VERDE}; box-shadow: 0 0 0 4px rgba(22,163,74,.12); outline: none; }
  .totem-range { -webkit-appearance: none; appearance: none; width: 100%; height: 14px; border-radius: 999px; margin-top: 14px; background: linear-gradient(90deg, ${VERDE} var(--p,50%), #E9ECEF var(--p,50%)); outline: none; }
  .totem-range::-webkit-slider-thumb { -webkit-appearance: none; width: 42px; height: 42px; border-radius: 50%; background: #fff; border: 5px solid ${VERDE}; box-shadow: 0 3px 12px rgba(0,0,0,.18); cursor: pointer; }
  .totem-range::-moz-range-thumb { width: 42px; height: 42px; border-radius: 50%; background: #fff; border: 5px solid ${VERDE}; box-shadow: 0 3px 12px rgba(0,0,0,.18); cursor: pointer; }
`;

const S: Record<string, React.CSSProperties> = {
  root: { height: '100vh', overflow: 'hidden', background: '#FBFBFA', color: '#0E1113', fontFamily: 'inherit', userSelect: 'none', WebkitUserSelect: 'none' },

  // Atração
  atracao: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 34px 44px', textAlign: 'center', cursor: 'pointer' },
  langTop: { alignSelf: 'flex-end', display: 'flex', gap: 8, background: '#fff', border: '1px solid #E7E7E7', borderRadius: 999, padding: 4 },
  langBtn: { padding: '10px 18px', fontSize: 16, fontWeight: 700, border: 'none', background: 'transparent', color: '#98A2B3', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit' },
  langOn: { background: VERDE, color: '#fff' },
  atracaoMid: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, maxWidth: 640 },
  selo: { fontSize: 13.5, fontWeight: 800, letterSpacing: '.12em', color: '#15803D', background: '#EAF7EE', padding: '9px 18px', borderRadius: 999 },
  hook: { fontSize: 44, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, margin: 0, minHeight: 150, display: 'flex', alignItems: 'center' },
  atracaoSub: { fontSize: 19, color: '#667085', lineHeight: 1.5, maxWidth: 520 },
  hookDots: { display: 'flex', gap: 8, marginTop: 4 },
  hookDot: { width: 9, height: 9, borderRadius: '50%', background: '#D9DCE1', transition: 'all .2s' },
  hookDotOn: { background: VERDE, width: 24, borderRadius: 999 },
  atracaoBottom: { width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 },
  cta: { width: '100%', padding: '26px', borderRadius: 22, background: VERDE, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 26, fontWeight: 800, cursor: 'pointer' },
  toque: { fontSize: 15, color: '#98A2B3', fontWeight: 600 },

  // Wizard shell
  tela: { height: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 680, margin: '0 auto', background: '#FBFBFA' },
  topo: { flexShrink: 0, background: '#FBFBFA', padding: '16px 22px 12px', borderBottom: '1px solid #EEE' },
  topoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  voltarBtn: { padding: '10px 16px', borderRadius: 999, background: '#fff', border: '1px solid #E4E4E4', color: '#344054', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  passoNum: { fontSize: 15, fontWeight: 700, color: '#98A2B3' },
  barra: { height: 7, background: '#ECECEC', borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  barraFill: { height: 7, background: VERDE, borderRadius: 999, transition: 'width .3s ease' },
  conteudo: { flex: 1, minHeight: 0, overflowY: 'auto', padding: '22px 22px 32px', display: 'flex', flexDirection: 'column' },
  rodape: { flexShrink: 0, background: '#FBFBFA', borderTop: '1px solid #EDEDED', padding: 18 },
  btnPrimario: { width: '100%', padding: '22px', borderRadius: 18, background: VERDE, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 21, fontWeight: 800, cursor: 'pointer' },

  passoWrap: { flex: 1, display: 'flex', flexDirection: 'column' },
  passoTitulo: { fontSize: 30, fontWeight: 800, letterSpacing: '-.02em', margin: 0, lineHeight: 1.12 },
  passoSub: { fontSize: 17, color: '#667085', marginTop: 8 },

  // Objetivos (compacto, cabe em 1 tela)
  objGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: '100%', alignContent: 'stretch' },
  objCard: { background: '#fff', border: '2px solid #ECECEC', borderRadius: 18, padding: '12px 10px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8, transition: 'border-color .15s, background .15s' },
  objImgWrap: { position: 'relative', width: 96, height: 96, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  objImg: { width: '80%', height: '80%', objectFit: 'contain' },
  objCheck: { position: 'absolute', top: 5, right: 5, width: 26, height: 26, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  objLabel: { fontWeight: 700, fontSize: 17, letterSpacing: '-.01em', lineHeight: 1.15 },

  // Opções em linha
  optCol: { display: 'grid', gap: 12 },
  optRow: { display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '2px solid #ECECEC', borderRadius: 18, padding: '18px 20px', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s, background .15s' },
  optIcon: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optLabel: { display: 'block', fontWeight: 700, fontSize: 19 },
  optSub: { display: 'block', fontSize: 14.5, color: '#98A2B3', marginTop: 2 },
  radio: { width: 30, height: 30, borderRadius: '50%', border: '2px solid #D9DCE1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 },

  // Dados: sexo + sliders
  sexoRow: { display: 'flex', gap: 12, marginBottom: 22 },
  sexoBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '20px 12px', borderRadius: 16, border: '2px solid #ECECEC', background: '#fff', fontFamily: 'inherit', fontSize: 18, fontWeight: 700, color: '#344054', cursor: 'pointer' },
  sexoBtnOn: { borderColor: VERDE, background: '#F0FAF3', color: '#15803D' },
  sliderCard: { background: '#fff', border: '1px solid #ECECEC', borderRadius: 18, padding: '18px 20px', marginBottom: 14 },
  sliderTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 16, fontWeight: 700, color: '#475467' },
  sliderVal: { fontSize: 30, fontWeight: 800, color: '#0E1113', letterSpacing: '-.02em' },
  sliderSuf: { fontSize: 16, fontWeight: 600, color: '#98A2B3' },
  imcRow: { textAlign: 'center', fontSize: 16, color: '#475467', marginTop: 4, background: '#F2F7F4', borderRadius: 12, padding: '12px' },

  // Keypad (telefone)
  keypad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  key: { height: 62, borderRadius: 14, border: '1px solid #EAEAEA', background: '#fff', fontFamily: 'inherit', fontSize: 24, fontWeight: 600, color: '#0E1113', cursor: 'pointer' },

  // Condições
  condGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  condCard: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, background: '#fff', border: '2px solid #ECECEC', borderRadius: 16, padding: 16, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  condIcon: { width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  condLabel: { fontWeight: 700, fontSize: 16, lineHeight: 1.25 },
  condCheck: { position: 'absolute', top: 12, right: 12 },

  // Analisando
  analisando: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40, textAlign: 'center' },
  spinner: { width: 72, height: 72, borderRadius: '50%', border: '6px solid #DCFCE7', borderTopColor: VERDE },
  analiseTit: { fontSize: 28, fontWeight: 800, letterSpacing: '-.02em' },
  analiseSub: { fontSize: 18, color: '#667085' },

  // Resultado — carrossel
  dotsRow: { display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 },
  dot2: { width: 8, height: 8, borderRadius: '50%', background: '#D9DCE1', transition: 'all .2s' },
  dot2On: { background: VERDE, width: 22, borderRadius: 999 },
  carrossel: { flex: 1, minHeight: 0, display: 'flex', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x proximity', WebkitOverflowScrolling: 'touch' },
  slide: { flex: '0 0 100%', width: '100%', height: '100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', padding: '12px 22px' },
  slideInner: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10 },
  slideScroll: { flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 10 },

  resBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 800, letterSpacing: '.1em', color: '#7C3AED', background: '#F3EEFF', padding: '8px 14px', borderRadius: 999 },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  introTit: { fontSize: 40, fontWeight: 800, letterSpacing: '-.03em', margin: '6px 0 0' },
  introPerfil: { fontSize: 16, color: '#98A2B3' },
  introResumo: { fontSize: 17, color: '#475467', lineHeight: 1.55, maxWidth: 520 },
  introCount: { fontSize: 15, fontWeight: 700, color: '#15803D', background: '#EAF7EE', padding: '10px 18px', borderRadius: 999, marginTop: 6 },
  swipeHint: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#98A2B3', fontWeight: 600, marginTop: 18 },

  pepNumero: { fontSize: 14, fontWeight: 700, color: '#98A2B3', marginBottom: 8 },
  pepTopo: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  pepIcon: { width: 66, height: 66, borderRadius: 16, background: '#F2F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', overflow: 'hidden' },
  pepIconBig: { width: 104, height: 104, borderRadius: 24, background: '#F2F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', overflow: 'hidden' },
  pepIconImg: { width: '100%', height: '100%', objectFit: 'cover' },
  pepBadge: { fontSize: 13, fontWeight: 800, padding: '7px 14px', borderRadius: 999 },
  pepNome: { fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', margin: 0, lineHeight: 1.1 },
  pepMec: { fontSize: 16, color: '#667085', lineHeight: 1.45, marginTop: 6 },
  doseGrande: { background: '#F7FAF8', border: '1px solid #E3F0E8', borderRadius: 18, padding: '18px 20px', marginTop: 14, textAlign: 'center' },
  doseLbl: { fontSize: 13, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '.06em' },
  doseVal: { fontSize: 34, fontWeight: 800, marginTop: 4, color: '#0B7A3B' },
  doseUI: { fontSize: 19, fontWeight: 800, color: '#15803D', marginTop: 4 },
  doseInfo: { fontSize: 15, color: '#667085', marginTop: 6 },

  // Resultado vertical (protocolo completo)
  resScroll: { flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '18px 22px 40px' },
  resHead: { marginBottom: 16 },
  resTit: { fontSize: 30, fontWeight: 800, letterSpacing: '-.02em', margin: '10px 0 0', lineHeight: 1.12 },
  pepCardV: { background: '#fff', border: '1px solid #ECECEC', borderRadius: 20, padding: 18, marginBottom: 14 },
  pepTopoV: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 },
  pepNomeV: { fontWeight: 800, fontSize: 21, letterSpacing: '-.02em', lineHeight: 1.15 },
  pepMecV: { fontSize: 14.5, color: '#667085', lineHeight: 1.4, marginTop: 3 },
  specsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 },
  specCell: { background: '#F7F9F8', border: '1px solid #EEF0EF', borderRadius: 12, padding: '10px 14px' },
  specL: { fontSize: 11.5, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '.04em' },
  specV: { fontSize: 15.5, fontWeight: 700, marginTop: 3, color: '#0E1113' },
  orientTit: { fontWeight: 800, fontSize: 18, letterSpacing: '-.01em', marginBottom: 4 },
  pdfHint: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, color: '#98A2B3', fontWeight: 600, marginTop: 6, maxWidth: 420, lineHeight: 1.4, justifyContent: 'center' },
  pepBloco: { background: '#F0FAF3', borderRadius: 16, padding: '14px 16px', fontSize: 16, color: '#344054', lineHeight: 1.5, marginTop: 12 },
  pepBlocoTit: { display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '.04em', color: '#15803D', marginBottom: 6 },

  aviso: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', borderRadius: 14, padding: '14px 16px', fontSize: 15, lineHeight: 1.5, marginBottom: 12 },
  bloqueado: { textAlign: 'center', color: '#16A34A', background: '#fff', border: '1px solid #ECECEC', borderRadius: 18, padding: '36px 24px', fontSize: 16, maxWidth: 460, margin: '0 auto' },
  novoBtn: { width: '100%', marginTop: 24, padding: '18px', borderRadius: 16, background: '#fff', border: '1px solid #E4E4E4', color: '#344054', fontFamily: 'inherit', fontSize: 17, fontWeight: 700, cursor: 'pointer' },

  navRow: { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: 18, borderTop: '1px solid #EDEDED', background: '#FBFBFA' },
  navBtn: { width: 60, height: 60, flexShrink: 0, borderRadius: 16, border: '1px solid #E4E4E4', background: '#fff', color: '#344054', fontSize: 28, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navProximo: { flex: 1, padding: '20px', borderRadius: 16, background: VERDE, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 19, fontWeight: 800, cursor: 'pointer' },

  // Receber
  receberTit: { fontWeight: 800, fontSize: 24, letterSpacing: '-.01em' },
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
