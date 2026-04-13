// @ts-nocheck
'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

const PLANOS = [
  {
    id: 'free',
    nome: 'Free',
    cor: '#6B7280',
    destaque: false,
    desc: 'Para começar sua jornada',
    precoMensal: 0,
    precoAnual: 0,
    features: [
      '✓ Diagnóstico por IA',
      '✓ Protocolo personalizado',
      '✓ Biblioteca de peptídeos',
      '✓ Calendário básico',
      '✗ Coach IA',
      '✗ Ajuste automático',
      '✗ Detector de sintomas',
      '✗ Exportar PDF',
    ],
  },
  {
    id: 'essencial',
    nome: 'Essencial',
    cor: '#0F6E56',
    destaque: true,
    desc: 'O mais popular — tudo que você precisa',
    precoMensal: 4700,       // R$ 47,00 em centavos
    precoAnual: 45120,       // R$ 451,20 em centavos (R$ 37,60/mês × 12)
    features: [
      '✓ Tudo do Free',
      '✓ Coach IA (perguntas ilimitadas)',
      '✓ Ajuste automático do protocolo',
      '✓ Detector de sintomas',
      '✓ Exportar PDF para médico',
      '✓ Consistência e análises',
      '✓ Rotina personalizada',
      '✗ Médico parceiro',
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    cor: '#7C3AED',
    destaque: false,
    desc: 'Para quem leva a sério',
    precoMensal: 9700,       // R$ 97,00 em centavos
    precoAnual: 93120,       // R$ 931,20 em centavos (R$ 77,60/mês × 12)
    features: [
      '✓ Tudo do Essencial',
      '✓ Conexão com médico parceiro',
      '✓ Relatórios avançados',
      '✓ Simulador de ciclos',
      '✓ Mapa de aplicação',
      '✓ Suporte prioritário',
      '✓ Acesso antecipado a novidades',
      '✓ Desconto em peptídeos parceiros',
    ],
  },
];

function formatBRL(centavos: number) {
  return 'R$ ' + (centavos / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function SectionPlanos({ planoAtual, userId, onPlanChange, onNavigate }: any) {
  const [anual, setAnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const assinar = async (plano: typeof PLANOS[0]) => {
    if (!userId || planoAtual === plano.id) return;
    if (plano.id === 'free') { if (onPlanChange) onPlanChange('free'); return; }

    setLoading(plano.id);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil } = await supabase.from('usuarios').select('diagnostico').eq('id', userId).single();

      const res = await apiFetch('/api/pagamento', {
        method: 'POST',
        body: JSON.stringify({
          plano: plano.id,
          anual,
        }),
      });
      const data = await res.json();
      if (data.url) {
        // Salva flag para retornar ao dashboard após pagamento (não para revisão)
        sessionStorage.setItem('nv_retorno_pos_plano', 'dashboard');
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar pagamento: ' + (data.error || 'tente novamente'));
      }
    } catch (e) {
      alert('Erro ao iniciar pagamento.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-.04em', marginBottom: '.5rem' }}>
          Escolha seu plano
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ts)', marginBottom: '1.25rem' }}>
          Assinatura recorrente · Cancele quando quiser · 7 dias de garantia
        </p>

        {/* Toggle mensal/anual */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FFFFFF', borderRadius: 100, boxShadow: '0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding: '4px 16px 4px 16px' }}>
          <span style={{ fontSize: 13, color: anual ? 'var(--ts)' : 'var(--tx)', fontWeight: anual ? 400 : 600 }}>Mensal</span>
          <div
            onClick={() => setAnual(!anual)}
            style={{ width: 40, height: 22, borderRadius: 100, background: anual ? '#111827' : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background .2s', margin: '0 4px' }}
          >
            <div style={{ position: 'absolute', top: 3, left: anual ? 'calc(100% - 19px)' : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
          </div>
          <span style={{ fontSize: 13, color: anual ? 'var(--tx)' : 'var(--ts)', fontWeight: anual ? 600 : 400 }}>
            Anual <span style={{ color: '#0F6E56', fontWeight: 700 }}>-20%</span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {PLANOS.map(p => {
          const atual = planoAtual === p.id;
          const isFree = p.id === 'free';
          const precoMes = anual && !isFree ? Math.round(p.precoAnual / 12) : p.precoMensal;
          const totalAnual = p.precoAnual;
          const isLoading = loading === p.id;

          return (
            <div
              key={p.id}
              style={{
                borderRadius: 16,
                padding: '1.5rem',
                background: p.destaque ? '#111827' : 'var(--bg)',
                border: atual ? `2px solid ${p.cor}` : p.destaque ? 'none' : '1px solid var(--border)',
                position: 'relative',
                transition: 'transform .15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
            >
              {p.destaque && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#0F6E56', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                  MAIS POPULAR
                </div>
              )}
              {atual && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: p.cor, color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>
                  ATUAL
                </div>
              )}

              {/* Nome */}
              <div style={{ fontSize: 12, fontWeight: 600, color: p.destaque ? 'rgba(255,255,255,.6)' : 'var(--ts)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {p.nome}
              </div>

              {/* Preço */}
              {isFree ? (
                <div style={{ fontSize: 28, fontWeight: 800, color: p.destaque ? 'white' : 'var(--tx)', marginBottom: 4 }}>Grátis</div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 2 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: p.destaque ? 'white' : 'var(--tx)' }}>
                      {formatBRL(precoMes)}
                    </span>
                    <span style={{ fontSize: 12, color: p.destaque ? 'rgba(255,255,255,.5)' : 'var(--ts)' }}>/mês</span>
                  </div>
                  {anual && (
                    <div style={{ fontSize: 11, color: p.destaque ? 'rgba(255,255,255,.45)' : 'var(--ts)', marginBottom: 4 }}>
                      {formatBRL(totalAnual)} cobrado uma vez por ano
                    </div>
                  )}
                  {!anual && (
                    <div style={{ fontSize: 11, color: p.destaque ? 'rgba(255,255,255,.45)' : 'var(--ts)', marginBottom: 4 }}>
                      Assinatura mensal recorrente
                    </div>
                  )}
                </>
              )}

              {/* Desc */}
              <div style={{ fontSize: 12, color: p.destaque ? 'rgba(255,255,255,.55)' : 'var(--ts)', marginBottom: '1.25rem' }}>
                {p.desc}
              </div>

              {/* Botão */}
              <button
                disabled={isLoading || (atual && !isFree)}
                onClick={() => { if (isFree && atual && onNavigate) { onNavigate('inicio'); return; } assinar(p); }}
                style={{
                  width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                  background: (isFree && atual) ? 'var(--green)' : p.destaque ? 'white' : p.id === 'free' ? '#F3F4F6' : p.cor,
                  color: (isFree && atual) ? 'white' : p.destaque ? '#111827' : p.id === 'free' ? '#374151' : 'white',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', opacity: 1,
                  transition: 'opacity .15s',
                }}
              >
                {isLoading ? 'Aguarde...' : (isFree && atual) ? 'Continuar na plataforma →' : atual ? 'Plano atual' : isFree ? 'Usar grátis' : anual ? 'Assinar anual' : 'Assinar mensal'}
              </button>

              {/* Features */}
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.features.map((f: string) => (
                  <div key={f} style={{ fontSize: 12, color: p.destaque ? (f.startsWith('✓') ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.3)') : (f.startsWith('✓') ? 'var(--tx)' : 'var(--ts)') }}>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: 12, color: 'var(--ts)' }}>
        Todos os planos incluem 7 dias de garantia · Cancele quando quiser · Sem taxa de cancelamento
      </div>
    </div>
  );
}
