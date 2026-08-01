// ════════════════════════════════════════════════
//  NUVITA — Imagens do balcão (extraídas do design).
//  Fotos por objetivo e imagens de frasco por peptídeo.
//  Ficam em /public/farmacia. Peptídeo sem imagem → null (usa ícone).
// ════════════════════════════════════════════════

import type { ObjectiveKey } from '@/types';

export const HERO_IMG = '/farmacia/hero.png';

export const OBJ_IMG: Record<ObjectiveKey, string> = {
  gordura: '/farmacia/obj/gordura.png',
  massa: '/farmacia/obj/massa.png',
  recuperacao: '/farmacia/obj/recuperacao.png',
  sono: '/farmacia/obj/sono.png',
  pele: '/farmacia/obj/pele.png',
  longevidade: '/farmacia/obj/longevidade.png',
  cognitivo: '/farmacia/obj/cognitivo.png',
  hormonal: '/farmacia/obj/hormonal.png',
};

// Nome do catálogo → arquivo de imagem do frasco (só os que têm foto).
const PEP_IMG: Record<string, string> = {
  'Tirzepatide': 'tirze',
  'Retatrutide': 'reta',
  'GHK-Cu (Tripeptídeo de cobre)': 'ghk',
  'Ipamorelin': 'ipa',
  'SS-31 (Elamipretide)': 'ss31',
  'TB-500': 'tb',
  'BPC-157': 'bpc',
  'AOD-9604': 'aod',
  'IGF-1 LR3': 'igf',
  'DSIP (Delta Sleep-Inducing Peptide)': 'dsip',
  'NAD+': 'nad',
  'PT-141 (Bremelanotida)': 'pt141',
  'Semax': 'semax',
  'Selank': 'selank',
};

export function pepImg(nome: string): string | null {
  const f = PEP_IMG[nome];
  return f ? `/farmacia/pep/${f}.png` : null;
}
