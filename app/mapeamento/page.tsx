// ════════════════════════════════════════════════
//  NUVITA — app/mapeamento/page.tsx
//  Mapeamento de farmácias em campo, pelo celular:
//  tira foto, escreve o nome, ativa a localização (GPS) e salva.
//  A lista fica salva no site (Supabase) e pode ser editada/excluída.
//  Bem simples de propósito.
// ════════════════════════════════════════════════

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import NuvitaLogo from '@/components/ui/NuvitaLogo';

const OK_KEY = 'nv_mapa_ok';

type Farmacia = {
  id: string;
  nome: string;
  foto: string | null;
  lat: number | null;
  lng: number | null;
  criado_em?: string;
};

// Reduz a foto para um JPEG pequeno (máx. ~1280px, qualidade 0.7) antes de
// enviar — mantém a linha leve e o upload rápido no 4G.
function comprimirImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler a imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagem inválida.'));
      img.onload = () => {
        const MAX = 1280;
        let { width, height } = img;
        if (width > height && width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
        else if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas indisponível.'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function MapeamentoPage() {
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(OK_KEY) === '1') setUnlocked(true); } catch { /* */ }
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!unlocked) return <Gate onOk={() => setUnlocked(true)} />;
  return <Mapeamento />;
}

// ─── Gate por PIN (reaproveita /api/farmacia/auth) ───
function Gate({ onOk }: { onOk: () => void }) {
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const LEN = 4;

  const validar = useCallback(async (codigo: string) => {
    setLoading(true); setErro('');
    try {
      const res = await fetch('/api/farmacia/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: codigo }),
      });
      if (res.ok) { try { sessionStorage.setItem(OK_KEY, '1'); } catch { /* */ } onOk(); }
      else if (res.status === 429) { setErro('Muitas tentativas. Aguarde.'); setPin(''); }
      else { setErro('PIN incorreto.'); setPin(''); }
    } catch { setErro('Erro de conexão.'); setPin(''); }
    finally { setLoading(false); }
  }, [onOk]);

  useEffect(() => { if (pin.length === LEN && !loading) validar(pin); /* eslint-disable-next-line */ }, [pin]);

  return (
    <div style={S.gateWrap} className="grad">
      <div style={S.gateCard}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><NuvitaLogo width={120} height={26} /></div>
        <div style={S.tag}>Mapeamento</div>
        <p style={S.gateLead}>Digite o PIN de acesso</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '18px 0' }}>
          {Array.from({ length: LEN }).map((_, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i < pin.length ? '#16A34A' : '#E5E7EB', transition: 'background .15s' }} />
          ))}
        </div>
        {erro && <div style={S.gateErro}>{erro}</div>}
        <div style={S.pad}>
          {['1','2','3','4','5','6','7','8','9'].map((d) => (
            <button key={d} onClick={() => { setErro(''); setPin((p) => p.length >= LEN ? p : p + d); }} style={S.key} disabled={loading}>{d}</button>
          ))}
          <div />
          <button onClick={() => { setErro(''); setPin((p) => p.length >= LEN ? p : p + '0'); }} style={S.key} disabled={loading}>0</button>
          <button onClick={() => { setErro(''); setPin((p) => p.slice(0, -1)); }} style={{ ...S.key, fontSize: 20 }} disabled={loading}>⌫</button>
        </div>
        {loading && <div style={{ fontSize: 12, color: '#98A2B3', marginTop: 14 }}>Verificando…</div>}
      </div>
    </div>
  );
}

// ─── Tela principal ───
function Mapeamento() {
  const [lista, setLista] = useState<Farmacia[]>([]);
  const [carregando, setCarregando] = useState(true);

  // form
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'carregando' | 'ok' | 'erro'>('idle');
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch('/api/mapeamento');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) setLista(data.farmacias || []);
    } catch { /* */ }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const limparForm = () => {
    setEditId(null); setNome(''); setFoto(null); setLat(null); setLng(null);
    setGpsStatus('idle'); setErro('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const onFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(''); setProcessandoFoto(true);
    try { setFoto(await comprimirImagem(file)); }
    catch { setErro('Não foi possível processar a foto.'); }
    finally { setProcessandoFoto(false); }
  };

  const ativarLocalizacao = () => {
    if (!('geolocation' in navigator)) { setGpsStatus('erro'); setErro('GPS não disponível neste aparelho.'); return; }
    setGpsStatus('carregando'); setErro('');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setGpsStatus('ok'); },
      () => { setGpsStatus('erro'); setErro('Não foi possível pegar a localização. Autorize o acesso ao GPS.'); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  };

  const salvar = async () => {
    setErro('');
    if (!nome.trim()) { setErro('Escreva o nome da farmácia.'); return; }
    setSalvando(true);
    try {
      const payload = { nome: nome.trim(), foto, lat, lng };
      const res = editId
        ? await fetch('/api/mapeamento', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...payload }) })
        : await fetch('/api/mapeamento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        const nova: Farmacia = data.farmacia;
        setLista((L) => editId ? L.map((f) => f.id === nova.id ? nova : f) : [nova, ...L]);
        limparForm();
      } else setErro(data?.error || 'Não foi possível salvar.');
    } catch { setErro('Erro de conexão ao salvar.'); }
    finally { setSalvando(false); }
  };

  const editar = (f: Farmacia) => {
    setEditId(f.id); setNome(f.nome); setFoto(f.foto); setLat(f.lat); setLng(f.lng);
    setGpsStatus(f.lat != null && f.lng != null ? 'ok' : 'idle'); setErro('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    formRef.current?.focus?.();
  };

  const excluir = async (f: Farmacia) => {
    if (!window.confirm(`Excluir "${f.nome}"?`)) return;
    setLista((L) => L.filter((x) => x.id !== f.id));
    if (editId === f.id) limparForm();
    try { await fetch(`/api/mapeamento?id=${encodeURIComponent(f.id)}`, { method: 'DELETE' }); }
    catch { /* já removida da tela; recarrega em caso de erro */ carregar(); }
  };

  const podeSalvar = nome.trim().length > 0 && !salvando && !processandoFoto;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <NuvitaLogo width={104} height={22} />
        <div style={S.headerTag}>Mapeamento de farmácias</div>
      </div>

      <div style={S.container}>
        {/* Formulário */}
        <div ref={formRef} tabIndex={-1} style={S.card}>
          <div style={S.cardTit}>{editId ? 'Editar farmácia' : 'Nova farmácia'}</div>

          {/* Foto */}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFoto} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} style={S.fotoBtn} disabled={processandoFoto}>
            {foto ? (
              <img src={foto} alt="" style={S.fotoPreview} />
            ) : (
              <div style={S.fotoPlaceholder}>
                <CamIcon />
                <span>{processandoFoto ? 'Processando…' : 'Tirar foto da farmácia'}</span>
              </div>
            )}
          </button>
          {foto && <button onClick={() => fileRef.current?.click()} style={S.trocarFoto}>Trocar foto</button>}

          {/* Nome */}
          <label style={S.label}>Nome da farmácia</label>
          <input className="inp" placeholder="Ex.: Farmácia São João" value={nome} onChange={(e) => { setErro(''); setNome(e.target.value); }} style={S.inp} />

          {/* Localização */}
          <label style={S.label}>Localização</label>
          <button onClick={ativarLocalizacao} style={{ ...S.gpsBtn, ...(gpsStatus === 'ok' ? S.gpsBtnOk : {}) }} disabled={gpsStatus === 'carregando'}>
            <PinIcon />
            {gpsStatus === 'carregando' ? 'Pegando localização…'
              : gpsStatus === 'ok' ? 'Localização capturada ✓'
              : 'Ativar localização (GPS)'}
          </button>
          {gpsStatus === 'ok' && lat != null && lng != null && (
            <div style={S.coord}>
              {lat.toFixed(5)}, {lng.toFixed(5)} · <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" style={S.link}>ver no mapa</a>
            </div>
          )}

          {erro && <div style={S.erro}>{erro}</div>}

          <button onClick={salvar} disabled={!podeSalvar} style={{ ...S.salvarBtn, opacity: podeSalvar ? 1 : 0.5 }}>
            {salvando ? 'Salvando…' : editId ? 'Salvar alterações' : 'Salvar farmácia'}
          </button>
          {editId && <button onClick={limparForm} style={S.cancelar}>Cancelar edição</button>}
        </div>

        {/* Lista */}
        <div style={S.listaHead}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Farmácias mapeadas</span>
          <span style={S.contador}>{lista.length}</span>
        </div>

        {carregando ? (
          <div style={S.vazio}>Carregando…</div>
        ) : lista.length === 0 ? (
          <div style={S.vazio}>Nenhuma farmácia ainda. Cadastre a primeira acima. 👆</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {lista.map((f) => (
              <div key={f.id} style={S.item}>
                {f.foto
                  ? <img src={f.foto} alt="" style={S.itemFoto} />
                  : <div style={{ ...S.itemFoto, ...S.itemFotoVazia }}><CamIcon dim /></div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.itemNome}>{f.nome}</div>
                  {f.lat != null && f.lng != null ? (
                    <a href={`https://www.google.com/maps?q=${f.lat},${f.lng}`} target="_blank" rel="noopener noreferrer" style={S.itemLoc}><PinIcon small /> ver no mapa</a>
                  ) : (
                    <span style={{ ...S.itemLoc, color: '#B0B7C3' }}><PinIcon small /> sem localização</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => editar(f)} style={S.acaoBtn} aria-label="Editar"><EditIcon /></button>
                  <button onClick={() => excluir(f)} style={{ ...S.acaoBtn, ...S.acaoDel }} aria-label="Excluir"><TrashIcon /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ícones inline (linha) ───
const CamIcon = ({ dim }: { dim?: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={dim ? '#C4CBD4' : '#16A34A'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8a2 2 0 0 1 2-2h1.5l1-2h5l1 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);
const PinIcon = ({ small }: { small?: boolean }) => (
  <svg width={small ? 13 : 18} height={small ? 13 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" />
  </svg>
);
const EditIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
);
const TrashIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
);

const S: Record<string, React.CSSProperties> = {
  // gate
  gateWrap: { minHeight: '100vh', background: '#FBFBFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  gateCard: { background: '#fff', border: '1px solid #ECEDEE', borderRadius: 28, padding: '36px 30px', width: '100%', maxWidth: 344, textAlign: 'center', boxShadow: '0 12px 40px rgba(16,24,40,.08)' },
  tag: { fontSize: 11, color: '#98A2B3', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, marginTop: 8 },
  gateLead: { fontSize: 13.5, color: '#667085', marginTop: 12 },
  gateErro: { fontSize: 13, color: '#B91C1C', background: '#FEF2F2', borderRadius: 10, padding: '9px 12px', marginBottom: 16 },
  pad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 6 },
  key: { height: 64, borderRadius: 18, border: '1px solid #EDEDED', background: '#FBFBFA', fontFamily: 'inherit', fontSize: 24, fontWeight: 500, color: '#0E1113', cursor: 'pointer' },

  // página
  page: { minHeight: '100vh', background: '#FBFBFA', paddingBottom: 40 },
  header: { background: '#16A34A', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 },
  headerTag: { color: '#DCFCE7', fontSize: 13, fontWeight: 600 },
  container: { maxWidth: 560, margin: '0 auto', padding: '16px 14px 0' },

  card: { background: '#fff', border: '1px solid #ECECEC', borderRadius: 18, padding: 18, outline: 'none' },
  cardTit: { fontWeight: 700, fontSize: 16, marginBottom: 14 },

  fotoBtn: { width: '100%', border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'block' },
  fotoPlaceholder: { width: '100%', aspectRatio: '16/10', borderRadius: 14, border: '2px dashed #CBEAD8', background: '#F4FBF7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#16A34A', fontSize: 14, fontWeight: 600 },
  fotoPreview: { width: '100%', aspectRatio: '16/10', objectFit: 'cover', borderRadius: 14, display: 'block' },
  trocarFoto: { background: 'none', border: 'none', color: '#16A34A', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8, padding: '4px 0' },

  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475467', margin: '16px 0 7px' },
  inp: { width: '100%', padding: '13px 15px', fontSize: 16, borderRadius: 12, border: '1px solid #E4E4E4', background: '#fff', fontFamily: 'inherit', color: '#0E1113' },

  gpsBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, border: '1.5px solid #16A34A', background: '#fff', color: '#16A34A', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  gpsBtnOk: { background: '#F0FDF4', color: '#15803D', borderColor: '#86EFAC' },
  coord: { fontSize: 12.5, color: '#667085', marginTop: 8, textAlign: 'center' },
  link: { color: '#16A34A', fontWeight: 600, textDecoration: 'underline' },

  erro: { fontSize: 13, color: '#B45309', background: '#FFFBEB', borderRadius: 10, padding: '9px 12px', marginTop: 14 },
  salvarBtn: { width: '100%', marginTop: 18, padding: '15px', borderRadius: 14, background: '#16A34A', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  cancelar: { width: '100%', marginTop: 8, background: 'none', border: 'none', color: '#98A2B3', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', padding: '6px 0' },

  listaHead: { display: 'flex', alignItems: 'center', gap: 10, margin: '26px 4px 12px' },
  contador: { background: '#EAF7F0', color: '#16A34A', fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '2px 10px' },
  vazio: { textAlign: 'center', color: '#98A2B3', fontSize: 14, padding: '30px 20px', background: '#fff', border: '1px solid #ECECEC', borderRadius: 16, lineHeight: 1.5 },

  item: { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #ECECEC', borderRadius: 16, padding: 10 },
  itemFoto: { width: 58, height: 58, borderRadius: 12, objectFit: 'cover', flexShrink: 0 },
  itemFotoVazia: { background: '#F4FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemNome: { fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemLoc: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#16A34A', fontWeight: 600, textDecoration: 'none', marginTop: 3 },

  acaoBtn: { width: 40, height: 40, borderRadius: 11, border: '1px solid #EDEDED', background: '#FBFBFA', color: '#475467', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  acaoDel: { color: '#DC2626', borderColor: '#FEE2E2', background: '#FEF2F2' },
};
