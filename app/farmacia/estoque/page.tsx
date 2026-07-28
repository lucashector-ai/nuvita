// ════════════════════════════════════════════════
//  NUVITA — app/farmacia/estoque/page.tsx
//  PAINEL ADMIN (somente o dono). Entra com a senha de admin,
//  escolhe a farmácia e define quais peptídeos ela tem.
//  A farmácia NÃO edita — só usa a senha numérica no balcão.
// ════════════════════════════════════════════════

'use client';

import { useMemo, useState } from 'react';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import { ALL_PEPTIDES } from '@/lib/recomendarPeptideos';

const CATALOGO = ALL_PEPTIDES.map((p) => ({ n: p.n, m: p.m }));

type Farmacia = { id: string; nome: string; total: number };

export default function AdminEstoquePage() {
  const [fase, setFase] = useState<'login' | 'lista' | 'editar'>('login');
  const [secret, setSecret] = useState('');
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [atual, setAtual] = useState<Farmacia | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState(false);
  // criar nova
  const [novoNome, setNovoNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  const api = async (payload: any) => {
    const res = await fetch('/api/farmacia/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, secret }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  };

  const carregarLista = async () => {
    const { ok, data } = await api({ action: 'list' });
    if (ok) { setFarmacias(data.farmacias || []); setFase('lista'); return true; }
    return false;
  };

  const entrar = async () => {
    setErro('');
    if (!secret.trim()) return setErro('Digite a senha de admin.');
    setLoading(true);
    try {
      const { ok, status } = await api({ action: 'list' });
      if (ok) { await carregarLista(); }
      else if (status === 401) setErro('Senha de admin inválida.');
      else if (status === 503) setErro('Supabase não configurado.');
      else setErro('Não foi possível acessar.');
    } catch { setErro('Erro de conexão.'); } finally { setLoading(false); }
  };

  const abrir = async (f: Farmacia) => {
    setErro(''); setSalvo(false); setLoading(true);
    try {
      const { ok, data } = await api({ action: 'get', id: f.id });
      if (ok) { setAtual(f); setSel(new Set<string>(data.peptideos || [])); setFase('editar'); setBusca(''); }
      else setErro('Não foi possível abrir.');
    } catch { setErro('Erro de conexão.'); } finally { setLoading(false); }
  };

  const salvar = async () => {
    if (!atual) return;
    setErro(''); setSalvo(false); setLoading(true);
    try {
      const { ok } = await api({ action: 'save', id: atual.id, peptideos: Array.from(sel) });
      if (ok) setSalvo(true); else setErro('Não foi possível salvar.');
    } catch { setErro('Erro de conexão.'); } finally { setLoading(false); }
  };

  const criar = async () => {
    setErro('');
    if (!novoNome.trim()) return setErro('Informe um nome.');
    if (novaSenha.replace(/\D/g, '').length < 6) return setErro('A senha precisa ter 6 dígitos.');
    setLoading(true);
    try {
      const { ok, status, data } = await api({ action: 'create', nome: novoNome.trim(), pin: novaSenha });
      if (ok) { setNovoNome(''); setNovaSenha(''); await carregarLista(); }
      else if (status === 409) setErro('Essa senha já está em uso.');
      else setErro(data?.error || 'Não foi possível criar.');
    } catch { setErro('Erro de conexão.'); } finally { setLoading(false); }
  };

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return CATALOGO;
    return CATALOGO.filter((p) => p.n.toLowerCase().includes(q) || p.m.toLowerCase().includes(q));
  }, [busca]);

  const toggle = (n: string) => {
    setSalvo(false);
    setSel((prev) => { const next = new Set(prev); next.has(n) ? next.delete(n) : next.add(n); return next; });
  };

  // ─── Login admin ───
  if (fase === 'login') {
    return (
      <div style={S.wrap} className="grad">
        <div style={S.loginCard}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><NuvitaLogo width={120} height={26} /></div>
          <div style={S.tag}>Admin · Estoque</div>
          <p style={S.loginLead}>Área restrita ao administrador. Digite a senha de admin.</p>
          <input className="inp" style={S.inpBig} type="password" placeholder="senha de admin" value={secret}
            onChange={(e) => setSecret(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && entrar()} autoFocus />
          {erro && <div style={S.erro}>⚠️ {erro}</div>}
          <button onClick={entrar} disabled={loading} style={{ ...S.cta, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Lista de farmácias ───
  if (fase === 'lista') {
    return (
      <div style={{ minHeight: '100vh', background: '#FBFBFA' }} className="grad">
        <header style={S.header}><div style={S.headerIn}><NuvitaLogo width={100} height={22} />
          <button onClick={() => { setFase('login'); setSecret(''); }} style={S.sair}>Sair</button></div></header>
        <main style={S.main}>
          <div style={S.hero}><h1 style={S.h1}>Farmácias</h1><p style={S.lead}>Escolha uma farmácia para definir o estoque dela.</p></div>

          <div style={{ display: 'grid', gap: 10 }}>
            {farmacias.map((f) => (
              <button key={f.id} onClick={() => abrir(f)} style={S.farmaItem}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{f.nome}</div>
                  <div style={{ fontSize: 12.5, color: '#98A2B3' }}>{f.total} produto(s) em estoque</div>
                </div>
                <span style={{ color: '#16A34A', fontWeight: 600 }}>Editar →</span>
              </button>
            ))}
            {farmacias.length === 0 && <div style={S.vazio}>Nenhuma farmácia ainda. Crie a primeira abaixo.</div>}
          </div>

          <div style={{ ...S.card, marginTop: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Criar nova farmácia</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="inp" style={S.inpBig} placeholder="Nome (ex.: USER4)" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
              <input className="inp" style={S.inpBig} inputMode="numeric" placeholder="Senha (6 dígitos)" value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            </div>
            <button onClick={criar} disabled={loading} style={{ ...S.miniCta, marginTop: 12 }}>Criar farmácia</button>
          </div>
          {erro && <div style={S.erro}>⚠️ {erro}</div>}
        </main>
      </div>
    );
  }

  // ─── Editar estoque de uma farmácia ───
  const total = CATALOGO.length;
  return (
    <div style={{ minHeight: '100vh', background: '#FBFBFA' }} className="grad">
      <header style={S.header}><div style={S.headerIn}><NuvitaLogo width={100} height={22} />
        <button onClick={() => { setFase('lista'); setSalvo(false); carregarLista(); }} style={S.sair}>← Farmácias</button></div></header>
      <main style={S.main}>
        <div style={S.hero}>
          <h1 style={S.h1}>Estoque · {atual?.nome}</h1>
          <p style={S.lead}>Marque o que esta farmácia tem. Ela vai indicar <strong>apenas</strong> esses no balcão.</p>
        </div>

        <div style={S.card}>
          <div style={S.toolbar}>
            <input className="inp" style={{ ...S.inpBig, flex: 1, minWidth: 180 }} placeholder="Buscar peptídeo…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <button onClick={() => { setSalvo(false); setSel(new Set(CATALOGO.map((p) => p.n))); }} style={S.miniBtn}>Marcar todos</button>
            <button onClick={() => { setSalvo(false); setSel(new Set()); }} style={S.miniBtn}>Limpar</button>
          </div>
          <div style={S.contador}>{sel.size} de {total} em estoque</div>
          <div style={S.grid}>
            {filtrados.map((p) => {
              const ativo = sel.has(p.n);
              return (
                <button key={p.n} onClick={() => toggle(p.n)} style={{ ...S.item, ...(ativo ? S.itemAtivo : {}) }}>
                  <span style={{ ...S.check, ...(ativo ? S.checkAtivo : {}) }}>{ativo ? '✓' : ''}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, display: 'block' }}>{p.n}</span>
                    <span style={S.itemDesc}>{p.m}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {erro && <div style={S.erro}>⚠️ {erro}</div>}
        <button onClick={salvar} disabled={loading} style={{ ...S.cta, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Salvando…' : salvo ? '✓ Estoque salvo' : 'Salvar estoque'}
        </button>
      </main>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', background: '#FBFBFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loginCard: { background: '#fff', border: '1px solid #ECEDEE', borderRadius: 28, padding: '34px 30px', width: '100%', maxWidth: 380, textAlign: 'center', boxShadow: '0 12px 40px rgba(16,24,40,.08)' },
  tag: { fontSize: 11, color: '#98A2B3', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, marginTop: 6 },
  loginLead: { fontSize: 13.5, color: '#667085', lineHeight: 1.6, margin: '14px 0 18px' },
  header: { background: 'rgba(255,255,255,.82)', backdropFilter: 'saturate(180%) blur(12px)', WebkitBackdropFilter: 'saturate(180%) blur(12px)', borderBottom: '1px solid #EFEFEF', position: 'sticky', top: 0, zIndex: 50 },
  headerIn: { maxWidth: 720, margin: '0 auto', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sair: { background: '#fff', border: '1px solid #E7E7E7', color: '#475467', padding: '7px 14px', borderRadius: 100, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  main: { maxWidth: 720, margin: '0 auto', padding: '28px 20px 90px' },
  hero: { textAlign: 'center', marginBottom: 20 },
  h1: { fontSize: 28, fontWeight: 600, letterSpacing: '-.04em', color: '#0E1113' },
  lead: { fontSize: 15, color: '#667085', marginTop: 8 },
  farmaItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #ECEDEE', borderRadius: 16, padding: '16px 18px', cursor: 'pointer', fontFamily: 'inherit', color: '#0E1113', textAlign: 'left', boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  vazio: { fontSize: 14, color: '#98A2B3', textAlign: 'center', padding: 20 },
  card: { background: '#fff', border: '1px solid #ECEDEE', borderRadius: 20, padding: 20, boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  inpBig: { padding: '13px 15px', fontSize: 15, borderRadius: 12, borderColor: '#E7E7E7' },
  toolbar: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  miniBtn: { background: '#F5F5F5', border: '1px solid #ECEDEE', color: '#475467', padding: '10px 14px', borderRadius: 10, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  miniCta: { background: '#16A34A', border: 'none', color: '#fff', padding: '11px 18px', borderRadius: 12, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  contador: { fontSize: 12.5, color: '#16A34A', fontWeight: 600, margin: '12px 2px 10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 },
  item: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px', borderRadius: 12, border: '1.5px solid #ECEDEE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#0E1113', textAlign: 'left' },
  itemAtivo: { border: '1.5px solid #16A34A', background: '#F0FDF4' },
  check: { width: 20, height: 20, borderRadius: 6, border: '1.5px solid #D5D5D5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', flexShrink: 0, marginTop: 1 },
  checkAtivo: { background: '#16A34A', border: '1.5px solid #16A34A' },
  itemDesc: { display: 'block', fontSize: 11.5, color: '#98A2B3', lineHeight: 1.35, marginTop: 2 },
  cta: { width: '100%', marginTop: 20, padding: '16px', fontSize: 16, fontWeight: 600, borderRadius: 14, border: 'none', background: '#16A34A', color: '#fff', fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 6px 16px rgba(22,163,74,.22)' },
  erro: { marginTop: 16, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, color: '#B91C1C', fontSize: 14 },
};
