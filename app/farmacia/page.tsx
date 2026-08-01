// ════════════════════════════════════════════════
//  NUVITA — app/farmacia/page.tsx
//  Balcão de farmácia (novo design): landing → wizard de 5 etapas →
//  protocolo. Full page, com rodapé "Continuar" fixo nas etapas.
//  Toda a lógica (IA, estoque, WhatsApp, PT/ES) é reaproveitada.
// ════════════════════════════════════════════════

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ObjectiveKey, Peptide } from '@/types';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import PinGate, { ESTOQUE_KEY, OK_KEY, NOME_KEY, CODE_KEY } from '@/components/farmacia/PinGate';
import Icon from '@/components/farmacia/Icon';
import TabelaFarmacia from '@/components/farmacia/TabelaFarmacia';
import CalculadoraPeptideo from '@/components/farmacia/CalculadoraPeptideo';
import { tf, IDIOMA_KEY, type Lang } from '@/lib/farmaciaI18n';
import { HERO_IMG, OBJ_IMG, pepImg } from '@/lib/farmaciaAssets';
import {
  recomendarPeptideos,
  diagnosticarComIA,
  protocoloUmPeptideo,
  diagnosticarUmPeptideoIA,
  montarMensagemWhatsApp,
  calcularIMC,
  ALL_PEPTIDES,
  type RespostasFarmacia,
  type NivelFarmacia,
  type AtividadeFarmacia,
  type SonoFarmacia,
  type CondicaoSaude,
  type Recomendacao,
} from '@/lib/recomendarPeptideos';

type Tela = 'home' | 'diagnostico' | 'unico' | 'catalogo' | 'calculadora';
type Pais = 'BR' | 'PY';

const PAISES: Record<Pais, { ddi: string; flag: string; max: number; ph: string }> = {
  BR: { ddi: '55', flag: '🇧🇷', max: 11, ph: '(11) 99999-9999' },
  PY: { ddi: '595', flag: '🇵🇾', max: 10, ph: '0981 234 567' },
};

// le = label (es); de = desc (es); cor = cor da categoria (ícone)
const OBJETIVOS: { key: ObjectiveKey; label: string; le: string; icon: string; desc: string; de: string; cor: string }[] = [
  { key: 'gordura', label: 'Emagrecer', le: 'Adelgazar', icon: 'flame', cor: '#EA580C', desc: 'Perder gordura e controlar o apetite', de: 'Perder grasa y controlar el apetito' },
  { key: 'massa', label: 'Ganhar massa', le: 'Ganar masa', icon: 'dumbbell', cor: '#2563EB', desc: 'Mais massa muscular e força', de: 'Más masa muscular y fuerza' },
  { key: 'pele', label: 'Pele / anti-idade', le: 'Piel / antiedad', icon: 'sparkle', cor: '#EC4899', desc: 'Colágeno, viço e rejuvenescimento', de: 'Colágeno, frescura y rejuvenecimiento' },
  { key: 'cognitivo', label: 'Foco / cognição', le: 'Enfoque / cognición', icon: 'focus', cor: '#7C3AED', desc: 'Memória, concentração e clareza', de: 'Memoria, concentración y claridad' },
  { key: 'longevidade', label: 'Longevidade / energia', le: 'Longevidad / energía', icon: 'bolt', cor: '#16A34A', desc: 'Mais disposição e vitalidade', de: 'Más disposición y vitalidad' },
  { key: 'sono', label: 'Dormir melhor', le: 'Dormir mejor', icon: 'moon', cor: '#4F46E5', desc: 'Sono profundo e recuperação', de: 'Sueño profundo y recuperación' },
  { key: 'recuperacao', label: 'Recuperação / lesões', le: 'Recuperación / lesiones', icon: 'refresh', cor: '#0EA5E9', desc: 'Acelerar o reparo e reduzir a dor', de: 'Acelerar la reparación y reducir el dolor' },
  { key: 'hormonal', label: 'Libido / hormonal', le: 'Libido / hormonal', icon: 'flask', cor: '#E11D48', desc: 'Libido e equilíbrio hormonal', de: 'Libido y equilibrio hormonal' },
];

// Cor por ferramenta da home
const TOOL_COR: Record<string, string> = { diagnostico: '#16A34A', unico: '#7C3AED', catalogo: '#2563EB', calculadora: '#D97706' };
// Converte hex + alpha → rgba
const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const NIVEIS: { key: NivelFarmacia; label: string; le: string; sub: string; se: string; icon: string; cor: string }[] = [
  { key: 'iniciante', label: 'Nunca usou', le: 'Nunca usó', sub: 'Primeira vez', se: 'Primera vez', icon: 'sparkle', cor: '#16A34A' },
  { key: 'intermediario', label: 'Já usou', le: 'Ya usó', sub: 'Alguma experiência', se: 'Algo de experiencia', icon: 'refresh', cor: '#2563EB' },
  { key: 'avancado', label: 'Usa sempre', le: 'Usa siempre', sub: 'Experiente', se: 'Experto', icon: 'bolt', cor: '#7C3AED' },
];

const ATIVIDADES: { key: AtividadeFarmacia; label: string; le: string; sub: string; se: string; icon: string; cor: string }[] = [
  { key: 'sedentario', label: 'Sedentário', le: 'Sedentario', sub: 'Pouco exercício', se: 'Poco ejercicio', icon: 'moon', cor: '#D97706' },
  { key: 'moderado', label: 'Moderado', le: 'Moderado', sub: 'Treina 1–3x/sem', se: 'Entrena 1–3x/sem', icon: 'dumbbell', cor: '#16A34A' },
  { key: 'ativo', label: 'Ativo', le: 'Activo', sub: 'Treina 4–5x/sem', se: 'Entrena 4–5x/sem', icon: 'pulse', cor: '#2563EB' },
  { key: 'muito_ativo', label: 'Muito ativo', le: 'Muy activo', sub: 'Treina 6–7x/sem', se: 'Entrena 6–7x/sem', icon: 'bolt', cor: '#EA580C' },
];

const SONOS: { key: SonoFarmacia; label: string; le: string; icon: string; cor: string }[] = [
  { key: 'ruim', label: 'Ruim', le: 'Malo', icon: 'drop', cor: '#EC4899' },
  { key: 'regular', label: 'Regular', le: 'Regular', icon: 'pulse', cor: '#16A34A' },
  { key: 'bom', label: 'Bom', le: 'Bueno', icon: 'moon', cor: '#4F46E5' },
];

// Cor + ícone dos cabeçalhos de seção da etapa 3
const SECAO_ROTINA = {
  nivel: { cor: '#7C3AED', icon: 'flask' },
  atividade: { cor: '#2563EB', icon: 'dumbbell' },
  sono: { cor: '#4F46E5', icon: 'moon' },
};

const CONDICOES: { key: CondicaoSaude; label: string; le: string; icon: string; cor: string }[] = [
  { key: 'nenhuma', label: 'Nenhuma', le: 'Ninguna', icon: 'check', cor: '#16A34A' },
  { key: 'diabetes', label: 'Diabetes', le: 'Diabetes', icon: 'drop', cor: '#2563EB' },
  { key: 'hipertensao', label: 'Pressão alta', le: 'Presión alta', icon: 'heart', cor: '#E11D48' },
  { key: 'tireoide', label: 'Tireoide', le: 'Tiroides', icon: 'pulse', cor: '#0EA5E9' },
  { key: 'cancer', label: 'Histórico de câncer', le: 'Antecedente de cáncer', icon: 'ribbon', cor: '#7C3AED' },
  { key: 'gestacao', label: 'Gestante / amamentando', le: 'Embarazo / lactancia', icon: 'person', cor: '#D97706' },
  { key: 'outros', label: 'Outros', le: 'Otros', icon: 'pencil', cor: '#98A2B3' },
];

const PRIORIDADE_STYLE: Record<string, { bg: string; tx: string; label: string; le: string }> = {
  essencial: { bg: '#DCFCE7', tx: '#15803D', label: 'Essencial', le: 'Esencial' },
  recomendado: { bg: '#FEF3C7', tx: '#B45309', label: 'Recomendado', le: 'Recomendado' },
  opcional: { bg: '#F1F1F1', tx: '#6B7280', label: 'Opcional', le: 'Opcional' },
};

const PASSOS = 5;

export default function FarmaciaPage() {
  const [tela, setTela] = useState<Tela>('home');
  const [passo, setPasso] = useState(1);
  const [peptideoUnico, setPeptideoUnico] = useState('');
  const [catalogoSel, setCatalogoSel] = useState<Peptide | null>(null);
  const [buscaCatalogo, setBuscaCatalogo] = useState('');
  const [estoque, setEstoque] = useState<string[] | null>(null);
  const [objetivos, setObjetivos] = useState<ObjectiveKey[]>([]);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'feminino' | 'ni' | ''>('');
  const [nivel, setNivel] = useState<NivelFarmacia | ''>('');
  const [atividade, setAtividade] = useState<AtividadeFarmacia | ''>('');
  const [sono, setSono] = useState<SonoFarmacia | ''>('');
  const [condicoes, setCondicoes] = useState<CondicaoSaude[]>([]);
  const [condicaoOutros, setCondicaoOutros] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [pais, setPais] = useState<Pais>('BR');
  const [idioma, setIdioma] = useState<Lang>('pt');
  const [rec, setRec] = useState<Recomendacao | null>(null);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviarErro, setEnviarErro] = useState('');

  const modo = tela === 'unico' ? 'unico' : 'completo';
  const imc = useMemo(() => calcularIMC(Number(peso), Number(altura)), [peso, altura]);
  const t = (pt: string, es: string) => tf(idioma, pt, es);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ESTOQUE_KEY);
      if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr)) setEstoque(arr); }
      const idi = sessionStorage.getItem(IDIOMA_KEY);
      if (idi === 'es' || idi === 'pt') setIdioma(idi);
    } catch { /* ignore */ }
    try {
      const codigo = sessionStorage.getItem(CODE_KEY);
      if (codigo) {
        fetch('/api/farmacia/estoque', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get', codigo }) })
          .then((r) => r.json())
          .then((data) => { if (data?.found && Array.isArray(data.peptideos)) { setEstoque(data.peptideos); try { sessionStorage.setItem(ESTOQUE_KEY, JSON.stringify(data.peptideos)); } catch { /* */ } } })
          .catch(() => { /* cache */ });
      }
    } catch { /* ignore */ }
  }, []);

  const trocarIdioma = (l: Lang) => { setIdioma(l); try { sessionStorage.setItem(IDIOMA_KEY, l); } catch { /* */ } };

  const peptidesDisponiveis = useMemo(
    () => (estoque && estoque.length ? ALL_PEPTIDES.filter((p) => estoque.includes(p.n)) : ALL_PEPTIDES),
    [estoque],
  );

  const respostas = useMemo<RespostasFarmacia | null>(() => {
    const objetivoOk = modo === 'unico' ? !!peptideoUnico : objetivos.length > 0;
    if (!objetivoOk || !nivel) return null;
    return {
      nome: nome.trim() || 'Paciente', telefone: telefone.trim(), sexo: sexo || undefined,
      objetivos, nivel: nivel as NivelFarmacia, condicoes: condicoes.length ? condicoes : ['nenhuma'],
      condicaoOutros: condicaoOutros.trim() || undefined, peso: peso ? Number(peso) : undefined,
      altura: altura ? Number(altura) : undefined, idade: idade ? Number(idade) : undefined,
      atividade: atividade || undefined, sono: sono || undefined,
    };
  }, [modo, peptideoUnico, nome, telefone, sexo, objetivos, nivel, condicoes, condicaoOutros, peso, altura, idade, atividade, sono]);

  const toggleObjetivo = (k: ObjectiveKey) => setObjetivos((p) => p.includes(k) ? p.filter((o) => o !== k) : p.length >= 3 ? p : [...p, k]);
  const toggleCondicao = (k: CondicaoSaude) => setCondicoes((prev) => {
    if (k === 'nenhuma') return prev.includes('nenhuma') ? [] : ['nenhuma'];
    const semN = prev.filter((c) => c !== 'nenhuma');
    const jaTem = semN.includes(k);
    if (k === 'outros' && jaTem) setCondicaoOutros('');
    return jaTem ? semN.filter((c) => c !== k) : [...semN, k];
  });

  // Validação por etapa (para liberar o "Continuar")
  const etapaValida = (n: number): boolean => {
    if (n === 1) return modo === 'unico' ? !!peptideoUnico : objetivos.length > 0;
    if (n === 2) return !!peso && Number(peso) >= 30 && Number(peso) <= 300 && !!altura && Number(altura) >= 120 && Number(altura) <= 230 && !!idade && Number(idade) >= 16 && Number(idade) <= 100;
    if (n === 3) return !!nivel && !!atividade && !!sono;
    if (n === 4) return !(condicoes.includes('outros') && !condicaoOutros.trim());
    return true;
  };

  const avancar = () => {
    setErro('');
    if (!etapaValida(passo)) return setErro(t('Preencha esta etapa para continuar.', 'Complete esta etapa para continuar.'));
    if (passo < PASSOS) { setPasso(passo + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else gerar();
  };
  const voltar = () => { setErro(''); if (passo > 1) setPasso(passo - 1); else irHome(); };

  const irHome = () => { setTela('home'); setPasso(1); setRec(null); };
  const iniciar = (tl: Tela) => { novoAtendimento(false); setTela(tl); setPasso(1); };

  // Chave dos dados que definem o protocolo (para reaproveitar o prefetch).
  const chaveAtual = () => JSON.stringify({ modo, peptideoUnico, objetivos, peso, altura, idade, sexo, nivel, atividade, sono, condicoes, condicaoOutros, idioma });

  // Gera o protocolo (busca estoque fresco + IA com fallback). NÃO mexe no estado
  // de UI — devolve a recomendação. É o que roda no prefetch e no gerar().
  const gerarInterno = async (): Promise<Recomendacao | null> => {
    const r = respostas;
    if (!r) return null;
    let estoqueAtual = estoque;
    try {
      const codigo = sessionStorage.getItem(CODE_KEY);
      if (codigo) {
        const res = await fetch('/api/farmacia/estoque', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get', codigo }) });
        const data = await res.json().catch(() => ({}));
        if (data?.found && Array.isArray(data.peptideos)) { estoqueAtual = data.peptideos; setEstoque(data.peptideos); try { sessionStorage.setItem(ESTOQUE_KEY, JSON.stringify(data.peptideos)); } catch { /* */ } }
      }
    } catch { /* cache */ }
    if (modo === 'unico') {
      let res = await diagnosticarUmPeptideoIA(r, peptideoUnico, idioma);
      if (!res) res = protocoloUmPeptideo(r, peptideoUnico);
      return res;
    }
    let res = await diagnosticarComIA(r, estoqueAtual, idioma);
    if (!res || (res.itens.length === 0 && !res.bloqueado)) res = recomendarPeptideos(r, estoqueAtual);
    return res;
  };

  // Prefetch: começa a gerar já na etapa de revisão (etapa 5), enquanto o
  // atendente confere. Ao clicar "Gerar", o resultado já está pronto (ou quase).
  const prefetch = useRef<{ chave: string; promise: Promise<Recomendacao | null> } | null>(null);
  const dispararPrefetch = () => {
    if (!respostas) return;
    const chave = chaveAtual();
    if (prefetch.current?.chave === chave) return; // já em andamento p/ os mesmos dados
    prefetch.current = { chave, promise: gerarInterno().catch(() => null) };
  };
  useEffect(() => {
    if ((tela === 'diagnostico' || tela === 'unico') && passo === PASSOS && !rec && respostas) dispararPrefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo, tela]);

  const gerar = async () => {
    setErro(''); setEnviado(false);
    setGerando(true);
    const chave = chaveAtual();
    let promise: Promise<Recomendacao | null>;
    if (prefetch.current?.chave === chave) promise = prefetch.current.promise; // usa o que já foi disparado
    else { promise = gerarInterno().catch(() => null); prefetch.current = { chave, promise }; }
    let resultado = await promise;
    // Se o prefetch falhou por algum motivo, gera na hora (nunca deixa vazio).
    if (!resultado) resultado = await gerarInterno();
    setRec(resultado);
    setGerando(false);
    prefetch.current = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const enviarProtocolo = async () => {
    if (!respostas || !rec) return;
    setEnviarErro('');
    if (!nome.trim()) return setEnviarErro(t('Preencha o nome da pessoa.', 'Complete el nombre de la persona.'));
    const telFull = telefoneE164();
    if (telFull.length < 12) return setEnviarErro(t('Informe um WhatsApp válido com DDD.', 'Ingrese un WhatsApp válido con código.'));
    setEnviando(true);
    const rComContato = { ...respostas, nome: nome.trim(), telefone: telFull };
    const msg = montarMensagemWhatsApp(rComContato, rec);
    try {
      await fetch('/api/farmacia/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: rComContato.nome, telefone: rComContato.telefone, sexo: rComContato.sexo, objetivos: rComContato.objetivos,
          nivel: rComContato.nivel, condicoes: rComContato.condicoes, condicaoOutros: rComContato.condicaoOutros,
          peso: rComContato.peso, altura: rComContato.altura, idade: rComContato.idade, atividade: rComContato.atividade,
          sono: rComContato.sono, peptideos: rec.itens.map((i) => i.peptide.n),
        }),
      });
    } catch { /* silencioso */ }
    try {
      const res = await fetch('/api/farmacia/enviar-whatsapp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone: rComContato.telefone, mensagem: msg, nome: rComContato.nome }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) setEnviado(true);
      else setEnviarErro(data?.error || t('Não foi possível enviar automaticamente.', 'No se pudo enviar automáticamente.'));
    } catch { setEnviarErro(t('Erro de conexão ao enviar.', 'Error de conexión al enviar.')); }
    finally { setEnviando(false); }
  };

  const abrirWhatsAppManual = () => {
    if (!rec) return;
    const tel = telefoneE164();
    const rComContato = { ...respostas!, nome: nome.trim() || 'Paciente', telefone: tel };
    const msg = montarMensagemWhatsApp(rComContato, rec);
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const novoAtendimento = (voltarHome = true) => {
    setPeptideoUnico(''); setObjetivos([]); setPeso(''); setAltura(''); setIdade(''); setSexo('');
    setNivel(''); setAtividade(''); setSono(''); setCondicoes([]); setCondicaoOutros('');
    setNome(''); setTelefone(''); setRec(null); setErro(''); setEnviado(false); setGerando(false);
    setEnviando(false); setEnviarErro(''); setPasso(1);
    if (voltarHome) { setTela('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const onTelefone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, PAISES[pais].max);
    let out = d;
    if (pais === 'BR') { if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`; if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; }
    else { if (d.length > 4) out = `${d.slice(0, 4)} ${d.slice(4)}`; if (d.length > 7) out = `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`; }
    setTelefone(out);
  };
  const trocarPais = (p: Pais) => { setPais(p); setTelefone(''); setEnviarErro(''); };
  const telefoneE164 = () => { let d = telefone.replace(/\D/g, ''); if (pais === 'PY') { d = d.replace(/^0+/, ''); return '595' + d; } if (!d.startsWith('55')) d = '55' + d; return d; };

  const ultimoMutado = useRef('');
  const prepararWhatsApp = () => {
    const tel = telefoneE164();
    if (tel.length < 12 || ultimoMutado.current === tel) return;
    ultimoMutado.current = tel;
    fetch('/api/farmacia/preparar-whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ telefone: tel }) }).catch(() => {});
  };

  const sair = () => {
    try { sessionStorage.removeItem(OK_KEY); sessionStorage.removeItem(ESTOQUE_KEY); sessionStorage.removeItem(NOME_KEY); sessionStorage.removeItem(CODE_KEY); } catch { /* */ }
    window.location.reload();
  };
  const recarregar = () => window.location.reload();
  const soNumero = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);

  const emWizard = (tela === 'diagnostico' || tela === 'unico') && !rec;
  const pct = Math.round((passo / PASSOS) * 100);

  return (
    <PinGate>
      <div style={S.page}>
        {/* ─── Header ─── */}
        <header style={S.header}>
          <div style={S.headerIn}>
            <button onClick={irHome} style={S.brandBtn} aria-label="Início">
              <NuvitaLogo width={104} height={22} />
              <span style={S.brandTag}>Balcão</span>
            </button>
            <div style={S.headerRight}>
              <div style={S.langWrap} role="group" aria-label="Idioma">
                <button onClick={() => trocarIdioma('pt')} style={{ ...S.langBtn, ...(idioma === 'pt' ? S.langBtnOn : {}) }}>PT</button>
                <button onClick={() => trocarIdioma('es')} style={{ ...S.langBtn, ...(idioma === 'es' ? S.langBtnOn : {}) }}>ES</button>
              </div>
              <button onClick={recarregar} style={S.iconBtn} title={t('Atualizar', 'Actualizar')}><Icon name="refresh" size={18} /></button>
              <button onClick={sair} style={S.sairBtn}>⤶ {t('Sair', 'Salir')}</button>
            </div>
          </div>
          {emWizard && (
            <div style={S.progressWrap}>
              <div style={S.progressTop}>
                <span style={{ color: '#667085', fontWeight: 600 }}>{t('Seu progresso', 'Tu progreso')}</span>
                <span style={{ color: '#16A34A', fontWeight: 800 }}>{pct}%</span>
                <span style={{ color: '#98A2B3', fontWeight: 600 }}>{t('Etapa', 'Etapa')} {passo} {t('de', 'de')} {PASSOS}</span>
              </div>
              <div style={S.progressBar}><div style={{ ...S.progressFill, width: `${pct}%` }} /></div>
            </div>
          )}
        </header>

        {/* ─── Conteúdo ─── */}
        <main style={S.main}>
          {tela === 'home' && <Home t={t} onStart={iniciar} />}

          {emWizard && (
            <div style={S.wrapCol}>
              {passo === 1 && modo === 'completo' && (
                <StepCard n={1} titulo={t('Qual o objetivo?', '¿Cuál es el objetivo?')} sub={t('Escolha até 3 — quanto mais preciso, melhor o protocolo.', 'Elige hasta 3 — cuanto más preciso, mejor el protocolo.')}>
                  <div style={S.objGrid}>
                    {OBJETIVOS.map((o) => {
                      const on = objetivos.includes(o.key);
                      return (
                        <button key={o.key} onClick={() => toggleObjetivo(o.key)} style={{ ...S.objCard, ...(on ? S.objCardOn : {}) }}>
                          <div style={S.objImgWrap}>
                            <img src={OBJ_IMG[o.key]} alt="" style={S.objImg} />
                            <span style={{ ...S.radio, ...(on ? S.radioOn : {}) }}>{on ? '✓' : ''}</span>
                          </div>
                          <div style={S.objBody}>
                            <div style={S.objTitle}>
                              <span style={{ ...S.objIcon, background: alpha(o.cor, 0.1), color: o.cor }}><Icon name={o.icon} size={14} /></span>
                              {idioma === 'es' ? o.le : o.label}
                            </div>
                            <div style={S.objDesc}>{idioma === 'es' ? o.de : o.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </StepCard>
              )}

              {passo === 1 && modo === 'unico' && (
                <StepCard n={1} titulo={t('Qual peptídeo a pessoa usa?', '¿Qué péptido usa la persona?')} sub={t('Escolha 1 para montar o protocolo dele.', 'Elige 1 para armar su protocolo.')}>
                  <div style={S.pepGrid}>
                    {peptidesDisponiveis.map((p) => {
                      const on = peptideoUnico === p.n;
                      const img = pepImg(p.n);
                      return (
                        <button key={p.n} onClick={() => setPeptideoUnico(p.n)} style={{ ...S.pepChip, ...(on ? S.pepChipOn : {}) }}>
                          <span style={S.pepThumb}>{img ? <img src={img} alt="" style={S.pepThumbImg} /> : <Icon name="pill" size={18} />}</span>
                          <span style={{ fontWeight: 600, fontSize: 14, flex: 1, textAlign: 'left' }}>{p.n}</span>
                        </button>
                      );
                    })}
                  </div>
                </StepCard>
              )}

              {passo === 2 && (
                <StepCard n={2} titulo={t('Conte um pouco sobre você', 'Cuéntanos un poco sobre ti')} sub={t('Usamos peso, altura e idade para calcular a dose certa.', 'Usamos peso, altura y edad para calcular la dosis correcta.')}>
                  <div style={S.grid3}>
                    <Campo label={t('Peso', 'Peso')} unidade="kg" icon="pulse" cor="#16A34A"><input className="inp" placeholder="75" inputMode="numeric" value={peso} onChange={(e) => setPeso(soNumero(e.target.value, 3))} style={S.inp} /></Campo>
                    <Campo label={t('Altura', 'Altura')} unidade="cm" icon="bolt" cor="#2563EB"><input className="inp" placeholder="175" inputMode="numeric" value={altura} onChange={(e) => setAltura(soNumero(e.target.value, 3))} style={S.inp} /></Campo>
                    <Campo label={t('Idade', 'Edad')} unidade={t('anos', 'años')} icon="sparkle" cor="#D97706"><input className="inp" placeholder="34" inputMode="numeric" value={idade} onChange={(e) => setIdade(soNumero(e.target.value, 3))} style={S.inp} /></Campo>
                  </div>
                  {imc && <div style={S.imcBox}><b style={{ color: '#0E1113' }}>IMC {imc.valor}</b> <span style={{ color: '#667085' }}>· {imc.classe}</span></div>}
                  <div style={S.divisor} />
                  <SecaoTitulo cor="#EC4899" icon="person">{t('Sexo', 'Sexo')} <span style={{ ...S.opcional, marginLeft: 6 }}>{t('opcional', 'opcional')}</span></SecaoTitulo>
                  <div style={S.grid2}>
                    {[{ k: 'masculino', l: t('Masculino', 'Masculino'), cor: '#16A34A' }, { k: 'feminino', l: t('Feminino', 'Femenino'), cor: '#EC4899' }, { k: 'ni', l: t('Prefiro não dizer', 'Prefiero no decir'), cor: '#98A2B3' }].map((o) => {
                      const on = sexo === o.k;
                      return (
                        <button key={o.k} onClick={() => setSexo(on ? '' : o.k as any)} style={{ ...S.condCard, ...(on ? S.condCardOn : {}) }}>
                          <span style={{ ...S.condIcon, background: alpha(o.cor, 0.1), color: o.cor }}><Icon name="person" size={16} /></span>
                          <span style={{ fontWeight: 600, fontSize: 14.5, flex: 1 }}>{o.l}</span>
                          <span style={{ ...S.opRadio, position: 'static', ...(on ? S.opRadioOn : {}) }}>{on ? '✓' : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                </StepCard>
              )}

              {passo === 3 && (
                <StepCard n={3} titulo={t('Como é a sua rotina hoje?', '¿Cómo es tu rutina hoy?')} sub={t('Experiência, treino e sono mudam bastante a recomendação.', 'Experiencia, entreno y sueño cambian bastante la recomendación.')}>
                  <SecaoTitulo cor={SECAO_ROTINA.nivel.cor} icon={SECAO_ROTINA.nivel.icon}>{t('Já usou peptídeos antes?', '¿Ya usaste péptidos antes?')}</SecaoTitulo>
                  <div style={S.grid3}>
                    {NIVEIS.map((o) => (
                      <OpcaoCard key={o.key} on={nivel === o.key} onClick={() => setNivel(o.key)} cor={o.cor} icon={o.icon}
                        label={idioma === 'es' ? o.le : o.label} sub={idioma === 'es' ? o.se : o.sub} />
                    ))}
                  </div>
                  <div style={S.divisor} />
                  <SecaoTitulo cor={SECAO_ROTINA.atividade.cor} icon={SECAO_ROTINA.atividade.icon}>{t('Como é a atividade física?', '¿Cómo es la actividad física?')}</SecaoTitulo>
                  <div style={S.grid4}>
                    {ATIVIDADES.map((o) => (
                      <OpcaoCard key={o.key} on={atividade === o.key} onClick={() => setAtividade(atividade === o.key ? '' : o.key)} cor={o.cor} icon={o.icon}
                        label={idioma === 'es' ? o.le : o.label} sub={idioma === 'es' ? o.se : o.sub} />
                    ))}
                  </div>
                  <div style={S.divisor} />
                  <SecaoTitulo cor={SECAO_ROTINA.sono.cor} icon={SECAO_ROTINA.sono.icon}>{t('E o sono, como anda?', '¿Y el sueño, cómo va?')}</SecaoTitulo>
                  <div style={S.grid3}>
                    {SONOS.map((o) => (
                      <OpcaoCard key={o.key} on={sono === o.key} onClick={() => setSono(sono === o.key ? '' : o.key)} cor={o.cor} icon={o.icon}
                        label={idioma === 'es' ? o.le : o.label} />
                    ))}
                  </div>
                </StepCard>
              )}

              {passo === 4 && (
                <StepCard n={4} titulo={t('Alguma condição de saúde?', '¿Alguna condición de salud?')} sub={t('Só para checar segurança antes de sugerir qualquer coisa.', 'Solo para verificar seguridad antes de sugerir algo.')}>
                  <div style={S.grid3}>
                    {CONDICOES.map((o) => {
                      const on = condicoes.includes(o.key);
                      return (
                        <button key={o.key} onClick={() => toggleCondicao(o.key)} style={{ ...S.condCard, ...(on ? S.condCardOn : {}) }}>
                          <span style={{ ...S.condIcon, background: alpha(o.cor, 0.1), color: o.cor }}><Icon name={o.icon} size={16} /></span>
                          <span style={{ fontWeight: 600, fontSize: 14.5, flex: 1 }}>{idioma === 'es' ? o.le : o.label}</span>
                          <span style={{ ...S.opRadio, position: 'static', ...(on ? S.opRadioOn : {}) }}>{on ? '✓' : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                  {condicoes.includes('outros') && (
                    <input className="inp" placeholder={t('Qual condição? (ex.: problema renal, alergia…)', '¿Qué condición? (ej.: problema renal, alergia…)')} value={condicaoOutros} onChange={(e) => setCondicaoOutros(e.target.value.slice(0, 120))} style={{ ...S.inp, marginTop: 14 }} autoFocus />
                  )}
                  <div style={S.confid}>
                    <span style={S.confidIcon}><Icon name="check" size={16} /></span>
                    <div><b style={{ color: '#0B4A26' }}>{t('Suas respostas são confidenciais', 'Tus respuestas son confidenciales')}</b><div style={{ fontSize: 13, color: '#5B7A64', marginTop: 2 }}>{t('Usamos essas informações só para checar segurança e sugerir o protocolo certo. Nada é compartilhado.', 'Usamos esta información solo para verificar seguridad y sugerir el protocolo correcto. Nada se comparte.')}</div></div>
                  </div>
                </StepCard>
              )}

              {passo === 5 && (
                <StepCard n={5} titulo={t('Tudo certo?', '¿Todo bien?')} sub={t('Confira as respostas antes de gerar o protocolo.', 'Revisa las respuestas antes de generar el protocolo.')}>
                  <div style={S.review}>
                    <RevRow icon="focus" cor="#EA580C" label={t('Objetivo', 'Objetivo')} valor={modo === 'unico' ? peptideoUnico : objetivos.map((k) => { const o = OBJETIVOS.find((x) => x.key === k)!; return idioma === 'es' ? o.le : o.label; }).join(', ')} onEdit={() => setPasso(1)} t={t} />
                    <RevRow icon="person" cor="#2563EB" label={t('Perfil', 'Perfil')} valor={`${peso} kg · ${altura} cm · ${idade} ${t('anos', 'años')}`} onEdit={() => setPasso(2)} t={t} />
                    <RevRow icon="flask" cor="#7C3AED" label={t('Experiência', 'Experiencia')} valor={nivel ? (idioma === 'es' ? NIVEIS.find((x) => x.key === nivel)!.le : NIVEIS.find((x) => x.key === nivel)!.label) : '—'} onEdit={() => setPasso(3)} t={t} />
                    <RevRow icon="dumbbell" cor="#0EA5E9" label={t('Rotina', 'Rutina')} valor={[atividade && (idioma === 'es' ? ATIVIDADES.find((x) => x.key === atividade)!.le : ATIVIDADES.find((x) => x.key === atividade)!.label), sono && `${t('sono', 'sueño')} ${idioma === 'es' ? SONOS.find((x) => x.key === sono)!.le.toLowerCase() : SONOS.find((x) => x.key === sono)!.label.toLowerCase()}`].filter(Boolean).join(' · ') || '—'} onEdit={() => setPasso(3)} t={t} />
                    <RevRow icon="check" cor="#16A34A" label={t('Saúde', 'Salud')} valor={condicoes.length ? condicoes.map((k) => { const c = CONDICOES.find((x) => x.key === k)!; return idioma === 'es' ? c.le : c.label; }).join(', ') : t('Nenhuma', 'Ninguna')} onEdit={() => setPasso(4)} t={t} last />
                  </div>
                  <div style={S.hintBox}><span style={{ color: '#7C3AED' }}><Icon name="bulb" size={15} /></span> {t('A Nuvita cruza o perfil com o estoque da farmácia e monta o protocolo em poucos segundos.', 'Nuvita cruza el perfil con el stock de la farmacia y arma el protocolo en pocos segundos.')}</div>
                </StepCard>
              )}

              {erro && <div style={S.erro}>⚠️ {erro}</div>}
            </div>
          )}

          {rec && <Resultado
            rec={rec} idioma={idioma} t={t} imc={imc} idade={idade} atividade={atividade}
            nome={nome} setNome={setNome} telefone={telefone} onTelefone={onTelefone} prepararWhatsApp={prepararWhatsApp}
            pais={pais} trocarPais={trocarPais} telefoneE164={telefoneE164}
            enviado={enviado} enviando={enviando} enviarErro={enviarErro} setEnviarErro={setEnviarErro}
            enviarProtocolo={enviarProtocolo} abrirWhatsAppManual={abrirWhatsAppManual} novoAtendimento={() => novoAtendimento(true)}
          />}

          {tela === 'catalogo' && !rec && <Catalogo t={t} idioma={idioma} lista={peptidesDisponiveis} busca={buscaCatalogo} setBusca={setBuscaCatalogo} onSel={setCatalogoSel} onBack={irHome} />}
          {tela === 'calculadora' && !rec && (
            <div style={S.wrapWide}>
              <button onClick={irHome} style={S.voltarTopo}>‹ {t('Voltar', 'Volver')}</button>
              <div style={S.pageHead}><h1 style={S.h1}>{t('Calculadora de peptídeo', 'Calculadora de péptido')}</h1><p style={S.lead}>{t('Quantas unidades puxar na seringa para a dose certa.', 'Cuántas unidades jalar en la jeringa para la dosis correcta.')}</p></div>
              <div style={S.card}><CalculadoraPeptideo lang={idioma} /></div>
            </div>
          )}
        </main>

        {/* ─── Rodapé fixo do wizard (Voltar / Continuar) ─── */}
        {emWizard && (
          <footer style={S.footer}>
            <div style={S.footerIn}>
              <button onClick={voltar} style={S.voltarBtn}>‹ {t('Voltar', 'Volver')}</button>
              <button onClick={avancar} disabled={gerando} style={{ ...S.continuarBtn, opacity: gerando ? 0.7 : 1 }}>
                {gerando ? t('Gerando…', 'Generando…') : passo < PASSOS ? `${t('Continuar', 'Continuar')} →` : `${t('Gerar diagnóstico', 'Generar diagnóstico')} →`}
              </button>
            </div>
          </footer>
        )}
      </div>

      {/* Modal do catálogo */}
      {catalogoSel && <ModalCatalogo p={catalogoSel} t={t} onClose={() => setCatalogoSel(null)} />}
    </PinGate>
  );
}

// ════════════════════════════════════════════════
//  Telas / subcomponentes
// ════════════════════════════════════════════════
function Home({ t, onStart }: { t: (p: string, e: string) => string; onStart: (tl: Tela) => void }) {
  const feats = [t('Recomendação personalizada', 'Recomendación personalizada'), t('Protocolos combinados', 'Protocolos combinados'), t('Cálculo de doses', 'Cálculo de dosis'), t('Catálogo completo', 'Catálogo completo')];
  const tools: { tl: Tela; icon: string; title: string; sub: string }[] = [
    { tl: 'diagnostico', icon: 'search', title: t('Diagnóstico completo', 'Diagnóstico completo'), sub: t('Encontrar os peptídeos ideais', 'Encontrar los péptidos ideales') },
    { tl: 'unico', icon: 'pill', title: t('Um peptídeo só', 'Un solo péptido'), sub: t('Já sabe qual? Faça o protocolo dele', '¿Ya sabe cuál? Arma su protocolo') },
    { tl: 'catalogo', icon: 'clipboard', title: t('Catálogo', 'Catálogo'), sub: t('Ver o que cada produto faz', 'Ver qué hace cada producto') },
    { tl: 'calculadora', icon: 'flask', title: t('Calculadora', 'Calculadora'), sub: t('Dose na seringa (UI)', 'Dosis en la jeringa (UI)') },
  ];
  return (
    <div style={S.wrapWide}>
      <div style={S.hero}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={S.heroPill}><span style={S.dot} /> {t('DIAGNÓSTICO NUVITA', 'DIAGNÓSTICO NUVITA')}</div>
          <h1 style={S.heroTitle}>{t('Descubra o protocolo', 'Descubre el protocolo')} <span style={{ color: '#16A34A' }}>{t('ideal para você', 'ideal para ti')}</span></h1>
          <p style={S.heroLead}>{t('Responda algumas perguntas com o atendente e receba uma recomendação de peptídeos feita para o seu objetivo e o seu perfil.', 'Responde algunas preguntas con el atendedor y recibe una recomendación de péptidos hecha para tu objetivo y tu perfil.')}</p>
          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            {feats.map((f) => <div key={f} style={S.feat}><span style={S.featCheck}>✓</span>{f}</div>)}
          </div>
          <div style={S.tempo}><span style={S.tempoIcon}><Icon name="refresh" size={16} /></span><div><div style={{ fontSize: 12, color: '#667085' }}>{t('Tempo médio', 'Tiempo medio')}</div><div style={{ fontWeight: 700 }}>2 {t('minutos', 'minutos')}</div></div></div>
        </div>
        <div style={S.heroImgWrap}><img src={HERO_IMG} alt="" style={S.heroImg} /></div>
      </div>

      <div style={S.comoRow}><h2 style={S.h2}>{t('Como quer começar?', '¿Cómo quieres empezar?')}</h2><span style={{ fontSize: 13, color: '#98A2B3' }}>{t('4 ferramentas do balcão', '4 herramientas del mostrador')}</span></div>
      <div style={S.toolGrid}>
        {tools.map((tl) => {
          const cor = TOOL_COR[tl.tl] || '#16A34A';
          return (
            <button key={tl.tl} onClick={() => onStart(tl.tl)} style={S.toolCard}>
              <span style={{ ...S.toolIcon, background: alpha(cor, 0.1), color: cor }}><Icon name={tl.icon} size={20} /></span>
              <div style={{ flex: 1, textAlign: 'left' }}><div style={{ fontWeight: 700, fontSize: 16 }}>{tl.title}</div><div style={{ fontSize: 13.5, color: '#98A2B3', marginTop: 2 }}>{tl.sub}</div></div>
              <span style={{ color: '#C0C4CC', fontSize: 20 }}>›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepCard({ n, titulo, sub, children }: { n: number; titulo: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={S.card}>
      <div style={S.etapaBadge}>ETAPA {n}</div>
      <h1 style={S.stepTitle}>{titulo}</h1>
      <p style={S.stepSub}>{sub}</p>
      <div style={{ marginTop: 26 }}>{children}</div>
    </div>
  );
}

function SecaoTitulo({ cor, icon, mt, children }: { cor: string; icon: string; mt?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ ...S.secaoTit, ...(mt ? { marginTop: 22 } : {}) }}>
      <span style={{ ...S.secaoIcon, background: alpha(cor, 0.1), color: cor }}><Icon name={icon} size={14} /></span>
      {children}
    </div>
  );
}

function OpcaoCard({ on, onClick, cor, icon, label, sub }: { on: boolean; onClick: () => void; cor: string; icon: string; label: string; sub?: string }) {
  return (
    <button onClick={onClick} style={{ ...S.opCard, ...(on ? S.opCardOn : {}) }}>
      <span style={{ ...S.opIcon, background: alpha(cor, 0.1), color: cor }}><Icon name={icon} size={16} /></span>
      <span style={{ ...S.opRadio, ...(on ? S.opRadioOn : {}) }}>{on ? '✓' : ''}</span>
      <div style={{ fontWeight: 600, fontSize: 15, marginTop: 12 }}>{label}</div>
      {sub && <div style={S.cardSub}>{sub}</div>}
    </button>
  );
}

function RevRow({ icon, cor, label, valor, onEdit, t, last }: { icon?: string; cor?: string; label: string; valor: string; onEdit: () => void; t: (p: string, e: string) => string; last?: boolean }) {
  return (
    <div style={{ ...S.revRow, ...(last ? { borderBottom: 'none' } : {}) }}>
      {icon && cor && <span style={{ ...S.condIcon, background: alpha(cor, 0.1), color: cor }}><Icon name={icon} size={15} /></span>}
      <span style={S.revLabel}>{label}</span>
      <span style={S.revValor}>{valor || '—'}</span>
      <button onClick={onEdit} style={S.revEdit}>{t('Editar', 'Editar')}</button>
    </div>
  );
}

function Campo({ label, unidade, icon, cor, children }: { label: string; unidade?: string; icon?: string; cor?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={S.campoLabel}>
        {icon && cor && <span style={{ ...S.campoIcon, background: alpha(cor, 0.1), color: cor }}><Icon name={icon} size={13} /></span>}
        {label}{unidade && <span style={{ color: '#98A2B3', fontWeight: 400 }}> · {unidade}</span>}
      </div>
      {children}
    </div>
  );
}

function Spec({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return <div style={{ ...S.spec, ...(destaque ? S.specOn : {}) }}><div style={S.specLabel}>{label}</div><div style={{ ...S.specValor, ...(destaque ? { color: '#0B7A3B' } : {}) }}>{valor}</div></div>;
}

function Resultado(props: any) {
  const { rec, idioma, t, imc, idade, atividade, nome, setNome, telefone, onTelefone, prepararWhatsApp, pais, trocarPais, telefoneE164, enviado, enviando, enviarErro, setEnviarErro, enviarProtocolo, abrirWhatsAppManual, novoAtendimento } = props;
  const perfil = [idade && `${idade} ${t('anos', 'años')}`, imc && `IMC ${imc.valor} (${imc.classe})`, atividade && (idioma === 'es' ? ATIVIDADES.find((a) => a.key === atividade)?.le : ATIVIDADES.find((a) => a.key === atividade)?.label)].filter(Boolean).join(' · ');
  return (
    <div style={S.wrapWide}>
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.iaBadge}><span style={{ ...S.dot, background: '#7C3AED' }} /> {t('DIAGNÓSTICO IA', 'DIAGNÓSTICO IA')}<span style={{ color: '#98A2B3', fontWeight: 500, marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>{perfil}</span></div>
        <h1 style={{ ...S.stepTitle, marginTop: 12 }}>{t('Protocolo sugerido', 'Protocolo sugerido')}</h1>
        {rec.resumo && <p style={{ ...S.stepSub, marginTop: 8 }}>{rec.resumo}</p>}
      </div>

      {rec.avisos?.map((a: string, i: number) => <div key={i} style={S.avisoBox}>{a}</div>)}

      {rec.bloqueado || rec.itens.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ color: '#16A34A', display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="pulse" size={40} /></div>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>{t('Neste caso não é seguro montar um protocolo aqui. Oriente a pessoa a procurar acompanhamento médico antes de qualquer uso.', 'En este caso no es seguro armar un protocolo aquí. Oriente a la persona a buscar acompañamiento médico antes de cualquier uso.')}</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 14 }}>
            {rec.itens.map((it: any) => {
              const pr = PRIORIDADE_STYLE[it.prioridade];
              const ehIa = rec.fonte === 'ia';
              const img = pepImg(it.peptide.n);
              return (
                <div key={it.peptide.n} style={S.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <span style={S.pepIcon}>{img ? <img src={img} alt="" style={S.pepIconImg} /> : <Icon name="pill" size={26} />}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-.02em' }}>{it.peptide.n}</div>
                      <div style={{ fontSize: 13.5, color: '#667085', lineHeight: 1.4 }}>{it.peptide.m}</div>
                    </div>
                    <span style={{ ...S.badge, background: pr.bg, color: pr.tx }}>{idioma === 'es' ? pr.le : pr.label}</span>
                  </div>
                  {it.motivo && <div style={ehIa ? S.whyIa : S.why}><span style={S.blocoTit}><Icon name="bulb" size={13} />{ehIa ? t('Por que para esta pessoa', 'Por qué para esta persona') : t('Por que recomendado', 'Por qué recomendado')}</span>{it.motivo}</div>}
                  {it.comoUsar && <div style={S.comoUsar}><span style={S.blocoTit}><Icon name="clipboard" size={13} />{t('Como usar', 'Cómo usar')}</span>{it.comoUsar}</div>}
                  {it.alternativa && <div style={S.altBox}><span style={S.blocoTit}><Icon name="refresh" size={13} />{t('Comparação / alternativa', 'Comparación / alternativa')}</span>{it.alternativa}</div>}
                  <div style={S.specGrid}>
                    <Spec label={t('Dose', 'Dosis')} valor={it.dose} destaque />
                    <Spec label={t('Frequência', 'Frecuencia')} valor={it.peptide.freq} />
                    <Spec label={t('Quando', 'Cuándo')} valor={it.peptide.timing} />
                    <Spec label={t('Via', 'Vía')} valor={it.peptide.route} />
                    <Spec label={t('Ciclo', 'Ciclo')} valor={it.peptide.cycle} />
                    <Spec label={t('Descanso', 'Descanso')} valor={it.peptide.rest} />
                  </div>
                </div>
              );
            })}
          </div>

          {(rec.orientacaoAlimentar || rec.orientacaoTreino || rec.observacoes || rec.avisoMedico) && (
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {rec.orientacaoAlimentar && <Orientacao icon="fork" titulo={t('Alimentação', 'Alimentación')} texto={rec.orientacaoAlimentar} />}
              {rec.orientacaoTreino && <Orientacao icon="dumbbell" titulo={t('Treino', 'Entrenamiento')} texto={rec.orientacaoTreino} />}
              {rec.observacoes && <Orientacao icon="eye" titulo={t('O que observar', 'Qué observar')} texto={rec.observacoes} />}
              {rec.avisoMedico && <div style={S.disc}>{rec.avisoMedico}</div>}
            </div>
          )}

          {/* Contato / envio */}
          <div style={S.receberCard}>
            {enviado ? (
              <div style={{ textAlign: 'center', padding: '6px 0' }}>
                <div style={{ color: '#16A34A', display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icon name="check" size={30} /></div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{t('Protocolo enviado no WhatsApp!', '¡Protocolo enviado por WhatsApp!')}</div>
                <div style={{ fontSize: 13, color: '#667085', marginTop: 3 }}>{t('Enviamos o PDF para', 'Enviamos el PDF a')} +{telefoneE164()}.</div>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{t('Quer receber o protocolo?', '¿Quiere recibir el protocolo?')}</div>
                <div style={{ fontSize: 13, color: '#667085', marginTop: 3, marginBottom: 14 }}>{t('Se a pessoa tiver interesse, preencha os dados que enviamos o protocolo em PDF direto no WhatsApp dela.', 'Si la persona tiene interés, complete los datos y enviamos el protocolo en PDF a su WhatsApp.')}</div>
                <Campo label={t('Nome da pessoa', 'Nombre de la persona')}><input className="inp" placeholder={t('Nome completo', 'Nombre completo')} value={nome} onChange={(e) => { setEnviarErro(''); setNome(e.target.value); }} style={S.inp} /></Campo>
                <div style={{ marginTop: 12 }}>
                  <Campo label="WhatsApp">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={pais} onChange={(e) => trocarPais(e.target.value as Pais)} style={S.paisSelect}>{(Object.keys(PAISES) as Pais[]).map((p) => <option key={p} value={p}>{PAISES[p].flag} +{PAISES[p].ddi}</option>)}</select>
                      <input className="inp" placeholder={PAISES[pais as Pais].ph} value={telefone} inputMode="numeric" onChange={(e) => { setEnviarErro(''); onTelefone(e.target.value); }} onBlur={prepararWhatsApp} style={{ ...S.inp, flex: 1 }} />
                    </div>
                  </Campo>
                </div>
                {enviarErro && <div style={{ ...S.hint, color: '#B45309', marginTop: 10 }}>{enviarErro} <button onClick={abrirWhatsAppManual} style={S.linkBtn}>{t('Abrir no WhatsApp', 'Abrir en WhatsApp')}</button></div>}
                <button onClick={enviarProtocolo} disabled={enviando} style={{ ...S.waBtn, opacity: enviando ? 0.7 : 1 }}>{enviando ? t('Enviando…', 'Enviando…') : t('Enviar no WhatsApp', 'Enviar por WhatsApp')}</button>
                <button onClick={abrirWhatsAppManual} style={S.waManualBtn}>{t('ou abrir o WhatsApp e enviar manualmente', 'o abrir WhatsApp y enviar manualmente')}</button>
              </>
            )}
          </div>

          <TabelaFarmacia rec={rec} lang={idioma} />
        </>
      )}

      <button onClick={novoAtendimento} style={S.secondaryBtn}>↺ {t('Iniciar novo atendimento', 'Iniciar nueva atención')}</button>
    </div>
  );
}

function Orientacao({ icon, titulo, texto }: { icon: string; titulo: string; texto: string }) {
  return <div style={S.orient}><div style={S.orientTit}><span style={{ color: '#16A34A' }}><Icon name={icon} size={15} /></span>{titulo}</div><div style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, marginTop: 4 }}>{texto}</div></div>;
}

function Catalogo({ t, idioma, lista, busca, setBusca, onSel, onBack }: any) {
  const q = busca.trim().toLowerCase();
  const filtrada = lista.filter((p: Peptide) => !q || p.n.toLowerCase().includes(q) || p.m.toLowerCase().includes(q));
  return (
    <div style={S.wrapWide}>
      <button onClick={onBack} style={S.voltarTopo}>‹ {t('Voltar', 'Volver')}</button>
      <div style={S.pageHead}><h1 style={S.h1}>{t('Catálogo de peptídeos', 'Catálogo de péptidos')}</h1><p style={S.lead}>{t('Toque em um produto para ver o que é, o que faz e como usar.', 'Toca un producto para ver qué es, qué hace y cómo usar.')}</p></div>
      <input className="inp" placeholder={t('Buscar produto…', 'Buscar producto…')} value={busca} onChange={(e) => setBusca(e.target.value)} style={{ ...S.inp, marginBottom: 16 }} />
      <div style={S.catGrid}>
        {filtrada.map((p: Peptide) => {
          const img = pepImg(p.n);
          return (
            <button key={p.n} onClick={() => onSel(p)} style={S.catItem}>
              <span style={S.pepThumb}>{img ? <img src={img} alt="" style={S.pepThumbImg} /> : <Icon name="pill" size={18} />}</span>
              <span style={{ flex: 1, textAlign: 'left' }}><span style={{ fontWeight: 600, fontSize: 14.5, display: 'block' }}>{p.n}</span><span style={{ fontSize: 12, color: '#98A2B3', lineHeight: 1.35 }}>{p.m}</span></span>
              <span style={{ color: '#16A34A', fontSize: 13, fontWeight: 600 }}>{t('Ver', 'Ver')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModalCatalogo({ p, t, onClose }: { p: Peptide; t: (a: string, b: string) => string; onClose: () => void }) {
  const img = pepImg(p.n);
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={S.pepIcon}>{img ? <img src={img} alt="" style={S.pepIconImg} /> : <Icon name="pill" size={24} />}</span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 18 }}>{p.n}</div><div style={{ fontSize: 13, color: '#667085', lineHeight: 1.4 }}>{p.m}</div></div>
          <button onClick={onClose} style={S.modalClose}>✕</button>
        </div>
        {p.why && <div style={S.why}><span style={S.blocoTit}><Icon name="bulb" size={13} /> {t('O que faz', 'Qué hace')}</span>{p.why}</div>}
        <div style={S.comoUsar}><span style={S.blocoTit}><Icon name="clipboard" size={13} /> {t('Como usar', 'Cómo usar')}</span>{p.how}</div>
        <div style={S.specGrid}>
          <Spec label={t('Dose (ref. 75kg)', 'Dosis (ref. 75kg)')} valor={p.doseStr(75)} destaque />
          <Spec label={t('Frequência', 'Frecuencia')} valor={p.freq} />
          <Spec label={t('Quando', 'Cuándo')} valor={p.timing} />
          <Spec label={t('Via', 'Vía')} valor={p.route} />
          <Spec label={t('Ciclo', 'Ciclo')} valor={p.cycle} />
          <Spec label={t('Descanso', 'Descanso')} valor={p.rest} />
        </div>
        <p style={S.disc}>{t('Orientação educacional. Cada organismo reage de forma diferente — considere avaliação profissional.', 'Orientación educativa. Cada organismo reacciona de forma diferente — considere evaluación profesional.')}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
//  Estilos
// ════════════════════════════════════════════════
const CARD_MAX = 820; // largura única de toda a estrutura do balcão (card ~772)
const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAF8', fontFamily: 'inherit', color: '#0E1113' },
  header: { position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,.9)', backdropFilter: 'saturate(180%) blur(12px)', WebkitBackdropFilter: 'saturate(180%) blur(12px)', borderBottom: '1px solid #EFEFEF' },
  headerIn: { maxWidth: CARD_MAX, margin: '0 auto', padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brandBtn: { display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  brandTag: { fontSize: 10.5, color: '#98A2B3', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600, borderLeft: '1px solid #E4E4E4', paddingLeft: 10 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
  langWrap: { display: 'flex', border: '1px solid #E7E7E7', borderRadius: 999, overflow: 'hidden', background: '#fff' },
  langBtn: { padding: '7px 12px', fontSize: 12.5, fontWeight: 700, border: 'none', background: 'transparent', color: '#98A2B3', cursor: 'pointer', fontFamily: 'inherit' },
  langBtnOn: { background: '#16A34A', color: '#fff' },
  iconBtn: { width: 38, height: 38, borderRadius: '50%', background: '#fff', border: '1px solid #E7E7E7', color: '#16A34A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sairBtn: { padding: '9px 16px', borderRadius: 999, background: '#fff', border: '1px solid #E7E7E7', color: '#344054', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' },
  progressWrap: { borderTop: '1px solid #F0F0F0', background: 'rgba(255,255,255,.7)' },
  progressTop: { maxWidth: CARD_MAX, margin: '0 auto', padding: '10px 24px 0', display: 'flex', justifyContent: 'space-between', fontSize: 13 },
  progressBar: { maxWidth: CARD_MAX, margin: '6px auto 10px', padding: '0 24px', height: 6 },
  progressFill: { height: 6, background: '#16A34A', borderRadius: 999, transition: 'width .3s ease' },

  main: { flex: 1, width: '100%' },
  wrapCol: { maxWidth: CARD_MAX, margin: '0 auto', padding: '26px 24px 120px' },
  wrapWide: { maxWidth: CARD_MAX, margin: '0 auto', padding: '26px 24px 48px' },
  pageHead: { marginBottom: 18 },
  voltarTopo: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '9px 16px', borderRadius: 999, background: '#fff', border: '1px solid #E4E4E4', color: '#344054', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 16 },
  h1: { fontSize: 30, fontWeight: 800, letterSpacing: '-.02em' },
  h2: { fontSize: 20, fontWeight: 800, letterSpacing: '-.01em' },
  lead: { fontSize: 15, color: '#667085', marginTop: 6 },

  card: { background: '#fff', border: '1px solid #E3F0E8', borderRadius: 26, padding: 32, boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  etapaBadge: { display: 'inline-block', background: '#E8F5EC', color: '#15803D', fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em', padding: '6px 12px', borderRadius: 999 },
  stepTitle: { fontSize: 30, fontWeight: 800, letterSpacing: '-.02em', marginTop: 14 },
  stepSub: { fontSize: 15, color: '#667085', marginTop: 6, lineHeight: 1.5 },

  // Hero
  hero: { display: 'flex', gap: 30, alignItems: 'center', flexWrap: 'wrap', background: '#fff', border: '1px solid #ECECEC', borderRadius: 28, padding: 34 },
  heroPill: { display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F0FAF3', color: '#15803D', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', padding: '7px 13px', borderRadius: 999 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: '#16A34A', display: 'inline-block' },
  heroTitle: { fontSize: 40, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.08, marginTop: 16 },
  heroLead: { fontSize: 15.5, color: '#667085', lineHeight: 1.6, marginTop: 14, maxWidth: 460 },
  feat: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#344054' },
  featCheck: { width: 22, height: 22, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  tempo: { display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid #ECECEC', borderRadius: 14, padding: '12px 16px', marginTop: 22 },
  tempoIcon: { width: 34, height: 34, borderRadius: 10, background: '#F0FAF3', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heroImgWrap: { flex: 1, minWidth: 280, display: 'flex', justifyContent: 'center' },
  heroImg: { width: '100%', maxWidth: 420, objectFit: 'contain' },

  comoRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 34, marginBottom: 14, gap: 12, flexWrap: 'wrap' },
  toolGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  toolCard: { display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #ECECEC', borderRadius: 18, padding: '20px 22px', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s, box-shadow .15s' },
  toolIcon: { width: 44, height: 44, borderRadius: 12, background: '#F0FAF3', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // Objetivo cards
  objGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
  objCard: { border: '1.5px solid #ECEDEE', borderRadius: 18, background: '#fff', cursor: 'pointer', padding: 10, overflow: 'hidden', fontFamily: 'inherit', textAlign: 'left', transition: 'border-color .15s, box-shadow .15s' },
  objCardOn: { borderColor: '#16A34A', background: '#F5FBF7', boxShadow: '0 0 0 3px rgba(22,163,74,.1)' },
  objImgWrap: { position: 'relative', aspectRatio: '1 / 1', borderRadius: 13, overflow: 'hidden', background: '#F6F7F6' },
  objImg: { width: '100%', height: '100%', objectFit: 'cover' },
  radio: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: '50%', border: '2px solid #D0D5DD', background: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 },
  radioOn: { background: '#16A34A', borderColor: '#16A34A' },
  objBody: { padding: '12px 8px 6px' },
  objTitle: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15.5, color: '#0E1113' },
  objIcon: { width: 26, height: 26, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  objDesc: { fontSize: 12.5, color: '#98A2B3', marginTop: 5, lineHeight: 1.4 },

  // Peptídeo (unico) chips
  pepGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 },
  pepChip: { display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid #ECECEC', borderRadius: 14, background: '#fff', padding: '10px 12px', cursor: 'pointer', fontFamily: 'inherit' },
  pepChipOn: { borderColor: '#16A34A', background: '#F0FAF3', boxShadow: '0 0 0 3px rgba(22,163,74,.1)' },
  pepThumb: { width: 40, height: 40, borderRadius: 10, background: '#F0FAF3', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  pepThumbImg: { width: '100%', height: '100%', objectFit: 'cover' },

  // Inputs / campos
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  campoLabel: { fontSize: 13, fontWeight: 700, color: '#344054', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 7 },
  campoIcon: { width: 24, height: 24, borderRadius: 7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  divisor: { height: 1, background: '#EEF0EF', margin: '28px 0' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  inp: { width: '100%', padding: '14px 16px', fontSize: 16, borderRadius: 14, border: '1px solid #E4E4E4', background: '#fff', fontFamily: 'inherit', color: '#0E1113' },
  imcBox: { marginTop: 12, fontSize: 14, background: '#F6FBF7', border: '1px solid #E1EEE4', borderRadius: 10, padding: '10px 14px' },
  subLabel: { fontSize: 14, fontWeight: 700, color: '#0E1113', marginTop: 20, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 },
  secaoTit: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, color: '#0E1113', marginBottom: 14 },
  secaoIcon: { width: 30, height: 30, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  opCard: { position: 'relative', padding: '16px 14px 14px', borderRadius: 14, border: '1.5px solid #ECEDEE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  opCardOn: { borderColor: '#16A34A', background: '#F5FBF7', boxShadow: '0 0 0 3px rgba(22,163,74,.1)' },
  opIcon: { width: 34, height: 34, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  opRadio: { position: 'absolute', top: 14, right: 14, width: 22, height: 22, borderRadius: '50%', border: '2px solid #D0D5DD', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 },
  opRadioOn: { background: '#16A34A', borderColor: '#16A34A' },
  opcional: { fontSize: 11, fontWeight: 600, color: '#98A2B3', background: '#F2F4F7', padding: '2px 8px', borderRadius: 999 },
  pill: { padding: '13px 14px', borderRadius: 12, border: '1px solid #E7E7E7', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 500, color: '#0E1113', textAlign: 'center' },
  pillCol: { padding: '12px 14px', borderRadius: 12, border: '1px solid #E7E7E7', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' },
  pillOn: { borderColor: '#16A34A', background: '#F0FAF3', boxShadow: '0 0 0 3px rgba(22,163,74,.1)', color: '#0B4A26' },
  cardSub: { fontSize: 12.5, color: '#98A2B3', marginTop: 3 },
  iconCard: { padding: '16px 14px', borderRadius: 14, border: '1.5px solid #ECECEC', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  iconCardOn: { borderColor: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,.1)' },
  iconSq: { width: 38, height: 38, borderRadius: 11, background: '#F2F4F7', color: '#667085', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  iconSqOn: { background: '#DCFCE7', color: '#16A34A' },
  condCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, border: '1.5px solid #ECEDEE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  condCardOn: { borderColor: '#16A34A', background: '#F5FBF7', boxShadow: '0 0 0 3px rgba(22,163,74,.1)' },
  condIcon: { width: 34, height: 34, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  confid: { display: 'flex', gap: 12, alignItems: 'flex-start', background: '#F0FAF3', border: '1px solid #DCEBE1', borderRadius: 14, padding: 16, marginTop: 18 },
  confidIcon: { width: 34, height: 34, borderRadius: 10, background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // Revisão
  review: { border: '1px solid #ECECEC', borderRadius: 16, overflow: 'hidden' },
  revRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid #F0F0F0' },
  revLabel: { fontSize: 13.5, color: '#98A2B3', width: 100, flexShrink: 0 },
  revValor: { fontSize: 15, fontWeight: 700, flex: 1 },
  revEdit: { background: 'none', border: 'none', color: '#16A34A', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  hintBox: { display: 'flex', alignItems: 'center', gap: 10, background: '#F7F5FF', border: '1px solid #ECE7FB', borderRadius: 14, padding: '14px 16px', marginTop: 16, fontSize: 13.5, color: '#4B3F6B' },

  // Footer (fixo)
  footer: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: '1px solid #EDEDED' },
  footerIn: { maxWidth: CARD_MAX, margin: '0 auto', padding: '14px 24px', display: 'flex', gap: 12, alignItems: 'center' },
  voltarBtn: { padding: '15px 20px', borderRadius: 14, background: '#fff', border: '1px solid #EAEBEA', color: '#344054', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  continuarBtn: { flex: 1, padding: '15px 22px', borderRadius: 14, background: '#16A34A', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700, cursor: 'pointer' },

  erro: { marginTop: 14, fontSize: 14, color: '#B91C1C', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '12px 14px' },

  // Resultado
  iaBadge: { display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F5F3FF', color: '#6D28D9', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', padding: '6px 12px', borderRadius: 999, textTransform: 'uppercase' },
  avisoBox: { fontSize: 13.5, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 14px', marginBottom: 12, lineHeight: 1.5 },
  pepIcon: { width: 56, height: 56, borderRadius: 14, background: '#F0FAF3', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  pepIconImg: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: { fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999, whiteSpace: 'nowrap' },
  blocoTit: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 6 },
  why: { fontSize: 14, color: '#374151', lineHeight: 1.55, background: '#F9FAFB', borderRadius: 12, padding: '12px 14px', marginBottom: 10 },
  whyIa: { fontSize: 14, color: '#4B3F6B', lineHeight: 1.55, background: '#F7F5FF', border: '1px solid #ECE7FB', borderRadius: 12, padding: '12px 14px', marginBottom: 10 },
  comoUsar: { fontSize: 14, color: '#1E3A5F', lineHeight: 1.55, background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 12, padding: '12px 14px', marginBottom: 10 },
  altBox: { fontSize: 14, color: '#78350F', lineHeight: 1.55, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 14px', marginBottom: 10 },
  specGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginTop: 4 },
  spec: { background: '#F7F9F8', border: '1px solid #EEF0EF', borderRadius: 12, padding: '10px 12px' },
  specOn: { background: '#EAF7EE', border: '1px solid #CFE9D7' },
  specLabel: { fontSize: 10.5, color: '#98A2B3', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' },
  specValor: { fontSize: 15, fontWeight: 700, marginTop: 3 },
  orient: { background: '#fff', border: '1px solid #ECECEC', borderRadius: 14, padding: '14px 16px' },
  orientTit: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 },
  disc: { fontSize: 12.5, color: '#98A2B3', lineHeight: 1.5, padding: '4px 2px' },

  receberCard: { background: '#fff', border: '1px solid #ECECEC', borderRadius: 18, padding: 22, marginTop: 18 },
  paisSelect: { padding: '14px 10px', fontSize: 15, borderRadius: 14, border: '1px solid #E4E4E4', background: '#fff', fontFamily: 'inherit', color: '#0E1113', cursor: 'pointer' },
  waBtn: { width: '100%', marginTop: 16, padding: '15px', borderRadius: 14, background: '#16A34A', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  waManualBtn: { width: '100%', marginTop: 8, background: 'none', border: 'none', color: '#667085', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', padding: '6px 0' },
  linkBtn: { background: 'none', border: 'none', color: '#16A34A', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 },
  hint: { fontSize: 12.5, color: '#98A2B3' },
  secondaryBtn: { width: '100%', marginTop: 18, padding: '14px', borderRadius: 14, background: '#fff', border: '1px solid #E4E4E4', color: '#344054', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' },

  // Catálogo
  catGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  catItem: { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #ECECEC', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(16,24,40,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 },
  modalCard: { background: '#fff', borderRadius: 24, padding: 26, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' },
  modalClose: { width: 34, height: 34, borderRadius: '50%', border: '1px solid #ECECEC', background: '#fff', cursor: 'pointer', fontSize: 15, color: '#667085' },
};
