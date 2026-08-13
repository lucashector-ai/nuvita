// ════════════════════════════════════════════════
//  NUVITA — lib/peptides.ts
//  Base de dados de peptídeos extraída do HTML
// ════════════════════════════════════════════════

import type { Peptide, ObjectiveKey } from '@/types';

// ─── Helpers de dose ──────────────────────────────────────
const fixedDose  = (dose: string) => (_peso: number) => dose;
const perKg      = (base: number, unit: string) =>
  (peso: number) => `${Math.round(peso * base)} ${unit}`;

// ─── Catálogo de peptídeos ────────────────────────────────
const BPC157: Peptide = {
  n: 'BPC-157', m: 'Regeneração tecidual, gut healing, tendões e ligamentos',
  e: '🔄', why: 'Acelera a recuperação de lesões e melhora a integridade intestinal',
  freq: 'Diário', timing: 'Manhã, em jejum', route: 'Injeção',
  cycle: '8–12 semanas', rest: '4–8 semanas',
  how: 'Reconstituir com água bacteriostática. Armazenar refrigerado.',
  ck: true, doseStr: fixedDose('250–500 mcg'),
};

const TB500: Peptide = {
  n: 'TB-500', m: 'Reparo muscular, anti-inflamatório, regeneração tecidual sistêmica',
  e: '💪', why: 'Promove cicatrização e reduz inflamação crônica',
  freq: '2x/semana', timing: 'Qualquer horário', route: 'Injeção',
  cycle: '4–6 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática. Dose total semanal dividida em 2 aplicações.',
  ck: true, doseStr: fixedDose('2–2,5 mg'),
};

const IPAMORELIN: Peptide = {
  n: 'Ipamorelin', m: 'Secretagogo de GH, melhora sono, composição corporal e recuperação',
  e: '🌙', why: 'Estimula liberação pulsátil de GH sem impacto no cortisol',
  freq: 'Diário', timing: 'Antes de dormir, jejum de 2h', route: 'Injeção',
  cycle: '8–12 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática. Aplicar 30–60 min antes de dormir.',
  ck: true, doseStr: fixedDose('200–300 mcg'),
};

const TIRZEPATIDE: Peptide = {
  n: 'Tirzepatide', m: 'Agonista duplo GIP+GLP-1 — emagrecimento, saciedade, controle glicêmico',
  e: '🔥', why: 'O mais eficaz disponível para perda de gordura — reduz apetite, estimula lipólise e melhora metabolismo',
  freq: '1x/semana', timing: 'Mesmo dia da semana', route: 'Injeção',
  cycle: '12–24 semanas', rest: 'A critério médico',
  how: 'Dose inicial 2,5 mg/semana com titulação gradual a cada 4 semanas. Supervisão médica recomendada.',
  ck: true, doseStr: fixedDose('2,5–15 mg/sem'),
};

const SEMAGLUTIDE: Peptide = {
  n: 'Semaglutide', m: 'Agonista GLP-1 — saciedade, perda de gordura, controle glicêmico',
  e: '🔥', why: 'Reduz apetite e estimula lipólise seletiva',
  freq: '1x/semana', timing: 'Mesmo dia da semana', route: 'Injeção',
  cycle: '12–24 semanas', rest: 'A critério médico',
  how: 'Dose inicial baixa com titulação gradual. Supervisão médica recomendada.',
  ck: true, doseStr: fixedDose('0,25–2,4 mg/sem'),
};

const AOD9604: Peptide = {
  n: 'AOD-9604', m: 'Fragmento do GH lipolítico — queima gordura sem efeitos anabólicos',
  e: '🏃', why: 'Estimula lipólise sem alterar glicemia ou crescimento',
  freq: 'Diário', timing: 'Manhã, jejum', route: 'Injeção',
  cycle: '8–12 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática. Aplicar em jejum de 2h.',
  ck: true, doseStr: fixedDose('300 mcg'),
};

const IGF1LR3: Peptide = {
  n: 'IGF-1 LR3', m: 'Fator de crescimento análogo — hipertrofia muscular, síntese proteica',
  e: '🏋️', why: 'Potencializa síntese proteica e favorece hipertrofia muscular',
  freq: '5x/semana', timing: 'Pós-treino', route: 'Injeção',
  cycle: '4–6 semanas', rest: '4–6 semanas',
  how: 'Diluir em água bacteriostática acidificada (ácido acético 0,6%). Aplicar pós-treino.',
  ck: true, doseStr: perKg(1, 'mcg'),
};

const EPITALON: Peptide = {
  n: 'Epithalamin (Epitalon)', m: 'Tetra-peptídeo pineal — telômeros, sono, longevidade',
  e: '🌟', why: 'Estimula telomerase e melhora qualidade do sono profundo',
  freq: 'Protocolo de carga', timing: '1–2x/dia por 10–20 dias', route: 'Injeção',
  cycle: '10–20 dias', rest: '6–12 meses',
  how: 'Protocolo de carga: 10 dias consecutivos, 2x/dia. Reconstituir em água bacteriostática.',
  ck: true, doseStr: fixedDose('5–10 mg/dia'),
};

const THYMOSIN_A1: Peptide = {
  n: 'Timalfasina (Thymosin α1)', m: 'Imunomodulador — resposta imune, antiviral, longevidade',
  e: '🛡️', why: 'Regula o sistema imune e melhora a resposta a infecções',
  freq: '2x/semana', timing: 'Qualquer horário', route: 'Injeção',
  cycle: '8–12 semanas', rest: '4–6 semanas',
  how: 'Reconstituir com água bacteriostática. Estável 5–7 dias refrigerado.',
  ck: true, doseStr: fixedDose('1,6 mg'),
};

const GHK_CU: Peptide = {
  n: 'GHK-Cu (Tripeptídeo de cobre)', m: 'Síntese de colágeno, wound healing, antienvelhecimento dérmico',
  e: '✨', why: 'Estimula colágeno, elastina e regeneração celular na pele',
  freq: 'Diário', timing: 'À noite', route: 'Injeção',
  cycle: '8–16 semanas', rest: '4 semanas',
  how: 'Reconstituir em água bacteriostática e aplicar no subcutâneo.',
  ck: true, doseStr: fixedDose('1–2 mg/dia'),
};

const SEMAX: Peptide = {
  n: 'Semax', m: 'Neuropeptídeo — BDNF, foco, memória, neuroproteção',
  e: '🧠', why: 'Aumenta BDNF e dopamina, melhorando cognição e foco',
  freq: 'Diário', timing: 'Manhã', route: 'Injeção',
  cycle: '2–4 semanas', rest: '2 semanas',
  how: 'Gotas nasais: 1–3 gotas por narina. Preparação de 0,1% mais comum.',
  ck: true, doseStr: fixedDose('200–600 mcg/dia'),
};

const SELANK: Peptide = {
  n: 'Selank', m: 'Ansiolítico nootropico — GABA, memória, resistência ao estresse',
  e: '🧘', why: 'Reduz ansiedade sem sedação, melhora memória de trabalho',
  freq: 'Conforme necessidade', timing: 'Manhã ou ao sentir estresse', route: 'Injeção',
  cycle: '2–4 semanas', rest: '2 semanas',
  how: 'Gotas nasais: 2–3 gotas por narina. Solução de 0,15%.',
  ck: false, doseStr: fixedDose('250–500 mcg/dia'),
};

const PT141: Peptide = {
  n: 'PT-141 (Bremelanotida)', m: 'Receptor MC4R — libido, disfunção sexual, hormônios',
  e: '⚗️', why: 'Atua no SNC para melhorar libido e função sexual em ambos os sexos',
  freq: 'Conforme necessidade', timing: '1–4h antes da atividade sexual', route: 'Injeção',
  cycle: 'Conforme necessidade', rest: 'Não aplicável',
  how: 'Aplicar 1–2 mg no subcutâneo. Pode causar rubor facial transitório.',
  ck: false, doseStr: fixedDose('1–2 mg'),
};

// ─── Peptídeos adicionais (catálogo Nexxus) ───────────────
const RETATRUTIDE: Peptide = {
  n: 'Retatrutide', m: 'Triplo agonista GIP+GLP-1+glucagon — emagrecimento potente',
  e: '🔥', why: 'Agonista triplo, potencialmente mais eficaz que o Tirzepatide para perda de gordura',
  freq: '1x/semana', timing: 'Mesmo dia da semana', route: 'Injeção',
  cycle: '12–24 semanas', rest: 'A critério médico',
  how: 'Dose inicial baixa com titulação gradual. Nunca combinar com outro agonista GLP-1. Supervisão médica.',
  ck: true, doseStr: fixedDose('0,5–2 mg/sem (titular)'),
};
const TESAMORELIN: Peptide = {
  n: 'Tesamorelin', m: 'Análogo de GHRH — reduz gordura visceral e eleva GH',
  e: '🔥', why: 'Reduz gordura visceral e melhora a composição corporal via GH',
  freq: 'Diário', timing: 'Antes de dormir', route: 'Injeção',
  cycle: '12–24 semanas', rest: '4–8 semanas',
  how: 'Reconstituir com água bacteriostática. Aplicar à noite, em jejum.',
  ck: true, doseStr: fixedDose('1–2 mg/dia'),
};
const SS31: Peptide = {
  n: 'SS-31 (Elamipretide)', m: 'Peptídeo mitocondrial — energia celular e longevidade',
  e: '⚡', why: 'Protege a mitocôndria, melhora energia e marcadores de envelhecimento',
  freq: 'Diário', timing: 'Manhã', route: 'Injeção',
  cycle: '4–8 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática. Manter refrigerado.',
  ck: true, doseStr: fixedDose('5–10 mg/dia'),
};
const SLUPP332: Peptide = {
  n: 'SLU-PP-332', m: 'Mimético de exercício (agonista ERR) — queima de gordura e resistência',
  e: '🏃', why: 'Ativa vias do exercício, aumentando gasto energético e oxidação de gordura',
  freq: 'Diário', timing: 'Manhã / pré-treino', route: 'Injeção',
  cycle: '6–8 semanas', rest: '4 semanas',
  how: 'Uso de pesquisa. Seguir orientação profissional.',
  ck: false, doseStr: fixedDose('~500 mcg/dia (referência)'),
};
const NADPLUS: Peptide = {
  n: 'NAD+', m: 'Coenzima — energia celular, reparo de DNA e longevidade',
  e: '⚡', why: 'Repõe NAD+ celular, melhorando energia, foco e sinais de envelhecimento',
  freq: '2–3x/semana', timing: 'Manhã', route: 'Injeção',
  cycle: '4–8 semanas', rest: '4 semanas',
  how: 'Aplicação lenta (pode causar rubor/flush). Reconstituir conforme fabricante.',
  ck: true, doseStr: fixedDose('100–300 mg/dia'),
};
const MOTSC: Peptide = {
  n: 'MOTS-c', m: 'Peptídeo mitocondrial — metabolismo, sensibilidade à insulina e energia',
  e: '⚡', why: 'Melhora metabolismo, sensibilidade à insulina e disposição',
  freq: '2–3x/semana', timing: 'Manhã', route: 'Injeção',
  cycle: '4–8 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática.',
  ck: true, doseStr: fixedDose('5–10 mg/semana'),
};
const MELANOTAN: Peptide = {
  n: 'Melanotan II', m: 'Bronzeamento e libido — análogo de α-MSH',
  e: '🌞', why: 'Estimula melanina (bronzeado) e melhora a libido',
  freq: 'Conforme protocolo', timing: 'Noite', route: 'Injeção',
  cycle: 'Carga + manutenção', rest: 'Conforme necessidade',
  how: 'Dose de carga baixa, aumentar gradualmente. Pode causar náusea e escurecer pintas.',
  ck: true, doseStr: fixedDose('250–500 mcg/dia (carga)'),
};
const KPV: Peptide = {
  n: 'KPV', m: 'Anti-inflamatório — intestino, pele e inflamação sistêmica',
  e: '🛡️', why: 'Tripeptídeo derivado do α-MSH com forte ação anti-inflamatória',
  freq: 'Diário', timing: 'Qualquer horário', route: 'Injeção',
  cycle: '4–8 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática.',
  ck: true, doseStr: fixedDose('200–500 mcg/dia'),
};
const KLOW: Peptide = {
  n: 'KLOW (blend)', m: 'Blend GHK-Cu + BPC-157 + TB-500 + KPV — reparo, pele e anti-inflamatório',
  e: '✨', why: 'Combina cicatrização, colágeno e ação anti-inflamatória num só protocolo',
  freq: 'Diário', timing: 'Manhã', route: 'Injeção',
  cycle: '4–8 semanas', rest: '4 semanas',
  how: 'Reconstituir o frasco do blend conforme o fabricante e aplicar 1x/dia.',
  ck: true, doseStr: fixedDose('conforme reconstituição do blend'),
};
const KISSPEPTIN: Peptide = {
  n: 'Kisspeptin-10', m: 'Hormonal — estimula LH/testosterona, libido e fertilidade',
  e: '⚗️', why: 'Estimula o eixo hormonal (LH), apoiando testosterona, libido e fertilidade',
  freq: '2–3x/semana', timing: 'Manhã', route: 'Injeção',
  cycle: '4–8 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática.',
  ck: true, doseStr: fixedDose('50–100 mcg'),
};
const HGH: Peptide = {
  n: 'HGH (Somatropina)', m: 'Hormônio do crescimento — massa, recuperação e longevidade',
  e: '🏋️', why: 'GH exógeno — favorece massa magra, recuperação e queima de gordura',
  freq: 'Diário', timing: 'Antes de dormir ou pós-treino', route: 'Injeção',
  cycle: '12–24 semanas', rest: 'A critério médico',
  how: 'Reconstituir e refrigerar. Iniciar em dose baixa. Supervisão médica.',
  ck: true, doseStr: fixedDose('1–4 UI/dia'),
};
const HGHFRAG: Peptide = {
  n: 'HGH Fragment 176-191', m: 'Fragmento lipolítico do GH — queima de gordura',
  e: '🏃', why: 'Estimula a lipólise sem afetar glicemia ou crescimento (como o AOD-9604)',
  freq: 'Diário', timing: 'Manhã, jejum', route: 'Injeção',
  cycle: '8–12 semanas', rest: '4 semanas',
  how: 'Aplicar em jejum de 2h. Reconstituir com água bacteriostática.',
  ck: true, doseStr: fixedDose('250–500 mcg'),
};
const GLOW: Peptide = {
  n: 'GLOW (blend)', m: 'Blend GHK-Cu + BPC-157 + TB-500 — pele, recuperação e anti-idade',
  e: '✨', why: 'Estimula colágeno e cicatrização — pele e recuperação num protocolo só',
  freq: 'Diário', timing: 'Manhã', route: 'Injeção',
  cycle: '4–8 semanas', rest: '4 semanas',
  how: 'Reconstituir o frasco do blend conforme o fabricante e aplicar 1x/dia.',
  ck: true, doseStr: fixedDose('conforme reconstituição do blend'),
};
const FOLLISTATIN: Peptide = {
  n: 'Follistatin-332', m: 'Inibidor de miostatina — crescimento muscular',
  e: '💪', why: 'Bloqueia a miostatina, favorecendo ganho de massa muscular',
  freq: 'Diário', timing: 'Pós-treino', route: 'Injeção',
  cycle: '2–4 semanas', rest: '4–6 semanas',
  how: 'Uso avançado. Reconstituir com água bacteriostática.',
  ck: true, doseStr: fixedDose('~100 mcg/dia (referência)'),
};
const CBL514: Peptide = {
  n: 'CBL-514', m: 'Redução de gordura localizada — apoptose de adipócitos',
  e: '🔥', why: 'Injeção localizada que reduz a gordura subcutânea na área aplicada',
  freq: 'Sessões espaçadas', timing: 'Conforme protocolo', route: 'Injeção',
  cycle: 'Séries de sessões', rest: 'Conforme protocolo',
  how: 'Aplicação localizada na área a tratar. Seguir protocolo profissional.',
  ck: false, doseStr: fixedDose('conforme protocolo (localizado)'),
};
const AMINO1MQ: Peptide = {
  n: '5-Amino-1MQ', m: 'Inibidor de NNMT — metabolismo e queima de gordura',
  e: '💊', why: 'Inibe a NNMT, aumentando o metabolismo e favorecendo a perda de gordura',
  freq: 'Diário', timing: 'Manhã', route: 'Injeção',
  cycle: '8–12 semanas', rest: '4 semanas',
  how: 'Reconstituir e aplicar no subcutâneo, pela manhã.',
  ck: true, doseStr: fixedDose('50–150 mg/dia'),
};
const TB500BPC: Peptide = {
  n: 'TB-500 + BPC-157 (blend)', m: 'Blend de recuperação — reparo tecidual sinérgico',
  e: '🔄', why: 'Une BPC-157 e TB-500 para acelerar a recuperação de lesões e tecidos',
  freq: 'Diário ou 2x/semana', timing: 'Qualquer horário', route: 'Injeção',
  cycle: '4–6 semanas', rest: '4 semanas',
  how: 'Reconstituir o frasco do blend conforme o fabricante.',
  ck: true, doseStr: fixedDose('conforme reconstituição do blend'),
};
const SERMORELIN: Peptide = {
  n: 'Sermorelin', m: 'Análogo de GHRH — estimula GH natural, sono, recuperação e composição corporal',
  e: '🌙', why: 'Estimula a hipófise a liberar GH de forma pulsátil e fisiológica, apoiando massa magra, sono e recuperação',
  freq: 'Diário', timing: 'Antes de dormir, jejum de 2h', route: 'Injeção',
  cycle: '12–24 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática. Aplicar à noite, em jejum.',
  ck: true, doseStr: fixedDose('100–300 mcg'),
};
const GLUTATHIONE: Peptide = {
  n: 'Glutathione', m: 'Antioxidante mestre — detox, pele e longevidade celular',
  e: '✨', why: 'Principal antioxidante do corpo: protege as células, clareia e uniformiza a pele e apoia a detoxificação',
  freq: '2–3x/semana', timing: 'Qualquer horário', route: 'Injeção',
  cycle: '4–8 semanas', rest: '4 semanas',
  how: 'Reconstituir conforme o fabricante. Proteger da luz.',
  ck: true, doseStr: fixedDose('600–1500 mg'),
};

// ─── Mapa por objetivo ────────────────────────────────────
export const PEPTIDES: Record<ObjectiveKey, Peptide[]> = {
  gordura:     [TIRZEPATIDE, RETATRUTIDE, AOD9604, HGHFRAG, TESAMORELIN, MOTSC, SLUPP332, AMINO1MQ, CBL514, IPAMORELIN],
  massa:       [IPAMORELIN, SERMORELIN, IGF1LR3, HGH, FOLLISTATIN, TESAMORELIN, BPC157],
  recuperacao: [TB500BPC, BPC157, TB500, KPV, KLOW, IPAMORELIN, SERMORELIN],
  sono:        [IPAMORELIN, EPITALON, SERMORELIN],
  pele:        [GLOW, GHK_CU, KLOW, GLUTATHIONE, MELANOTAN, BPC157, EPITALON],
  longevidade: [EPITALON, NADPLUS, SS31, MOTSC, THYMOSIN_A1, GHK_CU, GLUTATHIONE, BPC157, IPAMORELIN],
  cognitivo:   [SEMAX, SELANK, BPC157, IPAMORELIN],
  hormonal:    [PT141, KISSPEPTIN, MELANOTAN, IPAMORELIN],
};

// ─── Catálogo completo (união de todos os peptídeos) ──────
export const ALL_PEPTIDES: Peptide[] = (() => {
  const seen = new Set<string>();
  const all: Peptide[] = [];
  (Object.values(PEPTIDES) as Peptide[][]).forEach((list) =>
    list.forEach((p) => {
      if (!seen.has(p.n)) {
        seen.add(p.n);
        all.push(p);
      }
    }),
  );
  return all;
})();

// Objetivos aos quais um peptídeo pertence (para dar contexto à IA).
export function objetivosDoPeptide(nome: string): ObjectiveKey[] {
  const objs: ObjectiveKey[] = [];
  (Object.keys(PEPTIDES) as ObjectiveKey[]).forEach((k) => {
    if (PEPTIDES[k].some((p) => p.n === nome)) objs.push(k);
  });
  return objs;
}

// Busca tolerante por nome (a IA pode escrever variações/apelidos do nome).
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Gera as "chaves" de um peptídeo: nome completo, parte antes de "(",
// apelido dentro de "(...)", e cada trecho separado por "/".
function chavesDoNome(nomeCompleto: string): string[] {
  const chaves = new Set<string>();
  const add = (s: string) => {
    const n = norm(s);
    if (n.length >= 3) chaves.add(n);
  };
  add(nomeCompleto);
  const paren = nomeCompleto.match(/\(([^)]+)\)/);
  if (paren) add(paren[1]);
  add(nomeCompleto.replace(/\([^)]*\)/g, ''));
  nomeCompleto.split('/').forEach(add);
  return Array.from(chaves);
}

export function findPeptide(nome: string): Peptide | undefined {
  const t = norm(nome);
  if (t.length < 3) return undefined;

  // 1ª passada: igualdade exata com qualquer chave.
  for (const p of ALL_PEPTIDES) {
    if (chavesDoNome(p.n).includes(t)) return p;
  }
  // 2ª passada: prefixo (um contém o começo do outro).
  for (const p of ALL_PEPTIDES) {
    for (const k of chavesDoNome(p.n)) {
      if (k.startsWith(t) || t.startsWith(k)) return p;
    }
  }
  return undefined;
}

// ─── Peptídeos para calculadora ───────────────────────────
export const CALC_PEPTIDES = [
  {
    n: 'BPC-157',        cat: 'Recuperação',
    base: null,          fixed: true,
    fixedDose: '250–500 mcg',
    unit: 'mcg',
    freq: 'Diário',
    timing: 'Manhã, jejum',
    route: 'SC ou oral',
    recon: '2 mL de água bacteriostática para 5 mg',
    how: 'Aplicar no subcutâneo do abdômen',
    warning: '',
  },
  {
    n: 'Semaglutide',    cat: 'Emagrecimento',
    base: null,          fixed: true,
    fixedDose: '0,25 mg/semana (início)',
    unit: 'mg/sem',
    freq: '1x/semana',
    timing: 'Mesmo dia da semana',
    route: 'SC',
    recon: 'Usar caneta descartável ou solução pronta',
    how: 'Aplicar no abdômen, coxa ou braço',
    warning: 'Titulação gradual obrigatória. Supervisão médica recomendada.',
  },
  {
    n: 'Ipamorelin',     cat: 'GH / Sono',
    base: null,          fixed: true,
    fixedDose: '200–300 mcg',
    unit: 'mcg',
    freq: 'Diário, antes de dormir',
    timing: 'Jejum de 2h',
    route: 'SC',
    recon: '2 mL de água bacteriostática',
    how: 'Aplicar 30–60 min antes de dormir',
    warning: '',
  },
  {
    n: 'Semax',          cat: 'Cognitivo',
    base: null,          fixed: true,
    fixedDose: '200–600 mcg/dia',
    unit: 'mcg/dia',
    freq: 'Diário, manhã',
    timing: 'Em jejum ou após café',
    route: 'Intranasal',
    recon: 'Solução pronta 0,1%',
    how: '1–3 gotas por narina, 2x/dia',
    warning: '',
  },
  {
    n: 'GHK-Cu',         cat: 'Pele',
    base: null,          fixed: true,
    fixedDose: '1–2 mg/dia (SC) ou 2–5% tópico',
    unit: '',
    freq: 'Diário',
    timing: 'Noite',
    route: 'Tópico ou SC',
    recon: 'Tópico: diluir em soro fisiológico ou base creme',
    how: 'Aplicar após limpeza facial. SC: subcutâneo facial.',
    warning: '',
  },
  {
    n: 'Epitalon',       cat: 'Longevidade',
    base: null,          fixed: true,
    fixedDose: '5–10 mg/dia (protocolo de carga)',
    unit: 'mg/dia',
    freq: 'Protocolo de carga 10–20 dias',
    timing: '1–2x/dia',
    route: 'SC',
    recon: '2 mL de água bacteriostática',
    how: 'Protocolo: 10 dias consecutivos, 2x/dia. Repetir 2x/ano.',
    warning: '',
  },
  {
    n: 'TB-500',         cat: 'Recuperação',
    base: null,          fixed: true,
    fixedDose: '2–2,5 mg',
    unit: 'mg',
    freq: '2x/semana',
    timing: 'Qualquer horário',
    route: 'SC',
    recon: '1 mL de água bacteriostática por 5 mg',
    how: 'Aplicar no subcutâneo. Dividir dose semanal em 2 aplicações.',
    warning: '',
  },
  {
    n: 'MK-677',         cat: 'GH / Massa',
    base: null,          fixed: true,
    fixedDose: '15–25 mg/dia',
    unit: 'mg/dia',
    freq: 'Diário',
    timing: 'Antes de dormir',
    route: 'Oral',
    recon: 'Cápsula ou solução oral pronta',
    how: 'Tomar 30 min antes de dormir. Pode causar aumento de apetite.',
    warning: 'Pode aumentar glicemia. Monitorar em diabéticos.',
  },
];

// ─── Biblioteca completa ──────────────────────────────────
export const LIBRARY_PEPTIDES = [
  { n: 'BPC-157',     cat: 'Recuperação',    e: '🔄', desc: 'Regeneração tecidual sistêmica. Age em tendões, ligamentos, mucosa intestinal e sistema nervoso. Produção endógena diminui com estresse e idade.' },
  { n: 'TB-500',      cat: 'Recuperação',    e: '💪', desc: 'Fragmento sintético da Timosina β-4. Reduz inflamação e acelera reparo muscular e de tecidos moles.' },
  { n: 'Ipamorelin',  cat: 'GH / Sono',      e: '🌙', desc: 'Secretagogo seletivo de GH sem impacto em cortisol ou prolactina. Melhora sono profundo e composição corporal.' },
  { n: 'CJC-1295',    cat: 'GH / Sono',      e: '⚗️', desc: 'GHRH análogo. Amplifica pulsos de GH quando combinado com Ipamorelin. Meia-vida longa (7 dias com DAC).' },
  { n: 'Semaglutide', cat: 'Emagrecimento',  e: '🔥', desc: 'Agonista GLP-1. Reduz apetite, melhora glicemia e promove lipólise. Uso semanal, titulação gradual.' },
  { n: 'AOD-9604',    cat: 'Emagrecimento',  e: '🏃', desc: 'Fragmento lipolítico do GH. Queima gordura sem efeitos anabólicos ou impacto glicêmico.' },
  { n: 'MK-677',      cat: 'GH / Massa',     e: '💊', desc: 'Secretagogo oral de GH. Aumenta IGF-1, melhora sono e favorece ganho de massa magra. Cômodo por ser oral.' },
  { n: 'IGF-1 LR3',   cat: 'Ganho de massa', e: '🏋️', desc: 'Análogo do IGF-1. Potencializa síntese proteica e hipertrofia. Uso pós-treino, ciclos curtos.' },
  { n: 'Epitalon',    cat: 'Longevidade',    e: '🌟', desc: 'Tetra-peptídeo da glândula pineal. Estimula telomerase, melhora sono e atua em marcadores do envelhecimento.' },
  { n: 'Thymosin α1', cat: 'Imunidade',      e: '🛡️', desc: 'Imunomodulador. Regula resposta imune, aumenta NK cells e melhora defesa contra infecções e células tumorais.' },
  { n: 'GHK-Cu',      cat: 'Pele',           e: '✨', desc: 'Tripeptídeo de cobre. Estimula colágeno, elastina e reparo cutâneo. Tópico ou subcutâneo.' },
  { n: 'SNAP-8',      cat: 'Pele',           e: '💆', desc: 'Relaxante muscular tópico. Reduz rugas de expressão ao inibir liberação de catecolaminas nas junções neuromusculares.' },
  { n: 'Semax',       cat: 'Cognitivo',      e: '🧠', desc: 'Neuropeptídeo russo. Aumenta BDNF, melhora foco, memória e neuroproteção. Uso intranasal.' },
  { n: 'Selank',      cat: 'Cognitivo',      e: '🧘', desc: 'Análogo da tuftisina. Ansiolítico sem sedação, melhora memória de trabalho e resistência ao estresse.' },
  { n: 'DSIP',        cat: 'Sono',           e: '😴', desc: 'Delta Sleep-Inducing Peptide. Aumenta sono delta e normaliza ritmo circadiano. Uso pontual ou ciclos curtos.' },
  { n: 'PT-141',      cat: 'Hormonal',       e: '⚗️', desc: 'Agonista MC4R. Atua no SNC para melhorar libido e função sexual em homens e mulheres.' },
];

// ─── Função que monta o protocolo ─────────────────────────
export function buildProtocol(
  objetivos: ObjectiveKey[],
  _peso: number,
  lockFrom: number,
  _dash: boolean,
): { items: Peptide[]; lock: number } {
  const seen = new Set<string>();
  const all: Peptide[] = [];

  (objetivos.length ? objetivos : ['gordura' as ObjectiveKey]).forEach((obj) => {
    (PEPTIDES[obj] ?? []).forEach((p) => {
      if (!seen.has(p.n)) {
        seen.add(p.n);
        all.push(p);
      }
    });
  });

  return { items: all, lock: lockFrom };
}
