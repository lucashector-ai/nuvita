// ════════════════════════════════════════════════
//  NUVITA — app/mapeamento/roteiro/page.tsx
//  Roteiro das farmácias: agrupa os pontos por proximidade (shopping/galeria/
//  calçada), ordena como um caminho a pé e mostra num mapa colorido por grupo.
//  Usa os dados ao vivo — atualiza conforme mapeiam.
// ════════════════════════════════════════════════

'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import Gate from '@/components/mapeamento/Gate';
import { agruparRoteiro, type GrupoRoteiro } from '@/lib/mapeamentoRoteiro';

type Farmacia = { id: string; nome: string; lat: number | null; lng: number | null; referencia?: string | null; criado_por?: string | null };

export default function Page() {
  return (
    <Gate>
      <Roteiro />
    </Gate>
  );
}

const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const acesso = (p?: string | null) => (p ? p.replace(/Acesso\s*/i, 'A') : '');

function Roteiro() {
  const [lista, setLista] = useState<Farmacia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/mapeamento?slim=1');
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok) setLista(data.farmacias || []);
      } catch { /* */ }
      finally { setCarregando(false); }
    })();
  }, []);

  const grupos = useMemo<GrupoRoteiro[]>(() => {
    const pts = lista
      .filter((f) => f.lat != null && f.lng != null)
      .map((f) => ({ nome: f.nome, lat: f.lat as number, lng: f.lng as number, ref: f.referencia, por: f.criado_por }));
    return agruparRoteiro(pts);
  }, [lista]);

  const totalF = grupos.reduce((s, g) => s + g.farmacias.length, 0);

  const focar = (g: GrupoRoteiro) => {
    if (mapObj.current) {
      mapObj.current.setView([g.cLat, g.cLng], 18, { animate: true });
      mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Mapa Leaflet — pontos coloridos por grupo + número do grupo no centro.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;
      if (!mapObj.current) {
        mapObj.current = L.map(mapRef.current, { zoomControl: true }).setView([-25.511, -54.609], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(mapObj.current);
        layerRef.current = L.layerGroup().addTo(mapObj.current);
        setTimeout(() => mapObj.current?.invalidateSize(), 120);
      }
      const layer = layerRef.current;
      layer.clearLayers();
      const todos: [number, number][] = [];
      grupos.forEach((g) => {
        g.farmacias.forEach((p) => {
          todos.push([p.lat, p.lng]);
          L.circleMarker([p.lat, p.lng], { radius: 5, color: '#fff', weight: 1.5, fillColor: g.cor, fillOpacity: 0.95 })
            .addTo(layer)
            .bindPopup(`<div style="min-width:150px"><div style="font-size:11px;font-weight:700;color:${g.cor}">GRUPO ${g.ordem} · ${esc(g.label)}</div><div style="font-weight:700;font-size:14px;margin-top:2px">${esc(p.nome)}</div>${p.ref ? `<div style="font-size:12px;color:#555;margin-top:2px">${esc(p.ref)}</div>` : ''}</div>`);
        });
        // marcador numerado no centro do grupo
        const badge = L.divIcon({
          className: 'nv-badge',
          html: `<div style="width:26px;height:26px;border-radius:50%;background:${g.cor};color:#fff;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font:700 12px -apple-system,system-ui,sans-serif">${g.ordem}</div>`,
          iconSize: [26, 26], iconAnchor: [13, 13],
        });
        L.marker([g.cLat, g.cLng], { icon: badge, zIndexOffset: 1000 })
          .addTo(layer)
          .bindPopup(`<div style="font-weight:700">Grupo ${g.ordem} — ${esc(g.label)}</div><div style="font-size:12px;color:#555">${g.farmacias.length} farmácias</div>`);
      });
      if (todos.length) mapObj.current.fitBounds(L.latLngBounds(todos), { padding: [40, 40], maxZoom: 17 });
    })();
    return () => { cancelled = true; };
  }, [grupos]);

  useEffect(() => () => { mapObj.current?.remove(); mapObj.current = null; }, []);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NuvitaLogo width={104} height={22} />
          <Link href="/mapeamento/mapa" style={S.voltar}>‹ Mapa</Link>
        </div>
        <div style={S.headerTag}>Roteiro das farmácias</div>
      </div>

      <div style={S.container}>
        <div ref={mapRef} style={S.map} />
        <div style={S.legenda}>
          {carregando ? 'Carregando…' : `${totalF} farmácias · ${grupos.length} grupos · cada cor é um grupo`}
        </div>

        {!carregando && grupos.length === 0 ? (
          <div style={S.vazio}>Nenhuma farmácia com localização ainda.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12, marginTop: 22 }}>
            {grupos.map((g) => (
              <div key={g.ordem} style={S.grp}>
                <div style={S.grpHead}>
                  <button onClick={() => focar(g)} style={{ ...S.ord, background: g.cor }} aria-label={`Focar grupo ${g.ordem} no mapa`}>{g.ordem}</button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.grpNome}>{g.label}</div>
                    <div style={S.grpMeta}>
                      {g.farmacias.length} {g.farmacias.length === 1 ? 'farmácia' : 'farmácias'}
                      {' · '}
                      <button onClick={() => focar(g)} style={S.linkBtn}>focar no mapa</button>
                      {' · '}
                      <a href={g.maps} target="_blank" rel="noopener noreferrer" style={S.link}>Google Maps ↗</a>
                    </div>
                  </div>
                </div>
                <ul style={S.lst}>
                  {g.farmacias.map((p, i) => (
                    <li key={p.nome + i} style={S.li}>
                      <div style={{ minWidth: 0 }}>
                        <div style={S.nm}>{p.nome}</div>
                        <div style={p.ref ? S.rf : { ...S.rf, opacity: 0.6, fontStyle: 'italic' }}>{p.ref || 'sem referência'}</div>
                      </div>
                      {p.por && <span style={S.by}>{acesso(p.por)}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#FBFBFA', paddingBottom: 40 },
  header: { background: '#16A34A', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 },
  headerTag: { color: '#DCFCE7', fontSize: 13, fontWeight: 600 },
  voltar: { color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,.22)', borderRadius: 20, padding: '5px 14px' },
  container: { maxWidth: 720, margin: '0 auto', padding: '16px 14px 0' },
  map: { width: '100%', height: 400, borderRadius: 16, overflow: 'hidden', border: '1px solid #E4E4E4', background: '#EAEDF0', zIndex: 0, scrollMarginTop: 12 },
  legenda: { fontSize: 12.5, color: '#98A2B3', textAlign: 'center', marginTop: 8 },
  vazio: { textAlign: 'center', color: '#98A2B3', fontSize: 14, padding: '30px 20px', background: '#fff', border: '1px solid #ECECEC', borderRadius: 16, marginTop: 22 },

  grp: { background: '#fff', border: '1px solid #ECECEC', borderRadius: 16, padding: '14px 14px 6px' },
  grpHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  ord: { flex: 'none', width: 36, height: 36, borderRadius: 11, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' },
  grpNome: { fontWeight: 700, fontSize: 17, letterSpacing: '-.01em', lineHeight: 1.15 },
  grpMeta: { fontSize: 12.5, color: '#98A2B3', marginTop: 2 },
  link: { color: '#16A34A', fontWeight: 600, textDecoration: 'none' },
  linkBtn: { background: 'none', border: 'none', padding: 0, color: '#16A34A', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5 },
  lst: { listStyle: 'none', margin: 0, padding: 0 },
  li: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 2px', borderTop: '1px solid #F1F3F2' },
  nm: { fontWeight: 650, fontSize: 15 },
  rf: { fontSize: 13, color: '#667085', lineHeight: 1.4, marginTop: 2 },
  by: { flex: 'none', fontSize: 11, fontWeight: 700, color: '#98A2B3', background: '#F5F7F6', border: '1px solid #E7E7E7', borderRadius: 7, padding: '3px 7px' },
};
