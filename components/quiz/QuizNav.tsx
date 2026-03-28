// ════════════════════════════════════════════════
//  NUVITA — components/quiz/QuizNav.tsx
//  Barra de navegação superior do quiz
// ════════════════════════════════════════════════

'use client';

import NuvitaLogo from '@/components/ui/NuvitaLogo';

interface Props {
  progress: number;    // 0–100
  onReset: () => void;
}

export default function QuizNav({ progress, onReset }: Props) {
  return (
    <nav className="q-nav">
      <div className="q-nav-in">
        <NuvitaLogo />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--ts)',
              letterSpacing: '.02em',
            }}
          >
            Diagnóstico
          </span>
          <button
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ts)',
              fontSize: 12,
              fontWeight: 500,
              padding: '4px 8px',
              borderRadius: 8,
            }}
            title="Recomeçar"
          >
            ↩ Reiniciar
          </button>
        </div>
      </div>
      {/* Barra de progresso */}
      <div className="qpb-wrap">
        <div className="qpb" style={{ width: `${progress}%` }} />
      </div>
    </nav>
  );
}
