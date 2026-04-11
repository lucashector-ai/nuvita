# Nuvita — Auditoria e Hardening de Segurança

Data: 2026-04-11 (rev. 2)

Documento que resume a auditoria de segurança feita no projeto e todas as
correções aplicadas. Use-o como checklist para o deploy em produção.

> **Rev. 2:** Após a primeira rodada de fixes, fiz uma segunda auditoria
> e encontrei **mais 5 vulnerabilidades críticas de billing-bypass** que
> permitiriam a qualquer usuário se auto-promover ao plano Pro sem pagar.
> Veja a seção "Achados da rev. 2" abaixo.

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

## 1.bis Achados da rev. 2 — Billing bypass / escalação de plano

Toda a primeira rodada protegeu as **rotas de API**. Mas a app também
escreve direto na tabela `usuarios` via cliente Supabase anônimo (RLS é a
única defesa nesse caminho). Encontrei 5 caminhos onde o cliente
controlava a coluna `plano`:

### 1.bis.1 `/pagamento/sucesso?plano=pro&userId=X` — upgrade grátis via URL
**Severidade:** Crítica · **CVSS estimado:** 9.4

[app/pagamento/sucesso/page.tsx](app/pagamento/sucesso/page.tsx) lia
`plano` e `userId` da query string e fazia
`supabase.from("usuarios").update({ plano }).eq("id", userId)`. Bastava
visitar a URL com `?plano=pro&userId=<seu-uuid>` para virar Pro sem pagar
um centavo. (Pior: a página é pública, não exige sequer estar logado para
chamar o update — depende só da RLS.)

**Correção:** removida toda a lógica de update do banco. A página agora
só mostra o feedback visual e redireciona. O plano só muda via webhook do
Stripe (que valida HMAC com `STRIPE_WEBHOOK_SECRET`).

### 1.bis.2 `lib/auth.ts → salvarDiagnostico` — escalação na hierarquia
**Severidade:** Crítica · **CVSS estimado:** 9.1

```ts
const RANK = { free: 0, essencial: 1, pro: 2 };
const planoFinal = (RANK[novoPlano] || 0) >= (RANK[planoAtual] || 0)
  ? novoPlano
  : planoAtual;
```

A função aceitava qualquer `plano`/`_activePlan` no JSON do diagnóstico
vindo do cliente e gravava na coluna `plano`. A "proteção" era um bloqueio
de **downgrade** — mas escalação para cima (free → pro) era explicitamente
permitida! Bastava chamar:

```js
await salvarDiagnostico(userId, { _activePlan: 'pro' });
```

**Correção:** salvarDiagnostico agora **strip** os campos `plano` e
`_activePlan` antes de salvar e **nunca** escreve a coluna `plano`. A
única forma de mudar o plano é via webhook Stripe.

### 1.bis.3 `lib/auth.ts → trocarPlano` — função inerentemente insegura
**Severidade:** Alta · **CVSS estimado:** 8.0

```ts
export async function trocarPlano(userId: string, novoPlano: string) {
  await supabase.from('usuarios').update({ plano: novoPlano }).eq('id', userId);
}
```

Qualquer caller cliente podia mudar o próprio plano. **Removida.**

### 1.bis.4 `cadastro/page.tsx`, `planos/page.tsx`, `RevisaoShell.tsx`, `DashboardShell.tsx` — upserts com `plano`
**Severidade:** Alta · **CVSS estimado:** 7.5

Quatro fluxos do cliente faziam:
```js
await supabase.from("usuarios").upsert({ id, plano: parsed._activePlan, ... });
```

Onde `parsed._activePlan` vinha do `sessionStorage` (manipulável pelo
usuário no DevTools). Mesmo padrão de billing-bypass.

**Correção:** todos os 4 caminhos foram refatorados para **omitir a
coluna `plano`** do upsert. A coluna agora tem `DEFAULT 'free'` no SQL,
então usuários novos começam free e só podem mudar via webhook.

### 1.bis.5 Defesa em profundidade no banco — trigger Postgres
**Severidade:** Crítica · **CVSS estimado:** 9.5 (caso as outras falhas voltem)

Como camada extra, [supabase_security_rls.sql](supabase_security_rls.sql)
agora cria um **trigger BEFORE UPDATE** em `usuarios.plano` que rejeita
qualquer mudança vinda das roles `anon` ou `authenticated`. Só conexões
com `service_role` (API server-side) podem alterar `plano`:

```sql
CREATE OR REPLACE FUNCTION public.protect_plano_column()
RETURNS trigger AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF NEW.plano IS DISTINCT FROM OLD.plano THEN
      RAISE EXCEPTION 'plano só pode ser alterado pelo servidor (current_user=%)', current_user
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Isso garante que mesmo que um futuro fix introduza outro vetor de
escalação no cliente, **o Postgres recusa**.

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
