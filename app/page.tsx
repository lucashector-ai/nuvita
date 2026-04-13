// ════════════════════════════════════════════════
//  NUVITA — app/page.tsx
//  Landing page pública (light premium, identidade Nuvita)
// ════════════════════════════════════════════════

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nuvita — Protocolo de peptídeos personalizado por IA',
  description:
    'Diagnóstico inteligente, calculadora de doses, biblioteca científica e acompanhamento de ciclo. Comece grátis.',
  openGraph: {
    title: 'Nuvita — Protocolo de peptídeos personalizado por IA',
    description:
      'Diagnóstico inteligente, calculadora de doses, biblioteca científica e acompanhamento de ciclo.',
    type: 'website',
  },
};

// ═══════════════════════════════════════════════
// Tokens (alinhados ao globals.css existente)
// ═══════════════════════════════════════════════
const C = {
  bg: '#FFFFFF',
  bg2: '#F7F7F7',
  bg3: '#EFEFEF',
  ink: '#0F1115',
  inkSoft: '#1A1D23',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  border: '#EBEBEB',
  borderStrong: '#D8D8D8',
  green: '#22C55E',
  greenSoft: '#DCFCE7',
  greenInk: '#15803D',
};

const wrap: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 24px',
};

// ═══════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════
export default function Home() {
  return (
    <main
      style={{
        background: C.bg,
        color: C.ink,
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <Header />
      <Hero />
      <ProductPreview />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

// ═══════════════════════════════════════════════
// Header
// ═══════════════════════════════════════════════
function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          ...wrap,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: '-0.02em',
            color: C.ink,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <LogoMark />
          nuvita
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavLink href="#features">Produto</NavLink>
          <NavLink href="#pricing">Planos</NavLink>
          <NavLink href="#faq">Dúvidas</NavLink>
          <NavLink href="/login">Entrar</NavLink>
          <Link
            href="/diagnostico"
            style={{
              marginLeft: 8,
              padding: '9px 16px',
              borderRadius: 10,
              background: C.ink,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '-0.005em',
            }}
          >
            Começar grátis
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: '8px 12px',
        color: C.textMuted,
        fontSize: 14,
        fontWeight: 500,
        textDecoration: 'none',
        letterSpacing: '-0.005em',
      }}
    >
      {children}
    </Link>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="10" stroke={C.green} strokeWidth="1.6" />
      <path
        d="M6 14C7.5 11.5 9 7 11 7C13 7 14.5 11.5 16 14"
        stroke={C.green}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════
// Hero
// ═══════════════════════════════════════════════
function Hero() {
  return (
    <section style={{ position: 'relative', padding: '88px 0 56px', overflow: 'hidden' }}>
      {/* Glow verde sutil de fundo */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          right: '15%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(220, 252, 231, 0.6) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
        aria-hidden
      />
      <DotCluster style={{ top: 100, left: '8%' }} />
      <DotCluster style={{ top: 220, right: '8%', transform: 'rotate(-25deg)' }} green />

      <div style={{ ...wrap, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Link
          href="/diagnostico"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px 6px 6px',
            borderRadius: 999,
            background: '#fff',
            border: `1px solid ${C.border}`,
            color: C.textMuted,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            marginBottom: 28,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 999,
              background: C.greenSoft,
              color: C.greenInk,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Novo
          </span>
          Diagnóstico em 4 minutos →
        </Link>

        <h1
          style={{
            fontSize: 'clamp(40px, 6.4vw, 76px)',
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            fontWeight: 600,
            color: C.ink,
            margin: 0,
            maxWidth: 900,
            marginInline: 'auto',
          }}
        >
          Protocolo de peptídeos
          <br />
          personalizado por <span style={{ color: C.greenInk }}>IA</span>.
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: C.textMuted,
            margin: '24px auto 0',
            maxWidth: 580,
            letterSpacing: '-0.005em',
          }}
        >
          Diagnóstico inteligente, calculadora de doses, biblioteca científica e
          acompanhamento de ciclo. Tudo em um lugar — ajustado pro seu objetivo.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            marginTop: 36,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/diagnostico"
            style={{
              padding: '13px 22px',
              borderRadius: 10,
              background: C.ink,
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '-0.005em',
            }}
          >
            Começar grátis
          </Link>
          <a
            href="#features"
            style={{
              padding: '13px 22px',
              borderRadius: 10,
              background: '#fff',
              color: C.ink,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              border: `1px solid ${C.borderStrong}`,
              letterSpacing: '-0.005em',
            }}
          >
            Ver como funciona
          </a>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
            marginTop: 28,
            flexWrap: 'wrap',
            color: C.textSubtle,
            fontSize: 13,
          }}
        >
          <Trust>4 minutos</Trust>
          <Trust>Sem cartão</Trust>
          <Trust>7 dias de garantia</Trust>
        </div>
      </div>
    </section>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <CheckMicro /> {children}
    </span>
  );
}

function CheckMicro() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 6.2L4.8 8.5L9.5 3.5"
        stroke={C.green}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotCluster({
  style,
  green,
}: {
  style: React.CSSProperties;
  green?: boolean;
}) {
  const color = green ? C.green : C.borderStrong;
  const dots = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const opacity = Math.max(0.05, 1 - Math.sqrt(r * r + c * c) * 0.18);
      dots.push(
        <circle key={`${r}-${c}`} cx={c * 8} cy={r * 8} r={1.5} fill={color} opacity={opacity} />
      );
    }
  }
  return (
    <div
      style={{
        position: 'absolute',
        width: 56,
        height: 56,
        opacity: 0.55,
        pointerEvents: 'none',
        ...style,
      }}
      aria-hidden
    >
      <svg width="56" height="56" viewBox="0 0 56 56">
        {dots}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Mockup do dashboard (prova de produto)
// ═══════════════════════════════════════════════
function ProductPreview() {
  return (
    <section style={{ padding: '0 0 96px' }}>
      <div style={wrap}>
        <div
          style={{
            background: '#fff',
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 8,
            boxShadow: '0 24px 60px rgba(15, 17, 21, 0.10), 0 4px 16px rgba(15, 17, 21, 0.06)',
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={dotCircle('#FF5F57')} />
            <div style={dotCircle('#FEBC2E')} />
            <div style={dotCircle('#28C840')} />
            <div
              style={{
                marginLeft: 14,
                fontSize: 12,
                color: C.textSubtle,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              nuvita.app/dashboard
            </div>
          </div>

          {/* Mock content */}
          <div
            style={{
              padding: 24,
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 16,
              background: C.bg2,
              borderRadius: '0 0 12px 12px',
            }}
          >
            <MockCard col="1 / 8" title="SEMANA 1 DE 6" big="Tirzepatide" sub="Adaptação celular" />
            <MockCard col="8 / 13" title="HOJE" big="0%" sub="0/1 ações concluídas" accent />
            <MockStat col="1 / 4" label="Aplicações" value="14" />
            <MockStat col="4 / 7" label="Streak" value="6 dias" />
            <MockStat col="7 / 10" label="Próximo marco" value="Sem 4" />
            <MockStat col="10 / 13" label="Energia" value="↑ 22%" accent />
          </div>
        </div>
      </div>
    </section>
  );
}

const dotCircle = (c: string): React.CSSProperties => ({
  width: 11,
  height: 11,
  borderRadius: '50%',
  background: c,
});

function MockCard({
  col,
  title,
  big,
  sub,
  accent,
}: {
  col: string;
  title: string;
  big: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        gridColumn: col,
        background: accent ? C.greenSoft : '#fff',
        border: `1px solid ${accent ? C.green : C.border}`,
        borderRadius: 12,
        padding: 18,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent ? C.greenInk : C.textSubtle,
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: C.ink,
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}
      >
        {big}
      </div>
      <div style={{ fontSize: 13, color: C.textMuted }}>{sub}</div>
    </div>
  );
}

function MockStat({
  col,
  label,
  value,
  accent,
}: {
  col: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        gridColumn: col,
        background: '#fff',
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 11, color: C.textSubtle, marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: accent ? C.greenInk : C.ink,
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Trust bar
// ═══════════════════════════════════════════════
function TrustBar() {
  return (
    <section
      style={{
        padding: '40px 0 80px',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        background: C.bg2,
      }}
    >
      <div style={wrap}>
        <p
          style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: C.textSubtle,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: '0 0 24px',
          }}
        >
          Construído sobre evidência científica
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 48,
            flexWrap: 'wrap',
            color: C.textMuted,
            fontSize: 14,
          }}
        >
          <span>📚 PubMed</span>
          <span>🧪 ClinicalTrials.gov</span>
          <span>🔬 Cochrane Reviews</span>
          <span>⚕️ Endocrine Society</span>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// Features (grid 2x3 com bordas divisórias estilo Linear)
// ═══════════════════════════════════════════════
const FEATURES = [
  {
    icon: '🧬',
    title: 'Diagnóstico por IA',
    desc: 'Responda 9 perguntas e receba um protocolo personalizado com base no seu perfil, objetivos e histórico.',
  },
  {
    icon: '💊',
    title: 'Calculadora de doses',
    desc: 'Converta miligramas, unidades internacionais e ml sem erro. Salva por peptídeo no seu estoque.',
  },
  {
    icon: '📚',
    title: 'Biblioteca científica',
    desc: '20+ peptídeos com pesquisas, protocolos de referência, interações e contraindicações.',
  },
  {
    icon: '📊',
    title: 'Tracker de evolução',
    desc: 'Peso, energia, sono, fotos. Veja semana a semana o que o ciclo está fazendo no seu corpo.',
  },
  {
    icon: '🤖',
    title: 'IA especialista 24/7',
    desc: 'Tire dúvidas sobre dose, timing, combinações e efeitos. Treinada exclusivamente em peptídeos.',
  },
  {
    icon: '📅',
    title: 'Calendário e lembretes',
    desc: 'Nunca perca uma dose. Histórico completo, próximas aplicações e previsão do próximo ciclo.',
  },
];

function Features() {
  return (
    <section id="features" style={{ padding: '120px 0' }}>
      <div style={wrap}>
        <SectionEyebrow>Produto</SectionEyebrow>
        <SectionTitle>
          Ciência, estrutura e IA
          <br />
          <span style={{ color: C.textMuted }}>num só lugar.</span>
        </SectionTitle>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 1,
            background: C.border,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            overflow: 'hidden',
            marginTop: 64,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: '#fff', padding: 32 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: C.bg2,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  marginBottom: 20,
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: C.ink,
                  margin: '0 0 8px',
                  letterSpacing: '-0.01em',
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// How it works (com ilustrações SVG)
// ═══════════════════════════════════════════════
function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Faça o diagnóstico',
      desc: '9 perguntas rápidas sobre seus objetivos, perfil e histórico. Leva 4 minutos.',
      illustration: <IllustrationDiagnostico />,
    },
    {
      n: '02',
      title: 'Receba seu protocolo',
      desc: 'A IA monta um plano personalizado de 6 semanas com peptídeos, doses e timing.',
      illustration: <IllustrationProtocolo />,
    },
    {
      n: '03',
      title: 'Acompanhe o ciclo',
      desc: 'Registre aplicações, tire dúvidas com a IA e veja sua evolução em tempo real.',
      illustration: <IllustrationAcompanhar />,
    },
  ];

  return (
    <section style={{ padding: '120px 0', borderTop: `1px solid ${C.border}`, background: C.bg2 }}>
      <div style={wrap}>
        <SectionEyebrow>Como funciona</SectionEyebrow>
        <SectionTitle>Do clique ao resultado.</SectionTitle>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginTop: 64,
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: '#fff',
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Ilustração com background suave */}
              <div
                style={{
                  background: C.bg2,
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 160,
                }}
              >
                {s.illustration}
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.greenInk,
                  letterSpacing: '0.06em',
                  marginBottom: 12,
                }}
              >
                PASSO {s.n}
              </div>
              <h3
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  color: C.ink,
                  margin: '0 0 8px',
                  letterSpacing: '-0.01em',
                }}
              >
                {s.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Ilustrações SVG simples ───
function IllustrationDiagnostico() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
      {/* Clipboard */}
      <rect x="46" y="14" width="68" height="92" rx="6" fill="#fff" stroke={C.ink} strokeWidth="1.6" />
      <rect x="62" y="6" width="36" height="14" rx="3" fill={C.greenSoft} stroke={C.ink} strokeWidth="1.6" />
      {/* Linhas (perguntas) */}
      <rect x="56" y="34" width="48" height="3" rx="1.5" fill={C.borderStrong} />
      <rect x="56" y="44" width="36" height="3" rx="1.5" fill={C.borderStrong} />
      {/* Opções marcadas */}
      <circle cx="60" cy="60" r="3.5" fill={C.green} />
      <rect x="68" y="58" width="32" height="3" rx="1.5" fill={C.ink} opacity="0.7" />
      <circle cx="60" cy="72" r="3.5" stroke={C.borderStrong} strokeWidth="1.6" fill="#fff" />
      <rect x="68" y="70" width="28" height="3" rx="1.5" fill={C.borderStrong} />
      <circle cx="60" cy="84" r="3.5" stroke={C.borderStrong} strokeWidth="1.6" fill="#fff" />
      <rect x="68" y="82" width="36" height="3" rx="1.5" fill={C.borderStrong} />
      {/* Barra de progresso */}
      <rect x="56" y="96" width="48" height="4" rx="2" fill={C.bg3} />
      <rect x="56" y="96" width="20" height="4" rx="2" fill={C.green} />
    </svg>
  );
}

function IllustrationProtocolo() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
      {/* Documento principal */}
      <rect x="40" y="20" width="80" height="84" rx="6" fill="#fff" stroke={C.ink} strokeWidth="1.6" />
      {/* Header com badge */}
      <rect x="48" y="28" width="36" height="8" rx="2" fill={C.ink} />
      <rect x="88" y="28" width="24" height="8" rx="4" fill={C.greenSoft} stroke={C.green} strokeWidth="1" />
      {/* Linhas de protocolo */}
      <circle cx="52" cy="50" r="3" fill={C.green} />
      <rect x="60" y="48" width="50" height="3" rx="1.5" fill={C.ink} opacity="0.7" />
      <rect x="60" y="54" width="32" height="2.5" rx="1" fill={C.borderStrong} />

      <circle cx="52" cy="68" r="3" fill={C.green} />
      <rect x="60" y="66" width="48" height="3" rx="1.5" fill={C.ink} opacity="0.7" />
      <rect x="60" y="72" width="28" height="2.5" rx="1" fill={C.borderStrong} />

      <circle cx="52" cy="86" r="3" fill={C.green} />
      <rect x="60" y="84" width="44" height="3" rx="1.5" fill={C.ink} opacity="0.7" />
      <rect x="60" y="90" width="36" height="2.5" rx="1" fill={C.borderStrong} />

      {/* Sparkles IA */}
      <path d="M132 30L134 36L140 38L134 40L132 46L130 40L124 38L130 36Z" fill={C.green} />
      <path d="M28 78L29 81L32 82L29 83L28 86L27 83L24 82L27 81Z" fill={C.green} opacity="0.6" />
    </svg>
  );
}

function IllustrationAcompanhar() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
      {/* Card de gráfico */}
      <rect x="20" y="24" width="120" height="76" rx="8" fill="#fff" stroke={C.ink} strokeWidth="1.6" />
      {/* Título */}
      <rect x="30" y="34" width="40" height="4" rx="2" fill={C.ink} opacity="0.7" />
      <rect x="30" y="42" width="24" height="3" rx="1.5" fill={C.borderStrong} />
      {/* Eixos sutis */}
      <line x1="30" y1="88" x2="130" y2="88" stroke={C.border} strokeWidth="1" />
      {/* Linha do gráfico (subindo) */}
      <path
        d="M34 82 L50 76 L66 78 L82 68 L98 64 L114 56 L126 50"
        stroke={C.green}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Área sob a curva */}
      <path
        d="M34 82 L50 76 L66 78 L82 68 L98 64 L114 56 L126 50 L126 88 L34 88 Z"
        fill={C.green}
        opacity="0.12"
      />
      {/* Pontos */}
      <circle cx="50" cy="76" r="2.5" fill={C.green} />
      <circle cx="82" cy="68" r="2.5" fill={C.green} />
      <circle cx="114" cy="56" r="2.5" fill={C.green} />
      <circle cx="126" cy="50" r="3" fill={C.green} stroke="#fff" strokeWidth="2" />

      {/* Check de aplicação */}
      <circle cx="138" cy="22" r="10" fill={C.green} />
      <path d="M134 22L137 25L142 19" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ═══════════════════════════════════════════════
// Pricing — embutido na landing
// ═══════════════════════════════════════════════
const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    price: '0',
    suffix: '',
    tagline: 'Para começar',
    features: ['Protocolo personalizado', 'Diagnóstico por IA', 'Biblioteca de peptídeos'],
    cta: 'Começar grátis',
    href: '/diagnostico',
    highlighted: false,
  },
  {
    id: 'essencial',
    name: 'Essencial',
    price: '47',
    suffix: '/mês',
    tagline: 'O mais popular',
    features: [
      'Tudo do Gratuito',
      'Coach IA',
      'Detector de sintomas',
      'Exportar PDF',
      'Rotina personalizada',
    ],
    cta: 'Assinar Essencial',
    href: '/cadastro?plan=essencial',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '97',
    suffix: '/mês',
    tagline: 'Para quem leva a sério',
    features: ['Tudo do Essencial', 'Médico parceiro', 'Relatórios avançados', 'Simulador de ciclos'],
    cta: 'Assinar Pro',
    href: '/cadastro?plan=pro',
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" style={{ padding: '120px 0' }}>
      <div style={wrap}>
        <div style={{ textAlign: 'center' }}>
          <SectionEyebrow center>Planos</SectionEyebrow>
          <SectionTitle center>
            Comece grátis.
            <br />
            <span style={{ color: C.textMuted }}>Evolua quando quiser.</span>
          </SectionTitle>
          <p
            style={{
              fontSize: 16,
              color: C.textMuted,
              maxWidth: 520,
              margin: '20px auto 0',
              lineHeight: 1.55,
            }}
          >
            Sem fidelidade. Sem taxa de cancelamento. 7 dias de garantia em qualquer plano pago.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            marginTop: 64,
            maxWidth: 1080,
            marginInline: 'auto',
          }}
        >
          {PLANS.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'relative',
                background: '#fff',
                border: `1px solid ${p.highlighted ? C.green : C.border}`,
                borderRadius: 16,
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: p.highlighted
                  ? '0 12px 40px rgba(34, 197, 94, 0.15), 0 4px 12px rgba(0,0,0,0.04)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {p.highlighted && (
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: C.green,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Mais popular
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: C.textSubtle }}>{p.tagline}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                <span style={{ fontSize: 14, color: C.textMuted }}>R$</span>
                <span
                  style={{
                    fontSize: 44,
                    fontWeight: 600,
                    color: C.ink,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {p.price}
                </span>
                {p.suffix && <span style={{ fontSize: 14, color: C.textMuted }}>{p.suffix}</span>}
              </div>

              <Link
                href={p.href}
                style={{
                  display: 'block',
                  padding: '11px 16px',
                  borderRadius: 10,
                  background: p.highlighted ? C.ink : '#fff',
                  color: p.highlighted ? '#fff' : C.ink,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center',
                  border: p.highlighted ? 'none' : `1px solid ${C.borderStrong}`,
                  marginBottom: 24,
                }}
              >
                {p.cta}
              </Link>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {p.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontSize: 14,
                      color: C.textMuted,
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ marginTop: 4, flexShrink: 0 }}>
                      <CheckMicro />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// FAQ (split layout)
// ═══════════════════════════════════════════════
const FAQ_ITEMS = [
  {
    q: 'Preciso já ter os peptídeos pra usar a Nuvita?',
    a: 'Não. Você gera o protocolo primeiro e começa a aplicação quando os peptídeos chegarem. O plano fica salvo na sua conta.',
  },
  {
    q: 'A Nuvita vende peptídeos?',
    a: 'Não. A Nuvita é uma plataforma de informação, diagnóstico e acompanhamento. Não comercializamos nem indicamos fornecedores.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Sem fidelidade e sem taxa de cancelamento. Cancele pela própria plataforma a qualquer momento.',
  },
  {
    q: 'A IA substitui um médico?',
    a: 'Não. A Nuvita é uma ferramenta de apoio à informação. O acompanhamento médico é essencial — o plano Pro inclui acesso a médico parceiro.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Criptografia em trânsito e em repouso, RLS por usuário no Supabase e total conformidade com a LGPD. Você pode exportar ou excluir tudo quando quiser.',
  },
  {
    q: 'Como é o pagamento?',
    a: 'Cartão de crédito via Stripe. Cobrança recorrente mensal ou anual com 20% de desconto. Nota fiscal emitida automaticamente.',
  },
];

function FAQ() {
  return (
    <section
      id="faq"
      style={{ padding: '120px 0', borderTop: `1px solid ${C.border}`, background: C.bg2 }}
    >
      <div style={wrap}>
        <div
          className="faq-grid"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: 64 }}
        >
          <div>
            <SectionEyebrow>Dúvidas</SectionEyebrow>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                fontWeight: 600,
                color: C.ink,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Perguntas
              <br />
              frequentes
            </h2>
            <p style={{ fontSize: 14, color: C.textMuted, marginTop: 16, lineHeight: 1.55 }}>
              Não achou sua resposta? Fala com a gente no WhatsApp.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                style={{
                  borderTop: i === 0 ? `1px solid ${C.border}` : 'none',
                  borderBottom: `1px solid ${C.border}`,
                  padding: '20px 0',
                }}
              >
                <summary
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: C.ink,
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {item.q}
                  <span style={{ color: C.textSubtle, fontSize: 18 }}>+</span>
                </summary>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: C.textMuted,
                    margin: '12px 0 0',
                    paddingRight: 32,
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .faq-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════
// CTA Final
// ═══════════════════════════════════════════════
function FinalCTA() {
  return (
    <section style={{ padding: '120px 0', textAlign: 'center', position: 'relative' }}>
      <DotCluster style={{ top: 80, left: '20%' }} green />
      <DotCluster style={{ bottom: 80, right: '20%', transform: 'rotate(45deg)' }} />

      <div style={wrap}>
        <h2
          style={{
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 600,
            color: C.ink,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          Pronto pra montar
          <br />
          seu <span style={{ color: C.greenInk }}>protocolo</span>?
        </h2>
        <p style={{ fontSize: 17, color: C.textMuted, margin: '24px auto 36px', maxWidth: 480, lineHeight: 1.55 }}>
          4 minutos. Sem cartão. Cancele quando quiser.
        </p>
        <Link
          href="/diagnostico"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            borderRadius: 10,
            background: C.ink,
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '-0.005em',
          }}
        >
          Começar grátis →
        </Link>
      </div>

      {/* Linha espectro decorativa */}
      <div
        style={{
          maxWidth: 1200,
          margin: '80px auto 0',
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, #EF4444 15%, #F97316 30%, #FACC15 45%, #22C55E 60%, #3B82F6 75%, #8B5CF6 90%, transparent 100%)',
          opacity: 0.5,
        }}
        aria-hidden
      />
    </section>
  );
}

// ═══════════════════════════════════════════════
// Footer
// ═══════════════════════════════════════════════
function Footer() {
  return (
    <footer style={{ padding: '64px 0 40px', borderTop: `1px solid ${C.border}`, background: C.bg }}>
      <div style={wrap}>
        <div
          className="footer-grid"
          style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 48 }}
        >
          <div>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 600,
                fontSize: 18,
                color: C.ink,
                textDecoration: 'none',
                letterSpacing: '-0.02em',
                marginBottom: 16,
              }}
            >
              <LogoMark />
              nuvita
            </Link>
            <p
              style={{
                fontSize: 13,
                color: C.textMuted,
                lineHeight: 1.55,
                margin: 0,
                maxWidth: 280,
              }}
            >
              Protocolo de peptídeos personalizado por IA. Ciência, estrutura e acompanhamento.
            </p>
          </div>

          <FooterCol
            title="Produto"
            links={[
              { label: 'Diagnóstico', href: '/diagnostico' },
              { label: 'Planos', href: '#pricing' },
              { label: 'Biblioteca', href: '/biblioteca' },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: 'Termos de uso', href: '/termos' },
              { label: 'Privacidade', href: '/privacidade' },
              { label: 'LGPD', href: '/privacidade' },
            ]}
          />
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: 12,
            color: C.textSubtle,
          }}
        >
          <span>© {new Date().getFullYear()} Nuvita. Todos os direitos reservados.</span>
          <span>Plataforma de informação. Não substitui acompanhamento médico.</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none' }}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Helpers visuais
// ═══════════════════════════════════════════════
function SectionEyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        background: C.greenSoft,
        color: C.greenInk,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: 16,
        ...(center ? {} : {}),
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2
      style={{
        fontSize: 'clamp(32px, 4.2vw, 52px)',
        fontWeight: 600,
        color: C.ink,
        letterSpacing: '-0.025em',
        lineHeight: 1.05,
        margin: 0,
        textAlign: center ? 'center' : 'left',
      }}
    >
      {children}
    </h2>
  );
}
