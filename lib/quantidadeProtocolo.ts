// ════════════════════════════════════════════════
//  NUVITA — Cálculo de quantidade e preparo (uso da farmácia).
//  A partir da dose, frequência e ciclo do peptídeo, estima:
//   - quantas aplicações por semana,
//   - o total de mg para o período do protocolo (faixa),
//   - a dose em UI na seringa U-100 (depende da reconstituição),
//   - quantas doses rende um frasco e quantos frascos comprar.
//
//  Tudo é ESTIMATIVA a partir do catálogo — quem confere é a farmácia.
//  Doses com titulação (ex.: GLP-1) variam ao longo do ciclo; por isso
//  o total é apresentado como faixa (mínimo–máximo).
// ════════════════════════════════════════════════

export interface FaixaMg {
  min: number; // em mg
  max: number; // em mg
}

// "250–500 mcg", "2–2,5 mg", "2,5–15 mg/sem" → faixa em mg.
export function parseDoseMg(doseStr: string): FaixaMg | null {
  if (!doseStr) return null;
  const s = doseStr.toLowerCase().replace(/,/g, '.');
  const ehMcg = /mcg|µg|mcg/.test(s);
  const nums = (s.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  const fator = ehMcg ? 0.001 : 1; // mcg → mg
  const min = Math.min(...nums) * fator;
  const max = Math.max(...nums) * fator;
  return { min, max };
}

// "Diário", "2x/semana", "2–3x/semana", "1x/dia", "2x/dia" → nº por semana.
// Retorna null quando é sob demanda ("conforme necessidade").
export function aplicacoesPorSemana(freq: string): number | null {
  if (!freq) return null;
  const s = freq.toLowerCase();
  if (/necessidade|conforme|demanda|critério|criterio/.test(s)) return null;
  if (/di[áa]ri/.test(s)) return 7;
  const porDia = s.match(/(\d+)\s*x?\s*\/?\s*dia/);
  if (porDia) return Number(porDia[1]) * 7;
  if (/dias?\s+alternados/.test(s)) return 3.5;
  const porSemana = s.match(/(\d+)\s*(?:[–-]\s*(\d+))?\s*x?\s*\/?\s*semana/);
  if (porSemana) return Number(porSemana[2] || porSemana[1]); // usa o maior da faixa
  return 7; // padrão conservador: diário
}

// "8–12 semanas", "12–24 semanas" → faixa de semanas. null se indefinido.
export function semanasDoCiclo(cycle: string): { min: number; max: number } | null {
  if (!cycle) return null;
  const nums = (cycle.match(/\d+/g) || []).map(Number);
  if (!nums.length) return null;
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

// Total de mg para o período (faixa dose × aplicações × semanas).
export function totalMg(dose: FaixaMg, appsSemana: number, semanas: number): FaixaMg {
  return {
    min: dose.min * appsSemana * semanas,
    max: dose.max * appsSemana * semanas,
  };
}

// Concentração do frasco reconstituído (mg/mL).
export function concentracao(frascoMg: number, aguaMl: number): number {
  if (!frascoMg || !aguaMl) return 0;
  return frascoMg / aguaMl;
}

// Dose (mg) → UI na seringa de insulina U-100 (1 mL = 100 UI).
// UI = (doseMg / concentração) × 100.
export function doseEmUI(doseMg: number, frascoMg: number, aguaMl: number): number {
  const conc = concentracao(frascoMg, aguaMl);
  if (!conc) return 0;
  const volumeMl = doseMg / conc;
  return volumeMl * 100;
}

// Quantas doses rende um frasco (usa a dose informada, em mg).
export function dosesPorFrasco(frascoMg: number, doseMg: number): number {
  if (!doseMg) return 0;
  return Math.floor(frascoMg / doseMg);
}

// Nº de frascos para cobrir o total do ciclo.
export function frascosNecessarios(totalMgCiclo: number, frascoMg: number): number {
  if (!frascoMg) return 0;
  return Math.max(1, Math.ceil(totalMgCiclo / frascoMg));
}

// Formata mg de forma amigável (mg ou mcg conforme a escala).
export function fmtMg(mg: number): string {
  if (mg <= 0) return '0';
  if (mg < 1) return `${Math.round(mg * 1000)} mcg`;
  const v = Math.round(mg * 100) / 100;
  return `${v} mg`.replace('.', ',');
}

// Faixa "min–max" já formatada. Se min≈max, mostra um só.
export function fmtFaixaMg(f: FaixaMg): string {
  const a = fmtMg(f.min);
  const b = fmtMg(f.max);
  return a === b ? a : `${a}–${b}`;
}

// Frasco padrão sugerido pela escala da dose (a farmácia ajusta).
export function frascoPadrao(dose: FaixaMg): number {
  // Doses em mg (GLP-1 etc.) costumam vir em frascos maiores.
  return dose.max >= 3 ? 10 : 5;
}

// Tamanho REAL do frasco (mg) por peptídeo, conforme o catálogo da Nexxus.
// Para produtos com mais de um tamanho, usamos um representativo (a farmácia
// ajusta). HGH (Somatropina) é em UI — tratado à parte.
export const FRASCO_MG: Record<string, number> = {
  'Tirzepatide': 60,
  'Retatrutide': 40,
  'AOD-9604': 10,
  'HGH Fragment 176-191': 5,
  'Tesamorelin': 10,
  'MOTS-c': 10,
  'SLU-PP-332': 5,
  '5-Amino-1MQ': 1,
  'CBL-514': 30,
  'Ipamorelin': 10,
  'IGF-1 LR3': 1,
  'Follistatin-332': 1,
  'BPC-157': 10,
  'TB-500 + BPC-157 (blend)': 10,
  'TB-500': 10,
  'KPV': 10,
  'KLOW (blend)': 80,
  'DSIP (Delta Sleep-Inducing Peptide)': 15,
  'Epithalamin (Epitalon)': 10,
  'GLOW (blend)': 70,
  'GHK-Cu (Tripeptídeo de cobre)': 50,
  'Melanotan II': 10,
  'NAD+': 500,
  'SS-31 (Elamipretide)': 10,
  'Timalfasina (Thymosin α1)': 10,
  'Semax': 11,
  'Selank': 11,
  'PT-141 (Bremelanotida)': 10,
  'Kisspeptin-10': 10,
};

// Frasco do peptídeo pelo nome (catálogo). Se não houver, usa o padrão pela dose.
export function frascoDoPeptideo(nome: string, dose: FaixaMg): number {
  return FRASCO_MG[nome] ?? frascoPadrao(dose);
}
