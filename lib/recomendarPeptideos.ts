// ════════════════════════════════════════════════
//  NUVITA — lib/recomendarPeptideos.ts
//  Motor de recomendação para o balcão de farmácia.
//  Determinístico e instantâneo (sem dependência de IA/rede),
//  reaproveitando o catálogo de lib/peptides.ts.
// ════════════════════════════════════════════════

import type { ObjectiveKey, Peptide } from '@/types';
import { PEPTIDES } from '@/lib/peptides';

export type NivelFarmacia = 'iniciante' | 'intermediario' | 'avancado';
export type AtividadeFarmacia = 'sedentario' | 'moderado' | 'ativo' | 'muito_ativo';
export type SonoFarmacia = 'ruim' | 'regular' | 'bom';

// Condições que aplicam filtros de segurança no protocolo.
export type CondicaoSaude =
  | 'nenhuma'
  | 'diabetes'
  | 'hipertensao'
  | 'cancer'
  | 'gestacao'
  | 'tireoide';

export interface RespostasFarmacia {
  nome: string;
  telefone: string;
  sexo?: 'masculino' | 'feminino' | 'ni';
  objetivos: ObjectiveKey[];
  nivel: NivelFarmacia;
  condicoes: CondicaoSaude[];
  peso?: number;   // kg — usado na dose (peptídeos dose/kg) e no IMC
  altura?: number; // cm — usado no IMC
  idade?: number;  // anos
  atividade?: AtividadeFarmacia;
  sono?: SonoFarmacia;
}

// Calcula o IMC e sua classificação a partir de peso (kg) e altura (cm).
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

export interface RecomendacaoItem {
  peptide: Peptide;
  dose: string;
  prioridade: 'essencial' | 'recomendado' | 'opcional';
}

export interface Recomendacao {
  itens: RecomendacaoItem[];
  bloqueado: boolean;       // true = não recomendar nada (ex.: gestação)
  avisos: string[];         // avisos de segurança para o atendente
  removidosPorSeguranca: string[];
}

// Quantidade máxima de peptídeos por nível de experiência.
const MAX_POR_NIVEL: Record<NivelFarmacia, number> = {
  iniciante: 2,
  intermediario: 3,
  avancado: 4,
};

// Peptídeos que afetam glicemia — evitar em diabetes sem supervisão.
const GLICEMICOS = new Set(['Tirzepatide', 'Semaglutide', 'MK-677 (Ibutamoren)']);
// Peptídeos anabólicos / secretagogos de GH — evitar em histórico oncológico.
const ANABOLICOS = new Set([
  'Ipamorelin',
  'CJC-1295',
  'MK-677 (Ibutamoren)',
  'IGF-1 LR3',
]);
// Evitar em hipertensão não controlada.
const PRESSORICOS = new Set(['PT-141 (Bremelanotida)']);

const PESO_PADRAO = 75; // referência para peptídeos dose/kg quando o peso não é informado

export function recomendarPeptideos(r: RespostasFarmacia): Recomendacao {
  const avisos: string[] = [];
  const removidos: string[] = [];
  const condicoes = new Set(r.condicoes.filter((c) => c !== 'nenhuma'));

  // Gestação/amamentação → nenhum peptídeo. Encaminhar a profissional de saúde.
  if (condicoes.has('gestacao')) {
    return {
      itens: [],
      bloqueado: true,
      avisos: [
        'Gestação/amamentação: nenhum peptídeo é recomendado. Oriente a cliente a procurar acompanhamento médico antes de qualquer uso.',
      ],
      removidosPorSeguranca: [],
    };
  }

  // 1) Reúne candidatos a partir dos objetivos (dedup, mantendo ordem de prioridade).
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

  // 2) Aplica filtros de segurança.
  const filtrados = candidatos.filter((p) => {
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

  // 3) Limita pela experiência.
  const limite = MAX_POR_NIVEL[r.nivel] ?? 2;
  const escolhidos = filtrados.slice(0, limite);

  const peso = r.peso && r.peso > 0 ? r.peso : PESO_PADRAO;
  const itens: RecomendacaoItem[] = escolhidos.map((p, i) => ({
    peptide: p,
    dose: p.doseStr(peso),
    prioridade: i === 0 ? 'essencial' : i === 1 ? 'recomendado' : 'opcional',
  }));

  if (itens.length === 0 && filtrados.length === 0 && candidatos.length > 0) {
    avisos.push('Todos os peptídeos indicados foram filtrados pelas condições de saúde. Recomende avaliação médica.');
  }

  return { itens, bloqueado: false, avisos, removidosPorSeguranca: removidos };
}

// ─── Refinamento com IA ────────────────────────────────────
export interface RefinamentoIA {
  resumo: string;
  explicacoes: Record<string, string>;  // nome do peptídeo -> motivo personalizado
  comoUsarIA: Record<string, string>;   // nome do peptídeo -> como usar personalizado
  orientacaoAlimentar: string;
  orientacaoTreino: string;
  observacoes: string;
  avisoMedico: string;
}

const OBJ_LABEL: Record<ObjectiveKey, string> = {
  gordura: 'Perda de gordura/emagrecimento',
  massa: 'Ganho de massa muscular',
  recuperacao: 'Recuperação e lesões',
  sono: 'Qualidade do sono',
  pele: 'Saúde da pele',
  longevidade: 'Longevidade',
  cognitivo: 'Performance cognitiva',
  hormonal: 'Equilíbrio hormonal/libido',
};

const NIVEL_LABEL: Record<NivelFarmacia, string> = {
  iniciante: 'Iniciante (nunca usou)',
  intermediario: 'Intermediário (alguma experiência)',
  avancado: 'Avançado (usa com frequência)',
};

const COND_LABEL: Record<CondicaoSaude, string> = {
  nenhuma: 'nenhuma',
  diabetes: 'diabetes/pré-diabetes',
  hipertensao: 'hipertensão',
  cancer: 'histórico de câncer',
  gestacao: 'gestação/amamentação',
  tireoide: 'alteração de tireoide',
};

/**
 * Refina o protocolo determinístico usando a IA (rota /api/ia).
 * Mantém as doses/timing exatos do catálogo (seguros) e apenas
 * personaliza a EXPLICAÇÃO de cada peptídeo + orientações.
 * Retorna null em caso de erro — o protocolo base continua válido.
 */
export async function refinarProtocoloIA(
  r: RespostasFarmacia,
  rec: Recomendacao,
): Promise<RefinamentoIA | null> {
  if (!rec.itens.length) return null;
  try {
    const objetivos = r.objetivos.map((o) => OBJ_LABEL[o] || o).join(', ');
    const condicoes = r.condicoes.filter((c) => c !== 'nenhuma').map((c) => COND_LABEL[c] || c);
    const imc = calcularIMC(r.peso, r.altura);
    const atividadeLabel: Record<AtividadeFarmacia, string> = {
      sedentario: 'sedentário', moderado: 'moderadamente ativo', ativo: 'ativo', muito_ativo: 'muito ativo',
    };
    const sonoLabel: Record<SonoFarmacia, string> = { ruim: 'ruim', regular: 'regular', bom: 'bom' };
    const lista = rec.itens
      .map((it, i) => `${i + 1}. ${it.peptide.n} — dose ${it.dose}, ${it.peptide.freq}, via ${it.peptide.route}. Aplicação: ${it.peptide.how} (${it.prioridade})`)
      .join('\n');

    const context = `PERFIL DA PESSOA (atendimento em farmácia):
Nome: ${r.nome}
Sexo: ${r.sexo || 'não informado'}
Idade: ${r.idade ? `${r.idade} anos` : 'não informada'}
Peso/Altura: ${r.peso ? `${r.peso} kg` : '?'} / ${r.altura ? `${r.altura} cm` : '?'}${imc ? ` — IMC ${imc.valor} (${imc.classe})` : ''}
Nível de atividade física: ${r.atividade ? atividadeLabel[r.atividade] : 'não informado'}
Qualidade do sono: ${r.sono ? sonoLabel[r.sono] : 'não informada'}
Objetivo(s): ${objetivos}
Experiência com peptídeos: ${NIVEL_LABEL[r.nivel]}
Condições de saúde: ${condicoes.length ? condicoes.join(', ') : 'nenhuma declarada'}

PEPTÍDEOS JÁ SELECIONADOS PARA ESTA PESSOA (não altere, não adicione, não remova):
${lista}`;

    const system = `Sua tarefa: PERSONALIZAR a explicação dos peptídeos JÁ escolhidos acima para ESTA pessoa específica. O texto será lido pelo ATENDENTE da farmácia para explicar ao paciente.

REGRAS INVIOLÁVEIS:
- NÃO sugira outros peptídeos. NÃO remova nenhum. Trabalhe SOMENTE com a lista fornecida.
- NÃO altere doses, frequência ou via — isso já está definido.
- Fale de forma simples e acolhedora, como um atendente explicaria no balcão a uma pessoa leiga.
- Leve em conta idade, IMC, atividade física e sono no que fizer sentido.
- Para cada peptídeo dê DOIS textos: (1) POR QUE faz sentido para esta pessoa e (2) COMO USAR na prática, em linguagem simples que o paciente entenda.

Responda APENAS JSON válido, sem texto fora do JSON:
{
  "resumo": "2-3 frases: por que este conjunto de peptídeos para esta pessoa, considerando o perfil dela",
  "itens": [
    {
      "nome": "nome exato do peptídeo conforme a lista",
      "motivo": "por que ELA deve usar este peptídeo — específico ao objetivo e perfil (idade/IMC/atividade/sono), 1-2 frases simples",
      "comoUsar": "como usar na prática em linguagem simples: quando aplicar, como aplicar e uma dica de adesão, 1-2 frases"
    }
  ],
  "orientacaoAlimentar": "orientação alimentar prática ligada ao objetivo e ao IMC (1-2 frases)",
  "orientacaoTreino": "orientação de atividade física considerando o nível atual dela (1-2 frases)",
  "observacoes": "o que observar nas primeiras semanas e como saber se está funcionando (1-2 frases)",
  "avisoMedico": "aviso de segurança considerando idade e condições de saúde declaradas"
}`;

    const res = await fetch('/api/ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, context, messages: [{ role: 'user', content: context }] }),
    });
    const data = await res.json();
    const texto: string = data?.text || '';
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);

    const explicacoes: Record<string, string> = {};
    const comoUsarIA: Record<string, string> = {};
    if (Array.isArray(parsed.itens)) {
      for (const it of parsed.itens) {
        if (it?.nome && it?.motivo) explicacoes[String(it.nome)] = String(it.motivo);
        if (it?.nome && it?.comoUsar) comoUsarIA[String(it.nome)] = String(it.comoUsar);
      }
    }
    return {
      resumo: String(parsed.resumo || ''),
      explicacoes,
      comoUsarIA,
      orientacaoAlimentar: String(parsed.orientacaoAlimentar || ''),
      orientacaoTreino: String(parsed.orientacaoTreino || ''),
      observacoes: String(parsed.observacoes || ''),
      avisoMedico: String(parsed.avisoMedico || ''),
    };
  } catch (e) {
    console.error('Erro ao refinar protocolo com IA:', e);
    return null;
  }
}

// Monta o texto do protocolo para envio por WhatsApp.
export function montarMensagemWhatsApp(
  r: RespostasFarmacia,
  rec: Recomendacao,
  ia?: RefinamentoIA | null,
): string {
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

  if (ia?.resumo) {
    L.push(ia.resumo);
    L.push('');
  }

  rec.itens.forEach((it, i) => {
    const p = it.peptide;
    const motivo = ia?.explicacoes[p.n] || p.why;
    const comoUsar = ia?.comoUsarIA[p.n] || p.how;
    L.push(`${i + 1}. ${p.e} *${p.n}*`);
    L.push(`   • Dose: ${it.dose}`);
    L.push(`   • Frequência: ${p.freq}`);
    L.push(`   • Quando: ${p.timing}`);
    L.push(`   • Via: ${p.route}`);
    L.push(`   • Ciclo: ${p.cycle}`);
    if (motivo) L.push(`   • Por quê: ${motivo}`);
    if (comoUsar) L.push(`   • Como usar: ${comoUsar}`);
    L.push('');
  });

  if (ia?.orientacaoAlimentar) {
    L.push(`🥗 *Alimentação:* ${ia.orientacaoAlimentar}`);
  }
  if (ia?.orientacaoTreino) {
    L.push(`🏋️ *Treino:* ${ia.orientacaoTreino}`);
  }
  if (ia?.observacoes) {
    L.push(`👀 *O que observar:* ${ia.observacoes}`);
  }
  if (ia?.orientacaoAlimentar || ia?.orientacaoTreino || ia?.observacoes) {
    L.push('');
  }

  const aviso = ia?.avisoMedico ||
    'Este protocolo é uma orientação inicial. Cada organismo reage de forma diferente — em caso de dúvida, consulte um profissional de saúde.';
  L.push(`_${aviso}_`);
  L.push('');
  L.push('Nuvita 💚');
  return L.join('\n');
}

// Normaliza telefone para link wa.me (só dígitos, com DDI 55 para o Brasil).
export function normalizarTelefone(tel: string): string {
  let d = (tel || '').replace(/\D/g, '');
  if (d.length <= 11 && !d.startsWith('55')) d = '55' + d;
  return d;
}
