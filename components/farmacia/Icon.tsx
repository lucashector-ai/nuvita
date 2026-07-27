// ════════════════════════════════════════════════
//  NUVITA — components/farmacia/Icon.tsx
//  Ícones de linha, monocromáticos, na cor da marca.
//  Substituem os emojis do balcão.
// ════════════════════════════════════════════════

import type { CSSProperties } from 'react';

const PATHS: Record<string, string> = {
  // objetivos
  flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  dumbbell: 'M6.5 6.5v11M17.5 6.5v11M6.5 12h11M4 9v6M20 9v6',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
  moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
  bolt: 'M13 2 3 14h7l-1 8 10-12h-7z',
  focus: 'M12 2v3M12 19v3M2 12h3M19 12h3M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  flask: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8',
  // condições
  drop: 'M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z',
  heart: 'M20.8 6.6a5.5 5.5 0 0 0-7.8 0L12 7.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z',
  pulse: 'M22 12h-4l-3 9L9 3l-3 9H2',
  ribbon: 'M12 11.5 7.5 21l4.5-2.7L16.5 21 12 11.5zM12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z',
  person: 'M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 8c-2 0-3 1.5-3 4v3l1 6h4l1-6v-3c0-2.5-1-4-3-4z',
  pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  check: 'M20 6 9 17l-5-5',
  // gerais
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3',
  pill: 'M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7zM8.5 8.5l7 7',
  bulb: 'M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2zM9 18h6M10 22h4',
  clipboard: 'M9 4V3h6v1h2a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2zM9 4h6',
  fork: 'M5 3v6a2 2 0 0 0 2 2h0V3M7 3v18M18 3c-2 0-3 2-3 5s1 4 3 4v9',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
};

export default function Icon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  const d = PATHS[name] || PATHS.pill;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
