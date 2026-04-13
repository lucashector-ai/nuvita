// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CATEGORIAS = ['Todos','Emagrecimento','GH/Composição','Recuperação','Anti-aging','Gut/Inflamação','Longevidade','Sexual','Experimental'];
const NIVEL_COR: any = { iniciante:'#0F6E56', intermediario:'#EF9F27', avancado:'#D85A30' };
const NIVEL_LABEL: any = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado' };

// Gradientes únicos por categoria — estilo Netflix
const CAT_GRADIENT: any = {
  'Emagrecimento':   'linear-gradient(135deg, #1a0a2e, #3d0d6b, #6b21a8)',
  'GH/Composição':   'linear-gradient(135deg, #0a1a2e, #0d3d6b, #1d6fb0)',
  'Recuperação':     'linear-gradient(135deg, #0a2010, #0d6b2d, #16a34a)',
  'Anti-aging':      'linear-gradient(135deg, #2e1a0a, #6b3d0d, #b08d1d)',
  'Gut/Inflamação':  'linear-gradient(135deg, #0a2e1a, #0d6b5a, #1db08d)',
  'Longevidade':     'linear-gradient(135deg, #1a0a2e, #4a0d6b, #8b5cf6)',
  'Sexual':          'linear-gradient(135deg, #2e0a1a, #6b0d3d, #b01d6b)',
  'Experimental':    'linear-gradient(135deg, #1a1a0a, #3d3d0d, #6b6b1d)',
};

// Emojis grandes como "poster" visual
const CAT_PATTERN: any = {
  'Emagrecimento':  '🔥💊⚡',
  'GH/Composição':  '💪🌙🎯',
  'Recuperação':    '🩹🔄💨',
  'Anti-aging':     '✨👑🌟',
  'Gut/Inflamação': '🌿🧬💊',
  'Longevidade':    '⚡🔋💡',
  'Sexual':         '❤️',
  'Experimental':   '🧬🔬',
};

function PeptideoCard({ p, onClick }: any) {
  const [hovered, setHovered] = useState(false);
  const grad = CAT_GRADIENT[p.categoria] || 'linear-gradient(135deg, #1a1a1a, #333)';

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '2/3',
        background: grad,
        transition: 'transform .2s ease, box-shadow .2s ease',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,.4)' : '0 4px 12px rgba(0,0,0,.2)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Fundo decorativo com emojis */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '5rem', opacity: hovered ? 0.25 : 0.15,
        transition: 'opacity .2s', userSelect: 'none',
        filter: 'blur(2px)',
      }}>
        {p.emoji}
      </div>

      {/* Gradiente overlay no rodapé */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '70%',
        background: 'linear-gradient(to top, rgba(0,0,0,.95) 30%, transparent)',
      }}/>

      {/* Badge de nível no topo */}
      {p.nivel && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 9, fontWeight: 700, padding: '3px 8px',
          borderRadius: 100, background: NIVEL_COR[p.nivel] + '30',
          color: NIVEL_COR[p.nivel], border: `1px solid ${NIVEL_COR[p.nivel]}40`,
          backdropFilter: 'blur(4px)',
        }}>
          {NIVEL_LABEL[p.nivel]}
        </div>
      )}

      {/* Emoji principal centralizado */}
      <div style={{
        position: 'absolute', top: '30%', left: 0, right: 0,
        textAlign: 'center', fontSize: '2.5rem',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'transform .2s',
      }}>
        {p.emoji}
      </div>

      {/* Conteúdo inferior */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>
          {p.subcategoria || p.categoria}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 4 }}>
          {p.nome}
        </div>
        {p.dose_max > 0 && (
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>
            {p.dose_min}–{p.dose_max} {p.unidade} · {p.via}
          </div>
        )}
        {/* Botão hover */}
        <div style={{
          marginTop: 8, overflow: 'hidden', maxHeight: hovered ? 28 : 0,
          transition: 'max-height .2s ease',
        }}>
          <div style={{
            background: 'white', color: '#111', fontSize: 11, fontWeight: 600,
            padding: '5px 0', borderRadius: 6, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', textAlign: 'center',
          }}>
            Ver ficha completa →
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SectionLib() {
  const router = useRouter();
  const [peptideos, setPeptideos] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [busca,     setBusca]     = useState('');
  const [catFiltro, setCatFiltro] = useState('Todos');

  useEffect(() => {
    supabase.from('peptideos').select('*').order('categoria').then(({ data }) => {
      setPeptideos(data || []);
      setLoading(false);
    });
  }, []);

  const filtrados = peptideos.filter(p => {
    const matchBusca = !busca ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.resumo?.toLowerCase().includes(busca.toLowerCase()) ||
      p.tags?.some((t: string) => t.includes(busca.toLowerCase()));
    const matchCat = catFiltro === 'Todos' || p.categoria === catFiltro;
    return matchBusca && matchCat;
  });

  // Agrupa por categoria
  const categorias = catFiltro === 'Todos'
    ? CATEGORIAS.filter(c => c !== 'Todos' && filtrados.some(p => p.categoria === c))
    : [catFiltro];

  return (
    <div>
      {typeof window !== 'undefined' && (localStorage.getItem('nv_plano') || 'free') !== 'pro' && (
        <div style={{
          background: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
          color: '#fff',
          padding: '18px 24px',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 4 }}>
              Desbloqueie a biblioteca completa
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, opacity: 0.95 }}>
              Plano gratuito mostra 2 peptídeos. Pro tem acesso a todos os 20+ com pesquisas, combinações e simulador de ciclos.
            </div>
          </div>
          <a href="/planos" style={{
            background: '#fff',
            color: '#15803D',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            Fazer upgrade
          </a>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, letterSpacing: '-.04em', marginBottom: '.25rem' }}>
          Biblioteca de peptídeos
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ts)' }}>
          {peptideos.length} peptídeos · Clique para ver ficha completa com pesquisas e protocolo
        </p>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--ts)', pointerEvents: 'none' }}>🔍</span>
        <input
          className="inp"
          placeholder="Buscar por nome, categoria ou efeito..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ paddingLeft: 36, marginBottom: 0, fontSize: 13 }}
        />
      </div>

      {/* Filtros de categoria */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => setCatFiltro(c)}
            style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border:'none',
              background: catFiltro === c ? 'var(--dark)' : 'var(--bg2)',
              color: catFiltro === c ? 'white' : 'var(--tm)',
              transition: 'all .13s',
            }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ts)', fontSize: 13 }}>
          Carregando biblioteca...
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ts)', fontSize: 13 }}>
          Nenhum resultado para "{busca}"
        </div>
      ) : (
        <div>
          {categorias.map(cat => {
            const items = filtrados.filter(p => p.categoria === cat);
            if (!items.length) return null;
            return (
              <div key={cat} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', letterSpacing: '-.02em' }}>{cat}</h3>
                  <span style={{ fontSize: 11, color: 'var(--ts)', background:'#FFFFFF', padding: '2px 8px', borderRadius: 100 , boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)'}}>
                    {items.length} peptídeos
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 12,
                }}>
                  {items.map(p => (
                    <PeptideoCard
                      key={p.slug}
                      p={p}
                      onClick={() => router.push(`/biblioteca/${p.slug}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
