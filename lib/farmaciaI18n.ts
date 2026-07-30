// ════════════════════════════════════════════════
//  NUVITA — Idioma do balcão (PT / ES).
//  Helper leve: tf(lang, textoPT, textoES). Sem dicionário gigante —
//  cada string traduz no lugar de uso.
// ════════════════════════════════════════════════

export type Lang = 'pt' | 'es';

export const IDIOMA_KEY = 'nv_farmacia_idioma';

export function tf(lang: Lang, pt: string, es: string): string {
  return lang === 'es' ? es : pt;
}
