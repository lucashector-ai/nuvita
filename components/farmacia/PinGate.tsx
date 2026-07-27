// ════════════════════════════════════════════════
//  NUVITA — components/farmacia/PinGate.tsx
//  Acesso do balcão pelo CÓDIGO DA FARMÁCIA (a senha criada em
//  /farmacia/estoque). Ao entrar, carrega o estoque da farmácia
//  e o balcão passa a recomendar só o que ela tem.
//  Fallback: o PIN mestre (FARMACIA_PIN) libera com catálogo completo.
//  Fica desbloqueado durante a sessão do tablet.
// ════════════════════════════════════════════════

'use client';

import { useEffect, useState } from 'react';
import NuvitaLogo from '@/components/ui/NuvitaLogo';

const OK_KEY = 'nv_farmacia_ok';
export const ESTOQUE_KEY = 'nv_farmacia_estoque';
export const NOME_KEY = 'nv_farmacia_nome';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(OK_KEY) === '1') setUnlocked(true);
    } catch {
      /* ignore */
    }
    setChecked(true);
  }, []);

  const persistir = (estoque: string[] | null, nome: string | null) => {
    try {
      sessionStorage.setItem(OK_KEY, '1');
      if (estoque) sessionStorage.setItem(ESTOQUE_KEY, JSON.stringify(estoque));
      else sessionStorage.removeItem(ESTOQUE_KEY);
      if (nome) sessionStorage.setItem(NOME_KEY, nome);
      else sessionStorage.removeItem(NOME_KEY);
    } catch {
      /* ignore */
    }
  };

  const entrar = async () => {
    const c = codigo.trim();
    if (c.length < 4) return setErro('Digite o código de acesso da farmácia.');
    setLoading(true);
    setErro('');
    try {
      // 1) Tenta como código de farmácia (carrega o estoque).
      const res = await fetch('/api/farmacia/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', codigo: c }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.found) {
        persistir(Array.isArray(data.peptideos) ? data.peptideos : [], data.nome || null);
        setUnlocked(true);
        return;
      }

      // 2) Fallback: PIN mestre → catálogo completo (sem filtro de estoque).
      const resPin = await fetch('/api/farmacia/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: c }),
      });
      if (resPin.ok) {
        persistir(null, null);
        setUnlocked(true);
        return;
      }

      setErro('Acesso não encontrado. Crie/ajuste o estoque em /farmacia/estoque.');
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!checked) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div style={S.wrap} className="grad">
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <NuvitaLogo width={120} height={26} />
        </div>
        <div style={S.tag}>Balcão</div>
        <p style={S.lead}>Entre com o código de acesso da farmácia.</p>

        <input
          className="inp"
          style={S.inp}
          placeholder="código de acesso"
          value={codigo}
          onChange={(e) => { setErro(''); setCodigo(e.target.value); }}
          onKeyDown={(e) => e.key === 'Enter' && entrar()}
          autoFocus
        />
        {erro && <div style={S.erro}>{erro}</div>}
        <button onClick={entrar} disabled={loading} style={{ ...S.cta, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        <p style={S.rodape}>É o mesmo código que você criou no estoque.</p>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', background: '#FBFBFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: '#fff', border: '1px solid #ECEDEE', borderRadius: 28, padding: '36px 30px', width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: '0 12px 40px rgba(16,24,40,.08)' },
  tag: { fontSize: 11, color: '#98A2B3', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, marginTop: 8 },
  lead: { fontSize: 13.5, color: '#667085', marginTop: 12, marginBottom: 20 },
  inp: { padding: '14px 16px', fontSize: 16, borderRadius: 12, borderColor: '#E7E7E7', textAlign: 'center' },
  erro: { fontSize: 13, color: '#B91C1C', background: '#FEF2F2', borderRadius: 10, padding: '9px 12px', marginTop: 12 },
  cta: { width: '100%', marginTop: 14, padding: '15px', fontSize: 16, fontWeight: 600, borderRadius: 14, border: 'none', background: '#16A34A', color: '#fff', fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 6px 16px rgba(22,163,74,.22)' },
  rodape: { fontSize: 12, color: '#98A2B3', marginTop: 14 },
};
