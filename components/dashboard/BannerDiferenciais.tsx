// @ts-nocheck
'use client';

const DIFERENCIAIS = [
  {
    ico: '🤖',
    titulo: 'Protocolo por IA',
    desc: 'Seu protocolo é gerado por IA com base no seu perfil, objetivos e biometria — não é genérico.',
    badge: 'Exclusivo Nuvita',
    cor: '#1D9E75', bg: '#E1F5EE',
  },
  {
    ico: '📊',
    titulo: 'Tracker integrado',
    desc: 'Registre adesão diária, sintomas e evolução. A plataforma aprende com seus dados ao longo do tempo.',
    badge: 'Essencial+',
    cor: '#378ADD', bg: '#E6F1FB',
  },
  {
    ico: '👨‍⚕️',
    titulo: 'Consulta médica integrada',
    desc: 'Médico especialista revisa seu protocolo dentro da plataforma. Sem precisar buscar fora.',
    badge: 'Pro',
    cor: '#7F77DD', bg: '#EEEDFE',
  },
  {
    ico: '📅',
    titulo: 'Cronograma personalizado',
    desc: 'Calendário gerado com base no seu protocolo exato — fases, marcos e ajustes automáticos.',
    badge: 'Exclusivo Nuvita',
    cor: '#EF9F27', bg: '#FAEEDA',
  },
];

interface Props {
  plan: string;
  onNavigate: (s: string) => void;
}

export default function BannerDiferenciais({ plan, onNavigate }: Props) {
  if (plan === 'pro') return null; // Pro já tem tudo

  return (
    <div style={{ gridColumn: '1/-1', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--gm)', marginBottom: 4 }}>
            ⚡ Por que a Nuvita é diferente
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--tx)' }}>
            Não somos só uma enciclopédia — somos seu acompanhamento completo
          </div>
        </div>
        <button
          onClick={() => onNavigate('planos')}
          style={{ padding: '8px 16px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
          Ver planos →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        {DIFERENCIAIS.map((d, i) => (
          <div key={i} style={{ background: d.bg, borderRadius: 12, padding: '1rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{d.ico}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: d.cor, marginBottom: 4 }}>{d.titulo}</div>
            <div style={{ fontSize: 11, color: d.cor, lineHeight: 1.6, opacity: 0.85 }}>{d.desc}</div>
            <div style={{ marginTop: 8, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', padding: '2px 7px', borderRadius: 100, background: d.cor, color: 'white', display: 'inline-block' }}>
              {d.badge}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
