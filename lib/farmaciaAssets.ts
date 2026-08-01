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

// Nome do catálogo → arquivo de imagem do frasco (fonte: nexxuspeptides.com).
// Sem imagem (não estão no site): Epitalon, Melanotan II, Sermorelin, Glutathione.
const PEP_IMG: Record<string, string> = {
  'Tirzepatide': 'tirze',
  'Retatrutide': 'reta',
  'AOD-9604': 'aod',
  'HGH Fragment 176-191': 'hghfrag',
  'Tesamorelin': 'tesa',
  'MOTS-c': 'motsc',
  'SLU-PP-332': 'slu',
  '5-Amino-1MQ': 'amino',
  'CBL-514': 'cbl',
  'Ipamorelin': 'ipa',
  'IGF-1 LR3': 'igf',
  'HGH (Somatropina)': 'hgh',
  'Follistatin-332': 'folli',
  'BPC-157': 'bpc',
  'TB-500 + BPC-157 (blend)': 'tbbpc',
  'TB-500': 'tb',
  'KPV': 'kpv',
  'KLOW (blend)': 'klow',
  'DSIP (Delta Sleep-Inducing Peptide)': 'dsip',
  'GLOW (blend)': 'glow',
  'GHK-Cu (Tripeptídeo de cobre)': 'ghk',
  'SS-31 (Elamipretide)': 'ss31',
  'Timalfasina (Thymosin α1)': 'thymosin',
  'Semax': 'semax',
  'Selank': 'selank',
  'PT-141 (Bremelanotida)': 'pt141',
  'Kisspeptin-10': 'kiss',
  'NAD+': 'nad',
};

export function pepImg(nome: string): string | null {
  const f = PEP_IMG[nome];
  return f ? `/farmacia/pep/${f}.png` : null;
}
