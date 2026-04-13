// ════════════════════════════════════════════════
//  NUVITA — MedicosBanner
//  Banner dark destacando médicos parceiros (Plano Pro)
// ════════════════════════════════════════════════

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
  return (
    <section style={{ padding: '0 0 120px' }}>
      <div style={wrap}>
        <div
          className="medicos-banner"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${C.ink} 0%, ${C.inkSoft} 100%)`,
            borderRadius: 24,
            padding: 'clamp(40px, 6vw, 72px)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: 48,
            alignItems: 'center',
          }}
        >
          {/* Glow verde decorativo */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -200,
              right: -100,
              width: 500,
              height: 500,
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.18) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          {/* Texto */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px 5px 6px',
                borderRadius: 999,
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: C.green,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 24,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M7 1L8.5 4.5L12.5 5L9.5 8L10.5 12L7 10L3.5 12L4.5 8L1.5 5L5.5 4.5L7 1Z"
                  fill={C.green}
                />
              </svg>
              Plano Pro
            </div>

            <h2
              style={{
                fontSize: 'clamp(28px, 3.8vw, 44px)',
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Além da IA,
              <br />
              <span style={{ color: C.green }}>médicos parceiros</span> no seu ciclo.
            </h2>

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.72)',
                margin: '20px 0 0',
                maxWidth: 520,
                letterSpacing: '-0.005em',
              }}
            >
              Protocolos de peptídeo exigem acompanhamento humano. No plano Pro,
              você tem acesso a médicos parceiros especializados para revisar
              seu plano, ajustar doses e tirar dúvidas clínicas — em consultas
              remotas, quando precisar.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                marginTop: 32,
              }}
            >
              <BenefitItem text="Revisão do protocolo pela IA + médico" />
              <BenefitItem text="Ajuste de dose com base em exames" />
              <BenefitItem text="Consulta remota quando precisar" />
              <BenefitItem text="Acompanhamento durante o ciclo" />
            </div>

            <div style={{ marginTop: 32 }}>
              
                href="#pricing"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 22px',
                  borderRadius: 10,
                  background: '#fff',
                  color: C.ink,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '-0.005em',
                }}
              >
                Ver o plano Pro →
              </a>
            </div>
          </div>

          {/* Ilustração */}
          <div
            className="medicos-illustration"
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <IllustrationMedicos />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .medicos-banner {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .medicos-illustration {
            order: -1;
          }
        }
      `}</style>
    </section>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div
        style={{
          flexShrink: 0,
          marginTop: 2,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path
            d="M1.5 4.5L3.5 6.5L7.5 2.5"
            stroke={C.green}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 }}>
        {text}
      </span>
    </div>
  );
}

function IllustrationMedicos() {
  return (
    <svg width="280" height="280" viewBox="0 0 280 280" fill="none" style={{ maxWidth: '100%' }}>
      <circle cx="140" cy="140" r="120" fill="rgba(34, 197, 94, 0.06)" />
      <circle
        cx="140"
        cy="140"
        r="120"
        stroke="rgba(34, 197, 94, 0.2)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      <rect x="90" y="80" width="100" height="140" rx="12" fill="#fff" />
      <rect x="90" y="80" width="100" height="140" rx="12" stroke="#0F1115" strokeWidth="1.5" />

      <circle cx="140" cy="118" r="22" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.5" />
      <circle cx="140" cy="114" r="8" fill="#22C55E" />
      <path
        d="M128 130 Q140 138 152 130"
        stroke="#22C55E"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      <rect x="135" y="148" width="10" height="3" fill="#22C55E" />
      <rect x="138.5" y="144.5" width="3" height="10" fill="#22C55E" />

      <rect x="105" y="166" width="70" height="3" rx="1.5" fill="#0F1115" opacity="0.7" />
      <rect x="112" y="175" width="56" height="2" rx="1" fill="#9CA3AF" />

      <rect x="110" y="190" width="60" height="18" rx="4" fill="#DCFCE7" />
      <text
        x="140"
        y="202"
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        fill="#15803D"
        fontFamily="system-ui, sans-serif"
      >
        CRM verificado
      </text>

      <g transform="translate(30, 110)">
        <rect x="0" y="0" width="44" height="36" rx="8" fill="#fff" stroke="#0F1115" strokeWidth="1.5" />
        <path d="M10 44 L16 36 L22 36 Z" fill="#fff" stroke="#0F1115" strokeWidth="1.5" />
        <circle cx="14" cy="18" r="2" fill="#22C55E" />
        <circle cx="22" cy="18" r="2" fill="#22C55E" />
        <circle cx="30" cy="18" r="2" fill="#22C55E" />
      </g>

      <g transform="translate(210, 90)">
        <rect x="0" y="0" width="40" height="52" rx="6" fill="#fff" stroke="#0F1115" strokeWidth="1.5" />
        <rect x="6" y="8" width="20" height="2.5" rx="1" fill="#0F1115" opacity="0.7" />
        <rect x="6" y="14" width="28" height="2" rx="1" fill="#9CA3AF" />
        <rect x="6" y="22" width="28" height="2" rx="1" fill="#9CA3AF" />
        <circle cx="9" cy="32" r="2" fill="#22C55E" />
        <rect x="14" y="31" width="20" height="2" rx="1" fill="#9CA3AF" />
        <circle cx="9" cy="40" r="2" fill="#22C55E" />
        <rect x="14" y="39" width="16" height="2" rx="1" fill="#9CA3AF" />
      </g>

      <path
        d="M74 128 Q82 130 90 132"
        stroke="#22C55E"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M190 132 Q200 130 210 128"
        stroke="#22C55E"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        fill="none"
        opacity="0.5"
      />

      <g transform="translate(60, 50)">
        <path d="M0 6L2 0L4 6L10 8L4 10L2 16L0 10L-6 8Z" fill="#22C55E" opacity="0.8" />
      </g>
      <g transform="translate(230, 210)">
        <path d="M0 4L1 0L2 4L6 5L2 6L1 10L0 6L-4 5Z" fill="#22C55E" opacity="0.6" />
      </g>
    </svg>
  );
}
