-- ═══════════════════════════════════════════════════════════════
-- NUVITA — Hardening de segurança (RLS)
-- Rodar UMA vez no SQL editor do Supabase.
-- Esse script:
--   1. Habilita RLS em TODAS as tabelas com dados de usuário
--   2. Cria políticas que permitem acesso APENAS aos próprios dados
--   3. Restringe escrita em tabelas sensíveis (peptideos, disponibilidade)
--   4. Garante que a coluna `plano` da tabela usuarios não pode ser
--      alterada pelo cliente (apenas service_role / webhook Stripe)
-- ═══════════════════════════════════════════════════════════════

-- ─── Tabela usuarios ──────────────────────────────────────────
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_select_own"   ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own"   ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own"   ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_delete_own"   ON public.usuarios;

CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_insert_own" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permite ao usuário atualizar seus próprios dados, EXCETO a coluna `plano`.
-- A coluna plano só pode ser alterada via service_role (webhook Stripe / admin).
CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Trigger para impedir o usuário comum de alterar `plano` diretamente.
-- Usa `current_user` (papel Postgres da conexão atual). No Supabase:
--   anon          → conexões anônimas
--   authenticated → conexões com JWT de usuário
--   service_role  → conexões backend (webhook, /api/* server-side)
-- Apenas service_role pode alterar a coluna `plano`.
CREATE OR REPLACE FUNCTION public.protect_plano_column()
RETURNS trigger AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF NEW.plano IS DISTINCT FROM OLD.plano THEN
      RAISE EXCEPTION 'plano só pode ser alterado pelo servidor (current_user=%)', current_user
        USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_plano ON public.usuarios;
CREATE TRIGGER protect_plano
  BEFORE UPDATE OF plano ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.protect_plano_column();

-- Garante que a coluna plano tenha default 'free' (assim INSERTs do cliente
-- que omitem plano funcionam, e o cliente nunca precisa setar plano).
ALTER TABLE public.usuarios ALTER COLUMN plano SET DEFAULT 'free';

-- ─── Tabelas com user_id (escopo de propriedade simples) ──────
-- Aplica o mesmo padrão a TODAS as tabelas que têm coluna user_id.
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'agendamentos',
      'notificacoes',
      'notificacoes_config',
      'diario_entries',
      'estoque_usuario',
      'estoque_items',
      'rotina_personalizada',
      'check_ins',
      'adesao_diaria',
      'pagamentos',
      'tracker_entries'
    ])
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "%I_own_select" ON public.%I', t, t);
      EXECUTE format('DROP POLICY IF EXISTS "%I_own_insert" ON public.%I', t, t);
      EXECUTE format('DROP POLICY IF EXISTS "%I_own_update" ON public.%I', t, t);
      EXECUTE format('DROP POLICY IF EXISTS "%I_own_delete" ON public.%I', t, t);
      EXECUTE format('CREATE POLICY "%I_own_select" ON public.%I FOR SELECT USING (auth.uid() = user_id)', t, t);
      EXECUTE format('CREATE POLICY "%I_own_insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', t, t);
      EXECUTE format('CREATE POLICY "%I_own_update" ON public.%I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t, t);
      EXECUTE format('CREATE POLICY "%I_own_delete" ON public.%I FOR DELETE USING (auth.uid() = user_id)', t, t);
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'Tabela % não existe — pulando', t;
    END;
  END LOOP;
END $$;

-- ─── Tabelas públicas (read-only para todos os autenticados) ──
-- peptideos: leitura livre, escrita apenas service_role
ALTER TABLE public.peptideos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "peptideos_publicos" ON public.peptideos;
DROP POLICY IF EXISTS "peptideos_select"   ON public.peptideos;
CREATE POLICY "peptideos_select" ON public.peptideos
  FOR SELECT TO anon, authenticated USING (true);
-- (sem policies de INSERT/UPDATE/DELETE → bloqueado para qualquer um exceto service_role)

-- ─── Disponibilidade do médico (somente service_role escreve) ─
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.disponibilidade_semanal ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "disponibilidade_select" ON public.disponibilidade_semanal;
    CREATE POLICY "disponibilidade_select" ON public.disponibilidade_semanal
      FOR SELECT TO anon, authenticated USING (true);
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  BEGIN
    ALTER TABLE public.disponibilidade_medico ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "disp_medico_select" ON public.disponibilidade_medico;
    CREATE POLICY "disp_medico_select" ON public.disponibilidade_medico
      FOR SELECT TO anon, authenticated USING (true);
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
END $$;

-- ─── Auditoria: log básico de exclusão de conta ──────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  evento text NOT NULL,
  user_id uuid,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
-- Sem policies → só service_role lê/escreve.

-- ─── Verificação rápida ──────────────────────────────────────
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
-- Resultado esperado: rowsecurity=true em todas as tabelas com dados de user.
