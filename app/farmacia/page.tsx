// ════════════════════════════════════════════════
//  NUVITA — app/farmacia/page.tsx
//  Balcão de farmácia: o atendente faz o diagnóstico
//  no tablet, gera o protocolo e envia por WhatsApp.
//  Tudo em uma página só, otimizada para toque.
//  Fluxo clínico: diagnóstico primeiro, contato no final.
// ════════════════════════════════════════════════

'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ObjectiveKey, Peptide } from '@/types';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import PinGate, { ESTOQUE_KEY, OK_KEY, NOME_KEY } from '@/components/farmacia/PinGate';
import Icon from '@/components/farmacia/Icon';
import {
  recomendarPeptideos,
  diagnosticarComIA,
  protocoloUmPeptideo,
  diagnosticarUmPeptideoIA,
  montarMensagemWhatsApp,
  normalizarTelefone,
  calcularIMC,
  ALL_PEPTIDES,
  type RespostasFarmacia,
  type NivelFarmacia,
  type AtividadeFarmacia,
  type SonoFarmacia,
  type CondicaoSaude,
  type Recomendacao,
} from '@/lib/recomendarPeptideos';

type Modo = 'completo' | 'unico' | 'catalogo';

// ─── Opções das perguntas ─────────────────────────────────
const OBJETIVOS: { key: ObjectiveKey; label: string; icon: string }[] = [
  { key: 'gordura', label: 'Emagrecer', icon: 'flame' },
  { key: 'massa', label: 'Ganhar massa', icon: 'dumbbell' },
  { key: 'recuperacao', label: 'Recuperação / lesões', icon: 'refresh' },
  { key: 'sono', label: 'Dormir melhor', icon: 'moon' },
  { key: 'pele', label: 'Pele / anti-idade', icon: 'sparkle' },
  { key: 'longevidade', label: 'Longevidade / energia', icon: 'bolt' },
  { key: 'cognitivo', label: 'Foco / cognição', icon: 'focus' },
  { key: 'hormonal', label: 'Libido / hormonal', icon: 'flask' },
];

const NIVEIS: { key: NivelFarmacia; label: string; sub: string }[] = [
  { key: 'iniciante', label: 'Nunca usou', sub: 'Primeira vez' },
  { key: 'intermediario', label: 'Já usou', sub: 'Alguma experiência' },
  { key: 'avancado', label: 'Usa sempre', sub: 'Experiente' },
];

const ATIVIDADES: { key: AtividadeFarmacia; label: string; sub: string }[] = [
  { key: 'sedentario', label: 'Sedentário', sub: 'Pouco exercício' },
  { key: 'moderado', label: 'Moderado', sub: 'Treina 1–3x/sem' },
  { key: 'ativo', label: 'Ativo', sub: 'Treina 4–5x/sem' },
  { key: 'muito_ativo', label: 'Muito ativo', sub: 'Treina 6–7x/sem' },
];

const SONOS: { key: SonoFarmacia; label: string }[] = [
  { key: 'ruim', label: 'Ruim' },
  { key: 'regular', label: 'Regular' },
  { key: 'bom', label: 'Bom' },
];

const CONDICOES: { key: CondicaoSaude; label: string; icon: string }[] = [
  { key: 'nenhuma', label: 'Nenhuma', icon: 'check' },
  { key: 'diabetes', label: 'Diabetes', icon: 'drop' },
  { key: 'hipertensao', label: 'Pressão alta', icon: 'heart' },
  { key: 'tireoide', label: 'Tireoide', icon: 'pulse' },
  { key: 'cancer', label: 'Histórico de câncer', icon: 'ribbon' },
  { key: 'gestacao', label: 'Gestante / amamentando', icon: 'person' },
  { key: 'outros', label: 'Outros', icon: 'pencil' },
];

const PRIORIDADE_STYLE: Record<string, { bg: string; tx: string; label: string }> = {
  essencial: { bg: '#DCFCE7', tx: '#15803D', label: 'Essencial' },
  recomendado: { bg: '#FEF3C7', tx: '#B45309', label: 'Recomendado' },
  opcional: { bg: '#F1F1F1', tx: '#6B7280', label: 'Opcional' },
};

export default function FarmaciaPage() {
  const [modo, setModo] = useState<Modo>('completo');
  const [peptideoUnico, setPeptideoUnico] = useState('');
  const [catalogoSel, setCatalogoSel] = useState<Peptide | null>(null);
  const [buscaCatalogo, setBuscaCatalogo] = useState('');
  const [estoque, setEstoque] = useState<string[] | null>(null);
  // Diagnóstico
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
  // Contato (por último)
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  const [rec, setRec] = useState<Recomendacao | null>(null);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviarErro, setEnviarErro] = useState('');

  const imc = useMemo(() => calcularIMC(Number(peso), Number(altura)), [peso, altura]);

  // Carrega o estoque da farmácia (salvo pelo PinGate ao entrar).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ESTOQUE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setEstoque(arr);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Peptídeos que a farmácia tem (para o modo "um peptídeo").
  const peptidesDisponiveis = useMemo(
    () => (estoque && estoque.length ? ALL_PEPTIDES.filter((p) => estoque.includes(p.n)) : ALL_PEPTIDES),
    [estoque],
  );

  const respostas = useMemo<RespostasFarmacia | null>(() => {
    const objetivoOk = modo === 'unico' ? !!peptideoUnico : objetivos.length > 0;
    // Nome/WhatsApp NÃO são exigidos para diagnosticar — só na hora de enviar.
    if (!objetivoOk || !nivel) return null;
    return {
      nome: nome.trim() || 'Paciente',
      telefone: telefone.trim(),
      sexo: sexo || undefined,
      objetivos,
      nivel: nivel as NivelFarmacia,
      condicoes: condicoes.length ? condicoes : ['nenhuma'],
      condicaoOutros: condicaoOutros.trim() || undefined,
      peso: peso ? Number(peso) : undefined,
      altura: altura ? Number(altura) : undefined,
      idade: idade ? Number(idade) : undefined,
      atividade: atividade || undefined,
      sono: sono || undefined,
    };
  }, [modo, peptideoUnico, nome, telefone, sexo, objetivos, nivel, condicoes, condicaoOutros, peso, altura, idade, atividade, sono]);

  // ─── Toggles ─────────────────────────────────────────────
  const toggleObjetivo = (k: ObjectiveKey) => {
    setObjetivos((prev) => {
      if (prev.includes(k)) return prev.filter((o) => o !== k);
      if (prev.length >= 3) return prev;
      return [...prev, k];
    });
  };

  const toggleCondicao = (k: CondicaoSaude) => {
    setCondicoes((prev) => {
      if (k === 'nenhuma') return prev.includes('nenhuma') ? [] : ['nenhuma'];
      const semNenhuma = prev.filter((c) => c !== 'nenhuma');
      const jaTem = semNenhuma.includes(k);
      if (k === 'outros' && jaTem) setCondicaoOutros('');
      return jaTem ? semNenhuma.filter((c) => c !== k) : [...semNenhuma, k];
    });
  };

  // ─── Gerar protocolo (IA faz o diagnóstico; fallback determinístico) ───
  const gerar = async () => {
    setErro('');
    setEnviado(false);
    if (modo === 'unico' && !peptideoUnico) return setErro('Selecione o peptídeo que a pessoa usa.');
    if (modo === 'completo' && !objetivos.length) return setErro('Selecione ao menos um objetivo.');
    if (!peso || Number(peso) < 30 || Number(peso) > 300) return setErro('Informe um peso válido (kg).');
    if (!altura || Number(altura) < 120 || Number(altura) > 230) return setErro('Informe uma altura válida (cm).');
    if (!idade || Number(idade) < 16 || Number(idade) > 100) return setErro('Informe uma idade válida.');
    if (!nivel) return setErro('Selecione a experiência com peptídeos.');
    if (condicoes.includes('outros') && !condicaoOutros.trim()) return setErro('Descreva a outra condição de saúde.');
    // Nome e WhatsApp são pedidos só depois, se a pessoa quiser receber o protocolo.

    setGerando(true);
    // A IA faz o diagnóstico; se indisponível/rate-limit, usa o determinístico.
    let resultado: Recomendacao | null;
    if (modo === 'unico') {
      resultado = await diagnosticarUmPeptideoIA(respostas!, peptideoUnico);
      if (!resultado) resultado = protocoloUmPeptideo(respostas!, peptideoUnico);
    } else {
      resultado = await diagnosticarComIA(respostas!, estoque);
      if (!resultado || (resultado.itens.length === 0 && !resultado.bloqueado)) {
        resultado = recomendarPeptideos(respostas!, estoque);
      }
    }
    setRec(resultado);
    setGerando(false);

    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Envia o protocolo direto pro WhatsApp da pessoa (só se ela quiser receber).
  // Nome + WhatsApp são coletados agora, com consentimento.
  const enviarProtocolo = async () => {
    if (!respostas || !rec) return;
    setEnviarErro('');
    if (!nome.trim()) return setEnviarErro('Preencha o nome da pessoa.');
    if (normalizarTelefone(telefone).length < 12) return setEnviarErro('Informe um WhatsApp válido com DDD.');

    setEnviando(true);
    const rComContato = { ...respostas, nome: nome.trim(), telefone: telefone.trim() };
    const msg = montarMensagemWhatsApp(rComContato, rec);

    // Salva o lead agora (a pessoa consentiu em receber).
    try {
      await fetch('/api/farmacia/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: rComContato.nome,
          telefone: rComContato.telefone,
          sexo: rComContato.sexo,
          objetivos: rComContato.objetivos,
          nivel: rComContato.nivel,
          condicoes: rComContato.condicoes,
          condicaoOutros: rComContato.condicaoOutros,
          peso: rComContato.peso,
          altura: rComContato.altura,
          idade: rComContato.idade,
          atividade: rComContato.atividade,
          sono: rComContato.sono,
          peptideos: rec.itens.map((i) => i.peptide.n),
        }),
      });
    } catch {
      /* silencioso */
    }

    // Envia direto pela API oficial da Meta (sem abrir o WhatsApp).
    try {
      const res = await fetch('/api/farmacia/enviar-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone: rComContato.telefone, mensagem: msg, nome: rComContato.nome }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setEnviado(true);
      } else {
        setEnviarErro(data?.error || 'Não foi possível enviar automaticamente.');
      }
    } catch {
      setEnviarErro('Erro de conexão ao enviar.');
    } finally {
      setEnviando(false);
    }
  };

  // Alternativa manual: abre o WhatsApp (para aparelhos que têm o app).
  const abrirWhatsAppManual = () => {
    if (!rec) return;
    const rComContato = { ...respostas!, nome: nome.trim() || 'Paciente', telefone: telefone.trim() };
    const msg = montarMensagemWhatsApp(rComContato, rec);
    const tel = normalizarTelefone(telefone);
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const novoAtendimento = () => {
    setPeptideoUnico('');
    setObjetivos([]);
    setPeso('');
    setAltura('');
    setIdade('');
    setSexo('');
    setNivel('');
    setAtividade('');
    setSono('');
    setCondicoes([]);
    setCondicaoOutros('');
    setNome('');
    setTelefone('');
    setRec(null);
    setErro('');
    setEnviado(false);
    setGerando(false);
    setEnviando(false);
    setEnviarErro('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onTelefone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    setTelefone(out);
  };

  const soNumero = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);

  // Sair: volta para a tela de senha (bloqueia o balcão de novo).
  const sair = () => {
    try {
      sessionStorage.removeItem(OK_KEY);
      sessionStorage.removeItem(ESTOQUE_KEY);
      sessionStorage.removeItem(NOME_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  // Recarregar: atualiza a página (pega a versão nova do site) sem deslogar.
  const recarregar = () => window.location.reload();

  return (
   <PinGate>
    <div style={S.page} className="grad">
      {/* Cabeçalho com logo centralizada */}
      <header style={S.header}>
        <div style={S.headerIn}>
          <div style={S.brand}>
            <NuvitaLogo width={104} height={22} />
            <span style={S.brandTag}>Balcão</span>
          </div>
          <div style={S.headerRight}>
            <button onClick={recarregar} style={S.iconBtn} title="Atualizar a página" aria-label="Atualizar">
              <Icon name="refresh" size={18} />
            </button>
            <button onClick={sair} style={S.sairBtn} title="Voltar para a tela de senha">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main style={S.main}>
        {/* ─── FORMULÁRIO ─── */}
        <div style={{ opacity: rec ? 0.4 : 1, pointerEvents: rec ? 'none' : 'auto', transition: 'opacity .25s' }}>
          <div style={S.hero}>
            <h1 style={S.h1}>
              {modo === 'unico' ? 'Protocolo de um peptídeo' : modo === 'catalogo' ? 'Catálogo de peptídeos' : 'Diagnóstico de peptídeos'}
            </h1>
            <p style={S.lead}>
              {modo === 'unico'
                ? 'A pessoa já usa um peptídeo? Monte o protocolo dele.'
                : modo === 'catalogo'
                  ? 'Toque em um produto para ver o que é, o que faz e como usar.'
                  : 'Responda com a pessoa. Rápido e sob medida.'}
            </p>
          </div>

          {/* Seletor de modo */}
          <div style={S.modoWrap}>
            <button
              onClick={() => setModo('completo')}
              style={{ ...S.modoTab, ...(modo === 'completo' ? S.modoTabAtivo : {}) }}
            >
              <span style={{ color: '#16A34A', display: 'inline-flex' }}><Icon name="search" size={19} /></span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Diagnóstico completo</div>
                <div style={S.modoSub}>Encontrar os peptídeos ideais</div>
              </div>
            </button>
            <button
              onClick={() => setModo('unico')}
              style={{ ...S.modoTab, ...(modo === 'unico' ? S.modoTabAtivo : {}) }}
            >
              <span style={{ color: '#16A34A', display: 'inline-flex' }}><Icon name="pill" size={19} /></span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Um peptídeo só</div>
                <div style={S.modoSub}>Já sabe qual? Faça o protocolo dele</div>
              </div>
            </button>
            <button
              onClick={() => setModo('catalogo')}
              style={{ ...S.modoTab, ...(modo === 'catalogo' ? S.modoTabAtivo : {}) }}
            >
              <span style={{ color: '#16A34A', display: 'inline-flex' }}><Icon name="clipboard" size={19} /></span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Catálogo</div>
                <div style={S.modoSub}>Ver o que cada produto faz</div>
              </div>
            </button>
          </div>

          {/* ─── CATÁLOGO ─── */}
          {modo === 'catalogo' && (
            <div style={S.section}>
              <input
                className="inp"
                placeholder="Buscar produto…"
                value={buscaCatalogo}
                onChange={(e) => setBuscaCatalogo(e.target.value)}
                style={{ ...S.inpBig, marginBottom: 14 }}
              />
              <div style={S.catGrid}>
                {peptidesDisponiveis
                  .filter((p) => {
                    const q = buscaCatalogo.trim().toLowerCase();
                    return !q || p.n.toLowerCase().includes(q) || p.m.toLowerCase().includes(q);
                  })
                  .map((p) => (
                    <button key={p.n} onClick={() => setCatalogoSel(p)} style={S.catItem}>
                      <span style={S.pepIconSm}><Icon name="pill" size={18} /></span>
                      <span style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: 14.5, display: 'block' }}>{p.n}</span>
                        <span style={{ fontSize: 12, color: '#98A2B3', lineHeight: 1.35 }}>{p.m}</span>
                      </span>
                      <span style={{ color: '#16A34A', fontSize: 13, fontWeight: 600 }}>Ver</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* ─── DIAGNÓSTICO / PROTOCOLO ─── */}
          {modo !== 'catalogo' && (
          <>
          {/* 1 · Objetivo (completo) ou Peptídeo (único) */}
          {modo === 'completo' ? (
            <Section n="1" titulo="Qual o objetivo?" hint="até 3">
              <div style={S.gridAuto}>
                {OBJETIVOS.map((o) => (
                  <Chip key={o.key} ativo={objetivos.includes(o.key)} onClick={() => toggleObjetivo(o.key)} icon={o.icon}>
                    {o.label}
                  </Chip>
                ))}
              </div>
            </Section>
          ) : (
            <Section n="1" titulo="Qual peptídeo a pessoa usa?" hint="escolha 1">
              <div style={S.gridAuto}>
                {peptidesDisponiveis.map((p) => (
                  <Chip key={p.n} ativo={peptideoUnico === p.n} onClick={() => setPeptideoUnico(p.n)}>
                    {p.n}
                  </Chip>
                ))}
              </div>
            </Section>
          )}

          {/* 2 · Dados físicos */}
          <Section n="2" titulo="Dados físicos">
            <div style={S.grid3}>
              <Campo label="Peso" unidade="kg">
                <input className="inp" placeholder="75" inputMode="numeric" value={peso}
                  onChange={(e) => setPeso(soNumero(e.target.value, 3))} style={S.inpBig} />
              </Campo>
              <Campo label="Altura" unidade="cm">
                <input className="inp" placeholder="175" inputMode="numeric" value={altura}
                  onChange={(e) => setAltura(soNumero(e.target.value, 3))} style={S.inpBig} />
              </Campo>
              <Campo label="Idade" unidade="anos">
                <input className="inp" placeholder="34" inputMode="numeric" value={idade}
                  onChange={(e) => setIdade(soNumero(e.target.value, 3))} style={S.inpBig} />
              </Campo>
            </div>
            {imc && (
              <div style={S.imcBox}>
                <span style={{ fontWeight: 600, color: '#0E1113' }}>IMC {imc.valor}</span>
                <span style={{ color: '#667085' }}> · {imc.classe}</span>
              </div>
            )}
          </Section>

          {/* 3 · Sexo */}
          <Section n="3" titulo="Sexo" opcional>
            <div style={S.grid3}>
              {[
                { k: 'masculino', l: 'Masculino' },
                { k: 'feminino', l: 'Feminino' },
                { k: 'ni', l: 'Prefiro não dizer' },
              ].map((o) => (
                <Chip key={o.k} ativo={sexo === o.k} onClick={() => setSexo(o.k as any)}>
                  {o.l}
                </Chip>
              ))}
            </div>
          </Section>

          {/* 4 · Experiência */}
          <Section n="4" titulo="Já usou peptídeos?">
            <div style={S.grid3}>
              {NIVEIS.map((o) => (
                <Chip key={o.key} ativo={nivel === o.key} onClick={() => setNivel(o.key)} coluna label={o.label} sub={o.sub} />
              ))}
            </div>
          </Section>

          {/* 5 · Atividade física */}
          <Section n="5" titulo="Atividade física">
            <div style={S.gridAuto}>
              {ATIVIDADES.map((o) => (
                <Chip key={o.key} ativo={atividade === o.key} onClick={() => setAtividade(o.key)} coluna label={o.label} sub={o.sub} />
              ))}
            </div>
          </Section>

          {/* 6 · Sono */}
          <Section n="6" titulo="Como está o sono?">
            <div style={S.grid3}>
              {SONOS.map((o) => (
                <Chip key={o.key} ativo={sono === o.key} onClick={() => setSono(o.key)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </Section>

          {/* 7 · Condições de saúde */}
          <Section n="7" titulo="Condição de saúde?" hint="segurança">
            <div style={S.gridAuto}>
              {CONDICOES.map((o) => (
                <Chip key={o.key} ativo={condicoes.includes(o.key)} onClick={() => toggleCondicao(o.key)} icon={o.icon}>
                  {o.label}
                </Chip>
              ))}
            </div>
            {condicoes.includes('outros') && (
              <input
                className="inp"
                placeholder="Qual condição? (ex.: problema renal, alergia…)"
                value={condicaoOutros}
                onChange={(e) => setCondicaoOutros(e.target.value.slice(0, 120))}
                style={{ ...S.inpBig, marginTop: 12 }}
                autoFocus
              />
            )}
          </Section>

          {erro && <div style={S.erro}>⚠️ {erro}</div>}

          {!rec && (
            <button onClick={gerar} disabled={gerando}
              style={{ ...S.cta, opacity: gerando ? 0.7 : 1, cursor: gerando ? 'wait' : 'pointer' }}>
              {gerando
                ? 'Analisando o perfil…'
                : modo === 'unico' ? 'Gerar protocolo' : 'Gerar diagnóstico'}
            </button>
          )}
          </>
          )}
        </div>

        {/* ─── RESULTADO ─── */}
        {rec && (
          <div id="resultado" style={{ marginTop: 44, animation: 'fu .4s ease' }}>
            <div style={S.divider} />

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <h2 style={S.h2}>{nome.trim() ? `Protocolo de ${nome.split(' ')[0]}` : 'Protocolo'}</h2>
              <span className="pill" style={rec.fonte === 'ia' ? S.pillIa : undefined}>
                <span className="pdot" /> {rec.fonte === 'ia' ? 'Diagnóstico IA' : 'Gerado'}
              </span>
            </div>
            <div style={S.perfilLinha}>
              {idade && <span>{idade} anos</span>}
              {imc && <span>· IMC {imc.valor} ({imc.classe})</span>}
              {atividade && <span>· {ATIVIDADES.find((a) => a.key === atividade)?.label}</span>}
            </div>

            {rec.avisos.map((a, i) => (
              <div key={i} className="disc" style={{ marginTop: 12 }}>{a}</div>
            ))}

            {rec.bloqueado || rec.itens.length === 0 ? (
              <div style={{ ...S.card, marginTop: 16, textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                <div style={{ color: '#16A34A', display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="pulse" size={40} /></div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
                  Neste caso não é seguro montar um protocolo aqui. Oriente a pessoa a procurar acompanhamento
                  médico antes de qualquer uso.
                </p>
              </div>
            ) : (
              <>
                {rec.resumo && (
                  <div style={S.iaResumo}>
                    <div style={S.iaResumoTitulo}>Resumo para explicar ao paciente</div>
                    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{rec.resumo}</p>
                  </div>
                )}

                <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
                  {rec.itens.map((it) => {
                    const pr = PRIORIDADE_STYLE[it.prioridade];
                    const ehIa = rec.fonte === 'ia';
                    return (
                      <div key={it.peptide.n} style={S.card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <span style={S.pepIcon}><Icon name="pill" size={24} /></span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.02em' }}>{it.peptide.n}</div>
                            <div style={{ fontSize: 13, color: '#667085', lineHeight: 1.4 }}>{it.peptide.m}</div>
                          </div>
                          <span style={{ ...S.badge, background: pr.bg, color: pr.tx }}>{pr.label}</span>
                        </div>

                        {it.motivo && (
                          <div style={ehIa ? S.whyIa : S.why}>
                            <span style={S.blocoTituloRow}>
                              <Icon name="bulb" size={13} />
                              {ehIa ? 'Por que para esta pessoa' : 'Por que recomendado'}
                            </span>
                            {it.motivo}
                          </div>
                        )}

                        {it.comoUsar && (
                          <div style={S.comoUsar}>
                            <span style={S.blocoTituloRow}>
                              <Icon name="clipboard" size={13} />
                              Como usar
                            </span>
                            {it.comoUsar}
                          </div>
                        )}

                        {it.alternativa && (
                          <div style={S.alternativa}>
                            <span style={S.blocoTituloRow}>
                              <Icon name="refresh" size={13} />
                              Comparação / alternativa
                            </span>
                            {it.alternativa}
                          </div>
                        )}

                        <div style={S.specGrid}>
                          <Spec label="Dose" valor={it.dose} destaque />
                          <Spec label="Frequência" valor={it.peptide.freq} />
                          <Spec label="Quando" valor={it.peptide.timing} />
                          <Spec label="Via" valor={it.peptide.route} />
                          <Spec label="Ciclo" valor={it.peptide.cycle} />
                          <Spec label="Descanso" valor={it.peptide.rest} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {rec.removidosPorSeguranca.length > 0 && (
                  <div style={{ ...S.hint, marginTop: 14 }}>
                    Removido(s) por segurança: {rec.removidosPorSeguranca.join(', ')}.
                  </div>
                )}

                {(rec.orientacaoAlimentar || rec.orientacaoTreino || rec.observacoes || rec.avisoMedico) && (
                  <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                    {rec.orientacaoAlimentar && <Orientacao icon="fork" titulo="Alimentação" texto={rec.orientacaoAlimentar} />}
                    {rec.orientacaoTreino && <Orientacao icon="dumbbell" titulo="Treino" texto={rec.orientacaoTreino} />}
                    {rec.observacoes && <Orientacao icon="eye" titulo="O que observar" texto={rec.observacoes} />}
                    {rec.avisoMedico && <div className="disc" style={{ marginTop: 2 }}>{rec.avisoMedico}</div>}
                  </div>
                )}

                {/* Receber o protocolo — só se a pessoa tiver interesse */}
                <div style={S.receberCard}>
                  {enviado ? (
                    <div style={{ textAlign: 'center', padding: '6px 0' }}>
                      <div style={{ color: '#16A34A', display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                        <Icon name="check" size={30} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>Protocolo enviado no WhatsApp!</div>
                      <div style={{ fontSize: 13, color: '#667085', marginTop: 3 }}>
                        Enviado para {normalizarTelefone(telefone).replace(/^55/, '')}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>Quer receber o protocolo?</div>
                      <div style={{ fontSize: 13, color: '#667085', marginTop: 3, marginBottom: 14 }}>
                        Se a pessoa tiver interesse, preencha os dados que enviamos direto no WhatsApp dela.
                      </div>
                      <Campo label="Nome da pessoa">
                        <input className="inp" placeholder="Nome completo" value={nome}
                          onChange={(e) => { setEnviarErro(''); setNome(e.target.value); }} style={S.inpBig} />
                      </Campo>
                      <div style={{ marginTop: 12 }}>
                        <Campo label="WhatsApp (com DDD)">
                          <input className="inp" placeholder="(11) 99999-9999" value={telefone} inputMode="numeric"
                            onChange={(e) => { setEnviarErro(''); onTelefone(e.target.value); }} style={S.inpBig} />
                        </Campo>
                      </div>
                      {enviarErro && (
                        <div style={{ ...S.hint, color: '#B45309', marginTop: 10 }}>
                          {enviarErro} <button onClick={abrirWhatsAppManual} style={S.linkBtn}>Abrir no WhatsApp</button>
                        </div>
                      )}
                      <button onClick={enviarProtocolo} disabled={enviando}
                        style={{ ...S.waBtn, ...S.waBtnFull, opacity: enviando ? 0.7 : 1 }}>
                        {enviando ? 'Enviando…' : 'Enviar protocolo no WhatsApp'}
                      </button>
                    </>
                  )}
                </div>

                <button onClick={novoAtendimento} style={S.secondaryBtn}>
                  ↺ Iniciar novo atendimento
                </button>
              </>
            )}

            <p style={S.disclaimer}>
              A Nuvita oferece orientação educacional. Cada organismo reage de forma diferente — o uso deve
              considerar avaliação profissional quando indicado.
            </p>
          </div>
        )}
      </main>

      {/* Modal do catálogo */}
      {catalogoSel && (
        <div style={S.overlay} onClick={() => setCatalogoSel(null)}>
          <div style={S.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={S.pepIcon}><Icon name="pill" size={24} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-.02em' }}>{catalogoSel.n}</div>
                <div style={{ fontSize: 13, color: '#667085', lineHeight: 1.4 }}>{catalogoSel.m}</div>
              </div>
              <button onClick={() => setCatalogoSel(null)} style={S.modalClose} aria-label="Fechar">✕</button>
            </div>

            {catalogoSel.why && (
              <div style={S.why}>
                <span style={S.blocoTituloRow}><Icon name="bulb" size={13} /> O que faz</span>
                {catalogoSel.why}
              </div>
            )}
            <div style={S.comoUsar}>
              <span style={S.blocoTituloRow}><Icon name="clipboard" size={13} /> Como usar</span>
              {catalogoSel.how}
            </div>
            <div style={S.specGrid}>
              <Spec label="Dose (ref. 75kg)" valor={catalogoSel.doseStr(75)} destaque />
              <Spec label="Frequência" valor={catalogoSel.freq} />
              <Spec label="Quando" valor={catalogoSel.timing} />
              <Spec label="Via" valor={catalogoSel.route} />
              <Spec label="Ciclo" valor={catalogoSel.cycle} />
              <Spec label="Descanso" valor={catalogoSel.rest} />
            </div>
            <p style={{ ...S.disclaimer, marginTop: 18 }}>
              Orientação educacional. Cada organismo reage de forma diferente — considere avaliação profissional.
            </p>
          </div>
        </div>
      )}
    </div>
   </PinGate>
  );
}

// ─── Subcomponentes ────────────────────────────────────────
function Campo({ label, unidade, children }: { label: string; unidade?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={S.label}>
        {label}
        {unidade && <span style={{ color: '#98A2B3', fontWeight: 400 }}> · {unidade}</span>}
      </label>
      {children}
    </div>
  );
}

function Orientacao({ icon, titulo, texto }: { icon: string; titulo: string; texto: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #ECEDEE', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12 }}>
      <span style={{ color: '#16A34A', display: 'inline-flex', marginTop: 1 }}><Icon name={icon} size={20} /></span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{titulo}</div>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{texto}</div>
      </div>
    </div>
  );
}

function Section({ n, titulo, hint, opcional, children }: {
  n: string; titulo: string; hint?: string; opcional?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={S.section}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={S.stepNum}>{n}</span>
        <h3 style={S.sectionTitle}>{titulo}</h3>
        {opcional && <span style={S.tagOpt}>opcional</span>}
        {hint && <span style={S.hintTag}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({ ativo, onClick, coluna, icon, label, sub, children }: {
  ativo: boolean; onClick: () => void; coluna?: boolean;
  icon?: string; label?: string; sub?: string; children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: coluna ? 'column' : 'row',
        alignItems: coluna ? 'flex-start' : 'center',
        justifyContent: coluna ? 'center' : 'flex-start',
        textAlign: 'left',
        gap: coluna ? 3 : 0,
        padding: '13px 15px',
        borderRadius: 14,
        border: ativo ? '1.5px solid #16A34A' : '1.5px solid #ECEDEE',
        background: ativo ? '#F0FDF4' : '#fff',
        color: '#0E1113',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'border-color .13s, background .13s, box-shadow .13s',
        minHeight: coluna ? 62 : 52,
        boxShadow: ativo ? '0 0 0 3px rgba(22,163,74,.09)' : 'none',
      }}
    >
      {coluna ? (
        <>
          <strong style={{ fontSize: 15, fontWeight: 600 }}>{label}</strong>
          <span style={{ fontSize: 12, color: '#98A2B3' }}>{sub}</span>
        </>
      ) : (
        <>
          {icon && (
            <span style={{ color: '#16A34A', marginRight: 9, display: 'inline-flex' }}>
              <Icon name={icon} size={18} />
            </span>
          )}
          {children}
        </>
      )}
    </button>
  );
}

function Spec({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div style={{ background: destaque ? '#F0FDF4' : '#FAFAFA', borderRadius: 11, padding: '10px 12px' }}>
      <div style={{ fontSize: 10.5, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: destaque ? 600 : 500, color: destaque ? '#15803D' : '#0E1113' }}>
        {valor}
      </div>
    </div>
  );
}

// ─── Estilos ───────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#FBFBFA' },
  header: {
    background: 'rgba(255,255,255,.82)',
    backdropFilter: 'saturate(180%) blur(12px)',
    WebkitBackdropFilter: 'saturate(180%) blur(12px)',
    borderBottom: '1px solid #EFEFEF',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerIn: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandTag: {
    fontSize: 10.5,
    color: '#98A2B3',
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    fontWeight: 600,
    borderLeft: '1px solid #E4E4E4',
    paddingLeft: 10,
  },
  resetBtn: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#fff',
    border: '1px solid #E7E7E7',
    color: '#475467',
    padding: '7px 14px',
    borderRadius: 100,
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  headerRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: '#fff',
    border: '1px solid #E7E7E7',
    color: '#16A34A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  sairBtn: {
    background: '#fff',
    border: '1px solid #E7E7E7',
    color: '#475467',
    padding: '8px 16px',
    borderRadius: 100,
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  main: { maxWidth: 680, margin: '0 auto', padding: '32px 20px 90px' },
  hero: { textAlign: 'center', marginBottom: 20 },
  modoWrap: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 },
  modoTab: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: '14px 16px',
    borderRadius: 16,
    border: '1.5px solid #ECEDEE',
    background: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: '#0E1113',
    transition: 'border-color .13s, background .13s, box-shadow .13s',
  },
  modoTabAtivo: { border: '1.5px solid #16A34A', background: '#F0FDF4', boxShadow: '0 0 0 3px rgba(22,163,74,.09)' },
  modoSub: { fontSize: 11.5, color: '#98A2B3', marginTop: 1 },
  h1: { fontSize: 30, fontWeight: 600, letterSpacing: '-.045em', lineHeight: 1.1, color: '#0E1113' },
  lead: { fontSize: 15, color: '#667085', marginTop: 8 },
  h2: { fontSize: 25, fontWeight: 600, letterSpacing: '-.035em', color: '#0E1113' },
  section: {
    background: '#fff',
    border: '1px solid #ECEDEE',
    borderRadius: 22,
    padding: '22px',
    marginTop: 14,
    boxShadow: '0 1px 2px rgba(16,24,40,.03)',
  },
  sectionTitle: { fontSize: 16.5, fontWeight: 600, letterSpacing: '-.02em', color: '#0E1113' },
  stepNum: {
    width: 25,
    height: 25,
    borderRadius: 8,
    background: '#F0FDF4',
    color: '#16A34A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#475467', marginBottom: 7 },
  inpBig: { padding: '14px 16px', fontSize: 16, borderRadius: 12, borderColor: '#E7E7E7' },
  hint: { fontSize: 12, color: '#98A2B3', marginTop: 10 },
  hintTag: { fontSize: 12, color: '#98A2B3', marginLeft: 'auto' },
  imcBox: {
    marginTop: 14,
    padding: '11px 15px',
    background: '#F0FDF4',
    border: '1px solid #DCFCE7',
    borderRadius: 12,
    fontSize: 14,
    display: 'inline-block',
  },
  tagOpt: { fontSize: 11, color: '#98A2B3', background: '#F5F5F5', padding: '3px 9px', borderRadius: 100, fontWeight: 500 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 },
  gridAuto: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 10 },
  cta: {
    width: '100%',
    marginTop: 28,
    padding: '17px',
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 15,
    border: 'none',
    background: '#16A34A',
    color: '#fff',
    fontFamily: 'inherit',
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(22,163,74,.22)',
    transition: 'transform .12s, box-shadow .12s',
  },
  secondaryBtn: {
    width: '100%',
    marginTop: 14,
    padding: 15,
    borderRadius: 14,
    border: '1px solid #E7E7E7',
    background: '#fff',
    color: '#475467',
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
  },
  erro: {
    marginTop: 18,
    padding: '13px 16px',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 12,
    color: '#B91C1C',
    fontSize: 14,
  },
  divider: { height: 1, background: '#ECEDEE', margin: '0 0 26px' },
  perfilLinha: { display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 13, color: '#667085', marginTop: 7 },
  pillIa: { background: '#F3F0FF', color: '#6D28D9' },
  card: { background: '#fff', border: '1px solid #ECEDEE', borderRadius: 20, padding: 20, boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  pepIcon: { color: '#16A34A', width: 46, height: 46, borderRadius: 13, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pepIconSm: { color: '#16A34A', width: 38, height: 38, borderRadius: 11, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 },
  catItem: { display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderRadius: 14, border: '1.5px solid #ECEDEE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#0E1113', textAlign: 'left' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(16,24,40,.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 },
  modalCard: { background: '#fff', borderRadius: 22, padding: 22, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(16,24,40,.25)' },
  modalClose: { background: '#F5F5F5', border: 'none', width: 32, height: 32, borderRadius: '50%', fontSize: 15, color: '#667085', cursor: 'pointer', flexShrink: 0 },
  badge: { fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 100, whiteSpace: 'nowrap' },
  blocoTitulo: { display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 5, opacity: 0.9 },
  blocoTituloRow: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 5, opacity: 0.9 },
  why: { fontSize: 13.5, color: '#374151', background: '#FAFAFA', borderRadius: 12, padding: '12px 14px', marginBottom: 10, lineHeight: 1.5 },
  whyIa: { fontSize: 13.5, color: '#5B21B6', background: '#F7F5FF', border: '1px solid #EDE9FE', borderRadius: 12, padding: '12px 14px', marginBottom: 10, lineHeight: 1.5 },
  comoUsar: { fontSize: 13.5, color: '#075985', background: '#F0F9FF', border: '1px solid #E0F2FE', borderRadius: 12, padding: '12px 14px', marginBottom: 12, lineHeight: 1.5 },
  alternativa: { fontSize: 13.5, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 14px', marginBottom: 14, lineHeight: 1.5 },
  iaResumo: { background: '#F7F5FF', border: '1px solid #EDE9FE', borderRadius: 18, padding: '18px 20px', marginTop: 16 },
  iaResumoTitulo: { fontSize: 12, fontWeight: 700, color: '#8B5CF6', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 7 },
  iaBtn: { width: '100%', marginTop: 18, padding: 16, borderRadius: 15, border: '1.5px solid #DDD6FE', background: '#F7F5FF', color: '#6D28D9', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, transition: 'all .14s' },
  specGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 8 },
  waBox: {
    marginTop: 24,
    padding: 20,
    background: '#fff',
    border: '1px solid #ECEDEE',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  waBtn: {
    border: 'none',
    color: '#fff',
    padding: '15px 24px',
    borderRadius: 13,
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all .14s',
    whiteSpace: 'nowrap',
    background: '#25D366',
    boxShadow: '0 4px 12px rgba(37,211,102,.28)',
  },
  waBtnFull: { width: '100%', marginTop: 16 },
  receberCard: { marginTop: 24, padding: 20, background: '#fff', border: '1px solid #ECEDEE', borderRadius: 20, boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  linkBtn: { background: 'none', border: 'none', color: '#16A34A', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 },
  disclaimer: { fontSize: 12, color: '#98A2B3', lineHeight: 1.6, marginTop: 30, textAlign: 'center', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' },
};
