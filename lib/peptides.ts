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
  freq: 'Diário', timing: 'Manhã, em jejum', route: 'SC ou oral',
  cycle: '8–12 semanas', rest: '4–8 semanas',
  how: 'Reconstituir com água bacteriostática. Armazenar refrigerado.',
  ck: true, doseStr: fixedDose('250–500 mcg'),
};

const TB500: Peptide = {
  n: 'TB-500', m: 'Reparo muscular, anti-inflamatório, regeneração tecidual sistêmica',
  e: '💪', why: 'Promove cicatrização e reduz inflamação crônica',
  freq: '2x/semana', timing: 'Qualquer horário', route: 'SC',
  cycle: '4–6 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática. Dose total semanal dividida em 2 aplicações.',
  ck: true, doseStr: fixedDose('2–2,5 mg'),
};

const IPAMORELIN: Peptide = {
  n: 'Ipamorelin', m: 'Secretagogo de GH, melhora sono, composição corporal e recuperação',
  e: '🌙', why: 'Estimula liberação pulsátil de GH sem impacto no cortisol',
  freq: 'Diário', timing: 'Antes de dormir, jejum de 2h', route: 'SC',
  cycle: '8–12 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática. Aplicar 30–60 min antes de dormir.',
  ck: true, doseStr: fixedDose('200–300 mcg'),
};

const CJC1295: Peptide = {
  n: 'CJC-1295', m: 'GHRH análogo — amplifica pulsos de GH, sinérgico com Ipamorelin',
  e: '⚗️', why: 'Aumenta a amplitude dos pulsos de GH quando combinado com secretagogos',
  freq: '2–3x/semana', timing: 'Antes de dormir, jejum de 2h', route: 'SC',
  cycle: '8–12 semanas', rest: '4 semanas',
  how: 'Geralmente combinado com Ipamorelin na mesma seringa.',
  ck: false, doseStr: fixedDose('100–200 mcg'),
};

const SEMAGLUTIDE: Peptide = {
  n: 'Semaglutide', m: 'Agonista GLP-1 — saciedade, perda de gordura, controle glicêmico',
  e: '🔥', why: 'Reduz apetite e estimula lipólise seletiva',
  freq: '1x/semana', timing: 'Mesmo dia da semana', route: 'SC',
  cycle: '12–24 semanas', rest: 'A critério médico',
  how: 'Dose inicial baixa com titulação gradual. Supervisão médica recomendada.',
  ck: true, doseStr: fixedDose('0,25–2,4 mg/sem'),
};

const AOD9604: Peptide = {
  n: 'AOD-9604', m: 'Fragmento do GH lipolítico — queima gordura sem efeitos anabólicos',
  e: '🏃', why: 'Estimula lipólise sem alterar glicemia ou crescimento',
  freq: 'Diário', timing: 'Manhã, jejum', route: 'SC',
  cycle: '8–12 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática. Aplicar em jejum de 2h.',
  ck: true, doseStr: fixedDose('300 mcg'),
};

const MK677: Peptide = {
  n: 'MK-677 (Ibutamoren)', m: 'Secretagogo oral de GH — anabolismo, sono profundo, IGF-1',
  e: '💊', why: 'Aumenta IGF-1 e GH sem injeções, favorece ganho de massa e sono',
  freq: 'Diário', timing: 'Antes de dormir', route: 'Oral',
  cycle: '12–24 semanas', rest: '8 semanas',
  how: 'Cápsula ou solução oral. Pode causar retenção hídrica inicial.',
  ck: true, doseStr: fixedDose('15–25 mg/dia'),
};

const IGF1LR3: Peptide = {
  n: 'IGF-1 LR3', m: 'Fator de crescimento análogo — hipertrofia muscular, síntese proteica',
  e: '🏋️', why: 'Potencializa síntese proteica e favorece hipertrofia muscular',
  freq: '5x/semana', timing: 'Pós-treino', route: 'SC ou IM',
  cycle: '4–6 semanas', rest: '4–6 semanas',
  how: 'Diluir em água bacteriostática acidificada (ácido acético 0,6%). Aplicar pós-treino.',
  ck: true, doseStr: perKg(1, 'mcg'),
};

const EPITALON: Peptide = {
  n: 'Epithalamin (Epitalon)', m: 'Tetra-peptídeo pineal — telômeros, sono, longevidade',
  e: '🌟', why: 'Estimula telomerase e melhora qualidade do sono profundo',
  freq: 'Protocolo de carga', timing: '1–2x/dia por 10–20 dias', route: 'SC',
  cycle: '10–20 dias', rest: '6–12 meses',
  how: 'Protocolo de carga: 10 dias consecutivos, 2x/dia. Reconstituir em água bacteriostática.',
  ck: true, doseStr: fixedDose('5–10 mg/dia'),
};

const THYMOSIN_A1: Peptide = {
  n: 'Timalfasina (Thymosin α1)', m: 'Imunomodulador — resposta imune, antiviral, longevidade',
  e: '🛡️', why: 'Regula o sistema imune e melhora a resposta a infecções',
  freq: '2x/semana', timing: 'Qualquer horário', route: 'SC',
  cycle: '8–12 semanas', rest: '4–6 semanas',
  how: 'Reconstituir com água bacteriostática. Estável 5–7 dias refrigerado.',
  ck: true, doseStr: fixedDose('1,6 mg'),
};

const GHK_CU: Peptide = {
  n: 'GHK-Cu (Tripeptídeo de cobre)', m: 'Síntese de colágeno, wound healing, antienvelhecimento dérmico',
  e: '✨', why: 'Estimula colágeno, elastina e regeneração celular na pele',
  freq: 'Diário', timing: 'Noite (uso tópico ou SC)', route: 'Tópico ou SC',
  cycle: '8–16 semanas', rest: '4 semanas',
  how: 'Tópico: aplicar no rosto após limpeza. SC: reconstituir em água bacteriostática.',
  ck: true, doseStr: fixedDose('1–2 mg/dia (SC) ou 2–5% (tópico)'),
};

const SNAP8: Peptide = {
  n: 'SNAP-8 / Argireline', m: 'Relaxante muscular tópico — reduz linhas de expressão',
  e: '💆', why: 'Inibe contrações musculares na face, reduzindo rugas dinâmicas',
  freq: 'Diário', timing: 'Manhã e noite', route: 'Tópico',
  cycle: 'Contínuo', rest: 'Não necessário',
  how: 'Aplicar 2x/dia nas áreas com rugas de expressão. Concentração usual: 5–10%.',
  ck: false, doseStr: fixedDose('5–10% (tópico)'),
};

const SEMAX: Peptide = {
  n: 'Semax', m: 'Neuropeptídeo — BDNF, foco, memória, neuroproteção',
  e: '🧠', why: 'Aumenta BDNF e dopamina, melhorando cognição e foco',
  freq: 'Diário', timing: 'Manhã', route: 'Intranasal',
  cycle: '2–4 semanas', rest: '2 semanas',
  how: 'Gotas nasais: 1–3 gotas por narina. Preparação de 0,1% mais comum.',
  ck: true, doseStr: fixedDose('200–600 mcg/dia'),
};

const SELANK: Peptide = {
  n: 'Selank', m: 'Ansiolítico nootropico — GABA, memória, resistência ao estresse',
  e: '🧘', why: 'Reduz ansiedade sem sedação, melhora memória de trabalho',
  freq: 'Conforme necessidade', timing: 'Manhã ou ao sentir estresse', route: 'Intranasal',
  cycle: '2–4 semanas', rest: '2 semanas',
  how: 'Gotas nasais: 2–3 gotas por narina. Solução de 0,15%.',
  ck: false, doseStr: fixedDose('250–500 mcg/dia'),
};

const DSIP: Peptide = {
  n: 'DSIP (Delta Sleep-Inducing Peptide)', m: 'Regulação do sono, sono delta, normalização circadiana',
  e: '😴', why: 'Aumenta sono delta (profundo) e normaliza ritmo circadiano',
  freq: '3x/semana', timing: '30 min antes de dormir', route: 'SC',
  cycle: '4–8 semanas', rest: '4 semanas',
  how: 'Reconstituir com água bacteriostática. Aplicar 30 min antes de dormir.',
  ck: true, doseStr: fixedDose('100–200 mcg'),
};

const PT141: Peptide = {
  n: 'PT-141 (Bremelanotida)', m: 'Receptor MC4R — libido, disfunção sexual, hormônios',
  e: '⚗️', why: 'Atua no SNC para melhorar libido e função sexual em ambos os sexos',
  freq: 'Conforme necessidade', timing: '1–4h antes da atividade sexual', route: 'SC ou Intranasal',
  cycle: 'Conforme necessidade', rest: 'Não aplicável',
  how: 'SC: 1–2 mg. Intranasal: 2 mg. Pode causar rubor facial transitório.',
  ck: false, doseStr: fixedDose('1–2 mg'),
};

// ─── Mapa por objetivo ────────────────────────────────────
export const PEPTIDES: Record<ObjectiveKey, Peptide[]> = {
  gordura:     [SEMAGLUTIDE, AOD9604, IPAMORELIN, CJC1295],
  massa:       [IPAMORELIN, CJC1295, MK677, IGF1LR3, BPC157],
  recuperacao: [BPC157, TB500, IPAMORELIN, CJC1295],
  sono:        [IPAMORELIN, DSIP, EPITALON, MK677],
  pele:        [GHK_CU, SNAP8, BPC157, EPITALON],
  longevidade: [EPITALON, THYMOSIN_A1, GHK_CU, BPC157, IPAMORELIN],
  cognitivo:   [SEMAX, SELANK, BPC157, IPAMORELIN],
  hormonal:    [PT141, IPAMORELIN, CJC1295, MK677],
};

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
