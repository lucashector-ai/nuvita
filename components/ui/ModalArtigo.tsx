// @ts-nocheck
'use client';
import React from 'react';

const BADGE_TIPO: Record<string, { label: string; cor: string; bg: string }> = {
  ensaio_clinico_fase3: { label: 'Fase III RCT', cor: '#166534', bg: '#DCFCE7' },
  ensaio_clinico:       { label: 'Ensaio Clínico', cor: '#1E40AF', bg: '#DBEAFE' },
  revisao_sistematica:  { label: 'Revisão Sistemática', cor: '#6B21A8', bg: '#F3E8FF' },
  revisao:              { label: 'Revisão', cor: '#92400E', bg: '#FEF3C7' },
  pesquisa_original:    { label: 'Pesquisa Original', cor: '#0E7490', bg: '#CFFAFE' },
  extensao_trial:       { label: 'Extensão de Trial', cor: '#166534', bg: '#DCFCE7' },
  clinico_limitado:     { label: 'Piloto Clínico', cor: '#B45309', bg: '#FEF3C7' },
  meta_analise:         { label: 'Meta-análise', cor: '#7C3AED', bg: '#EDE9FE' },
};

interface Artigo {
  titulo: string;
  autores: string;
  journal: string;
  ano: number;
  pmid?: string;
  url: string;
  tipo: string;
  traducao: string;
}

interface Props {
  artigo: Artigo;
  onClose: () => void;
}

export default function ModalArtigo({ artigo, onClose }: Props) {
  const badge = BADGE_TIPO[artigo.tipo] || { label: 'Estudo', cor: '#374151', bg: '#F3F4F6' };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 20, maxWidth: 620, width: '100%',
          maxHeight: '85vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.3)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 0', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: badge.bg, color: badge.cor }}>
                {badge.label}
              </span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#F3F4F6', color: '#6B7280' }}>
                {artigo.journal} · {artigo.ano}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#6B7280', flexShrink: 0 }}
            >
              ×
            </button>
          </div>
          <div style={{ height: 1, background: '#F3F4F6' }} />
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          {/* Título original */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', lineHeight: 1.5, marginBottom: 6, letterSpacing: '-.02em' }}>
            {artigo.titulo}
          </h3>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: '1.25rem' }}>
            {artigo.autores}
          </p>

          {/* Separador */}
          <div style={{ borderRadius: 10, background: '#F9FAFB', border: '1px solid #F3F4F6', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: 8 }}>
              🇧🇷 Resumo traduzido
            </div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, margin: 0 }}>
              {artigo.traducao}
            </p>
          </div>

          {/* Aviso de nível de evidência */}
          <div style={{ background: '#FEF3C7', borderRadius: 8, padding: '10px 12px', marginBottom: '1.25rem', fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
            ⚠️ <strong>Importante:</strong> Resumos traduzidos são informativos. Para decisões clínicas, consulte o artigo original completo e um profissional de saúde.
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            
              href={artigo.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 10,
                background: '#111827', color: 'white',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              📄 Ver artigo original
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
            {artigo.pmid && (
              
                href={`https://pubmed.ncbi.nlm.nih.gov/${artigo.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: 10,
                  border: '1.5px solid #E5E7EB', background: 'white', color: '#374151',
                  fontSize: 13, fontWeight: 500, textDecoration: 'none',
                }}
              >
                🔬 PubMed
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
