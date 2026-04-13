// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CATEGORIAS = ['Todos','Emagrecimento','GH/Composição','Recuperação','Anti-aging','Gut/Inflamação','Longevidade','Sexual','Experimental'];
const NIVEL_COR: any = { iniciante:'#0F6E56', intermediario:'#EF9F27', avancado:'#D85A30' };
const NIVEL_LABEL: any = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado' };

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

const FREE_LIMIT = 2;

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
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '5rem', opacity: hovered ? 0.25 : 0.15,
        transition: 'opacity .2s', userSelect: 'none',
        filter: 'blur(2px)',
      }}>
        {p.emoji}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '70%',
        background: 'linear-gradient(to top, rgba(0,0,0,.95) 30%, transparent)',
      }}/>

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

      <div style={{
        position: 'absolute', top: '30%', left: 0, right: 0,
        textAlign: 'center', fontSize: '2.5rem',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'transform .2s',
      }}>
        {p.emoji}
      </div>

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

// Card bloqueado — mostra preview borrado com cadeado + CTA pra upgrade
function LockedCard({ p, onUpgrade }: any) {
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
        boxShadow: '0 4px 12px rgba(0,0,0,.15)',
        filter: 'saturate(0.5)',
      }}
      onClick={onUpgrade}
    >
      {/* Overlay escuro que borra tudo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 14,
        textAlign: 'center',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'rgba(34, 197, 94, 0.18)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="4" y="10" width="14" height="9" rx="2" stroke="#22C55E" strokeWidth="1.7"/>
            <path d="M7 10V7a4 4 0 018 0v3" stroke="#22C55E" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: '#22C55E',
          textTransform: 'uppercase', letterSpacing: '.08em',
        }}>Plano Pro</div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.3,
        }}>
          {p.nome}
        </div>
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4,
          marginTop: 4,
        }}>
          Faça upgrade para desbloquear
        </div>
      </div>
    </div>
  );
}

export default function SectionLib({ plano = 'free' }: { plano?: string } = {}) {
  const router = useRouter();
  const [peptideos, setPeptideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [catFiltro, setCatFiltro] = useState('Todos');

  useEffect(() => {
    supabase.from('peptideos').select('*').order('categoria').then(({ data }) => {
      setPeptideos(data || []);
      setLoading(false);
    });
  }, []);

  const isPro = plano === 'pro';

  // Filtro por busca/categoria
  const filtrados = peptideos.filter(p => {
    const matchBusca = !busca ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.resumo?.toLowerCase().includes(busca.toLowerCase()) ||
      p.tags?.some((t: string) => t.includes(busca.toLowerCase()));
    const matchCat = catFiltro === 'Todos' || p.categoria === catFiltro;
    return matchBusca && matchCat;
  });

  // Separa em liberados (2 primeiros para free) e bloqueados (restante)
  const liberados = isPro ? filtrados : filtrados.slice(0, FREE_LIMIT);
  const bloqueados = isPro ? [] : filtrados.slice(FREE_LIMIT);

  // Agrupa por categoria — usando TODOS os visíveis (liberados + bloqueados)
  const todosVisiveis = [...liberados, ...bloqueados];
  const categorias = catFiltro === 'Todos'
    ? CATEGORIAS.filter(c => c !== 'Todos' && todosVisiveis.some(p => p.categoria === c))
    : [catFiltro];

  const irParaPlanos = () => router.push('/planos');

  return (
    <div>
      {/* Banner upgrade - só para free */}
      {!isPro && (
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
              Plano gratuito mostra {FREE_LIMIT} peptídeos. Pro libera todos os {peptideos.length || '20+'} com pesquisas, combinações e simulador de ciclos.
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
          {isPro
            ? `${peptideos.length} peptídeos · Clique para ver ficha completa com pesquisas e protocolo`
            : `Mostrando ${liberados.length} de ${peptideos.length} peptídeos · Upgrade pra Pro para ver todos`
          }
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
      ) : todosVisiveis.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ts)', fontSize: 13 }}>
          Nenhum resultado para "{busca}"
        </div>
      ) : (
        <div>
          {categorias.map(cat => {
            const liberadosCat = liberados.filter(p => p.categoria === cat);
            const bloqueadosCat = bloqueados.filter(p => p.categoria === cat);
            const totalCat = liberadosCat.length + bloqueadosCat.length;
            if (!totalCat) return null;
            return (
              <div key={cat} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', letterSpacing: '-.02em' }}>{cat}</h3>
                  <span style={{ fontSize: 11, color: 'var(--ts)', background:'#FFFFFF', padding: '2px 8px', borderRadius: 100, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)' }}>
                    {totalCat} peptídeos
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 12,
                }}>
                  {liberadosCat.map(p => (
                    <PeptideoCard
                      key={p.slug}
                      p={p}
                      onClick={() => router.push(`/biblioteca/${p.slug}`)}
                    />
                  ))}
                  {bloqueadosCat.map(p => (
                    <LockedCard
                      key={p.slug}
                      p={p}
                      onUpgrade={irParaPlanos}
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
