// ════════════════════════════════════════════════
//  NUVITA — Gera o PDF do protocolo do balcão.
//  Recebe o texto do protocolo (o mesmo que iria pelo WhatsApp)
//  e monta um documento organizado, para entregar como arquivo.
//  pdf-lib é JS puro — funciona no runtime Node da Vercel.
// ════════════════════════════════════════════════

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';

const VERDE = rgb(0.086, 0.639, 0.29); // #16A34A
const VERDE_ESC = rgb(0.082, 0.502, 0.239); // #15803D
const VERDE_CLARO = rgb(0.906, 0.965, 0.925); // fundo do banner
const CINZA = rgb(0.4, 0.44, 0.52);
const CINZA_MED = rgb(0.278, 0.329, 0.404); // #475467
const PRETO = rgb(0.05, 0.07, 0.075);
const hx = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const A4: [number, number] = [595.28, 841.89];
const MARGEM = 50;
const LARGURA_TXT = A4[0] - MARGEM * 2;

// Contato Nexxus (WhatsApp Paraguai) para o banner de compra do PDF.
const NEXXUS_WHATS = '+595 992 963863';
const NEXXUS_WA_LINK = 'https://wa.me/595992963863';

// Logo "Nuvita" — os 6 paths do SVG (viewBox 0 0 156 34), desenhados no
// cabeçalho via page.drawSvgPath (pdf-lib respeita o eixo-y do SVG).
const LOGO_PATHS = [
  'M19.6318 6.74985C21.3477 7.44837 22.8113 8.4565 24.0225 9.76911C25.2337 11.0817 26.1598 12.6784 26.7982 14.5539C27.4366 16.4294 27.7571 18.5275 27.7571 20.8483V33.0789H22.3571V20.5924C22.3571 19.0239 22.1552 17.6422 21.7515 16.4473C21.3477 15.2524 20.785 14.2392 20.0608 13.4025C19.3366 12.5658 18.4459 11.9363 17.386 11.509C16.3262 11.0817 15.1226 10.8694 13.7776 10.8694C12.4327 10.8694 11.229 11.0817 10.1692 11.509C9.10938 11.9363 8.21863 12.5658 7.49442 13.4025C6.77021 14.2392 6.21507 15.2524 5.82899 16.4473C5.44292 17.6422 5.24862 19.0239 5.24862 20.5924V33.0789H0V20.8483C0 18.4943 .320468 16.3885 .958882 14.5283C1.5973 12.6681 2.5158 11.0817 3.70936 9.76911C4.90291 8.4565 6.35133 7.44837 8.04956 6.74985C9.74779 6.05132 11.6756 5.70078 13.8281 5.70078C15.9805 5.70078 17.916 6.05132 19.6318 6.74985Z',
  'M36.8413 6.57074V19.2107C36.8413 20.7459 37.0356 22.1097 37.4217 23.3046C37.8078 24.4995 38.3629 25.5051 39.0871 26.3239C39.8113 27.1427 40.6945 27.7644 41.7366 28.1918C42.7788 28.6191 43.9572 28.8314 45.2694 28.8314C46.5815 28.8314 47.7675 28.6191 48.8273 28.1918C49.8871 27.7644 50.7779 27.135 51.5021 26.2983C52.2263 25.4616 52.7815 24.4561 53.1675 23.279C53.5536 22.102 53.7479 20.7459 53.7479 19.2107V6.57074H58.9965V18.9548C58.9965 21.2756 58.6761 23.3635 58.0376 25.2237C57.3992 27.0838 56.4807 28.6626 55.2872 29.9573C54.0936 31.2545 52.6452 32.2524 50.947 32.9509C49.2487 33.6495 47.3385 34 45.2189 34C43.0993 34 41.1891 33.6495 39.4908 32.9509C37.7926 32.2524 36.3442 31.2545 35.1506 29.9573C33.9571 28.6626 33.0386 27.0838 32.4002 25.2237C31.7618 23.3635 31.4413 21.2756 31.4413 18.9548V6.57074H36.8413Z',
  'M68.1816 6.57074C68.1816 9.06035 68.4162 11.4323 68.8881 13.6839C69.36 15.9356 70.0564 18.026 70.9825 19.9527C71.9086 21.882 73.0592 23.6117 74.4395 25.1469C75.8173 26.6821 77.3994 27.9947 79.1835 29.0873H75.6003C77.3843 28.0306 78.9564 26.741 80.319 25.2237C81.6816 23.7064 82.8247 21.9818 83.7508 20.0551C84.6768 18.1284 85.3733 16.0303 85.8452 13.7607C86.317 11.4911 86.5694 9.09618 86.6022 6.57074H92.1536C92.1536 9.23179 91.8584 11.8749 91.2704 14.5027C90.6825 17.1305 89.8321 19.6022 88.7218 21.9229C87.6115 24.2437 86.2489 26.3674 84.6339 28.2941C83.019 30.2234 81.1845 31.8174 79.133 33.0789H75.6003C73.5488 31.8507 71.7319 30.272 70.1498 28.3453C68.5676 26.4186 67.2151 24.2846 66.0871 21.9485C64.9592 19.6124 64.1013 17.1305 63.5133 14.5027C62.9254 11.8749 62.6301 9.23179 62.6301 6.57074H68.1816Z',
  'M126.477 33.0789C126.477 30.4178 126.772 27.7747 127.36 25.1469C127.948 22.5191 128.806 20.0372 129.934 17.7011C131.062 15.365 132.414 13.231 133.996 11.3043C135.578 9.37763 137.393 7.79892 139.447 6.57074H142.979C145.031 7.83218 146.865 9.42881 148.48 11.3555C150.095 13.2822 151.458 15.4059 152.568 17.7267C153.679 20.0474 154.529 22.5191 155.117 25.1469C155.705 27.7747 156 30.4178 156 33.0789H150.449C150.416 30.5534 150.163 28.1585 149.692 25.8889C149.22 23.6194 148.523 21.5212 147.597 19.5945C146.671 17.6678 145.528 15.9433 144.165 14.4259C142.803 12.9061 141.231 11.6191 139.447 10.5623H143.03C141.246 11.6549 139.666 12.9675 138.286 14.5027C136.906 16.0379 135.752 17.7702 134.829 19.6969C133.903 21.6236 133.206 23.714 132.735 25.9657C132.263 28.2173 132.028 30.5893 132.028 33.0789H126.477Z',
  'M95.8856 11.3811H101.286V33.0789H95.8856V11.3811Z',
  'M95.8856 .481037H101.286V6.57074H95.8856V.481037Z',
  'M111.48 18.7809C111.48 21.8846 112.187 24.2565 113.6 25.894C115.013 27.5316 116.587 28.2839 119.691 28.2839C120.229 28.2839 122.482 28.2685 122.482 28.2685V33.0789C122.482 33.1531 117.688 33.0789 116.981 33.0789C114.977 33.0789 111.672 32.2319 109.436 29.6553C107.198 27.0787 106.08 23.4889 106.08 18.8832V0H111.48V18.7809ZM109.159 6.0897H122.381V10.9001H109.159V6.0897Z',
];

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

interface Fontes { reg: PDFFont; bold: PDFFont; obl: PDFFont }

const CAB_H = 84;

// Cabeçalho verde com a logo Nuvita (branca) + subtítulo.
function desenharCabecalho(page: PDFPage, f: Fontes, subtitulo: string) {
  page.drawRectangle({ x: 0, y: A4[1] - CAB_H, width: A4[0], height: CAB_H, color: VERDE });
  const escala = 21 / 34;
  for (const d of LOGO_PATHS) {
    page.drawSvgPath(d, { x: MARGEM, y: A4[1] - 26, scale: escala, color: rgb(1, 1, 1) });
  }
  page.drawText(subtitulo, { x: MARGEM, y: A4[1] - 64, size: 11, font: f.reg, color: rgb(0.9, 1, 0.95) });
}

async function embedQr(doc: PDFDocument) {
  const buf = await QRCode.toBuffer(NEXXUS_WA_LINK, {
    type: 'png', margin: 1, width: 240, color: { dark: '#0D2A18', light: '#FFFFFF' },
  });
  return doc.embedPng(buf);
}

// Banner de compra (Nexxus) + QR, fixo no rodapé da página informada.
function desenharBanner(page: PDFPage, qrImg: any, f: Fontes) {
  const BANNER_H = 108;
  const bx = MARGEM;
  const byBottom = MARGEM - 6;
  const byTop = byBottom + BANNER_H;
  page.drawRectangle({ x: bx, y: byBottom, width: LARGURA_TXT, height: BANNER_H, color: VERDE_CLARO, borderColor: VERDE, borderWidth: 1.2 });
  const QR = 82;
  page.drawImage(qrImg, { x: bx + LARGURA_TXT - QR - 16, y: byBottom + (BANNER_H - QR) / 2, width: QR, height: QR });
  const tx = bx + 20;
  page.drawText('Deseja comprar os peptideos?', { x: tx, y: byTop - 28, size: 14, font: f.bold, color: VERDE });
  page.drawText('Fale com a Nexxus no WhatsApp:', { x: tx, y: byTop - 50, size: 11, font: f.reg, color: PRETO });
  page.drawText(NEXXUS_WHATS, { x: tx, y: byTop - 72, size: 16, font: f.bold, color: PRETO });
  page.drawText('Aponte a camera do celular para o QR code', { x: tx, y: byTop - 92, size: 9, font: f.obl, color: CINZA });
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
  desenharCabecalho(page, { reg, bold, obl }, 'Protocolo personalizado de peptideos');
  y = A4[1] - CAB_H - 30;

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

  // ─── Banner de compra (Nexxus) com QR code do WhatsApp ───
  const qrImg = await embedQr(doc);
  if (y - 24 < MARGEM + 108) novaPagina();
  desenharBanner(page, qrImg, { reg, bold, obl });

  void nome;
  return doc.save();
}

// ════════════════════════════════════════════════
//  Versão "rica": monta o PDF a partir dos dados ESTRUTURADOS do protocolo,
//  no mesmo estilo bonito e informativo da tela (cards, badges, specs).
// ════════════════════════════════════════════════

export interface PdfItemProtocolo {
  nome: string;
  mecanismo?: string;
  dose: string;
  prioridade: 'essencial' | 'recomendado' | 'opcional';
  freq?: string;
  timing?: string;
  route?: string;
  cycle?: string;
  rest?: string;
  motivo?: string;
  comoUsar?: string;
  alternativa?: string;
}

export interface PdfProtocoloInput {
  nome?: string;
  idioma?: 'pt' | 'es';
  perfil?: string;
  resumo?: string;
  itens: PdfItemProtocolo[];
  orientacaoAlimentar?: string;
  orientacaoTreino?: string;
  observacoes?: string;
  avisoMedico?: string;
  avisos?: string[];
}

const PRIO_STYLE = {
  essencial: { bg: 'DCFCE7', tx: '15803D', pt: 'Essencial', es: 'Esencial' },
  recomendado: { bg: 'FEF3C7', tx: 'B45309', pt: 'Recomendado', es: 'Recomendado' },
  opcional: { bg: 'F1F1F1', tx: '6B7280', pt: 'Opcional', es: 'Opcional' },
} as const;

export async function gerarPdfProtocoloRich(dados: PdfProtocoloInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const obl = await doc.embedFont(StandardFonts.HelveticaOblique);
  const f: Fontes = { reg, bold, obl };
  const es = dados.idioma === 'es';
  const tr = (pt: string, esp: string) => (es ? esp : pt);
  const san = (s?: string) => limpar(s || '').replace(/\s+/g, ' ').trim();

  let page: PDFPage = doc.addPage(A4);
  let y = 0;

  const iniciarPagina = () => {
    desenharCabecalho(page, f, tr('Protocolo personalizado de peptideos', 'Protocolo personalizado de peptidos'));
    y = A4[1] - CAB_H - 26;
  };
  const novaPagina = () => { page = doc.addPage(A4); iniciarPagina(); };
  iniciarPagina();

  const LIM_INF = MARGEM + 20;
  const precisa = (h: number) => { if (y - h < LIM_INF) novaPagina(); };
  const linha = (yy: number) => page.drawLine({ start: { x: MARGEM, y: yy }, end: { x: MARGEM + LARGURA_TXT, y: yy }, thickness: 1, color: hx('EFEFEF') });

  // Parágrafo simples (com quebra).
  const paragrafo = (txt: string, font: PDFFont, size: number, color = PRETO, x = MARGEM, lh = 1.42) => {
    for (const ln of quebrar(txt, font, size, LARGURA_TXT - (x - MARGEM))) {
      precisa(size * lh); y -= size * lh;
      page.drawText(ln, { x, y, size, font, color });
    }
  };

  // Caixa com fundo colorido + rótulo opcional + texto (bloco "por que" etc.).
  const caixa = (label: string | null, texto: string, bg: string, labelColor = VERDE_ESC, textColor = CINZA_MED) => {
    const t = san(texto);
    if (!t) return;
    const size = 10.5, lh = 1.42, padX = 14, padTop = 12, padBot = 12;
    const ls = quebrar(t, reg, size, LARGURA_TXT - padX * 2);
    const labelH = label ? 15 : 0;
    const boxH = padTop + labelH + ls.length * size * lh + padBot;
    precisa(boxH + 8);
    page.drawRectangle({ x: MARGEM, y: y - boxH, width: LARGURA_TXT, height: boxH, color: hx(bg) });
    let cy = y - padTop;
    if (label) { cy -= 9; page.drawText(label, { x: MARGEM + padX, y: cy, size: 8.5, font: bold, color: labelColor }); cy -= 6; }
    for (const ln of ls) { cy -= size; page.drawText(ln, { x: MARGEM + padX, y: cy, size, font: reg, color: textColor }); cy -= size * (lh - 1); }
    y -= boxH + 9;
  };

  // Grade de especificações (Dose, Frequência, …) num quadro claro.
  const specGrid = (specs: { label: string; val: string; hi?: boolean }[]) => {
    const arr = specs.filter((s) => san(s.val));
    if (!arr.length) return;
    const cols = 3, padX = 14, padY = 12, colGap = 12, rowGap = 12;
    const cellW = (LARGURA_TXT - padX * 2 - colGap * (cols - 1)) / cols;
    const labelSize = 7.5, valSize = 10.5, valLh = 1.15;
    const rows: { label: string; val: string; hi?: boolean }[][] = [];
    for (let i = 0; i < arr.length; i += cols) rows.push(arr.slice(i, i + cols));
    const rowHs = rows.map((r) => Math.max(...r.map((c) => labelSize + 5 + quebrar(san(c.val), bold, valSize, cellW).length * valSize * valLh)));
    const boxH = padY + rowHs.reduce((a, b) => a + b, 0) + rowGap * (rows.length - 1) + padY;
    precisa(boxH + 8);
    page.drawRectangle({ x: MARGEM, y: y - boxH, width: LARGURA_TXT, height: boxH, color: hx('F7FAF8'), borderColor: hx('E3F0E8'), borderWidth: 1 });
    let ry = y - padY;
    rows.forEach((r, ri) => {
      r.forEach((c, ci) => {
        const cx = MARGEM + padX + ci * (cellW + colGap);
        page.drawText(c.label.toUpperCase(), { x: cx, y: ry - labelSize, size: labelSize, font: bold, color: CINZA });
        let vy = ry - labelSize - 5;
        for (const vl of quebrar(san(c.val), bold, valSize, cellW)) {
          vy -= valSize;
          page.drawText(vl, { x: cx, y: vy, size: valSize, font: bold, color: c.hi ? VERDE : PRETO });
          vy -= valSize * (valLh - 1);
        }
      });
      ry -= rowHs[ri] + rowGap;
    });
    y -= boxH + 12;
  };

  // Um peptídeo (título + badge + mecanismo + specs + blocos).
  const item = (it: PdfItemProtocolo, n: number) => {
    precisa(70);
    y -= 8;
    const nameSize = 15;
    precisa(nameSize * 1.3); y -= nameSize;
    const prefix = `${n}. `;
    page.drawText(prefix, { x: MARGEM, y, size: nameSize, font: bold, color: VERDE });
    const px = MARGEM + bold.widthOfTextAtSize(prefix, nameSize);
    const pill = PRIO_STYLE[it.prioridade] || PRIO_STYLE.opcional;
    const pillLabel = es ? pill.es : pill.pt;
    const pillSize = 8.5, pillPadX = 8, pillH = 17;
    const pillW = bold.widthOfTextAtSize(pillLabel, pillSize) + pillPadX * 2;
    const pillX = MARGEM + LARGURA_TXT - pillW;
    const nameMaxW = pillX - px - 10;
    let nomeDraw = san(it.nome);
    if (bold.widthOfTextAtSize(nomeDraw, nameSize) > nameMaxW) {
      while (nomeDraw.length > 4 && bold.widthOfTextAtSize(nomeDraw + '…', nameSize) > nameMaxW) nomeDraw = nomeDraw.slice(0, -1);
      nomeDraw += '…';
    }
    page.drawText(nomeDraw, { x: px, y, size: nameSize, font: bold, color: PRETO });
    page.drawRectangle({ x: pillX, y: y - 4, width: pillW, height: pillH, color: hx(pill.bg) });
    page.drawText(pillLabel, { x: pillX + pillPadX, y: y + 1, size: pillSize, font: bold, color: hx(pill.tx) });
    y -= 6;
    if (san(it.mecanismo)) paragrafo(san(it.mecanismo), reg, 10.5, CINZA, MARGEM, 1.35);
    y -= 8;
    specGrid([
      { label: tr('Dose', 'Dosis'), val: it.dose, hi: true },
      { label: tr('Frequência', 'Frecuencia'), val: it.freq || '' },
      { label: tr('Quando', 'Cuándo'), val: it.timing || '' },
      { label: tr('Via', 'Vía'), val: it.route || '' },
      { label: tr('Ciclo', 'Ciclo'), val: it.cycle || '' },
      { label: tr('Descanso', 'Descanso'), val: it.rest || '' },
    ]);
    if (san(it.motivo)) caixa(tr('POR QUE', 'POR QUÉ'), it.motivo!, 'F0FAF3', VERDE_ESC, CINZA_MED);
    if (san(it.comoUsar)) caixa(tr('COMO USAR', 'CÓMO USAR'), it.comoUsar!, 'F6F7F9', CINZA_MED, CINZA_MED);
    if (san(it.alternativa)) caixa(tr('COMPARAÇÃO / ALTERNATIVA', 'COMPARACIÓN / ALTERNATIVA'), it.alternativa!, 'F6F7F9', CINZA_MED, CINZA_MED);
    precisa(16); y -= 8; linha(y); y -= 4;
  };

  // ─── Título + perfil + resumo ───
  const nomePessoa = san(dados.nome);
  precisa(30); y -= 24;
  page.drawText(nomePessoa ? `${tr('Protocolo de', 'Protocolo de')} ${nomePessoa}` : tr('Protocolo sugerido', 'Protocolo sugerido'), { x: MARGEM, y, size: 20, font: bold, color: PRETO });
  if (san(dados.perfil)) { y -= 4; paragrafo(san(dados.perfil), reg, 10.5, CINZA, MARGEM, 1.35); }
  if (san(dados.resumo)) { y -= 4; paragrafo(san(dados.resumo), reg, 11, CINZA_MED, MARGEM, 1.45); }
  y -= 8; linha(y); y -= 6;

  for (const a of dados.avisos || []) caixa(null, a, 'FFFBEB', CINZA_MED, hx('92400E'));

  dados.itens.forEach((it, i) => item(it, i + 1));

  // ─── Orientações ───
  const temOrient = san(dados.orientacaoAlimentar) || san(dados.orientacaoTreino) || san(dados.observacoes);
  if (temOrient) {
    precisa(30); y -= 14;
    page.drawText(tr('Orientações', 'Orientaciones'), { x: MARGEM, y, size: 15, font: bold, color: PRETO });
    y -= 10;
    if (san(dados.orientacaoAlimentar)) caixa(tr('ALIMENTAÇÃO', 'ALIMENTACIÓN'), dados.orientacaoAlimentar!, 'F6F7F9', CINZA_MED, CINZA_MED);
    if (san(dados.orientacaoTreino)) caixa(tr('TREINO', 'ENTRENAMIENTO'), dados.orientacaoTreino!, 'F6F7F9', CINZA_MED, CINZA_MED);
    if (san(dados.observacoes)) caixa(tr('O QUE OBSERVAR', 'QUÉ OBSERVAR'), dados.observacoes!, 'F6F7F9', CINZA_MED, CINZA_MED);
  }

  if (san(dados.avisoMedico)) { y -= 6; paragrafo(san(dados.avisoMedico), obl, 9.5, CINZA, MARGEM, 1.4); }

  // ─── Banner de compra ───
  const qrImg = await embedQr(doc);
  if (y - 24 < MARGEM + 108) novaPagina();
  desenharBanner(page, qrImg, f);

  return doc.save();
}
