'use client';

import NuvitaLogo from '@/components/ui/NuvitaLogo';

interface Props {
  onNext: () => void;
}

export default function ScreenWelcome({ onNext }: Props) {
  return (
    <div className="grad" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ borderBottom: '1px solid rgba(232,232,232,0.5)', background: 'transparent' }}>
        <div className="q-nav-in">
          <NuvitaLogo />
          <div className="pill">
            <div className="pdot" />
            Diagnóstico personalizado
          </div>
        </div>
      </nav>
      <div className="q-body" style={{ flex: 1 }}>
        <div className="w-grid">
          <div>
            <h1 style={{ fontSize: 'clamp(2.4rem,5vw,3.4rem)', letterSpacing: '-.05em', lineHeight: 1.04, marginBottom: '1rem' }}>
              Protocolos com clareza e método para todos.
            </h1>
            <p style={{ fontSize: 16, color: 'var(--tm)', lineHeight: 1.7, marginBottom: '2rem', letterSpacing: '-.02em', maxWidth: 440 }}>
              10 perguntas para montar um protocolo real de peptídeos adaptado ao seu perfil e objetivos.
            </p>
            <div style={{ display: 'flex', gap: '.875rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--ts)' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="2" y="4" width="10" height="8" rx="1.5" stroke="#9EA8A6" strokeWidth="1.2"/><path d="M5 4V3a2 2 0 014 0v1" stroke="#9EA8A6" strokeWidth="1.2"/></svg>
                Dados seguros
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--ts)' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" stroke="#9EA8A6" strokeWidth="1.2"/><path d="M7 4v3.5L9 9" stroke="#9EA8A6" strokeWidth="1.2" strokeLinecap="round"/></svg>
                ~4 minutos
              </span>
            </div>
            <button className="btn btn-d" onClick={onNext}>Iniciar diagnóstico</button>
          </div>
          <div>
            <div className="w-stat-row">
              <div className="w-stat"><div className="wsv">10</div><div className="wsl">Perguntas</div></div>
              <div className="w-stat"><div className="wsv">4min</div><div className="wsl">Duração</div></div>
              <div className="w-stat"><div className="wsv">100%</div><div className="wsl">Seu perfil</div></div>
            </div>
            <div className="w-steps">
              {['Responda sobre seu perfil e objetivos','Veja seu protocolo real personalizado','Veja seu protocolo atualizado','Continue acompanhando seu ciclo com IA'].map((s, i) => (
                <div className="wsi" key={i}><div className="wsin">{i + 1}</div>{s}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
