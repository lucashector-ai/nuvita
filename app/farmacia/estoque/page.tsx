// ════════════════════════════════════════════════
//  NUVITA — app/farmacia/estoque/page.tsx
//  A farmácia entra com um código (a senha) e escolhe
//  quais peptídeos tem em estoque. O balcão passa a
//  recomendar apenas o que a farmácia tem.
// ════════════════════════════════════════════════

'use client';

import { useMemo, useState } from 'react';
import NuvitaLogo from '@/components/ui/NuvitaLogo';
import { ALL_PEPTIDES } from '@/lib/recomendarPeptideos';

const CATALOGO = ALL_PEPTIDES.map((p) => ({ n: p.n, m: p.m }));

export default function EstoquePage() {
  const [fase, setFase] = useState<'acesso' | 'editar'>('acesso');
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState(false);
  const [novo, setNovo] = useState(false);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return CATALOGO;
    return CATALOGO.filter((p) => p.n.toLowerCase().includes(q) || p.m.toLowerCase().includes(q));
  }, [busca]);

  const acessar = async () => {
    setErro('');
    if (codigo.trim().length < 6) return setErro('O acesso precisa ter ao menos 6 caracteres.');
    setLoading(true);
    try {
      const res = await fetch('/api/farmacia/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', codigo: codigo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data?.error || 'Não foi possível acessar.');
      } else if (data.found) {
        setNome(data.nome || '');
        setSel(new Set<string>(data.peptideos || []));
        setNovo(false);
        setFase('editar');
      } else {
        // Acesso novo → começa com tudo marcado (a farmácia refina depois).
        setSel(new Set<string>(CATALOGO.map((p) => p.n)));
        setNovo(true);
        setFase('editar');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const salvar = async () => {
    setErro('');
    setSalvo(false);
    setLoading(true);
    try {
      const res = await fetch('/api/farmacia/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', codigo: codigo.trim(), nome: nome.trim() || undefined, peptideos: Array.from(sel) }),
      });
      const data = await res.json();
      if (!res.ok) setErro(data?.error || 'Não foi possível salvar.');
      else { setSalvo(true); setNovo(false); }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (n: string) => {
    setSalvo(false);
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  };

  const marcarTodos = () => { setSalvo(false); setSel(new Set(CATALOGO.map((p) => p.n))); };
  const limpar = () => { setSalvo(false); setSel(new Set()); };

  // ─── Tela de acesso ───
  if (fase === 'acesso') {
    return (
      <div style={S.wrap} className="grad">
        <div style={S.acessoCard}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <NuvitaLogo width={120} height={26} />
          </div>
          <div style={S.tag}>Estoque da farmácia</div>
          <p style={S.acessoLead}>
            Entre com o seu <strong>código de acesso</strong>. É ele que identifica a sua farmácia —
            guarde bem, pois funciona como senha.
          </p>
          <label style={S.label}>Código de acesso</label>
          <input
            className="inp"
            style={S.inpBig}
            placeholder="ex.: farmaciacentral2024"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && acessar()}
            autoFocus
          />
          <div style={S.hint}>Se ainda não tem, digite um código novo — criamos o acesso na hora.</div>
          {erro && <div style={S.erro}>⚠️ {erro}</div>}
          <button onClick={acessar} disabled={loading} style={{ ...S.cta, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Acessando…' : 'Acessar estoque'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Tela de edição ───
  const total = CATALOGO.length;
  return (
    <div style={{ minHeight: '100vh', background: '#FBFBFA' }} className="grad">
      <header style={S.header}>
        <div style={S.headerIn}>
          <NuvitaLogo width={100} height={22} />
          <button onClick={() => { setFase('acesso'); setSalvo(false); }} style={S.sair}>Trocar acesso</button>
        </div>
      </header>

      <main style={S.main}>
        <div style={S.hero}>
          <h1 style={S.h1}>Seu estoque de peptídeos</h1>
          <p style={S.lead}>
            Marque o que a farmácia tem. O balcão vai indicar <strong>apenas</strong> esses produtos.
          </p>
        </div>

        {novo && (
          <div style={S.aviso}>
            ✨ Acesso novo criado. Já deixamos tudo marcado — desmarque o que você não tem e salve.
          </div>
        )}

        <div style={S.card}>
          <label style={S.label}>Nome da farmácia <span style={{ color: '#98A2B3', fontWeight: 400 }}>(opcional)</span></label>
          <input className="inp" style={S.inpBig} placeholder="Farmácia Central" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div style={{ ...S.card, marginTop: 14 }}>
          <div style={S.toolbar}>
            <input className="inp" style={{ ...S.inpBig, flex: 1, minWidth: 180 }} placeholder="Buscar peptídeo…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <button onClick={marcarTodos} style={S.miniBtn}>Marcar todos</button>
            <button onClick={limpar} style={S.miniBtn}>Limpar</button>
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
        {salvo && (
          <p style={S.salvoNota}>
            Pronto! No tablet do balcão, entre com este mesmo código <strong>({codigo.trim()})</strong> para usar este estoque.
          </p>
        )}
      </main>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', background: '#FBFBFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  acessoCard: { background: '#fff', border: '1px solid #ECEDEE', borderRadius: 28, padding: '34px 30px', width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 12px 40px rgba(16,24,40,.08)' },
  tag: { fontSize: 11, color: '#98A2B3', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, marginTop: 6 },
  acessoLead: { fontSize: 13.5, color: '#667085', lineHeight: 1.6, margin: '14px 0 20px' },
  header: { background: 'rgba(255,255,255,.82)', backdropFilter: 'saturate(180%) blur(12px)', WebkitBackdropFilter: 'saturate(180%) blur(12px)', borderBottom: '1px solid #EFEFEF', position: 'sticky', top: 0, zIndex: 50 },
  headerIn: { maxWidth: 720, margin: '0 auto', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sair: { background: '#fff', border: '1px solid #E7E7E7', color: '#475467', padding: '7px 14px', borderRadius: 100, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  main: { maxWidth: 720, margin: '0 auto', padding: '28px 20px 90px' },
  hero: { textAlign: 'center', marginBottom: 20 },
  h1: { fontSize: 28, fontWeight: 600, letterSpacing: '-.04em', color: '#0E1113' },
  lead: { fontSize: 15, color: '#667085', marginTop: 8 },
  aviso: { background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: 14, padding: '12px 16px', fontSize: 13.5, color: '#15803D', marginBottom: 14 },
  card: { background: '#fff', border: '1px solid #ECEDEE', borderRadius: 20, padding: 20, boxShadow: '0 1px 2px rgba(16,24,40,.03)' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#475467', marginBottom: 7 },
  inpBig: { padding: '13px 15px', fontSize: 15, borderRadius: 12, borderColor: '#E7E7E7' },
  hint: { fontSize: 12, color: '#98A2B3', marginTop: 8 },
  toolbar: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  miniBtn: { background: '#F5F5F5', border: '1px solid #ECEDEE', color: '#475467', padding: '10px 14px', borderRadius: 10, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  contador: { fontSize: 12.5, color: '#16A34A', fontWeight: 600, margin: '12px 2px 10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 },
  item: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px', borderRadius: 12, border: '1.5px solid #ECEDEE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#0E1113', textAlign: 'left' },
  itemAtivo: { border: '1.5px solid #16A34A', background: '#F0FDF4' },
  check: { width: 20, height: 20, borderRadius: 6, border: '1.5px solid #D5D5D5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', flexShrink: 0, marginTop: 1 },
  checkAtivo: { background: '#16A34A', border: '1.5px solid #16A34A' },
  itemDesc: { display: 'block', fontSize: 11.5, color: '#98A2B3', lineHeight: 1.35, marginTop: 2 },
  cta: { width: '100%', marginTop: 20, padding: '16px', fontSize: 16, fontWeight: 600, borderRadius: 14, border: 'none', background: '#16A34A', color: '#fff', fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 6px 16px rgba(22,163,74,.22)' },
  salvoNota: { fontSize: 13, color: '#15803D', textAlign: 'center', marginTop: 12, lineHeight: 1.6 },
  erro: { marginTop: 16, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, color: '#B91C1C', fontSize: 14 },
};
