// ════════════════════════════════════════════════
//  NUVITA — app/page.tsx
//  Página raiz: redireciona para /diagnostico
// ════════════════════════════════════════════════

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/diagnostico');
}
