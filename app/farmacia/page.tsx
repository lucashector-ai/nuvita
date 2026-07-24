// ════════════════════════════════════════════════
//  NUVITA — app/farmacia/page.tsx
//  Balcão de farmácia: o atendente faz o diagnóstico
//  no tablet, gera o protocolo e envia por WhatsApp.
//  Tudo em uma página só, otimizada para toque.
//  Fluxo clínico: diagnóstico primeiro, contato no final.
// ════════════════════════════════════════════════

'use client';

import { useMemo, useState } from 'react';
import type { ObjectiveKey } from '@/types';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import PinGate from '@/components/farmacia/PinGate';
import {
  recomendarPeptideos,
  refinarProtocoloIA,
  montarMensagemWhatsApp,
  normalizarTelefone,
  calcularIMC,
  type RespostasFarmacia,
  type NivelFarmacia,
  type AtividadeFarmacia,
  type SonoFarmacia,
  type CondicaoSaude,
  type Recomendacao,
  type RefinamentoIA,
} from '@/lib/recomendarPeptideos';

// ─── Opções das perguntas ─────────────────────────────────
const OBJETIVOS: { key: ObjectiveKey; label: string; e: string }[] = [
  { key: 'gordura', label: 'Emagrecer', e: '🔥' },
  { key: 'massa', label: 'Ganhar massa', e: '💪' },
  { key: 'recuperacao', label: 'Recuperação / lesões', e: '🔄' },
  { key: 'sono', label: 'Dormir melhor', e: '😴' },
  { key: 'pele', label: 'Pele / anti-idade', e: '✨' },
  { key: 'longevidade', label: 'Longevidade / energia', e: '🌟' },
  { key: 'cognitivo', label: 'Foco / cognição', e: '🧠' },
  { key: 'hormonal', label: 'Libido / hormonal', e: '⚗️' },
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

const SONOS: { key: SonoFarmacia; label: string; e: string }[] = [
  { key: 'ruim', label: 'Ruim', e: '😣' },
  { key: 'regular', label: 'Regular', e: '😐' },
  { key: 'bom', label: 'Bom', e: '😴' },
];

const CONDICOES: { key: CondicaoSaude; label: string; e: string }[] = [
  { key: 'nenhuma', label: 'Nenhuma', e: '✅' },
  { key: 'diabetes', label: 'Diabetes', e: '🩸' },
  { key: 'hipertensao', label: 'Pressão alta', e: '❤️' },
  { key: 'tireoide', label: 'Tireoide', e: '🦋' },
  { key: 'cancer', label: 'Histórico de câncer', e: '🎗️' },
  { key: 'gestacao', label: 'Gestante / amamentando', e: '🤰' },
  { key: 'outros', label: 'Outros', e: '✍️' },
];

const PRIORIDADE_STYLE: Record<string, { bg: string; tx: string; label: string }> = {
  essencial: { bg: '#DCFCE7', tx: '#15803D', label: 'Essencial' },
  recomendado: { bg: '#FEF3C7', tx: '#B45309', label: 'Recomendado' },
  opcional: { bg: '#F1F1F1', tx: '#6B7280', label: 'Opcional' },
};

export default function FarmaciaPage() {
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
  const [ia, setIa] = useState<RefinamentoIA | null>(null);
  const [refinando, setRefinando] = useState(false);
  const [iaErro, setIaErro] = useState('');

  const imc = useMemo(() => calcularIMC(Number(peso), Number(altura)), [peso, altura]);

  const respostas = useMemo<RespostasFarmacia | null>(() => {
    if (!nome.trim() || !telefone.trim() || !objetivos.length || !nivel) return null;
    return {
      nome: nome.trim(),
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
  }, [nome, telefone, sexo, objetivos, nivel, condicoes, condicaoOutros, peso, altura, idade, atividade, sono]);

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

  // ─── Gerar protocolo ─────────────────────────────────────
  const gerar = async () => {
    setErro('');
    setEnviado(false);
    setIa(null);
    setIaErro('');
    if (!objetivos.length) return setErro('Selecione ao menos um objetivo.');
    if (!peso || Number(peso) < 30 || Number(peso) > 300) return setErro('Informe um peso válido (kg).');
    if (!altura || Number(altura) < 120 || Number(altura) > 230) return setErro('Informe uma altura válida (cm).');
    if (!idade || Number(idade) < 16 || Number(idade) > 100) return setErro('Informe uma idade válida.');
    if (!nivel) return setErro('Selecione a experiência com peptídeos.');
    if (condicoes.includes('outros') && !condicaoOutros.trim()) return setErro('Descreva a outra condição de saúde.');
    if (!nome.trim()) return setErro('Preencha o nome da pessoa.');
    if (normalizarTelefone(telefone).length < 12) return setErro('Preencha um telefone/WhatsApp válido com DDD.');

    const resultado = recomendarPeptideos(respostas!);
    setRec(resultado);

    try {
      await fetch('/api/farmacia/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: respostas!.nome,
          telefone: respostas!.telefone,
          sexo: respostas!.sexo,
          objetivos: respostas!.objetivos,
          nivel: respostas!.nivel,
          condicoes: respostas!.condicoes,
          condicaoOutros: respostas!.condicaoOutros,
          peso: respostas!.peso,
          altura: respostas!.altura,
          idade: respostas!.idade,
          atividade: respostas!.atividade,
          sono: respostas!.sono,
          peptideos: resultado.itens.map((i) => i.peptide.n),
        }),
      });
    } catch {
      /* silencioso — não atrapalha o balcão */
    }

    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const refinar = async () => {
    if (!respostas || !rec) return;
    setRefinando(true);
    setIaErro('');
    const resultado = await refinarProtocoloIA(respostas, rec);
    if (resultado) setIa(resultado);
    else setIaErro('Não foi possível refinar agora. O protocolo acima continua válido.');
    setRefinando(false);
  };

  const enviarWhatsApp = () => {
    if (!respostas || !rec) return;
    const msg = montarMensagemWhatsApp(respostas, rec, ia);
    const tel = normalizarTelefone(respostas.telefone);
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    setEnviado(true);
  };

  const novoAtendimento = () => {
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
    setIa(null);
    setIaErro('');
    setRefinando(false);
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
          {rec && (
            <button onClick={novoAtendimento} style={S.resetBtn}>
              ↺ Novo
            </button>
          )}
        </div>
      </header>

      <main style={S.main}>
        {/* ─── FORMULÁRIO ─── */}
        <div style={{ opacity: rec ? 0.4 : 1, pointerEvents: rec ? 'none' : 'auto', transition: 'opacity .25s' }}>
          <div style={S.hero}>
            <h1 style={S.h1}>Diagnóstico de peptídeos</h1>
            <p style={S.lead}>Responda com a pessoa. Rápido e sob medida.</p>
          </div>

          {/* 1 · Objetivo */}
          <Section n="1" titulo="Qual o objetivo?" hint="até 3">
            <div style={S.gridAuto}>
              {OBJETIVOS.map((o) => (
                <Chip key={o.key} ativo={objetivos.includes(o.key)} onClick={() => toggleObjetivo(o.key)} emoji={o.e}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </Section>

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
                <Chip key={o.key} ativo={sono === o.key} onClick={() => setSono(o.key)} emoji={o.e}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </Section>

          {/* 7 · Condições de saúde */}
          <Section n="7" titulo="Condição de saúde?" hint="segurança">
            <div style={S.gridAuto}>
              {CONDICOES.map((o) => (
                <Chip key={o.key} ativo={condicoes.includes(o.key)} onClick={() => toggleCondicao(o.key)} emoji={o.e}>
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

          {/* 8 · Contato (por último) */}
          <Section n="8" titulo="Contato para enviar">
            <Campo label="Nome da pessoa">
              <input className="inp" placeholder="Nome completo" value={nome}
                onChange={(e) => setNome(e.target.value)} style={S.inpBig} />
            </Campo>
            <div style={{ marginTop: 16 }}>
              <Campo label="WhatsApp (com DDD)">
                <input className="inp" placeholder="(11) 99999-9999" value={telefone} inputMode="numeric"
                  onChange={(e) => onTelefone(e.target.value)} style={S.inpBig} />
              </Campo>
            </div>
            <div style={S.hint}>O protocolo será enviado para este número.</div>
          </Section>

          {erro && <div style={S.erro}>⚠️ {erro}</div>}

          {!rec && (
            <button onClick={gerar} style={S.cta}>
              Gerar protocolo
            </button>
          )}
        </div>

        {/* ─── RESULTADO ─── */}
        {rec && (
          <div id="resultado" style={{ marginTop: 44, animation: 'fu .4s ease' }}>
            <div style={S.divider} />

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <h2 style={S.h2}>Protocolo de {nome.split(' ')[0]}</h2>
              <span className="pill"><span className="pdot" /> Gerado</span>
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
                <div style={{ fontSize: 40, marginBottom: 10 }}>🩺</div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
                  Neste caso não é seguro montar um protocolo aqui. Oriente a pessoa a procurar acompanhamento
                  médico antes de qualquer uso.
                </p>
              </div>
            ) : (
              <>
                {ia?.resumo && (
                  <div style={S.iaResumo}>
                    <div style={S.iaResumoTitulo}>✨ Resumo para explicar ao paciente</div>
                    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{ia.resumo}</p>
                  </div>
                )}

                <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
                  {rec.itens.map((it) => {
                    const pr = PRIORIDADE_STYLE[it.prioridade];
                    const motivo = ia?.explicacoes[it.peptide.n] || it.peptide.why;
                    const temIaMotivo = !!ia?.explicacoes[it.peptide.n];
                    const comoUsar = ia?.comoUsarIA[it.peptide.n] || it.peptide.how;
                    return (
                      <div key={it.peptide.n} style={S.card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <span style={S.pepEmoji}>{it.peptide.e}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.02em' }}>{it.peptide.n}</div>
                            <div style={{ fontSize: 13, color: '#667085', lineHeight: 1.4 }}>{it.peptide.m}</div>
                          </div>
                          <span style={{ ...S.badge, background: pr.bg, color: pr.tx }}>{pr.label}</span>
                        </div>

                        {motivo && (
                          <div style={temIaMotivo ? S.whyIa : S.why}>
                            <span style={S.blocoTitulo}>{temIaMotivo ? '✨ Por que para esta pessoa' : '💡 Por que recomendado'}</span>
                            {motivo}
                          </div>
                        )}

                        {comoUsar && (
                          <div style={S.comoUsar}>
                            <span style={S.blocoTitulo}>📋 Como usar</span>
                            {comoUsar}
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

                {ia && (ia.orientacaoAlimentar || ia.orientacaoTreino || ia.observacoes || ia.avisoMedico) && (
                  <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                    {ia.orientacaoAlimentar && <Orientacao e="🥗" titulo="Alimentação" texto={ia.orientacaoAlimentar} />}
                    {ia.orientacaoTreino && <Orientacao e="🏋️" titulo="Treino" texto={ia.orientacaoTreino} />}
                    {ia.observacoes && <Orientacao e="👀" titulo="O que observar" texto={ia.observacoes} />}
                    {ia.avisoMedico && <div className="disc" style={{ marginTop: 2 }}>{ia.avisoMedico}</div>}
                  </div>
                )}

                {!ia && (
                  <button onClick={refinar} disabled={refinando}
                    style={{ ...S.iaBtn, opacity: refinando ? 0.6 : 1, cursor: refinando ? 'wait' : 'pointer' }}>
                    {refinando ? '✨ Personalizando com IA…' : '✨ Refinar e explicar com IA'}
                  </button>
                )}
                {iaErro && <div style={{ ...S.hint, color: '#B45309', marginTop: 10 }}>{iaErro}</div>}
                {ia && (
                  <div style={{ ...S.hint, marginTop: 12, color: '#8B5CF6' }}>
                    ✨ Explicações personalizadas com IA — o texto acima e o do WhatsApp foram adaptados para esta pessoa.
                  </div>
                )}

                <div style={S.waBox}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>Enviar por WhatsApp</div>
                    <div style={{ fontSize: 13, color: '#667085' }}>
                      Para {normalizarTelefone(telefone).replace(/^55/, '')}
                    </div>
                  </div>
                  <button onClick={enviarWhatsApp} style={{ ...S.waBtn, background: enviado ? '#15803D' : '#25D366' }}>
                    {enviado ? '✓ Enviado' : '📲 Enviar no WhatsApp'}
                  </button>
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

function Orientacao({ e, titulo, texto }: { e: string; titulo: string; texto: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #ECEDEE', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12 }}>
      <span style={{ fontSize: 20 }}>{e}</span>
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

function Chip({ ativo, onClick, coluna, emoji, label, sub, children }: {
  ativo: boolean; onClick: () => void; coluna?: boolean;
  emoji?: string; label?: string; sub?: string; children?: React.ReactNode;
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
          {emoji && <span style={{ fontSize: 18, marginRight: 9 }}>{emoji}</span>}
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
  main: { maxWidth: 680, margin: '0 auto', padding: '32px 20px 90px' },
  hero: { textAlign: 'center', marginBottom: 28 },
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
  card: { background: '#fff', border: '1px solid #ECEDEE', borderRadius: 20, padding: 20, boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  pepEmoji: { fontSize: 28, width: 46, height: 46, borderRadius: 13, background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badge: { fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 100, whiteSpace: 'nowrap' },
  blocoTitulo: { display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 5, opacity: 0.9 },
  why: { fontSize: 13.5, color: '#374151', background: '#FAFAFA', borderRadius: 12, padding: '12px 14px', marginBottom: 10, lineHeight: 1.5 },
  whyIa: { fontSize: 13.5, color: '#5B21B6', background: '#F7F5FF', border: '1px solid #EDE9FE', borderRadius: 12, padding: '12px 14px', marginBottom: 10, lineHeight: 1.5 },
  comoUsar: { fontSize: 13.5, color: '#075985', background: '#F0F9FF', border: '1px solid #E0F2FE', borderRadius: 12, padding: '12px 14px', marginBottom: 14, lineHeight: 1.5 },
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
    boxShadow: '0 4px 12px rgba(37,211,102,.28)',
  },
  disclaimer: { fontSize: 12, color: '#98A2B3', lineHeight: 1.6, marginTop: 30, textAlign: 'center', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' },
};
