-- Nuvita — tabela do Mapeamento de farmácias (/mapeamento)
-- Rode no Supabase: SQL Editor → New query → cole e execute.

create table if not exists public.mapeamento_farmacias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  foto text,                       -- foto comprimida (data URL base64)
  lat double precision,
  lng double precision,
  criado_em timestamptz default now()
);

-- Acesso é feito pelo servidor (service role), então o RLS pode ficar ligado
-- sem policies públicas. Recarrega o cache do PostgREST:
notify pgrst, 'reload schema';
