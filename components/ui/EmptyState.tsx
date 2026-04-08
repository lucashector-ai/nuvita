// @ts-nocheck
'use client';

interface EmptyStateProps {
  icon: string;
  titulo: string;
  descricao: string;
  acao?: string;
  onAcao?: () => void;
}

export function EmptyState({ icon, titulo, descricao, acao, onAcao }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 48, marginBottom: 4 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-.02em' }}>{titulo}</h3>
      <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0, maxWidth: 320, lineHeight: 1.65 }}>{descricao}</p>
      {acao && onAcao && (
        <button onClick={onAcao} style={{ marginTop: 8, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#111827', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {acao}
        </button>
      )}
    </div>
  );
}
