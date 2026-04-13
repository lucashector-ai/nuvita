// ════════════════════════════════════════════════
//  NUVITA — app/termos/page.tsx
//  Termos de Uso
// ════════════════════════════════════════════════

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso — Nuvita',
  description: 'Termos e condições de uso da plataforma Nuvita.',
};

const VERSION = '1.0';
const VIGENCIA = '13 de abril de 2026';

const wrap: React.CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  padding: '0 24px',
};

const C = {
  bg: '#FFFFFF',
  ink: '#0F1115',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  border: '#EBEBEB',
  green: '#22C55E',
  greenInk: '#15803D',
  greenSoft: '#DCFCE7',
};

export default function TermosPage() {
  return (
    <main style={{ background: C.bg, color: C.ink, minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      {/* Header simples */}
      <header style={{ borderBottom: `1px solid ${C.border}`, padding: '16px 0' }}>
        <div style={{ ...wrap, maxWidth: 1200, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontWeight: 600, fontSize: 18, color: C.ink, textDecoration: 'none', letterSpacing: '-0.02em' }}>
            nuvita
          </Link>
          <Link href="/" style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none' }}>
            ← Voltar
          </Link>
        </div>
      </header>

      <article style={{ ...wrap, padding: '64px 24px 96px' }}>
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
          }}
        >
          Legal
        </div>
        <h1
          style={{
            fontSize: 'clamp(32px, 4.5vw, 48px)',
            fontWeight: 600,
            color: C.ink,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            margin: '0 0 16px',
          }}
        >
          Termos de Uso
        </h1>
        <p style={{ fontSize: 14, color: C.textSubtle, margin: 0 }}>
          Versão {VERSION} · Vigente desde {VIGENCIA}
        </p>

        <Section title="1. Aceitação dos termos">
          <p>
            Ao criar uma conta, acessar ou utilizar a plataforma Nuvita (&ldquo;Nuvita&rdquo;,
            &ldquo;plataforma&rdquo;, &ldquo;serviço&rdquo;), você concorda integralmente com estes Termos
            de Uso e com a nossa <Link href="/privacidade" style={linkStyle}>Política de Privacidade</Link>.
            Se você não concorda com algum ponto, não utilize a plataforma.
          </p>
        </Section>

        <Section title="2. O que é a Nuvita">
          <p>
            A Nuvita é uma plataforma de informação, diagnóstico assistido por inteligência
            artificial e acompanhamento de protocolos de peptídeos terapêuticos. Oferecemos:
          </p>
          <ul>
            <li>Diagnóstico personalizado por IA</li>
            <li>Calculadora de doses e estoque</li>
            <li>Biblioteca científica de peptídeos</li>
            <li>Tracker de evolução, calendário e lembretes</li>
            <li>Coach IA para dúvidas sobre uso, dose, timing e combinações</li>
          </ul>
          <p>
            <strong>A Nuvita não vende, fornece, intermedia ou recomenda fornecedores
            de peptídeos.</strong> Toda aquisição de produtos é responsabilidade exclusiva do usuário.
          </p>
        </Section>

        <Section title="3. Natureza informativa — não substitui profissional de saúde">
          <p>
            <strong>
              A Nuvita é uma ferramenta de apoio à informação. Não substitui consulta,
              diagnóstico ou prescrição médica.
            </strong>{' '}
            Toda decisão sobre uso, dosagem, combinação ou interrupção de qualquer
            substância deve ser tomada com acompanhamento de profissional de saúde
            habilitado (médico, endocrinologista, nutricionista esportivo) que conheça
            seu histórico pessoal.
          </p>
          <p>
            Os protocolos gerados pela IA são baseados em literatura científica
            disponível e nas informações fornecidas pelo próprio usuário, mas{' '}
            <strong>não constituem prescrição</strong> e não consideram particularidades
            clínicas que apenas um exame médico completo pode identificar.
          </p>
        </Section>

        <Section title="4. Cadastro e responsabilidades do usuário">
          <p>Ao criar conta na Nuvita, você declara:</p>
          <ul>
            <li>Ter pelo menos 18 anos de idade</li>
            <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
            <li>Manter a confidencialidade da sua senha de acesso</li>
            <li>Ser responsável por todas as ações realizadas em sua conta</li>
            <li>Notificar imediatamente qualquer uso não autorizado</li>
          </ul>
          <p>
            A Nuvita pode suspender ou encerrar contas que violem estes termos,
            forneçam informações falsas ou utilizem a plataforma para finalidades
            ilícitas.
          </p>
        </Section>

        <Section title="5. Planos, pagamentos e cancelamento">
          <p>
            A Nuvita oferece um plano gratuito (Gratuito) e planos pagos (Essencial e Pro)
            com cobrança recorrente mensal ou anual via cartão de crédito, processada pela
            Stripe.
          </p>
          <ul>
            <li>
              <strong>Garantia de 7 dias:</strong> em qualquer plano pago, você pode
              solicitar reembolso integral nos primeiros 7 dias após a primeira cobrança.
            </li>
            <li>
              <strong>Cancelamento:</strong> a qualquer momento, pela própria plataforma,
              sem fidelidade e sem taxa. O acesso permanece ativo até o fim do ciclo
              já pago.
            </li>
            <li>
              <strong>Renovação automática:</strong> assinaturas renovam automaticamente
              ao final de cada ciclo, salvo cancelamento prévio.
            </li>
            <li>
              <strong>Notas fiscais:</strong> emitidas automaticamente após cada cobrança
              e disponibilizadas na sua área de Conta.
            </li>
          </ul>
        </Section>

        <Section title="6. Propriedade intelectual">
          <p>
            Todo conteúdo da Nuvita — textos, design, código, marca, logos, base de dados,
            algoritmos de IA, ilustrações e materiais educativos — é de propriedade
            exclusiva da Nuvita ou de seus licenciadores e protegido pelas leis de direitos
            autorais e propriedade intelectual.
          </p>
          <p>
            É vedado copiar, reproduzir, distribuir, modificar, fazer engenharia reversa
            ou criar trabalhos derivados sem autorização expressa por escrito.
          </p>
          <p>
            Os dados que você insere na plataforma (respostas de diagnóstico, registros
            de aplicação, fotos, anotações) <strong>permanecem de sua propriedade</strong>.
            A Nuvita apenas os processa para entregar o serviço, conforme detalhado na
            Política de Privacidade.
          </p>
        </Section>

        <Section title="7. Limitação de responsabilidade">
          <p>
            Na máxima extensão permitida pela legislação brasileira aplicável, a Nuvita,
            seus sócios, colaboradores e parceiros não se responsabilizam por:
          </p>
          <ul>
            <li>
              Decisões clínicas tomadas pelo usuário com base nas informações da plataforma
            </li>
            <li>
              Efeitos adversos, reações ou consequências do uso de qualquer substância
            </li>
            <li>Aquisição de peptídeos de qualquer fornecedor</li>
            <li>
              Indisponibilidade temporária do serviço por manutenção, falha técnica ou
              evento de força maior
            </li>
            <li>
              Dados inseridos incorretamente pelo usuário que levem a recomendações
              inadequadas
            </li>
          </ul>
        </Section>

        <Section title="8. Modificações dos termos">
          <p>
            A Nuvita pode atualizar estes Termos de Uso a qualquer momento. Mudanças
            relevantes serão comunicadas por e-mail e/ou aviso na plataforma com pelo
            menos 15 dias de antecedência. O uso contínuo do serviço após a vigência da
            nova versão constitui aceite.
          </p>
        </Section>

        <Section title="9. Foro">
          <p>
            Estes termos são regidos pela legislação brasileira. Fica eleito o foro da
            comarca de Itajaí/SC para dirimir qualquer controvérsia, com renúncia
            expressa a qualquer outro, por mais privilegiado que seja.
          </p>
        </Section>

        <Section title="10. Contato">
          <p>
            Dúvidas sobre estes termos, sobre a plataforma ou sobre seus dados:{' '}
            <a href="mailto:contato@nuvita.app" style={linkStyle}>contato@nuvita.app</a>
          </p>
        </Section>

        <div
          style={{
            marginTop: 64,
            padding: 24,
            background: '#F7F7F7',
            borderRadius: 12,
            border: `1px solid ${C.border}`,
          }}
        >
          <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
            <strong>Resumo:</strong> A Nuvita é uma ferramenta de informação e organização
            de protocolos de peptídeos. Não vende peptídeos, não substitui médico, não se
            responsabiliza por decisões clínicas. Cancele quando quiser, sem multa.
            Seus dados são seus.
          </p>
        </div>
      </article>

      <footer style={{ padding: '32px 0', borderTop: `1px solid ${C.border}` }}>
        <div style={{ ...wrap, maxWidth: 1200, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 12, color: C.textSubtle }}>
          <span>© {new Date().getFullYear()} Nuvita</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/termos" style={{ color: C.textMuted, textDecoration: 'none' }}>Termos</Link>
            <Link href="/privacidade" style={{ color: C.textMuted, textDecoration: 'none' }}>Privacidade</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ─── helpers ───
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 48 }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: C.ink,
          letterSpacing: '-0.015em',
          margin: '0 0 16px',
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: '#374151' }}>{children}</div>
    </section>
  );
}

const linkStyle: React.CSSProperties = {
  color: C.greenInk,
  textDecoration: 'underline',
  textDecorationThickness: 1,
  textUnderlineOffset: 2,
};
