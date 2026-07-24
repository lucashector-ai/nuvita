// ════════════════════════════════════════════════
//  NUVITA — components/farmacia/PinGate.tsx
//  Trava por PIN do balcão. O PIN é validado no servidor
//  (/api/farmacia/auth) e nunca é embutido no bundle.
//  Uma vez liberado, fica desbloqueado durante a sessão do tablet.
// ════════════════════════════════════════════════

'use client';

import { useEffect, useState } from 'react';
import NuvitaLogo from '@/components/ui/NuvitaLogo';

const STORAGE_KEY = 'nv_farmacia_ok';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') setUnlocked(true);
    } catch {
      /* ignore */
    }
    setChecked(true);
  }, []);

  const validar = async (valor: string) => {
    setLoading(true);
    setErro('');
    try {
      const res = await fetch('/api/farmacia/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: valor }),
      });
      if (res.ok) {
        try {
          sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
          /* ignore */
        }
        setUnlocked(true);
      } else if (res.status === 429) {
        setErro('Muitas tentativas. Aguarde um instante.');
        setPin('');
      } else {
        setErro('PIN incorreto');
        setPin('');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const digitar = (d: string) => {
    if (loading) return;
    setErro('');
    const novo = (pin + d).slice(0, 4);
    setPin(novo);
    if (novo.length === 4) validar(novo);
  };

  const apagar = () => {
    if (loading) return;
    setErro('');
    setPin((p) => p.slice(0, -1));
  };

  if (!checked) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div style={S.wrap} className="grad">
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <NuvitaLogo width={120} height={26} />
        </div>
        <div style={{ fontSize: 11, color: '#98A2B3', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600 }}>
          Balcão
        </div>
        <p style={{ fontSize: 13.5, color: '#667085', marginTop: 12, marginBottom: 24 }}>
          Digite o PIN de acesso da farmácia
        </p>

        {/* Indicadores dos 4 dígitos */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 18 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: i < pin.length ? '#22C55E' : '#E5E7EB',
                transition: 'background .15s',
              }}
            />
          ))}
        </div>

        {erro && <div style={S.erro}>{erro}</div>}

        {/* Teclado numérico */}
        <div style={S.pad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} onClick={() => digitar(d)} style={S.key} disabled={loading}>
              {d}
            </button>
          ))}
          <div />
          <button onClick={() => digitar('0')} style={S.key} disabled={loading}>
            0
          </button>
          <button onClick={apagar} style={{ ...S.key, fontSize: 20 }} disabled={loading}>
            ⌫
          </button>
        </div>

        {loading && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 14 }}>Verificando…</div>}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '100vh',
    background: '#FBFBFA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: '#fff',
    border: '1px solid #ECEDEE',
    borderRadius: 28,
    padding: '36px 30px',
    width: '100%',
    maxWidth: 344,
    textAlign: 'center',
    boxShadow: '0 12px 40px rgba(16,24,40,.08)',
  },
  erro: {
    fontSize: 13,
    color: '#B91C1C',
    background: '#FEF2F2',
    borderRadius: 10,
    padding: '9px 12px',
    marginBottom: 16,
  },
  pad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginTop: 6,
  },
  key: {
    height: 64,
    borderRadius: 18,
    border: '1px solid #EDEDED',
    background: '#FBFBFA',
    fontFamily: 'inherit',
    fontSize: 24,
    fontWeight: 500,
    color: '#0E1113',
    cursor: 'pointer',
    transition: 'background .1s, border-color .1s',
  },
};
