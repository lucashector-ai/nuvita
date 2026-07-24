-- ════════════════════════════════════════════════
--  NUVITA — Balcão de Farmácia
--  Tabela de leads capturados no tablet do balcão.
--  Execute no SQL Editor do Supabase.
-- ════════════════════════════════════════════════

create table if not exists public.farmacia_leads (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  telefone    text not null,
  sexo        text,
  objetivos   jsonb default '[]'::jsonb,
  nivel       text,
  condicoes   jsonb default '[]'::jsonb,
  peptideos   jsonb default '[]'::jsonb,
  origem      text default 'farmacia',
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists farmacia_leads_created_at_idx on public.farmacia_leads (created_at desc);
create index if not exists farmacia_leads_telefone_idx   on public.farmacia_leads (telefone);

-- RLS: a inserção é feita SOMENTE pelo backend com a service_role key
-- (que ignora RLS). Nenhuma policy pública é criada de propósito —
-- o balcão nunca lê nem escreve direto do cliente.
alter table public.farmacia_leads enable row level security;
