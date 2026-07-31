-- ════════════════════════════════════════════════
--  NUVITA — Copia o estoque da USER1 para USER2 e USER3.
--  Rode no SQL Editor do Supabase depois de deixar a USER1 certinha.
--  (As três farmácias passam a ter o MESMO estoque da USER1.)
-- ════════════════════════════════════════════════

update public.farmacia_estoque
set peptideos = (select peptideos from public.farmacia_estoque where nome = 'USER1'),
    updated_at = now()
where nome in ('USER2', 'USER3');

-- Confira o resultado:
select nome, jsonb_array_length(peptideos) as qtd_em_estoque
from public.farmacia_estoque
order by nome;
