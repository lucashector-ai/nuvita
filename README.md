# Nuvita — Next.js + TypeScript

Projeto migrado de HTML/CSS/JS vanilla para **Next.js 14** com App Router e TypeScript.

---

## Estrutura de pastas

```
nuvita/
├── app/
│   ├── layout.tsx              # Layout raiz (fontes, meta)
│   ├── page.tsx                # Redireciona → /diagnostico
│   ├── diagnostico/page.tsx    # Quiz de diagnóstico
│   ├── revisao/page.tsx        # Revisão de protocolo
│   └── dashboard/page.tsx      # Dashboard do usuário
│
├── components/
│   ├── ui/
│   │   └── NuvitaLogo.tsx      # Logo SVG como componente
│   ├── quiz/
│   │   ├── QuizShell.tsx       # Orquestrador do quiz
│   │   ├── QuizNav.tsx         # Barra de navegação + progresso
│   │   ├── RevisaoShell.tsx    # Fluxo de revisão peptídeo a peptídeo
│   │   └── screens/
│   │       ├── ScreenWelcome.tsx
│   │       ├── QuizScreens.tsx  # Q1–Q11 (ScreenNome … ScreenBiometria)
│   │       ├── ScreenResultado.tsx
│   │       └── ScreenPricing.tsx
│   ├── dashboard/
│   │   ├── DashboardShell.tsx  # Orquestrador do dashboard
│   │   ├── Sidebar.tsx
│   │   ├── DashboardNav.tsx
│   │   └── sections/
│   │       ├── SectionInicio.tsx
│   │       └── DashSections.tsx # Protocolo, IA, Calc, Lib, Config
│   └── modals/
│       └── EmailModal.tsx       # Modal e-mail + código de verificação
│
├── lib/
│   ├── peptides.ts             # Base de dados + buildProtocol()
│   ├── session.ts              # Persistência no localStorage
│   └── useQuiz.ts              # Hook de estado do quiz
│
├── styles/
│   └── globals.css             # Todos os CSS variables + classes
│
├── types/
│   └── index.ts                # Tipos TypeScript centrais
│
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Instalação e uso

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev
# → http://localhost:3000

# 3. Build de produção
npm run build && npm start
```

---

## Rotas

| URL           | Descrição                              |
|---------------|----------------------------------------|
| `/`           | Redireciona → `/diagnostico`           |
| `/diagnostico`| Quiz de 10 perguntas                   |
| `/revisao`    | Revisão peptídeo a peptídeo            |
| `/dashboard`  | Dashboard (requer sessão)              |

---

## Integração com a API Anthropic

A IA Nuvita (chat) e a justificativa de revisão usam `fetch` direto para
`https://api.anthropic.com/v1/messages`.

> ⚠️ **Em produção**, mova as chamadas para uma **API Route** do Next.js
> (`app/api/ai/route.ts`) para não expor a chave no browser:

```ts
// app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res  = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json());
}
```

E nas componentes, chame `/api/ai` em vez da URL da Anthropic.

---

## Variáveis de ambiente (`.env.local`)

```env
ANTHROPIC_API_KEY=sk-ant-...
```

---

## O que foi migrado

| Original (vanilla JS)       | Next.js (React + TS)                     |
|-----------------------------|------------------------------------------|
| Objeto global `A = {}`      | `useQuiz()` hook com `useState`          |
| `nx()` / `pv()` / `gt()`    | `next()` / `prev()` / `goTo()` no hook  |
| `localStorage` bruto        | `lib/session.ts` com helpers tipados     |
| CSS inline de 700 linhas    | `styles/globals.css` organizado          |
| JS DOM manipulation         | Componentes React declarativos           |
| Roteamento manual (pushState)| Next.js App Router file-based routing   |
| `PEPTIDES[]` inline         | `lib/peptides.ts` exportado e tipado     |
| `buildProtocol()` global    | Função pura exportada e testável         |
