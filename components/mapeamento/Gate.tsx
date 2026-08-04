// ════════════════════════════════════════════════
//  NUVITA — components/mapeamento/Gate.tsx
//  Acesso do Mapeamento por PIN (dois usuários). Ao entrar, guarda o nome
//  do acesso para gravar em cada farmácia cadastrada.
//  Fica desbloqueado durante a sessão (aba).
// ════════════════════════════════════════════════

'use client';

import { useCallback, useEffect, useState } from 'react';
import NuvitaLogo from '@/components/ui/NuvitaLogo';

export const OK_KEY = 'nv_mapa_ok';
export const USER_KEY = 'nv_mapa_user';

const PIN_LEN = 6;

export default function Gate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(OK_KEY) === '1') setUnlocked(true); } catch { /* */ }
    setChecked(true);
  }, []);

  const validar = useCallback(async (codigo: string) => {
    setLoading(true); setErro('');
    try {
      const res = await fetch('/api/mapeamento/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: codigo }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        try {
          sessionStorage.setItem(OK_KEY, '1');
          if (data.nome) sessionStorage.setItem(USER_KEY, data.nome);
        } catch { /* */ }
        setUnlocked(true);
      } else if (res.status === 429) { setErro('Muitas tentativas. Aguarde.'); setPin(''); }
      else { setErro('PIN incorreto.'); setPin(''); }
    } catch { setErro('Erro de conexão.'); setPin(''); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (pin.length === PIN_LEN && !loading) validar(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  if (!checked) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div style={S.wrap} className="grad">
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><NuvitaLogo width={120} height={26} /></div>
        <div style={S.tag}>Mapeamento</div>
        <p style={S.lead}>Digite o seu PIN de acesso</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '18px 0' }}>
          {Array.from({ length: PIN_LEN }).map((_, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i < pin.length ? '#16A34A' : '#E5E7EB', transition: 'background .15s' }} />
          ))}
        </div>
        {erro && <div style={S.erro}>{erro}</div>}
        <div style={S.pad}>
          {['1','2','3','4','5','6','7','8','9'].map((d) => (
            <button key={d} onClick={() => { setErro(''); setPin((p) => p.length >= PIN_LEN ? p : p + d); }} style={S.key} disabled={loading}>{d}</button>
          ))}
          <div />
          <button onClick={() => { setErro(''); setPin((p) => p.length >= PIN_LEN ? p : p + '0'); }} style={S.key} disabled={loading}>0</button>
          <button onClick={() => { setErro(''); setPin((p) => p.slice(0, -1)); }} style={{ ...S.key, fontSize: 20 }} disabled={loading}>⌫</button>
        </div>
        {loading && <div style={{ fontSize: 12, color: '#98A2B3', marginTop: 14 }}>Verificando…</div>}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', background: '#FBFBFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: '#fff', border: '1px solid #ECEDEE', borderRadius: 28, padding: '36px 30px', width: '100%', maxWidth: 344, textAlign: 'center', boxShadow: '0 12px 40px rgba(16,24,40,.08)' },
  tag: { fontSize: 11, color: '#98A2B3', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, marginTop: 8 },
  lead: { fontSize: 13.5, color: '#667085', marginTop: 12 },
  erro: { fontSize: 13, color: '#B91C1C', background: '#FEF2F2', borderRadius: 10, padding: '9px 12px', marginBottom: 16 },
  pad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 6 },
  key: { height: 64, borderRadius: 18, border: '1px solid #EDEDED', background: '#FBFBFA', fontFamily: 'inherit', fontSize: 24, fontWeight: 500, color: '#0E1113', cursor: 'pointer' },
};
