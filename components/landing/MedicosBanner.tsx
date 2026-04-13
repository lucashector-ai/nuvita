'use client';

import React from 'react';

const C = {
  ink: '#0F1115',
  inkSoft: '#1A1D23',
  green: '#22C55E',
};

const wrap: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 24px',
};

export default function MedicosBanner() {
  return React.createElement(
    'section',
    { style: { padding: '0 0 120px' } },
    React.createElement(
      'div',
      { style: wrap },
      React.createElement(
        'div',
        {
          className: 'medicos-banner',
          style: {
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0F1115 0%, #1A1D23 100%)',
            borderRadius: 24,
            padding: 'clamp(40px, 6vw, 72px)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: 48,
            alignItems: 'center',
          },
        },
        React.createElement(BannerText),
        React.createElement(BannerIllustration)
      )
    )
  );
}

function BannerText() {
  return React.createElement(
    'div',
    { style: { position: 'relative', zIndex: 1 } },
    React.createElement(
      'div',
      {
        style: {
          display: 'inline-block',
          padding: '5px 12px',
          borderRadius: 999,
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: C.green,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: 24,
        },
      },
      '⭐ Plano Pro'
    ),
    React.createElement(
      'h2',
      {
        style: {
          fontSize: 'clamp(28px, 3.8vw, 44px)',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          margin: 0,
        },
      },
      'Além da IA, ',
      React.createElement('span', { style: { color: C.green } }, 'médicos parceiros'),
      ' no seu ciclo.'
    ),
    React.createElement(
      'p',
      {
        style: {
          fontSize: 17,
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.72)',
          margin: '20px 0 32px',
          maxWidth: 520,
        },
      },
      'Protocolos de peptídeo exigem acompanhamento humano. No plano Pro, você tem acesso a médicos parceiros especializados para revisar seu plano, ajustar doses e tirar dúvidas clínicas — em consultas remotas, quando precisar.'
    ),
    React.createElement(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32,
        },
      },
      React.createElement(Benefit, { text: 'Revisão do protocolo pela IA + médico' }),
      React.createElement(Benefit, { text: 'Ajuste de dose com base em exames' }),
      React.createElement(Benefit, { text: 'Consulta remota quando precisar' }),
      React.createElement(Benefit, { text: 'Acompanhamento durante o ciclo' })
    ),
    React.createElement(
      'a',
      {
        href: '#pricing',
        style: {
          display: 'inline-block',
          padding: '12px 22px',
          borderRadius: 10,
          background: '#fff',
          color: C.ink,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
        },
      },
      'Ver o plano Pro →'
    )
  );
}

function Benefit({ text }: { text: string }) {
  return React.createElement(
    'div',
    { style: { display: 'flex', alignItems: 'flex-start', gap: 10 } },
    React.createElement(
      'div',
      {
        style: {
          flexShrink: 0,
          marginTop: 2,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: 'rgba(34, 197, 94, 0.2)',
          color: C.green,
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      '✓'
    ),
    React.createElement(
      'span',
      { style: { fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 } },
      text
    )
  );
}

function BannerIllustration() {
  return React.createElement(
    'div',
    {
      style: {
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 140,
      },
    },
    '🩺'
  );
}
