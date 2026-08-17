// ════════════════════════════════════════════════
//  NUVITA — lib/mapeamentoRoteiro.ts
//  Organiza as farmácias do mapa em GRUPOS por proximidade (mesmo prédio /
//  galeria / calçada), rotula pelo shopping citado, junta pontos soltos que
//  estão perto e ordena como um roteiro a pé (do norte, vizinho mais próximo).
//  Roda no cliente a partir dos dados ao vivo — atualiza conforme mapeiam.
// ════════════════════════════════════════════════

export interface PontoRoteiro {
  nome: string;
  lat: number;
  lng: number;
  ref?: string | null;
  por?: string | null;
}

export interface GrupoRoteiro {
  ordem: number;
  label: string;
  cor: string;
  cLat: number;
  cLng: number;
  maps: string;
  farmacias: PontoRoteiro[];
}

const SEM_SHOPPING = 'Sem shopping citado';

// Shoppings / galerias reconhecidos nas referências (rótulo → regex).
const LANDMARKS: [string, RegExp][] = [
  ['Shopping Internacional', /internacional/],
  ['Lai Lai Center', /lai\s*lai/],
  ['Galeria Uniamérica', /uniamerica|uniamérica/],
  ['Galeria Jebai', /jebai|jebay/],
  ['Shopping América / Americana', /americ/],
  ['Shopping Paris', /shopping paris|newera|toku/],
  ['Shopping China', /shopping china/],
  ['Shopping Santo Domingo', /santo domingo/],
  ['Shopping Vendôme', /vendome|vendôme/],
  ['Shopping Box', /shopping box/],
  ['Shopping Afonso', /afonso/],
  ['Madrid Center', /madrid/],
  ['Shopping Mina Índia', /mina ind|mina índ/],
  ['Galeria Rahal', /rahal/],
  ['New Zone', /new zone/],
  ['Galeria Victoria', /victoria|victória/],
  ['Galeria Zuni', /zuni/],
  ['Shopping Barcelona', /barcelona/],
  ['Prime Lounge / Cassino Acaray', /prime lounge|acaray/],
  ['Nissei (área)', /nissei/],
  ['Ponto Com (área)', /ponto\s*com|pontocom/],
  ['Shopping Hwui', /hwui/],
  ['Marine Tower', /marine/],
  ['Front / Autorama', /autorama|front farma/],
  ['Hotel Mi Abuela di Trento', /mi abuela|trento/],
];

function rotuloDominante(pts: PontoRoteiro[]): string {
  const cont: Record<string, number> = {};
  for (const p of pts) {
    const r = (p.ref || '').toLowerCase();
    for (const [nome, re] of LANDMARKS) if (re.test(r)) cont[nome] = (cont[nome] || 0) + 1;
  }
  const top = Object.entries(cont).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : SEM_SHOPPING;
}

function centroide(pts: PontoRoteiro[]) {
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  };
}

// Distância aproximada em metros (equiretangular) — precisa o bastante em escala de rua.
function fabricaDist(latMedia: number) {
  const lat0 = (latMedia * Math.PI) / 180;
  const mLng = 111320 * Math.cos(lat0);
  const mLat = 110540;
  return (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
    Math.hypot((b.lng - a.lng) * mLng, (b.lat - a.lat) * mLat);
}

/**
 * Agrupa as farmácias em grupos de rota.
 * @param raio  distância (m) para o mesmo grupo (padrão 45)
 * @param raioJuntar  distância (m) para absorver ponto "sem shopping" solto (padrão 85)
 */
export function agruparRoteiro(pontos: PontoRoteiro[], raio = 45, raioJuntar = 85): GrupoRoteiro[] {
  const pts = pontos.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (!pts.length) return [];
  const latMedia = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const dist = fabricaDist(latMedia);

  // 1) clusterização gulosa por proximidade
  type C = { pts: PontoRoteiro[]; cent: { lat: number; lng: number }; label: string };
  const cl: C[] = [];
  for (const f of pts) {
    let best: C | null = null;
    let bd = Infinity;
    for (const c of cl) { const d = dist(f, c.cent); if (d < bd) { bd = d; best = c; } }
    if (best && bd <= raio) { best.pts.push(f); best.cent = centroide(best.pts); }
    else cl.push({ pts: [f], cent: { lat: f.lat, lng: f.lng }, label: '' });
  }
  cl.forEach((c) => { c.label = rotuloDominante(c.pts); });

  // 2) junta grupos "sem shopping" ao vizinho mais próximo dentro do raioJuntar
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (let i = 0; i < cl.length; i++) {
      if (cl[i].label !== SEM_SHOPPING) continue;
      let nb: C | null = null; let nd = Infinity;
      for (let k = 0; k < cl.length; k++) { if (k === i) continue; const d = dist(cl[i].cent, cl[k].cent); if (d < nd) { nd = d; nb = cl[k]; } }
      if (nb && nd <= raioJuntar) {
        nb.pts = nb.pts.concat(cl[i].pts);
        nb.cent = centroide(nb.pts);
        if (nb.label === SEM_SHOPPING) nb.label = rotuloDominante(nb.pts);
        cl.splice(i, 1);
        mudou = true;
        break;
      }
    }
  }

  // 3) ordena como roteiro a pé: começa no ponto mais ao norte, sempre o mais próximo
  const rota: C[] = [];
  const rem = cl.slice();
  let cur = rem.reduce((a, b) => (a.cent.lat > b.cent.lat ? a : b));
  rem.splice(rem.indexOf(cur), 1);
  rota.push(cur);
  while (rem.length) {
    let nb: C | null = null; let nd = Infinity;
    for (const c of rem) { const d = dist(cur.cent, c.cent); if (d < nd) { nd = d; nb = c; } }
    rem.splice(rem.indexOf(nb as C), 1);
    rota.push(nb as C);
    cur = nb as C;
  }

  const N = rota.length;
  return rota.map((c, i) => ({
    ordem: i + 1,
    label: c.label,
    cor: `hsl(${Math.round((i * 360) / N)} 62% 45%)`,
    cLat: c.cent.lat,
    cLng: c.cent.lng,
    maps: `https://www.google.com/maps?q=${c.cent.lat},${c.cent.lng}`,
    farmacias: c.pts,
  }));
}
