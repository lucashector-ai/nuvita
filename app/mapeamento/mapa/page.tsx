// ════════════════════════════════════════════════
//  NUVITA — app/mapeamento/mapa/page.tsx
//  Mapa de todos os pontos cadastrados (Leaflet + OpenStreetMap, sem chave)
//  + relatório de todas as farmácias (tabela) com imprimir/PDF e CSV.
// ════════════════════════════════════════════════

'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import Gate from '@/components/mapeamento/Gate';

type Farmacia = {
  id: string;
  nome: string;
  foto: string | null;
  lat: number | null;
  lng: number | null;
  referencia?: string | null;
  criado_por?: string | null;
  criado_em?: string;
};

export default function Page() {
  return (
    <Gate>
      <MapaRelatorio />
    </Gate>
  );
}

const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtData = (iso?: string) => { if (!iso) return ''; try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return ''; } };

function MapaRelatorio() {
  const [lista, setLista] = useState<Farmacia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/mapeamento');
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok) setLista(data.farmacias || []);
      } catch { /* */ }
      finally { setCarregando(false); }
    })();
  }, []);

  const comLocal = useMemo(() => lista.filter((f) => f.lat != null && f.lng != null), [lista]);

  // Mapa Leaflet — cria uma vez e atualiza os marcadores quando a lista muda.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;
      if (!mapObj.current) {
        mapObj.current = L.map(mapRef.current, { zoomControl: true }).setView([-15.78, -47.93], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap', maxZoom: 19,
        }).addTo(mapObj.current);
        layerRef.current = L.layerGroup().addTo(mapObj.current);
        setTimeout(() => mapObj.current?.invalidateSize(), 120);
      }
      const layer = layerRef.current;
      layer.clearLayers();
      const icon = L.divIcon({
        className: 'nv-pin',
        html: '<svg width="30" height="30" viewBox="0 0 24 24" fill="#16A34A" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"><path d="M12 22s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.6" fill="#fff" stroke="none"/></svg>',
        iconSize: [30, 30], iconAnchor: [15, 29], popupAnchor: [0, -27],
      });
      comLocal.forEach((f) => {
        L.marker([f.lat as number, f.lng as number], { icon })
          .addTo(layer)
          .bindPopup(
            `<div style="min-width:160px">${f.foto ? `<img src="${f.foto}" style="width:100%;height:92px;object-fit:cover;border-radius:8px;margin-bottom:6px"/>` : ''}` +
            `<div style="font-weight:700;font-size:14px">${esc(f.nome)}</div>` +
            `${f.referencia ? `<div style="font-size:12px;color:#555;margin-top:2px">${esc(f.referencia)}</div>` : ''}` +
            `<a href="https://www.google.com/maps?q=${f.lat},${f.lng}" target="_blank" rel="noopener" style="font-size:12px;color:#16A34A;display:inline-block;margin-top:5px">ver no Google Maps</a></div>`,
          );
      });
      if (comLocal.length) {
        const bounds = L.latLngBounds(comLocal.map((f) => [f.lat as number, f.lng as number]));
        mapObj.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    })();
    return () => { cancelled = true; };
  }, [comLocal]);

  useEffect(() => () => { mapObj.current?.remove(); mapObj.current = null; }, []);

  const baixarCsv = () => {
    const header = ['Nome', 'Referência', 'Latitude', 'Longitude', 'Link do mapa', 'Cadastrado por', 'Data'];
    const linhas = lista.map((f) => [
      f.nome, f.referencia || '',
      f.lat ?? '', f.lng ?? '',
      f.lat != null && f.lng != null ? `https://www.google.com/maps?q=${f.lat},${f.lng}` : '',
      f.criado_por || '', fmtData(f.criado_em),
    ]);
    const escCsv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const conteudo = '﻿' + [header, ...linhas].map((r) => r.map(escCsv).join(';')).join('\r\n');
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'farmacias-nuvita.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const imprimir = () => window.print();

  return (
    <div style={S.page}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .rel-item { break-inside: avoid; }
          body { background: #fff !important; }
        }
      `}</style>

      <div style={S.header} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NuvitaLogo width={104} height={22} />
          <Link href="/mapeamento" style={S.voltar}>‹ Cadastro</Link>
        </div>
        <div style={S.headerTag}>Mapa e relatório</div>
      </div>

      <div style={S.container}>
        {/* Mapa */}
        <div ref={mapRef} style={S.map} className="no-print" />
        <div style={S.legenda} className="no-print">
          {carregando ? 'Carregando…' : `${comLocal.length} de ${lista.length} com localização no mapa`}
        </div>

        {/* Ações do relatório */}
        <div style={S.relHead}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Relatório de farmácias</div>
            <div style={{ fontSize: 13, color: '#667085' }}>{lista.length} {lista.length === 1 ? 'farmácia' : 'farmácias'} no total</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }} className="no-print">
            <button onClick={imprimir} style={S.btnGhost}>Imprimir / PDF</button>
            <button onClick={baixarCsv} style={S.btnVerde}>Baixar CSV</button>
          </div>
        </div>

        {/* Tabela / lista do relatório */}
        {carregando ? (
          <div style={S.vazio}>Carregando…</div>
        ) : lista.length === 0 ? (
          <div style={S.vazio}>Nenhuma farmácia cadastrada ainda.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {lista.map((f) => (
              <div key={f.id} style={S.relItem} className="rel-item">
                {f.foto
                  ? <img src={f.foto} alt="" style={S.relFoto} />
                  : <div style={{ ...S.relFoto, ...S.relFotoVazia }}>—</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.relNome}>{f.nome}</div>
                  {f.referencia && <div style={S.relRef}>{f.referencia}</div>}
                  <div style={S.relMeta}>
                    {f.lat != null && f.lng != null
                      ? <a href={`https://www.google.com/maps?q=${f.lat},${f.lng}`} target="_blank" rel="noopener noreferrer" style={S.relLink}>📍 {f.lat.toFixed(5)}, {f.lng.toFixed(5)}</a>
                      : <span style={{ color: '#B0B7C3' }}>sem localização</span>}
                    {f.criado_por && <span> · {f.criado_por}</span>}
                    {f.criado_em && <span> · {fmtData(f.criado_em)}</span>}
                  </div>
                </div>
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

  map: { width: '100%', height: 380, borderRadius: 16, overflow: 'hidden', border: '1px solid #E4E4E4', background: '#EAEDF0', zIndex: 0 },
  legenda: { fontSize: 12.5, color: '#98A2B3', textAlign: 'center', marginTop: 8 },

  relHead: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, margin: '26px 2px 12px', flexWrap: 'wrap' },
  btnGhost: { padding: '11px 15px', borderRadius: 12, background: '#fff', border: '1px solid #D9DCE1', color: '#344054', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  btnVerde: { padding: '11px 15px', borderRadius: 12, background: '#16A34A', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' },

  vazio: { textAlign: 'center', color: '#98A2B3', fontSize: 14, padding: '30px 20px', background: '#fff', border: '1px solid #ECECEC', borderRadius: 16 },
  relItem: { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #ECECEC', borderRadius: 14, padding: 10 },
  relFoto: { width: 54, height: 54, borderRadius: 10, objectFit: 'cover', flexShrink: 0 },
  relFotoVazia: { background: '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4CBD4' },
  relNome: { fontWeight: 700, fontSize: 15 },
  relRef: { fontSize: 13, color: '#475467', lineHeight: 1.4, marginTop: 1 },
  relMeta: { fontSize: 12.5, color: '#98A2B3', marginTop: 3 },
  relLink: { color: '#16A34A', fontWeight: 600, textDecoration: 'none' },
};
