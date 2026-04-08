// @ts-nocheck
'use client';

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style = {} }: any) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.5s infinite',
      ...style,
    }}/>
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)', marginBottom: '1rem' }}>
      <style>{`@keyframes skeleton-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
      <Skeleton height={14} width="40%" style={{ marginBottom: 16 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <Skeleton height={13} width={`${70 + Math.random() * 25}%`} style={{ marginBottom: 6 }} />
          {i < rows - 1 && <Skeleton height={1} style={{ background: '#F3F4F6' }} />}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div>
      <style>{`@keyframes skeleton-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
      {/* Hero card */}
      <div style={{ background: 'white', borderRadius: 14, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <Skeleton height={12} width="25%" style={{ marginBottom: 10 }} />
        <Skeleton height={22} width="55%" style={{ marginBottom: 8 }} />
        <Skeleton height={12} width="40%" />
      </div>
      {/* Ações card */}
      <div style={{ background: 'white', borderRadius: 14, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <Skeleton height={12} width="30%" style={{ marginBottom: 16 }} />
        {[1,2].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <Skeleton width={28} height={28} borderRadius="50%" />
            <div style={{ flex: 1 }}>
              <Skeleton height={13} width="60%" style={{ marginBottom: 4 }} />
              <Skeleton height={11} width="40%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
