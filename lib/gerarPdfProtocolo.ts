// ════════════════════════════════════════════════
//  NUVITA — Gera o PDF do protocolo do balcão.
//  Recebe o texto do protocolo (o mesmo que iria pelo WhatsApp)
//  e monta um documento organizado, para entregar como arquivo.
//  pdf-lib é JS puro — funciona no runtime Node da Vercel.
// ════════════════════════════════════════════════

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';

const VERDE = rgb(0.086, 0.639, 0.29); // #16A34A
const CINZA = rgb(0.4, 0.44, 0.52);
const PRETO = rgb(0.05, 0.07, 0.075);

const A4: [number, number] = [595.28, 841.89];
const MARGEM = 50;
const LARGURA_TXT = A4[0] - MARGEM * 2;

// Remove emojis / símbolos que as fontes padrão (WinAnsi) não codificam,
// e tira os marcadores de markdown (*bold*, _italic_).
function limpar(s: string): string {
  return s
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{24C2}\u{2139}]/gu,
      '',
    )
    .replace(/[*_]/g, '')
    .replace(/\s+$/g, '')
    .replace(/^\s+/g, (m) => m); // preserva a indentação da esquerda
}

// Quebra o texto em linhas que cabem na largura dada.
function quebrar(texto: string, font: PDFFont, size: number, largura: number): string[] {
  const palavras = texto.split(/\s+/);
  const linhas: string[] = [];
  let atual = '';
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    if (font.widthOfTextAtSize(teste, size) > largura && atual) {
      linhas.push(atual);
      atual = p;
    } else {
      atual = teste;
    }
  }
  if (atual) linhas.push(atual);
  return linhas.length ? linhas : [''];
}

export async function gerarPdfProtocolo(
  texto: string,
  nome?: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const obl = await doc.embedFont(StandardFonts.HelveticaOblique);

  let page: PDFPage = doc.addPage(A4);
  let y = A4[1];

  // ─── Cabeçalho verde ───
  const CAB = 84;
  page.drawRectangle({ x: 0, y: A4[1] - CAB, width: A4[0], height: CAB, color: VERDE });
  page.drawText('NUVITA', {
    x: MARGEM, y: A4[1] - 42, size: 24, font: bold, color: rgb(1, 1, 1),
  });
  page.drawText('Protocolo personalizado de peptideos', {
    x: MARGEM, y: A4[1] - 62, size: 11, font: reg, color: rgb(0.9, 1, 0.95),
  });
  y = A4[1] - CAB - 30;

  const novaPagina = () => {
    page = doc.addPage(A4);
    y = A4[1] - MARGEM;
  };
  const espaco = (h: number) => {
    if (y - h < MARGEM + 24) novaPagina();
    y -= h;
  };

  // Desenha um parágrafo (com quebra) numa fonte/size/cor, indentado.
  const paragrafo = (
    txt: string, font: PDFFont, size: number, color = PRETO, indent = 0, lh = 1.35,
  ) => {
    const linhas = quebrar(txt, font, size, LARGURA_TXT - indent);
    for (const ln of linhas) {
      espaco(size * lh);
      page.drawText(ln, { x: MARGEM + indent, y, size, font, color });
    }
  };

  const linhas = texto.split('\n');
  // A 1ª linha do texto é o título "Nuvita — Protocolo..." (já está no cabeçalho).
  let pularTitulo = true;

  for (const bruta of linhas) {
    const linha = limpar(bruta);
    const trim = linha.trim();

    if (pularTitulo && /nuvita/i.test(trim) && /protocolo/i.test(trim)) {
      pularTitulo = false;
      continue;
    }
    pularTitulo = false;

    if (!trim) {
      espaco(7); // linha em branco → respiro
      continue;
    }

    // Item de peptídeo: "1. Nome do peptídeo"
    if (/^\d+\.\s/.test(trim)) {
      espaco(14);
      paragrafo(trim, bold, 13, VERDE, 0, 1.3);
      continue;
    }

    // Bullet "• Rótulo: valor"
    const mBullet = trim.match(/^•\s*(.*)$/);
    if (mBullet) {
      const conteudo = mBullet[1];
      const mRotulo = conteudo.match(/^([^:]{1,22}):\s*(.*)$/);
      espaco(15);
      // desenha o bullet
      page.drawText('•', { x: MARGEM + 12, y, size: 11, font: bold, color: VERDE });
      if (mRotulo) {
        const rotulo = `${mRotulo[1]}: `;
        const wRot = bold.widthOfTextAtSize(rotulo, 11);
        page.drawText(rotulo, { x: MARGEM + 26, y, size: 11, font: bold, color: PRETO });
        // valor (com quebra alinhada após o rótulo)
        const valorLinhas = quebrar(mRotulo[2], reg, 11, LARGURA_TXT - 26 - wRot);
        valorLinhas.forEach((vl, i) => {
          if (i === 0) {
            page.drawText(vl, { x: MARGEM + 26 + wRot, y, size: 11, font: reg, color: PRETO });
          } else {
            espaco(15);
            page.drawText(vl, { x: MARGEM + 26, y, size: 11, font: reg, color: PRETO });
          }
        });
      } else {
        paragrafo(conteudo, reg, 11, PRETO, 26, 1.3);
      }
      continue;
    }

    // Subtítulo de seção: "Alimentação: ...", "Treino: ...", "O que observar: ..."
    const mSecao = trim.match(/^(Alimenta[çc][ãa]o|Treino|O que observar):\s*(.*)$/i);
    if (mSecao) {
      espaco(14);
      paragrafo(`${mSecao[1]}:`, bold, 12, PRETO, 0, 1.3);
      paragrafo(mSecao[2], reg, 11, PRETO, 0, 1.35);
      continue;
    }

    // Aviso final (era _italico_) — fica menor e cinza.
    if (/consulte|orienta[çc][ãa]o inicial|profissional de sa[úu]de/i.test(trim) && trim.length > 40) {
      espaco(16);
      paragrafo(trim, obl, 9.5, CINZA, 0, 1.35);
      continue;
    }

    // "Nuvita" (assinatura final)
    if (/^nuvita$/i.test(trim)) {
      espaco(20);
      page.drawText('Nuvita', { x: MARGEM, y, size: 12, font: bold, color: VERDE });
      continue;
    }

    // Texto normal (saudação, resumo…)
    paragrafo(trim, reg, 11, PRETO, 0, 1.4);
  }

  // Rodapé com data-livre (sem Date.now — usamos texto fixo institucional).
  void nome;
  return doc.save();
}
