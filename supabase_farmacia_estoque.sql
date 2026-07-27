-- ════════════════════════════════════════════════
--  NUVITA — Estoque por farmácia
--  Cada farmácia cria um "acesso" (código = senha) e escolhe
--  quais peptídeos tem em estoque. O balcão passa a recomendar
--  apenas o que a farmácia tem.
--  Execute no SQL Editor do Supabase.
-- ════════════════════════════════════════════════

create table if not exists public.farmacia_estoque (
  id           uuid primary key default gen_random_uuid(),
  codigo_hash  text unique not null,          -- hash do código de acesso (nunca o código em texto)
  nome         text,                          -- nome da farmácia (opcional)
  peptideos    jsonb not null default '[]'::jsonb,  -- nomes dos peptídeos em estoque
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists farmacia_estoque_codigo_idx on public.farmacia_estoque (codigo_hash);

-- RLS: acesso só pelo backend (service_role). O cliente nunca lê/escreve direto.
alter table public.farmacia_estoque enable row level security;
