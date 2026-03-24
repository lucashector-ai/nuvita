# Nuvita — Plataforma de Peptídeos

Diagnóstico personalizado de peptídeos, dashboard de acompanhamento e IA.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Anthropic API** (Claude Sonnet para IA e revisão)

## Estrutura

```
src/
├── app/
│   ├── diagnostico/     # Quiz de 10 perguntas + resultado + planos
│   ├── revisao/         # Revisão peptídeo a peptídeo com IA
│   └── dashboard/       # Dashboard com sidebar, protocolo, IA chat
├── components/
│   ├── ui/              # Button, Input, Modal, Badge, Logo
│   ├── quiz/            # QuizNav, QuizOption, MultiSelectOption, ScaleButton
│   └── layout/          # Sidebar
├── hooks/
│   └── useSession.ts    # Sessão com localStorage
├── lib/
│   └── peptides.ts      # Banco de peptídeos + buildProtocol()
└── types/
    └── index.ts         # Tipos TypeScript
```

## Rotas

| URL | Descrição |
|-----|-----------|
| `/diagnostico` | Quiz completo (10 perguntas → resultado → planos) |
| `/revisao` | Revisão do protocolo peptídeo a peptídeo |
| `/dashboard` | Dashboard de acompanhamento |

## Deploy

1. Fork este repositório
2. Crie um projeto no [Vercel](https://vercel.com)
3. Conecte ao repositório
4. Deploy automático a cada push na `main`

## Desenvolvimento local

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).
