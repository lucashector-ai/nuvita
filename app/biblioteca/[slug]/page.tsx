// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import ModalArtigo from '@/components/ui/ModalArtigo';

const NIVEL_COR: any = { iniciante: '#0F6E56', intermediario: '#D97706', avancado: '#DC2626' };
const NIVEL_LABEL: any = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' };

const BADGE_EVIDENCIA: Record<string, { label: string; cor: string; bg: string; desc: string }> = {
  aprovado_fda:     { label: 'Aprovado FDA', cor: '#166534', bg: '#DCFCE7', desc: 'Aprovado pela FDA para uso humano com indicação específica' },
  aprovado_ema:     { label: 'Aprovado EMA', cor: '#1E40AF', bg: '#DBEAFE', desc: 'Aprovado pela Agência Europeia de Medicamentos' },
  fase_3:           { label: 'Fase III', cor: '#0E7490', bg: '#CFFAFE', desc: 'Ensaios clínicos fase III em andamento ou concluídos' },
  fase_2:           { label: 'Fase II', cor: '#6B21A8', bg: '#F3E8FF', desc: 'Ensaios clínicos fase II com dados de eficácia preliminar' },
  clinico_limitado: { label: 'Piloto Clínico', cor: '#B45309', bg: '#FEF3C7', desc: 'Estudos piloto em humanos, evidência limitada' },
  preclinico:       { label: 'Pré-clínico', cor: '#9CA3AF', bg: '#F3F4F6', desc: 'Apenas estudos em animais ou in vitro' },
};

export default function FichaPeptideo() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [artigoAberto, setArtigoAberto] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    supabase.from('peptideos').select('*').eq('slug', slug).maybeSingle().then(({ data }) => {
      setP(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#9CA3AF' }}>
      Carregando...
    </div>
  );

  if (!p) return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#9CA3AF' }}>
      Peptídeo não encontrado.
    </div>
  );

  const estudos = Array.isArray(p.estudos_links) ? p.estudos_links :
    (typeof p.estudos_links === 'string' ? JSON.parse(p.estudos_links || '[]') : []);

  const badgeEv = BADGE_EVIDENCIA[p.nivel_evidencia] || BADGE_EVIDENCIA.preclinico;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
      {artigoAberto && <ModalArtigo artigo={artigoAberto} onClose={() => setArtigoAberto(null)} />}

      {/* Nav */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Biblioteca
        </button>
        <span style={{ color: '#E5E7EB' }}>·</span>
        <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{p.nome}</span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* Header da ficha */}
        <div style={{ background: 'white', borderRadius: 20, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '3rem', lineHeight: 1 }}>{p.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: NIVEL_COR[p.nivel] + '15', color: NIVEL_COR[p.nivel] }}>
                  {NIVEL_LABEL[p.nivel]}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: badgeEv.bg, color: badgeEv.cor }}>
                  {badgeEv.label}
                </span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#F3F4F6', color: '#6B7280' }}>
                  {p.categoria}
                </span>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px', letterSpacing: '-.04em' }}>{p.nome}</h1>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>{badgeEv.desc}</p>
            </div>
          </div>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, margin: 0, borderTop: '1px solid #F3F4F6', paddingTop: '1.25rem' }}>
            {p.resumo}
          </p>
        </div>

        {/* Dados rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1rem' }}>
          {[
            ['💉 Via', p.via || '—'],
            ['💊 Dose', p.dose_min > 0 ? `${p.dose_min}–${p.dose_max} ${p.unidade}` : '—'],
            ['📅 Frequência', p.frequencia || '—'],
            ['⏳ Ciclo', p.ciclo || '—'],
            ['⏱ Meia-vida', p.meia_vida || '—'],
            ['🧊 Armazenamento', p.armazenamento || '—'],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ background: 'white', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{lbl}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Mecanismo detalhado */}
        {(p.mecanismo_detalhado || p.mecanismo) && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', margin: '0 0 1rem' }}>
              🔬 Mecanismo de ação
            </h2>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: 0 }}>
              {p.mecanismo_detalhado || p.mecanismo}
            </p>
          </div>
        )}

        {/* Indicações e contraindicações */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
          {p.indicacoes?.length > 0 && (
            <div style={{ background: '#F0FDF4', borderRadius: 16, padding: '1.25rem' }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#15803D', margin: '0 0 .75rem' }}>✅ Indicações</h2>
              {p.indicacoes.map((ind: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: '#166534' }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>•</span><span>{ind}</span>
                </div>
              ))}
            </div>
          )}
          {p.contraindicacoes?.length > 0 && (
            <div style={{ background: '#FFF5F5', borderRadius: 16, padding: '1.25rem' }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#B91C1C', margin: '0 0 .75rem' }}>⛔ Contraindicações</h2>
              {p.contraindicacoes.map((c: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: '#991B1B' }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>•</span><span>{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sinergias */}
        {p.sinergias?.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', margin: '0 0 .75rem' }}>🔗 Sinergias conhecidas</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {p.sinergias.map((s: string, i: number) => (
                <span key={i} style={{ padding: '5px 12px', borderRadius: 100, background: '#EDE9FE', color: '#6D28D9', fontSize: 12, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Aprovações regulatórias */}
        {p.aprovacoes?.length > 0 && (
          <div style={{ background: '#F0FDF4', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem', border: '1px solid #BBF7D0' }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#15803D', margin: '0 0 .75rem' }}>🏛️ Aprovações regulatórias</h2>
            {p.aprovacoes.map((a: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: '#166534', marginBottom: 4 }}>✓ {a}</div>
            ))}
          </div>
        )}

        {/* Artigos científicos */}
        {estudos.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', margin: '0 0 1rem' }}>
              📚 Artigos científicos ({estudos.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {estudos.map((est: any, i: number) => {
                const badge = {
                  ensaio_clinico_fase3: { label: 'Fase III RCT', cor: '#166534', bg: '#DCFCE7' },
                  ensaio_clinico:       { label: 'Ensaio Clínico', cor: '#1E40AF', bg: '#DBEAFE' },
                  revisao_sistematica:  { label: 'Revisão Sistemática', cor: '#6B21A8', bg: '#F3E8FF' },
                  revisao:              { label: 'Revisão', cor: '#92400E', bg: '#FEF3C7' },
                  pesquisa_original:    { label: 'Pesquisa Original', cor: '#0E7490', bg: '#CFFAFE' },
                  extensao_trial:       { label: 'Extensão de Trial', cor: '#166534', bg: '#DCFCE7' },
                }[est.tipo] || { label: 'Estudo', cor: '#374151', bg: '#F3F4F6' };

                return (
                  <button
                    key={i}
                    onClick={() => setArtigoAberto(est)}
                    style={{ background: '#F9FAFB', borderRadius: 12, padding: '1rem', border: '1px solid #E5E7EB', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  >
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: badge.bg, color: badge.cor, flexShrink: 0 }}>
                        {badge.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{est.journal} · {est.ano}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4, lineHeight: 1.4 }}>{est.titulo}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{est.autores}</div>
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {est.traducao}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: '#0F6E56', fontWeight: 600 }}>
                      Clique para ler o resumo traduzido →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#FEF3C7', borderRadius: 12, fontSize: 12, color: '#92400E', lineHeight: 1.7 }}>
          ⚠️ As informações desta ficha são educativas e não constituem prescrição médica. O uso de peptídeos deve ser supervisionado por um profissional de saúde. Dosagens apresentadas são referências da literatura — não recomendações individuais.
        </div>
      </div>
    </div>
  );
}
