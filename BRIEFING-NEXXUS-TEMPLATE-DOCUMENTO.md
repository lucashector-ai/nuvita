# Briefing — Template de documento para envio automático do protocolo (WhatsApp)

**Objetivo:** entregar o **PDF do protocolo** no WhatsApp do cliente **automaticamente**,
mesmo quando ele **não** mandou mensagem antes (fora da janela de 24h).

**Por que isso é preciso:** a Cloud API só deixa enviar mensagem/arquivo livre dentro de
**24h** após o cliente escrever. Para iniciar "frio", é **obrigatório um template aprovado**.
Um template de **texto** não carrega o PDF — então precisa de um template com **cabeçalho
de Documento** (media template). Assim o PDF vai já na primeira mensagem, a qualquer hora.

> Como o número, o token e o webhook estão na **Nexxus**, os 2 passos abaixo são feitos do
> lado de vocês. A Nuvita continua só gerando o PDF e mandando pro relay (nada muda aqui).

---

## Passo 1 — Criar o template na Meta (WhatsApp Manager)

Em **WhatsApp Manager → Modelos de mensagem → Criar modelo**:

- **Categoria:** `Utility` (utilitário) — é transacional (a pessoa pediu o protocolo no balcão).
- **Nome:** `protocolo_nuvita` (só minúsculas/underscore).
- **Idioma:** `pt_BR` (e depois `es` se quiser espanhol).
- **Cabeçalho (Header):** tipo **Documento**. Suba um PDF de exemplo na aprovação; no envio real
  cada mensagem manda o PDF do cliente via `media_id`.
- **Corpo (Body):**
  ```
  Olá, {{1}}! Aqui está o seu protocolo Nuvita, montado especialmente para você. 💚
  ```
  (1 variável — o primeiro nome.)
- **Rodapé/Botões:** opcional (pode deixar vazio, ou um botão "Falar com atendente").

Enviar para aprovação. Costuma sair em minutos a ~1 dia.

---

## Passo 2 — Relay envia o template (com o PDF no header)

O relay já recebe da Nuvita: `to`, `file` (PDF), `filename`, `caption`, e (novo) `nome`.
Sugestão de lógica no endpoint `/api/whatsapp/send-document`:

1. **Tenta** enviar o documento livre (como hoje).
2. Se a Meta recusar com **131047 / 131026** (fora da janela), **cai no template**:
   - Sobe o PDF na mídia: `POST /{PHONE_NUMBER_ID}/media` → `media_id`.
   - Envia o template com o PDF no header:

```json
POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {TOKEN_PERMANENTE}
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "template",
  "template": {
    "name": "protocolo_nuvita",
    "language": { "code": "pt_BR" },
    "components": [
      {
        "type": "header",
        "parameters": [
          { "type": "document",
            "document": { "id": "<MEDIA_ID_DO_PDF>", "filename": "Protocolo Nuvita.pdf" } }
        ]
      },
      {
        "type": "body",
        "parameters": [ { "type": "text", "text": "<PRIMEIRO_NOME>" } ]
      }
    ]
  }
}
```

> Assim: **dentro da janela** → manda o documento normal (mais simples); **fora da janela** →
> manda o template com o PDF. Nos dois casos o cliente recebe o arquivo, sem depender de ele
> mandar "oi" antes.

Resposta esperada para a Nuvita: `{ ok: true, id }` ou `{ ok: false, error }` (como hoje).

---

## O que a Nexxus precisa confirmar
1. O template `protocolo_nuvita` (header Documento) foi **criado e aprovado** nesse WABA?
2. O relay consegue enviar **template com header de documento** (não só documento livre)?
3. O token é **permanente** (System User) e o número está em **produção**?

## Do lado da Nuvita
Nada muda no envio (já mandamos PDF + telefone + nome). Se o relay quiser o nome para a
variável `{{1}}`, já enviamos `nome` no corpo da requisição.
