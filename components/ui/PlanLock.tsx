// @ts-nocheck
'use client';

interface Props {
  planoNecessario: 'essencial' | 'pro';
  recurso: string;
  descricao?: string;
  children: React.ReactNode;
  planoAtual: string;
}

const PLANO_INFO = {
  essencial: {
    cor: '#1D9E75', bg: '#E1F5EE', label: 'Essencial',
    preco: 'R$39/mês',
    emoji: '⚡',
    features: ['Tracker ilimitado', 'Diário de sintomas', 'Coach IA', 'Estoque e rotina', 'Detector de inconsistência'],
  },
  pro: {
    cor: '#7F77DD', bg: '#EEEDFE', label: 'Pro',
    preco: 'R$79/mês',
    emoji: '✦',
    features: ['Consulta médica especializada', 'Revisão do protocolo por médico', 'Ajustes personalizados', 'Suporte prioritário'],
  },
};

const PLANO_ORDEM = { free: 0, essencial: 1, pro: 2 };

export default function PlanLock({ planoNecessario, recurso, descricao, children, planoAtual }: Props) {
  const ordemAtual    = PLANO_ORDEM[planoAtual as keyof typeof PLANO_ORDEM] ?? 0;
  const ordemNecessario = PLANO_ORDEM[planoNecessario];
  const temAcesso     = ordemAtual >= ordemNecessario;

  if (temAcesso) return <>{children}</>;

  const info = PLANO_INFO[planoNecessario];

  return (
    <div>
      {/* Preview borrado do conteúdo */}
      <div style={{ position:'relative', borderRadius:14, overflow:'hidden' }}>
        <div style={{ filter:'blur(6px)', opacity:.4, pointerEvents:'none', userSelect:'none', maxHeight:320, overflow:'hidden' }}>
          {children}
        </div>
        {/* Overlay de lock */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(to bottom, rgba(var(--bg-rgb,255,255,255),.3) 0%, rgba(var(--bg-rgb,255,255,255),.95) 60%)' }}>
          <div style={{ textAlign:'center', padding:'2rem', maxWidth:420 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:info.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', margin:'0 auto 1rem' }}>
              🔒
            </div>
            <h3 style={{ fontSize:'1.1rem', fontWeight:500, color:'var(--tx)', marginBottom:'.5rem', letterSpacing:'-.03em' }}>
              {recurso}
            </h3>
            <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.65, marginBottom:'1.25rem' }}>
              {descricao || `Este recurso está disponível a partir do plano ${info.label}.`}
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:'1.25rem', textAlign:'left', maxWidth:260, margin:'0 auto 1.25rem' }}>
              {info.features.map(f => (
                <div key={f} style={{ display:'flex', gap:7, fontSize:12, color:'var(--tm)' }}>
                  <span style={{ color:info.cor, flexShrink:0 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('nuvita:openPlanos'))}
              style={{ padding:'11px 24px', background:info.cor, border:'none', borderRadius:10, color:'white', fontFamily:'inherit', fontSize:13, fontWeight:500, cursor:'pointer', transition:'opacity .15s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='.88'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              {info.emoji} Assinar {info.label} — {info.preco}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
