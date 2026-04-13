// ════════════════════════════════════════════════
//  NUVITA — app/page.tsx
//  Landing page pública (substituí o redirect antigo)
// ════════════════════════════════════════════════

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nuvita — Protocolo de peptídeos personalizado por IA',
  description:
    'Diagnóstico inteligente, calculadora de doses, biblioteca científica e acompanhamento de ciclo. Comece grátis, evolua quando quiser.',
  openGraph: {
    title: 'Nuvita — Protocolo de peptídeos personalizado por IA',
    description:
      'Diagnóstico inteligente, calculadora de doses, biblioteca científica e acompanhamento de ciclo.',
    type: 'website',
  },
};

// ——— Estilos compartilhados ———
const wrap: React.CSSProperties = {
  maxWidth: 'var(--W, 1280px)',
  margin: '0 auto',
  padding: '0 24px',
};

const h1Style: React.CSSProperties = {
  fontSize: 'clamp(40px, 6vw, 68px)',
  lineHeight: 1.05,
  letterSpacing: '-0.02em',
  fontWeight: 700,
  color: 'var(--tx)',
  margin: 0,
};

const leadStyle: React.CSSProperties = {
  fontSize: 'clamp(16px, 1.4vw, 19px)',
  lineHeight: 1.55,
  color: 'var(--tm)',
  maxWidth: 620,
  margin: '20px 0 0',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '14px 22px',
  borderRadius: 'var(--radius, 12px)',
  background: 'var(--dark)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 15,
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  transition: 'transform .15s ease, opacity .15s ease',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '14px 22px',
  borderRadius: 'var(--radius, 12px)',
  background: 'transparent',
  color: 'var(--tx)',
  fontWeight: 600,
  fontSize: 15,
  textDecoration: 'none',
  border: '1px solid var(--border2)',
  cursor: 'pointer',
};

const pill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 12px',
  borderRadius: 999,
  background: 'var(--gp)',
  color: 'var(--gm)',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg, 16px)',
  padding: 24,
  boxShadow: 'var(--sh)',
};

const sectionTitle: React.CSSProperties = {
  fontSize: 'clamp(28px, 3.5vw, 40px)',
  fontWeight: 700,
  color: 'var(--tx)',
  letterSpacing: '-0.01em',
  margin: '0 0 12px',
};

const sectionSub: React.CSSProperties = {
  fontSize: 17,
  color: 'var(--tm)',
  margin: '0 0 40px',
  maxWidth: 620,
};

// ——— Dados ———
const features = [
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
    title: 'Calendário de aplicações',
    desc: 'Nunca perca uma dose. Lembretes automáticos, histórico completo e previsão do próximo ciclo.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Faça o diagnóstico',
    desc: '9 perguntas rápidas sobre seus objetivos, perfil e histórico. Leva cerca de 4 minutos.',
  },
  {
    n: '02',
    title: 'Receba seu protocolo',
    desc: 'A IA monta um plano personalizado de 6 semanas com peptídeos, doses e timing.',
  },
  {
    n: '03',
    title: 'Acompanhe o ciclo',
    desc: 'Registre aplicações, tire dúvidas com a IA e veja sua evolução em tempo real.',
  },
];

const faq = [
  {
    q: 'Preciso já ter os peptídeos pra usar a Nuvita?',
    a: 'Não. Você pode gerar seu protocolo primeiro e começar a aplicação quando os peptídeos chegarem. O diagnóstico e o plano ficam salvos na sua conta.',
  },
  {
    q: 'A Nuvita vende peptídeos?',
    a: 'Não. A Nuvita é uma plataforma de informação, diagnóstico e acompanhamento. Não comercializamos nem recomendamos fornecedores específicos.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. A assinatura é mensal ou anual, sem fidelidade e sem taxa de cancelamento. Você pode cancelar pela própria plataforma a qualquer momento.',
  },
  {
    q: 'A IA substitui um médico?',
    a: 'Não. A Nuvita é uma ferramenta de apoio à informação. O acompanhamento médico é essencial — inclusive, o plano Pro inclui acesso a médico parceiro.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Usamos criptografia, infraestrutura Supabase com RLS por usuário, e seguimos a LGPD. Você pode exportar ou excluir seus dados quando quiser.',
  },
];

// ═══════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════
export default function Home() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ——— Header ——— */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'saturate(180%) blur(14px)',
          WebkitBackdropFilter: 'saturate(180%) blur(14px)',
          borderBottom: '1px solid var(--border)',
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
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '-0.02em',
              color: 'var(--tx)',
              textDecoration: 'none',
            }}
          >
            nuvita
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              href="/planos"
              style={{
                padding: '10px 14px',
                color: 'var(--tm)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Planos
            </Link>
            <Link
              href="/login"
              style={{
                padding: '10px 14px',
                color: 'var(--tm)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Entrar
            </Link>
            <Link
              href="/diagnostico"
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius)',
                background: 'var(--dark)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* ——— Hero ——— */}
      <section
        style={{
          background:
            'radial-gradient(1200px 600px at 75% -10%, #DCFCE7 0%, transparent 55%), var(--bg)',
          padding: '88px 0 64px',
        }}
      >
        <div style={wrap}>
          <span style={pill}>● Diagnóstico personalizado por IA</span>
          <h1 style={{ ...h1Style, marginTop: 20 }}>
            Seu protocolo de
            <br />
            peptídeos, com <span style={{ color: 'var(--gm)' }}>inteligência</span>.
          </h1>
          <p style={leadStyle}>
            Diagnóstico por IA, tracker de evolução, calculadora de doses e
            biblioteca científica. Tudo em um lugar, personalizado pro seu
            objetivo.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
            <Link href="/diagnostico" style={btnPrimary}>
              Fazer diagnóstico grátis →
            </Link>
            <Link href="/planos" style={btnGhost}>
              Ver planos
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginTop: 36,
              flexWrap: 'wrap',
              color: 'var(--ts)',
              fontSize: 13,
            }}
          >
            <span>✓ 4 minutos</span>
            <span>✓ Sem cartão</span>
            <span>✓ Dados criptografados</span>
            <span>✓ 7 dias de garantia</span>
          </div>
        </div>
      </section>

      {/* ——— Features ——— */}
      <section style={{ padding: '96px 0' }}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Tudo que você precisa pra rodar um ciclo com consciência.</h2>
          <p style={sectionSub}>
            Peptídeos são ferramentas potentes. A Nuvita traz ciência, estrutura e IA pra
            você usar bem — desde o primeiro diagnóstico até a revisão do próximo ciclo.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {features.map((f) => (
              <div key={f.title} style={card}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--tx)',
                    margin: '0 0 8px',
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--tm)', margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— How it works ——— */}
      <section style={{ padding: '96px 0', background: 'var(--bg2)' }}>
        <div style={wrap}>
          <span style={pill}>Como funciona</span>
          <h2 style={{ ...sectionTitle, marginTop: 16 }}>
            Do primeiro clique ao primeiro resultado em 4 minutos.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
              marginTop: 40,
            }}
          >
            {steps.map((s) => (
              <div key={s.n} style={{ ...card, background: '#fff' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--green)',
                    letterSpacing: '0.05em',
                    marginBottom: 12,
                  }}
                >
                  PASSO {s.n}
                </div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'var(--tx)',
                    margin: '0 0 8px',
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--tm)', margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Pricing teaser ——— */}
      <section style={{ padding: '96px 0' }}>
        <div style={{ ...wrap, textAlign: 'center' }}>
          <span style={pill}>Planos a partir de R$47/mês</span>
          <h2 style={{ ...sectionTitle, marginTop: 16, textAlign: 'center' }}>
            Comece grátis. Evolua quando quiser.
          </h2>
          <p
            style={{
              ...sectionSub,
              textAlign: 'center',
              margin: '0 auto 32px',
            }}
          >
            O diagnóstico e o protocolo personalizado são gratuitos. Desbloqueie IA, Coach,
            Detector de sintomas e Relatórios quando estiver pronto pra subir o nível.
          </p>
          <Link href="/planos" style={btnPrimary}>
            Ver todos os planos →
          </Link>
        </div>
      </section>

      {/* ——— FAQ ——— */}
      <section style={{ padding: '96px 0', background: 'var(--bg2)' }}>
        <div style={{ ...wrap, maxWidth: 820 }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>Perguntas frequentes</h2>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faq.map((item, i) => (
              <details
                key={i}
                style={{
                  ...card,
                  background: '#fff',
                  cursor: 'pointer',
                  padding: '20px 24px',
                }}
              >
                <summary
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--tx)',
                    listStyle: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {item.q}
                </summary>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: 'var(--tm)',
                    margin: '12px 0 0',
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Final CTA ——— */}
      <section style={{ padding: '96px 0' }}>
        <div
          style={{
            ...wrap,
            background: 'var(--dark)',
            borderRadius: 'var(--radius-lg)',
            padding: '64px 32px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.01em',
              margin: '0 0 12px',
            }}
          >
            Pronto pra montar seu protocolo?
          </h2>
          <p
            style={{
              fontSize: 17,
              color: 'rgba(255,255,255,0.7)',
              margin: '0 auto 32px',
              maxWidth: 520,
            }}
          >
            Leva 4 minutos. Não precisa de cartão. Cancele quando quiser.
          </p>
          <Link
            href="/diagnostico"
            style={{
              ...btnPrimary,
              background: 'var(--green)',
              color: '#0F1115',
            }}
          >
            Fazer diagnóstico grátis →
          </Link>
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '40px 0',
          background: 'var(--bg)',
        }}
      >
        <div
          style={{
            ...wrap,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--ts)' }}>
            © {new Date().getFullYear()} Nuvita · Protocolo de peptídeos por IA
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
            <Link href="/termos" style={{ color: 'var(--tm)', textDecoration: 'none' }}>
              Termos
            </Link>
            <Link href="/privacidade" style={{ color: 'var(--tm)', textDecoration: 'none' }}>
              Privacidade
            </Link>
            <Link href="/login" style={{ color: 'var(--tm)', textDecoration: 'none' }}>
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
