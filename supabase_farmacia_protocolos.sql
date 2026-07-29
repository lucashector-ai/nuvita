-- ════════════════════════════════════════════════
--  NUVITA — Balcão de Farmácia
--  Protocolo pendente por telefone.
--  Guardamos o protocolo montado no balcão para entregar
--  quando a pessoa clicar "RECEBER PROTOCOLO" no WhatsApp.
--  Execute no SQL Editor do Supabase.
-- ════════════════════════════════════════════════

create table if not exists public.farmacia_protocolos (
  id          uuid primary key default gen_random_uuid(),
  telefone    text not null,        -- só dígitos, com DDI (ex: 5511999999999)
  nome        text,
  mensagem    text not null,        -- protocolo completo em texto (vira o PDF)
  entregue    boolean not null default false,
  entregue_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists farmacia_protocolos_telefone_idx
  on public.farmacia_protocolos (telefone, created_at desc);

-- RLS: escrita/leitura só pelo backend (service_role ignora RLS).
-- O tablet nunca lê nem escreve direto do cliente.
alter table public.farmacia_protocolos enable row level security;
