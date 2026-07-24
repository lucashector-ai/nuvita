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
  nivel          text,
  condicoes      jsonb default '[]'::jsonb,
  condicao_outros text,
  peso        integer,
  altura      integer,
  idade       integer,
  atividade   text,
  sono        text,
  peptideos   jsonb default '[]'::jsonb,
  origem      text default 'farmacia',
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- Se a tabela já existir de uma versão anterior, adicione as colunas novas:
alter table public.farmacia_leads add column if not exists peso      integer;
alter table public.farmacia_leads add column if not exists altura    integer;
alter table public.farmacia_leads add column if not exists idade     integer;
alter table public.farmacia_leads add column if not exists atividade text;
alter table public.farmacia_leads add column if not exists sono      text;
alter table public.farmacia_leads add column if not exists condicao_outros text;

create index if not exists farmacia_leads_created_at_idx on public.farmacia_leads (created_at desc);
create index if not exists farmacia_leads_telefone_idx   on public.farmacia_leads (telefone);

-- RLS: a inserção é feita SOMENTE pelo backend com a service_role key
-- (que ignora RLS). Nenhuma policy pública é criada de propósito —
-- o balcão nunca lê nem escreve direto do cliente.
alter table public.farmacia_leads enable row level security;
