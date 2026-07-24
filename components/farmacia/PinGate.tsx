// ════════════════════════════════════════════════
//  NUVITA — components/farmacia/PinGate.tsx
//  Trava por PIN do balcão. O PIN é validado no servidor
//  (/api/farmacia/auth) e nunca é embutido no bundle.
//  Uma vez liberado, fica desbloqueado durante a sessão do tablet.
// ════════════════════════════════════════════════

'use client';

import { useEffect, useState } from 'react';

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
        <div style={{ fontSize: 30, marginBottom: 6 }}>💚</div>
        <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-.03em' }}>Nuvita · Balcão</div>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 22 }}>
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
    background: '#F7F7F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: '#fff',
    border: '1px solid #EBEBEB',
    borderRadius: 24,
    padding: '32px 28px',
    width: '100%',
    maxWidth: 340,
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,.08)',
  },
  erro: {
    fontSize: 13,
    color: '#B91C1C',
    background: '#FEF2F2',
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 14,
  },
  pad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginTop: 6,
  },
  key: {
    height: 62,
    borderRadius: 16,
    border: '1.5px solid #EBEBEB',
    background: '#fff',
    fontFamily: 'inherit',
    fontSize: 24,
    fontWeight: 500,
    color: '#0F1115',
    cursor: 'pointer',
    transition: 'all .1s',
  },
};
