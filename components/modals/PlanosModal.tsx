// @ts-nocheck
'use client';

interface Props {
  onClose: () => void;
  onSelect?: (plano: string) => void;
  planoAtual?: string;
}

const PLANOS = [
  {
    id: 'free',
    nome: 'Gratuito',
    preco: 'R$0',
    periodo: 'para sempre',
    cor: '#888780',
    features: [
      'Diagnóstico completo por IA',
      'Protocolo personalizado',
      'Biblioteca de peptídeos',
      'Calculadora de doses',
      '1 ciclo de acompanhamento',
    ],
    limitacoes: ['Sem tracker avançado', 'Sem Coach IA', 'Sem suporte médico'],
    cta: 'Plano atual',
    destaque: false,
  },
  {
    id: 'essencial',
    nome: 'Essencial',
    preco: 'R$39',
    periodo: '/mês',
    cor: '#1D9E75',
    features: [
      'Tudo do plano Gratuito',
      'Tracker ilimitado (peso, energia, sono)',
      'Diário de sintomas',
      'Coach IA pessoal',
      'Detector de inconsistência',
      'Rotina complementar',
      'Controle de estoque',
      'Exportação do protocolo',
    ],
    limitacoes: ['Sem consulta médica'],
    cta: 'Assinar Essencial',
    destaque: false,
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 'R$79',
    periodo: '/mês',
    cor: '#7F77DD',
    features: [
      'Tudo do plano Essencial',
      'Consulta médica especializada',
      'Revisão do protocolo por médico',
      'Ajustes personalizados',
      'Suporte prioritário',
      'Acesso a novos peptídeos em beta',
    ],
    limitacoes: [],
    cta: 'Assinar Pro',
    destaque: true,
  },
];

export default function PlanosModal({ onClose, onSelect, planoAtual = 'free' }: Props) {
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className='planos-modal-inner' style={{ background:'#F7F7F7', borderRadius:20, padding:'1.5rem', maxWidth:780, width:'calc(100% - 2rem)', maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.375rem' }}>Escolha seu plano</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>Cancele a qualquer momento · Sem taxas ocultas</p>
        </div>

        <div style={{ display:'grid', gap:12, marginBottom:'1.25rem' }}>
          {PLANOS.map(p => {
            const isAtual = p.id === planoAtual;
            return (
              <div key={p.id} style={{ background: p.destaque ? 'var(--dark)' : 'var(--bg2)', border:`2px solid ${p.destaque ? 'var(--dark)' : isAtual ? p.cor : 'var(--border)'}`, borderRadius:16, padding:'1.25rem', position:'relative', display:'flex', flexDirection:'column' }}>
                {p.destaque && (
                  <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'#7F77DD', color:'white', fontSize:10, fontWeight:600, padding:'3px 12px', borderRadius:100, whiteSpace:'nowrap' }}>
                    MAIS POPULAR
                  </div>
                )}
                <div style={{ marginBottom:'1rem' }}>
                  <div style={{ fontSize:14, fontWeight:500, color: p.destaque ? 'white' : 'var(--tx)', marginBottom:4 }}>{p.nome}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
                    <span style={{ fontSize:'1.8rem', fontWeight:500, letterSpacing:'-.04em', color: p.destaque ? 'white' : 'var(--tx)' }}>{p.preco}</span>
                    <span style={{ fontSize:12, color: p.destaque ? 'rgba(255,255,255,.6)' : 'var(--ts)' }}>{p.periodo}</span>
                  </div>
                </div>

                <div style={{ flex:1, marginBottom:'1rem' }}>
                  {p.features.map((f,i) => (
                    <div key={i} style={{ display:'flex', gap:7, fontSize:12, color: p.destaque ? 'rgba(255,255,255,.85)' : 'var(--tm)', marginBottom:6, alignItems:'flex-start' }}>
                      <span style={{ color: p.destaque ? '#5EC991' : p.cor, flexShrink:0, marginTop:1 }}>✓</span>
                      {f}
                    </div>
                  ))}
                  {p.limitacoes.map((l,i) => (
                    <div key={i} style={{ display:'flex', gap:7, fontSize:11, color: p.destaque ? 'rgba(255,255,255,.35)' : 'var(--ts)', marginBottom:5, alignItems:'flex-start' }}>
                      <span style={{ flexShrink:0 }}>—</span>
                      {l}
                    </div>
                  ))}
                </div>

                <button
                  disabled={isAtual}
                  onClick={() => { if (!isAtual && onSelect) { onSelect(p.id); onClose(); } }}
                  style={{ width:'100%', padding:'10px', borderRadius:10, border:'none', cursor: isAtual ? 'default' : 'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, transition:'all .15s', background: isAtual ? 'rgba(128,128,128,.2)' : p.destaque ? '#7F77DD' : p.cor, color: isAtual ? 'var(--ts)' : 'white' }}>
                  {isAtual ? 'Plano atual' : p.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign:'center', fontSize:11, color:'var(--ts)', lineHeight:1.6 }}>
          Pagamento seguro · Cancele a qualquer momento · Dados protegidos pela LGPD
        </div>

        <button onClick={onClose} style={{ display:'block', margin:'1rem auto 0', background:'none', border:'none', fontSize:13, color:'var(--ts)', cursor:'pointer', fontFamily:'inherit' }}>
          Fechar
        </button>
      </div>
    </div>
  );
}
