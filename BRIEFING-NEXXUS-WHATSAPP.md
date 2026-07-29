# Briefing de integração — WhatsApp Nexxus × Nuvita (Balcão)

**Para:** time/dev da Nexxus (o "Claude Code do lado de lá")
**De:** Nuvita — Balcão de Farmácia
**Objetivo:** entregar, pelo WhatsApp que a Nexxus **já tem conectado à Meta**, o
**protocolo em PDF** que o balcão da Nuvita gera para o cliente.

---

## TL;DR — o que precisamos da Nexxus

1. **Deixar a Nuvita ENVIAR** mensagens/documentos por esse número (com um token estável). → Parte 1
2. **Não deixar a IA (Emili) responder automaticamente** às mensagens desse fluxo. → Parte 2
3. **(Opcional, só se quiserem os botões)** repassar para a Nuvita os eventos de clique de botão que chegam no webhook de vocês. → Parte 3

> Se fizerem só o item 1 (+2), **já funciona**: o balcão manda o PDF direto quando o
> atendente clica "Enviar". O item 3 só serve para reativar o fluxo com botões
> *"Deseja receber? [Receber] [Não receber]"*.

---

## Contexto técnico (por que precisamos de vocês)

- O número está conectado à Meta **pela Nexxus** — vocês são donos do **webhook**.
- A Meta permite **apenas UM webhook por número**. Se a Nuvita apontar o webhook para
  ela, **quebra os Chats/Emili de vocês**. Por isso não mexemos no webhook.
- **Enviar** mensagens, porém, **não** exige ser dono do webhook: basta um token válido.
  Então a Nuvita envia direto pela Graph API, e vocês continuam donos do webhook.

---

## Arquitetura recomendada

```
        ┌─────────────────────────────────────────────┐
        │  Balcão Nuvita (tablet)                      │
        │  atendente monta o protocolo e clica Enviar  │
        └───────────────┬─────────────────────────────┘
                        │  (nosso backend)
                        ▼
        POST graph.facebook.com/{PHONE_NUMBER_ID}/media     (sobe o PDF)
        POST graph.facebook.com/{PHONE_NUMBER_ID}/messages  (envia o documento)
                        │
                        ▼
        📱 Cliente recebe o PDF no WhatsApp
        (a conversa aparece também nos Chats da Nexxus — mesmo número)

   Webhook da Meta  ──►  Nexxus (dona)   ──(opcional, Parte 3)──►  Nuvita
```

---

## Parte 1 — ENVIO (obrigatório)

O envio é feito **pela Nuvita**, chamando a Graph API da Meta com o token do número.
**Vocês não precisam escrever código de envio** — só garantir as credenciais abaixo.

### O que a Nexxus precisa fornecer/confirmar
- **`PHONE_NUMBER_ID`** do número (Meta → WhatsApp → API Setup).
- **Token de acesso PERMANENTE** (System User token), com as permissões:
  - `whatsapp_business_messaging`
  - `whatsapp_business_management`
  - Precisa ser um token que **não expira** (token de System User no Business Manager),
    não o token temporário de 24h do painel de testes.
- Confirmar que o número/WABA está **em produção** (não só em modo de teste com números
  de destino restritos).

> A Nuvita já tem esses dois valores nas variáveis `WHATSAPP_PHONE_NUMBER_ID` e
> `WHATSAPP_TOKEN`. Só precisamos confirmar que **são desse número** e que o **token é
> permanente**. Se o de hoje for temporário, nos passem o permanente.

### Regra dos 24h da Meta (importante para o atendente)
A Meta só deixa enviar mensagem "livre" (texto/documento) para quem **falou com o número
nas últimas 24h**. No balcão isso se resolve assim:
- O cliente manda um **"oi"** pro número (QR/atalho no balcão, ou o próprio atendente pede).
- Isso **abre a janela de 24h** → o PDF é entregue normalmente.
- Se a janela estiver fechada, a Nuvita mostra ao atendente: *"peça para a pessoa mandar um
  oi e reenvie"*. (Erros Meta `131047`/`131026`.)

> **Alternativa para dispensar o "oi" (opcional, futuro):** um **template aprovado** com
> cabeçalho de **documento** permite enviar o PDF **a qualquer momento**, sem janela de 24h.
> Se vocês puderem criar/aprovar um template de *utility* nesse WABA, a Nuvita passa a usá-lo.
> Ver "Perguntas para a Nexxus" no fim.

---

## Parte 2 — Emili / auto-resposta (obrigatório)

Como o número é o mesmo, **as mensagens do fluxo do balcão caem nos Chats de vocês** e
podem disparar a **Emili**. Precisamos evitar que a IA de vocês responda por cima:

- **Não** deixar a Emili responder automaticamente ao **"oi"** que o cliente manda só para
  abrir a janela (senão a pessoa recebe uma resposta automática fora de contexto).
- **Não** deixar a Emili responder ao **documento (PDF)** que a Nuvita envia.
- Sugestão: um jeito de **marcar/silenciar** essas conversas (ex.: tag "balcão", ou uma
  regra que ignore mensagens curtas tipo "oi" quando a origem é o balcão). Como vocês
  preferirem implementar do lado de lá.

---

## Parte 3 — BOTÕES (opcional: só se quiserem reativar o fluxo com botões)

Se vocês conseguirem **repassar** para a Nuvita os eventos que chegam no webhook de vocês,
a gente reativa o fluxo bonito: a Nuvita manda *"Deseja receber? [Receber] [Não receber]"*
e, ao clique, entrega o PDF. **A lógica de gerar/entregar o PDF fica 100% na Nuvita** —
vocês só precisam **encaminhar o evento**.

### Contrato (o que a Nexxus deve fazer)
Quando o webhook de vocês receber um POST da Meta que seja **resposta de botão**
(`messages[].type = interactive`, `interactive.type = button_reply`) com um dos ids
`receber_protocolo` ou `nao_receber`, **repassem** para a Nuvita:

- **Endpoint Nuvita:** `POST https://nuvita-l1wk.vercel.app/api/farmacia/whatsapp-webhook`
- **Body:** **o JSON cru, idêntico** ao que a Meta mandou para vocês (não precisa
  transformar — nosso parser entende o formato nativo da Meta).
- **Headers:** repassem também o header original
  **`X-Hub-Signature-256`** (assim validamos a assinatura). `Content-Type: application/json`.
- Podem **filtrar** e mandar só os eventos de botão (evita tráfego desnecessário), mas se
  mandarem tudo também funciona — ignoramos o que não for botão.

Nosso endpoint responde `200 {"ok":true}` rápido (padrão que a Meta espera).

### Exemplo do payload que esperamos (formato nativo da Meta)
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "<WABA_ID>",
    "changes": [{
      "field": "messages",
      "value": {
        "messaging_product": "whatsapp",
        "metadata": { "phone_number_id": "<PHONE_NUMBER_ID>" },
        "contacts": [{ "wa_id": "5511999999999", "profile": { "name": "Maria" } }],
        "messages": [{
          "from": "5511999999999",
          "id": "wamid.XXXX",
          "type": "interactive",
          "interactive": {
            "type": "button_reply",
            "button_reply": { "id": "receber_protocolo", "title": "Receber protocolo" }
          }
        }]
      }
    }]
  }]
}
```
- `receber_protocolo` → a Nuvita gera o PDF e envia como documento para `from`.
- `nao_receber` → a Nuvita responde educadamente.

> Alternativa mais simples, se preferirem não repassar o payload cru: nos avisem por um
> `POST { "telefone": "5511999999999", "acao": "receber_protocolo" }` e a gente adapta o
> endpoint para aceitar esse formato enxuto. (Hoje ele espera o formato da Meta acima.)

---

## Variáveis / segredos a alinhar

| Variável (lado Nuvita)     | Para quê                                            | Status |
|----------------------------|-----------------------------------------------------|--------|
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número na Meta                                | confirmar que é o número da Nexxus |
| `WHATSAPP_TOKEN`           | token permanente (System User) do número            | confirmar que é **permanente** |
| `WHATSAPP_API_VERSION`     | versão da Graph API (default `v21.0`)               | ok |
| `WHATSAPP_APP_SECRET`      | (Parte 3) valida `X-Hub-Signature-256` do forward   | passar o App Secret do app da Meta |
| `WHATSAPP_VERIFY_TOKEN`    | (só se um dia a Meta apontar direto p/ nós)         | não usado no forward |

---

## Passo a passo de teste (checklist)

**Envio (Parte 1):**
1. Cliente manda "oi" para o número (abre a janela de 24h).
2. No balcão: montar protocolo → preencher nome + WhatsApp (com país) → **Enviar**.
3. ✅ O cliente recebe o **PDF** no WhatsApp.
4. Testar janela fechada: enviar para um número que nunca falou → deve vir o aviso
   "peça um oi e reenvie" (não deve travar o balcão).

**Emili (Parte 2):**
5. Confirmar que a Emili **não** respondeu automaticamente ao "oi" nem ao PDF.

**Botões (Parte 3, se implementarem):**
6. Nexxus repassa o clique → ✅ o cliente recebe o PDF ao tocar "Receber protocolo".

---

## Perguntas para o time da Nexxus responder

1. O `WHATSAPP_TOKEN`/`PHONE_NUMBER_ID` já em uso são **desse número** e o token é
   **permanente** (System User)? Se não, conseguem gerar o permanente?
2. A plataforma de vocês permite **repassar/forwardar** eventos do webhook para uma URL
   externa (Parte 3)? Se sim, conseguem preservar o header `X-Hub-Signature-256`?
3. Dá para **silenciar a Emili** nas conversas do fluxo do balcão (item Parte 2)?
4. Conseguem criar/aprovar um **template de utility com cabeçalho de documento** nesse WABA?
   (Isso dispensaria a regra dos 24h e deixaria o envio 100% automático.)
5. Vocês preferem receber o forward no **formato cru da Meta** ou num **formato enxuto**
   (`{ telefone, acao }`)? (A Nuvita adapta.)

---

## O que a Nuvita já tem pronto (do nosso lado)

- Geração do **PDF** do protocolo (layout organizado, cabeçalho Nuvita).
- Envio **direto** do documento pela Graph API (Parte 1) — já em produção.
- **Webhook pronto e dormente** (`/api/farmacia/whatsapp-webhook`) que entende o formato
  nativo da Meta, valida assinatura e entrega o PDF ao clique — é só vocês repassarem
  (Parte 3) para reativar os botões.

**Contato/URL de produção do balcão:** `https://nuvita-l1wk.vercel.app/farmacia`
**Endpoint de webhook (forward):** `https://nuvita-l1wk.vercel.app/api/farmacia/whatsapp-webhook`
