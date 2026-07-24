// ════════════════════════════════════════════════
//  NUVITA — app/farmacia/page.tsx
//  Balcão de farmácia: o atendente faz o diagnóstico
//  no tablet, gera o protocolo e envia por WhatsApp.
//  Tudo em uma página só, otimizada para toque.
// ════════════════════════════════════════════════

'use client';

import { useMemo, useState } from 'react';
import type { ObjectiveKey } from '@/types';
import PinGate from '@/components/farmacia/PinGate';
import {
  recomendarPeptideos,
  refinarProtocoloIA,
  montarMensagemWhatsApp,
  normalizarTelefone,
  type RespostasFarmacia,
  type NivelFarmacia,
  type CondicaoSaude,
  type Recomendacao,
  type RefinamentoIA,
} from '@/lib/recomendarPeptideos';

// ─── Opções das perguntas (poucas e assertivas) ───────────
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
  { key: 'iniciante', label: 'Nunca usou', sub: 'Primeira vez com peptídeos' },
  { key: 'intermediario', label: 'Já usou', sub: 'Tem alguma experiência' },
  { key: 'avancado', label: 'Usa com frequência', sub: 'Experiente' },
];

const CONDICOES: { key: CondicaoSaude; label: string; e: string }[] = [
  { key: 'nenhuma', label: 'Nenhuma', e: '✅' },
  { key: 'diabetes', label: 'Diabetes', e: '🩸' },
  { key: 'hipertensao', label: 'Pressão alta', e: '❤️' },
  { key: 'tireoide', label: 'Tireoide', e: '🦋' },
  { key: 'cancer', label: 'Histórico de câncer', e: '🎗️' },
  { key: 'gestacao', label: 'Gestante / amamentando', e: '🤰' },
];

const PRIORIDADE_STYLE: Record<string, { bg: string; tx: string; label: string }> = {
  essencial: { bg: '#DCFCE7', tx: '#15803D', label: 'Essencial' },
  recomendado: { bg: '#FEF3C7', tx: '#B45309', label: 'Recomendado' },
  opcional: { bg: '#EFEFEF', tx: '#6B7280', label: 'Opcional' },
};

export default function FarmaciaPage() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'feminino' | 'ni' | ''>('');
  const [objetivos, setObjetivos] = useState<ObjectiveKey[]>([]);
  const [nivel, setNivel] = useState<NivelFarmacia | ''>('');
  const [condicoes, setCondicoes] = useState<CondicaoSaude[]>([]);

  const [rec, setRec] = useState<Recomendacao | null>(null);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [ia, setIa] = useState<RefinamentoIA | null>(null);
  const [refinando, setRefinando] = useState(false);
  const [iaErro, setIaErro] = useState('');

  const respostas = useMemo<RespostasFarmacia | null>(() => {
    if (!nome.trim() || !telefone.trim() || !objetivos.length || !nivel) return null;
    return {
      nome: nome.trim(),
      telefone: telefone.trim(),
      sexo: sexo || undefined,
      objetivos,
      nivel: nivel as NivelFarmacia,
      condicoes: condicoes.length ? condicoes : ['nenhuma'],
    };
  }, [nome, telefone, sexo, objetivos, nivel, condicoes]);

  // ─── Toggles ─────────────────────────────────────────────
  const toggleObjetivo = (k: ObjectiveKey) => {
    setObjetivos((prev) => {
      if (prev.includes(k)) return prev.filter((o) => o !== k);
      if (prev.length >= 3) return prev; // no máximo 3 objetivos — mantém foco
      return [...prev, k];
    });
  };

  const toggleCondicao = (k: CondicaoSaude) => {
    setCondicoes((prev) => {
      if (k === 'nenhuma') return prev.includes('nenhuma') ? [] : ['nenhuma'];
      const semNenhuma = prev.filter((c) => c !== 'nenhuma');
      return semNenhuma.includes(k)
        ? semNenhuma.filter((c) => c !== k)
        : [...semNenhuma, k];
    });
  };

  // ─── Gerar protocolo ─────────────────────────────────────
  const gerar = async () => {
    setErro('');
    setEnviado(false);
    setIa(null);
    setIaErro('');
    if (!nome.trim()) return setErro('Preencha o nome da pessoa.');
    if (normalizarTelefone(telefone).length < 12) return setErro('Preencha um telefone/WhatsApp válido com DDD.');
    if (!objetivos.length) return setErro('Selecione ao menos um objetivo.');
    if (!nivel) return setErro('Selecione a experiência com peptídeos.');

    const resultado = recomendarPeptideos(respostas!);
    setRec(resultado);

    // Captura de lead — best-effort, não bloqueia o atendimento.
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
          peptideos: resultado.itens.map((i) => i.peptide.n),
        }),
      });
    } catch {
      /* silencioso — não atrapalha o balcão */
    }

    // Rola até o resultado.
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
    setNome('');
    setTelefone('');
    setSexo('');
    setObjetivos([]);
    setNivel('');
    setCondicoes([]);
    setRec(null);
    setErro('');
    setEnviado(false);
    setIa(null);
    setIaErro('');
    setRefinando(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Máscara simples de telefone ─────────────────────────
  const onTelefone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    setTelefone(out);
  };

  return (
   <PinGate>
    <div style={{ minHeight: '100vh', background: '#F7F7F7' }} className="grad">
      {/* Cabeçalho */}
      <header style={S.header}>
        <div style={S.headerIn}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>💚</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.03em' }}>Nuvita</div>
              <div style={{ fontSize: 11, color: '#6B7280', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Balcão · Diagnóstico rápido
              </div>
            </div>
          </div>
          {rec && (
            <button className="btn btn-o" onClick={novoAtendimento} style={{ fontSize: 13 }}>
              ↺ Novo atendimento
            </button>
          )}
        </div>
      </header>

      <main style={S.main}>
        {/* ─── FORMULÁRIO ─── */}
        <div style={{ opacity: rec ? 0.55 : 1, pointerEvents: rec ? 'none' : 'auto', transition: 'opacity .2s' }}>
          <h1 style={S.h1}>Vamos encontrar os peptídeos certos</h1>
          <p style={S.lead}>Preencha com a pessoa. Leva menos de 1 minuto.</p>

          {/* Dados de contato */}
          <Section n="1" titulo="Dados de contato">
            <label style={S.label}>Nome da pessoa</label>
            <input
              className="inp"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={S.inpBig}
            />
            <label style={{ ...S.label, marginTop: 16 }}>WhatsApp (com DDD)</label>
            <input
              className="inp"
              placeholder="(11) 99999-9999"
              value={telefone}
              inputMode="numeric"
              onChange={(e) => onTelefone(e.target.value)}
              style={S.inpBig}
            />
            <div style={S.hint}>O protocolo será enviado para este número.</div>
          </Section>

          {/* Sexo */}
          <Section n="2" titulo="Sexo" opcional>
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

          {/* Objetivo */}
          <Section n="3" titulo="Objetivo principal" hint="Até 3 opções">
            <div style={S.gridAuto}>
              {OBJETIVOS.map((o) => (
                <Chip key={o.key} ativo={objetivos.includes(o.key)} onClick={() => toggleObjetivo(o.key)}>
                  <span style={{ fontSize: 20, marginRight: 8 }}>{o.e}</span>
                  {o.label}
                </Chip>
              ))}
            </div>
          </Section>

          {/* Experiência */}
          <Section n="4" titulo="Já usou peptídeos antes?">
            <div style={S.grid3}>
              {NIVEIS.map((o) => (
                <Chip key={o.key} ativo={nivel === o.key} onClick={() => setNivel(o.key)} coluna>
                  <strong style={{ fontSize: 15 }}>{o.label}</strong>
                  <span style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{o.sub}</span>
                </Chip>
              ))}
            </div>
          </Section>

          {/* Condições de saúde */}
          <Section n="5" titulo="Alguma condição de saúde?" hint="Importante para a segurança">
            <div style={S.gridAuto}>
              {CONDICOES.map((o) => (
                <Chip key={o.key} ativo={condicoes.includes(o.key)} onClick={() => toggleCondicao(o.key)}>
                  <span style={{ fontSize: 18, marginRight: 8 }}>{o.e}</span>
                  {o.label}
                </Chip>
              ))}
            </div>
          </Section>

          {erro && <div style={S.erro}>⚠️ {erro}</div>}

          {!rec && (
            <button className="btn btn-g fw" onClick={gerar} style={S.cta}>
              Gerar protocolo →
            </button>
          )}
        </div>

        {/* ─── RESULTADO ─── */}
        {rec && (
          <div id="resultado" style={{ marginTop: 40, animation: 'fu .4s ease' }}>
            <div style={S.divider} />

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.03em' }}>
                Protocolo de {nome.split(' ')[0]}
              </h2>
              <span className="pill">
                <span className="pdot" /> Gerado
              </span>
            </div>

            {/* Avisos de segurança */}
            {rec.avisos.map((a, i) => (
              <div key={i} className="disc" style={{ marginTop: 12 }}>
                {a}
              </div>
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
                {/* Resumo personalizado da IA */}
                {ia?.resumo && (
                  <div style={S.iaResumo}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                      ✨ Resumo personalizado
                    </div>
                    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{ia.resumo}</p>
                  </div>
                )}

                {/* Cards de peptídeos */}
                <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
                  {rec.itens.map((it) => {
                    const pr = PRIORIDADE_STYLE[it.prioridade];
                    const motivo = ia?.explicacoes[it.peptide.n];
                    const temIa = !!motivo;
                    return (
                      <div key={it.peptide.n} style={S.card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                          <span style={{ fontSize: 30 }}>{it.peptide.e}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.02em' }}>{it.peptide.n}</div>
                            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.4 }}>{it.peptide.m}</div>
                          </div>
                          <span style={{ ...S.badge, background: pr.bg, color: pr.tx }}>{pr.label}</span>
                        </div>
                        {(motivo || it.peptide.why) && (
                          <div style={temIa ? S.whyIa : S.why}>
                            {temIa ? '✨ Por que para você: ' : '💡 '}
                            {motivo || it.peptide.why}
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

                {/* Orientações personalizadas da IA */}
                {ia && (ia.orientacaoAlimentar || ia.orientacaoTreino || ia.observacoes || ia.avisoMedico) && (
                  <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                    {ia.orientacaoAlimentar && <Orientacao e="🥗" titulo="Alimentação" texto={ia.orientacaoAlimentar} />}
                    {ia.orientacaoTreino && <Orientacao e="🏋️" titulo="Treino" texto={ia.orientacaoTreino} />}
                    {ia.observacoes && <Orientacao e="👀" titulo="O que observar" texto={ia.observacoes} />}
                    {ia.avisoMedico && (
                      <div className="disc" style={{ marginTop: 2 }}>{ia.avisoMedico}</div>
                    )}
                  </div>
                )}

                {/* Refinar com IA */}
                {!ia && (
                  <button
                    onClick={refinar}
                    disabled={refinando}
                    style={{
                      ...S.iaBtn,
                      opacity: refinando ? 0.6 : 1,
                      cursor: refinando ? 'wait' : 'pointer',
                    }}
                  >
                    {refinando ? '✨ Personalizando com IA…' : '✨ Refinar e explicar com IA'}
                  </button>
                )}
                {iaErro && <div style={{ ...S.hint, color: '#B45309', marginTop: 10 }}>{iaErro}</div>}
                {ia && (
                  <div style={{ ...S.hint, marginTop: 12, color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: 6 }}>
                    ✨ Protocolo personalizado com IA — as explicações acima e o texto do WhatsApp foram adaptados para esta pessoa.
                  </div>
                )}

                {/* Envio WhatsApp */}
                <div style={S.waBox}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>Enviar protocolo por WhatsApp</div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>
                      Para {normalizarTelefone(telefone).replace(/^55/, '')}
                    </div>
                  </div>
                  <button
                    onClick={enviarWhatsApp}
                    style={{ ...S.waBtn, background: enviado ? '#15803D' : '#25D366' }}
                  >
                    {enviado ? '✓ Enviado' : '📲 Enviar no WhatsApp'}
                  </button>
                </div>

                <button className="btn btn-o fw" onClick={novoAtendimento} style={{ marginTop: 14, padding: 14 }}>
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
function Orientacao({ e, titulo, texto }: { e: string; titulo: string; texto: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12 }}>
      <span style={{ fontSize: 20 }}>{e}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{titulo}</div>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{texto}</div>
      </div>
    </div>
  );
}

function Section({
  n,
  titulo,
  hint,
  opcional,
  children,
}: {
  n: string;
  titulo: string;
  hint?: string;
  opcional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={S.section}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={S.stepNum}>{n}</span>
        <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.02em' }}>{titulo}</h3>
        {opcional && <span style={S.tagOpt}>opcional</span>}
        {hint && <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({
  ativo,
  onClick,
  coluna,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  coluna?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: coluna ? 'column' : 'row',
        alignItems: coluna ? 'flex-start' : 'center',
        justifyContent: coluna ? 'center' : 'flex-start',
        textAlign: 'left',
        gap: coluna ? 0 : 0,
        padding: '14px 16px',
        borderRadius: 14,
        border: ativo ? '2px solid #22C55E' : '1.5px solid #EBEBEB',
        background: ativo ? '#F2FCF7' : '#fff',
        color: '#0F1115',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all .13s',
        minHeight: 54,
        boxShadow: ativo ? '0 0 0 3px rgba(34,197,94,.1)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

function Spec({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div style={{ background: destaque ? '#F2FCF7' : '#F7F7F7', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: destaque ? 600 : 500, color: destaque ? '#15803D' : '#0F1115' }}>
        {valor}
      </div>
    </div>
  );
}

// ─── Estilos ───────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  header: { background: '#fff', borderBottom: '1px solid #EBEBEB', position: 'sticky', top: 0, zIndex: 50 },
  headerIn: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  main: { maxWidth: 720, margin: '0 auto', padding: '28px 20px 80px' },
  h1: { fontSize: 28, fontWeight: 600, letterSpacing: '-.04em', lineHeight: 1.15 },
  lead: { fontSize: 15, color: '#6B7280', marginTop: 6, marginBottom: 8 },
  section: { background: '#fff', border: '1px solid #EBEBEB', borderRadius: 18, padding: '20px', marginTop: 16 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#1A1D23',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  inpBig: { padding: '14px 16px', fontSize: 16, borderRadius: 12 },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  tagOpt: {
    fontSize: 11,
    color: '#9CA3AF',
    background: '#F7F7F7',
    padding: '2px 8px',
    borderRadius: 100,
    fontWeight: 500,
  },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 },
  gridAuto: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 },
  cta: { marginTop: 24, padding: 16, fontSize: 16, borderRadius: 14 },
  erro: {
    marginTop: 16,
    padding: '12px 16px',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    color: '#B91C1C',
    fontSize: 14,
  },
  divider: { height: 1, background: '#EBEBEB', margin: '0 0 24px' },
  card: { background: '#fff', border: '1px solid #EBEBEB', borderRadius: 18, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,.04)' },
  badge: { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap' },
  why: { fontSize: 13, color: '#374151', background: '#F7F7F7', borderRadius: 10, padding: '10px 12px', marginBottom: 12, lineHeight: 1.5 },
  whyIa: { fontSize: 13, color: '#5B21B6', background: '#F5F3FF', border: '1px solid #EDE9FE', borderRadius: 10, padding: '10px 12px', marginBottom: 12, lineHeight: 1.5 },
  iaResumo: { background: '#F5F3FF', border: '1px solid #EDE9FE', borderRadius: 16, padding: '16px 18px', marginTop: 16 },
  iaBtn: { width: '100%', marginTop: 18, padding: 15, borderRadius: 14, border: '1.5px solid #DDD6FE', background: '#F5F3FF', color: '#6D28D9', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, transition: 'all .14s' },
  specGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 },
  waBox: {
    marginTop: 22,
    padding: 18,
    background: '#fff',
    border: '1px solid #EBEBEB',
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  waBtn: {
    border: 'none',
    color: '#fff',
    padding: '14px 22px',
    borderRadius: 12,
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all .14s',
    whiteSpace: 'nowrap',
  },
  disclaimer: { fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, marginTop: 28, textAlign: 'center', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' },
};
