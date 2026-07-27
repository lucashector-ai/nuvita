// ════════════════════════════════════════════════
//  NUVITA — lib/recomendarPeptideos.ts
//  Diagnóstico do balcão de farmácia.
//  - diagnosticarComIA: a IA faz o diagnóstico e escolhe de 3 a 6
//    peptídeos do catálogo, considerando sexo/objetivo/perfil.
//  - recomendarPeptideos: fallback determinístico (instantâneo),
//    usado quando a IA não está disponível.
//  As doses/timing vêm SEMPRE do catálogo (seguras) e a segurança
//  é reaplicada aqui, nunca confiando cegamente na IA.
// ════════════════════════════════════════════════

import type { ObjectiveKey, Peptide } from '@/types';
import { PEPTIDES, ALL_PEPTIDES, findPeptide } from '@/lib/peptides';

export { ALL_PEPTIDES, findPeptide } from '@/lib/peptides';

export type NivelFarmacia = 'iniciante' | 'intermediario' | 'avancado';
export type AtividadeFarmacia = 'sedentario' | 'moderado' | 'ativo' | 'muito_ativo';
export type SonoFarmacia = 'ruim' | 'regular' | 'bom';

export type CondicaoSaude =
  | 'nenhuma'
  | 'diabetes'
  | 'hipertensao'
  | 'cancer'
  | 'gestacao'
  | 'tireoide'
  | 'outros';

export interface RespostasFarmacia {
  nome: string;
  telefone: string;
  sexo?: 'masculino' | 'feminino' | 'ni';
  objetivos: ObjectiveKey[];
  nivel: NivelFarmacia;
  condicoes: CondicaoSaude[];
  condicaoOutros?: string;
  peso?: number;
  altura?: number;
  idade?: number;
  atividade?: AtividadeFarmacia;
  sono?: SonoFarmacia;
}

export interface RecomendacaoItem {
  peptide: Peptide;
  dose: string;
  prioridade: 'essencial' | 'recomendado' | 'opcional';
  motivo?: string;   // por que para esta pessoa
  comoUsar?: string; // como usar na prática
}

export interface Recomendacao {
  fonte: 'ia' | 'deterministico';
  itens: RecomendacaoItem[];
  bloqueado: boolean;
  avisos: string[];
  removidosPorSeguranca: string[];
  resumo?: string;
  orientacaoAlimentar?: string;
  orientacaoTreino?: string;
  observacoes?: string;
  avisoMedico?: string;
}

// ─── Labels ────────────────────────────────────────────────
export const OBJ_LABEL: Record<ObjectiveKey, string> = {
  gordura: 'Perda de gordura/emagrecimento',
  massa: 'Ganho de massa muscular',
  recuperacao: 'Recuperação e lesões',
  sono: 'Qualidade do sono',
  pele: 'Saúde da pele / anti-idade',
  longevidade: 'Longevidade / energia',
  cognitivo: 'Performance cognitiva / foco',
  hormonal: 'Equilíbrio hormonal / libido',
};

const NIVEL_LABEL: Record<NivelFarmacia, string> = {
  iniciante: 'Iniciante (nunca usou)',
  intermediario: 'Intermediário (alguma experiência)',
  avancado: 'Avançado (usa com frequência)',
};

const ATIVIDADE_LABEL: Record<AtividadeFarmacia, string> = {
  sedentario: 'sedentário', moderado: 'moderadamente ativo', ativo: 'ativo', muito_ativo: 'muito ativo',
};
const SONO_LABEL: Record<SonoFarmacia, string> = { ruim: 'ruim', regular: 'regular', bom: 'bom' };

const COND_LABEL: Record<CondicaoSaude, string> = {
  nenhuma: 'nenhuma',
  diabetes: 'diabetes/pré-diabetes',
  hipertensao: 'hipertensão',
  cancer: 'histórico de câncer',
  gestacao: 'gestação/amamentação',
  tireoide: 'alteração de tireoide',
  outros: 'outra condição',
};

// ─── Segurança ─────────────────────────────────────────────
const GLICEMICOS = new Set(['Tirzepatide', 'Semaglutide', 'MK-677 (Ibutamoren)']);
const ANABOLICOS = new Set(['Ipamorelin', 'CJC-1295', 'MK-677 (Ibutamoren)', 'IGF-1 LR3']);
const PRESSORICOS = new Set(['PT-141 (Bremelanotida)']);

const PESO_PADRAO = 75;
const MAX_ITENS = 6;

// Limite mínimo/base do determinístico por nível (o fallback também é generoso).
const BASE_POR_NIVEL: Record<NivelFarmacia, number> = {
  iniciante: 3,
  intermediario: 4,
  avancado: 6,
};

export function calcularIMC(
  peso?: number,
  altura?: number,
): { valor: number; classe: string } | null {
  if (!peso || !altura || peso <= 0 || altura <= 0) return null;
  const m = altura / 100;
  const v = peso / (m * m);
  const valor = Math.round(v * 10) / 10;
  let classe = 'peso normal';
  if (v < 18.5) classe = 'abaixo do peso';
  else if (v < 25) classe = 'peso normal';
  else if (v < 30) classe = 'sobrepeso';
  else classe = 'obesidade';
  return { valor, classe };
}

/**
 * Aplica os filtros de segurança sobre uma lista de peptídeos.
 * Retorna os peptídeos permitidos, os removidos e avisos.
 */
function aplicarSeguranca(
  peptides: Peptide[],
  r: RespostasFarmacia,
): { permitidos: Peptide[]; removidos: string[]; avisos: string[]; bloqueado: boolean } {
  const condicoes = new Set(r.condicoes.filter((c) => c !== 'nenhuma'));
  const avisos: string[] = [];
  const removidos: string[] = [];

  if (condicoes.has('gestacao')) {
    return {
      permitidos: [],
      removidos: [],
      bloqueado: true,
      avisos: [
        'Gestação/amamentação: nenhum peptídeo é recomendado. Oriente a cliente a procurar acompanhamento médico antes de qualquer uso.',
      ],
    };
  }

  const permitidos = peptides.filter((p) => {
    if (condicoes.has('diabetes') && GLICEMICOS.has(p.n)) {
      removidos.push(`${p.n} (afeta glicemia — diabetes)`);
      return false;
    }
    if (condicoes.has('cancer') && ANABOLICOS.has(p.n)) {
      removidos.push(`${p.n} (anabólico — histórico oncológico)`);
      return false;
    }
    if (condicoes.has('hipertensao') && PRESSORICOS.has(p.n)) {
      removidos.push(`${p.n} (pode elevar a pressão — hipertensão)`);
      return false;
    }
    return true;
  });

  if (condicoes.has('tireoide')) {
    avisos.push('Alteração de tireoide: use secretagogos de GH (Ipamorelin, CJC-1295, MK-677) com acompanhamento médico.');
  }
  if (condicoes.has('diabetes')) {
    avisos.push('Diabetes/pré-diabetes: monitorar glicemia. Peptídeos glicêmicos só com supervisão médica.');
  }
  if (condicoes.has('outros') && r.condicaoOutros?.trim()) {
    avisos.push(`Condição informada: "${r.condicaoOutros.trim()}". Não há filtro automático para ela — avalie a compatibilidade e recomende avaliação médica em caso de dúvida.`);
  }

  return { permitidos, removidos, avisos, bloqueado: false };
}

function prioridadeDe(i: number): RecomendacaoItem['prioridade'] {
  return i === 0 ? 'essencial' : i <= 2 ? 'recomendado' : 'opcional';
}

// ─── Fallback determinístico ───────────────────────────────
export function recomendarPeptideos(r: RespostasFarmacia): Recomendacao {
  const seen = new Set<string>();
  const candidatos: Peptide[] = [];
  const objetivos = r.objetivos.length ? r.objetivos : (['gordura'] as ObjectiveKey[]);
  objetivos.forEach((obj) => {
    (PEPTIDES[obj] ?? []).forEach((p) => {
      if (!seen.has(p.n)) {
        seen.add(p.n);
        candidatos.push(p);
      }
    });
  });

  const seg = aplicarSeguranca(candidatos, r);
  if (seg.bloqueado) {
    return { fonte: 'deterministico', itens: [], bloqueado: true, avisos: seg.avisos, removidosPorSeguranca: [] };
  }

  // Mais objetivos → mais produtos (até MAX_ITENS).
  const limite = Math.min(MAX_ITENS, Math.max(BASE_POR_NIVEL[r.nivel] ?? 3, objetivos.length + 1));
  const escolhidos = seg.permitidos.slice(0, limite);
  const peso = r.peso && r.peso > 0 ? r.peso : PESO_PADRAO;

  const itens: RecomendacaoItem[] = escolhidos.map((p, i) => ({
    peptide: p,
    dose: p.doseStr(peso),
    prioridade: prioridadeDe(i),
    motivo: p.why,
    comoUsar: p.how,
  }));

  return {
    fonte: 'deterministico',
    itens,
    bloqueado: false,
    avisos: seg.avisos,
    removidosPorSeguranca: seg.removidos,
  };
}

// ─── Perfil legível (enviado à IA) ─────────────────────────
export function montarPerfilTexto(r: RespostasFarmacia): string {
  const imc = calcularIMC(r.peso, r.altura);
  const objetivos = r.objetivos.map((o) => OBJ_LABEL[o] || o).join(', ');
  const condicoes = r.condicoes
    .filter((c) => c !== 'nenhuma')
    .map((c) => (c === 'outros' && r.condicaoOutros?.trim() ? r.condicaoOutros.trim() : COND_LABEL[c] || c));
  const sexoLabel = r.sexo === 'masculino' ? 'homem' : r.sexo === 'feminino' ? 'mulher' : 'não informado';

  return `Nome: ${r.nome}
Sexo: ${sexoLabel}
Idade: ${r.idade ? `${r.idade} anos` : 'não informada'}
Peso/Altura: ${r.peso ? `${r.peso} kg` : '?'} / ${r.altura ? `${r.altura} cm` : '?'}${imc ? ` — IMC ${imc.valor} (${imc.classe})` : ''}
Nível de atividade física: ${r.atividade ? ATIVIDADE_LABEL[r.atividade] : 'não informado'}
Qualidade do sono: ${r.sono ? SONO_LABEL[r.sono] : 'não informada'}
Objetivo(s): ${objetivos || 'não informado'}
Experiência com peptídeos: ${NIVEL_LABEL[r.nivel]}
Condições de saúde: ${condicoes.length ? condicoes.join(', ') : 'nenhuma declarada'}`;
}

// ─── Diagnóstico com IA (a IA escolhe os produtos) ─────────
export async function diagnosticarComIA(r: RespostasFarmacia): Promise<Recomendacao | null> {
  // Gestação bloqueia antes mesmo de chamar a IA.
  const segPrevia = aplicarSeguranca(ALL_PEPTIDES, r);
  if (segPrevia.bloqueado) {
    return { fonte: 'ia', itens: [], bloqueado: true, avisos: segPrevia.avisos, removidosPorSeguranca: [] };
  }

  try {
    const res = await fetch('/api/farmacia/diagnostico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil: montarPerfilTexto(r) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const texto: string = data?.text || '';
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed.peptideos) || parsed.peptideos.length === 0) return null;

    // Mapeia nomes escolhidos pela IA para o catálogo (dedup + só existentes).
    const seen = new Set<string>();
    const selecionados: { p: Peptide; motivo?: string; comoUsar?: string }[] = [];
    for (const item of parsed.peptideos) {
      const p = findPeptide(String(item?.nome || ''));
      if (p && !seen.has(p.n)) {
        seen.add(p.n);
        selecionados.push({
          p,
          motivo: item?.motivo ? String(item.motivo) : undefined,
          comoUsar: item?.comoUsar ? String(item.comoUsar) : undefined,
        });
      }
    }
    if (selecionados.length === 0) return null;

    // Reaplica segurança sobre a seleção da IA (nunca confiar cegamente).
    const seg = aplicarSeguranca(selecionados.map((s) => s.p), r);
    const permitidosNomes = new Set(seg.permitidos.map((p) => p.n));
    const finais = selecionados.filter((s) => permitidosNomes.has(s.p.n)).slice(0, MAX_ITENS);
    if (finais.length === 0) {
      return { fonte: 'ia', itens: [], bloqueado: false, avisos: seg.avisos, removidosPorSeguranca: seg.removidos };
    }

    const peso = r.peso && r.peso > 0 ? r.peso : PESO_PADRAO;
    const itens: RecomendacaoItem[] = finais.map((s, i) => ({
      peptide: s.p,
      dose: s.p.doseStr(peso),
      prioridade: prioridadeDe(i),
      motivo: s.motivo || s.p.why,
      comoUsar: s.comoUsar || s.p.how,
    }));

    return {
      fonte: 'ia',
      itens,
      bloqueado: false,
      avisos: seg.avisos,
      removidosPorSeguranca: seg.removidos,
      resumo: parsed.resumo ? String(parsed.resumo) : undefined,
      orientacaoAlimentar: parsed.orientacaoAlimentar ? String(parsed.orientacaoAlimentar) : undefined,
      orientacaoTreino: parsed.orientacaoTreino ? String(parsed.orientacaoTreino) : undefined,
      observacoes: parsed.observacoes ? String(parsed.observacoes) : undefined,
      avisoMedico: parsed.avisoMedico ? String(parsed.avisoMedico) : undefined,
    };
  } catch (e) {
    console.error('Erro no diagnóstico com IA:', e);
    return null;
  }
}

// ─── Contraindicação de um peptídeo específico ─────────────
// No modo "um peptídeo" a pessoa já escolheu o produto — não removemos,
// mas sinalizamos claramente qualquer incompatibilidade.
function checarContraindicacao(p: Peptide, r: RespostasFarmacia): string[] {
  const cond = new Set(r.condicoes.filter((c) => c !== 'nenhuma'));
  const msgs: string[] = [];
  if (cond.has('diabetes') && GLICEMICOS.has(p.n)) {
    msgs.push(`⚠️ ${p.n} afeta a glicemia e a pessoa tem diabetes — usar apenas com supervisão médica.`);
  }
  if (cond.has('cancer') && ANABOLICOS.has(p.n)) {
    msgs.push(`⚠️ ${p.n} é anabólico/secretagogo de GH e há histórico de câncer — evitar sem liberação médica.`);
  }
  if (cond.has('hipertensao') && PRESSORICOS.has(p.n)) {
    msgs.push(`⚠️ ${p.n} pode elevar a pressão e a pessoa tem hipertensão — evitar sem avaliação médica.`);
  }
  return msgs;
}

// Fallback determinístico para o protocolo de UM peptídeo.
export function protocoloUmPeptideo(r: RespostasFarmacia, nomePeptideo: string): Recomendacao {
  const p = findPeptide(nomePeptideo);
  const condicoes = new Set(r.condicoes.filter((c) => c !== 'nenhuma'));

  if (condicoes.has('gestacao')) {
    return {
      fonte: 'deterministico',
      itens: [],
      bloqueado: true,
      avisos: ['Gestação/amamentação: nenhum peptídeo é recomendado. Procure acompanhamento médico.'],
      removidosPorSeguranca: [],
    };
  }
  if (!p) {
    return { fonte: 'deterministico', itens: [], bloqueado: false, avisos: ['Peptídeo não encontrado no catálogo.'], removidosPorSeguranca: [] };
  }

  const peso = r.peso && r.peso > 0 ? r.peso : PESO_PADRAO;
  const avisos = checarContraindicacao(p, r);
  if (condicoes.has('outros') && r.condicaoOutros?.trim()) {
    avisos.push(`Condição informada: "${r.condicaoOutros.trim()}". Avalie a compatibilidade com ${p.n}.`);
  }
  return {
    fonte: 'deterministico',
    itens: [{ peptide: p, dose: p.doseStr(peso), prioridade: 'essencial', motivo: p.why, comoUsar: p.how }],
    bloqueado: false,
    avisos,
    removidosPorSeguranca: [],
  };
}

// Protocolo de UM peptídeo com a IA (deep dive personalizado).
export async function diagnosticarUmPeptideoIA(r: RespostasFarmacia, nomePeptideo: string): Promise<Recomendacao | null> {
  const p = findPeptide(nomePeptideo);
  if (!p) return null;

  const condicoes = new Set(r.condicoes.filter((c) => c !== 'nenhuma'));
  if (condicoes.has('gestacao')) {
    return {
      fonte: 'ia',
      itens: [],
      bloqueado: true,
      avisos: ['Gestação/amamentação: nenhum peptídeo é recomendado. Procure acompanhamento médico.'],
      removidosPorSeguranca: [],
    };
  }

  try {
    const res = await fetch('/api/farmacia/diagnostico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil: montarPerfilTexto(r), modo: 'unico', peptideo: p.n }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const texto: string = data?.text || '';
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);

    const item = Array.isArray(parsed.peptideos) ? parsed.peptideos[0] : null;
    const peso = r.peso && r.peso > 0 ? r.peso : PESO_PADRAO;

    const avisos = checarContraindicacao(p, r);
    if (condicoes.has('outros') && r.condicaoOutros?.trim()) {
      avisos.push(`Condição informada: "${r.condicaoOutros.trim()}". Avalie a compatibilidade com ${p.n}.`);
    }

    return {
      fonte: 'ia',
      itens: [{
        peptide: p,
        dose: p.doseStr(peso),
        prioridade: 'essencial',
        motivo: item?.motivo ? String(item.motivo) : p.why,
        comoUsar: item?.comoUsar ? String(item.comoUsar) : p.how,
      }],
      bloqueado: false,
      avisos,
      removidosPorSeguranca: [],
      resumo: parsed.resumo ? String(parsed.resumo) : undefined,
      orientacaoAlimentar: parsed.orientacaoAlimentar ? String(parsed.orientacaoAlimentar) : undefined,
      orientacaoTreino: parsed.orientacaoTreino ? String(parsed.orientacaoTreino) : undefined,
      observacoes: parsed.observacoes ? String(parsed.observacoes) : undefined,
      avisoMedico: parsed.avisoMedico ? String(parsed.avisoMedico) : undefined,
    };
  } catch (e) {
    console.error('Erro no protocolo de um peptídeo:', e);
    return null;
  }
}

// ─── Mensagem de WhatsApp ──────────────────────────────────
export function montarMensagemWhatsApp(r: RespostasFarmacia, rec: Recomendacao): string {
  const L: string[] = [];
  L.push(`*Nuvita — Protocolo Personalizado*`);
  L.push('');
  L.push(`Olá, ${r.nome.split(' ')[0] || r.nome}! 👋`);
  L.push(`Aqui está a recomendação de peptídeos montada pra você:`);
  L.push('');

  if (rec.bloqueado) {
    L.push('⚠️ No seu caso, recomendamos procurar acompanhamento médico antes de iniciar qualquer peptídeo.');
    return L.join('\n');
  }
  if (rec.itens.length === 0) {
    L.push('Não foi possível montar um protocolo seguro com as informações fornecidas. Procure um profissional de saúde.');
    return L.join('\n');
  }

  if (rec.resumo) {
    L.push(rec.resumo);
    L.push('');
  }

  rec.itens.forEach((it, i) => {
    const p = it.peptide;
    L.push(`${i + 1}. ${p.e} *${p.n}*`);
    L.push(`   • Dose: ${it.dose}`);
    L.push(`   • Frequência: ${p.freq}`);
    L.push(`   • Quando: ${p.timing}`);
    L.push(`   • Via: ${p.route}`);
    L.push(`   • Ciclo: ${p.cycle}`);
    if (it.motivo) L.push(`   • Por quê: ${it.motivo}`);
    if (it.comoUsar) L.push(`   • Como usar: ${it.comoUsar}`);
    L.push('');
  });

  if (rec.orientacaoAlimentar) L.push(`🥗 *Alimentação:* ${rec.orientacaoAlimentar}`);
  if (rec.orientacaoTreino) L.push(`🏋️ *Treino:* ${rec.orientacaoTreino}`);
  if (rec.observacoes) L.push(`👀 *O que observar:* ${rec.observacoes}`);
  if (rec.orientacaoAlimentar || rec.orientacaoTreino || rec.observacoes) L.push('');

  const aviso = rec.avisoMedico ||
    'Este protocolo é uma orientação inicial. Cada organismo reage de forma diferente — em caso de dúvida, consulte um profissional de saúde.';
  L.push(`_${aviso}_`);
  L.push('');
  L.push('Nuvita 💚');
  return L.join('\n');
}

export function normalizarTelefone(tel: string): string {
  let d = (tel || '').replace(/\D/g, '');
  if (d.length <= 11 && !d.startsWith('55')) d = '55' + d;
  return d;
}
