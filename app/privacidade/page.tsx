// ════════════════════════════════════════════════
//  NUVITA — app/privacidade/page.tsx
//  Política de Privacidade (LGPD)
// ════════════════════════════════════════════════

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade — Nuvita',
  description: 'Como a Nuvita coleta, usa e protege seus dados pessoais (LGPD).',
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

export default function PrivacidadePage() {
  return (
    <main style={{ background: C.bg, color: C.ink, minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
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
          LGPD
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
          Política de Privacidade
        </h1>
        <p style={{ fontSize: 14, color: C.textSubtle, margin: 0 }}>
          Versão {VERSION} · Vigente desde {VIGENCIA}
        </p>

        <Section title="1. Quem somos">
          <p>
            A Nuvita é uma plataforma de diagnóstico, calculadora e acompanhamento de
            protocolos de peptídeos terapêuticos. Esta política descreve, em linguagem
            clara, como tratamos seus dados pessoais conforme a Lei Geral de Proteção de
            Dados (Lei 13.709/2018 — LGPD).
          </p>
        </Section>

        <Section title="2. Quais dados coletamos">
          <p>
            <strong>Dados de cadastro:</strong> nome, e-mail, senha (criptografada),
            método de autenticação (Google ou e-mail), data de criação da conta.
          </p>
          <p>
            <strong>Dados de saúde e perfil (sensíveis):</strong> respostas do diagnóstico
            (sexo, idade, peso, altura, objetivos, histórico de uso, sintomas, condições
            preexistentes, sono, atividade física, estresse), registros de aplicação,
            check-ins diários, fotos de evolução (se você decidir adicionar), anotações
            do diário.
          </p>
          <p>
            <strong>Dados de uso:</strong> páginas acessadas, ações realizadas, conversas
            com a IA, plano contratado, histórico de pagamentos.
          </p>
          <p>
            <strong>Dados técnicos:</strong> endereço IP, navegador, sistema operacional,
            cookies funcionais necessários para login e sessão.
          </p>
          <p>
            <strong>Dados de pagamento:</strong> processados exclusivamente pela Stripe.
            A Nuvita <strong>não armazena</strong> número de cartão, CVV ou validade.
            Recebemos apenas confirmação de cobrança e os 4 últimos dígitos para exibição.
          </p>
        </Section>

        <Section title="3. Por que coletamos cada dado (base legal)">
          <ul>
            <li>
              <strong>Cadastro e dados de uso</strong> — execução do contrato (art. 7º, V
              da LGPD): sem isso, não conseguimos entregar o serviço.
            </li>
            <li>
              <strong>Dados de saúde sensíveis</strong> — consentimento específico (art. 11,
              I): coletados apenas após você marcar o aceite explícito no diagnóstico.
            </li>
            <li>
              <strong>Pagamentos</strong> — execução do contrato (art. 7º, V).
            </li>
            <li>
              <strong>Dados técnicos e segurança</strong> — legítimo interesse (art. 7º,
              IX) para prevenir fraude e garantir disponibilidade.
            </li>
            <li>
              <strong>Comunicações de marketing</strong> — apenas com seu opt-in explícito,
              que você pode revogar a qualquer momento.
            </li>
          </ul>
        </Section>

        <Section title="4. Como usamos seus dados">
          <ul>
            <li>Gerar seu protocolo personalizado por IA</li>
            <li>Acompanhar sua evolução e enviar lembretes de aplicação</li>
            <li>Permitir que você consulte sua biblioteca, histórico e relatórios</li>
            <li>Processar pagamentos e emitir notas fiscais</li>
            <li>Enviar comunicações operacionais (confirmação de pagamento, alertas, etc.)</li>
            <li>Melhorar a plataforma com análises agregadas e anônimas</li>
            <li>Cumprir obrigações legais e responder a autoridades quando exigido</li>
          </ul>
        </Section>

        <Section title="5. Com quem compartilhamos">
          <p>
            Usamos serviços terceirizados estritamente necessários para operar a
            plataforma. Nenhum deles vende seus dados:
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> (banco de dados e autenticação) — infraestrutura
              hospedada na AWS
            </li>
            <li>
              <strong>Vercel</strong> (hospedagem da aplicação)
            </li>
            <li>
              <strong>Stripe</strong> (processamento de pagamentos) — certificada PCI-DSS
              Nível 1
            </li>
            <li>
              <strong>Anthropic</strong> (modelo de IA Claude que gera os protocolos) —
              dados enviados na consulta não são usados para treinar modelos
            </li>
          </ul>
          <p>
            Em hipótese alguma vendemos, alugamos ou cedemos seus dados pessoais a
            terceiros para fins de marketing.
          </p>
        </Section>

        <Section title="6. Por quanto tempo guardamos">
          <ul>
            <li>
              <strong>Conta ativa:</strong> enquanto você mantiver a conta na plataforma.
            </li>
            <li>
              <strong>Após exclusão da conta:</strong> dados pessoais e de saúde são
              eliminados em até 30 dias, exceto o mínimo exigido por lei (registros
              fiscais por 5 anos, conforme legislação tributária brasileira).
            </li>
            <li>
              <strong>Logs técnicos:</strong> retidos por até 6 meses para fins de
              segurança.
            </li>
          </ul>
        </Section>

        <Section title="7. Seus direitos (LGPD art. 18)">
          <p>A qualquer momento, você pode:</p>
          <ul>
            <li>Confirmar se tratamos seus dados</li>
            <li>Acessar e exportar todos os seus dados em formato legível</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
            <li>Solicitar anonimização, bloqueio ou eliminação</li>
            <li>Solicitar portabilidade para outro serviço</li>
            <li>Revogar consentimento a qualquer momento</li>
            <li>Obter informação sobre com quem compartilhamos</li>
          </ul>
          <p>
            A maioria dessas ações está disponível diretamente em <strong>Conta &gt; Zona
            de Perigo</strong>. Para outras solicitações, escreva para{' '}
            <a href="mailto:privacidade@nuvita.app" style={linkStyle}>privacidade@nuvita.app</a>.
            Respondemos em até 15 dias.
          </p>
        </Section>

        <Section title="8. Segurança">
          <ul>
            <li>Conexão criptografada em toda a plataforma (HTTPS/TLS 1.2+)</li>
            <li>Senhas armazenadas com hash forte (bcrypt) — nem a Nuvita vê sua senha</li>
            <li>Banco de dados com Row Level Security (RLS): cada usuário só acessa os próprios dados</li>
            <li>Backups criptografados</li>
            <li>Acesso interno restrito e auditado</li>
            <li>Pagamentos via gateway certificado PCI-DSS</li>
          </ul>
          <p>
            Em caso de incidente de segurança que possa causar risco relevante aos seus
            direitos, comunicaremos você e a ANPD em até 72 horas, conforme exige a LGPD.
          </p>
        </Section>

        <Section title="9. Cookies">
          <p>
            Usamos apenas <strong>cookies funcionais necessários</strong> para manter sua
            sessão logada. Não usamos cookies de publicidade ou rastreamento de terceiros.
            Caso adicionemos analytics no futuro, você será informado e poderá optar.
          </p>
        </Section>

        <Section title="10. Crianças e adolescentes">
          <p>
            A Nuvita é destinada exclusivamente a maiores de 18 anos. Não coletamos
            intencionalmente dados de menores. Se identificarmos uma conta de menor,
            ela será excluída imediatamente.
          </p>
        </Section>

        <Section title="11. Alterações nesta política">
          <p>
            Mudanças relevantes serão comunicadas por e-mail e/ou aviso na plataforma com
            pelo menos 15 dias de antecedência. A versão atualizada estará sempre
            disponível nesta página.
          </p>
        </Section>

        <Section title="12. Encarregado de Dados (DPO) e contato">
          <p>
            Para qualquer assunto relacionado a privacidade e proteção de dados, fale com
            nosso encarregado:{' '}
            <a href="mailto:privacidade@nuvita.app" style={linkStyle}>privacidade@nuvita.app</a>.
          </p>
          <p>
            Você também pode acionar a Autoridade Nacional de Proteção de Dados (ANPD)
            pelo site{' '}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" style={linkStyle}>
              gov.br/anpd
            </a>
            .
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
            <strong>Resumo:</strong> Coletamos só o necessário, criptografamos tudo, não
            vendemos seus dados. Você pode exportar ou apagar a qualquer momento. Pagamentos
            via Stripe — não guardamos cartão. Dúvidas:{' '}
            <a href="mailto:privacidade@nuvita.app" style={linkStyle}>privacidade@nuvita.app</a>.
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
