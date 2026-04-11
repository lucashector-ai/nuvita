# Nuvita — Auditoria e Hardening de Segurança

Data: 2026-04-11

Documento que resume a auditoria de segurança feita no projeto e todas as
correções aplicadas. Use-o como checklist para o deploy em produção.

---

## 1. Vulnerabilidades CRÍTICAS encontradas e corrigidas

### 1.1 Token de admin exposto no bundle do cliente
**Severidade:** Crítica · **CVSS estimado:** 9.8

Antes:
```ts
// app/admin/page.tsx
const TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'nuvita_admin_2026';
```
A constante era enviada como header `token` no body para `/api/admin`. O
prefixo `NEXT_PUBLIC_*` faz o Next.js **embutir** o valor no bundle JavaScript
do cliente — qualquer visitante poderia ler o token e ganhar acesso completo
ao painel admin (listar/excluir usuários, alterar planos, enviar push).

Pior ainda: o fallback `nuvita_admin_2026` ficava hardcoded no código, o que
significa que mesmo sem env var configurada o sistema "funcionava" com um
segredo estático conhecido.

Mesmo problema em [app/medico-admin/page.tsx](app/medico-admin/page.tsx) com
`NEXT_PUBLIC_MEDICO_TOKEN`.

**Correção:**
- Removido o uso de `NEXT_PUBLIC_ADMIN_TOKEN` / `NEXT_PUBLIC_MEDICO_TOKEN`.
- [app/api/admin/route.ts](app/api/admin/route.ts) agora aceita autorização
  via:
  1. **Sessão Supabase** + email na allowlist `ADMIN_EMAILS` (preferido), OU
  2. Header `x-admin-token` comparado com `ADMIN_TOKEN` server-only via
     `timingSafeEqual` (constant-time, anti-timing-attack).
- A página `/admin` agora valida o token contra o servidor antes de aceitar
  o login. O token só vive em `sessionStorage` depois de confirmado.
- Rate limit por IP (30 req/min) para impedir brute-force.
- Validação de planos contra allowlist (`free`/`essencial`/`pro`) — antes
  era possível setar qualquer string em `plano`.

---

### 1.2 `/api/email` open relay (spam / phishing)
**Severidade:** Crítica · **CVSS estimado:** 9.1

[app/api/email/route.ts](app/api/email/route.ts) aceitava `tipo`, `email` e
`dados` arbitrários **sem nenhuma autenticação**. Qualquer um na internet
podia disparar emails da `RESEND_API_KEY` da Nuvita para qualquer endereço:

- Spam em massa via infra Nuvita (queima reputação do domínio).
- Phishing convincente: emails legítimos vindos de `noreply@nuvita.app` com
  os templates da própria Nuvita.

**Correção:**
- Auth obrigatória via `getUserFromRequest` (Bearer token Supabase).
- Templates "internos" (`pagamento-confirmado`, `cancelamento`,
  `renovacao-lembrete`, etc.) só podem ser disparados via header
  `x-internal-secret = INTERNAL_API_SECRET`. O webhook do Stripe foi
  atualizado para enviar esse header.
- Usuário autenticado só pode mandar email para o **próprio endereço**
  (compara `user.email` com `to` em lowercase).
- Rate limit: 10 emails/min por IP.

---

### 1.3 `/api/notify` open relay (mesmo problema)
**Severidade:** Crítica · **CVSS estimado:** 9.1

[app/api/notify/route.ts](app/api/notify/route.ts) tinha o mesmo vetor de
spam/phishing.

**Correção:** mesmo padrão (auth obrigatória, internal-secret, escopo do
próprio email, rate limit). Valores de `nome`/`peptideo`/`dias` agora são
sanitizados (HTML strip + truncate) para mitigar HTML injection nos
templates.

---

### 1.4 `/api/stripe`, `/api/stripe/faturas` — IDOR (vazamento de dados de cobrança)
**Severidade:** Crítica · **CVSS estimado:** 8.6

[app/api/stripe/route.ts](app/api/stripe/route.ts) e
[app/api/stripe/faturas/route.ts](app/api/stripe/faturas/route.ts)
recebiam `userId` no body **sem validar autoria**. Qualquer um que
soubesse/adivinhasse o UUID de outro usuário podia:

- Abrir o portal Stripe da vítima e cancelar/alterar assinaturas.
- Listar todas as faturas (valores, períodos, links de PDF).

**Correção:** `userId` foi removido do body. Ambos os endpoints derivam o
user de `getUserFromRequest`. Rate-limited.

---

### 1.5 `/api/pagamento` — checkout em nome de terceiros
**Severidade:** Alta · **CVSS estimado:** 7.5

Aceitava `userId` e `email` arbitrários no body, então um atacante podia
criar checkouts pagando o upgrade de outra conta (ou poluir métricas).

**Correção:** `userId` e `email` agora vêm da sessão. Validação estrita do
campo `plano` contra allowlist.

---

### 1.6 `/api/compartilhar` — token previsível + escrita em conta alheia
**Severidade:** Alta · **CVSS estimado:** 8.1

Dois bugs:
1. Aceitava `userId` arbitrário e sobrescrevia `_shareToken` no diagnóstico.
2. Token derivado de `base64(userId:timestamp).slice(0,16)` — previsível
   conhecendo o userId e a janela de tempo.

**Correção:**
- `userId` derivado do token Supabase.
- Token agora é `crypto.randomBytes(24).toString('base64url')` — 192 bits
  de entropia criptográfica.
- Validação de formato do token no GET (regex + tamanho).

---

### 1.7 `/api/push` — escrita em config alheia
**Severidade:** Alta · **CVSS estimado:** 7.5

Aceitava `userId` no body sem auth. Qualquer um podia sobrescrever a
configuração de push de qualquer usuário (DoS de notificações ou
hijacking de subscriptions).

**Correção:** auth obrigatória, `user_id` derivado do token.

---

### 1.8 `/api/delete-account` — quebrado/inseguro
**Severidade:** Alta · **CVSS estimado:** 7.0

Tentava ler `auth.getUser()` em um cliente Supabase recém-criado no servidor
(que nunca tem sessão), sempre retornando `null` ou comportamento
inconsistente. Se chegasse a executar, deletava sem garantia de autoria.

**Correção:** auth real via Bearer token; deleta cascata em todas as
tabelas conhecidas; rate limit.

---

### 1.9 `/api/chat` e `/api/ia` — DoS / queima da chave Anthropic
**Severidade:** Alta · **CVSS estimado:** 7.5

Endpoints públicos sem auth, sem rate limit, sem limites de payload. Um
atacante podia hammerar a chave Anthropic gerando milhares de dólares em
custo (financial DoS) ou travar o serviço.

**Correção:**
- Auth obrigatória.
- Rate limit por usuário (15/min em `/api/chat`, 20/min em `/api/ia`).
- `MAX_MESSAGES = 30` e `MAX_CHARS_TOTAL = 20.000`.
- Erros não vazam mais detalhes internos para o cliente.

---

## 2. Hardening adicional

### 2.1 Headers de segurança ([next.config.js](next.config.js))
Adicionados:

| Header | Valor | Por que |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'` + allowlist | Mitiga XSS e exfiltração |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Força HTTPS |
| `X-Content-Type-Options` | `nosniff` | Anti MIME-sniff |
| `X-Frame-Options` | `DENY` | Anti-clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Reduz vazamento de URL |
| `Permissions-Policy` | desliga câmera/mic/geo/FLoC | Reduz superfície |
| `X-Permitted-Cross-Domain-Policies` | `none` | Adobe legacy |
| `Cache-Control` (em /api/*) | `no-store` | Impede cache de respostas auth |
| `poweredByHeader` | desabilitado | Esconde stack |

### 2.2 Rate limiting ([lib/rateLimit.ts](lib/rateLimit.ts))
Sliding window simples em memória aplicado em todas as rotas sensíveis.
Para escala alta, mover para Upstash/Redis.

### 2.3 RLS no Supabase ([supabase_security_rls.sql](supabase_security_rls.sql))
Habilita RLS e cria policies em **todas** as tabelas com dados de usuário:

- `usuarios`, `agendamentos`, `notificacoes`, `notificacoes_config`,
  `diario_entries`, `estoque_usuario`, `estoque_items`,
  `rotina_personalizada`, `check_ins`, `adesao_diaria`, `pagamentos`,
  `tracker_entries`.
- Padrão: `auth.uid() = user_id` para SELECT/INSERT/UPDATE/DELETE.
- **Trigger** que impede o usuário de alterar a coluna `plano` diretamente
  (defesa em profundidade — só o webhook Stripe via service_role pode mudar).
- `peptideos` e `disponibilidade_*` ficam read-only para todos os clientes
  (escrita só via service_role).

> **Rodar este SQL é OBRIGATÓRIO** para que as correções do código fiquem
> completas. Sem RLS habilitada, qualquer atacante com a anon key (que é
> pública por design) pode ler/escrever qualquer linha das tabelas.

### 2.4 Comparações de segredo constant-time
[lib/serverAuth.ts](lib/serverAuth.ts) usa `crypto.timingSafeEqual` em toda
comparação de tokens. Evita ataques de timing.

### 2.5 Sanitização básica
- Templates de notificação removem `< >` e truncam valores controlados pelo
  usuário (anti-HTML-injection).
- Validação de tipos de input em todas as rotas refatoradas.

---

## 3. O que VOCÊ precisa fazer antes do deploy

### 3.1 Variáveis de ambiente (Vercel → Settings → Environment Variables)
Veja [.env.example](.env.example). Variáveis novas / obrigatórias:

```bash
# Gerar com: openssl rand -hex 32
ADMIN_TOKEN=...
INTERNAL_API_SECRET=...

# Lista de admins via Supabase auth
ADMIN_EMAILS=fundador@nuvita.app,ops@nuvita.app
```

E **REMOVER** da Vercel:
```
NEXT_PUBLIC_ADMIN_TOKEN
NEXT_PUBLIC_MEDICO_TOKEN
```

### 3.2 Rodar o SQL de RLS
No SQL editor do Supabase, executar [supabase_security_rls.sql](supabase_security_rls.sql)
**uma vez**. Verificar com:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
```
Todas as tabelas com `user_id` devem ter `rowsecurity = true`.

### 3.3 Rotacionar segredos comprometidos
Como o token `nuvita_admin_2026` esteve hardcoded no código por algum tempo
(e provavelmente foi commitado), assuma que está comprometido. Igualmente
para `nuvita_medico_2026`. Gere novos com `openssl rand -hex 32`.

Se a chave Anthropic, Stripe ou Resend já foi exposta em algum bundle de
produção (porque endpoints sem auth podiam ser abusados), considere
rotacionar todas elas também.

### 3.4 Limpar `.env.local` do disco se for compartilhar a máquina
[.env.local](.env.local) contém um `VERCEL_OIDC_TOKEN` válido. Está no
`.gitignore` (não vai pro Git), mas vaza se a pasta for compartilhada.

### 3.5 Migrar painel médico (TODO)
[app/medico-admin/page.tsx](app/medico-admin/page.tsx) ainda usa o cliente
Supabase anônimo direto para ler/escrever `agendamentos` e
`disponibilidade_semanal`. Como a anon key é pública, a única defesa
é a RLS aplicada pelo SQL acima.

Para isolar totalmente, criar uma rota `/api/medico/*` que valida o token
server-side (igual `/api/admin`) e centralizar todas as operações por lá.

---

## 4. Mudanças no contrato das APIs

Estas mudanças quebram chamadas antigas — **todas** as chamadas client-side
do código já foram atualizadas para usar `apiFetch` de
[lib/apiClient.ts](lib/apiClient.ts), que injeta o `Authorization: Bearer`
automaticamente.

| Rota | Antes | Depois |
|---|---|---|
| `/api/admin` | `body.token` | header `x-admin-token` OU sessão admin |
| `/api/stripe` | `body.userId` | derivado do Bearer token |
| `/api/stripe/faturas` | `body.userId` | derivado do Bearer token |
| `/api/pagamento` | `body.userId/email` | derivados do Bearer token |
| `/api/compartilhar` POST | `body.userId` | derivado do Bearer token |
| `/api/push` | `body.userId` | derivado do Bearer token |
| `/api/delete-account` | quebrado | DELETE com Bearer token |
| `/api/email` | público | Bearer token OU `x-internal-secret` |
| `/api/notify` | público | Bearer token OU `x-internal-secret` |
| `/api/chat`, `/api/ia` | público | Bearer token + rate limit |

---

## 5. Roadmap de melhorias futuras (não-bloqueantes)

- [ ] Mover rate limit para Upstash Redis (multi-instance)
- [ ] Adicionar 2FA no painel admin (Supabase suporta TOTP nativamente)
- [ ] Audit log: gravar em `audit_log` cada ação admin sensível
- [ ] CSP mais estrito (remover `'unsafe-inline'` de scripts via nonce)
- [ ] Migrar painel médico para rota `/api/medico` server-only
- [ ] Pen-test externo após o deploy das correções
- [ ] Configurar Sentry/Datadog para detectar 401/429 anômalos
- [ ] Setup de backup automático do Postgres + teste de restore

---

## 6. Arquivos novos criados

- [lib/serverAuth.ts](lib/serverAuth.ts) — auth server-side, allowlist admin, segredos constant-time
- [lib/rateLimit.ts](lib/rateLimit.ts) — rate limiter em memória
- [lib/apiClient.ts](lib/apiClient.ts) — fetch client-side com Bearer auto
- [supabase_security_rls.sql](supabase_security_rls.sql) — RLS completa
- [.env.example](.env.example) — variáveis documentadas
- [SECURITY.md](SECURITY.md) — este documento
